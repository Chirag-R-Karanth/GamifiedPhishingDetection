import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gameAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Shield, ShieldCheck, ShieldAlert, ArrowLeft, Award, Zap, AlertCircle, Calendar } from 'lucide-react';

const DailyChallenge = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [scenario, setScenario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [startTime, setStartTime] = useState(null);

  const fetchDaily = async () => {
    try {
      setLoading(true);
      const data = await gameAPI.getDailyChallenge();
      setScenario(data);
      setStartTime(Date.now());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDaily();
  }, []);

  const handleSubmit = async (answer) => {
    if (result || submitting) return;
    try {
      setSubmitting(true);
      setSelectedAnswer(answer);
      const timeTaken = Math.round((Date.now() - startTime) / 1000);
      
      const response = await gameAPI.submitAnswer(scenario.id, answer, timeTaken);
      setResult(response);
      await refreshProfile();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate('/games')}
          className="text-xs text-cyber-muted hover:text-cyber-text flex items-center space-x-1"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>BACK TO SYSTEM MATRIX</span>
        </button>
        <span className="text-xs text-cyan-400 font-mono font-bold animate-pulse">
          DAILY DEFENSE GATEWAY
        </span>
      </div>

      {loading ? (
        <div className="cyber-glass p-8 text-center text-xs text-cyber-muted rounded">
          Syncing with daily threat schedule feeds...
        </div>
      ) : !scenario ? (
        <div className="cyber-glass p-8 text-center text-xs text-cyber-muted rounded">
          No daily threat scenario scheduled.
        </div>
      ) : (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Daily Streak Hud */}
          <div className="flex items-center justify-between bg-cyan-500/10 border border-cyan-500/40 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-cyan-400" />
              <div>
                <h3 className="text-xs font-black text-cyber-text tracking-widest uppercase">
                  DAILY MISSION CALENDAR
                </h3>
                <p className="text-[9px] text-cyber-muted font-mono uppercase mt-0.5">
                  Resolve the intercept daily to increase streak score multipliers.
                </p>
              </div>
            </div>
            
            <div className="text-sm font-black font-mono border border-cyan-500/50 px-4 py-1.5 rounded text-cyan-400 shadow-neon-blue">
              🔥 ACTIVE STREAK: {user?.streak || 0} DAYS
            </div>
          </div>

          {/* Email Container */}
          <div className="bg-cyber-dark/95 border border-cyber-border rounded-lg overflow-hidden">
            <div className="bg-black/90 border-b border-cyber-border/60 px-4 py-2 flex items-center space-x-2 text-[10px] text-cyber-muted font-mono">
              <div className="h-2 w-2 rounded-full bg-cyber-red" />
              <div className="h-2 w-2 rounded-full bg-cyber-purple" />
              <div className="h-2 w-2 rounded-full bg-cyber-green" />
              <span className="pl-2 tracking-widest text-[9px] text-cyan-400 font-bold uppercase">DAILY_INTERCEPT_STREAM</span>
            </div>

            <div className="p-4 bg-black/40 border-b border-cyber-border/40 space-y-2 text-xs">
              <div className="flex">
                <span className="w-16 font-extrabold text-cyber-muted">FROM:</span>
                <span className="text-cyber-text font-mono font-bold">{scenario.email.sender}</span>
              </div>
              <div className="flex">
                <span className="w-16 font-extrabold text-cyber-muted">SUBJECT:</span>
                <span className="text-cyber-text font-semibold">{scenario.email.subject}</span>
              </div>
              {scenario.email.attachments && scenario.email.attachments.length > 0 && (
                <div className="flex items-center text-cyber-purple font-bold">
                  <span className="w-16 font-extrabold text-cyber-muted">ATTACH:</span>
                  <span className="bg-cyber-purple/10 border border-cyber-purple/30 px-2 py-0.5 rounded text-[10px] uppercase">
                    📁 {scenario.email.attachments.join(', ')}
                  </span>
                </div>
              )}
            </div>

            <div className="p-6 text-sm text-cyber-text leading-relaxed font-sans min-h-[155px] whitespace-pre-line bg-cyber-dark/40">
              {scenario.email.body}
            </div>

            {scenario.email.links && scenario.email.links.length > 0 && (
              <div className="p-4 bg-black/20 border-t border-cyber-border/20 text-xs">
                <div className="text-cyber-muted font-bold mb-1">HYPERLINKS EMBEDDED:</div>
                {scenario.email.links.map((link, idx) => (
                  <div key={idx} className="text-cyber-blue font-mono hover:underline truncate">
                    🔗 {link}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User Decision Pad */}
          {!result && (
            <div className="cyber-glass p-5 rounded-lg border border-cyber-border space-y-4">
              <h3 className="text-center text-xs font-bold tracking-widest text-cyber-muted uppercase">
                COMMIT MISSION VERDICT
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleSubmit('safe')}
                  disabled={submitting}
                  className="bg-cyber-green/5 border border-cyber-green/30 hover:border-cyber-green text-cyber-green py-3 rounded text-xs font-black tracking-widest uppercase hover:bg-cyber-green/10 transition"
                >
                  [ SIGN OFF SAFE ]
                </button>
                <button
                  onClick={() => handleSubmit('dangerous')}
                  disabled={submitting}
                  className="bg-cyber-red/5 border border-cyber-red/30 hover:border-cyber-red text-cyber-red py-3 rounded text-xs font-black tracking-widest uppercase hover:bg-cyber-red/10 transition"
                >
                  [ SIGN OFF DANGEROUS ]
                </button>
              </div>
            </div>
          )}

          {/* Feedback & Explainability Section */}
          {result && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* Correctness Banner */}
              <div className={`p-4 rounded-lg border flex items-center justify-between ${
                result.correct
                  ? 'bg-cyber-green/10 border-cyber-green/45 text-cyber-green'
                  : 'bg-cyber-red/10 border-cyber-red/45 text-cyber-red'
              }`}>
                <div className="flex items-center space-x-3">
                  {result.correct ? (
                    <ShieldCheck className="h-6 w-6 text-cyber-green" />
                  ) : (
                    <ShieldAlert className="h-6 w-6 text-cyber-red" />
                  )}
                  <div>
                    <h4 className="text-sm font-black tracking-widest uppercase">
                      {result.correct ? 'VERDICT CONFIRMED' : 'GATEWAY BREACH WARNING'}
                    </h4>
                    <p className="text-[10px] text-cyber-muted font-mono uppercase mt-0.5">
                      Correct Answer: {result.correctAnswer} // You chose: {selectedAnswer}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 font-mono font-bold text-xs bg-black/40 border border-cyber-border px-3 py-1.5 rounded">
                  <Zap className="h-4 w-4 text-cyber-green" />
                  <span>{result.xpEarned > 0 ? `+${result.xpEarned} XP` : `${result.xpEarned} XP`}</span>
                </div>
              </div>

              {/* Expert Explanation Box */}
              <div className="cyber-glass p-5 rounded-lg border border-cyber-border space-y-3">
                <h4 className="text-xs font-bold text-cyber-text tracking-widest uppercase border-b border-cyber-border pb-1.5 flex items-center">
                  <AlertCircle className="h-4 w-4 text-cyber-green mr-1.5" />
                  MISSION EXPLAINER ARCHIVE
                </h4>
                <p className="text-xs text-cyber-muted leading-relaxed font-mono">
                  {result.explanation}
                </p>
              </div>

              {/* Achievements Alert */}
              {result.achievementsUnlocked && result.achievementsUnlocked.length > 0 && (
                <div className="bg-cyber-purple/10 border border-cyber-purple/40 p-4 rounded-lg space-y-2 animate-bounce">
                  <h4 className="text-xs font-black text-cyber-purple tracking-widest uppercase flex items-center">
                    <Award className="h-5 w-5 mr-2 animate-spin" />
                    ACHIEVEMENT BADGE UNLOCKED!
                  </h4>
                  {result.achievementsUnlocked.map((ach, idx) => (
                    <div key={idx} className="text-xs">
                      <span className="font-extrabold text-cyber-text">{ach.name}</span>
                      <span className="text-cyber-muted ml-2">— {ach.description}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions Footer */}
              <div className="flex justify-end">
                <button
                  onClick={() => navigate('/games')}
                  className="bg-cyan-500 text-cyber-dark font-extrabold text-xs tracking-widest px-6 py-2.5 rounded hover:bg-cyan-400 transition flex items-center"
                >
                  <span>RETURN TO MATRIX HUB</span>
                </button>
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default DailyChallenge;
