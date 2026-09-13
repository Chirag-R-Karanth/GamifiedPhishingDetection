const User = require('../models/User');
const Achievement = require('../models/Achievement');
const EmailScan = require('../models/EmailScan');

// Map levels to titles requested by the user
const getLevelTitle = (level) => {
  if (level >= 20) return "Threat Hunter";
  if (level >= 10) return "SOC Intern";
  if (level >= 5) return "Security Analyst";
  return "Internet Rookie";
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('-passwordHash');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get counts
    const scanCount = await EmailScan.countDocuments({ userId });
    const threatCount = await EmailScan.countDocuments({ userId, finalPrediction: 'phishing' });
    
    // Get level title
    const levelTitle = getLevelTitle(user.level);
    
    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        xp: user.xp,
        level: user.level,
        levelTitle: levelTitle,
        streak: user.streak,
        totalScans: scanCount,
        correctDetections: user.correctDetections,
        threatsDetected: threatCount,
        createdAt: user.createdAt
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving profile' });
  }
};

exports.getAchievements = async (req, res) => {
  try {
    const userId = req.user.id;
    const list = await Achievement.find({ userId }).sort({ unlockedAt: -1 });
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching achievements' });
  }
};
