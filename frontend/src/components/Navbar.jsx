"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, Menu, X, User, LogOut, LogIn, Sparkles } from "lucide-react";

const NAV_LINKS = [
  { label: "Scam Detector", href: "#scam-lab" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Sync user state from LocalStorage
  const syncUser = () => {
    try {
      const stored = localStorage.getItem("phishshield_current_user");
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        setUser(null);
      }
    } catch (e) {
      setUser(null);
    }
  };

  useEffect(() => {
    syncUser();

    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    // Listen to localStorage changes across tabs/components
    window.addEventListener("storage", syncUser);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("storage", syncUser);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("phishshield_current_user");
    window.dispatchEvent(new Event("storage"));
    setUser(null);
  };

  return (
    <nav
      id="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-black/70 backdrop-blur-2xl border-b border-white/10 shadow-2xl"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center group-hover:shadow-lg group-hover:shadow-neon-blue/30 transition-all duration-300">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-neon-blue to-neon-purple opacity-0 group-hover:opacity-20 blur-lg transition-opacity duration-300" />
            </div>
            <span className="text-xl font-heading italic tracking-tight">
              <span className="gradient-text font-bold">PhishShield</span>{" "}
              <span className="text-white">AI</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-3 font-body">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white rounded-lg hover:bg-white/10 transition-all duration-200"
              >
                {link.label}
              </a>
            ))}

            <a
              href="#scam-lab"
              className="liquid-glass-strong text-sm font-medium px-5 py-2.5 rounded-full text-white hover:bg-white/10 transition-all border border-white/15"
            >
              Analyze Message
            </a>

            {/* Auth Profile / Login Button */}
            {user ? (
              <div className="flex items-center gap-2 pl-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neon-purple/20 border border-neon-purple/40 text-xs text-white">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center text-[10px] font-bold">
                    {user.name ? user.name[0].toUpperCase() : "U"}
                  </div>
                  <span className="font-medium max-w-[120px] truncate">
                    {user.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-2 rounded-full text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-neon-blue/30 to-neon-purple/30 border border-neon-blue/40 text-white text-xs font-semibold hover:brightness-110 transition-all shadow-md ml-2"
              >
                <LogIn className="w-3.5 h-3.5 text-neon-blue" />
                <span>Login / Register</span>
              </Link>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            id="mobile-menu-toggle"
            className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden pb-4 animate-slide-up">
            <div className="glass-card p-4 space-y-2">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="block px-4 py-3 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/[0.06] rounded-xl transition-all"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              {user ? (
                <div className="pt-2 border-t border-white/10 flex items-center justify-between px-4">
                  <div className="text-xs text-neon-blue">
                    Logged in as <strong>{user.name}</strong>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileOpen(false);
                    }}
                    className="text-xs text-red-400 hover:underline flex items-center gap-1"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="block text-center px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-neon-blue to-neon-purple rounded-xl transition-all"
                  onClick={() => setMobileOpen(false)}
                >
                  Login / Register
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
