import React, { useState } from 'react';
import { TournamentMatch } from '../types';
import { useTournament } from '../context/TournamentContext';
import { X, ShieldAlert, CheckCircle, Wallet, AlertCircle } from 'lucide-react';

interface JoinMatchModalProps {
  match: TournamentMatch;
  onClose: () => void;
  onOpenWallet: () => void;
}

export const JoinMatchModal: React.FC<JoinMatchModalProps> = ({ match, onClose, onOpenWallet }) => {
  const { user, joinMatch } = useTournament();
  const [gamerName, setGamerName] = useState(user.username || '');
  const [uid, setUid] = useState(user.freeFireUid || '');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const totalBalance = user.depositBalance + user.winningBalance;
  const isBalanceEnough = totalBalance >= match.entryFee;
  const isJoined = match.joinedPlayers.some((p) => p.userId === user.id || (uid && p.uid === uid));

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gamerName.trim()) {
      setFeedback({ type: 'error', message: 'অনুগ্রহ করে ফ্রি ফায়ার গেমার নাম দিন।' });
      return;
    }
    if (!uid.trim() || uid.trim().length < 6) {
      setFeedback({ type: 'error', message: 'সঠিক ফ্রি ফায়ার প্লেয়ার UID (কমপক্ষে ৬ ডিজিট) দিন।' });
      return;
    }

    const res = joinMatch(match.id, gamerName.trim(), uid.trim());
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setTimeout(() => {
        onClose();
      }, 1800);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 text-slate-100 p-5 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
            {match.categoryName} • Match #{match.matchNumber}
          </span>
          <h3 className="font-black text-lg text-white mt-0.5 leading-snug">{match.title}</h3>
          <p className="text-xs text-slate-400 mt-1">
            ম্যাচের সময়: <span className="text-sky-300 font-semibold">{match.scheduleTime}</span>
          </p>
        </div>

        {/* Match Quick Specs */}
        <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-950/80 border border-slate-800 mb-4 text-center">
          <div>
            <div className="text-[10px] text-slate-400 font-semibold">এন্ট্রি ফি</div>
            <div className="text-base font-black text-amber-400 tabular-nums">
              {match.entryFee === 0 ? 'FREE' : `৳${match.entryFee}`}
            </div>
          </div>
          <div className="border-x border-slate-800">
            <div className="text-[10px] text-slate-400 font-semibold">প্রতি কিল</div>
            <div className="text-base font-black text-emerald-400 tabular-nums">৳{match.perKill}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-semibold">টোটাল প্রাইজ</div>
            <div className="text-base font-black text-sky-400 tabular-nums">৳{match.totalPrize}</div>
          </div>
        </div>

        {/* User Balance Check */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700 mb-4 text-xs">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-sky-400" />
            <span className="text-slate-300">আপনার বর্তমান ব্যালেন্স:</span>
          </div>
          <div className="font-bold tabular-nums text-white">৳{totalBalance}</div>
        </div>

        {!isBalanceEnough && (
          <div className="p-3 rounded-xl bg-red-950/60 border border-red-700/50 text-red-200 text-xs mb-4 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">ব্যালেন্স কম আছে!</p>
              <p className="text-[11px] text-red-300/80 mt-0.5">
                ম্যাচে জয়েন করতে আরও ৳{match.entryFee - totalBalance} প্রয়োজন।
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenWallet();
                }}
                className="mt-2 px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs"
              >
                ওয়ালেটে টাকা এড করুন
              </button>
            </div>
          </div>
        )}

        {feedback && (
          <div
            className={`p-3 rounded-xl text-xs mb-4 flex items-center gap-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-950/80 border border-emerald-600 text-emerald-200'
                : 'bg-red-950/80 border border-red-600 text-red-200'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {isJoined ? (
          <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-600/60 text-center">
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-1" />
            <h4 className="font-bold text-sm text-emerald-200">আপনি এই ম্যাচে জয়েন করেছেন!</h4>
            <p className="text-xs text-emerald-400/80 mt-1">
              রুম আইডি ও পাসওয়ার্ড ম্যাচ শুরুর ১০ মিনিট আগে My Matches সেকশনে দেখা যাবে।
            </p>
          </div>
        ) : (
          <form onSubmit={handleJoin} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                ফ্রি ফায়ার ইন-গেম নাম (IGN):
              </label>
              <input
                type="text"
                value={gamerName}
                onChange={(e) => setGamerName(e.target.value)}
                placeholder="যেমন: Mahinn_OP"
                className="w-full text-xs bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-sky-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                ফ্রি ফায়ার প্লেয়ার UID (গেম প্রোফাইল আইডি):
              </label>
              <input
                type="text"
                value={uid}
                onChange={(e) => setUid(e.target.value)}
                placeholder="যেমন: 592817342"
                className="w-full text-xs font-mono bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-sky-500"
                required
              />
            </div>

            <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span>
                সতর্কতা: ভুল UID দিলে প্রাইজ পেতে সমস্যা হতে পারে। এমুলেটর বা হ্যাক ব্যবহার সম্পূর্ণ নিষিদ্ধ।
              </span>
            </div>

            <button
              type="submit"
              disabled={!isBalanceEnough}
              className={`w-full py-3 rounded-xl font-extrabold text-sm shadow-lg transition-all ${
                isBalanceEnough
                  ? 'bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white cursor-pointer active:scale-98 shadow-sky-900/40'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              {match.entryFee === 0 ? 'ফ্রিতে জয়েন করুন' : `৳${match.entryFee} দিয়ে জয়েন করুন`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
