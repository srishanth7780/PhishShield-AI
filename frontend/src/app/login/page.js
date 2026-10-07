"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  Lock,
  Mail,
  User,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  Zap,
} from "lucide-react";
import LoginBackgroundVideo from "../../components/LoginBackgroundVideo";

export default function LoginPage() {
  const router = useRouter();

  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    rememberMe: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Load existing session & pre-seed demo user if DB is empty
  useEffect(() => {
    // Pre-seed demo user into localStorage if no DB exists
    const existingUsers = localStorage.getItem("phishshield_users_db");
    if (!existingUsers) {
      const demoUsers = [
        {
          name: "Tony Stark",
          email: "tony@starkindustries.com",
          password: "password123",
          createdAt: new Date().toISOString(),
        },
        {
          name: "Cyber Security Hero",
          email: "hero@phishshield.ai",
          password: "password123",
          createdAt: new Date().toISOString(),
        },
      ];
      localStorage.setItem("phishshield_users_db", JSON.stringify(demoUsers));
    }

    // Check if already logged in
    const activeUserStr = localStorage.getItem("phishshield_current_user");
    if (activeUserStr) {
      try {
        const userObj = JSON.parse(activeUserStr);
        setCurrentUser(userObj);
      } catch (e) {
        localStorage.removeItem("phishshield_current_user");
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError("");
  };

  const handleDemoLogin = (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError("");

    setTimeout(() => {
      const demoUser = {
        name: "Tony Stark (Hero User)",
        email: "tony@starkindustries.com",
        loginTime: new Date().toISOString(),
        isDemo: true,
      };

      localStorage.setItem(
        "phishshield_current_user",
        JSON.stringify(demoUser)
      );
      window.dispatchEvent(new Event("storage"));
      setSuccess("Welcome back, Tony! Accessing Stark Network...");
      setIsLoading(false);

      setTimeout(() => {
        router.push("/");
      }, 800);
    }, 400);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    const { name, email, password, confirmPassword, rememberMe } = formData;

    if (!email || !password) {
      setError("Please fill in all required fields.");
      setIsLoading(false);
      return;
    }

    // Get current DB from localStorage
    const usersDb = JSON.parse(
      localStorage.getItem("phishshield_users_db") || "[]"
    );

    if (isRegister) {
      // Registration Flow
      if (!name.trim()) {
        setError("Please enter your name.");
        setIsLoading(false);
        return;
      }

      if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        setIsLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        setIsLoading(false);
        return;
      }

      const existingUser = usersDb.find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );

      if (existingUser) {
        setError("An account with this email already exists. Try signing in!");
        setIsLoading(false);
        return;
      }

      // Save new user to localStorage DB
      const newUser = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        createdAt: new Date().toISOString(),
      };

      usersDb.push(newUser);
      localStorage.setItem("phishshield_users_db", JSON.stringify(usersDb));

      // Log the user in
      const sessionUser = {
        name: newUser.name,
        email: newUser.email,
        loginTime: new Date().toISOString(),
      };

      localStorage.setItem(
        "phishshield_current_user",
        JSON.stringify(sessionUser)
      );

      if (rememberMe) {
        localStorage.setItem(
          "phishshield_remembered_email",
          newUser.email
        );
      }

      setSuccess("Account created successfully! Redirecting to dashboard...");
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } else {
      // Login Flow
      const matchedUser = usersDb.find(
        (u) =>
          u.email.toLowerCase() === email.toLowerCase() &&
          u.password === password
      );

      if (!matchedUser) {
        setError("Invalid email or password. (Or try Demo Login!)");
        setIsLoading(false);
        return;
      }

      const sessionUser = {
        name: matchedUser.name,
        email: matchedUser.email,
        loginTime: new Date().toISOString(),
      };

      localStorage.setItem(
        "phishshield_current_user",
        JSON.stringify(sessionUser)
      );
      window.dispatchEvent(new Event("storage"));

      if (rememberMe) {
        localStorage.setItem(
          "phishshield_remembered_email",
          matchedUser.email
        );
      } else {
        localStorage.removeItem("phishshield_remembered_email");
      }

      setSuccess("Authenticated successfully! Welcome back!");
      setTimeout(() => {
        router.push("/");
      }, 800);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("phishshield_current_user");
    window.dispatchEvent(new Event("storage"));
    setCurrentUser(null);
    setSuccess("Logged out successfully.");
  };

  return (
    <div className="relative min-h-screen bg-black text-white font-body flex flex-col justify-between overflow-hidden">
      <LoginBackgroundVideo />

      {/* Top Bar */}
      <header className="relative z-20 max-w-7xl w-full mx-auto px-6 py-6 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors liquid-glass-strong px-4 py-2 rounded-full border border-white/10"
        >
          <ArrowLeft className="w-4 h-4 text-neon-blue" />
          <span>Back to PhishShield AI</span>
        </Link>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="font-heading italic font-bold text-lg tracking-tight">
            PhishShield <span className="text-neon-blue">Auth</span>
          </span>
        </div>
      </header>

      {/* Main Authentication Container */}
      <main className="relative z-20 max-w-md w-full mx-auto px-4 py-8">
        <div className="liquid-glass-strong p-8 rounded-3xl border border-white/20 shadow-2xl backdrop-blur-2xl animate-fade-in">
          {/* Active Session Alert if user is already logged in */}
          {currentUser ? (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-neon-blue/20 border border-neon-blue/50 flex items-center justify-center mx-auto text-neon-blue">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h2 className="font-heading italic text-2xl text-white">
                  You are Logged In!
                </h2>
                <p className="text-sm text-gray-300 mt-1">
                  Signed in as <strong className="text-neon-blue">{currentUser.name}</strong> ({currentUser.email})
                </p>
                <p className="text-xs text-gray-400 mt-1 font-mono">
                  Stored securely in browser Local Storage
                </p>
              </div>

              <div className="space-y-3">
                <Link
                  href="/"
                  className="w-full block py-3 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple font-medium text-sm text-white shadow-lg hover:brightness-110 transition-all text-center"
                >
                  Go to Main Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full py-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-sm font-medium hover:bg-red-500/20 transition-all"
                >
                  Sign Out of Account
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Header Title */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neon-blue/10 border border-neon-blue/30 text-neon-blue text-xs font-semibold mb-3">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Local Storage Auth System</span>
                </div>
                <h1 className="font-heading italic text-3xl font-bold text-white">
                  {isRegister ? "Create an Account" : "Welcome Back"}
                </h1>
                <p className="text-xs text-gray-400 mt-1 font-light">
                  {isRegister
                    ? "Register your credentials securely in local browser storage"
                    : "Access your threat scanner history & Stark AI mentor"}
                </p>
              </div>

              {/* Tab Switcher */}
              <div className="grid grid-cols-2 p-1 rounded-xl bg-white/[0.04] border border-white/10 mb-6 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(false);
                    setError("");
                  }}
                  className={`py-2 rounded-lg transition-all ${
                    !isRegister
                      ? "bg-neon-blue/20 text-white border border-neon-blue/40 shadow-sm"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(true);
                    setError("");
                  }}
                  className={`py-2 rounded-lg transition-all ${
                    isRegister
                      ? "bg-neon-purple/20 text-white border border-neon-purple/40 shadow-sm"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Register Account
                </button>
              </div>

              {/* Quick Demo Login Button */}
              <button
                type="button"
                onClick={handleDemoLogin}
                className="w-full mb-5 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-300 text-xs font-medium flex items-center justify-center gap-2 hover:bg-amber-500/30 transition-all shadow-md"
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span>One-Click Demo Login (Tony Stark)</span>
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-black/80 px-2 text-gray-500 font-mono">
                    or fill out credentials
                  </span>
                </div>
              </div>

              {/* Error & Success Feedback */}
              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-xs text-green-300 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>{success}</span>
                </div>
              )}

              {/* Auth Form */}
              <form onSubmit={handleSubmit} className="space-y-4 text-xs font-body">
                {isRegister && (
                  <div>
                    <label className="block text-gray-300 mb-1 font-medium">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                      <input
                        type="text"
                        name="name"
                        required
                        placeholder="e.g. Stan Lee"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full bg-white/[0.04] border border-white/15 text-white pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-neon-purple transition-all"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-gray-300 mb-1 font-medium">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="user@phishshield.ai"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-white/[0.04] border border-white/15 text-white pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-neon-blue transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 mb-1 font-medium">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      required
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full bg-white/[0.04] border border-white/15 text-white pl-10 pr-12 py-2.5 rounded-xl focus:outline-none focus:border-neon-blue transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-2.5 text-gray-400 hover:text-white"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {isRegister && (
                  <div>
                    <label className="block text-gray-300 mb-1 font-medium">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="confirmPassword"
                        required
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full bg-white/[0.04] border border-white/15 text-white pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-neon-purple transition-all font-mono"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-gray-400 text-xs">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                      className="rounded bg-white/10 border-white/20 text-neon-blue focus:ring-0"
                    />
                    <span>Remember session in LocalStorage</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple font-medium text-sm text-white shadow-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 border border-white/20 disabled:opacity-50 mt-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {isLoading
                      ? "Processing..."
                      : isRegister
                      ? "Create Account & Save to LocalStorage"
                      : "Sign In via LocalStorage"}
                  </span>
                </button>
              </form>
            </>
          )}
        </div>
      </main>

      {/* Footer Info */}
      <footer className="relative z-20 py-6 text-center text-xs text-gray-500 font-mono">
        <p>PhishShield AI • 3-Layer Detection Engine</p>
      </footer>
    </div>
  );
}
