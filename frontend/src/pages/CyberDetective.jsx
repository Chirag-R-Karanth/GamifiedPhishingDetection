import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gameAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Shield, ShieldCheck, ShieldAlert, ArrowLeft, ChevronRight, Award, Zap, BookOpen, AlertCircle } from 'lucide-react';

const CyberDetective = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [scenarios, setScenarios] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [cluesRevealed, setCluesRevealed] = useState(1);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [startTime, setStartTime] = useState(null);

  const fetchScenarios = async () => {
    try {
      setLoading(true);
      const data = await gameAPI.getScenarios('cyber_detective');
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

  const handleRevealClue = () => {
    if (activeScenario && cluesRevealed < activeScenario.clues.length) {
      setCluesRevealed(cluesRevealed + 1);
    }
  };

  const handleSubmit = async (answer) => {
    if (result || submitting) return;
    try {
      setSubmitting(true);
      setSelectedAnswer(answer);
      const timeTaken = Math.round((Date.now() - startTime) / 1000);
      
      const response = await gameAPI.submitAnswer(activeScenario.id, answer, timeTaken);
      
      // Deduct XP points based on clues revealed
      // Award full score if <= 2 clues, partial if more
      let finalXpEarned = response.xpEarned;
      if (cluesRevealed > 2 && response.correct) {
        const reduction = (cluesRevealed - 2) * 2;
        finalXpEarned = Math.max(5, response.xpEarned - reduction);
      }
      response.xpEarned = finalXpEarned;
      
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
    setCluesRevealed(1);
    if (currentIndex + 1 < scenarios.length) {
      setCurrentIndex(currentIndex + 1);
      setStartTime(Date.now());
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
        <span className="text-xs text-cyber-muted font-mono font-bold">
          CASE FILE {currentIndex + 1} OF {scenarios.length || 0}
        </span>
      </div>

      {loading ? (
        <div className="cyber-glass p-8 text-center text-xs text-cyber-muted rounded">
          Opening case files archives...
        </div>
      ) : !activeScenario ? (
        <div className="cyber-glass p-8 text-center text-xs text-cyber-muted rounded">
          No forensics cases found.
        </div>
      ) : (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Main Case Summary */}
          <div className="cyber-glass p-6 rounded-lg border border-cyber-border space-y-4">
            <h2 className="text-sm font-extrabold text-cyber-blue tracking-widest uppercase border-b border-cyber-border pb-2 flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-cyber-blue" />
              INVESTIGATION DETAILS: {activeScenario.title}
            </h2>
            <div className="bg-black/40 border border-cyber-border/40 p-4 rounded text-xs space-y-2 leading-relaxed">
              <div>
                <span className="font-extrabold text-cyber-muted uppercase mr-2">Intercepted From:</span>
                <span className="text-cyber-text font-mono font-bold">{activeScenario.email.sender}</span>
              </div>
              <div>
                <span className="font-extrabold text-cyber-muted uppercase mr-2">Intercepted Subject:</span>
                <span className="text-cyber-text font-semibold">{activeScenario.email.subject}</span>
              </div>
            </div>
          </div>

          {/* Forensic Clues Pad */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-cyber-text uppercase tracking-widest">
                FORENSIC CASE EVIDENCE
              </h3>
              <span className="text-[10px] text-cyber-muted font-mono">
                REVEALED: {cluesRevealed} OF {activeScenario.clues.length}
              </span>
            </div>

            <div className="space-y-3">
              {activeScenario.clues.slice(0, cluesRevealed).map((clue, idx) => (
                <div
                  key={idx}
                  className="bg-cyber-dark border border-cyber-blue/20 p-4 rounded-lg text-xs font-mono leading-relaxed flex items-start space-x-3 animate-slideIn"
                >
                  <span className="text-cyber-blue font-bold">▶ CLUE_{idx + 1}:</span>
                  <p className="text-cyber-text">{clue}</p>
                </div>
              ))}
            </div>

            {/* Clue Controllers */}
            {!result && cluesRevealed < activeScenario.clues.length && (
              <div className="flex justify-center">
                <button
                  onClick={handleRevealClue}
                  className="text-xs text-cyber-blue border border-cyber-blue/30 hover:border-cyber-blue px-4 py-2 rounded bg-cyber-blue/5 hover:bg-cyber-blue/10 transition font-extrabold tracking-widest uppercase"
                >
                  REVEAL NEXT CLUE [-2 XP PENALTY]
                </button>
              </div>
            )}
          </div>

          {/* User Decision Pad */}
          {!result && (
            <div className="cyber-glass p-5 rounded-lg border border-cyber-border space-y-4">
              <h3 className="text-center text-xs font-bold tracking-widest text-cyber-muted uppercase">
                FORMULATE CASE CONCLUSION
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleSubmit('safe')}
                  disabled={submitting}
                  className="bg-cyber-green/5 border border-cyber-green/30 hover:border-cyber-green text-cyber-green py-3 rounded text-xs font-black tracking-widest uppercase hover:bg-cyber-green/10 transition"
                >
                  [ CLASSIFY SAFE ]
                </button>
                <button
                  onClick={() => handleSubmit('dangerous')}
                  disabled={submitting}
                  className="bg-cyber-red/5 border border-cyber-red/30 hover:border-cyber-red text-cyber-red py-3 rounded text-xs font-black tracking-widest uppercase hover:bg-cyber-red/10 transition"
                >
                  [ CLASSIFY PHISHING ]
                </button>
              </div>
            </div>
          )}

          {/* Feedback Section */}
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
                      {result.correct ? 'INVESTIGATION ACCURATE' : 'CASE REJECTED BY HQ'}
                    </h4>
                    <p className="text-[10px] text-cyber-muted font-mono uppercase mt-0.5">
                      Correct Answer: {result.correctAnswer} // You chose: {selectedAnswer}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 font-mono font-bold text-xs bg-black/40 border border-cyber-border px-3 py-1.5 rounded">
                  <Zap className="h-4 w-4 text-cyber-green" />
                  <span>+{result.xpEarned} XP {cluesRevealed > 2 && '(Clues penalty applied)'}</span>
                </div>
              </div>

              {/* Expert Explanation Box */}
              <div className="cyber-glass p-5 rounded-lg border border-cyber-border space-y-3">
                <h4 className="text-xs font-bold text-cyber-text tracking-widest uppercase border-b border-cyber-border pb-1.5 flex items-center">
                  <AlertCircle className="h-4 w-4 text-cyber-green mr-1.5" />
                  CASE ANALYTICAL REPORT
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
                  className="bg-cyber-blue text-cyber-dark font-extrabold text-xs tracking-widest px-6 py-2.5 rounded hover:bg-cyber-blue/90 transition shadow-neon-blue flex items-center"
                >
                  <span>NEXT EVIDENCE PACKET</span>
                  <ChevronRight className="h-4 w-4 ml-1 animate-pulse" />
                </button>
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default CyberDetective;
