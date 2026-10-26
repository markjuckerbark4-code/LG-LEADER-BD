import React, { useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import { PAYMENT_NUMBERS } from '../data/initialData';
import { X, Wallet, ArrowDownRight, ArrowUpRight, Copy, Check, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface WalletModalProps {
  onClose: () => void;
  defaultTab?: 'deposit' | 'withdraw' | 'history';
}

export const WalletModal: React.FC<WalletModalProps> = ({ onClose, defaultTab = 'deposit' }) => {
  const { user, transactions, submitDeposit, submitWithdraw } = useTournament();
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'history'>(defaultTab);

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
    const res = submitDeposit(depositMethod, Number(depositAmount), depositTrxId, depositPhone);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
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

        {/* Tab 1: DEPOSIT */}
        {activeTab === 'deposit' && (
          <form onSubmit={handleDepositSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                পেমেন্ট মেথড নির্বাচন করুন:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['bKash', 'Nagad', 'Rocket'] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setDepositMethod(method)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      depositMethod === method
                        ? 'border-sky-500 bg-sky-500/20 text-white shadow-sm'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {/* Instruction & Number */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <div className="text-[11px] text-slate-400 mb-1">
                নিচের নাম্বারে <span className="text-amber-400 font-bold">Send Money</span> করুন:
              </div>
              <div className="flex items-center justify-between font-mono font-bold text-amber-300 bg-black/50 p-2 rounded-lg">
                <span className="truncate">{PAYMENT_NUMBERS[depositMethod]}</span>
                <button
                  type="button"
                  onClick={() => handleCopyNumber(PAYMENT_NUMBERS[depositMethod], 'dep-num')}
                  className="p-1 hover:bg-slate-800 rounded text-slate-300 ml-2 shrink-0"
                  title="Copy Number"
                >
                  {copiedKey === 'dep-num' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  টাকার পরিমাণ (BDT):
                </label>
                <input
                  type="number"
                  min="20"
                  step="5"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  className="w-full text-xs font-bold bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  প্রেরকের বিকাশ/নগদ নং:
                </label>
                <input
                  type="text"
                  value={depositPhone}
                  onChange={(e) => setDepositPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full text-xs font-mono bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                ট্রানজেকশন আইডি (TrxID):
              </label>
              <input
                type="text"
                value={depositTrxId}
                onChange={(e) => setDepositTrxId(e.target.value)}
                placeholder="যেমন: BKL891729304"
                className="w-full text-xs font-mono uppercase bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-extrabold text-xs shadow-md shadow-sky-900/40 cursor-pointer active:scale-98 transition-all mt-2"
            >
              টাকা এড করার রিকোয়েস্ট পাঠান
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
