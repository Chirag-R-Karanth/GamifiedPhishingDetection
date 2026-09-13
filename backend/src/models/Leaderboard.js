const mongoose = require('mongoose');

const LeaderboardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true
  },
  score: {
    type: Number, // user's XP
    required: true
  },
  rank: {
    type: Number,
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Leaderboard', LeaderboardSchema);
