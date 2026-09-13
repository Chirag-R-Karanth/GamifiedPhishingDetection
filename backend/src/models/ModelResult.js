const mongoose = require('mongoose');

const ModelResultSchema = new mongoose.Schema({
  emailId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmailScan',
    required: true
  },
  logisticRegressionScore: {
    type: Number,
    required: true
  },
  randomForestScore: {
    type: Number,
    required: true
  },
  svmScore: {
    type: Number,
    required: true
  },
  xgboostScore: {
    type: Number,
    required: true
  },
  distilbertScore: {
    type: Number,
    required: true
  },
  inferenceTime: {
    type: Number,
    required: true
  },
  confidenceScore: {
    type: Number,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('ModelResult', ModelResultSchema);
