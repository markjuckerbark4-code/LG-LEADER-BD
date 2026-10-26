import React, { useState, useEffect } from 'react';
import { useTournament } from '../context/TournamentContext';
import { Bell, Wallet, ShieldCheck, Wifi, BatteryCharging, Signal } from 'lucide-react';

interface HeaderProps {
  onOpenWallet: () => void;
  onNavigateToAdmin: () => void;
  currentTab: string;
}

export const Header: React.FC<HeaderProps> = ({ onOpenWallet, onNavigateToAdmin }) => {
  const { user, notice } = useTournament();
  const [timeStr, setTimeStr] = useState('09:58 PM');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const totalBalance = user.depositBalance + user.winningBalance;

  return (
    <header className="sticky top-0 z-30 w-full bg-slate-950/95 backdrop-blur-md border-b border-slate-800 shadow-md">
      {/* Mobile OS Status Bar simulation */}
      <div className="flex items-center justify-between px-4 pt-1.5 pb-1 text-[11px] font-semibold text-slate-400 select-none">
        <div className="flex items-center gap-1.5">
          <span>{timeStr}</span>
          <span className="text-[10px] bg-slate-800/80 px-1 rounded text-sky-400">4G</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Signal className="w-3 h-3 text-slate-300" />
          <Wifi className="w-3 h-3 text-slate-300" />
          <div className="flex items-center gap-0.5">
            <span className="text-[10px]">98%</span>
            <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Main App Bar */}
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2">
          {/* Brand Logo & Name */}
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white uppercase flex items-center gap-1">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-red-500">
                  LG LEADER BD
                </span>
              </h1>
            </div>
            <span className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase">
              FREE FIRE ESPORTS
            </span>
          </div>
        </div>

        {/* Right side actions: Wallet Balance & Admin toggle */}
        <div className="flex items-center gap-2">
          {/* Quick Admin Access Button */}
          <button
            onClick={onNavigateToAdmin}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800/90 text-amber-300 hover:bg-slate-700 hover:text-amber-200 border border-amber-500/30 transition-colors shadow-sm"
            title="Open Admin Panel (/admin)"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Admin Panel</span>
            <span className="sm:hidden font-mono text-[10px]">/admin</span>
          </button>

          {/* User Wallet Balance Chip */}
          <button
            onClick={onOpenWallet}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white shadow-md shadow-sky-900/30 active:scale-95 transition-all text-xs font-bold"
          >
            <Wallet className="w-3.5 h-3.5 text-sky-200" />
            <span className="tabular-nums">৳{totalBalance}</span>
            <span className="w-4 h-4 rounded-full bg-white/20 text-white flex items-center justify-center text-[10px] font-extrabold leading-none">
              +
            </span>
          </button>
        </div>
      </div>

      {/* Marquee Notice Bar matching screenshot banner */}
      <div className="relative w-full bg-amber-500/10 border-t border-b border-amber-500/20 py-1 px-3 overflow-hidden flex items-center">
        <Bell className="w-3.5 h-3.5 text-amber-400 shrink-0 mr-2 animate-bounce" />
        <div className="overflow-hidden whitespace-nowrap w-full">
          <div className="animate-marquee inline-block text-xs font-medium text-amber-300 tracking-wide">
            {notice}
          </div>
        </div>
      </div>
    </header>
  );
};
