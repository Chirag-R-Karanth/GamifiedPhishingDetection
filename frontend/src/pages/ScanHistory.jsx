import React, { useState, useEffect } from 'react';
import { emailAPI } from '../services/api';
import { Search, ShieldAlert, ShieldCheck, Calendar, ArrowRight, X, Clock, HelpCircle } from 'lucide-react';

const ScanHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScan, setSelectedScan] = useState(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await emailAPI.getHistory();
      setHistory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Filter based on search input
  const filteredHistory = history.filter(scan => {
    const senderMatch = scan.sender.toLowerCase().includes(searchQuery.toLowerCase());
    const subjectMatch = (scan.subject || '').toLowerCase().includes(searchQuery.toLowerCase());
    const predMatch = scan.finalPrediction.toLowerCase().includes(searchQuery.toLowerCase());
    return senderMatch || subjectMatch || predMatch;
  });

  return (
    <div className="space-y-6">
      
      {/* HUD Header */}
      <div className="cyber-glass p-6 rounded-lg border border-cyber-border">
        <h1 className="text-xl font-black text-cyber-text tracking-widest uppercase">
          SCAN HISTORY CHRONICLES
        </h1>
        <p className="text-xs text-cyber-muted mt-1 font-mono">
          SECURE LOG ARCHIVE // THREATS MONITORED // AUDIT LOG
        </p>
      </div>

      {/* Controllers Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-cyber-dark/60 border border-cyber-border p-4 rounded-lg">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-cyber-muted" />
          <input
            type="text"
            placeholder="Search by sender, subject, or result..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black border border-cyber-border rounded pl-9 pr-4 py-2 text-cyber-text focus:outline-none focus:border-cyber-green transition text-xs font-mono"
          />
        </div>
        
        <span className="text-[10px] text-cyber-muted uppercase tracking-widest font-mono">
          TOTAL LOGGED ENTRIES: {history.length}
        </span>
      </div>

      {/* History Table */}
      {loading ? (
        <div className="cyber-glass p-8 text-center text-xs text-cyber-muted rounded">
          Syncing chronicles history database...
        </div>
      ) : filteredHistory.length > 0 ? (
        <div className="cyber-glass rounded-lg border border-cyber-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-black/40 text-cyber-muted uppercase tracking-wider border-b border-cyber-border/80 text-[10px]">
                  <th className="p-4">SENDER ADDRESS</th>
                  <th className="p-4">SUBJECT line</th>
                  <th className="p-4">FINAL DECISION</th>
                  <th className="p-4">RISK SCORE</th>
                  <th className="p-4">DATE STAMP</th>
                  <th className="p-4 text-right">METRICS</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((scan) => (
                  <tr
                    key={scan._id}
                    className="border-b border-cyber-border/30 hover:bg-cyber-solid/25 transition cursor-pointer"
                    onClick={() => setSelectedScan(scan)}
                  >
                    <td className="p-4 font-semibold text-cyber-text truncate max-w-[200px]" title={scan.sender}>
                      {scan.sender}
                    </td>
                    <td className="p-4 font-normal text-cyber-muted truncate max-w-[240px]" title={scan.subject}>
                      {scan.subject || '(No Subject)'}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded font-extrabold uppercase text-[9px] ${
                        scan.finalPrediction === 'phishing'
                          ? 'bg-cyber-red/10 text-cyber-red border border-cyber-red/30'
                          : 'bg-cyber-green/10 text-cyber-green border border-cyber-green/30'
                      }`}>
                        {scan.finalPrediction}
                      </span>
                    </td>
                    <td className={`p-4 font-bold ${
                      scan.riskScore >= 75 ? 'text-cyber-red' : scan.riskScore >= 50 ? 'text-cyber-purple' : 'text-cyber-green'
                    }`}>
                      {scan.riskScore}%
                    </td>
                    <td className="p-4 text-cyber-muted">
                      {new Date(scan.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4 text-right">
                      <button className="text-[10px] text-cyber-blue border border-cyber-blue/35 hover:border-cyber-blue px-2.5 py-1 rounded bg-cyber-blue/5 hover:bg-cyber-blue/10 transition uppercase">
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="cyber-glass p-8 text-center text-xs text-cyber-muted rounded border border-dashed border-cyber-border/40">
          No matching records discovered in the scan history database.
        </div>
      )}

      {/* Details drawer overlay */}
      {selectedScan && (
        <div className="fixed inset-0 z-50 bg-black/80 flex justify-end animate-fadeIn">
          <div className="w-full max-w-xl bg-cyber-dark border-l border-cyber-border h-full p-6 space-y-6 overflow-y-auto relative animate-slideLeft">
            
            {/* Close button */}
            <button
              onClick={() => setSelectedScan(null)}
              className="absolute top-4 right-4 text-cyber-muted hover:text-cyber-text"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header info */}
            <div className="space-y-2 border-b border-cyber-border pb-4">
              <h2 className="text-sm font-extrabold text-cyber-text uppercase tracking-widest flex items-center">
                <Clock className="h-4 w-4 text-cyber-green mr-1.5" />
                THREAT INVESTIGATION SHEET
              </h2>
              <p className="text-[9px] text-cyber-muted font-mono uppercase">
                REPORT_ID: {selectedScan._id}
              </p>
            </div>

            {/* Prediction Banner */}
            <div className={`p-4 rounded-lg border flex items-center justify-between ${
              selectedScan.finalPrediction === 'phishing'
                ? 'bg-cyber-red/10 border-cyber-red/35'
                : 'bg-cyber-green/10 border-cyber-green/35'
            }`}>
              <div className="flex items-center space-x-3">
                {selectedScan.finalPrediction === 'phishing' ? (
                  <ShieldAlert className="h-6 w-6 text-cyber-red" />
                ) : (
                  <ShieldCheck className="h-6 w-6 text-cyber-green" />
                )}
                <div>
                  <div className="text-[9px] text-cyber-muted font-bold uppercase">Matrix Result</div>
                  <h4 className={`text-sm font-extrabold tracking-wider uppercase ${
                    selectedScan.finalPrediction === 'phishing' ? 'text-cyber-red' : 'text-cyber-green'
                  }`}>
                    {selectedScan.finalPrediction === 'phishing' ? 'PHISHING INTRUSION DETECTED' : 'SAFE BENIGN CLASSIFIED'}
                  </h4>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-[9px] text-cyber-muted font-bold">RISK</div>
                <div className={`text-base font-black ${
                  selectedScan.riskScore >= 75 ? 'text-cyber-red' : selectedScan.riskScore >= 50 ? 'text-cyber-purple' : 'text-cyber-green'
                }`}>
                  {selectedScan.riskScore}%
                </div>
              </div>
            </div>

            {/* Intercept Headers */}
            <div className="bg-black/50 border border-cyber-border p-4 rounded text-xs space-y-2 font-mono">
              <div>
                <span className="text-cyber-muted uppercase font-bold w-16 inline-block">SENDER:</span>
                <span className="text-cyber-text select-all">{selectedScan.sender}</span>
              </div>
              <div>
                <span className="text-cyber-muted uppercase font-bold w-16 inline-block">SUBJECT:</span>
                <span className="text-cyber-text">{selectedScan.subject || '(No Subject)'}</span>
              </div>
              <div>
                <span className="text-cyber-muted uppercase font-bold w-16 inline-block">STAMP:</span>
                <span className="text-cyber-muted">{new Date(selectedScan.createdAt).toLocaleString()}</span>
              </div>
            </div>

            {/* Email Body */}
            <div className="space-y-1">
              <span className="text-[9px] text-cyber-muted uppercase font-bold font-mono">RAW EMAIL DATA BODY</span>
              <div className="bg-black/30 border border-cyber-border/40 p-4 rounded text-xs leading-relaxed max-h-[160px] overflow-y-auto select-text font-sans text-cyber-text whitespace-pre-line">
                {selectedScan.body || '(No Body Content Captured)'}
              </div>
            </div>

            {/* Hyperlinks & Attachments */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-[9px] text-cyber-muted uppercase font-bold font-mono">LINKS IDENTIFIED</span>
                <div className="bg-black/30 border border-cyber-border/40 p-3 rounded text-[10px] min-h-[50px] max-h-[100px] overflow-y-auto space-y-1 font-mono">
                  {selectedScan.links && selectedScan.links.length > 0 ? (
                    selectedScan.links.map((link, idx) => (
                      <div key={idx} className="text-cyber-blue truncate hover:underline" title={link}>
                        🔗 {link}
                      </div>
                    ))
                  ) : (
                    <span className="text-cyber-muted">No links detected</span>
                  )}
                </div>
              </div>
              <div>
                <span className="text-[9px] text-cyber-muted uppercase font-bold font-mono">ATTACHMENTS IDENTIFIED</span>
                <div className="bg-black/30 border border-cyber-border/40 p-3 rounded text-[10px] min-h-[50px] max-h-[100px] overflow-y-auto space-y-1 font-mono">
                  {selectedScan.attachments && selectedScan.attachments.length > 0 ? (
                    selectedScan.attachments.map((att, idx) => (
                      <div key={idx} className="text-cyber-purple truncate" title={att}>
                        📁 {att}
                      </div>
                    ))
                  ) : (
                    <span className="text-cyber-muted">No attachments detected</span>
                  )}
                </div>
              </div>
            </div>

            {/* Explainable AI */}
            <div className="space-y-2">
              <span className="text-[9px] text-cyber-muted uppercase font-bold font-mono flex items-center">
                <HelpCircle className="h-4 w-4 mr-1 text-cyber-green" />
                AI THREAT RATIONALE
              </span>
              <div className="space-y-2">
                {selectedScan.explanation && selectedScan.explanation.length > 0 ? (
                  selectedScan.explanation.map((reason, idx) => (
                    <div key={idx} className="bg-black/40 border border-cyber-border/30 p-2.5 rounded text-[11px] flex justify-between items-start font-mono">
                      <div className="pr-4 space-y-0.5">
                        <span className="font-extrabold text-cyber-text block uppercase text-[10px]">
                          {reason.feature}
                        </span>
                        <span className="text-cyber-muted text-[10px] block leading-normal">
                          {reason.description}
                        </span>
                      </div>
                      <div className="text-cyber-red font-black text-right">{reason.impact}</div>
                    </div>
                  ))
                ) : (
                  <div className="bg-black/40 border border-cyber-border/30 p-3 rounded text-[11px] text-cyber-muted font-mono text-center">
                    No suspicious characteristics triggered.
                  </div>
                )}
              </div>
            </div>

            {/* Model outputs list */}
            <div className="space-y-2">
              <span className="text-[9px] text-cyber-muted uppercase font-bold font-mono">ENSEMBLE DEEP INFERENCE COMPARISONS</span>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                <div className="bg-black/35 border border-cyber-border/30 p-2 rounded flex justify-between">
                  <span className="text-cyber-muted">Logistic Reg:</span>
                  <span className="text-cyber-text font-bold">{(selectedScan.modelResults?.logisticRegressionScore * 100).toFixed(0)}%</span>
                </div>
                <div className="bg-black/35 border border-cyber-border/30 p-2 rounded flex justify-between">
                  <span className="text-cyber-muted">Naive Bayes:</span>
                  <span className="text-cyber-text font-bold">{(selectedScan.modelResults?.naiveBayesScore * 100).toFixed(0)}%</span>
                </div>
                <div className="bg-black/35 border border-cyber-border/30 p-2 rounded flex justify-between">
                  <span className="text-cyber-muted">SVM Network:</span>
                  <span className="text-cyber-text font-bold">{(selectedScan.modelResults?.svmScore * 100).toFixed(0)}%</span>
                </div>
                <div className="bg-black/35 border border-cyber-border/30 p-2 rounded flex justify-between">
                  <span className="text-cyber-muted">Random Forest:</span>
                  <span className="text-cyber-text font-bold">{(selectedScan.modelResults?.randomForestScore * 100).toFixed(0)}%</span>
                </div>
                <div className="bg-black/35 border border-cyber-border/30 p-2 rounded flex justify-between">
                  <span className="text-cyber-muted">XGBoost Net:</span>
                  <span className="text-cyber-text font-bold">{(selectedScan.modelResults?.xgboostScore * 100).toFixed(0)}%</span>
                </div>
                <div className="bg-black/35 border border-cyber-border/30 p-2 rounded flex justify-between">
                  <span className="text-cyber-muted">DistilBERT:</span>
                  <span className="text-cyber-text font-bold">{(selectedScan.modelResults?.distilbertScore * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ScanHistory;
