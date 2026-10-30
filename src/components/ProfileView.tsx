import React, { useState, useEffect } from 'react';
import { useTournament } from '../context/TournamentContext';
import {
  Wallet,
  BadgeDollarSign,
  User,
  CheckSquare,
  TrendingUp,
  Code2,
  ChevronRight,
  X,
  CheckCircle,
  ShieldAlert,
  Edit2,
  Phone,
  Sparkles,
  Share2,
  Copy,
  Check,
} from 'lucide-react';

interface ProfileViewProps {
  onOpenWallet: () => void;
  onOpenWithdraw: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onOpenWallet, onOpenWithdraw }) => {
  const { user, topPlayers, settings, updateProfile, logoutUser } = useTournament();

  const [activeModal, setActiveModal] = useState<
    'rules' | 'topPlayers' | 'developer' | 'editProfile' | 'refer' | null
  >(null);
  const [copiedReferral, setCopiedReferral] = useState(false);

  // Edit Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [uid, setUid] = useState(user?.freeFireUid || '');
  const [profileSaved, setProfileSaved] = useState(false);

  // Keep state in sync if user changes
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setUsername(user.username || '');
      setPhone(user.phone || '');
      setUid(user.freeFireUid || '');
    }
  }, [user]);

  if (!user) {
    return (
      <div className="w-full p-8 text-center text-slate-400">
        <p>প্রোফাইল দেখতে অনুগ্রহ করে প্রথমে লগইন করুন।</p>
      </div>
    );
  }

  const totalBalance = (user.depositBalance || 0) + (user.winningBalance || 0);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      username,
      phone,
      freeFireUid: uid,
    });
    setProfileSaved(true);
    setTimeout(() => {
      setProfileSaved(false);
      setActiveModal(null);
    }, 1500);
  };

  return (
    <div className="w-full pb-24 animate-fadeIn">
      {/* Top Profile Sky Blue Card matching Image 3 strictly */}
      <div className="w-full bg-gradient-to-b from-[#38b6ff] via-[#1d8cf8] to-[#1264c5] px-4 pt-6 pb-6 text-white text-center shadow-lg">
        {/* Yellow Avatar Circle */}
        <div className="relative mx-auto w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 p-1 shadow-md flex items-center justify-center">
          <div className="w-full h-full rounded-full bg-amber-100 flex items-center justify-center overflow-hidden">
            {/* Gamer graphic portrait */}
            <div className="w-12 h-12 rounded-full bg-amber-400 relative flex items-center justify-center font-black text-amber-950 text-xl uppercase">
              {user.username ? user.username.charAt(0) : <User className="w-8 h-8 text-amber-900" />}
            </div>
          </div>
          <button
            onClick={() => setActiveModal('editProfile')}
            className="absolute bottom-0 right-0 p-1.5 rounded-full bg-white text-blue-600 shadow cursor-pointer hover:scale-110 transition-transform"
            title="Edit Profile"
          >
            <Edit2 className="w-3 h-3 stroke-[2.5]" />
          </button>
        </div>

        {/* Username */}
        <h2 className="text-xl font-bold tracking-tight mt-2 text-white">
          {user.username}
        </h2>
        {user.email && (
          <p className="text-xs text-sky-100/80 font-mono mt-0.5">{user.email}</p>
        )}
        {user.freeFireUid && (
          <p className="text-xs text-sky-100/90 font-mono mt-0.5">UID: {user.freeFireUid}</p>
        )}
        {user.registeredAt && (
          <p className="text-[10px] text-sky-200/70 mt-0.5">রেজিস্ট্রেশন: {user.registeredAt}</p>
        )}

        {/* 3 Stats Columns strictly matching screenshot */}
        <div className="grid grid-cols-3 gap-2 mt-5 pt-3 border-t border-white/20 items-center text-center">
          <div>
            <div className="text-lg font-black text-white tabular-nums">{user.matchesJoined || 0}</div>
            <div className="text-[11px] font-medium text-sky-100 mt-0.5 leading-tight">
              ম্যাচ জয়েন করেছেন
            </div>
          </div>

          <div className="border-x border-white/20">
            <div className="text-lg font-black text-white tabular-nums tracking-wide">
              BDT {totalBalance}
            </div>
            <div className="text-[11px] font-medium text-sky-100 mt-0.5 leading-tight">
              মোট ব্যালেন্স
            </div>
          </div>

          <div>
            <div className="text-lg font-black text-white tabular-nums">{user.totalWonBDT || 0}</div>
            <div className="text-[11px] font-medium text-sky-100 mt-0.5 leading-tight">
              এখন পর্যন্ত জিতেছেন
            </div>
          </div>
        </div>
      </div>

      {/* Menu List Items strictly matching Screenshot 3 (Left) */}
      <div className="p-4 max-w-xl mx-auto space-y-2">
        {/* 1. My Wallet */}
        <button
          onClick={onOpenWallet}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-sky-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-500 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-slate-800 dark:text-slate-100">My Wallet</span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">ব্যালেন্স এড ও হিস্ট্রি দেখুন</p>
            </div>
          </div>
          <span className="text-xs font-black text-sky-500 tabular-nums">৳{totalBalance}</span>
        </button>

        {/* 2. Withdraw */}
        <button
          onClick={onOpenWithdraw}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-sky-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-500 flex items-center justify-center">
              <BadgeDollarSign className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-slate-800 dark:text-slate-100">Withdraw</span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                টাকা বিকাশ/নগদে উত্তোলন করুন
              </p>
            </div>
          </div>
          <span className="text-xs font-black text-emerald-500 tabular-nums">৳{totalBalance}</span>
        </button>

        {/* 3. Refer and Earn (New item from screenshot 3) */}
        <button
          onClick={() => setActiveModal('refer')}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-sky-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-500 flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-slate-800 dark:text-slate-100">Refer and Earn</span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">বন্ধুদের রেফার করে বোনাস জিতুন</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* 4. My Profile */}
        <button
          onClick={() => setActiveModal('editProfile')}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-sky-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-500 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-slate-800 dark:text-slate-100">My Profile</span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">নাম, UID ও একাউন্ট তথ্য</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* 5. App Rules */}
        <button
          onClick={() => setActiveModal('rules')}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-sky-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-500 flex items-center justify-center">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-slate-800 dark:text-slate-100">App Rules</span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">টুর্নামেন্টের যাবতীয় নিয়মাবলী</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* 6. Developer Profile */}
        <button
          onClick={() => setActiveModal('developer')}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-sky-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-500 flex items-center justify-center">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
                Developer Profile
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                অ্যাপ ডেভেলপার ও অফিসিয়াল তথ্য
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* 7. Edit Profile */}
        <button
          onClick={() => setActiveModal('editProfile')}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-sky-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-500 flex items-center justify-center">
              <Edit2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
                Edit Profile
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                প্রোফাইল তথ্য ও পাসওয়ার্ড আপডেট
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* 8. Logout Button matching Screenshot 3 blue pill */}
        <div className="pt-4">
          <button
            onClick={() => {
              if (confirm('আপনি কি নিশ্চিত যে আপনি লগআউট করতে চান?')) {
                logoutUser();
              }
            }}
            className="w-full py-3.5 rounded-full bg-[#1d8cf8] hover:bg-[#1264c5] text-white font-extrabold text-sm shadow-md shadow-sky-500/30 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* MODAL 1: RULES */}
      {activeModal === 'rules' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 text-slate-100 p-5 shadow-2xl my-6">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <CheckSquare className="w-5 h-5 text-emerald-400" />
              <h3 className="font-black text-base text-white">{settings.siteName} টুর্নামেন্ট রুলস</h3>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300 max-h-80 overflow-y-auto pr-1">
              {settings.rules && settings.rules.length > 0 ? (
                settings.rules.map((rule, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <h4 className="font-bold text-amber-400 mb-1">নিয়ম #{idx + 1}</h4>
                    <p>{rule}</p>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-center py-4">কোনো রুলস যোগ করা হয়নি।</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: TOP PLAYERS */}
      {activeModal === 'topPlayers' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 text-slate-100 p-5 shadow-2xl my-6">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              <h3 className="font-black text-base text-white">টপ প্লেয়ার লিডারবোর্ড</h3>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {topPlayers.map((player) => (
                <div
                  key={player.rank}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-black flex items-center justify-center text-xs">
                      #{player.rank}
                    </span>
                    <div>
                      <span className="font-extrabold text-white">{player.name}</span>
                      <div className="text-[10px] text-slate-400 font-mono">UID: {player.uid}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-black text-amber-400 tabular-nums">৳{player.wonBDT}</div>
                    <div className="text-[10px] text-emerald-400">{player.kills} Kills</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: DEVELOPER PROFILE */}
      {activeModal === 'developer' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 text-slate-100 p-5 shadow-2xl my-6 text-center">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-purple-600 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-sky-500/20">
              <Code2 className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-black text-white">{settings.siteName} Official</h3>
            <p className="text-xs text-sky-400 font-semibold mt-0.5">{settings.logoText}</p>
            <p className="text-xs text-slate-400 mt-2 px-2">
              {settings.siteName} হলো বাংলাদেশের বিশ্বস্ত ফ্রি ফায়ার কাস্টম টুর্নামেন্ট ও ডায়মন্ড টপআপ প্ল্যাটফর্ম।
            </p>

            <div className="mt-4 p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Developer & Management:</span>
                <span className="font-bold text-white">{settings.siteName} Team</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Official Helpline:</span>
                <span className="font-mono text-amber-300">{settings.helplinePhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">WhatsApp:</span>
                <span className="font-mono text-emerald-400">{settings.whatsappNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Telegram Channel:</span>
                <span className="text-sky-400 font-semibold">{settings.telegramUsername}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Support Email:</span>
                <span className="text-slate-300 font-mono text-[11px]">{settings.supportEmail}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: EDIT PROFILE */}
      {activeModal === 'editProfile' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 text-slate-100 p-5 shadow-2xl my-6">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-black text-base text-white mb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-sky-400" />
              <span>প্রোফাইল তথ্য পরিবর্তন করুন</span>
            </h3>

            {profileSaved && (
              <div className="p-3 rounded-xl bg-emerald-950 border border-emerald-600 text-emerald-200 text-xs mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>প্রোফাইল সফলভাবে আপডেট হয়েছে!</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">পূর্ণ নাম:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">ইউজারনেম:</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  ফ্রি ফায়ার প্লেয়ার UID:
                </label>
                <input
                  type="text"
                  value={uid}
                  onChange={(e) => setUid(e.target.value)}
                  className="w-full font-mono bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">মোবাইল নাম্বার:</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full font-mono bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-extrabold text-xs shadow-md shadow-sky-900/40 cursor-pointer transition-all mt-2"
              >
                সংরক্ষণ করুন (Save Profile)
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: REFER AND EARN */}
      {activeModal === 'refer' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 text-slate-100 p-5 shadow-2xl my-6">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Share2 className="w-5 h-5 text-sky-400" />
              <h3 className="font-black text-base text-white">রেফার অ্যান্ড আর্ন (Refer & Earn)</h3>
            </div>

            <div className="bg-sky-950/40 border border-sky-800/40 rounded-2xl p-4 text-center mb-4">
              <p className="text-xs text-sky-200 mb-1">আপনার রেফারেল কোড</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="font-mono font-black text-2xl text-sky-400 tracking-widest bg-slate-950/80 px-4 py-2 rounded-xl border border-sky-500/30">
                  {user.username?.toUpperCase() || 'LG'}{user.id?.slice(-4) || '77'}
                </span>
                <button
                  onClick={() => {
                    const code = `${user.username?.toUpperCase() || 'LG'}${user.id?.slice(-4) || '77'}`;
                    navigator.clipboard.writeText(code);
                    setCopiedReferral(true);
                    setTimeout(() => setCopiedReferral(false), 2000);
                  }}
                  className="p-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white transition-all shadow-md cursor-pointer"
                  title="Copy Code"
                >
                  {copiedReferral ? <Check className="w-5 h-5 text-white" /> : <Copy className="w-5 h-5 text-white" />}
                </button>
              </div>
              {copiedReferral && (
                <p className="text-xs text-emerald-400 font-semibold mt-2">রেফার কোড কপি হয়েছে!</p>
              )}
            </div>

            <div className="space-y-2 text-xs text-slate-300 bg-slate-950/50 p-3.5 rounded-2xl border border-slate-800">
              <p className="font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                কীভাবে বোনাস পাবেন?
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li>বন্ধুদের সাথে অ্যাপটির লিঙ্ক ও রেফার কোড শেয়ার করুন।</li>
                <li>আপনার বন্ধু সাইন আপ করার সময় রেফার কোড ব্যবহার করলে উভয়েই পাবেন বিশেষ ওয়েলকাম বোনাস!</li>
                <li>যত বেশি রেফার করবেন, তত বেশি ফ্রি টুর্নামেন্ট খেলার সুযোগ!</li>
              </ul>
            </div>

            <button
              onClick={() => {
                const code = `${user.username?.toUpperCase() || 'LG'}${user.id?.slice(-4) || '77'}`;
                const shareText = `${settings.siteName} টুর্নামেন্ট খেলে টাকা জিতুন! আমার রেফার কোড: ${code}\nএখনই জয়েন করুন: ${window.location.origin}`;
                if (navigator.share) {
                  navigator.share({
                    title: settings.siteName,
                    text: shareText,
                    url: window.location.origin,
                  }).catch(() => {});
                } else {
                  navigator.clipboard.writeText(shareText);
                  setCopiedReferral(true);
                  setTimeout(() => setCopiedReferral(false), 2000);
                }
              }}
              className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-extrabold text-sm shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              <span>বন্ধুদের সাথে শেয়ার করুন</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
