import React, { useState } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { TournamentMatch, GameCategory } from '../../types';
import {
  ShieldCheck,
  Trophy,
  ArrowDownRight,
  ArrowUpRight,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Key,
  ExternalLink,
  Users,
  Bell,
  RefreshCw,
  Search,
  Gem,
  Award,
} from 'lucide-react';

interface AdminPanelProps {
  onBackToApp: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBackToApp }) => {
  const {
    matches,
    categories,
    transactions,
    notice,
    createMatch,
    updateMatchRoom,
    completeMatch,
    deleteMatch,
    approveDeposit,
    rejectDeposit,
    approveWithdraw,
    rejectWithdraw,
    updateNotice,
    resetAllData,
  } = useTournament();

  const [activeTab, setActiveTab] = useState<'matches' | 'deposits' | 'withdrawals' | 'notice' | 'diamonds'>('matches');

  // Match creation form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCategoryId, setNewCategoryId] = useState('cs-4v4');
  const [newTitle, setNewTitle] = useState('');
  const [newMatchNumber, setNewMatchNumber] = useState(matches.length + 101);
  const [newEntryFee, setNewEntryFee] = useState(50);
  const [newPerKill, setNewPerKill] = useState(15);
  const [newTotalPrize, setNewTotalPrize] = useState(300);
  const [newMap, setNewMap] = useState<'Bermuda' | 'Purgatory' | 'Kalahari' | 'Nexterra' | 'Iron Cage'>('Bermuda');
  const [newMatchType, setNewMatchType] = useState<'Solo' | 'Duo' | 'Squad' | '4 VS 4' | '1 VS 1' | '1 HP Mode'>('4 VS 4');
  const [newScheduleTime, setNewScheduleTime] = useState('Today at 10:00 PM');
  const [newTotalSlots, setNewTotalSlots] = useState(8);

  // Room details popup state
  const [roomModalMatch, setRoomModalMatch] = useState<TournamentMatch | null>(null);
  const [roomIdInput, setRoomIdInput] = useState('');
  const [roomPassInput, setRoomPassInput] = useState('');

  // Complete match popup state
  const [completeModalMatch, setCompleteModalMatch] = useState<TournamentMatch | null>(null);
  const [winnerNameInput, setWinnerNameInput] = useState('');
  const [winnerUidInput, setWinnerUidInput] = useState('');
  const [winnerPrizeInput, setWinnerPrizeInput] = useState(300);
  const [winnerKillsInput, setWinnerKillsInput] = useState(6);

  // Notice edit state
  const [noticeInput, setNoticeInput] = useState(notice);
  const [noticeSaved, setNoticeSaved] = useState(false);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Stats calculation
  const pendingDeposits = transactions.filter((t) => t.type === 'deposit' && t.status === 'pending');
  const pendingWithdraws = transactions.filter((t) => t.type === 'withdraw' && t.status === 'pending');
  const diamondOrders = transactions.filter((t) => t.type === 'diamond_topup');
  const totalJoinedPlayersCount = matches.reduce((acc, m) => acc + m.joinedPlayers.length, 0);

  const handleCreateMatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cat = categories.find((c) => c.id === newCategoryId);
    const categoryName = cat ? cat.name : 'CS 4 VS 4';

    createMatch({
      categoryId: newCategoryId,
      categoryName,
      title: newTitle || `LG LEADER BD - ${categoryName} Cash Match #${newMatchNumber}`,
      matchNumber: Number(newMatchNumber),
      entryFee: Number(newEntryFee),
      perKill: Number(newPerKill),
      totalPrize: Number(newTotalPrize),
      map: newMap,
      matchType: newMatchType,
      version: 'Mobile Only',
      scheduleTime: newScheduleTime,
      totalSlots: Number(newTotalSlots),
      rules: [
        'Mobile only. Emulator or PC strictly banned.',
        'Take screenshot of result and keep UID ready.',
      ],
    });

    setShowCreateModal(false);
    setNewTitle('');
    setNewMatchNumber((prev) => prev + 1);
  };

  const handleSaveRoomDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomModalMatch) return;
    updateMatchRoom(roomModalMatch.id, roomIdInput, roomPassInput);
    setRoomModalMatch(null);
  };

  const handleSaveCompleteMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!completeModalMatch) return;
    completeMatch(
      completeModalMatch.id,
      winnerNameInput,
      winnerUidInput,
      Number(winnerPrizeInput),
      Number(winnerKillsInput)
    );
    setCompleteModalMatch(null);
  };

  const handleSaveNotice = (e: React.FormEvent) => {
    e.preventDefault();
    updateNotice(noticeInput);
    setNoticeSaved(true);
    setTimeout(() => setNoticeSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      {/* Top Admin Navigation Header */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-sm sm:text-base text-white tracking-tight uppercase">
                LG LEADER BD Admin Panel
              </h1>
              <span className="text-[10px] bg-red-600/30 text-red-300 border border-red-500/40 px-2 py-0.5 rounded-full font-mono font-bold">
                /admin
              </span>
            </div>
            <p className="text-[11px] text-slate-400">সুপার এডমিন কন্ট্রোল ড্যাশবোর্ড</p>
          </div>
        </div>

        {/* Back to Client App Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={onBackToApp}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md shadow-sky-900/30 cursor-pointer active:scale-95 transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>ইউজার অ্যাপে যান</span>
          </button>
        </div>
      </header>

      {/* Main Admin Container */}
      <main className="max-w-6xl mx-auto p-4 space-y-6">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>মোট টুর্নামেন্ট</span>
              <Trophy className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white tabular-nums mt-1">
              {matches.length}
            </div>
            <div className="text-[11px] text-emerald-400 font-medium mt-0.5">
              {matches.filter((m) => m.status === 'upcoming').length} টি আসন্ন ম্যাচ
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>জয়েন প্লেয়ার</span>
              <Users className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white tabular-nums mt-1">
              {totalJoinedPlayersCount}
            </div>
            <div className="text-[11px] text-sky-400 font-medium mt-0.5">মোট স্লট বুকিং</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>পেন্ডিং ডিপোজিট</span>
              <ArrowDownRight className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 tabular-nums mt-1">
              {pendingDeposits.length}
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">যাচাইয়ের অপেক্ষায়</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>পেন্ডিং উইথড্র</span>
              <ArrowUpRight className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-rose-400 tabular-nums mt-1">
              {pendingWithdraws.length}
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">টাকা পাঠানোর অপেক্ষায়</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-2xl border border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('matches')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'matches'
                ? 'bg-amber-500 text-slate-950 font-black shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>ম্যাচ ম্যানেজমেন্ট ({matches.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('deposits')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'deposits'
                ? 'bg-emerald-500 text-slate-950 font-black shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>ডিপোজিট রিকোয়েস্ট</span>
            {pendingDeposits.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-black flex items-center justify-center">
                {pendingDeposits.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'withdrawals'
                ? 'bg-rose-500 text-white font-black shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>উইথড্র রিকোয়েস্ট</span>
            {pendingWithdraws.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-400 text-black text-[9px] font-black flex items-center justify-center">
                {pendingWithdraws.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('diamonds')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'diamonds'
                ? 'bg-cyan-500 text-slate-950 font-black shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Gem className="w-3.5 h-3.5" />
            <span>টপ-আপ অর্ডার ({diamondOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('notice')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'notice'
                ? 'bg-sky-500 text-white font-black shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>নোটিশ এডিটর</span>
          </button>
        </div>

        {/* TAB 1: MATCH MANAGEMENT */}
        {activeTab === 'matches' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ম্যাচের নাম বা ক্যাটাগরি সার্চ করুন..."
                  className="w-full text-xs bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md cursor-pointer transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>নতুন ম্যাচ যুক্ত করুন</span>
                </button>

                <button
                  onClick={() => {
                    if (confirm('সব টুর্নামেন্ট ও ব্যালেন্স প্রাথমিক অবস্থায় রিসেট করতে চান?')) {
                      resetAllData();
                    }
                  }}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white"
                  title="Reset demo data"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Match List Table / Cards */}
            <div className="space-y-3">
              {matches
                .filter(
                  (m) =>
                    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    m.categoryName.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((m) => (
                  <div
                    key={m.id}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                          {m.categoryName}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">Match #{m.matchNumber}</span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                            m.status === 'completed'
                              ? 'bg-emerald-950 text-emerald-300'
                              : m.roomId
                              ? 'bg-amber-950 text-amber-300 animate-pulse'
                              : 'bg-sky-950 text-sky-300'
                          }`}
                        >
                          {m.status}
                        </span>
                      </div>

                      <h3 className="font-extrabold text-sm sm:text-base text-white">{m.title}</h3>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <span>সময়: <strong className="text-slate-200">{m.scheduleTime}</strong></span>
                        <span>ম্যাপ: <strong className="text-slate-200">{m.map}</strong></span>
                        <span>ফি: <strong className="text-amber-400">৳{m.entryFee}</strong></span>
                        <span>প্রাইজ: <strong className="text-sky-400">৳{m.totalPrize}</strong></span>
                        <span>স্লট: <strong className="text-white">{m.joinedPlayers.length}/{m.totalSlots}</strong></span>
                      </div>

                      {/* Room ID status */}
                      <div className="text-xs pt-1">
                        {m.roomId ? (
                          <span className="text-amber-300 font-mono font-bold">
                            Room ID: {m.roomId} | Pass: {m.roomPassword || 'None'}
                          </span>
                        ) : (
                          <span className="text-slate-500 italic">রুম আইডি এখনো দেওয়া হয়নি</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => {
                          setRoomModalMatch(m);
                          setRoomIdInput(m.roomId || '');
                          setRoomPassInput(m.roomPassword || '');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Key className="w-3.5 h-3.5" />
                        <span>রুম আইডি দিন</span>
                      </button>

                      {m.status !== 'completed' && (
                        <button
                          onClick={() => {
                            setCompleteModalMatch(m);
                            setWinnerNameInput(m.joinedPlayers[0]?.gamerName || '');
                            setWinnerUidInput(m.joinedPlayers[0]?.uid || '');
                            setWinnerPrizeInput(m.totalPrize);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>উইনার ঘোষণা</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          if (confirm(`ম্যাচ "${m.title}" ডিলিট করতে চান?`)) {
                            deleteMatch(m.id);
                          }
                        }}
                        className="p-2 rounded-lg bg-red-950/40 hover:bg-red-900/40 text-red-400 border border-red-800/40"
                        title="Delete Match"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* TAB 2: DEPOSITS APPROVAL */}
        {activeTab === 'deposits' && (
          <div className="space-y-3">
            <h3 className="font-extrabold text-sm text-slate-300">
              বিকাশ / নগদ ডিপোজিট রিকোয়েস্ট তালিকা ({transactions.filter((t) => t.type === 'deposit').length})
            </h3>

            {transactions.filter((t) => t.type === 'deposit').length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">কোনো ডিপোজিট রিকোয়েস্ট নেই।</p>
            ) : (
              transactions
                .filter((t) => t.type === 'deposit')
                .map((tx) => (
                  <div
                    key={tx.id}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-white">{tx.userName}</span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                          {tx.method}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            tx.status === 'approved'
                              ? 'bg-emerald-950 text-emerald-300'
                              : tx.status === 'pending'
                              ? 'bg-amber-950 text-amber-300 animate-pulse'
                              : 'bg-red-950 text-red-300'
                          }`}
                        >
                          {tx.status}
                        </span>
                      </div>

                      <div className="text-xs text-slate-400 mt-1 space-x-2">
                        <span>নাম্বার: <strong className="font-mono text-slate-200">{tx.phone}</strong></span>
                        <span>TrxID: <strong className="font-mono text-amber-300">{tx.trxId}</strong></span>
                        <span>তারিখ: {tx.date}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-lg font-black text-emerald-400 tabular-nums">৳{tx.amount}</div>
                      </div>

                      {tx.status === 'pending' && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => approveDeposit(tx.id)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>এপ্রুভ করুন</span>
                          </button>

                          <button
                            onClick={() => rejectDeposit(tx.id)}
                            className="px-3 py-1.5 rounded-lg bg-red-900/60 hover:bg-red-800 text-red-200 font-bold text-xs flex items-center gap-1 cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>বাতিল</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
            )}
          </div>
        )}

        {/* TAB 3: WITHDRAWALS APPROVAL */}
        {activeTab === 'withdrawals' && (
          <div className="space-y-3">
            <h3 className="font-extrabold text-sm text-slate-300">
              উত্তোলন (Cashout) রিকোয়েস্ট তালিকা ({transactions.filter((t) => t.type === 'withdraw').length})
            </h3>

            {transactions.filter((t) => t.type === 'withdraw').length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">কোনো উইথড্র রিকোয়েস্ট নেই।</p>
            ) : (
              transactions
                .filter((t) => t.type === 'withdraw')
                .map((tx) => (
                  <div
                    key={tx.id}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-white">{tx.userName}</span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                          {tx.method}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            tx.status === 'approved'
                              ? 'bg-emerald-950 text-emerald-300'
                              : tx.status === 'pending'
                              ? 'bg-rose-950 text-rose-300'
                              : 'bg-red-950 text-red-300'
                          }`}
                        >
                          {tx.status}
                        </span>
                      </div>

                      <div className="text-xs text-slate-400 mt-1">
                        টাকা পাঠানোর নাম্বার: <strong className="font-mono text-emerald-400 text-sm">{tx.phone}</strong>
                      </div>
                      <div className="text-[11px] text-slate-500">{tx.date}</div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-lg font-black text-rose-400 tabular-nums">৳{tx.amount}</div>
                      </div>

                      {tx.status === 'pending' && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => approveWithdraw(tx.id)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>টাকা পাঠিয়েছি (Paid)</span>
                          </button>

                          <button
                            onClick={() => rejectWithdraw(tx.id)}
                            className="px-3 py-1.5 rounded-lg bg-red-900/60 hover:bg-red-800 text-red-200 font-bold text-xs flex items-center gap-1 cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>রিজেক্ট ও রিফান্ড</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
            )}
          </div>
        )}

        {/* TAB 4: DIAMOND ORDERS */}
        {activeTab === 'diamonds' && (
          <div className="space-y-3">
            <h3 className="font-extrabold text-sm text-slate-300">
              ডায়মন্ড টপআপ অর্ডার ({diamondOrders.length})
            </h3>

            {diamondOrders.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">কোনো টপ-আপ অর্ডার নেই।</p>
            ) : (
              diamondOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-white text-sm">{order.note || 'Diamond Top-Up'}</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      TrxID: <span className="font-mono text-amber-300">{order.trxId}</span> · Method: {order.method}
                    </div>
                    <div className="text-[11px] text-slate-500">{order.date}</div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-black text-cyan-400">৳{order.amount}</div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold">
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 5: NOTICE EDITOR */}
        {activeTab === 'notice' && (
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 max-w-2xl space-y-4">
            <div>
              <h3 className="font-extrabold text-base text-white">অ্যাপের রানিং নোটিশ (Marquee Bar)</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                এখানে যে টেক্সট লিখবেন তা সমস্ত ব্যবহারকারীর হোমপেজে স্ক্রোলিং আকারে প্রদর্শিত হবে।
              </p>
            </div>

            {noticeSaved && (
              <div className="p-3 rounded-xl bg-emerald-950 border border-emerald-600 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>নোটিশ সফলভাবে আপডেট হয়েছে!</span>
              </div>
            )}

            <form onSubmit={handleSaveNotice} className="space-y-3">
              <textarea
                rows={4}
                value={noticeInput}
                onChange={(e) => setNoticeInput(e.target.value)}
                className="w-full text-xs bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-sky-500"
                required
              />

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-extrabold text-xs shadow-md cursor-pointer"
              >
                নোটিশ সেভ করুন
              </button>
            </form>
          </div>
        )}
      </main>

      {/* MODAL: CREATE MATCH */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 p-5 shadow-2xl my-6">
            <h3 className="font-black text-base text-white mb-3">নতুন টুর্নামেন্ট ম্যাচ তৈরি করুন</h3>

            <form onSubmit={handleCreateMatchSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">ক্যাটাগরি নির্বাচন করুন:</label>
                <select
                  value={newCategoryId}
                  onChange={(e) => setNewCategoryId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">ম্যাচের নাম / শিরোনাম:</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="যেমন: LG LEADER BD - CS 4v4 Bermuda Cash Match #105"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">এন্ট্রি ফি (৳):</label>
                  <input
                    type="number"
                    value={newEntryFee}
                    onChange={(e) => setNewEntryFee(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">প্রতি কিল (৳):</label>
                  <input
                    type="number"
                    value={newPerKill}
                    onChange={(e) => setNewPerKill(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">মোট প্রাইজ (৳):</label>
                  <input
                    type="number"
                    value={newTotalPrize}
                    onChange={(e) => setNewTotalPrize(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">ম্যাপ:</label>
                  <select
                    value={newMap}
                    onChange={(e) => setNewMap(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Bermuda">Bermuda</option>
                    <option value="Purgatory">Purgatory</option>
                    <option value="Kalahari">Kalahari</option>
                    <option value="Iron Cage">Iron Cage</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">ম্যাচ টাইপ:</label>
                  <select
                    value={newMatchType}
                    onChange={(e) => setNewMatchType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="4 VS 4">4 VS 4</option>
                    <option value="Solo">Solo</option>
                    <option value="Squad">Squad</option>
                    <option value="1 VS 1">1 VS 1</option>
                    <option value="1 HP Mode">1 HP Mode</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">মোট স্লট:</label>
                  <input
                    type="number"
                    value={newTotalSlots}
                    onChange={(e) => setNewTotalSlots(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">ম্যাচ শিডিউল টাইম:</label>
                <input
                  type="text"
                  value={newScheduleTime}
                  onChange={(e) => setNewScheduleTime(e.target.value)}
                  placeholder="যেমন: Today at 10:30 PM"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black"
                >
                  ম্যাচ তৈরি করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SET ROOM ID & PASS */}
      {roomModalMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700 p-5 shadow-2xl">
            <h3 className="font-black text-sm text-white mb-2 flex items-center gap-1.5">
              <Key className="w-4 h-4 text-amber-400" />
              <span>রুম আইডি ও পাসওয়ার্ড প্রকাশ করুন</span>
            </h3>
            <p className="text-xs text-slate-400 mb-3">{roomModalMatch.title}</p>

            <form onSubmit={handleSaveRoomDetails} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Room ID:</label>
                <input
                  type="text"
                  value={roomIdInput}
                  onChange={(e) => setRoomIdInput(e.target.value)}
                  placeholder="যেমন: 7891234"
                  className="w-full font-mono bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-amber-300 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Room Password:</label>
                <input
                  type="text"
                  value={roomPassInput}
                  onChange={(e) => setRoomPassInput(e.target.value)}
                  placeholder="যেমন: 123"
                  className="w-full font-mono bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-amber-300 font-bold"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRoomModalMatch(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black"
                >
                  রুম পাবলিশ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: COMPLETE MATCH & DECLARE WINNER */}
      {completeModalMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700 p-5 shadow-2xl">
            <h3 className="font-black text-sm text-white mb-2 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>উইনার ঘোষণা ও প্রাইজ প্রদান</span>
            </h3>
            <p className="text-xs text-slate-400 mb-3">{completeModalMatch.title}</p>

            <form onSubmit={handleSaveCompleteMatch} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">উইনার গেমার নাম (IGN):</label>
                <input
                  type="text"
                  value={winnerNameInput}
                  onChange={(e) => setWinnerNameInput(e.target.value)}
                  placeholder="যেমন: Mahinn"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">উইনার Free Fire UID:</label>
                <input
                  type="text"
                  value={winnerUidInput}
                  onChange={(e) => setWinnerUidInput(e.target.value)}
                  placeholder="যেমন: 592817342"
                  className="w-full font-mono bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">প্রাইজ মানি (৳):</label>
                  <input
                    type="number"
                    value={winnerPrizeInput}
                    onChange={(e) => setWinnerPrizeInput(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-emerald-400 font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">মোট কিল:</label>
                  <input
                    type="number"
                    value={winnerKillsInput}
                    onChange={(e) => setWinnerKillsInput(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCompleteModalMatch(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black"
                >
                  উইনার কনফার্ম করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
