import React, { useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import { DiamondPackage } from '../types';
import { Gem, ShieldCheck, Zap, X, Copy, Check, CheckCircle, AlertCircle } from 'lucide-react';

export const ShopView: React.FC = () => {
  const { diamondPackages, user, settings, buyDiamondTopup } = useTournament();
  const [selectedPkg, setSelectedPkg] = useState<DiamondPackage | null>(null);
  const [playerUid, setPlayerUid] = useState(user?.freeFireUid || '');
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad' | 'Rocket'>('bKash');
  const [senderPhone, setSenderPhone] = useState(user?.phone || '');
  const [trxId, setTrxId] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const paymentNumbersMap = {
    bKash: `${settings.bKashNumber} (${settings.bKashNote || 'Personal - Send Money'})`,
    Nagad: `${settings.nagadNumber} (${settings.nagadNote || 'Personal - Send Money'})`,
    Rocket: `${settings.rocketNumber} (${settings.rocketNote || 'Personal - Send Money'})`,
  };

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
    <div className="w-full pb-24 min-h-screen bg-[#f8fafc] text-slate-900 animate-fadeIn">
      {/* Shop Header */}
      <div className="p-4 bg-white border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Gem className="w-6 h-6 text-cyan-600 animate-pulse" />
          <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">
            ডায়মন্ড টপ-আপ শপ (Top-Up Shop)
          </h2>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          সবচেয়ে কম মূল্যে Free Fire ডায়মন্ড ও মেম্বারশিপ টপ-আপ করুন সরাসরি প্লেয়ার আইডি (UID) দিয়ে।
        </p>
      </div>

      {/* Package Grid */}
      <div className="p-4 max-w-2xl mx-auto space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
          <span>জনপ্রিয় প্যাকেজ সমূহ</span>
          <span className="text-cyan-700 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-cyan-600" />
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
              className="relative group p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-cyan-500 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between active:scale-98"
            >
              {pkg.popular && (
                <span className="absolute -top-2 right-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-full shadow">
                  HOT DEAL
                </span>
              )}

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600 shadow-inner">
                    <Gem className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xs text-slate-900 leading-tight">{pkg.title}</h3>
                    <p className="text-[10px] text-cyan-700 font-semibold">{pkg.diamonds} Diamonds</p>
                  </div>
                </div>

                {pkg.bonus && (
                  <div className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded w-fit mb-2">
                    +{pkg.bonus} বোনাস ডায়মন্ড
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2">
                <span className="text-base font-black text-slate-900 tabular-nums">৳{pkg.priceBDT}</span>
                <span className="text-[11px] font-bold text-cyan-600 group-hover:text-cyan-700">
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
          <div className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200 text-slate-900 p-5 shadow-2xl my-6">
            <button
              onClick={() => setSelectedPkg(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600">
                <Gem className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">ডায়মন্ড অর্ডার</h3>
                <p className="text-xs text-slate-500">
                  {selectedPkg.title} ({selectedPkg.diamonds} Diamonds)
                </p>
              </div>
            </div>

            {feedback && (
              <div
                className={`p-3 rounded-xl text-xs mb-4 flex items-center gap-2 ${
                  feedback.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{feedback.message}</span>
              </div>
            )}

            <form onSubmit={handlePurchase} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  আপনার Free Fire Player UID:
                </label>
                <input
                  type="text"
                  value={playerUid}
                  onChange={(e) => setPlayerUid(e.target.value)}
                  placeholder="যেমন: 2849182391"
                  className="w-full font-mono bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  পেমেন্ট মেথড সিলেক্ট করুন:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['bKash', 'Nagad', 'Rocket'] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`py-2 rounded-xl font-bold border transition-all cursor-pointer ${
                        paymentMethod === method
                          ? 'border-cyan-500 bg-cyan-50 text-cyan-800'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] text-slate-500 mb-1">
                  সেন্ড মানি করার নাম্বার ({paymentMethod}):
                </div>
                <div className="flex items-center justify-between font-mono font-bold text-slate-900">
                  <span>{paymentNumbersMap[paymentMethod]}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(paymentNumbersMap[paymentMethod], 'topup')}
                    className="flex items-center gap-1 text-[11px] text-cyan-600 hover:text-cyan-700 cursor-pointer"
                  >
                    {copiedKey === 'topup' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedKey === 'topup' ? 'কপি হয়েছে' : 'কপি'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  যে নাম্বার থেকে টাকা পাঠিয়েছেন:
                </label>
                <input
                  type="text"
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  placeholder="যেমন: 01XXXXXXXXX"
                  className="w-full font-mono bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ট্রানজেকশন আইডি (TrxID):
                </label>
                <input
                  type="text"
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value)}
                  placeholder="যেমন: 9J28A01"
                  className="w-full font-mono uppercase bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="p-2.5 rounded-xl bg-cyan-50 border border-cyan-200 text-[11px] text-cyan-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-600 shrink-0" />
                <span>অর্ডার সাবমিট করার ৫-১০ মিনিটের মধ্যে আপনার আইডিতে ডায়মন্ড চলে যাবে।</span>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer mt-2"
              >
                টপ-আপ নিশ্চিত করুন (৳{selectedPkg.priceBDT})
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
