import React, { useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import { DiamondPackage } from '../types';
import { PAYMENT_NUMBERS } from '../data/initialData';
import { Gem, ShieldCheck, Zap, X, Copy, Check, CheckCircle, AlertCircle } from 'lucide-react';

export const ShopView: React.FC = () => {
  const { diamondPackages, user, buyDiamondTopup } = useTournament();
  const [selectedPkg, setSelectedPkg] = useState<DiamondPackage | null>(null);
  const [playerUid, setPlayerUid] = useState(user.freeFireUid || '');
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad' | 'Rocket'>('bKash');
  const [senderPhone, setSenderPhone] = useState(user.phone || '');
  const [trxId, setTrxId] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleCopy = (num: string, key: string) => {
    const clean = num.split(' ')[0].replace('-', '');
    navigator.clipboard.writeText(clean);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handlePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPkg) return;
    setFeedback(null);

    const res = buyDiamondTopup(selectedPkg, playerUid, paymentMethod, trxId, senderPhone);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setTrxId('');
      setTimeout(() => {
        setSelectedPkg(null);
        setFeedback(null);
      }, 2500);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  return (
    <div className="w-full pb-24 animate-fadeIn">
      {/* Shop Header */}
      <div className="p-4 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Gem className="w-6 h-6 text-cyan-400 animate-pulse" />
          <h2 className="text-xl font-black text-white tracking-tight uppercase">
            ডায়মন্ড টপ-আপ শপ (Top-Up Shop)
          </h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          সবচেয়ে কম মূল্যে Free Fire ডায়মন্ড ও মেম্বারশিপ টপ-আপ করুন সরাসরি প্লেয়ার আইডি (UID) দিয়ে।
        </p>
      </div>

      {/* Package Grid */}
      <div className="p-4 max-w-2xl mx-auto space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
          <span>জনপ্রিয় প্যাকেজ সমূহ</span>
          <span className="text-cyan-400 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" />
            <span>ইনস্ট্যান্ট ডেলিভারি</span>
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {diamondPackages.map((pkg) => (
            <div
              key={pkg.id}
              onClick={() => {
                setSelectedPkg(pkg);
                setFeedback(null);
              }}
              className="relative group p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/80 shadow-md hover:shadow-cyan-500/10 transition-all cursor-pointer flex flex-col justify-between active:scale-98"
            >
              {pkg.popular && (
                <span className="absolute -top-2 right-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-full shadow">
                  HOT DEAL
                </span>
              )}

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-cyan-950/80 border border-cyan-700/50 flex items-center justify-center text-cyan-400 shadow-inner">
                    <Gem className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xs text-white leading-tight">{pkg.title}</h3>
                    <p className="text-[10px] text-cyan-300 font-semibold">{pkg.diamonds} Diamonds</p>
                  </div>
                </div>

                {pkg.bonus && (
                  <div className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded w-fit mb-2">
                    +{pkg.bonus} বোনাস ডায়মন্ড
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 mt-2">
                <span className="text-base font-black text-white tabular-nums">৳{pkg.priceBDT}</span>
                <span className="text-[11px] font-bold text-cyan-400 group-hover:text-cyan-300">
                  কিনুন →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Purchase Modal */}
      {selectedPkg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 text-slate-100 p-5 shadow-2xl my-6">
            <button
              onClick={() => setSelectedPkg(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-600 flex items-center justify-center text-cyan-400">
                <Gem className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">{selectedPkg.title}</h3>
                <p className="text-xs text-cyan-300 font-bold">মূল্য: ৳{selectedPkg.priceBDT}</p>
              </div>
            </div>

            {feedback && (
              <div
                className={`p-3 rounded-xl text-xs mb-3 flex items-center gap-2 ${
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

            <form onSubmit={handlePurchase} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ফ্রি ফায়ার প্লেয়ার UID:
                </label>
                <input
                  type="text"
                  value={playerUid}
                  onChange={(e) => setPlayerUid(e.target.value)}
                  placeholder="যেমন: 592817342"
                  className="w-full text-xs font-mono bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">পেমেন্ট মেথড:</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['bKash', 'Nagad', 'Rocket'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      className={`py-1.5 rounded-lg text-xs font-bold border ${
                        paymentMethod === m
                          ? 'border-cyan-500 bg-cyan-500/20 text-white'
                          : 'border-slate-800 bg-slate-950 text-slate-400'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Number to send money */}
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <span className="text-[11px] text-slate-400">
                  নিচের নাম্বারে ৳{selectedPkg.priceBDT} Send Money করুন:
                </span>
                <div className="flex items-center justify-between font-mono font-bold text-amber-300 mt-1">
                  <span className="truncate">{PAYMENT_NUMBERS[paymentMethod]}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(PAYMENT_NUMBERS[paymentMethod], 'shop-num')}
                    className="p-1 hover:bg-slate-800 rounded text-slate-300 ml-2 shrink-0"
                  >
                    {copiedKey === 'shop-num' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  আপনার বিকাশ/নগদ নাম্বার:
                </label>
                <input
                  type="text"
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full text-xs font-mono bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ট্রানজেকশন আইডি (TrxID):
                </label>
                <input
                  type="text"
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value)}
                  placeholder="যেমন: BKL891729304"
                  className="w-full text-xs font-mono uppercase bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>অর্ডার করার ৫-১০ মিনিটের মধ্যে আপনার আইডিতে ডায়মন্ড যোগ হবে।</span>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs shadow-lg shadow-cyan-900/40 cursor-pointer active:scale-98 transition-all"
              >
                অর্ডার নিশ্চিত করুন (Confirm Order)
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
