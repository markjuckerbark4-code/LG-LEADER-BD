import React, { useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import {
  Mail,
  Lock,
  User,
  Hash,
  Eye,
  EyeOff,
  Flame,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

interface AuthModalProps {
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onSuccess }) => {
  const { registerUser, loginUser, settings } = useTournament();

  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login Form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register Form
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regUid, setRegUid] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // Status & Feedback
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const resetMessages = () => {
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleModeSwitch = (newMode: 'login' | 'register') => {
    resetMessages();
    setMode(newMode);
  };

  // Handle Login Submit
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!loginEmail.trim()) {
      setErrorMsg('অনুগ্রহ করে আপনার ইমেইল এড্রেস লিখুন।');
      return;
    }
    if (!loginPassword) {
      setErrorMsg('অনুগ্রহ করে পাসওয়ার্ড দিন।');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = loginUser(loginEmail.trim(), loginPassword);
      setIsLoading(false);
      if (res.success) {
        setSuccessMsg(res.message);
        if (onSuccess) onSuccess();
      } else {
        setErrorMsg(res.message);
      }
    }, 400);
  };

  // Handle Register Submit
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    const cleanUsername = regUsername.trim();
    const cleanEmail = regEmail.trim();
    const cleanUid = regUid.trim();

    if (!cleanUsername || cleanUsername.length < 3) {
      setErrorMsg('ইউজারনেম কমপক্ষে ৩ অক্ষরের হতে হবে।');
      return;
    }

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMsg('সঠিক ইমেইল এড্রেস প্রদান করুন (যেমন: example@gmail.com)।');
      return;
    }

    if (!cleanUid || cleanUid.length < 5) {
      setErrorMsg('সঠিক ফ্রি ফায়ার প্লেয়ার UID (কমপক্ষে ৫-১০ ডিজিট) দিন।');
      return;
    }

    if (!regPassword || regPassword.length < 4) {
      setErrorMsg('পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড দুটি মিলছে না!');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = registerUser({
        username: cleanUsername,
        email: cleanEmail,
        freeFireUid: cleanUid,
        password: regPassword,
      });
      setIsLoading(false);

      if (res.success) {
        setSuccessMsg(res.message);
        if (onSuccess) onSuccess();
      } else {
        setErrorMsg(res.message);
      }
    }, 400);
  };


  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center p-4 selection:bg-slate-900 selection:text-white">
      <div className="w-full max-w-sm flex flex-col my-auto">
        {/* ===================== LOGIN VIEW ===================== */}
        {mode === 'login' ? (
          <div className="animate-fadeIn">
            {/* Top Header matching Screenshot 1 (Left) */}
            <div className="mb-6 px-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Welcome Back
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Sign in to your account
              </p>
            </div>

            {/* Main White Card matching Screenshot 1 */}
            <div className="bg-white text-slate-900 rounded-3xl p-6 shadow-2xl">
              {/* Feedback Messages */}
              {errorMsg && (
                <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span className="font-semibold leading-relaxed">{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                {/* Email Input */}
                <div>
                  <input
                    type="text"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="Email or Username"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all"
                    required
                  />
                </div>

                {/* Password Input */}
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-800 rounded-xl px-4 py-3 pr-11 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-1"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Login Button matching screenshot black pill */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs sm:text-sm shadow-lg active:scale-98 transition-all cursor-pointer disabled:opacity-50 mt-1"
                >
                  {isLoading ? 'Checking...' : 'Sign In'}
                </button>

                {/* Forgot Password Link */}
                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => alert('পাসওয়ার্ড ভুলে গেলে এডমিন হেল্পলাইনে যোগাযোগ করুন।')}
                    className="text-xs text-slate-400 hover:text-slate-600 font-medium cursor-pointer"
                  >
                    Forgot your password?
                  </button>
                </div>
              </form>
            </div>

            {/* Footer: Register link */}
            <div className="text-center mt-6">
              <p className="text-xs text-slate-400">
                No account?{' '}
                <button
                  type="button"
                  onClick={() => handleModeSwitch('register')}
                  className="font-bold text-white hover:underline cursor-pointer ml-1"
                >
                  Register
                </button>
              </p>
            </div>
          </div>
        ) : (
          /* ===================== SIGN UP VIEW ===================== */
          <div className="animate-fadeIn">
            {/* Top Header with Back button matching Screenshot 1 (Middle) */}
            <div className="flex items-center gap-3 mb-5 px-1">
              <button
                type="button"
                onClick={() => handleModeSwitch('login')}
                className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 text-white flex items-center justify-center hover:bg-slate-800 transition-colors cursor-pointer"
                title="Back to Login"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h1 className="text-2xl font-extrabold text-white tracking-tight">
                  Let's Start
                </h1>
                <p className="text-xs text-slate-400">Create an account</p>
              </div>
            </div>

            {/* Main White Card matching Screenshot 1 */}
            <div className="bg-white text-slate-900 rounded-3xl p-6 shadow-2xl">
              <h2 className="text-center font-extrabold text-lg text-slate-900 mb-4 tracking-tight">
                Sign Up
              </h2>

              {/* Feedback Messages */}
              {errorMsg && (
                <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span className="font-semibold leading-relaxed">{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-3">
                {/* First Name / Username */}
                <div>
                  <input
                    type="text"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="First Name / Username"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all"
                    required
                  />
                </div>

                {/* Email Address */}
                <div>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="Email Address"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all"
                    required
                  />
                </div>

                {/* Mobile Number & Free Fire UID */}
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="tel"
                    placeholder="Mobile Number"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-800 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all font-mono"
                  />
                  <input
                    type="text"
                    value={regUid}
                    onChange={(e) => setRegUid(e.target.value.replace(/\D/g, ''))}
                    placeholder="Free Fire UID"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-800 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all font-mono"
                    required
                  />
                </div>

                {/* Password */}
                <div className="relative">
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-800 rounded-xl px-4 py-2.5 pr-11 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-1"
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Repeat Password */}
                <div className="relative">
                  <input
                    type={showRegConfirmPassword ? 'text' : 'password'}
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Repeat Password"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-800 rounded-xl px-4 py-2.5 pr-11 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-1"
                  >
                    {showRegConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Terms and Conditions Checkbox matching screenshot */}
                <div className="flex items-start gap-2 pt-1 pb-1">
                  <input
                    type="checkbox"
                    id="termsCheckbox"
                    defaultChecked
                    className="mt-1 rounded text-slate-900 focus:ring-slate-900"
                    required
                  />
                  <label htmlFor="termsCheckbox" className="text-[11px] text-slate-500 leading-tight">
                    Accept the terms and conditions and Privacy Policy
                  </label>
                </div>

                {/* Create Account Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs sm:text-sm shadow-lg active:scale-98 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>
            </div>

            {/* Footer: Sign in link */}
            <div className="text-center mt-5">
              <p className="text-xs text-slate-400">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleModeSwitch('login')}
                  className="font-bold text-white hover:underline cursor-pointer ml-1"
                >
                  Sign In
                </button>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
