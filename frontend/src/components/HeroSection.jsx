"use client";

import { Shield, Sparkles, ArrowRight } from "lucide-react";

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-24 pb-16"
    >
      {/* Soft gradient radial overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,212,255,0.08)_0%,_transparent_70%)] pointer-events-none" />

      {/* Floating ambient orbs */}
      <div className="orb w-96 h-96 bg-neon-blue/20 top-10 -left-48" />
      <div
        className="orb w-80 h-80 bg-neon-purple/20 bottom-20 right-10"
        style={{ animationDelay: "2s" }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full liquid-glass-strong text-sm text-gray-200 mb-8 animate-fade-in shadow-lg">
          <Sparkles className="w-4 h-4 text-neon-blue" />
          <span className="font-body font-medium">Multi-Layer Anti-Phishing & Scam Detection AI</span>
        </div>

        {/* Main heading */}
        <h1 className="font-heading italic text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight text-white leading-[0.9] mb-6 animate-slide-up">
          Detect & Block <br />
          <span className="gradient-text">Phishing & Cyber Scams</span>
          <br />
          <span className="text-white">In Real-Time</span>
        </h1>

        {/* Subtitle */}
        <p className="font-body text-lg md:text-xl text-white/70 max-w-3xl mx-auto mb-10 animate-slide-up animate-delay-100 font-light">
          Paste suspicious emails, SMS messages, or URLs to run instant 3-layer analysis:{" "}
          <span className="text-neon-blue font-normal">Naive Bayes NLP</span>,{" "}
          <span className="text-neon-purple font-normal">Rule-based Knowledge Engine</span>, and{" "}
          <span className="text-neon-pink font-normal">Deep LLM Threat Analysis</span>.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-16 animate-slide-up animate-delay-200">
          <a href="#scam-lab" className="liquid-glass-strong rounded-full px-8 py-4 text-base font-medium text-white flex items-center gap-3 hover:bg-white/10 transition-all font-body shadow-xl group">
            <Shield className="w-5 h-5 text-neon-blue" />
            <span className="relative z-10">Launch Scam Detector</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10 text-neon-blue" />
          </a>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 animate-slide-up animate-delay-300">
          {[
            { icon: "🛡️", text: "Multi-Layer Engine" },
            { icon: "📊", text: "Naive Bayes Classifier" },
            { icon: "🧠", text: "Rule Knowledge Base" },
            { icon: "⚡", text: "Real-time Threat Score" },
          ].map((pill) => (
            <div
              key={pill.text}
              className="flex items-center gap-2 px-4 py-2 rounded-full liquid-glass-strong text-xs text-gray-300 font-body"
            >
              <span>{pill.icon}</span>
              <span>{pill.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


