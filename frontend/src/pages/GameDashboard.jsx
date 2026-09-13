import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userAPI } from '../services/api';
import { Terminal, Shield, Play, Lock, Award, Star, Zap, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const GameDashboard = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setLoading(true);
        const list = await userAPI.getAchievements();
        setAchievements(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchAchievements();
    }
  }, [user]);

  const modes = [
    {
      id: "spot_the_scam",
      name: "SPOT THE SCAM",
      description: "Quick-fire scenario range. Analyze raw emails and make immediate decisions: Safe, Suspicious, or Dangerous.",
      reward: "10-15 XP per scan",
      difficulty: "Easy - Medium",
      color: "green",
      bgClass: "bg-cyber-green/5 border-cyber-green/20 hover:border-cyber-green hover:bg-cyber-green/10 hover:shadow-neon-green",
      textColor: "text-cyber-green",
      path: "/games/spot-the-scam"
    },
    {
      id: "cyber_detective",
      name: "CYBER DETECTIVE",
      description: "Forensics and clue extraction. Slowly uncover components of the header, links, and WHOIS domain ages to identify masks.",
      reward: "20 XP per case",
      difficulty: "Medium",
      color: "blue",
      bgClass: "bg-cyber-blue/5 border-cyber-blue/20 hover:border-cyber-blue hover:bg-cyber-blue/10 hover:shadow-neon-blue",
      textColor: "text-cyber-blue",
      path: "/games/cyber-detective"
    },
    {
      id: "boss_fight",
      name: "BOSS FIGHT",
      description: "Counter active adversary tactics: Fake executive banking requests, active MFA authentication fatigue, and malicious zip invoices.",
      reward: "40 XP per counter",
      difficulty: "Hard (Timed)",
      color: "purple",
      bgClass: "bg-cyber-purple/5 border-cyber-purple/20 hover:border-cyber-purple hover:bg-cyber-purple/10 hover:shadow-neon-purple",
      textColor: "text-cyber-purple",
      path: "/games/boss-fight"
    },
    {
      id: "daily_challenge",
      name: "DAILY CHALLENGE",
      description: "A single, rotating training scenario released every 24 hours. Solve it daily to increase your defense streak multipliers.",
      reward: "25 XP + Streak Bonus",
      difficulty: "Dynamic",
      color: "blue",
      bgClass: "bg-cyan-500/5 border-cyan-500/20 hover:border-cyan-500 hover:bg-cyan-500/10",
      textColor: "text-cyan-400",
      path: "/games/daily-challenge"
    }
  ];

  return (
    <div className="space-y-8">
      {/* HUD Header */}
      <div className="cyber-glass p-6 rounded-lg border border-cyber-border">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-black text-cyber-text tracking-widest uppercase">
              CYBER SIMULATION FIELD RANGE
            </h1>
            <p className="text-xs text-cyber-muted mt-1 font-mono">
              ROLE: {user?.levelTitle || "Internet Rookie"} // COMBAT MATRIX LOADED
            </p>
          </div>
          <div className="flex items-center space-x-2 bg-cyber-dark px-3 py-1.5 rounded border border-cyber-border text-xs font-bold text-cyber-green">
            <Star className="h-4 w-4 fill-cyber-green text-cyber-green" />
            <span>ACCUMULATED SCORE: {user?.xp || 0} XP</span>
          </div>
        </div>
      </div>

      {/* Grid of game modes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modes.map((m) => (
          <Link
            key={m.id}
            to={m.path}
            className={`cyber-glass p-6 rounded-lg border flex flex-col justify-between transition-all duration-300 ${m.bgClass}`}
          >
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className={`text-xs font-black tracking-widest ${m.textColor}`}>
                  [{m.name}]
                </span>
                <span className="text-[10px] text-cyber-muted border border-cyber-border px-2 py-0.5 rounded uppercase">
                  {m.difficulty}
                </span>
              </div>
              <p className="text-xs text-cyber-muted leading-relaxed">
                {m.description}
              </p>
            </div>
            
            <div className="flex justify-between items-center pt-6 mt-4 border-t border-cyber-border/40 text-xs font-bold font-mono">
              <span className="text-cyber-text">REWARD: {m.reward}</span>
              <span className={`flex items-center group-hover:underline ${m.textColor}`}>
                LAUNCH RANGE
                <Play className="h-3 w-3 ml-1 fill-current" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* User achievements badge display */}
      <div className="cyber-glass p-6 rounded-lg border border-cyber-border">
        <h2 className="text-sm font-bold text-cyber-text uppercase tracking-widest mb-4 border-b border-cyber-border pb-2 flex items-center">
          <Award className="h-5 w-5 text-cyber-green mr-2" />
          UNLOCKED DEFENDER BADGES
        </h2>

        {loading ? (
          <div className="text-center text-xs text-cyber-muted py-6">Retrieving badges database...</div>
        ) : achievements && achievements.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {achievements.map((ach) => (
              <div
                key={ach._id}
                className="bg-cyber-dark/60 border border-cyber-green/20 hover:border-cyber-green p-3 rounded flex items-start space-x-3 transition duration-300"
              >
                <div className="p-2 bg-cyber-green/10 rounded-full text-cyber-green">
                  <Shield className="h-5 w-5 fill-cyber-green/20" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-cyber-text tracking-wide uppercase">
                    {ach.achievementName}
                  </h4>
                  <p className="text-[10px] text-cyber-muted mt-1 font-mono">
                    {ach.description}
                  </p>
                  <span className="text-[9px] text-cyber-green/60 block mt-2 font-mono">
                    UNLOCKED: {new Date(ach.unlockedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-xs text-cyber-muted py-6 border border-dashed border-cyber-border/50 rounded">
            No defense badges unlocked yet. Complete spot challenges, detective scenarios, and boss fights to unlock trophies.
          </div>
        )}
      </div>

    </div>
  );
};

export default GameDashboard;
