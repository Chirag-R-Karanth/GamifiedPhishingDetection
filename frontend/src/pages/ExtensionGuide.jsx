import React from 'react';
import { Download, ShieldCheck, Terminal, Compass, AlertCircle } from 'lucide-react';

const ExtensionGuide = () => {
  const [token, setToken] = React.useState('');
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(`Bearer ${token}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-mono">
      
      {/* HUD Header */}
      <div className="cyber-glass p-6 rounded-lg border border-cyber-border">
        <h1 className="text-xl font-black text-cyber-text tracking-widest uppercase flex items-center">
          <Compass className="h-6 w-6 text-cyber-green mr-2" />
          CHROME UTILITY DEPLOYMENT MANUAL
        </h1>
        <p className="text-xs text-cyber-muted mt-1">
          INTEGRATE REAL-TIME EMAIL SCANNING EXTENSION WITH PHISHQUEST SYSTEMS
        </p>
      </div>

      {/* API Token Box */}
      {token && (
        <div className="cyber-glass p-6 rounded-lg border border-cyber-green/50 bg-cyber-green/5">
          <h2 className="text-xs font-black text-cyber-text uppercase tracking-widest mb-2 flex items-center">
            <Terminal className="h-4 w-4 mr-2 text-cyber-green" />
            YOUR PLATFORM ACCESS TOKEN
          </h2>
          <p className="text-[11px] text-cyber-muted mb-3">
            Copy the token below and paste it into the <strong>SETTINGS</strong> tab of your PhishQuest extension. This links your scans to your account so they appear in your Recent Scans dashboard.
          </p>
          <div className="flex gap-2">
            <input 
              type="text" 
              readOnly 
              value={`Bearer ${token}`} 
              className="w-full bg-black/60 border border-cyber-border px-3 py-2 rounded text-cyber-blue select-all text-[11px] outline-none"
            />
            <button 
              onClick={handleCopy}
              className="bg-cyber-green text-cyber-dark px-4 py-2 rounded text-xs font-bold uppercase tracking-wider hover:bg-cyber-green/90 transition"
            >
              {copied ? 'COPIED!' : 'COPY'}
            </button>
          </div>
        </div>
      )}

      {/* Guide details split */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Instructions */}
        <div className="md:col-span-7 space-y-6">
          <div className="cyber-glass p-6 rounded-lg border border-cyber-border space-y-4">
            <h2 className="text-xs font-black text-cyber-text uppercase tracking-widest border-b border-cyber-border pb-2">
              INSTALLATION INSTRUCTIONS
            </h2>

            <ol className="space-y-4 text-xs text-cyber-muted list-decimal list-inside pl-1 leading-relaxed">
              <li className="list-item">
                <span className="text-cyber-text font-bold">Locate the extension directory:</span> The source files for the Manifest V3 chrome extension are pre-built inside the <span className="text-cyber-blue font-bold">/extension</span> workspace directory of this project.
              </li>
              <li className="list-item">
                <span className="text-cyber-text font-bold">Open extensions portal:</span> Open Google Chrome or any Chromium browser, and navigate to:
                <div className="bg-black/60 border border-cyber-border px-3 py-1.5 rounded mt-2 text-cyber-blue select-all text-[11px]">
                  chrome://extensions/
                </div>
              </li>
              <li className="list-item">
                <span className="text-cyber-text font-bold">Activate Developer mode:</span> Toggle the <span className="text-cyber-green font-bold">"Developer mode"</span> switch in the top right corner of the extension dashboard page.
              </li>
              <li className="list-item">
                <span className="text-cyber-text font-bold">Load unpacked package:</span> Click the <span className="text-cyber-green font-bold">"Load unpacked"</span> button in the top left corner. Select the <span className="text-cyber-blue font-bold">/extension</span> directory from this workspace.
              </li>
              <li className="list-item">
                <span className="text-cyber-text font-bold">Activate & Scan:</span> Navigate to Gmail or Outlook Web. Open any email. The content parser will automatically find metadata, and the extension popup will allow you to trigger a scan in one click.
              </li>
            </ol>
          </div>
        </div>

        {/* Feature highlight / warnings */}
        <div className="md:col-span-5 space-y-6">
          <div className="cyber-glass p-6 rounded-lg border border-cyber-border space-y-4">
            <h2 className="text-xs font-black text-cyber-text uppercase tracking-widest border-b border-cyber-border pb-2">
              UTILITY PROFILE CAPABILITIES
            </h2>

            <div className="space-y-3 text-xs leading-relaxed">
              <div className="flex items-start space-x-2">
                <ShieldCheck className="h-4 w-4 text-cyber-green flex-shrink-0 mt-0.5" />
                <p className="text-cyber-muted">
                  <span className="text-cyber-text font-bold uppercase block text-[10px]">Gmail & Outlook DOM hooks</span>
                  Integrates content parsers into standard mailbox components to scan fields safely without sharing your credentials.
                </p>
              </div>

              <div className="flex items-start space-x-2">
                <Terminal className="h-4 w-4 text-cyber-blue flex-shrink-0 mt-0.5" />
                <p className="text-cyber-muted">
                  <span className="text-cyber-text font-bold uppercase block text-[10px]">Direct REST Gateway connection</span>
                  Funnels JSON data packets to `POST /api/emails/scan` using XMLHttpRequests directly.
                </p>
              </div>

              <div className="flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-cyber-red flex-shrink-0 mt-0.5" />
                <p className="text-cyber-muted text-cyber-red">
                  <span className="text-cyber-text font-bold uppercase block text-[10px]">Strict Sandbox Compliance</span>
                  The extension communicates solely with your configured API running on localhost port 5001.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default ExtensionGuide;
