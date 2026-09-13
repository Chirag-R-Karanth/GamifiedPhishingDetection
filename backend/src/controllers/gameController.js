const GameSession = require('../models/GameSession');
const User = require('../models/User');
const Achievement = require('../models/Achievement');
const Leaderboard = require('../models/Leaderboard');

// Realistic cybersecurity scenarios for educational gameplay
const SCENARIOS = [
  // SPOT THE SCAM SCENARIOS
  {
    id: "spot_ceo_fraud_1",
    mode: "spot_the_scam",
    title: "Urgent Gift Card Request",
    difficulty: "easy",
    xpReward: 10,
    email: {
      sender: "robert.ceo@company-executives.com",
      subject: "URGENT TASK: Client Gift Cards",
      body: "Hi, I am in a board meeting right now and cannot pick up calls. I need you to purchase 5 Apple Gift Cards ($100 each) for our clients immediately. Scratch the back and send me the codes here. I will expense this later today.",
      links: [],
      attachments: []
    },
    correctAnswer: "dangerous",
    explanation: "This is a classic 'CEO Fraud' or Business Email Compromise (BEC) attack. Executives will never ask you to purchase gift cards via email and send the security codes directly. Note that the sender domain is 'company-executives.com', not the official corporate domain."
  },
  {
    id: "spot_github_1",
    mode: "spot_the_scam",
    title: "GitHub Security Vulnerability",
    difficulty: "easy",
    xpReward: 10,
    email: {
      sender: "noreply@github.com",
      subject: "[GitHub] Security Alert: dependency vulnerability in your repository",
      body: "We found a known vulnerability in lodash in one of your project repositories. Please update lodash to version 4.17.21 or later to secure your project. Refer to the GitHub Security Advisory for more details.",
      links: ["https://github.com/advisories/GHSA-m8p6-7j8v-4gvx"],
      attachments: []
    },
    correctAnswer: "safe",
    explanation: "This is a legitimate email from GitHub. The sender domain 'github.com' is authentic, and the link points to the official security advisory page under 'github.com/advisories'."
  },
  {
    id: "spot_unusual_sign_in_1",
    mode: "spot_the_scam",
    title: "Unusual Sign-in Attempt",
    difficulty: "medium",
    xpReward: 15,
    email: {
      sender: "security-alert@google-mail-security.com",
      subject: "Critical Security Alert: Suspicious sign-in blocked",
      body: "Someone recently tried to sign in to your Google Account from a new device in Moscow, Russia. Google blocked this attempt, but you should verify your credentials immediately by clicking the button below.",
      links: ["https://google.account-security-update.com/restore-credentials"],
      attachments: []
    },
    correctAnswer: "dangerous",
    explanation: "This is a credential harvesting attempt. While it copies Google's branding perfectly, the sender domain 'google-mail-security.com' and link domain 'google.account-security-update.com' are fake domains controlled by hackers."
  },

  // CYBER DETECTIVE SCENARIOS
  {
    id: "detective_metamask_1",
    mode: "cyber_detective",
    title: "The Crypto Wallet Warning",
    difficulty: "medium",
    xpReward: 20,
    email: {
      sender: "support@metamask-wallet-updates.org",
      subject: "URGENT: Verify your secret recovery phrase",
      body: "Dear MetaMask User, a security vulnerability has been identified in Ethereum network nodes. To protect your assets, all users must re-sync their 12-word recovery phrase to our secure cloud database. Failure to do so within 24 hours will lock your wallet.",
      links: ["https://metamask-security-vault.org/sync"],
      attachments: []
    },
    clues: [
      "The sender's domain is 'metamask-wallet-updates.org' instead of 'metamask.io'.",
      "The domain was registered just 3 days ago according to WHOIS lookup.",
      "MetaMask states on their official website that they will NEVER ask for your 12-word recovery phrase under any circumstance.",
      "The email uses intense urgency keywords ('URGENT', 'within 24 hours') to trigger panic."
    ],
    correctAnswer: "dangerous",
    explanation: "MetaMask and other web3 wallet providers never store or ask for your 12-word seed phrase. Inputting this phrase into any website gives attackers complete access to drain your funds."
  },

  // BOSS FIGHT SCENARIOS
  {
    id: "boss_ceo_mfa_1",
    mode: "boss_fight",
    title: "The CEO MFA Bypass Attack",
    difficulty: "hard",
    xpReward: 40,
    email: {
      sender: "it-support-admin@corporate-sso-gateway.net",
      subject: "CRITICAL: Urgent MFA Configuration Required",
      body: "Hello, this is the IT helpdesk. We are upgrading the company Single Sign-On (SSO) settings. We noticed your account has not activated the updated multi-factor configuration. Please click the link to sign in, input your username, password, and input the 6-digit verification code sent to your phone to finish setup.",
      links: ["https://corporate-sso-gateway.net/login/mfa-update"],
      attachments: []
    },
    correctAnswer: "dangerous",
    explanation: "This is a high-risk MFA Fatigue / Session Hijacking attack. The attacker is attempting to log in as you in real time. They want you to enter your credentials AND your 6-digit OTP code on their phishing proxy website, which allows them to capture your active session cookie, bypassing 2FA completely."
  },
  {
    id: "boss_ransomware_invoice_1",
    mode: "boss_fight",
    title: "The Fake Vendor Ransomware Invoice",
    difficulty: "hard",
    xpReward: 40,
    email: {
      sender: "billing@acme-parts-invoice.com",
      subject: "Overdue Invoice: Payment Required Immediately #INV-92810",
      body: "Dear Accounts Payable, our records indicate that invoice #INV-92810 is past due. Please review the attached zip file containing the billing statement and itemized ledger. If payment is not received by tomorrow morning, a 10% penalty fee will apply.",
      links: [],
      attachments: ["Acme_Billing_INV_92810.zip"]
    },
    correctAnswer: "dangerous",
    explanation: "This is a ransomware delivery email. The attachment is a zip folder containing a double-extended executable file (e.g. Acme_Billing_INV_92810.pdf.exe) masked as a PDF. Clicking it launches malicious code that encrypts corporate files."
  },

  // DAILY CHALLENGE
  {
    id: "daily_internship_1",
    mode: "daily_challenge",
    title: "University Remote Internship Offer",
    difficulty: "medium",
    xpReward: 25,
    email: {
      sender: "academic-recruiter@university-careers.info",
      subject: "PART-TIME WORK: Remote Student Research Assistant",
      body: "We have an open part-time remote assistant position for students. Earn $40 per hour assisting university professors with research. Hours are flexible (5-10 hours per week). Complete the attached registration document and submit your banking details to hr@university-careers.info to proceed.",
      links: [],
      attachments: ["Student_Registration_Form.exe"]
    },
    correctAnswer: "dangerous",
    explanation: "This is a job hiring/internship scam targeting students. Phishing indicators: payment details requested early, use of an executive's name from an unofficial recruitment domain, and a dangerous file attachment (.exe extension disguised as a registration form)."
  }
];

exports.getScenarios = async (req, res) => {
  try {
    const { mode } = req.query;
    let scenarios = SCENARIOS;
    if (mode) {
      scenarios = SCENARIOS.filter(s => s.mode === mode);
    }
    res.json(scenarios);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching scenarios' });
  }
};

exports.getDailyChallenge = async (req, res) => {
  try {
    // Pick the daily challenge (always return daily_internship_1 for now, or rotate based on date)
    const challenge = SCENARIOS.find(s => s.mode === 'daily_challenge') || SCENARIOS[0];
    res.json(challenge);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching daily challenge' });
  }
};

exports.submitAnswer = async (req, res) => {
  try {
    const { scenarioId, userAnswer, timeTaken } = req.body;
    const userId = req.user.id;

    const scenario = SCENARIOS.find(s => s.id === scenarioId);
    if (!scenario) {
      return res.status(404).json({ message: 'Scenario not found' });
    }

    const isCorrect = userAnswer === scenario.correctAnswer;
    
    // XP Calculation
    let xpEarned = 0;
    if (isCorrect) {
      xpEarned = scenario.xpReward;
      // Fast speed bonus: answered in under 10 seconds
      if (timeTaken && timeTaken < 10) {
        xpEarned += 5;
      }
    } else {
      // Deduct XP on wrong answer (don't go below 0)
      xpEarned = -5;
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update streak
    let newStreak = user.streak || 0;
    if (isCorrect) {
      newStreak += 1;
      // Perfect streak multiplier
      if (newStreak >= 5) {
        xpEarned = Math.floor(xpEarned * 1.5);
      }
    } else {
      newStreak = 0; // reset streak
    }

    // Apply XP changes
    let newXp = Math.max(0, (user.xp || 0) + xpEarned);

    // Calculate level based on XP thresholds (50 XP per level tier)
    // Level 1: 0-49 XP, Level 5: 200 XP, Level 10: 450 XP, etc.
    let newLevel = Math.floor(newXp / 50) + 1;

    // Correct detections increment
    let newDetections = user.correctDetections || 0;
    if (isCorrect) {
      newDetections += 1;
    }

    user.xp = newXp;
    user.level = newLevel;
    user.streak = newStreak;
    user.correctDetections = newDetections;

    await user.save();

    // Log the Game Session
    const session = new GameSession({
      userId,
      scenarioId,
      userAnswer,
      correctAnswer: scenario.correctAnswer,
      scoreEarned: xpEarned,
      difficulty: scenario.difficulty,
      timeTaken: timeTaken || 0
    });
    await session.save();

    // Check & Unlock Achievements
    const achievementsUnlocked = [];
    const checkAndUnlock = async (name, desc) => {
      const existing = await Achievement.findOne({ userId, achievementName: name });
      if (!existing) {
        const newAchievement = new Achievement({
          userId,
          achievementName: name,
          description: desc
        });
        await newAchievement.save();
        achievementsUnlocked.push({ name, description: desc });
      }
    };

    // Achievement Checks
    if (user.correctDetections >= 1) {
      await checkAndUnlock("First Detection", "Successfully identified your first phishing email threat.");
    }
    if (user.correctDetections >= 10) {
      await checkAndUnlock("SOC Analyst", "Successfully identified 10 phishing email threats.");
    }
    if (user.streak >= 5) {
      await checkAndUnlock("Immune System", "Answered 5 phishing questions correctly in a row.");
    }
    if (isCorrect && scenario.mode === 'boss_fight') {
      await checkAndUnlock("Boss Defeated", "Successfully countered a high-difficulty executive impersonation or ransomware attack.");
    }
    if (isCorrect && scenarioId === 'boss_ceo_mfa_1') {
      await checkAndUnlock("SSO Defender", "Identified and blocked an active CEO MFA-fatigue bypass attack.");
    }
    if (isCorrect && scenarioId === 'boss_ransomware_invoice_1') {
      await checkAndUnlock("Ransomware Shield", "Detected a hidden vendor invoice ransomware attachment.");
    }

    // Synchronize Leaderboard (Update user score and recalculate global ranks)
    await Leaderboard.findOneAndUpdate(
      { userId },
      { username: user.username, score: user.xp, updatedAt: Date.now() },
      { upsert: true, new: true }
    );

    // Recalculate ranks in leaderboard
    const allLeaderboards = await Leaderboard.find({}).sort({ score: -1 });
    for (let i = 0; i < allLeaderboards.length; i++) {
      allLeaderboards[i].rank = i + 1;
      await allLeaderboards[i].save();
    }

    res.json({
      correct: isCorrect,
      correctAnswer: scenario.correctAnswer,
      xpEarned,
      xp: newXp,
      level: newLevel,
      streak: newStreak,
      achievementsUnlocked,
      explanation: scenario.explanation
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error submitting game answer' });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const list = await Leaderboard.find({}).sort({ score: -1 }).limit(10);
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching leaderboard' });
  }
};
