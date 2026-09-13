const mongoose = require('mongoose');

const ModelResultsSchema = new mongoose.Schema({
  logisticRegressionScore: Number,
  randomForestScore: Number,
  svmScore: Number,
  xgboostScore: Number,
  distilbertScore: Number,
  naiveBayesScore: Number, // Extra comparison metric
  inferenceTimeMs: Number,
  confidenceScore: Number
}, { _id: false });

const ExplanationSchema = new mongoose.Schema({
  feature: String,
  impact: String,
  description: String
}, { _id: false });

const EmailScanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional if guest scans are allowed
  },
  sender: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    default: ''
  },
  body: {
    type: String,
    default: ''
  },
  links: {
    type: [String],
    default: []
  },
  attachments: {
    type: [String],
    default: []
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  modelResults: {
    type: ModelResultsSchema,
    required: true
  },
  finalPrediction: {
    type: String,
    enum: ['phishing', 'safe'],
    required: true
  },
  riskScore: {
    type: Number,
    required: true
  },
  explanation: {
    type: [ExplanationSchema],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('EmailScan', EmailScanSchema);
