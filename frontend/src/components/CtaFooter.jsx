"use client";

import { ArrowUpRight, Shield } from "lucide-react";

const CtaFooter = () => {


  return (
    <section className="relative py-32 px-6 md:px-16 lg:px-24 text-center overflow-hidden bg-transparent text-white">
      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto">
        <h2 className="text-5xl md:text-6xl lg:text-7xl font-heading italic text-white tracking-tight leading-[0.85] max-w-3xl mx-auto mb-6">
          Your cybersecurity protection starts here.
        </h2>
        <p className="text-white/60 font-body font-light text-sm md:text-base max-w-xl mx-auto mb-10">
          Run instant multi-layer threat analysis. See what AI-powered scam detection can do. No commitment, no friction. Just real-time threat detection.
        </p>
        <div className="flex items-center justify-center gap-6">
          <a
            href="#scam-lab"
            className="liquid-glass-strong rounded-full px-6 py-3 text-sm font-medium text-white flex items-center gap-2 hover:bg-white/10 transition-all font-body"
          >
            Analyze Message
            <ArrowUpRight className="h-5 w-5" />
          </a>
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-black rounded-full px-6 py-3 text-sm font-medium flex items-center gap-2 hover:bg-white/90 transition-colors font-body"
          >
            API Documentation
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>

        {/* Footer Bar */}
        <div className="mt-32 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-neon-blue" />
            <p className="text-white/40 font-body font-light text-xs">
              &copy; {new Date().getFullYear()} PhishShield AI. All rights reserved.
            </p>
          </div>
          <div className="flex items-center gap-6">
            {["Privacy", "Terms", "Documentation", "Contact"].map((link) => (
              <a
                key={link}
                href={link === "Documentation" ? "http://localhost:8000/docs" : "#"}
                className="text-white/40 hover:text-white/70 font-body font-light text-xs transition-colors"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaFooter;
