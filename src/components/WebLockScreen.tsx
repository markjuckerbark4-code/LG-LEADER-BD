import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Lock, Unlock, KeyRound, AlertCircle, Phone, MessageSquare, ShieldAlert, ArrowRight, Delete } from 'lucide-react';
import { useTournament } from '../context/TournamentContext';

interface WebLockScreenProps {
  onUnlock: () => void;
  onAdminAccess: () => void;
}

export const WebLockScreen: React.FC<WebLockScreenProps> = ({ onUnlock, onAdminAccess }) => {
  const { settings } = useTournament();
  const [pinInput, setPinInput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [showPin, setShowPin] = useState<boolean>(false);

  const correctPin = settings?.webLockPin?.trim() || '200628';
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  // Auto focus input on load
  useEffect(() => {
    hiddenInputRef.current?.focus();
  }, []);

  const handleVerifyPin = (inputToTest: string) => {
    if (!inputToTest) {
      setErrorMessage('অনুগ্রহ করে পিন কোডটি লিখুন');
      return;
    }

    if (inputToTest === correctPin) {
      setErrorMessage(null);
      setIsSuccess(true);
      try {
        sessionStorage.setItem('lgleader_web_unlocked', 'true');
        localStorage.setItem('lgleader_web_unlocked', 'true');
      } catch (err) {
        console.error('Storage access error:', err);
      }
      setTimeout(() => {
        onUnlock();
      }, 700);
    } else {
      setIsShaking(true);
      setErrorMessage('ভুল সিকিউরিটি পিন! সঠিক পিন দিয়ে আবার চেষ্টা করুন।');
      setTimeout(() => {
        setIsShaking(false);
      }, 500);
      setPinInput('');
    }
  };

  const handleKeyPress = (digit: string) => {
    if (isSuccess) return;
    if (pinInput.length < 8) {
      const nextPin = pinInput + digit;
      setPinInput(nextPin);
      setErrorMessage(null);
      if (nextPin.length === correctPin.length) {
        handleVerifyPin(nextPin);
      }
    }
  };

  const handleDelete = () => {
    if (isSuccess) return;
    setPinInput((prev) => prev.slice(0, -1));
    setErrorMessage(null);
  };

  const handleClear = () => {
    if (isSuccess) return;
    setPinInput('');
    setErrorMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerifyPin(pinInput);
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col items-center justify-between p-4 relative overflow-hidden select-none">
      {/* Background Decorative Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Badge */}
      <div className="w-full max-w-sm flex items-center justify-between pt-4 pb-2 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center">
            <span className="font-black text-slate-950 text-xs">LG</span>
          </div>
          <div>
            <h1 className="text-sm font-black tracking-wide text-white">
              {settings?.siteName || 'LG LEADER BD'}
            </h1>
            <p className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider">
              Official Gaming Portal
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-semibold">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>Web Lock</span>
        </div>
      </div>

      {/* Main Lock Card */}
      <div
        className={`w-full max-w-sm my-auto rounded-3xl bg-slate-900/90 border border-slate-800/90 p-6 sm:p-7 shadow-2xl backdrop-blur-xl flex flex-col items-center text-center z-10 transition-transform ${
          isShaking ? 'animate-bounce' : ''
        }`}
      >
        {/* Animated Icon */}
        <div className="relative mb-4">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-orange-500/20 border border-amber-500/30 flex items-center justify-center shadow-inner relative group">
            {isSuccess ? (
              <Unlock className="w-10 h-10 text-emerald-400 animate-bounce transition-all duration-300" />
            ) : (
              <Lock className="w-10 h-10 text-amber-400 drop-shadow-md transition-all duration-300" />
            )}
          </div>
          <div
            className={`absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full flex items-center justify-center border-2 border-slate-900 shadow-md ${
              isSuccess ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-slate-950'
            }`}
          >
            {isSuccess ? (
              <ShieldCheck className="w-4 h-4" />
            ) : (
              <KeyRound className="w-3.5 h-3.5" />
            )}
          </div>
        </div>

        {/* Title & Prompt */}
        <h2 className="text-lg font-black text-white mb-1.5 tracking-tight">
          {settings?.webLockTitle || 'LG LEADER BD - সিকিউরিটি লক'}
        </h2>
        <p className="text-xs text-slate-400 max-w-[270px] leading-relaxed mb-5">
          {settings?.webLockSubtitle || 'ওয়েবসাইটটিতে প্রবেশ করতে ৬ ডিজিটের সিকিউরিটি পিন দিন'}
        </p>

        {/* Hidden native input for physical hardware keyboards / autofill */}
        <input
          ref={hiddenInputRef}
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={8}
          value={pinInput}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, '');
            setPinInput(val);
            setErrorMessage(null);
            if (val.length === correctPin.length) {
              handleVerifyPin(val);
            }
          }}
          className="sr-only"
          autoFocus
        />

        {/* 6-Digit Visual Pin Boxes */}
        <div
          onClick={() => hiddenInputRef.current?.focus()}
          className="flex items-center justify-center gap-2.5 mb-3 cursor-pointer py-1"
        >
          {Array.from({ length: 6 }).map((_, index) => {
            const char = pinInput[index];
            const isFilled = index < pinInput.length;
            const isCurrent = index === pinInput.length;

            return (
              <div
                key={index}
                className={`w-11 h-12 rounded-xl flex items-center justify-center font-mono font-black text-lg transition-all ${
                  isSuccess
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 scale-105'
                    : isFilled
                    ? 'border-amber-500/80 bg-amber-500/10 text-amber-300 shadow-md shadow-amber-500/10 scale-105'
                    : isCurrent
                    ? 'border-slate-500 bg-slate-950 text-white ring-2 ring-amber-500/30'
                    : 'border-slate-800 bg-slate-950/80 text-slate-600'
                } border-2`}
              >
                {isFilled ? (showPin ? char : '●') : ''}
              </div>
            );
          })}
        </div>

        {/* Show / Hide PIN Toggle */}
        <button
          type="button"
          onClick={() => setShowPin(!showPin)}
          className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors py-1 px-3 mb-2 font-medium"
        >
          {showPin ? 'পিন লুকান (Hide PIN)' : 'পিন দেখুন (Show PIN)'}
        </button>

        {/* Error Alert */}
        {errorMessage && (
          <div className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold mb-3 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Alert */}
        {isSuccess && (
          <div className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold mb-3 animate-fade-in">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>আনলক সফল হয়েছে! প্রবেশ করা হচ্ছে...</span>
          </div>
        )}

        {/* Interactive Numeric Touch Keypad for effortless mobile experience */}
        <div className="w-full grid grid-cols-3 gap-2 my-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleKeyPress(digit)}
              disabled={isSuccess}
              className="h-12 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 active:bg-amber-500 active:text-slate-950 active:scale-95 text-white font-black text-lg transition-all border border-slate-700/60 shadow-sm flex items-center justify-center cursor-pointer disabled:opacity-50"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            disabled={isSuccess || pinInput.length === 0}
            className="h-12 rounded-2xl bg-slate-900/80 hover:bg-slate-800 active:scale-95 text-slate-400 hover:text-slate-200 font-bold text-xs transition-all border border-slate-800 flex items-center justify-center cursor-pointer disabled:opacity-40"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            disabled={isSuccess}
            className="h-12 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 active:bg-amber-500 active:text-slate-950 active:scale-95 text-white font-black text-lg transition-all border border-slate-700/60 shadow-sm flex items-center justify-center cursor-pointer disabled:opacity-50"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isSuccess || pinInput.length === 0}
            className="h-12 rounded-2xl bg-slate-900/80 hover:bg-slate-800 active:scale-95 text-slate-400 hover:text-rose-400 font-bold transition-all border border-slate-800 flex items-center justify-center cursor-pointer disabled:opacity-40"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Submit Unlock Button */}
        <button
          type="button"
          onClick={() => handleVerifyPin(pinInput)}
          disabled={isSuccess || pinInput.length === 0}
          className="w-full mt-3 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSuccess ? (
            <>
              <ShieldCheck className="w-4 h-4 animate-spin" />
              <span>প্রবেশ করা হচ্ছে...</span>
            </>
          ) : (
            <>
              <Unlock className="w-4 h-4" />
              <span>ওয়েবসাইট আনলক করুন</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Footer Support & Admin Link */}
      <div className="w-full max-w-sm flex flex-col items-center gap-3 pt-3 pb-2 z-10 text-xs">
        {/* Support Buttons for users who need PIN */}
        <div className="flex items-center justify-center gap-2 w-full">
          {settings?.whatsappNumber && (
            <a
              href={`https://wa.me/88${settings.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent('আসসালামু আলাইকুম, LG LEADER BD ওয়েব লক পিন প্রয়োজন।')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 px-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-emerald-400 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp সাপোর্ট</span>
            </a>
          )}
          {settings?.telegramUsername && (
            <a
              href={settings.telegramUsername.startsWith('http') ? settings.telegramUsername : `https://t.me/${settings.telegramUsername.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 px-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-sky-400 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>টেলিগ্রাম চ্যানেল</span>
            </a>
          )}
        </div>

        {/* Admin Login Shortcut */}
        <div className="flex items-center justify-between w-full pt-1 px-1 text-[11px] text-slate-500">
          <span>সিকিউরিটি প্রটেক্টেড পোর্টাল</span>
          <button
            type="button"
            onClick={onAdminAccess}
            className="hover:text-amber-400 transition-colors flex items-center gap-1 cursor-pointer font-bold text-slate-400"
          >
            <span>এডমিন প্যানেল</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
