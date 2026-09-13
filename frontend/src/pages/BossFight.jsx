import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gameAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Shield, ShieldCheck, ShieldAlert, ArrowLeft, ChevronRight, Award, Zap, AlertCircle, Clock } from 'lucide-react';

const BossFight = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [scenarios, setScenarios] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds limit for Boss
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  const timerRef = useRef(null);

  const fetchScenarios = async () => {
    try {
      setLoading(true);
      const data = await gameAPI.getScenarios('boss_fight');
      setScenarios(data);
      setTimeLeft(30);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScenarios();
    return () => clearInterval(timerRef.current);
  }, []);

  // Timer countdown hook
  useEffect(() => {
    if (loading || result || scenarios.length === 0) return;
    
    setTimeLeft(30);
    clearInterval(timerRef.current);
    
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [currentIndex, loading, result, scenarios]);

  const activeScenario = scenarios[currentIndex];

  const handleTimeout = async () => {
    if (result) return;
    try {
      setSubmitting(true);
      setSelectedAnswer('TIMEOUT');
      const response = await gameAPI.submitAnswer(activeScenario.id, 'safe', 30); // submit safe as dummy wrong answer
      response.correct = false; // force fail on timeout
      response.xpEarned = -5;
      response.explanation = "Time expired! Advanced attacks require rapid assessment. The adversary has successfully breached your security credentials because the window closed.";
      setResult(response);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (answer) => {
    if (result || submitting || timeLeft === 0) return;
    clearInterval(timerRef.current);
    try {
      setSubmitting(true);
      setSelectedAnswer(answer);
      const timeTaken = 30 - timeLeft;
      
      const response = await gameAPI.submitAnswer(activeScenario.id, answer, timeTaken);
      setResult(response);
      await refreshProfile();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    setResult(null);
    setSelectedAnswer(null);
    if (currentIndex + 1 < scenarios.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      navigate('/games');
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
          <span>BACK TO RANGE</span>
        </button>
        <span className="text-xs text-cyber-purple font-mono font-bold animate-pulse">
          BOSS ROOM // INTRUDER ENCOUNTER {currentIndex + 1} OF {scenarios.length || 0}
        </span>
      </div>

      {loading ? (
        <div className="cyber-glass p-8 text-center text-xs text-cyber-muted rounded">
          Booting tactical combat terminal...
        </div>
      ) : !activeScenario ? (
        <div className="cyber-glass p-8 text-center text-xs text-cyber-muted rounded">
          No Boss Scenarios registered.
        </div>
      ) : (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Active Combat Timer Hud */}
          <div className="flex items-center justify-between bg-cyber-purple/10 border border-cyber-purple/40 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-cyber-purple animate-spin" />
              <div>
                <h3 className="text-xs font-black text-cyber-text tracking-widest uppercase">
                  ACTIVE COUNTER-ATTACK COUNTDOWN
                </h3>
                <p className="text-[9px] text-cyber-muted font-mono uppercase mt-0.5">
                  Adversary payload execution is imminent. State security verdict now.
                </p>
              </div>
            </div>
            
            <div className={`text-2xl font-black font-mono border px-4 py-1.5 rounded ${
              timeLeft <= 10 ? 'text-cyber-red border-cyber-red/50 animate-ping' : 'text-cyber-purple border-cyber-purple/50'
            }`}>
              00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
            </div>
          </div>

          {/* Email Envelope */}
          <div className="bg-cyber-dark/95 border border-cyber-border rounded-lg overflow-hidden shadow-neon-purple">
            <div className="bg-black/90 border-b border-cyber-border/60 px-4 py-2 flex items-center space-x-2 text-[10px] text-cyber-muted font-mono">
              <div className="h-2 w-2 rounded-full bg-cyber-red" />
              <div className="h-2 w-2 rounded-full bg-cyber-purple" />
              <div className="h-2 w-2 rounded-full bg-cyber-green" />
              <span className="pl-2 tracking-widest text-[9px] text-cyber-purple font-bold">TACTICAL_INTERCEPT_STREAM</span>
            </div>

            <div className="p-4 bg-black/40 border-b border-cyber-border/40 space-y-2 text-xs">
              <div className="flex">
                <span className="w-16 font-extrabold text-cyber-muted">FROM:</span>
                <span className="text-cyber-text font-mono font-bold">{activeScenario.email.sender}</span>
              </div>
              <div className="flex">
                <span className="w-16 font-extrabold text-cyber-muted">SUBJECT:</span>
                <span className="text-cyber-text font-semibold">{activeScenario.email.subject}</span>
              </div>
              {activeScenario.email.attachments && activeScenario.email.attachments.length > 0 && (
                <div className="flex items-center text-cyber-purple font-bold">
                  <span className="w-16 font-extrabold text-cyber-muted">ATTACH:</span>
                  <span className="bg-cyber-purple/10 border border-cyber-purple/30 px-2 py-0.5 rounded text-[10px] uppercase">
                    📁 {activeScenario.email.attachments.join(', ')}
                  </span>
                </div>
              )}
            </div>

            <div className="p-6 text-sm text-cyber-text leading-relaxed font-sans min-h-[150px] whitespace-pre-line bg-cyber-dark/40">
              {activeScenario.email.body}
            </div>

            {activeScenario.email.links && activeScenario.email.links.length > 0 && (
              <div className="p-4 bg-black/20 border-t border-cyber-border/20 text-xs">
                <div className="text-cyber-muted font-bold mb-1">HYPERLINKS EMBEDDED:</div>
                {activeScenario.email.links.map((link, idx) => (
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
                EXERT DEFENSIVE VERDICT
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleSubmit('safe')}
                  disabled={submitting || timeLeft === 0}
                  className="bg-cyber-green/5 border border-cyber-green/30 hover:border-cyber-green text-cyber-green py-3 rounded text-xs font-black tracking-widest uppercase hover:bg-cyber-green/10 transition"
                >
                  [ FILE SAFE ]
                </button>
                <button
                  onClick={() => handleSubmit('dangerous')}
                  disabled={submitting || timeLeft === 0}
                  className="bg-cyber-red/5 border border-cyber-red/30 hover:border-cyber-red text-cyber-red py-3 rounded text-xs font-black tracking-widest uppercase hover:bg-cyber-red/10 transition"
                >
                  [ FILE DANGEROUS ]
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
                      {result.correct ? 'BREACH PREVENTED' : 'ADVERSARY COMPROMISE DETECTED'}
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
                  THREAT FORENSICS ANALYSIS
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
                  onClick={handleNext}
                  className="bg-cyber-purple text-cyber-text border border-cyber-purple/40 font-extrabold text-xs tracking-widest px-6 py-2.5 rounded hover:bg-cyber-purple/10 transition shadow-neon-purple flex items-center animate-pulse"
                >
                  <span>NEXT INTRUDER FILE</span>
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default BossFight;
