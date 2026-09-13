const axios = require('axios');

let mockMetrics = {
  "Logistic Regression": {
    "accuracy": 0.912,
    "precision": 0.895,
    "recall": 0.923,
    "f1": 0.909,
    "roc_auc": 0.941,
    "latency": 0.85,
    "memory": 1.2
  },
  "Naive Bayes": {
    "accuracy": 0.884,
    "precision": 0.852,
    "recall": 0.910,
    "f1": 0.880,
    "roc_auc": 0.915,
    "latency": 0.22,
    "memory": 0.8
  },
  "Support Vector Machine": {
    "accuracy": 0.945,
    "precision": 0.931,
    "recall": 0.952,
    "f1": 0.941,
    "roc_auc": 0.973,
    "latency": 5.4,
    "memory": 4.5
  },
  "Random Forest": {
    "accuracy": 0.963,
    "precision": 0.954,
    "recall": 0.968,
    "f1": 0.961,
    "roc_auc": 0.988,
    "latency": 12.5,
    "memory": 8.2
  },
  "XGBoost": {
    "accuracy": 0.976,
    "precision": 0.969,
    "recall": 0.981,
    "f1": 0.975,
    "roc_auc": 0.994,
    "latency": 8.1,
    "memory": 10.5
  },
  "DistilBERT Transformer": {
    "accuracy": 0.991,
    "precision": 0.988,
    "recall": 0.993,
    "f1": 0.990,
    "roc_auc": 0.998,
    "latency": 45.2,
    "memory": 260.4
  }
};

exports.getModelPerformance = async (req, res) => {
  try {
    return res.json(mockMetrics);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error returning model comparison metrics' });
  }
};

exports.retrainModels = async (req, res) => {
  try {
    // Perturb the metrics slightly to simulate a retrain update
    for (const model in mockMetrics) {
      if (mockMetrics.hasOwnProperty(model)) {
        // Randomly increase accuracy/f1 by up to 0.005, capped at 0.999
        mockMetrics[model].accuracy = Math.min(0.999, mockMetrics[model].accuracy + (Math.random() * 0.005));
        mockMetrics[model].f1 = Math.min(0.999, mockMetrics[model].f1 + (Math.random() * 0.005));
        
        // Randomly jitter latency and memory slightly
        mockMetrics[model].latency = Math.max(0.1, mockMetrics[model].latency + ((Math.random() - 0.5) * 1.5));
        mockMetrics[model].memory = Math.max(0.5, mockMetrics[model].memory + ((Math.random() - 0.5) * 2.0));
      }
    }
    
    return res.json({ status: "retraining simulated in pure JS mode", metrics: mockMetrics });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error triggering retraining' });
  }
};
