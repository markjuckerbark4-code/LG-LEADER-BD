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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden my-4">
        {/* Top Header Background Banner */}
        <div className="relative bg-gradient-to-br from-amber-600 via-orange-600 to-red-600 p-6 text-center text-white">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-300/20 via-transparent to-black/60" />

          <div className="relative z-10 flex flex-col items-center">
            {/* Glowing Logo Icon */}
            <div className="w-14 h-14 rounded-2xl bg-slate-950/80 border border-amber-400/40 shadow-xl flex items-center justify-center text-amber-400 mb-2">
              <Flame className="w-8 h-8 fill-amber-400" />
            </div>

            <h1 className="text-2xl font-black tracking-tight uppercase drop-shadow">
              {settings.siteName || 'LG LEADER BD'}
            </h1>
            <p className="text-xs font-bold text-amber-200 uppercase tracking-widest mt-0.5">
              FREE FIRE ESPORTS TOURNAMENT
            </p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-black/40 text-[11px] font-medium text-amber-300 border border-amber-400/30">
              <Sparkles className="w-3 h-3" />
              <span>প্রতিদিন ফ্রি ফায়ার কাস্টম টুর্নামেন্ট খেলুন ও নগদ টাকা জিতুন</span>
            </div>
          </div>
        </div>

        {/* Tab Switcher: Login vs Register */}
        <div className="grid grid-cols-2 p-2 bg-slate-950 border-b border-slate-800 text-xs font-black">
          <button
            onClick={() => handleModeSwitch('login')}
            className={`py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
              mode === 'login'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>লগইন (Login)</span>
          </button>
          <button
            onClick={() => handleModeSwitch('register')}
            className={`py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
              mode === 'register'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>নতুন রেজিস্ট্রেশন (Register)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5">
          {/* Feedback Messages */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-red-950/80 border border-red-700/80 text-red-200 text-xs flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="font-semibold leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-emerald-950/80 border border-emerald-700/80 text-emerald-200 text-xs flex items-center gap-2.5 animate-fadeIn">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="font-semibold">{successMsg}</div>
            </div>
          )}

          {/* ----------------- LOGIN FORM ----------------- */}
          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  ইমেইল এড্রেস (বা ইউজারনেম)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="আপনার ইমেইল বা ইউজারনেম দিন"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  পাসওয়ার্ড (Password)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="আপনার পাসওয়ার্ড দিন"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <span>যাচাই হচ্ছে...</span>
                ) : (
                  <>
                    <span>লগইন করুন (Login)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Switch to Register link */}
              <div className="text-center pt-2">
                <p className="text-xs text-slate-400">
                  এখনো কোনো অ্যাকাউন্ট নেই?{' '}
                  <button
                    type="button"
                    onClick={() => handleModeSwitch('register')}
                    className="font-bold text-amber-400 hover:underline cursor-pointer ml-1"
                  >
                    নতুন রেজিস্ট্রেশন করুন
                  </button>
                </p>
              </div>

            </form>
          ) : (
            /* ----------------- REGISTER FORM ----------------- */
            <form onSubmit={handleRegister} className="space-y-3">
              {/* Username */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  ইউজারনেম / গেমার নাম (Username)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="যেমন: Mahin_OP"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  ইমেইল এড্রেস (Email Address)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="যেমন: name@example.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Free Fire UID */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  ফ্রি ফায়ার প্লেয়ার UID (Free Fire UID)
                </label>
                <div className="relative">
                  <Hash className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={regUid}
                    onChange={(e) => setRegUid(e.target.value.replace(/\D/g, ''))}
                    placeholder="যেমন: 592817342"
                    className="w-full font-mono bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                    required
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  কাস্টম রুমে জয়েন ও প্রাইজ প্রদানের জন্য আপনার সঠিক FF UID দিন
                </span>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  পাসওয়ার্ড (Password)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="কমপক্ষে ৪ অক্ষরের পাসওয়ার্ড দিন"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  পাসওয়ার্ড নিশ্চিত করুন (Confirm Password)
                </label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type={showRegConfirmPassword ? 'text' : 'password'}
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="একই পাসওয়ার্ড পুনরায় লিখুন"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showRegConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-3"
              >
                {isLoading ? (
                  <span>রেজিস্ট্রেশন হচ্ছে...</span>
                ) : (
                  <>
                    <span>রেজিস্ট্রেশন সম্পন্ন করুন</span>
                    <CheckCircle className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Switch to Login link */}
              <div className="text-center pt-2">
                <p className="text-xs text-slate-400">
                  ইতোমধ্যে অ্যাকাউন্ট আছে?{' '}
                  <button
                    type="button"
                    onClick={() => handleModeSwitch('login')}
                    className="font-bold text-amber-400 hover:underline cursor-pointer ml-1"
                  >
                    লগইন করুন
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
