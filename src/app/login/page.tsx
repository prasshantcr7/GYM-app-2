"use client";

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Sparkles, AlertCircle, Dumbbell, CheckCircle } from 'lucide-react';
import { authClient } from '@/lib/auth-client';

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  const [authMethod, setAuthMethod] = useState<'password' | 'magic-link'>('password');
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const validateForm = () => {
    if (isSignUp && !name.trim()) {
      setErrorMsg("Please enter your name");
      return false;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address");
      return false;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long");
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (authMethod === 'magic-link') {
      if (!email.trim() || !email.includes("@")) {
        setErrorMsg("Please enter a valid email address");
        return;
      }

      startTransition(async () => {
        try {
          const { error } = await authClient.signIn.magicLink({
            email,
            callbackURL: "/",
          });

          if (error) {
            setErrorMsg(error.message || "Failed to send magic link. Please try again.");
          } else {
            setSuccessMsg("We've sent a magic link to your email! Click it to sign in instantly. (If testing locally, see your server console.)");
          }
        } catch (err) {
          console.error("Magic link auth failed:", err);
          setErrorMsg("An unexpected error occurred. Please try again.");
        }
      });
      return;
    }

    if (!validateForm()) return;

    startTransition(async () => {
      try {
        if (isSignUp) {
          // Sign Up
          const { error } = await authClient.signUp.email({
            email,
            password,
            name,
            callbackURL: "/",
          });

          if (error) {
            setErrorMsg(error.message || "Failed to create account. Please try again.");
            return;
          }
        } else {
          // Log In
          const { error } = await authClient.signIn.email({
            email,
            password,
            callbackURL: "/",
          });

          if (error) {
            setErrorMsg(error.message || "Invalid email or password.");
            return;
          }
        }

        // Redirect to homepage on success
        router.push('/');
        router.refresh();
      } catch (err) {
        console.error("Auth action failed:", err);
        setErrorMsg("An unexpected error occurred. Please try again.");
      }
    });
  };

  return (
    <div className="flex-1 flex flex-col justify-center px-6 py-12 bg-transparent relative select-none">
      {/* HUD background decorations */}
      <div className="absolute top-20 left-10 w-36 h-36 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-36 h-36 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full flex flex-col gap-6 max-w-sm mx-auto">
        {/* LOGO */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-accent to-cyan-accent text-white shadow-[0_0_25px_rgba(155,93,229,0.3)] animate-pulse">
            <Dumbbell className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-widest bg-gradient-to-r from-cyan-accent via-violet-accent to-rose-accent bg-clip-text text-transparent mt-1">
            PULSE
          </h1>
          <p className="text-xs text-slate-400 font-mono tracking-wider">SECURE WORKOUT AUTH</p>
        </div>

        {/* FORM PANEL */}
        <div className="glass-panel rounded-3xl p-6 shadow-2xl relative border-white/8">
          <h2 className="text-lg font-bold text-white mb-4 text-center">
            {authMethod === 'magic-link' ? 'Magic Link Sign In' : isSignUp ? 'Create your Account' : 'Welcome Back'}
          </h2>

          {/* ERROR ALERT */}
          {errorMsg && (
            <div className="flex items-start gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-accent text-xs rounded-xl p-3 mb-4 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* SUCCESS ALERT */}
          {successMsg && (
            <div className="flex items-start gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl p-3 mb-4">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* AUTH METHOD TAB TOGGLE */}
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 mb-4">
            <button
              type="button"
              onClick={() => {
                setAuthMethod('password');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-1.5 text-[10px] font-mono tracking-wider rounded-lg transition-all ${
                authMethod === 'password'
                  ? 'bg-white text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              PASSWORD
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMethod('magic-link');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-1.5 text-[10px] font-mono tracking-wider rounded-lg transition-all ${
                authMethod === 'magic-link'
                  ? 'bg-white text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              MAGIC LINK
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Name field (Sign Up & Password mode only) */}
            {isSignUp && authMethod === 'password' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono text-slate-400 tracking-wider">FULL NAME</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs"
                  />
                </div>
              </div>
            )}

            {/* Email field (All modes) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono text-slate-400 tracking-wider">EMAIL ADDRESS</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs"
                />
              </div>
            </div>

            {/* Password field (Password mode only) */}
            {authMethod === 'password' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono text-slate-400 tracking-wider">PASSWORD</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 rounded-xl bg-white text-slate-950 font-bold tracking-wider text-xs flex items-center justify-center gap-1.5 hover:bg-slate-100 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] active:scale-[0.98] transition-all disabled:opacity-50 mt-2 cursor-pointer"
            >
              {isPending ? (
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-slate-900" />
                  {authMethod === 'magic-link' ? 'SEND MAGIC LINK' : isSignUp ? 'SIGN UP NOW' : 'SECURE LOG IN'}
                </>
              )}
            </button>
          </form>

          {/* Toggle link */}
          <div className="text-center text-xs text-slate-400 mt-5 pt-4 border-t border-white/5 font-medium">
            {authMethod === 'magic-link' ? (
              <span className="text-[10px] font-mono text-slate-400">
                Unified Magic Link Sign In / Sign Up
              </span>
            ) : isSignUp ? (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(false);
                    setErrorMsg(null);
                  }}
                  className="text-cyan-accent hover:underline font-bold"
                >
                  Log In
                </button>
              </>
            ) : (
              <>
                New to Pulse?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(true);
                    setErrorMsg(null);
                  }}
                  className="text-cyan-accent hover:underline font-bold"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
