"use client";

import { useState, useEffect } from "react";
import {
  Mail,
  Key,
  RefreshCw,
  Loader2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  Info,
  CheckCircle2,
  Database,
  Wifi,
  WifiOff,
  Clock,
  Trash2,
  Sparkles,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function GmailScanner({ onSelectEmailForAnalysis }) {
  const [emailAddress, setEmailAddress] = useState("ksrisri79@gmail.com");
  const [appPassword, setAppPassword] = useState("egvp wisd xbrt shje");
  const [rememberCredentials, setRememberCredentials] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emails, setEmails] = useState([]);
  const [error, setError] = useState(null);
  const [showHelp, setShowHelp] = useState(false);

  // Connectivity state stored in LocalStorage
  const [connectivityStatus, setConnectivityStatus] = useState({
    isConnected: false,
    lastSynced: null,
    emailAddress: "",
    fetchedCount: 0,
  });

  // Load stored credentials, connectivity status & cached inbox from LocalStorage
  useEffect(() => {
    try {
      // 1. Load saved credentials
      const savedCreds = localStorage.getItem("phishshield_gmail_credentials");
      if (savedCreds) {
        const parsed = JSON.parse(savedCreds);
        if (parsed.emailAddress) setEmailAddress(parsed.emailAddress);
        if (parsed.appPassword) setAppPassword(parsed.appPassword);
      }

      // 2. Load stored connectivity status
      const savedConn = localStorage.getItem("phishshield_gmail_connectivity");
      if (savedConn) {
        const parsedConn = JSON.parse(savedConn);
        setConnectivityStatus(parsedConn);
      }

      // 3. Load cached emails if connected
      const cachedEmails = localStorage.getItem("phishshield_gmail_cached_emails");
      if (cachedEmails) {
        const parsedEmails = JSON.parse(cachedEmails);
        if (Array.isArray(parsedEmails) && parsedEmails.length > 0) {
          setEmails(parsedEmails);
        }
      }
    } catch (e) {
      console.error("Failed to load gmail state from localstorage", e);
    }
  }, []);

  const handleFetchInbox = async (e) => {
    if (e) e.preventDefault();
    if (!emailAddress.trim() || !appPassword.trim()) {
      setError("Please enter your Gmail address and 16-character App Password.");
      return;
    }

    setIsLoading(true);
    setError(null);

    // Save credentials to LocalStorage
    try {
      if (rememberCredentials) {
        localStorage.setItem(
          "phishshield_gmail_credentials",
          JSON.stringify({
            emailAddress: emailAddress.trim(),
            appPassword: appPassword.trim(),
          })
        );
      } else {
        localStorage.removeItem("phishshield_gmail_credentials");
      }
    } catch (e) {
      console.error("Failed to write credentials to localstorage", e);
    }

    try {
      const res = await fetch(`${API_URL}/api/gmail/fetch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email_address: emailAddress.trim(),
          app_password: appPassword.trim(),
          max_emails: 12,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to connect to Gmail.");
      }

      const fetchedEmails = data.emails || [];
      setEmails(fetchedEmails);

      // Save connectivity state & cached emails to LocalStorage
      const newConnectivity = {
        isConnected: true,
        emailAddress: emailAddress.trim(),
        fetchedCount: fetchedEmails.length,
        lastSynced: new Date().toLocaleString(),
      };

      setConnectivityStatus(newConnectivity);
      localStorage.setItem("phishshield_gmail_connectivity", JSON.stringify(newConnectivity));
      localStorage.setItem("phishshield_gmail_cached_emails", JSON.stringify(fetchedEmails));

      // Dispatch event to notify other components (e.g. Navbar)
      window.dispatchEvent(new Event("storage"));
    } catch (err) {
      setError(err.message || "Could not connect to Gmail IMAP.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    setEmailAddress("");
    setAppPassword("");
    setEmails([]);
    setError(null);
    setConnectivityStatus({
      isConnected: false,
      lastSynced: null,
      emailAddress: "",
      fetchedCount: 0,
    });

    localStorage.removeItem("phishshield_gmail_credentials");
    localStorage.removeItem("phishshield_gmail_connectivity");
    localStorage.removeItem("phishshield_gmail_cached_emails");
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <div className="space-y-6">
      {/* Credentials & Connection Status Card */}
      <div className="liquid-glass-strong p-6 rounded-2xl border border-white/10 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
              <Mail className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading italic text-xl text-white">
                  Live Gmail Inbox Scanner
                </h3>
                {connectivityStatus.isConnected ? (
                  <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold text-green-300 bg-green-500/20 border border-green-500/40 rounded-full flex items-center gap-1.5 animate-pulse">
                    <Wifi className="w-3 h-3 text-green-400" /> Connected & Active
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 text-[10px] font-mono font-medium text-gray-400 bg-white/5 border border-white/10 rounded-full flex items-center gap-1">
                    <WifiOff className="w-3 h-3 text-gray-400" /> Not Connected
                  </span>
                )}
              </div>
              <p className="font-body text-xs text-white/50 mt-0.5">
                Connect your Gmail inbox securely via SSL IMAP to scan incoming threat emails
              </p>
            </div>
          </div>

          <button
            type="button"
            className="text-xs text-neon-blue hover:underline flex items-center gap-1 font-body self-start sm:self-center"
            onClick={() => setShowHelp(!showHelp)}
          >
            <Info className="w-3.5 h-3.5" />
            {showHelp ? "Hide Guide" : "App Password Guide"}
          </button>
        </div>

        {/* Active LocalStorage Connectivity Banner */}
        {connectivityStatus.isConnected && (
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-xs text-green-300 flex items-center justify-between gap-3 animate-fade-in font-body">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
              <div>
                <span className="font-semibold text-white">
                  Active Connection Stored in LocalStorage:
                </span>{" "}
                <span>{connectivityStatus.emailAddress}</span>
                <div className="text-[10px] text-green-400/80 font-mono mt-0.5 flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Last Synced: {connectivityStatus.lastSynced}
                  </span>
                  <span>•</span>
                  <span>{connectivityStatus.fetchedCount} Emails Cached</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDisconnect}
              className="px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30 transition-all text-[11px] font-medium flex items-center gap-1 flex-shrink-0"
            >
              <Trash2 className="w-3 h-3" /> Disconnect & Clear
            </button>
          </div>
        )}

        {/* Guide Box */}
        {showHelp && (
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-gray-300 font-body space-y-2">
            <p className="font-semibold text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-neon-blue" />
              How to get a Gmail 16-character App Password:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-gray-300 font-light">
              <li>Go to your Google Account Settings (<a href="https://myaccount.google.com/security" target="_blank" rel="noreferrer" className="text-neon-blue underline">myaccount.google.com/security</a>).</li>
              <li>Ensure <strong>2-Step Verification</strong> is enabled.</li>
              <li>Search for &quot;App Passwords&quot; in the top search bar of your Google Account.</li>
              <li>Create a new App Password named <em>&quot;PhishShield AI&quot;</em> and copy the 16-letter code.</li>
            </ol>
          </div>
        )}

        <form onSubmit={handleFetchInbox} className="space-y-4 font-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-300 mb-1.5 font-medium">
                Gmail Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                <input
                  type="email"
                  required
                  placeholder="your-email@gmail.com"
                  className="w-full bg-white/[0.04] border border-white/15 text-sm text-white pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-neon-blue transition-all"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-300 mb-1.5 font-medium">
                16-Character App Password
              </label>
              <div className="relative">
                <Key className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="abcd efgh ijkl mnop"
                  className="w-full bg-white/[0.04] border border-white/15 text-sm text-white pl-10 pr-12 py-2.5 rounded-xl focus:outline-none focus:border-neon-blue transition-all font-mono"
                  value={appPassword}
                  onChange={(e) => setAppPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberCredentials}
                onChange={(e) => setRememberCredentials(e.target.checked)}
                className="rounded bg-white/10 border-white/20 text-neon-blue focus:ring-0"
              />
              <span>Remember credentials & connectivity in browser LocalStorage</span>
            </label>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 liquid-glass-strong py-3 rounded-xl font-medium text-sm text-white flex items-center justify-center gap-2 hover:bg-white/10 transition-all border border-white/20 shadow-lg disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-neon-blue" />
                  Connecting to Gmail IMAP...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 text-neon-blue" />
                  {connectivityStatus.isConnected ? "Re-sync & Fetch Recent Emails" : "Fetch & Scan Recent Inbox Emails"}
                </>
              )}
            </button>

            <button
              type="button"
              className="px-4 py-3 rounded-xl text-xs font-medium text-gray-300 hover:text-white liquid-glass-strong hover:bg-white/10 transition-all border border-white/10"
              onClick={handleDisconnect}
            >
              Clear Saved Credentials
            </button>
          </div>
        </form>
      </div>

      {/* Inbox Emails List */}
      {emails.length > 0 && (
        <div className="space-y-3 font-body">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <span>Incoming Gmail Messages ({emails.length})</span>
              <span className="px-2 py-0.5 text-[9px] font-mono text-neon-blue bg-neon-blue/10 border border-neon-blue/20 rounded-full">
                Cached in LocalStorage
              </span>
            </h4>
            <span className="text-xs text-neon-blue flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" /> Select an email to run 3-Layer Phishing Analysis
            </span>
          </div>

          <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
            {emails.map((msg) => (
              <div
                key={msg.id}
                className="liquid-glass-strong p-4 rounded-xl border border-white/10 hover:border-neon-blue/40 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
              >
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white truncate max-w-[260px]">
                      {msg.sender}
                    </span>
                    <span className="text-[10px] text-white/40 font-mono">
                      {msg.date ? msg.date.slice(0, 22) : ""}
                    </span>
                  </div>
                  <h5 className="text-sm font-medium text-neon-blue group-hover:text-white transition-colors truncate">
                    {msg.subject}
                  </h5>
                  <p className="text-xs text-gray-400 line-clamp-1 font-light">
                    {msg.snippet}
                  </p>
                </div>

                <button
                  type="button"
                  className="liquid-glass-strong px-4 py-2 rounded-lg text-xs font-medium text-white flex items-center gap-1.5 hover:bg-neon-blue/20 hover:border-neon-blue/50 transition-all flex-shrink-0"
                  onClick={() => onSelectEmailForAnalysis(msg.full_text)}
                >
                  <Shield className="w-3.5 h-3.5 text-neon-blue" />
                  Analyze Threat
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
