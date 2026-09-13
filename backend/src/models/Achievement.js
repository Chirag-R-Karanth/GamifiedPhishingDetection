const mongoose = require('mongoose');

const AchievementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  achievementName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  unlockedAt: {
    type: Date,
    default: Date.now
  }
});

// Avoid duplicate achievements for a user
AchievementSchema.index({ userId: 1, achievementName: 1 }, { unique: true });

module.exports = mongoose.model('Achievement', AchievementSchema);
