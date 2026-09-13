import os
import time
import pickle
import json
import logging
from typing import List, Optional
from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np

from utils import preprocess_text, extract_features, explain_prediction, init_nltk
from train import train_and_evaluate

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ml_service")

app = FastAPI(title="PhishQuest ML Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")

# Global containers for models
models = {}
vectorizer = None
metrics = {}

def load_models():
    global vectorizer, metrics, models
    try:
        # Check if vectorizer and models exist, if not train them
        vectorizer_path = os.path.join(MODELS_DIR, "vectorizer.pkl")
        if not os.path.exists(vectorizer_path):
            logger.info("Models not found. Starting initial model training...")
            train_and_evaluate()
            
        with open(vectorizer_path, "rb") as f:
            vectorizer = pickle.load(f)
            
        model_names = {
            "logistic_regression": "logistic_regression.pkl",
            "naive_bayes": "naive_bayes.pkl",
            "svm": "svm.pkl",
            "random_forest": "random_forest.pkl",
            "xgboost": "xgboost.pkl",
            "distilbert": "distilbert.pkl"
        }
        
        for name, filename in model_names.items():
            path = os.path.join(MODELS_DIR, filename)
            with open(path, "rb") as f:
                models[name] = pickle.load(f)
                
        metrics_path = os.path.join(MODELS_DIR, "comparison_metrics.json")
        with open(metrics_path, "r") as f:
            metrics = json.load(f)
            
        logger.info("All models and vectorizer successfully loaded.")
    except Exception as e:
        logger.error(f"Error loading models: {e}")

@app.on_event("startup")
def startup_event():
    init_nltk()
    load_models()

@app.get("/")
def read_root():
    return {"status": "PhishQuest ML Service is running. Use /metrics or /predict."}

class EmailScanRequest(BaseModel):
    sender: str
    subject: str
    body: str
    links: List[str]
    attachments: List[str]

@app.post("/predict")
def predict_email(payload: EmailScanRequest):
    t0 = time.time()
    
    if not models or not vectorizer:
        raise HTTPException(status_code=503, detail="Models are not loaded yet.")
        
    sender = payload.sender
    subject = payload.subject
    body = payload.body
    links = payload.links
    attachments = payload.attachments
    
    # 1. Preprocess the text
    cleaned_text = preprocess_text(f"{subject} {body}")
    
    # 2. Extract engineered features
    features = extract_features(sender, subject, body, links, attachments)
    df_features = pd.DataFrame([features])
    
    # 3. TF-IDF vectorization
    tfidf_vector = vectorizer.transform([cleaned_text]).toarray()
    tfidf_cols = [f"tfidf_{i}" for i in range(tfidf_vector.shape[1])]
    df_tfidf = pd.DataFrame(tfidf_vector, columns=tfidf_cols)
    
    # Combine features
    X = pd.concat([df_features, df_tfidf], axis=1)
    
    # 4. Predict across all models
    model_scores = {}
    
    # Naive Bayes uses TF-IDF only
    X_tfidf_only = X[[c for c in X.columns if c.startswith("tfidf_")]]
    
    try:
        model_scores["logisticRegressionScore"] = float(models["logistic_regression"].predict_proba(X)[0][1])
        model_scores["naiveBayesScore"] = float(models["naive_bayes"].predict_proba(X_tfidf_only)[0][1])
        model_scores["svmScore"] = float(models["svm"].predict_proba(X)[0][1])
        model_scores["randomForestScore"] = float(models["random_forest"].predict_proba(X)[0][1])
        model_scores["xgboostScore"] = float(models["xgboost"].predict_proba(X)[0][1])
        model_scores["distilbertScore"] = float(models["distilbert"].predict_proba(X)[0][1])
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        # Return graceful fallbacks
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

    # Calculate final risk score as weighted average
    # We weigh DistilBERT, XGBoost, and RF higher as they are typically more accurate
    weights = {
        "logisticRegressionScore": 0.1,
        "naiveBayesScore": 0.05,
        "svmScore": 0.1,
        "randomForestScore": 0.2,
        "xgboostScore": 0.25,
        "distilbertScore": 0.3
    }
    
    weighted_score = sum(model_scores[m] * weights[m] for m in weights)
    
    # Scale final score to 0-100 range
    risk_score = round(weighted_score * 100, 1)
    final_prediction = "phishing" if risk_score >= 50 else "safe"
    confidence_score = round(max(weighted_score, 1 - weighted_score), 3)
    
    # Explain prediction
    explanations = explain_prediction(features, weighted_score, final_prediction)
    
    inference_time = (time.time() - t0) * 1000  # ms
    
    return {
        "riskScore": risk_score,
        "finalPrediction": final_prediction,
        "confidenceScore": confidence_score,
        "inferenceTimeMs": round(inference_time, 2),
        "modelResults": model_scores,
        "explanation": explanations
    }

@app.get("/metrics")
def get_metrics():
    if not metrics:
        metrics_path = os.path.join(MODELS_DIR, "comparison_metrics.json")
        if os.path.exists(metrics_path):
            with open(metrics_path, "r") as f:
                return json.load(f)
        raise HTTPException(status_code=404, detail="Metrics not available.")
    return metrics

def retrain_task():
    logger.info("Background model training triggered...")
    try:
        train_and_evaluate()
        load_models()
        logger.info("Background model training and reload completed.")
    except Exception as e:
        logger.error(f"Error during background training: {e}")

@app.post("/train")
def trigger_training(background_tasks: BackgroundTasks):
    background_tasks.add_task(retrain_task)
    return {"status": "retraining scheduled in background"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

