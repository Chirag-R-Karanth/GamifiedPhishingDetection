import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { emailAPI } from '../services/api';
import { Shield, ShieldAlert, ShieldCheck, Terminal, Upload, AlertCircle, HelpCircle, Link as LinkIcon, FileText, ChevronRight, RefreshCw, BarChart2 } from 'lucide-react';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Radar, Bar } from 'react-chartjs-2';
import { Link } from 'react-router-dom';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const Dashboard = () => {
  const { user, refreshProfile } = useAuth();
  
  // Scan Form States
  const [sender, setSender] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [linksText, setLinksText] = useState('');
  const [attachmentsText, setAttachmentsText] = useState('');
  
  // Scan Actions States
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState('');

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const history = await emailAPI.getHistory();
      setRecentScans(history);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const handleScan = async (e) => {
    e.preventDefault();
    if (!sender) {
      setError('Sender address is required');
      return;
    }
    
    try {
      setError('');
      setScanning(true);
      setScanResult(null);
      
      const parsedLinks = linksText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      const parsedAttachments = attachmentsText.split('\n').map(a => a.trim()).filter(a => a.length > 0);

      const result = await emailAPI.scanEmail({
        sender,
        subject,
        body,
        links: parsedLinks,
        attachments: parsedAttachments
      });

      setScanResult(result);
      if (user) {
        await refreshProfile();
        fetchHistory();
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error occurred while contacting the detection service.');
    } finally {
      setScanning(false);
    }
  };

  const handleResetForm = () => {
    setSender('');
    setSubject('');
    setBody('');
    setLinksText('');
    setAttachmentsText('');
    setScanResult(null);
    setError('');
  };

  // Setup comparison chart data for the current scan results
  const getChartData = () => {
    if (!scanResult) return null;
    const scores = scanResult.modelResults;
    return {
      labels: ['Logistic Reg', 'Naive Bayes', 'SVM', 'Random Forest', 'XGBoost', 'DistilBERT'],
      datasets: [
        {
          label: 'Phishing Confidence Score',
          data: [
            scores.logisticRegressionScore || 0,
            scores.naiveBayesScore || 0,
            scores.svmScore || 0,
            scores.randomForestScore || 0,
            scores.xgboostScore || 0,
            scores.distilbertScore || 0,
          ],
          backgroundColor: 'rgba(0, 255, 102, 0.2)',
          borderColor: '#00ff66',
          borderWidth: 2,
          pointBackgroundColor: '#00ff66',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#00ff66'
        }
      ]
    };
  };

  const chartOptions = {
    scales: {
      r: {
        angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        pointLabels: { color: '#9ca3af', font: { family: 'Courier New' } },
        ticks: { display: false },
        min: 0,
        max: 1
      }
    },
    plugins: {
      legend: { display: false }
    }
  };

  return (
    <div className="space-y-8">
      
      {/* 1. Welcomer HUD Panel */}
      <div className="cyber-glass-green p-6 rounded-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-5 pointer-events-none radar-grid radial-gradient" />
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-2xl font-black text-cyber-text glow-text-green tracking-widest flex items-center">
              <Shield className="h-7 w-7 text-cyber-green mr-3 animate-pulse" />
              CYBER DEFENDER COMMAND CENTER
            </h1>
            <p className="text-xs text-cyber-muted mt-2 max-w-xl">
              Secure email evaluation matrix initialized. Run manual investigations or install the Chrome utility script to process real-time threats directly from inside Gmail and Outlook.
            </p>
          </div>
          
          {/* Quick HUD Metrics */}
          {user && (
            <div className="grid grid-cols-3 gap-4 bg-black/40 border border-cyber-border/40 p-4 rounded-md text-center min-w-[280px]">
              <div>
                <div className="text-xs text-cyber-muted font-bold">SCANS</div>
                <div className="text-xl font-bold text-cyber-blue glow-text-blue mt-1">{user.totalScans}</div>
              </div>
              <div className="border-x border-cyber-border/40">
                <div className="text-xs text-cyber-muted font-bold">THREATS</div>
                <div className="text-xl font-bold text-cyber-red mt-1">{user.threatsDetected}</div>
              </div>
              <div>
                <div className="text-xs text-cyber-muted font-bold">ACCURACY</div>
                <div className="text-xl font-bold text-cyber-green glow-text-green mt-1">
                  {user.totalScans > 0 ? `${Math.round((user.correctDetections / (user.totalScans || 1)) * 100)}%` : "100%"}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Interactive Workspace Split: Manual Evaluation & Dynamic AI Predictions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Manual Scanning Input */}
        <div className="lg:col-span-7 space-y-6">
          <div className="cyber-glass p-6 rounded-lg border border-cyber-border relative">
            <div className="absolute top-3 right-3 flex items-center space-x-1.5 text-[9px] text-cyber-green/60 font-bold bg-cyber-green/5 border border-cyber-green/20 px-2 py-0.5 rounded">
              <Terminal className="h-3 w-3" />
              <span>SCAN_MODULE:ON</span>
            </div>
            
            <h2 className="text-lg font-bold text-cyber-text tracking-wide mb-4 flex items-center border-b border-cyber-border pb-2">
              MANUAL ANALYZER TERMINAL
            </h2>

            <form onSubmit={handleScan} className="space-y-4 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-cyber-muted mb-1">SENDER EMAIL *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. executive-alert@billing-secure.com"
                    value={sender}
                    onChange={(e) => setSender(e.target.value)}
                    className="w-full bg-cyber-dark border border-cyber-border rounded px-3 py-2 text-cyber-text focus:outline-none focus:border-cyber-green transition text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-cyber-muted mb-1">EMAIL SUBJECT</label>
                  <input
                    type="text"
                    placeholder="e.g. Urgent password reset required"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-cyber-dark border border-cyber-border rounded px-3 py-2 text-cyber-text focus:outline-none focus:border-cyber-green transition text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-cyber-muted mb-1">EMAIL BODY TEXT</label>
                <textarea
                  rows={5}
                  placeholder="Paste the full email contents or text blocks here..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full bg-cyber-dark border border-cyber-border rounded px-3 py-2 text-cyber-text focus:outline-none focus:border-cyber-green transition text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-cyber-muted mb-1 flex items-center">
                    <LinkIcon className="h-3 w-3 mr-1 text-cyber-blue" />
                    LINKS / URLS (one per line)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="https://login.restore-paypal.org/auth"
                    value={linksText}
                    onChange={(e) => setLinksText(e.target.value)}
                    className="w-full bg-cyber-dark border border-cyber-border rounded px-3 py-2 text-cyber-text focus:outline-none focus:border-cyber-green transition text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-cyber-muted mb-1 flex items-center">
                    <FileText className="h-3 w-3 mr-1 text-cyber-purple" />
                    ATTACHMENTS (one per line)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="invoice_921.zip"
                    value={attachmentsText}
                    onChange={(e) => setAttachmentsText(e.target.value)}
                    className="w-full bg-cyber-dark border border-cyber-border rounded px-3 py-2 text-cyber-text focus:outline-none focus:border-cyber-green transition text-xs font-mono"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center text-xs text-cyber-red bg-cyber-red/10 border border-cyber-red/30 p-3 rounded">
                  <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t border-cyber-border">
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="text-xs text-cyber-muted hover:text-cyber-text px-3 py-2 border border-cyber-border rounded hover:bg-cyber-solid/40 transition"
                >
                  RESET MATRIX
                </button>
                
                <button
                  type="submit"
                  disabled={scanning}
                  className="text-xs bg-cyber-green text-cyber-dark font-extrabold px-6 py-2.5 rounded hover:bg-cyber-green/90 transition shadow-neon-green flex items-center disabled:opacity-50 disabled:pointer-events-none"
                >
                  {scanning ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ANALYZING...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      EXECUTE AI SCAN
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Results / Explanation HUD */}
        <div className="lg:col-span-5 space-y-6">
          
          {!scanResult && !scanning && (
            <div className="cyber-glass p-8 rounded-lg border border-cyber-border h-full flex flex-col justify-center items-center text-center text-cyber-muted min-h-[400px]">
              <HelpCircle className="h-16 w-16 text-cyber-border mb-4 animate-pulse" />
              <h3 className="text-sm font-bold text-cyber-text tracking-wider uppercase mb-1">Inference Engine Standby</h3>
              <p className="text-xs max-w-xs">
                Submit an email sample in the manual analyzer to inspect the deep learning evaluation output and explainable AI weights.
              </p>
            </div>
          )}

          {scanning && (
            <div className="cyber-glass p-8 rounded-lg border border-cyber-border h-full flex flex-col justify-center items-center text-center text-cyber-muted min-h-[400px]">
              <RefreshCw className="h-12 w-12 text-cyber-green mb-4 animate-spin glow-text-green" />
              <h3 className="text-sm font-bold text-cyber-green tracking-widest uppercase mb-1 animate-pulse">Running ML Core</h3>
              <p className="text-xs max-w-xs">
                Extracting domain characteristics, tokenizing body text, performing TF-IDF embeddings, and querying ensemble classifier networks...
              </p>
            </div>
          )}

          {scanResult && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Scan Decision Header */}
              <div className={`p-5 rounded-lg border flex items-center justify-between ${
                scanResult.finalPrediction === 'phishing'
                  ? 'bg-cyber-red/10 border-cyber-red/35'
                  : 'bg-cyber-green/10 border-cyber-green/35'
              }`}>
                <div className="flex items-center space-x-4">
                  {scanResult.finalPrediction === 'phishing' ? (
                    <div className="p-3 bg-cyber-red/20 rounded-full">
                      <ShieldAlert className="h-8 w-8 text-cyber-red animate-bounce" />
                    </div>
                  ) : (
                    <div className="p-3 bg-cyber-green/20 rounded-full">
                      <ShieldCheck className="h-8 w-8 text-cyber-green" />
                    </div>
                  )}
                  <div>
                    <div className="text-[10px] text-cyber-muted font-extrabold uppercase tracking-wider">Prediction Outcome</div>
                    <h3 className={`text-lg font-black tracking-widest uppercase mt-0.5 ${
                      scanResult.finalPrediction === 'phishing' ? 'text-cyber-red' : 'text-cyber-green'
                    }`}>
                      {scanResult.finalPrediction === 'phishing' ? 'HIGH RISK PHISHING' : 'SECURE / BENIGN'}
                    </h3>
                  </div>
                </div>
                
                {/* Risk Score Bubble */}
                <div className="text-center bg-black/40 border border-cyber-border px-3 py-1.5 rounded">
                  <div className="text-[9px] text-cyber-muted font-bold">RISK</div>
                  <div className={`text-lg font-black ${
                    scanResult.riskScore >= 75 ? 'text-cyber-red' : scanResult.riskScore >= 50 ? 'text-cyber-purple' : 'text-cyber-green'
                  }`}>
                    {scanResult.riskScore}%
                  </div>
                </div>
              </div>

              {/* Explainable AI (LIME / SHAP Features) */}
              <div className="cyber-glass p-5 rounded-lg border border-cyber-border">
                <h3 className="text-xs font-bold text-cyber-text uppercase tracking-widest mb-3 border-b border-cyber-border/40 pb-2">
                  EXPLAINABLE AI (XAI) BREAKDOWN
                </h3>
                
                {scanResult.explanation && scanResult.explanation.length > 0 ? (
                  <div className="space-y-3">
                    {scanResult.explanation.map((reason, index) => (
                      <div key={index} className="bg-black/30 border border-cyber-border/30 p-2.5 rounded text-xs flex justify-between items-start">
                        <div className="space-y-1 pr-4">
                          <span className="font-extrabold text-cyber-text tracking-wide block uppercase text-[10px]">
                            {reason.feature}
                          </span>
                          <span className="text-cyber-muted text-[11px] block leading-relaxed">
                            {reason.description}
                          </span>
                        </div>
                        <div className="text-cyber-red font-black text-right tracking-wider flex-shrink-0 text-xs">
                          {reason.impact}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-cyber-muted text-center py-4">
                    No suspicious flags triggered. Text features confirm safety benchmarks.
                  </div>
                )}
              </div>

              {/* Multi-Model Ensembles radar */}
              <div className="cyber-glass p-5 rounded-lg border border-cyber-border">
                <h3 className="text-xs font-bold text-cyber-text uppercase tracking-widest mb-3 border-b border-cyber-border/40 pb-2 flex items-center justify-between">
                  <span>ENSEMBLE NETWORKS INFERENCE</span>
                  <span className="text-[9px] text-cyber-blue font-mono font-normal">
                    LATENCY: {scanResult.modelResults?.inferenceTimeMs || scanResult.inferenceTimeMs}ms
                  </span>
                </h3>
                <div className="h-[220px] flex items-center justify-center">
                  <Radar data={getChartData()} options={chartOptions} />
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* 3. Dashboard Footer Split: Recent Scans History & Training Entrypoints */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Recent Scan History */}
        <div className="lg:col-span-7 space-y-4">
          <div className="cyber-glass p-6 rounded-lg border border-cyber-border">
            <div className="flex justify-between items-center mb-4 border-b border-cyber-border pb-2">
              <h2 className="text-sm font-bold text-cyber-text uppercase tracking-widest">
                RECENT SCAN CHRONICLES
              </h2>
              <Link to="/history" className="text-xs text-cyber-blue hover:underline flex items-center">
                Full Database <ChevronRight className="h-4 w-4 ml-0.5" />
              </Link>
            </div>

            {loadingHistory ? (
              <div className="text-center text-xs text-cyber-muted py-6">Loading scan records...</div>
            ) : recentScans && recentScans.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="text-cyber-muted border-b border-cyber-border/50 uppercase">
                      <th className="py-2.5">SENDER / DOMAIN</th>
                      <th className="py-2.5">PREDICTION</th>
                      <th className="py-2.5">RISK</th>
                      <th className="py-2.5 text-right">DATE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentScans.slice(0, 5).map((scan) => (
                      <tr key={scan._id} className="border-b border-cyber-border/20 hover:bg-cyber-solid/20 transition">
                        <td className="py-3 font-semibold text-cyber-text truncate max-w-[200px]" title={scan.sender}>
                          {scan.sender}
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded font-extrabold uppercase text-[9px] ${
                            scan.finalPrediction === 'phishing'
                              ? 'bg-cyber-red/10 text-cyber-red border border-cyber-red/30'
                              : 'bg-cyber-green/10 text-cyber-green border border-cyber-green/30'
                          }`}>
                            {scan.finalPrediction}
                          </span>
                        </td>
                        <td className={`py-3 font-bold ${
                          scan.riskScore >= 75 ? 'text-cyber-red' : scan.riskScore >= 50 ? 'text-cyber-purple' : 'text-cyber-green'
                        }`}>
                          {scan.riskScore}%
                        </td>
                        <td className="py-3 text-right text-cyber-muted font-normal">
                          {new Date(scan.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center text-xs text-cyber-muted py-6">
                No scans recorded. Scans triggered inside Chrome or the analyzer will log here.
              </div>
            )}
          </div>
        </div>

        {/* Gamified Cybersecurity Training Shortcuts */}
        <div className="lg:col-span-5 space-y-4">
          <div className="cyber-glass p-6 rounded-lg border border-cyber-border space-y-4">
            <h2 className="text-sm font-bold text-cyber-text uppercase tracking-widest border-b border-cyber-border pb-2">
              CYBER RANGE SIMULATION
            </h2>

            <div className="space-y-3">
              <Link to="/games" className="block bg-cyber-green/5 border border-cyber-green/20 hover:border-cyber-green p-3 rounded hover:bg-cyber-green/10 transition group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Terminal className="h-5 w-5 text-cyber-green" />
                    <div>
                      <h4 className="text-xs font-bold text-cyber-text group-hover:text-cyber-green transition">SPOT THE SCAM</h4>
                      <p className="text-[10px] text-cyber-muted mt-0.5">Test quick decision instincts on incoming emails.</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-cyber-muted group-hover:text-cyber-green" />
                </div>
              </Link>

              <Link to="/games" className="block bg-cyber-blue/5 border border-cyber-blue/20 hover:border-cyber-blue p-3 rounded hover:bg-cyber-blue/10 transition group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <BarChart2 className="h-5 w-5 text-cyber-blue" />
                    <div>
                      <h4 className="text-xs font-bold text-cyber-text group-hover:text-cyber-blue transition">CYBER DETECTIVE</h4>
                      <p className="text-[10px] text-cyber-muted mt-0.5">Investigate raw header and link forensic clues.</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-cyber-muted group-hover:text-cyber-blue" />
                </div>
              </Link>

              <Link to="/games" className="block bg-cyber-purple/5 border border-cyber-purple/20 hover:border-cyber-purple p-3 rounded hover:bg-cyber-purple/10 transition group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <ShieldAlert className="h-5 w-5 text-cyber-purple" />
                    <div>
                      <h4 className="text-xs font-bold text-cyber-text group-hover:text-cyber-purple transition">BOSS FIGHT CHAMBER</h4>
                      <p className="text-[10px] text-cyber-muted mt-0.5">Counter corporate MFA hijackers and ransomware payloads.</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-cyber-muted group-hover:text-cyber-purple" />
                </div>
              </Link>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
