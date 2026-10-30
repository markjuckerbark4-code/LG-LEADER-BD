import React, { useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import { X, Wallet, ArrowDownRight, ArrowUpRight, Copy, Check, Clock, CheckCircle, AlertCircle, Coins } from 'lucide-react';

interface WalletModalProps {
  onClose: () => void;
  defaultTab?: 'deposit' | 'withdraw' | 'history';
}

export const WalletModal: React.FC<WalletModalProps> = ({ onClose, defaultTab = 'deposit' }) => {
  const { user, transactions, settings, submitDeposit, submitWithdraw } = useTournament();
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'history'>(defaultTab);

  // Deposit Form State
  const [depositMethod, setDepositMethod] = useState<'bKash' | 'Nagad' | 'Rocket'>('bKash');
  const [depositAmount, setDepositAmount] = useState<number>(100);
  const [depositTrxId, setDepositTrxId] = useState('');
  const [depositPhone, setDepositPhone] = useState(user?.phone || '');

  // Withdraw Form State
  const [withdrawMethod, setWithdrawMethod] = useState<'bKash' | 'Nagad' | 'Rocket'>('bKash');
  const [withdrawAmount, setWithdrawAmount] = useState<number>(50);
  const [withdrawPhone, setWithdrawPhone] = useState(user?.phone || '');

  // Feedback State
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Dynamic deposit & withdraw limits from Website Settings
  const minDeposit = settings.minDeposit ?? 50;
  const maxDeposit = settings.maxDeposit ?? 25000;
  const minWithdraw = settings.minWithdraw ?? 50;
  const maxWithdrawPerDay = settings.maxWithdrawPerDay ?? 1000;

  // Unified single balance (Winning account and Main account)
  const totalBalance = user ? (user.depositBalance || 0) + (user.winningBalance || 0) : 0;

  // Daily withdraw limit calculations
  const today = new Date().toDateString();
  const todayWithdrawn = transactions
    .filter((t) => {
      if (t.userId !== user?.id || t.type !== 'withdraw' || t.status === 'rejected') return false;
      const d = new Date(t.date);
      return !isNaN(d.getTime()) && d.toDateString() === today;
    })
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const remainingDailyLimit = Math.max(0, maxWithdrawPerDay - todayWithdrawn);
  const maxCanWithdraw = Math.min(totalBalance, remainingDailyLimit);

  // Method details matching Screenshot 3
  const getMethodDetails = (method: 'bKash' | 'Nagad' | 'Rocket') => {
    switch (method) {
      case 'bKash':
        return {
          name: 'bKash',
          bnName: 'বিকাশ',
          number: settings.bKashNumber || '01317857373',
          note: settings.bKashNote || 'Personal - Send Money',
          boxBg: 'bg-[#d81b60]',
          btnBg: 'bg-[#ad1457] hover:bg-[#880e4f]',
          tag: 'bKash Send Money',
          logoColor: 'text-[#d81b60]',
        };
      case 'Rocket':
        return {
          name: 'Rocket',
          bnName: 'রকেট',
          number: settings.rocketNumber || '01317857373',
          note: settings.rocketNote || 'Personal - Send Money',
          boxBg: 'bg-[#7c3aed]',
          btnBg: 'bg-[#6d28d9] hover:bg-[#5b21b6]',
          tag: 'Rocket Send Money',
          logoColor: 'text-purple-400',
        };
      default:
        return {
          name: 'Nagad',
          bnName: 'নগদ',
          number: settings.nagadNumber || '01317857373',
          note: settings.nagadNote || 'Personal - Send Money',
          boxBg: 'bg-[#ea580c]',
          btnBg: 'bg-[#c2410c] hover:bg-[#9a3412]',
          tag: 'Nagad Send Money',
          logoColor: 'text-orange-500',
        };
    }
  };

  const currentDepositMethodDetails = getMethodDetails(depositMethod);

  const handleCopyNumber = (num: string, key: string) => {
    const cleanNum = num.split(' ')[0].replace(/[^0-9]/g, '');
    navigator.clipboard.writeText(cleanNum);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    if (depositAmount < minDeposit) {
      setFeedback({ type: 'error', message: `সর্বনিম্ন ডিপোজিট ৳${minDeposit} টাকা।` });
      return;
    }
    if (maxDeposit > 0 && depositAmount > maxDeposit) {
      setFeedback({ type: 'error', message: `একবারে সর্বোচ্চ ডিপোজিট ৳${maxDeposit} টাকা।` });
      return;
    }
    const res = submitDeposit(depositMethod, Number(depositAmount), depositTrxId, depositPhone);
    if (res.success) {
      setFeedback({
        type: 'success',
        message: `${currentDepositMethodDetails.name} ডিপোজিট রিকোয়েস্ট সফলভাবে জমা হয়েছে! অ্যাডমিন প্যানেলে পাঠানো হয়েছে, দ্রুত ব্যালেন্স যোগ হবে।`,
      });
      setDepositTrxId('');
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    if (withdrawAmount < minWithdraw) {
      setFeedback({ type: 'error', message: `সর্বনিম্ন উত্তোলন ৳${minWithdraw} টাকা।` });
      return;
    }
    if (withdrawAmount > remainingDailyLimit) {
      setFeedback({
        type: 'error',
        message: `দৈনিক সর্বোচ্চ উত্তোলন ৳${maxWithdrawPerDay} টাকা। আজ আপনি আর সর্বোচ্চ ৳${remainingDailyLimit} তুলতে পারবেন।`,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 p-4 sm:p-5 shadow-2xl my-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center shadow-inner">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-lg text-white tracking-tight">{settings.siteName} ওয়ালেট</h3>
            <p className="text-[11px] text-slate-400">টাকা জমা, উত্তোলন ও লেনদেন ইতিহাস</p>
          </div>
        </div>

        {/* Segmented Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-2xl mb-4 border border-slate-800/80">
          <button
            onClick={() => {
              setActiveTab('deposit');
              setFeedback(null);
            }}
            className={`flex-1 py-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'deposit'
                ? 'bg-[#d81b60] text-white shadow-md'
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
            className={`flex-1 py-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'withdraw'
                ? 'bg-amber-500 text-white shadow-md'
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
            className={`flex-1 py-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'history'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>হিস্ট্রি</span>
          </button>
        </div>

        {/* Feedback alert */}
        {feedback && (
          <div
            className={`p-3 rounded-2xl text-xs mb-3 flex items-center gap-2 ${
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
            <span className="font-semibold">{feedback.message}</span>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 1: DEPOSIT - Strictly matching Screenshot 3 (Middle) */}
        {/* ======================================================== */}
        {activeTab === 'deposit' && (
          <form onSubmit={handleDepositSubmit} className="space-y-3.5">
            {/* Top Gateway Selector Cards */}
            <div className="grid grid-cols-3 gap-2">
              {(['bKash', 'Nagad', 'Rocket'] as const).map((method) => {
                const isSelected = depositMethod === method;
                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setDepositMethod(method)}
                    className={`relative py-3 px-2 rounded-2xl flex flex-col items-center justify-center gap-1 border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white text-slate-900 border-white shadow-lg ring-2 ring-white/20'
                        : 'bg-slate-950/90 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">
                        ✓
                      </span>
                    )}
                    <span
                      className={`text-sm font-black ${
                        method === 'bKash'
                          ? 'text-[#d81b60]'
                          : method === 'Nagad'
                          ? 'text-[#ea580c]'
                          : 'text-purple-600'
                      }`}
                    >
                      {method}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500">
                      {method === 'bKash' ? 'বিকাশ' : method === 'Nagad' ? 'নগদ' : 'রকেট'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Branded Instruction Box strictly matching Screenshot 3 (Middle) */}
            <div
              className={`rounded-2xl ${currentDepositMethodDetails.boxBg} p-4 text-white shadow-xl transition-all space-y-3`}
            >
              <div className="text-center">
                <h4 className="font-black text-sm tracking-wide">Verify your payment</h4>
                <p className="text-[11px] text-white/90 font-medium mt-0.5">
                  Verify your mobile number / Send Money
                </p>
              </div>

              {/* Number display box with COPY button */}
              <div className="bg-black/25 backdrop-blur-sm rounded-xl p-3 border border-white/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-white/80 block font-semibold">
                    {currentDepositMethodDetails.name} পার্সোনাল নাম্বার:
                  </span>
                  <span className="text-lg font-black font-mono tracking-wider text-white">
                    {currentDepositMethodDetails.number}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleCopyNumber(currentDepositMethodDetails.number, `dep-${depositMethod}`)
                  }
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white text-slate-900 hover:bg-slate-100 font-black text-xs shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  {copiedKey === `dep-${depositMethod}` ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                      <span>কপি হয়েছে</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-800" />
                      <span>কপি</span>
                    </>
                  )}
                </button>
              </div>

              {/* Step instructions with bullet dots */}
              <div className="space-y-1.5 text-[11px] text-white/95">
                <div className="flex items-start gap-1.5">
                  <span className="text-amber-300 font-black">•</span>
                  <span>
                    উপরে দেওয়া নাম্বারে <strong>Send Money</strong> করুন। (সর্বনিম্ন ৳{minDeposit})
                  </span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-amber-300 font-black">•</span>
                  <span>টাকা পাঠানোর পর ট্রানজেকশন আইডি (TrxID) ও আপনার নাম্বার নিচে দিন।</span>
                </div>
              </div>
            </div>

            {/* Input 1: Sender Mobile Number */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                যে নাম্বার থেকে টাকা পাঠিয়েছেন (Sender Mobile):
              </label>
              <input
                type="text"
                value={depositPhone}
                onChange={(e) => setDepositPhone(e.target.value)}
                placeholder="যেমন: 01XXXXXXXXX"
                className="w-full text-xs font-mono bg-white text-slate-900 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500 font-semibold"
                required
              />
            </div>

            {/* Input 2: Amount (with quick selector pills) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-300">
                  ডিপোজিট পরিমাণ (সর্বনিম্ন ৳{minDeposit}):
                </label>
                <span className="text-[10px] text-amber-400 font-extrabold">Min: ৳{minDeposit}</span>
              </div>
              <div className="flex items-center gap-1.5 mb-2 overflow-x-auto pb-0.5">
                {[minDeposit, 100, 200, 500, 1000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDepositAmount(amt)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all cursor-pointer shrink-0 ${
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
                min={minDeposit}
                max={maxDeposit}
                value={depositAmount}
                onChange={(e) => setDepositAmount(Number(e.target.value))}
                placeholder={`টাকার পরিমাণ (যেমন: ${minDeposit})`}
                className="w-full text-xs font-mono bg-white text-slate-900 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500 font-semibold"
                required
              />
            </div>

            {/* Input 3: Transaction ID */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                ট্রানজেকশন আইডি (Transaction ID / TrxID):
              </label>
              <input
                type="text"
                value={depositTrxId}
                onChange={(e) => setDepositTrxId(e.target.value)}
                placeholder="TrxID দিন (যেমন: 7NJ89K2P)"
                className="w-full text-xs font-mono uppercase bg-white text-slate-900 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500 font-black tracking-wide"
                required
              />
            </div>

            {/* VERIFY Action Button strictly matching Screenshot 3 (Middle) */}
            <button
              type="submit"
              className={`w-full py-3.5 rounded-xl ${currentDepositMethodDetails.btnBg} text-white font-black text-sm tracking-wider uppercase shadow-xl shadow-pink-950/40 active:scale-98 transition-all cursor-pointer`}
            >
              VERIFY (ডিপোজিট সাবমিট)
            </button>
          </form>
        )}

        {/* ======================================================== */}
        {/* TAB 2: WITHDRAW - Strictly matching Screenshot 3 (Right) */}
        {/* ======================================================== */}
        {activeTab === 'withdraw' && (
          <form onSubmit={handleWithdrawSubmit} className="space-y-4">
            {/* Top Available Balance Card strictly matching Screenshot 3 (Right) */}
            <div className="bg-white rounded-2xl p-4 text-center shadow-lg border border-slate-100 flex flex-col items-center justify-center">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Available Balance
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                <Coins className="w-5 h-5 text-emerald-600" />
                <span className="text-2xl font-black text-slate-900 tabular-nums">
                  ৳{totalBalance}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400 font-medium">
                <span>মেইন একাউন্ট: ৳{user?.depositBalance || 0}</span>
                <span>•</span>
                <span>গেম একাউন্ট: ৳{user?.winningBalance || 0}</span>
              </div>
            </div>

            {/* Gateway Selector Cards strictly matching Screenshot 3 (Right) */}
            <div className="grid grid-cols-3 gap-2">
              {(['bKash', 'Nagad', 'Rocket'] as const).map((method) => {
                const isSelected = withdrawMethod === method;
                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setWithdrawMethod(method)}
                    className={`py-3 px-2 rounded-2xl flex flex-col items-center justify-center gap-1 border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 text-amber-400 font-black shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span
                      className={`text-sm font-black ${
                        method === 'bKash'
                          ? 'text-[#d81b60]'
                          : method === 'Nagad'
                          ? 'text-[#ea580c]'
                          : 'text-purple-400'
                      }`}
                    >
                      {method}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      {method === 'bKash' ? 'বিকাশ' : method === 'Nagad' ? 'নগদ' : 'রকেট'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Input 1: Mobile number */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Mobile number:
              </label>
              <input
                type="text"
                value={withdrawPhone}
                onChange={(e) => setWithdrawPhone(e.target.value)}
                placeholder="Mobile number"
                className="w-full text-xs font-mono bg-white text-slate-900 border border-slate-300 rounded-xl px-3.5 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
                required
              />
            </div>

            {/* Input 2: Withdraw Amount */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Withdraw Amount:
              </label>
              <input
                type="number"
                min={minWithdraw}
                max={maxCanWithdraw}
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                placeholder="Withdraw amount"
                className="w-full text-xs font-mono bg-white text-slate-900 border border-slate-300 rounded-xl px-3.5 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 font-black"
                required
              />
              {/* Dynamic limit notice strictly matching screenshot */}
              <p className="text-[11px] text-center text-amber-400 font-semibold mt-1.5">
                Withdraw amount must be {minWithdraw} - {remainingDailyLimit}
              </p>
            </div>

            {/* WITHDRAW Button strictly matching Screenshot 3 (Right) */}
            <button
              type="submit"
              disabled={
                totalBalance < minWithdraw ||
                remainingDailyLimit < minWithdraw ||
                withdrawAmount < minWithdraw ||
                withdrawAmount > maxCanWithdraw
              }
              className={`w-full py-3.5 rounded-full font-black text-sm tracking-wider uppercase shadow-xl transition-all ${
                totalBalance >= minWithdraw &&
                remainingDailyLimit >= minWithdraw &&
                withdrawAmount >= minWithdraw &&
                withdrawAmount <= maxCanWithdraw
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white cursor-pointer active:scale-98 shadow-orange-950/40'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              WITHDRAW
            </button>
          </form>
        )}

        {/* ======================================================== */}
        {/* TAB 3: TRANSACTION HISTORY */}
        {/* ======================================================== */}
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
                      <div className="text-[10px] font-mono text-amber-400/90 mt-0.5">
                        Trx: {tx.trxId}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-black text-sm tabular-nums ${
                        tx.type === 'deposit' || tx.type === 'match_prize'
                          ? 'text-emerald-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {tx.type === 'deposit' || tx.type === 'match_prize' ? '+' : '-'}৳{tx.amount}
                    </span>
                    <div>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                          tx.status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : tx.status === 'pending'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : 'bg-red-500/20 text-red-400 border border-red-500/40'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </div>
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
