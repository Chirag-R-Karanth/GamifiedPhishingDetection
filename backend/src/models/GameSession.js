const mongoose = require('mongoose');

const GameSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  scenarioId: {
    type: String,
    required: true
  },
  userAnswer: {
    type: String,
    enum: ['safe', 'suspicious', 'dangerous'],
    required: true
  },
  correctAnswer: {
    type: String,
    enum: ['safe', 'suspicious', 'dangerous'],
    required: true
  },
  scoreEarned: {
    type: Number,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  },
  timeTaken: {
    type: Number, // in seconds
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('GameSession', GameSessionSchema);
