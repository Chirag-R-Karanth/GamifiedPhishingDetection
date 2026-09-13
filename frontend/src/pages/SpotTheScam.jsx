import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gameAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Shield, ShieldCheck, ShieldAlert, AlertTriangle, ArrowLeft, ChevronRight, Award, Zap, HelpCircle } from 'lucide-react';

const SpotTheScam = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [scenarios, setScenarios] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [startTime, setStartTime] = useState(null);

  const fetchScenarios = async () => {
    try {
      setLoading(true);
      const data = await gameAPI.getScenarios('spot_the_scam');
      setScenarios(data);
      setStartTime(Date.now());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScenarios();
  }, []);

  const activeScenario = scenarios[currentIndex];

  const handleSubmit = async (answer) => {
    if (result || submitting) return;
    try {
      setSubmitting(true);
      setSelectedAnswer(answer);
      const timeTaken = Math.round((Date.now() - startTime) / 1000);
      
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
      setStartTime(Date.now());
    } else {
      // Completed all
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
          <span>BACK TO MATRIX</span>
        </button>
        <span className="text-xs text-cyber-muted font-mono font-bold">
          SCENARIO {currentIndex + 1} OF {scenarios.length || 0}
        </span>
      </div>

      {loading ? (
        <div className="cyber-glass p-8 text-center text-xs text-cyber-muted rounded">
          Loading scenario parameters...
        </div>
      ) : !activeScenario ? (
        <div className="cyber-glass p-8 text-center text-xs text-cyber-muted rounded">
          No spot scenarios available at this time.
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Simulated Email Envelope Client */}
          <div className="bg-cyber-dark/90 border border-cyber-border rounded-lg overflow-hidden shadow-2xl">
            {/* Window title bar */}
            <div className="bg-black/80 border-b border-cyber-border/60 px-4 py-2 flex items-center space-x-2 text-[10px] text-cyber-muted font-mono">
              <div className="h-2 w-2 rounded-full bg-cyber-red" />
              <div className="h-2 w-2 rounded-full bg-cyber-purple" />
              <div className="h-2 w-2 rounded-full bg-cyber-green" />
              <span className="pl-2 tracking-widest text-[9px] uppercase">SECURE_MAIL_EMULATOR_V2.1</span>
            </div>

            {/* Email Headers */}
            <div className="p-4 bg-black/40 border-b border-cyber-border/40 space-y-2 text-xs">
              <div className="flex">
                <span className="w-16 font-extrabold text-cyber-muted">FROM:</span>
                <span className="text-cyber-text font-semibold">{activeScenario.email.sender}</span>
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

            {/* Email Body */}
            <div className="p-6 text-sm text-cyber-text leading-relaxed font-sans min-h-[160px] whitespace-pre-line bg-cyber-dark/40">
              {activeScenario.email.body}
            </div>

            {/* Email Links */}
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
                SUBMIT SECURITY EVALUATION
              </h3>
              
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => handleSubmit('safe')}
                  disabled={submitting}
                  className="bg-cyber-green/5 border border-cyber-green/30 hover:border-cyber-green text-cyber-green py-3 rounded text-xs font-black tracking-widest uppercase hover:bg-cyber-green/10 transition"
                >
                  [ SAFE ]
                </button>
                <button
                  onClick={() => handleSubmit('suspicious')}
                  disabled={submitting}
                  className="bg-amber-500/5 border border-amber-500/30 hover:border-amber-500 text-amber-500 py-3 rounded text-xs font-black tracking-widest uppercase hover:bg-amber-500/10 transition"
                >
                  [ SUSPICIOUS ]
                </button>
                <button
                  onClick={() => handleSubmit('dangerous')}
                  disabled={submitting}
                  className="bg-cyber-red/5 border border-cyber-red/30 hover:border-cyber-red text-cyber-red py-3 rounded text-xs font-black tracking-widest uppercase hover:bg-cyber-red/10 transition"
                >
                  [ DANGEROUS ]
                </button>
              </div>
            </div>
          )}

          {/* Feedback & Explainability Banner */}
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
                      {result.correct ? 'VERIFICATION CORRECT' : 'THREAT ASSIGNMENT ERROR'}
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
                  <HelpCircle className="h-4 w-4 text-cyber-green mr-1.5" />
                  CYBER RANGE EXPLANATION
                </h4>
                <p className="text-xs text-cyber-muted leading-relaxed font-mono">
                  {result.explanation}
                </p>
              </div>

              {/* Achievements Unlocked Alert */}
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
                  className="bg-cyber-green text-cyber-dark font-extrabold text-xs tracking-widest px-6 py-2.5 rounded hover:bg-cyber-green/90 transition shadow-neon-green flex items-center"
                >
                  <span>NEXT SCENARIO</span>
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

export default SpotTheScam;
