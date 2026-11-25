import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'header' | 'landing';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'header' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    if (variant === 'landing') {
      return (
        <button
          type="button"
          onClick={install}
          className="w-full py-3.5 px-6 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/50 text-emerald-300 font-black text-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Smartphone className="w-4 h-4 text-emerald-400" />
          <span>ফোনে WebApp ইনস্টল করুন (সরাসরি অ্যাপ)</span>
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={install}
        title="WebApp ইনস্টল করুন"
        className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-[11px] font-extrabold cursor-pointer active:scale-95 transition-all"
      >
        <Download className="w-3.5 h-3.5" />
        <span>ইনস্টল</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className={
            variant === 'landing'
              ? 'w-full py-3 px-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-200 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer'
              : 'flex items-center gap-1 px-2 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-[11px] font-bold cursor-pointer'
          }
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>iPhone এ অ্যাপ ইনস্টল করুন</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-5 text-slate-100 shadow-2xl space-y-3 text-left">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-white">iPhone / iPad এ WebApp ইনস্টল</h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                ১. নিচে Safari ব্রাউজারের <strong>Share</strong> আইকনে চাপ দিন।
                <br />
                ২. এরপর <strong>Add to Home Screen</strong> সিলেক্ট করে <strong>Add</strong> চাপুন।
              </p>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
              >
                বুঝেছি
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
