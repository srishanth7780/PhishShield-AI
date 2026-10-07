"use client";

import { useState, useEffect } from "react";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Send,
  Loader2,
  ChevronDown,
  Zap,
  Brain,
  BookOpen,
  RotateCcw,
  Mail,
  FileText,
  History,
  Trash2,
  ExternalLink,
  Clock,
  Copy,
  Check,
  Wifi,
} from "lucide-react";
import GmailScanner from "./GmailScanner";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const SAMPLE_EMAILS = [
  {
    label: "Suspicious Bank Email",
    text: `Subject: URGENT: Your Bank Account Has Been Compromised!

Dear Valued Customer,

We have detected UNAUTHORIZED ACCESS to your Bank of America account. Your account will be SUSPENDED within 24 hours unless you verify your identity immediately.

Click here to verify: http://192.168.1.100/bankofamerica-secure/login

You must provide your Social Security Number, account number, and password to restore access.

FAILURE TO ACT will result in permanent account closure and legal action.

Sincerely,
Bank of America Security Team
security-alerts@gmail.com`,
  },
  {
    label: "Lottery Scam",
    text: `CONGRATULATIONS!!! YOU HAVE WON!!!

Dear Lucky Winner,

You have been selected as the WINNER of the Microsoft International Lottery! You have won $5,000,000 (FIVE MILLION DOLLARS)!!!

To claim your prize, you must send a processing fee of $500 via Western Union wire transfer within 48 hours. Act now or your unclaimed funds will be forfeited!

Send payment to: 
Mr. James Wilson
Account: 847291038

Contact us IMMEDIATELY at: microsoft-lottery@yahoo.com

DO NOT IGNORE THIS MESSAGE! This is your FINAL NOTICE!`,
  },
];

function RiskMeter({ score, label }) {
  const getColor = () => {
    if (score >= 0.85) return "bg-gradient-to-r from-red-500 to-red-400";
    if (score >= 0.6) return "bg-gradient-to-r from-orange-500 to-amber-400";
    if (score >= 0.35) return "bg-gradient-to-r from-yellow-500 to-yellow-400";
    return "bg-gradient-to-r from-green-500 to-emerald-400";
  };

  const getGlow = () => {
    if (score >= 0.85) return "shadow-red-500/30";
    if (score >= 0.6) return "shadow-orange-500/30";
    if (score >= 0.35) return "shadow-yellow-500/30";
    return "shadow-green-500/30";
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-400">Risk Score</span>
        <span className={`text-2xl font-bold ${score >= 0.6 ? "text-red-400" : score >= 0.35 ? "text-yellow-400" : "text-green-400"}`}>
          {(score * 100).toFixed(1)}%
        </span>
      </div>
      <div className="risk-meter">
        <div
          className={`risk-meter-fill ${getColor()} shadow-lg ${getGlow()}`}
          style={{ width: `${score * 100}%` }}
        />
      </div>
      <div className="flex items-center gap-2">
        {score >= 0.6 ? (
          <ShieldAlert className="w-4 h-4 text-red-400" />
        ) : score >= 0.35 ? (
          <AlertTriangle className="w-4 h-4 text-yellow-400" />
        ) : (
          <ShieldCheck className="w-4 h-4 text-green-400" />
        )}
        <span
          className={`text-sm font-semibold ${
            score >= 0.6
              ? "text-red-400"
              : score >= 0.35
              ? "text-yellow-400"
              : "text-green-400"
          }`}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

function FeatureBar({ name, score, keywords }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500 capitalize">
          {name.replace(/_/g, " ")}
        </span>
        <span className="text-xs font-mono text-gray-400">
          {(score * 100).toFixed(0)}%
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-surface-700 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-neon-blue to-neon-purple transition-all duration-1000"
          style={{ width: `${Math.max(score * 100, 2)}%` }}
        />
      </div>
      {keywords && keywords.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {keywords.slice(0, 5).map((kw, i) => (
            <span
              key={i}
              className="px-2 py-0.5 text-[10px] font-mono text-neon-blue bg-neon-blue/10 border border-neon-blue/20 rounded-md"
            >
              {kw}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ScamDetector() {
  const [activeTab, setActiveTab] = useState("manual"); // "manual" | "gmail" | "history"
  const [emailText, setEmailText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showRules, setShowRules] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);
  const [copied, setCopied] = useState(false);
  const [isGmailConnected, setIsGmailConnected] = useState(false);

  // Load Scan History & Gmail connection state from LocalStorage
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem("phishshield_scam_history");
      if (storedHistory) {
        setScanHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error("Failed to load scam history from localstorage", e);
    }

    const checkConn = () => {
      try {
        const savedConn = localStorage.getItem("phishshield_gmail_connectivity");
        if (savedConn) {
          const parsed = JSON.parse(savedConn);
          setIsGmailConnected(!!parsed.isConnected);
        } else {
          setIsGmailConnected(false);
        }
      } catch (e) {
        setIsGmailConnected(false);
      }
    };
    checkConn();
    window.addEventListener("storage", checkConn);
    return () => window.removeEventListener("storage", checkConn);
  }, []);

  const handleCopyReport = () => {
    if (!result) return;
    const summary = `🛡️ PhishShield AI Threat Report
Risk Score: ${(result.risk_score * 100).toFixed(1)}% (${result.risk_label})
AI Analysis: ${result.llm_explanation}
Rules Fired: ${result.knowledge_engine?.fired_rules?.map((r) => r.rule).join(", ") || "None"}`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const saveToLocalStorageHistory = (text, resData) => {
    try {
      const newEntry = {
        id: Date.now().toString(),
        textSnippet: text.slice(0, 120) + (text.length > 120 ? "..." : ""),
        fullText: text,
        risk_score: resData.risk_score,
        risk_label: resData.risk_label,
        resData: resData,
        timestamp: new Date().toLocaleString(),
      };

      const updatedHistory = [newEntry, ...scanHistory].slice(0, 25);
      setScanHistory(updatedHistory);
      localStorage.setItem("phishshield_scam_history", JSON.stringify(updatedHistory));
    } catch (e) {
      console.error("Failed to save scan result to localstorage", e);
    }
  };

  const clearScanHistory = () => {
    setScanHistory([]);
    localStorage.removeItem("phishshield_scam_history");
  };

  const triggerAnalysis = async (textToAnalyze) => {
    const text = textToAnalyze || emailText;
    if (!text || text.trim().length < 5) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`${API_URL}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email_text: text }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      setResult(data);
      saveToLocalStorageHistory(text, data);
    } catch (err) {
      setError(
        "Could not connect to the analysis engine. Make sure the FastAPI backend is running on " +
          API_URL
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyze = () => triggerAnalysis(emailText);

  const handleSelectFromGmail = (fullText) => {
    setEmailText(fullText);
    setActiveTab("manual");
    triggerAnalysis(fullText);
  };

  const handleLoadFromHistory = (item) => {
    setEmailText(item.fullText || item.textSnippet);
    setResult(item.resData);
    setActiveTab("manual");
  };

  const handleReset = () => {
    setEmailText("");
    setResult(null);
    setError(null);
  };

  return (
    <section id="scam-lab" className="relative py-24 sm:py-32 font-body">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-red-500/[0.03] rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full liquid-glass-strong text-sm text-red-400 mb-6 border border-white/10">
            <Shield className="w-4 h-4" />
            <span>Interactive Cyber Threat Lab</span>
          </div>
          <h2 className="font-heading italic text-4xl sm:text-5xl md:text-6xl text-white mb-4">
            Anti-Phishing <span className="gradient-text font-bold">Detection Engine</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto text-base font-light">
            Paste suspicious emails manually or connect your Gmail inbox to run real-time 3-layer threat detection using{" "}
            <span className="text-neon-blue font-normal">Statistical NLP</span>,{" "}
            <span className="text-neon-purple font-normal">Knowledge Engine</span>, and{" "}
            <span className="text-neon-pink font-normal">LLM Intelligence</span>.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex p-1.5 rounded-full liquid-glass-strong border border-white/15 shadow-xl flex-wrap justify-center gap-1">
            <button
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                activeTab === "manual"
                  ? "bg-neon-blue/20 text-white border border-neon-blue/40 shadow-lg"
                  : "text-white/60 hover:text-white"
              }`}
              onClick={() => setActiveTab("manual")}
            >
              <FileText className="w-4 h-4 text-neon-blue" />
              Manual Email Paste
            </button>

            <button
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                activeTab === "gmail"
                  ? "bg-red-500/20 text-white border border-red-500/40 shadow-lg"
                  : "text-white/60 hover:text-white"
              }`}
              onClick={() => setActiveTab("gmail")}
            >
              <Mail className="w-4 h-4 text-red-400" />
              <span>Live Gmail Inbox Scanner</span>
              {isGmailConnected && (
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" title="Gmail Connected & Stored in LocalStorage" />
              )}
            </button>

            <button
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                activeTab === "history"
                  ? "bg-neon-purple/20 text-white border border-neon-purple/40 shadow-lg"
                  : "text-white/60 hover:text-white"
              }`}
              onClick={() => setActiveTab("history")}
            >
              <History className="w-4 h-4 text-neon-purple" />
              Scan History ({scanHistory.length})
            </button>
          </div>
        </div>

        {activeTab === "gmail" && (
          <GmailScanner onSelectEmailForAnalysis={handleSelectFromGmail} />
        )}

        {activeTab === "history" && (
          <div className="liquid-glass-strong p-6 rounded-2xl border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="font-heading italic text-xl text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-neon-purple" />
                  Saved Scan History (LocalStorage)
                </h3>
                <p className="text-xs text-white/50">
                  Access your previous threat analysis scans stored locally in your browser
                </p>
              </div>

              {scanHistory.length > 0 && (
                <button
                  type="button"
                  onClick={clearScanHistory}
                  className="px-3 py-1.5 rounded-lg text-xs text-red-300 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 flex items-center gap-1.5 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear History
                </button>
              )}
            </div>

            {scanHistory.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-sm">
                <History className="w-10 h-10 mx-auto mb-3 opacity-30 text-neon-purple" />
                No scan history stored in LocalStorage yet. Run a scam analysis to save records!
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {scanHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl liquid-glass-strong border border-white/10 hover:border-neon-purple/40 flex items-center justify-between gap-4 transition-all"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-full font-mono ${
                            item.risk_score >= 0.6
                              ? "bg-red-500/20 border border-red-500/40 text-red-400"
                              : item.risk_score >= 0.35
                              ? "bg-amber-500/20 border border-amber-500/40 text-amber-300"
                              : "bg-green-500/20 border border-green-500/40 text-green-400"
                          }`}
                        >
                          {(item.risk_score * 100).toFixed(1)}% Risk • {item.risk_label}
                        </span>
                        <span className="text-[10px] text-gray-500 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3" /> {item.timestamp}
                        </span>
                      </div>

                      <p className="text-xs text-gray-200 line-clamp-2 font-mono pt-1">
                        {item.textSnippet}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleLoadFromHistory(item)}
                      className="px-4 py-2 rounded-lg bg-neon-purple/20 border border-neon-purple/40 text-xs text-white hover:bg-neon-purple/30 transition-all flex items-center gap-1 flex-shrink-0"
                    >
                      <span>Load Result</span>
                      <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "manual" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ── Left: Input Panel ── */}
            <div className="space-y-4">
              {/* Textarea */}
              <div className="liquid-glass-strong p-1 rounded-2xl">
                <textarea
                  id="email-input"
                  className="w-full h-64 bg-transparent text-gray-200 text-sm font-mono p-4 rounded-xl resize-none focus:outline-none placeholder:text-gray-600"
                  placeholder="Paste the raw text of a suspicious email here..."
                  value={emailText}
                  onChange={(e) => setEmailText(e.target.value)}
                  maxLength={10000}
                />
              </div>

              {/* Sample emails */}
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-gray-400 self-center">Try a sample:</span>
                {SAMPLE_EMAILS.map((sample, i) => (
                  <button
                    key={i}
                    className="px-3 py-1.5 text-xs font-medium text-gray-300 liquid-glass-strong rounded-lg hover:text-neon-blue transition-all"
                    onClick={() => setEmailText(sample.text)}
                  >
                    {sample.label}
                  </button>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  id="analyze-btn"
                  className="liquid-glass-strong flex-1 flex items-center justify-center gap-2 py-3 px-6 text-sm font-medium text-white rounded-xl hover:bg-white/10 transition-all font-body disabled:opacity-50 disabled:cursor-not-allowed border border-white/20"
                  onClick={handleAnalyze}
                  disabled={isLoading || emailText.trim().length < 10}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin relative z-10 text-neon-blue" />
                      <span className="relative z-10">Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 relative z-10 text-neon-blue" />
                      <span className="relative z-10">Analyze Email</span>
                    </>
                  )}
                </button>
                {result && (
                  <button
                    className="px-4 py-3 text-gray-400 hover:text-white liquid-glass-strong rounded-xl hover:bg-white/10 transition-all"
                    onClick={handleReset}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* 3-layer badges */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: Zap, label: "Statistical Model", sub: "Naive Bayes", color: "text-neon-blue" },
                  { icon: Brain, label: "Knowledge Engine", sub: "Forward Chaining", color: "text-neon-purple" },
                  { icon: BookOpen, label: "LLM Intelligence", sub: "Gemini / GPT", color: "text-neon-pink" },
                ].map((layer) => (
                  <div
                    key={layer.label}
                    className="liquid-glass-strong p-3 text-center rounded-xl"
                  >
                    <layer.icon className={`w-4 h-4 ${layer.color} mx-auto mb-1`} />
                    <p className="text-[10px] font-semibold text-gray-200">
                      {layer.label}
                    </p>
                    <p className="text-[9px] text-gray-400">{layer.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right: Results Panel ── */}
            <div className="space-y-4">
              {error && (
                <div className="liquid-glass-strong p-4 border-red-500/30 bg-red-500/10 rounded-2xl">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-300">{error}</p>
                  </div>
                </div>
              )}

              {!result && !error && (
                <div className="liquid-glass-strong p-12 flex flex-col items-center justify-center text-center h-full min-h-[300px] rounded-2xl">
                  <Shield className="w-16 h-16 text-neon-blue/40 mb-4" />
                  <h3 className="text-lg font-heading italic text-white/80 mb-2">
                    No Analysis Yet
                  </h3>
                  <p className="text-sm font-body font-light text-white/50 max-w-xs">
                    Paste a suspicious email and click &quot;Analyze&quot; to run
                    our 3-layer AI detection engine.
                  </p>
                </div>
              )}

              {result && (
                <div className="space-y-4 animate-slide-up">
                  {/* Risk score */}
                  <div className="glass-card p-5 border-glow flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <RiskMeter
                        score={result.risk_score}
                        label={result.risk_label}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyReport}
                      className="liquid-glass-strong px-3.5 py-2.5 rounded-xl text-xs font-medium text-white flex items-center gap-1.5 hover:bg-neon-blue/20 transition-all border border-white/10 flex-shrink-0"
                      title="Copy threat report summary"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-green-400" />
                          <span className="text-green-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-neon-blue" />
                          <span>Copy Report</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Feature breakdown */}
                  <div className="glass-card p-5">
                    <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-neon-blue" />
                      Statistical Feature Analysis
                    </h3>
                    <div className="space-y-4">
                      {Object.entries(
                        result.statistical_analysis?.feature_breakdown || {}
                      ).map(([key, val]) => (
                        <FeatureBar
                          key={key}
                          name={key}
                          score={val.score || 0}
                          keywords={
                            val.matched_keywords || val.matched_patterns || []
                          }
                        />
                      ))}
                    </div>
                  </div>

                  {/* Knowledge engine rules */}
                  {result.knowledge_engine?.fired_rules?.length > 0 && (
                    <div className="glass-card p-5">
                      <button
                        className="w-full flex items-center justify-between mb-3"
                        onClick={() => setShowRules(!showRules)}
                      >
                        <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                          <Brain className="w-4 h-4 text-neon-purple" />
                          Forward Chaining Rules Fired (
                          {result.knowledge_engine.fired_rules.length})
                        </h3>
                        <ChevronDown
                          className={`w-4 h-4 text-gray-500 transition-transform ${
                            showRules ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {showRules && (
                        <div className="space-y-3 animate-fade-in">
                          {result.knowledge_engine.fired_rules.map((rule, i) => (
                            <div
                              key={i}
                              className="p-3 bg-neon-purple/5 border border-neon-purple/10 rounded-xl"
                            >
                              <p className="text-xs font-semibold text-neon-purple mb-1">
                                {rule.rule}
                              </p>
                              <p className="text-xs text-gray-400 leading-relaxed">
                                {rule.explanation}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* LLM explanation */}
                  <div className="glass-card p-5">
                    <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-neon-pink" />
                      AI Explanation
                    </h3>
                    <div className="text-sm text-gray-400 leading-relaxed prose prose-invert prose-sm max-w-none">
                      {result.llm_explanation.split("\n").map((line, i) => (
                        <p key={i} className={line.trim() === "" ? "h-2" : ""}>
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
