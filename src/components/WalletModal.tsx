import React, { useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import { PAYMENT_NUMBERS } from '../data/initialData';
import { X, Wallet, ArrowDownRight, ArrowUpRight, Copy, Check, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface WalletModalProps {
  onClose: () => void;
  defaultTab?: 'deposit' | 'withdraw' | 'history';
}

export const WalletModal: React.FC<WalletModalProps> = ({ onClose, defaultTab = 'deposit' }) => {
  const { user, transactions, settings, submitDeposit, submitWithdraw } = useTournament();
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'history'>(defaultTab);

  const paymentNumbersMap = {
    bKash: `${settings.bKashNumber} (${settings.bKashNote || 'Personal - Send Money'})`,
    Nagad: `${settings.nagadNumber} (${settings.nagadNote || 'Personal - Send Money'})`,
    Rocket: `${settings.rocketNumber} (${settings.rocketNote || 'Personal - Send Money'})`,
  };

  // Deposit Form State
  const [depositMethod, setDepositMethod] = useState<'bKash' | 'Nagad' | 'Rocket'>('bKash');
  const [depositAmount, setDepositAmount] = useState<number>(100);
  const [depositTrxId, setDepositTrxId] = useState('');
  const [depositPhone, setDepositPhone] = useState(user.phone || '');

  // Withdraw Form State
  const [withdrawMethod, setWithdrawMethod] = useState<'bKash' | 'Nagad' | 'Rocket'>('bKash');
  const [withdrawAmount, setWithdrawAmount] = useState<number>(50);
  const [withdrawPhone, setWithdrawPhone] = useState(user.phone || '');

  // Feedback State
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const totalBalance = user.depositBalance + user.winningBalance;

  const handleCopyNumber = (num: string, key: string) => {
    // extract digits only
    const cleanNum = num.split(' ')[0].replace('-', '');
    navigator.clipboard.writeText(cleanNum);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    const res = submitDeposit('Nagad', Number(depositAmount), depositTrxId, depositPhone);
    if (res.success) {
      setFeedback({
        type: 'success',
        message: 'নগদ ডিপোজিট রিকোয়েস্ট সফলভাবে জমা হয়েছে! অ্যাডমিন প্যানেলে নোটিফিকেশন পাঠানো হয়েছে, দ্রুত যাচাই করে ব্যালেন্স যোগ করে দেওয়া হবে।',
      });
      setDepositTrxId('');
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
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
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-white">LG LEADER BD ওয়ালেট</h3>
            <p className="text-xs text-slate-400">ডিপোজিট, উত্তোলন ও ব্যালেন্স ম্যানেজমেন্ট</p>
          </div>
        </div>

        {/* Balance Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 border border-slate-800 mb-4 shadow-inner">
          <div className="text-xs font-semibold text-slate-400">মোট ব্যালেন্স</div>
          <div className="text-2xl font-black text-white tabular-nums mt-0.5">৳{totalBalance}</div>

          <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-800/80 text-xs">
            <div>
              <span className="text-slate-400">ডিপোজিট ব্যালেন্স:</span>
              <div className="font-bold text-sky-300 tabular-nums">৳{user.depositBalance}</div>
            </div>
            <div>
              <span className="text-slate-400">উইনিং ব্যালেন্স (Cashout):</span>
              <div className="font-bold text-emerald-400 tabular-nums">৳{user.winningBalance}</div>
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
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
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
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
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
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
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

        {/* Tab 1: EXCLUSIVE NAGAD DEPOSIT (Add Fund) */}
        {activeTab === 'deposit' && (
          <form onSubmit={handleDepositSubmit} className="space-y-3.5">
            {/* Nagad Branded Header Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-600 via-amber-600 to-red-600 p-4 text-white shadow-lg shadow-orange-950/40">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-sm text-white">
                      ৳
                    </span>
                    <div>
                      <h4 className="font-black text-sm tracking-wide">নগদ (Nagad) Send Money</h4>
                      <p className="text-[10px] text-orange-100 font-semibold">অফিসিয়াল পার্সোনাল একাউন্ট</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-white/20 backdrop-blur-md text-white font-extrabold px-2 py-0.5 rounded-full uppercase">
                    Personal
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-black/35 backdrop-blur-md border border-white/20 mt-2 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-orange-200 font-medium block">
                      সেন্ড মানি করার নাম্বার:
                    </span>
                    <span className="text-lg font-black font-mono tracking-wider text-white">
                      01317857373
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText('01317857373');
                      setCopiedKey('nagad-official');
                      setTimeout(() => setCopiedKey(null), 2000);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white text-orange-700 hover:bg-orange-50 font-black text-xs shadow-md active:scale-95 transition-all cursor-pointer"
                  >
                    {copiedKey === 'nagad-official' ? (
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

              {/* Decorative background glow */}
              <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />
            </div>

            {/* Quick Step Guide */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1 text-slate-300">
              <div className="font-bold text-amber-400 text-[11px] mb-1">
                টাকা পাঠানোর সঠিক নিয়ম:
              </div>
              <p className="text-[11px] leading-relaxed">
                ১. আপনার <strong>নগদ অ্যাপ</strong> অথবা <strong>*167#</strong> ডায়াল করে <strong>Send Money</strong> করুন।
              </p>
              <p className="text-[11px] leading-relaxed">
                ২. প্রাপক নাম্বার হিসেবে <strong>01317857373</strong> দিন।
              </p>
              <p className="text-[11px] leading-relaxed">
                ৩. টাকা পাঠানো সম্পন্ন হলে নিচের ফর্মে আপনার <strong>নগদ নাম্বার</strong> ও ফিরতি মেসেজের <strong>Transaction ID (TrxID)</strong> দিয়ে সাবমিট দিন।
              </p>
            </div>

            {/* Quick Amount Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                টাকার পরিমাণ নির্বাচন করুন (BDT):
              </label>
              <div className="grid grid-cols-5 gap-1.5 mb-2">
                {[50, 100, 200, 300, 500].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDepositAmount(amt)}
                    className={`py-1.5 rounded-lg text-xs font-black transition-all ${
                      depositAmount === amt
                        ? 'bg-orange-500 text-white shadow-sm'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    ৳{amt}
                  </button>
                ))}
              </div>

              <input
                type="number"
                min="20"
                step="5"
                value={depositAmount}
                onChange={(e) => setDepositAmount(Number(e.target.value))}
                placeholder="অথবা পরিমাণ লিখুন (যেমন: 150)"
                className="w-full text-xs font-bold bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                required
              />
            </div>

            {/* Sender Number Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                যে নগদ নাম্বার থেকে টাকা পাঠিয়েছেন:
              </label>
              <input
                type="text"
                value={depositPhone}
                onChange={(e) => setDepositPhone(e.target.value)}
                placeholder="যেমন: 01XXXXXXXXX"
                className="w-full text-xs font-mono bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                required
              />
            </div>

            {/* Transaction ID Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                নগদ ট্রানজেকশন আইডি (Transaction ID / TrxID):
              </label>
              <input
                type="text"
                value={depositTrxId}
                onChange={(e) => setDepositTrxId(e.target.value)}
                placeholder="যেমন: 7NJ89K2P"
                className="w-full text-xs font-mono uppercase bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-amber-300 font-bold focus:outline-none focus:border-orange-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-black text-xs shadow-lg shadow-orange-900/40 cursor-pointer active:scale-98 transition-all mt-2"
            >
              নগদ ডিপোজিট রিকোয়েস্ট সাবমিট করুন
            </button>
          </form>
        )}

        {/* Tab 2: WITHDRAW */}
        {activeTab === 'withdraw' && (
          <form onSubmit={handleWithdrawSubmit} className="space-y-3">
            <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-600/30 text-[11px] text-emerald-300">
              উইনিং ব্যালেন্স থেকে উত্তোলন করা যাবে। সর্বনিম্ন উত্তোলন ৫০ টাকা। টাকা পাঠাতে সর্বোচ্চ ১০-৩০ মিনিট সময় লাগে।
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                টাকা গ্রহণের মেথড:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['bKash', 'Nagad', 'Rocket'] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setWithdrawMethod(method)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
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

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                উত্তোলনের পরিমাণ (৳):
              </label>
              <input
                type="number"
                min="50"
                max={user.winningBalance}
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                className="w-full text-xs font-bold bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                required
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                সর্বোচ্চ তুলতে পারবেন: ৳{user.winningBalance}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                আপনার {withdrawMethod} নাম্বার:
              </label>
              <input
                type="text"
                value={withdrawPhone}
                onChange={(e) => setWithdrawPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full text-xs font-mono bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={user.winningBalance < 50}
              className={`w-full py-3 rounded-xl font-extrabold text-xs shadow-md transition-all mt-2 ${
                user.winningBalance >= 50
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white cursor-pointer active:scale-98 shadow-emerald-900/40'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              উত্তোলন রিকোয়েস্ট পাঠান
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
