import React, { useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import { X, Wallet, ArrowDownRight, ArrowUpRight, Copy, Check, Clock, CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react';

interface WalletModalProps {
  onClose: () => void;
  defaultTab?: 'deposit' | 'withdraw' | 'history';
}

export const WalletModal: React.FC<WalletModalProps> = ({ onClose, defaultTab = 'deposit' }) => {
  const { user, transactions, settings, submitDeposit, submitWithdraw } = useTournament();
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'history'>(defaultTab);

  // Deposit Form State
  const [depositMethod, setDepositMethod] = useState<'bKash' | 'Nagad' | 'Rocket'>('Nagad');
  const [depositAmount, setDepositAmount] = useState<number>(100);
  const [depositTrxId, setDepositTrxId] = useState('');
  const [depositPhone, setDepositPhone] = useState(user?.phone || '');

  // Withdraw Form State
  const [withdrawMethod, setWithdrawMethod] = useState<'bKash' | 'Nagad' | 'Rocket'>('Nagad');
  const [withdrawAmount, setWithdrawAmount] = useState<number>(50);
  const [withdrawPhone, setWithdrawPhone] = useState(user?.phone || '');

  // Feedback State
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Unified single balance (Winning account and Main account are one and the same)
  const totalBalance = user ? (user.depositBalance || 0) + (user.winningBalance || 0) : 0;

  // Daily withdraw limit calculations (Max 1000 BDT/day)
  const today = new Date().toDateString();
  const todayWithdrawn = transactions
    .filter((t) => {
      if (t.userId !== user?.id || t.type !== 'withdraw' || t.status === 'rejected') return false;
      const d = new Date(t.date);
      return !isNaN(d.getTime()) && d.toDateString() === today;
    })
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const remainingDailyLimit = Math.max(0, 1000 - todayWithdrawn);
  const maxCanWithdraw = Math.min(totalBalance, remainingDailyLimit);

  // Method details
  const getMethodDetails = (method: 'bKash' | 'Nagad' | 'Rocket') => {
    switch (method) {
      case 'bKash':
        return {
          name: 'বিকাশ (bKash)',
          number: settings.bKashNumber || '01XXXXXXXXX',
          note: settings.bKashNote || 'Personal - Send Money',
          gradient: 'from-pink-600 via-rose-600 to-pink-700',
          accent: 'border-pink-500 text-pink-300',
        };
      case 'Rocket':
        return {
          name: 'রকেট (Rocket)',
          number: settings.rocketNumber || '01XXXXXXXXX',
          note: settings.rocketNote || 'Personal - Send Money',
          gradient: 'from-purple-600 via-indigo-600 to-purple-800',
          accent: 'border-purple-500 text-purple-300',
        };
      default:
        return {
          name: 'নগদ (Nagad)',
          number: settings.nagadNumber || '01317857373',
          note: settings.nagadNote || 'Personal - Send Money',
          gradient: 'from-orange-600 via-amber-600 to-red-600',
          accent: 'border-orange-500 text-orange-300',
        };
    }
  };

  const currentMethodDetails = getMethodDetails(depositMethod);

  const handleCopyNumber = (num: string, key: string) => {
    const cleanNum = num.split(' ')[0].replace(/[^0-9]/g, '');
    navigator.clipboard.writeText(cleanNum);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    if (depositAmount < 50) {
      setFeedback({ type: 'error', message: 'সর্বনিম্ন ডিপোজিট ৫০ টাকা।' });
      return;
    }
    const res = submitDeposit(depositMethod, Number(depositAmount), depositTrxId, depositPhone);
    if (res.success) {
      setFeedback({
        type: 'success',
        message: `${currentMethodDetails.name} ডিপোজিট রিকোয়েস্ট সফলভাবে জমা হয়েছে! অ্যাডমিন প্যানেলে পাঠানো হয়েছে, ২-৫ মিনিটে ব্যালেন্স যোগ হবে।`,
      });
      setDepositTrxId('');
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    if (withdrawAmount < 50) {
      setFeedback({ type: 'error', message: 'সর্বনিম্ন উত্তোলন ৫০ টাকা।' });
      return;
    }
    if (withdrawAmount > remainingDailyLimit) {
      setFeedback({
        type: 'error',
        message: `দৈনিক সর্বোচ্চ উত্তোলন ১,০০০ টাকা। আজ আপনি আর সর্বোচ্চ ৳${remainingDailyLimit} তুলতে পারবেন।`,
      });
      return;
    }
    if (withdrawAmount > totalBalance) {
      setFeedback({
        type: 'error',
        message: `পর্যাপ্ত ব্যালেন্স নেই! আপনার বর্তমান ব্যালেন্স ৳${totalBalance}।`,
      });
      return;
    }

    const res = submitWithdraw(withdrawMethod, Number(withdrawAmount), withdrawPhone);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 text-slate-100 p-5 shadow-2xl my-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shadow-inner">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-white">LG LEADER BD ওয়ালেট</h3>
            <p className="text-xs text-slate-400">ডিপোজিট, উত্তোলন ও একাউন্ট ব্যালেন্স</p>
          </div>
        </div>

        {/* Unified Balance Card (Winning & Main account are one and the same) */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 border border-slate-800 mb-4 shadow-inner">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-400">আপনার একাউন্ট মোট ব্যালেন্স</div>
              <div className="text-3xl font-black text-white tabular-nums mt-0.5 tracking-tight">
                ৳{totalBalance}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Active Account
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-[11px]">
            <div>
              <span className="text-slate-400">সর্বনিম্ন ডিপোজিট / উত্তোলন:</span>
              <div className="font-bold text-sky-300">৳৫০ টাকা</div>
            </div>
            <div>
              <span className="text-slate-400">দৈনিক সর্বোচ্চ উত্তোলন:</span>
              <div className="font-bold text-amber-300">৳১,০০০ টাকা / দিন</div>
            </div>
          </div>
        </div>

        {/* Segmented Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl mb-4 border border-slate-800">
          <button
            onClick={() => {
              setActiveTab('deposit');
              setFeedback(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'deposit'
                ? 'bg-sky-500 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>টাকা এড করুন</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('withdraw');
              setFeedback(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'withdraw'
                ? 'bg-sky-500 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>উত্তোলন (Withdraw)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('history');
              setFeedback(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'history'
                ? 'bg-sky-500 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>হিস্ট্রি</span>
          </button>
        </div>

        {feedback && (
          <div
            className={`p-3 rounded-xl text-xs mb-4 flex items-center gap-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-950/90 border border-emerald-600 text-emerald-200'
                : 'bg-red-950/90 border border-red-600 text-red-200'
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

        {/* Tab 1: DEPOSIT (Add Fund: Min 50 BDT) */}
        {activeTab === 'deposit' && (
          <form onSubmit={handleDepositSubmit} className="space-y-3.5">
            {/* Method Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                পেমেন্ট মেথড সিলেক্ট করুন:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Nagad', 'bKash', 'Rocket'] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setDepositMethod(method)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                      depositMethod === method
                        ? 'border-sky-500 bg-sky-500/20 text-white shadow-sm'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {/* Branded Gateway Account Card */}
            <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${currentMethodDetails.gradient} p-4 text-white shadow-lg`}>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-sm text-white">
                      ৳
                    </span>
                    <div>
                      <h4 className="font-black text-sm tracking-wide">{currentMethodDetails.name} Send Money</h4>
                      <p className="text-[10px] text-white/80 font-semibold">{currentMethodDetails.note}</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-white/20 backdrop-blur-md text-white font-extrabold px-2 py-0.5 rounded-full uppercase">
                    Personal
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-black/35 backdrop-blur-md border border-white/20 mt-2 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-white/80 font-medium block">
                      সেন্ড মানি করার নাম্বার:
                    </span>
                    <span className="text-lg font-black font-mono tracking-wider text-white">
                      {currentMethodDetails.number}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyNumber(currentMethodDetails.number, `dep-${depositMethod}`)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white text-slate-900 hover:bg-slate-100 font-black text-xs shadow-md active:scale-95 transition-all cursor-pointer"
                  >
                    {copiedKey === `dep-${depositMethod}` ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                        <span>কপি হয়েছে</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>কপি করুন</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Amount Selector (Min 50 BDT) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  ডিপোজিট পরিমাণ (সর্বনিম্ন ৳৫০):
                </label>
                <span className="text-[10px] text-amber-400 font-bold">Min: ৳50</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5 mb-2">
                {[50, 100, 200, 500, 1000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDepositAmount(amt)}
                    className={`py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      depositAmount === amt
                        ? 'bg-sky-500 text-white shadow-sm'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    ৳{amt}
                  </button>
                ))}
              </div>

              <input
                type="number"
                min="50"
                step="5"
                value={depositAmount}
                onChange={(e) => setDepositAmount(Number(e.target.value))}
                placeholder="টাকার পরিমাণ লিখুন (যেমন: 150)"
                className="w-full text-xs font-bold bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                required
              />
            </div>

            {/* Sender Number Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                যে নাম্বার থেকে টাকা পাঠিয়েছেন:
              </label>
              <input
                type="text"
                value={depositPhone}
                onChange={(e) => setDepositPhone(e.target.value)}
                placeholder="যেমন: 01XXXXXXXXX"
                className="w-full text-xs font-mono bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                required
              />
            </div>

            {/* Transaction ID Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                ট্রানজেকশন আইডি (Transaction ID / TrxID):
              </label>
              <input
                type="text"
                value={depositTrxId}
                onChange={(e) => setDepositTrxId(e.target.value)}
                placeholder="যেমন: 7NJ89K2P"
                className="w-full text-xs font-mono uppercase bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-amber-300 font-bold focus:outline-none focus:border-sky-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-sky-900/40 cursor-pointer active:scale-98 transition-all mt-2"
            >
              ডিপোজিট রিকোয়েস্ট সাবমিট করুন (৳{depositAmount})
            </button>
          </form>
        )}

        {/* Tab 2: WITHDRAW (Min 50 BDT, Max 1000 BDT/day, Immediate balance deduction) */}
        {activeTab === 'withdraw' && (
          <form onSubmit={handleWithdrawSubmit} className="space-y-3.5">
            {/* Limit Banner */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/40 text-xs space-y-1">
              <div className="flex items-center justify-between font-bold text-emerald-300">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>দৈনিক উত্তোলন নিয়মাবলী</span>
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
                  Limit: ৳1,000/Day
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                • সর্বনিম্ন উত্তোলন: <strong>৳৫০ টাকা</strong> | দৈনিক সর্বোচ্চ উত্তোলন: <strong>৳১,০০০ টাকা</strong>
              </p>
              <p className="text-[11px] text-emerald-200/90 leading-relaxed">
                • আজ আপনি আর সর্বোচ্চ <strong>৳{remainingDailyLimit}</strong> উত্তোলন করতে পারবেন।
              </p>
              <p className="text-[10px] text-amber-300/80 leading-relaxed pt-1 border-t border-slate-800">
                • রিকোয়েস্ট সাবমিটের সাথে সাথে আপনার একাউন্ট থেকে টাকা কর্তন করা হবে এবং অ্যাডমিন দ্রুত যাচাই করে বিকাশ/নগদে টাকা পাঠিয়ে দেবে।
              </p>
            </div>

            {/* Method Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                টাকা গ্রহণের মেথড সিলেক্ট করুন:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Nagad', 'bKash', 'Rocket'] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setWithdrawMethod(method)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      withdrawMethod === method
                        ? 'border-emerald-500 bg-emerald-500/20 text-white shadow-sm'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  উত্তোলনের পরিমাণ (৳):
                </label>
                <span className="text-[10px] text-emerald-400 font-bold">
                  সর্বোচ্চ তুলতে পারবেন: ৳{maxCanWithdraw}
                </span>
              </div>
              <input
                type="number"
                min="50"
                max={maxCanWithdraw}
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                placeholder="যেমন: 50, 100, 500"
                className="w-full text-xs font-black bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                required
              />

              {/* Quick Amount presets */}
              <div className="flex items-center gap-1.5 mt-2">
                {[50, 100, 200, 500, 1000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    disabled={amt > maxCanWithdraw}
                    onClick={() => setWithdrawAmount(amt)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                      withdrawAmount === amt
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : amt > maxCanWithdraw
                        ? 'bg-slate-950 text-slate-600 border border-slate-900 cursor-not-allowed'
                        : 'bg-slate-950 border border-slate-800 text-slate-300 hover:text-white cursor-pointer'
                    }`}
                  >
                    ৳{amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Phone Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                আপনার {withdrawMethod} পার্সোনাল নাম্বার:
              </label>
              <input
                type="text"
                value={withdrawPhone}
                onChange={(e) => setWithdrawPhone(e.target.value)}
                placeholder="যেমন: 01XXXXXXXXX"
                className="w-full text-xs font-mono bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={totalBalance < 50 || remainingDailyLimit < 50 || withdrawAmount < 50 || withdrawAmount > maxCanWithdraw}
              className={`w-full py-3.5 rounded-xl font-black text-xs shadow-md transition-all mt-2 ${
                totalBalance >= 50 && remainingDailyLimit >= 50 && withdrawAmount >= 50 && withdrawAmount <= maxCanWithdraw
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white cursor-pointer active:scale-98 shadow-emerald-900/40'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              উত্তোলন রিকোয়েস্ট পাঠান (৳{withdrawAmount})
            </button>
          </form>
        )}

        {/* Tab 3: HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {transactions.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">কোনো লেনদেন হিস্ট্রি নেই।</p>
            ) : (
              transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-white capitalize flex items-center gap-1.5">
                      <span>{tx.type.replace('_', ' ')}</span>
                      {tx.method && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                          {tx.method}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{tx.date}</div>
                    {tx.trxId && (
                      <div className="text-[10px] text-slate-500 font-mono">TrxID: {tx.trxId}</div>
                    )}
                  </div>

                  <div className="text-right">
                    <div
                      className={`font-black tabular-nums ${
                        tx.type === 'deposit' || tx.type === 'match_prize'
                          ? 'text-emerald-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {tx.type === 'deposit' || tx.type === 'match_prize' ? '+' : '-'}৳{tx.amount}
                    </div>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded capitalize ${
                        tx.status === 'approved'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : tx.status === 'pending'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-red-950 text-red-300 border border-red-800'
                      }`}
                    >
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
