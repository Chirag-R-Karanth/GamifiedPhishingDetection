import React, { useState, useEffect } from 'react';
import { gameAPI } from '../services/api';
import { Trophy, Star, ShieldAlert, Award, User } from 'lucide-react';

const Leaderboard = () => {
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await gameAPI.getLeaderboard();
      setBoard(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const getRankBadge = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      
      {/* HUD Header */}
      <div className="cyber-glass p-6 rounded-lg border border-cyber-border">
        <h1 className="text-xl font-black text-cyber-text tracking-widest uppercase flex items-center">
          <Trophy className="h-6 w-6 text-cyber-green mr-2" />
          GLOBAL SECURITY LEADERBOARD
        </h1>
        <p className="text-xs text-cyber-muted mt-1 font-mono">
          TOP OPERATORS BY TOTAL XP METRICS // DATA LIVE SYNCED
        </p>
      </div>

      {/* Ranks list */}
      {loading ? (
        <div className="cyber-glass p-8 text-center text-xs text-cyber-muted rounded">
          Syncing global ranking directories...
        </div>
      ) : board && board.length > 0 ? (
        <div className="cyber-glass rounded-lg border border-cyber-border overflow-hidden">
          <div className="bg-black/50 p-4 border-b border-cyber-border flex justify-between items-center text-xs uppercase tracking-wider text-cyber-muted font-bold font-mono text-[10px]">
            <div className="flex items-center space-x-6">
              <span className="w-12 text-center">RANK</span>
              <span>OPERATOR CODENAME</span>
            </div>
            <span>ACCUMULATED XP</span>
          </div>

          <div className="divide-y divide-cyber-border/40">
            {board.map((item, index) => (
              <div
                key={item._id}
                className={`p-4 flex justify-between items-center text-xs font-mono transition duration-300 ${
                  index < 3 ? 'bg-cyber-green/5' : 'hover:bg-cyber-solid/10'
                }`}
              >
                <div className="flex items-center space-x-6">
                  {/* Position badge */}
                  <span className={`w-12 text-center text-sm font-extrabold ${
                    index === 0 ? 'text-xl animate-pulse text-yellow-400' : index === 1 ? 'text-lg text-slate-300' : index === 2 ? 'text-base text-amber-600' : 'text-cyber-muted'
                  }`}>
                    {getRankBadge(item.rank)}
                  </span>
                  
                  {/* Username */}
                  <span className={`font-bold flex items-center space-x-2 ${
                    index === 0 ? 'text-cyber-green text-sm' : 'text-cyber-text'
                  }`}>
                    <User className={`h-4 w-4 mr-1 ${index < 3 ? 'text-cyber-green' : 'text-cyber-muted'}`} />
                    <span>{item.username}</span>
                  </span>
                </div>

                {/* Score */}
                <span className={`font-black text-right flex items-center space-x-1.5 ${
                  index === 0 ? 'text-cyber-green text-sm glow-text-green' : 'text-cyber-blue glow-text-blue'
                }`}>
                  <Star className="h-4.5 w-4.5 fill-current" />
                  <span>{item.score} XP</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="cyber-glass p-8 text-center text-xs text-cyber-muted rounded border border-dashed border-cyber-border/50">
          Leaderboards registers are empty. Log answers inside training scenarios to record your first XP score.
        </div>
      )}

    </div>
  );
};

export default Leaderboard;
