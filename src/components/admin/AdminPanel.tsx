import React, { useState } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { TournamentMatch, MatchResultEntry, UserProfile } from '../../types';
import {
  Trophy,
  Users,
  CreditCard,
  Key,
  BarChart2,
  Settings,
  Plus,
  Edit,
  Trash2,
  Archive,
  Ban,
  CheckCircle,
  XCircle,
  ExternalLink,
  Search,
  Clock,
  Shield,
  Eye,
  EyeOff,
  AlertTriangle,
  FileText,
  DollarSign,
  Phone,
  MessageSquare,
  Send,
  Save,
  Check,
  Award,
  Lock,
  LogOut,
} from 'lucide-react';

interface AdminPanelProps {
  onBackToApp: () => void;
}

type AdminTab =
  | 'tournaments'
  | 'players'
  | 'payments'
  | 'room'
  | 'results'
  | 'settings';

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBackToApp }) => {
  const {
    matches,
    categories,
    players,
    transactions,
    settings,
    createMatch,
    editMatch,
    cancelMatch,
    deleteMatch,
    archiveMatch,
    updatePlayerStatus,
    adjustPlayerBalance,
    approveDeposit,
    rejectDeposit,
    approveWithdraw,
    rejectWithdraw,
    setRoomDetailsWithTiming,
    publishResults,
    updateSettings,
  } = useTournament();

  // Admin Password Protection: mahin44@@
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('lg_admin_auth_v1') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'mahin44@@') {
      sessionStorage.setItem('lg_admin_auth_v1', 'true');
      setIsAuthenticated(true);
      setPasswordError('');
    } else {
      setPasswordError('ভুল পাসওয়ার্ড! সঠিক অ্যাডমিন পাসওয়ার্ড প্রদান করুন।');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('lg_admin_auth_v1');
    setIsAuthenticated(false);
    setPasswordInput('');
    setPasswordError('');
  };

  const [activeTab, setActiveTab] = useState<AdminTab>('tournaments');

  // Search & Filter states
  const [tournamentSearch, setTournamentSearch] = useState('');
  const [tournamentFilter, setTournamentFilter] = useState<'all' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled' | 'archived'>('all');
  const [playerSearch, setPlayerSearch] = useState('');
  const [selectedPlayerForView, setSelectedPlayerForView] = useState<UserProfile | null>(null);

  // Tournament Create / Edit Modal State
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  const [matchForm, setMatchForm] = useState<{
    categoryId: string;
    title: string;
    matchNumber: number;
    entryFee: number;
    perKill: number;
    totalPrize: number;
    map: TournamentMatch['map'];
    matchType: TournamentMatch['matchType'];
    version: TournamentMatch['version'];
    scheduleTime: string;
    totalSlots: number;
    status: TournamentMatch['status'];
    rules: string[];
  }>({
    categoryId: 'cs-4v4',
    title: '',
    matchNumber: 101,
    entryFee: 50,
    perKill: 15,
    totalPrize: 320,
    map: 'Bermuda',
    matchType: '4 VS 4',
    version: 'Mobile Only',
    scheduleTime: 'Today at 09:30 PM',
    totalSlots: 8,
    status: 'upcoming',
    rules: [
      'শুধুমাত্র মোবাইল ডিভাইস অনুমোদিত। পিসি বা এমুলেটর সম্পূর্ণ ব্যান।',
      'গান প্রপার্টি অফ, ক্যারেক্টার স্কিল অফ।',
      'ম্যাচ শুরুর ১০ মিনিট পূর্বে রুম আইডি ও পাসওয়ার্ড প্রকাশ করা হবে।',
    ],
  });

  // Cancel match modal
  const [cancellingMatch, setCancellingMatch] = useState<TournamentMatch | null>(null);
  const [cancelReasonInput, setCancelReasonInput] = useState('অনিবার্য কারণে ম্যাচটি বাতিল করা হয়েছে এবং এন্ট্রি ফি রিফান্ড করা হলো।');

  // Balance adjustment modal: 3 options (Add, Remove, Edit)
  const [adjustingPlayer, setAdjustingPlayer] = useState<UserProfile | null>(null);
  const [adjustMode, setAdjustMode] = useState<'add' | 'remove' | 'edit'>('add');
  const [adjustAmountInput, setAdjustAmountInput] = useState<number>(100);

  // Payment evidence modal
  const [viewingPaymentTx, setViewingPaymentTx] = useState<any | null>(null);
  const [rejectReasonInput, setRejectReasonInput] = useState('ভুল TrxID বা অ্যাকাউন্টে টাকা ক্রেডিট হয়নি');

  // Room ID & Password Workspace
  const [selectedRoomMatchId, setSelectedRoomMatchId] = useState<string>(matches[0]?.id || '');
  const [roomIdInput, setRoomIdInput] = useState('');
  const [roomPasswordInput, setRoomPasswordInput] = useState('');
  const [roomTimingInput, setRoomTimingInput] = useState<'now' | '10min' | '15min' | 'hidden'>('10min');
  const [isRoomVisibleInput, setIsRoomVisibleInput] = useState<boolean>(true);
  const [roomSavedFeedback, setRoomSavedFeedback] = useState(false);

  // Result Management Workspace
  const [selectedResultMatchId, setSelectedResultMatchId] = useState<string>(matches[0]?.id || '');
  const [resultRows, setResultRows] = useState<MatchResultEntry[]>([]);
  const [resultWinnerName, setResultWinnerName] = useState('');
  const [resultWinnerUid, setResultWinnerUid] = useState('');
  const [resultWinnerPrize, setResultWinnerPrize] = useState(300);
  const [resultWinnerKills, setResultWinnerKills] = useState(6);
  const [resultPublishedSuccess, setResultPublishedSuccess] = useState(false);

  // Website Settings Form State
  const [settingsForm, setSettingsForm] = useState(settings);
  const [newRuleInput, setNewRuleInput] = useState('');
  const [settingsSavedSuccess, setSettingsSavedSuccess] = useState(false);

  // Calculate pending counts
  const pendingDeposits = transactions.filter((t) => t.type === 'deposit' && t.status === 'pending');
  const pendingWithdraws = transactions.filter((t) => t.type === 'withdraw' && t.status === 'pending');

  // When room match changes, prefill room inputs
  const currentRoomMatch = matches.find((m) => m.id === selectedRoomMatchId);
  const handleSelectRoomMatch = (id: string) => {
    setSelectedRoomMatchId(id);
    const m = matches.find((match) => match.id === id);
    if (m) {
      setRoomIdInput(m.roomId || '');
      setRoomPasswordInput(m.roomPassword || '');
      setRoomTimingInput(m.roomReleaseTiming || '10min');
      setIsRoomVisibleInput(m.isRoomVisibleToPlayers ?? !!m.roomId);
    }
  };

  // When result match changes, prefill player rows
  const currentResultMatch = matches.find((m) => m.id === selectedResultMatchId);
  const handleSelectResultMatch = (id: string) => {
    setSelectedResultMatchId(id);
    const m = matches.find((match) => match.id === id);
    if (m) {
      if (m.results && m.results.length > 0) {
        setResultRows(m.results);
        setResultWinnerName(m.winnerName || '');
        setResultWinnerUid(m.winnerUid || '');
        setResultWinnerPrize(m.winnerPrize || m.totalPrize);
        setResultWinnerKills(m.totalKillsWinner || 0);
      } else {
        // Generate rows from joined players
        const generated: MatchResultEntry[] = m.joinedPlayers.map((p, idx) => ({
          playerId: p.userId,
          gamerName: p.gamerName,
          uid: p.uid,
          position: idx + 1,
          kills: idx === 0 ? 5 : Math.max(0, 4 - idx),
          points: idx === 0 ? 15 : Math.max(1, 10 - idx * 2),
          prizeWon: idx === 0 ? m.totalPrize : 0,
        }));
        setResultRows(generated);
        setResultWinnerName(m.joinedPlayers[0]?.gamerName || '');
        setResultWinnerUid(m.joinedPlayers[0]?.uid || '');
        setResultWinnerPrize(m.totalPrize);
        setResultWinnerKills(generated[0]?.kills || 5);
      }
    }
  };

  // Open Create Match Modal
  const handleOpenCreateMatch = () => {
    setEditingMatchId(null);
    setMatchForm({
      categoryId: 'cs-4v4',
      title: '',
      matchNumber: matches.length + 101,
      entryFee: 50,
      perKill: 15,
      totalPrize: 320,
      map: 'Bermuda',
      matchType: '4 VS 4',
      version: 'Mobile Only',
      scheduleTime: 'Today at 09:30 PM',
      totalSlots: 8,
      status: 'upcoming',
      rules: [
        'শুধুমাত্র মোবাইল ডিভাইস অনুমোদিত। পিসি বা এমুলেটর সম্পূর্ণ ব্যান।',
        'গান প্রপার্টি অফ, ক্যারেক্টার স্কিল অফ।',
        'ম্যাচ শুরুর ১০ মিনিট পূর্বে রুম আইডি ও পাসওয়ার্ড প্রকাশ করা হবে।',
      ],
    });
    setIsMatchModalOpen(true);
  };

  // Open Edit Match Modal
  const handleOpenEditMatch = (m: TournamentMatch) => {
    setEditingMatchId(m.id);
    setMatchForm({
      categoryId: m.categoryId,
      title: m.title,
      matchNumber: m.matchNumber,
      entryFee: m.entryFee,
      perKill: m.perKill,
      totalPrize: m.totalPrize,
      map: m.map,
      matchType: m.matchType,
      version: m.version,
      scheduleTime: m.scheduleTime,
      totalSlots: m.totalSlots,
      status: m.status as any,
      rules: m.rules,
    });
    setIsMatchModalOpen(true);
  };

  // Submit Match Form (Create or Edit)
  const handleSubmitMatchForm = (e: React.FormEvent) => {
    e.preventDefault();
    const cat = categories.find((c) => c.id === matchForm.categoryId);
    const categoryName = cat ? cat.name : 'CS 4 VS 4';

    if (editingMatchId) {
      editMatch(editingMatchId, {
        ...matchForm,
        categoryName,
      });
    } else {
      createMatch({
        ...matchForm,
        categoryName,
        title: matchForm.title || `LG LEADER BD - ${categoryName} Match #${matchForm.matchNumber}`,
      });
    }

    setIsMatchModalOpen(false);
  };

  // Cancel match confirmation
  const handleConfirmCancelMatch = () => {
    if (!cancellingMatch) return;
    cancelMatch(cancellingMatch.id, cancelReasonInput);
    setCancellingMatch(null);
  };

  // Save Room Details with Release Timing
  const handleSaveRoomDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomMatchId) return;

    setRoomDetailsWithTiming(
      selectedRoomMatchId,
      roomIdInput,
      roomPasswordInput,
      roomTimingInput,
      isRoomVisibleInput
    );

    setRoomSavedFeedback(true);
    setTimeout(() => setRoomSavedFeedback(false), 2500);
  };

  // Save Match Results
  const handleSaveResults = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResultMatchId) return;

    publishResults(
      selectedResultMatchId,
      resultRows,
      resultWinnerName,
      resultWinnerUid,
      Number(resultWinnerPrize),
      Number(resultWinnerKills)
    );

    setResultPublishedSuccess(true);
    setTimeout(() => setResultPublishedSuccess(false), 2500);
  };

  // Save Website Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(settingsForm);
    setSettingsSavedSuccess(true);
    setTimeout(() => setSettingsSavedSuccess(false), 2500);
  };

  // Add rule in settings
  const handleAddRule = () => {
    if (!newRuleInput.trim()) return;
    setSettingsForm((prev) => ({
      ...prev,
      rules: [...prev.rules, newRuleInput.trim()],
    }));
    setNewRuleInput('');
  };

  // Remove rule in settings
  const handleRemoveRule = (index: number) => {
    setSettingsForm((prev) => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index),
    }));
  };

  // If not authenticated, show password protection screen (Password: mahin44@@)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        {/* Background ambient glow */}
        <div className="absolute w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative w-full max-w-sm rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-7 shadow-2xl backdrop-blur-md">
          {/* Header Icon */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20 mb-3">
              <Lock className="w-7 h-7 text-slate-950" />
            </div>
            <h2 className="text-lg font-black text-white uppercase tracking-tight">
              LG LEADER BD
            </h2>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-xs font-bold text-amber-400">Admin Security Access</span>
              <span className="text-[10px] bg-red-950/80 text-red-400 border border-red-800/80 px-1.5 py-0.5 rounded font-mono font-bold">
                /admin
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              অ্যাডমিন প্যানেলে প্রবেশ করতে পাসওয়ার্ড প্রদান করুন
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                অ্যাডমিন পাসওয়ার্ড:
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (passwordError) setPasswordError('');
                  }}
                  placeholder="Password লিখুন..."
                  autoFocus
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 pr-10 text-white font-mono text-sm focus:outline-none focus:border-amber-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {passwordError && (
                <div className="text-xs text-red-400 font-bold mt-2 flex items-center gap-1.5 bg-red-950/60 p-2 rounded-lg border border-red-800/60">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 active:scale-98 transition-all cursor-pointer uppercase tracking-wider"
            >
              লগইন করুন (Enter Admin)
            </button>

            <button
              type="button"
              onClick={onBackToApp}
              className="w-full py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              ← ওয়েবসাইটে ফিরে যান
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      {/* Top Admin Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20">
            <Shield className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-sm sm:text-base text-white tracking-tight uppercase">
                {settings.siteName} Admin Panel
              </h1>
              <span className="text-[10px] bg-red-600/30 text-red-300 border border-red-500/40 px-2 py-0.5 rounded font-mono font-bold">
                /admin
              </span>
            </div>
            <p className="text-[11px] text-slate-400">মাস্টার টুর্নামেন্ট ও ওয়েবসাইট নিয়ন্ত্রণ কেন্দ্র</p>
          </div>
        </div>

        {/* View User App & Logout Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onBackToApp}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md shadow-sky-900/40 cursor-pointer active:scale-95 transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ইউজার ওয়েবসাইট দেখুন</span>
            <span className="sm:hidden">ওয়েবসাইট</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-700/60 font-bold text-xs shadow cursor-pointer active:scale-95 transition-all"
            title="লগআউট"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>লগআউট</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Real-time Pending Nagad / bKash Payment Alert Notification Banner */}
        {pendingDeposits.length > 0 && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-600/30 via-amber-600/20 to-red-600/30 border border-orange-500/60 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-pulse">
            <div className="flex items-center gap-3">
              <span className="w-3.5 h-3.5 rounded-full bg-orange-400 animate-ping shrink-0" />
              <div>
                <div className="text-sm font-black text-white flex items-center gap-2">
                  <span>🔔 নতুন নগদ (Nagad) ডিপোজিট রিকোয়েস্ট এসেছে!</span>
                  <span className="text-xs font-mono bg-orange-500 text-slate-950 px-2 py-0.5 rounded-full font-black">
                    {pendingDeposits.length} টি পেন্ডিং
                  </span>
                </div>
                <div className="text-xs text-amber-200/90 mt-0.5">
                  ইউজারের প্রেরিত TrxID ও নগদ নাম্বার মিলিয়ে দেখে নিজে যাচাই করে Approve অথবা Reject করুন।
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('payments')}
              className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-black text-xs shadow-md shadow-orange-950/40 cursor-pointer active:scale-95 transition-all shrink-0"
            >
              এখনই যাচাই করুন →
            </button>
          </div>
        )}

        {/* The 6 Core Navigation Tabs strictly requested by user */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 p-1.5 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl">
          <button
            onClick={() => setActiveTab('tournaments')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'tournaments'
                ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span className="truncate">Tournament Control</span>
          </button>

          <button
            onClick={() => setActiveTab('players')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'players'
                ? 'bg-sky-500 text-white font-black shadow-lg shadow-sky-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="truncate">Player Management</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer relative ${
              activeTab === 'payments'
                ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span className="truncate">bKash/Nagad Payment</span>
            {pendingDeposits.length + pendingWithdraws.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-black flex items-center justify-center -top-1 -right-1 sm:static">
                {pendingDeposits.length + pendingWithdraws.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('room')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'room'
                ? 'bg-orange-500 text-white font-black shadow-lg shadow-orange-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Key className="w-4 h-4" />
            <span className="truncate">Room ID ও Pass</span>
          </button>

          <button
            onClick={() => setActiveTab('results')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'results'
                ? 'bg-purple-500 text-white font-black shadow-lg shadow-purple-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span className="truncate">Result Management</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-indigo-500 text-white font-black shadow-lg shadow-indigo-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span className="truncate">Website Settings</span>
          </button>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* MODULE 1: TOURNAMENT CONTROL                                  */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'tournaments' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={tournamentSearch}
                  onChange={(e) => setTournamentSearch(e.target.value)}
                  placeholder="টুর্নামেন্টের নাম বা ক্যাটাগরি সার্চ করুন..."
                  className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenCreateMatch}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 cursor-pointer active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>নতুন টুর্নামেন্ট তৈরি করুন</span>
                </button>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              {(['all', 'upcoming', 'ongoing', 'completed', 'cancelled', 'archived'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setTournamentFilter(status)}
                  className={`px-3 py-1.5 rounded-xl font-bold capitalize transition-all whitespace-nowrap cursor-pointer ${
                    tournamentFilter === status
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {status === 'all' ? 'সব টুর্নামেন্ট' : status}
                </button>
              ))}
            </div>

            {/* Tournament List */}
            <div className="space-y-3">
              {matches
                .filter((m) => {
                  if (tournamentFilter !== 'all' && m.status !== tournamentFilter) return false;
                  if (
                    tournamentSearch &&
                    !m.title.toLowerCase().includes(tournamentSearch.toLowerCase()) &&
                    !m.categoryName.toLowerCase().includes(tournamentSearch.toLowerCase())
                  )
                    return false;
                  return true;
                })
                .map((m) => (
                  <div
                    key={m.id}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                          {m.categoryName}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">Match #{m.matchNumber}</span>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                            m.status === 'completed'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                              : m.status === 'ongoing'
                              ? 'bg-amber-950 text-amber-300 border border-amber-700 animate-pulse'
                              : m.status === 'cancelled'
                              ? 'bg-red-950 text-red-300 border border-red-700'
                              : m.status === 'archived'
                              ? 'bg-slate-800 text-slate-400'
                              : 'bg-sky-950 text-sky-300 border border-sky-700'
                          }`}
                        >
                          {m.status}
                        </span>
                      </div>

                      <h3 className="font-extrabold text-sm sm:text-base text-white">{m.title}</h3>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <span>সময়: <strong className="text-slate-200">{m.scheduleTime}</strong></span>
                        <span>ম্যাপ: <strong className="text-slate-200">{m.map}</strong></span>
                        <span>এন্ট্রি ফি: <strong className="text-amber-400">৳{m.entryFee}</strong></span>
                        <span>টোটাল প্রাইজ: <strong className="text-sky-400">৳{m.totalPrize}</strong></span>
                        <span>স্লট বুকিং: <strong className="text-white">{m.joinedPlayers.length}/{m.totalSlots}</strong></span>
                      </div>

                      {m.cancelReason && (
                        <div className="p-2 rounded-lg bg-red-950/40 border border-red-800/40 text-[11px] text-red-300">
                          বাতিলের কারণ: {m.cancelReason}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons: Edit, Cancel, Delete, Archive */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        onClick={() => handleOpenEditMatch(m)}
                        className="px-3 py-1.5 rounded-lg bg-sky-950 hover:bg-sky-900 text-sky-300 border border-sky-700/60 text-xs font-bold flex items-center gap-1 cursor-pointer"
                        title="Edit Tournament"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      {m.status !== 'cancelled' && m.status !== 'completed' && (
                        <button
                          onClick={() => {
                            setCancellingMatch(m);
                            setCancelReasonInput('অনিবার্য কারণে ম্যাচটি বাতিল করা হয়েছে এবং এন্ট্রি ফি রিফান্ড করা হলো।');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-700/60 text-xs font-bold flex items-center gap-1 cursor-pointer"
                          title="Cancel Tournament"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          <span>Cancel</span>
                        </button>
                      )}

                      <button
                        onClick={() => archiveMatch(m.id)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold cursor-pointer"
                        title="Archive Match"
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`ম্যাচ "${m.title}" ডিলিট করতে চান?`)) {
                            deleteMatch(m.id);
                          }
                        }}
                        className="p-2 rounded-lg bg-red-950/40 hover:bg-red-900/40 text-red-400 border border-red-800/40 cursor-pointer"
                        title="Delete Match"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* MODULE 2: PLAYER MANAGEMENT                                   */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'players' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={playerSearch}
                  onChange={(e) => setPlayerSearch(e.target.value)}
                  placeholder="প্লেয়ারের নাম, ইমেইল, ইউজারনেম, ফোন বা Free Fire UID দিয়ে সার্চ করুন..."
                  className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="text-xs font-bold text-slate-400">
                মোট রেজিস্টার্ড প্লেয়ার / ইউজার: <strong className="text-amber-400">{players.length}</strong> জন
              </div>
            </div>

            {/* Players Table / Directory */}
            {players.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400 space-y-2">
                <Users className="w-10 h-10 mx-auto text-slate-600" />
                <p className="font-bold text-sm text-slate-300">এখনো কোনো প্লেয়ার রেজিস্ট্রেশন করেনি</p>
                <p className="text-xs text-slate-500">
                  ওয়েবসাইটে নতুন কোনো ইউজার রেজিস্ট্রেশন সম্পন্ন করলেই তার তথ্য সাথে সাথে এখানে জমা হবে।
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {players
                  .filter(
                    (p) =>
                      p.name.toLowerCase().includes(playerSearch.toLowerCase()) ||
                      p.username.toLowerCase().includes(playerSearch.toLowerCase()) ||
                      (p.email && p.email.toLowerCase().includes(playerSearch.toLowerCase())) ||
                      (p.phone && p.phone.includes(playerSearch)) ||
                      p.freeFireUid.includes(playerSearch)
                  )
                  .map((p) => {
                    const joinedMatchesList = matches.filter((m) =>
                      m.joinedPlayers.some((jp) => jp.userId === p.id || jp.uid === p.freeFireUid)
                    );

                    return (
                      <div
                        key={p.id}
                        className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-extrabold text-base text-white">{p.username || p.name}</h4>
                              <span className="text-xs font-mono text-sky-400">(@{p.username})</span>
                              <span
                                className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                                  p.status === 'banned'
                                    ? 'bg-red-950 text-red-300 border border-red-700'
                                    : 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                                }`}
                              >
                                {p.status || 'active'}
                              </span>
                            </div>
                            <div className="text-xs text-slate-400 mt-1 space-y-0.5">
                              {p.email && (
                                <div>ইমেইল: <strong className="font-mono text-sky-300">{p.email}</strong></div>
                              )}
                              <div className="flex items-center gap-3">
                                <span>UID: <strong className="font-mono text-amber-300">{p.freeFireUid}</strong></span>
                                {p.phone && <span>ফোন: <strong className="font-mono text-slate-200">{p.phone}</strong></span>}
                              </div>
                              {p.registeredAt && (
                                <div className="text-[10px] text-slate-500">রেজিস্ট্রেশন: {p.registeredAt}</div>
                              )}
                            </div>
                          </div>

                          {/* Ban / Unban Toggle */}
                          <button
                            onClick={() => updatePlayerStatus(p.id, p.status === 'banned' ? 'active' : 'banned')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer shrink-0 ${
                              p.status === 'banned'
                                ? 'bg-emerald-950 text-emerald-300 border-emerald-700 hover:bg-emerald-900'
                                : 'bg-red-950/60 text-red-300 border-red-700/60 hover:bg-red-900'
                            }`}
                          >
                            {p.status === 'banned' ? 'Unban Player' : 'Ban Player'}
                          </button>
                        </div>

                      {/* Balances & Stats (Unified Balance: Main & Winning are one) */}
                      <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs">
                        <div>
                          <div className="text-[10px] text-slate-400">একাউন্ট ব্যালেন্স</div>
                          <div className="font-black text-sm text-emerald-400 tabular-nums">
                            ৳{(p.depositBalance || 0) + (p.winningBalance || 0)}
                          </div>
                        </div>
                        <div className="border-l border-slate-800">
                          <div className="text-[10px] text-slate-400">মোট জয়লাভ (Prize)</div>
                          <div className="font-black text-sm text-amber-400 tabular-nums">৳{p.totalWonBDT || 0}</div>
                        </div>
                      </div>

                      {/* Match Participation List */}
                      <div>
                        <div className="text-[11px] font-bold text-slate-400 mb-1 flex items-center justify-between">
                          <span>টুর্নামেন্ট অংশগ্রহণ ({joinedMatchesList.length})</span>
                          <button
                            onClick={() => {
                              setAdjustingPlayer(p);
                              setAdjustMode('add');
                              setAdjustAmountInput(100);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-sky-950 hover:bg-sky-900 border border-sky-700 text-xs text-sky-300 font-bold cursor-pointer transition-colors"
                          >
                            ⚙️ ব্যালেন্স এডজাস্ট (৩ অপশন)
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto pr-1">
                          {joinedMatchesList.length === 0 ? (
                            <span className="text-[11px] text-slate-500 italic">এখনো কোনো ম্যাচে অংশগ্রহণ করেনি</span>
                          ) : (
                            joinedMatchesList.map((m) => (
                              <span
                                key={m.id}
                                className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 truncate max-w-[180px]"
                                title={m.title}
                              >
                                #{m.matchNumber} {m.categoryName}
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* MODULE 3: bKASH / NAGAD PAYMENT VERIFICATION                 */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'payments' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-white">bKash / Nagad / Rocket পেমেন্ট ভেরিফিকেশন</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  ইউজারের পাঠানো Transaction ID ও তথ্য দেখে নিজে ভেরিফাই করে Approve বা Reject করুন।
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                  পেন্ডিং: {pendingDeposits.length + pendingWithdraws.length} টি
                </span>
              </div>
            </div>

            {/* Transactions List */}
            <div className="space-y-3">
              {transactions.length === 0 ? (
                <p className="text-xs text-slate-500 py-10 text-center">কোনো পেমেন্ট রিকোয়েস্ট নেই।</p>
              ) : (
                transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-white">{tx.userName}</span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                          {tx.method || tx.type}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                            tx.status === 'approved'
                              ? 'bg-emerald-950 text-emerald-300'
                              : tx.status === 'pending'
                              ? 'bg-amber-950 text-amber-300 animate-pulse'
                              : 'bg-red-950 text-red-300'
                          }`}
                        >
                          {tx.status}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">
                          ({tx.type})
                        </span>
                      </div>

                      <div className="text-xs text-slate-300 mt-1 space-x-2">
                        <span>প্রেরকের নাম্বার: <strong className="font-mono text-emerald-400">{tx.phone || 'N/A'}</strong></span>
                        {tx.trxId && (
                          <span>TrxID: <strong className="font-mono text-amber-300 bg-black/40 px-1.5 py-0.5 rounded">{tx.trxId}</strong></span>
                        )}
                        <span>তারিখ: {tx.date}</span>
                      </div>

                      {tx.note && <div className="text-[11px] text-slate-400 italic">নোট: {tx.note}</div>}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div
                          className={`text-lg font-black tabular-nums ${
                            tx.type === 'deposit' ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {tx.type === 'deposit' ? '+' : '-'}৳{tx.amount}
                        </div>
                      </div>

                      {tx.status === 'pending' ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              if (tx.type === 'deposit') approveDeposit(tx.id);
                              else approveWithdraw(tx.id);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>

                          <button
                            onClick={() => {
                              setViewingPaymentTx(tx);
                              setRejectReasonInput('ভুল TrxID বা অ্যাকাউন্টে টাকা ক্রেডিট হয়নি');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-red-900/60 hover:bg-red-800 text-red-200 font-bold text-xs flex items-center gap-1 cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <div className="text-xs font-bold text-slate-500">সম্পন্ন</div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* MODULE 4: ROOM ID & PASSWORD CONTROLLER                       */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'room' && (
          <div className="space-y-4 max-w-3xl mx-auto">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-400" />
                <span>ম্যাচের Room ID, Password ও ভিজিবিলিটি টাইমিং</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                কাস্টম রুম আইডি ও পাসওয়ার্ড কখন এবং কীভাবে প্লেয়াররা দেখতে পারবে তা এখান থেকে নিয়ন্ত্রণ করুন।
              </p>
            </div>

            {roomSavedFeedback && (
              <div className="p-3 rounded-xl bg-emerald-950 border border-emerald-600 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>রুম আইডি ও পাসওয়ার্ড সফলভাবে আপডেট এবং পাবলিশ করা হয়েছে!</span>
              </div>
            )}

            <form onSubmit={handleSaveRoomDetails} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              {/* Select Tournament */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  টুর্নামেন্ট নির্বাচন করুন:
                </label>
                <select
                  value={selectedRoomMatchId}
                  onChange={(e) => handleSelectRoomMatch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-bold text-xs focus:outline-none focus:border-amber-500"
                >
                  {matches.map((m) => (
                    <option key={m.id} value={m.id}>
                      #{m.matchNumber} {m.title} ({m.scheduleTime}) - [{m.status.toUpperCase()}]
                    </option>
                  ))}
                </select>
              </div>

              {/* Room ID and Password inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Custom Room ID:
                  </label>
                  <input
                    type="text"
                    value={roomIdInput}
                    onChange={(e) => setRoomIdInput(e.target.value)}
                    placeholder="যেমন: 7891234"
                    className="w-full font-mono bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-amber-300 font-bold text-sm focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Room Password:
                  </label>
                  <input
                    type="text"
                    value={roomPasswordInput}
                    onChange={(e) => setRoomPasswordInput(e.target.value)}
                    placeholder="যেমন: 1122"
                    className="w-full font-mono bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-amber-300 font-bold text-sm focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              {/* Visibility Timing Settings */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  প্লেয়াররা কখন রুম আইডি দেখতে পারবে? (Release Timing)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'now', label: 'এখনই দেখাও (Visible Now)' },
                    { id: '10min', label: '১০ মিনিট আগে (10 Mins Before)' },
                    { id: '15min', label: '১৫ মিনিট আগে (15 Mins Before)' },
                    { id: 'hidden', label: 'লুকিয়ে রাখো (Hidden)' },
                  ].map((timing) => (
                    <button
                      key={timing.id}
                      type="button"
                      onClick={() => {
                        setRoomTimingInput(timing.id as any);
                        setIsRoomVisibleInput(timing.id === 'now' || timing.id === '10min' || timing.id === '15min');
                      }}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-left ${
                        roomTimingInput === timing.id
                          ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                          : 'border-slate-800 bg-slate-950 text-slate-400'
                      }`}
                    >
                      {timing.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Direct Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  {isRoomVisibleInput ? (
                    <Eye className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-slate-500" />
                  )}
                  <span>
                    বর্তমান অবস্থা: {isRoomVisibleInput ? 'প্লেয়ারদের জন্য উন্মুক্ত (Public)' : 'লুকানো (Hidden)'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRoomVisibleInput(!isRoomVisibleInput)}
                  className={`px-3 py-1 rounded-lg font-bold text-xs ${
                    isRoomVisibleInput ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {isRoomVisibleInput ? 'Hide Room' : 'Show Room'}
                </button>
              </div>

              {/* Joined Players in this room count */}
              {currentRoomMatch && (
                <div className="text-xs text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                  এই ম্যাচে জয়েন করা প্লেয়ার সংখ্যা: <strong className="text-white">{currentRoomMatch.joinedPlayers.length} জন</strong>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 cursor-pointer active:scale-98 transition-all"
              >
                রুম আইডি ও পাসওয়ার্ড সেভ করুন
              </button>
            </form>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* MODULE 5: RESULT MANAGEMENT (KILL, POSITION, POINTS, WINNER)  */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'results' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-purple-400" />
                  <span>টুর্নামেন্ট রেজাল্ট ও প্রাইজ ডিস্ট্রিবিউশন</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  কিল, পজিশন, পয়েন্ট এবং চ্যাম্পিয়ন উইনারের ফলাফল প্রকাশ করুন। উইনারদের অ্যাকাউন্টে স্বয়ংক্রিয় প্রাইজ যোগ হবে।
                </p>
              </div>

              {/* Tournament Selector */}
              <div className="w-full sm:w-72">
                <select
                  value={selectedResultMatchId}
                  onChange={(e) => handleSelectResultMatch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-xs"
                >
                  {matches.map((m) => (
                    <option key={m.id} value={m.id}>
                      #{m.matchNumber} {m.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {resultPublishedSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950 border border-emerald-600 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>ম্যাচের ফলাফল সফলভাবে প্রকাশিত হয়েছে এবং প্লেয়ারদের ব্যালেন্স যোগ হয়েছে!</span>
              </div>
            )}

            <form onSubmit={handleSaveResults} className="space-y-4">
              {/* Winner Highlight Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 border border-purple-800/60 grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-purple-300 mb-1">Booyah Winner Name:</label>
                  <input
                    type="text"
                    value={resultWinnerName}
                    onChange={(e) => setResultWinnerName(e.target.value)}
                    placeholder="IGN"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-purple-300 mb-1">Winner Free Fire UID:</label>
                  <input
                    type="text"
                    value={resultWinnerUid}
                    onChange={(e) => setResultWinnerUid(e.target.value)}
                    placeholder="UID"
                    className="w-full font-mono bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-purple-300 mb-1">মোট প্রাইজ মানি (৳):</label>
                  <input
                    type="number"
                    value={resultWinnerPrize}
                    onChange={(e) => setResultWinnerPrize(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-amber-400 font-bold text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-purple-300 mb-1">উইনারের মোট কিল:</label>
                  <input
                    type="number"
                    value={resultWinnerKills}
                    onChange={(e) => setResultWinnerKills(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-emerald-400 font-bold text-xs"
                    required
                  />
                </div>
              </div>

              {/* Table of Positions, Kills, Points */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 overflow-x-auto">
                <div className="flex items-center justify-between mb-3 text-xs font-bold text-slate-300">
                  <span>প্লেয়ার রেজাল্ট শিট (Kill, Position, Points & Prize)</span>
                  <button
                    type="button"
                    onClick={() => {
                      setResultRows([
                        ...resultRows,
                        {
                          playerId: `p-${Date.now()}`,
                          gamerName: 'New_Player',
                          uid: '123456789',
                          position: resultRows.length + 1,
                          kills: 2,
                          points: 5,
                          prizeWon: 0,
                        },
                      ]);
                    }}
                    className="text-xs text-purple-400 hover:text-purple-300 cursor-pointer"
                  >
                    + আরও প্লেয়ার যোগ করুন
                  </button>
                </div>

                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 pb-2">
                      <th className="py-2">Pos</th>
                      <th>Player IGN</th>
                      <th>Free Fire UID</th>
                      <th>Kills</th>
                      <th>Points</th>
                      <th>Prize Won (৳)</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {resultRows.map((row, idx) => (
                      <tr key={row.playerId || idx}>
                        <td className="py-2.5 font-bold text-amber-400">
                          <input
                            type="number"
                            value={row.position}
                            onChange={(e) => {
                              const updated = [...resultRows];
                              updated[idx].position = Number(e.target.value);
                              setResultRows(updated);
                            }}
                            className="w-14 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs"
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={row.gamerName}
                            onChange={(e) => {
                              const updated = [...resultRows];
                              updated[idx].gamerName = e.target.value;
                              setResultRows(updated);
                            }}
                            className="w-32 sm:w-40 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white"
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={row.uid}
                            onChange={(e) => {
                              const updated = [...resultRows];
                              updated[idx].uid = e.target.value;
                              setResultRows(updated);
                            }}
                            className="w-32 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs font-mono text-slate-300"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={row.kills}
                            onChange={(e) => {
                              const updated = [...resultRows];
                              updated[idx].kills = Number(e.target.value);
                              // Auto calculate points: (Placement bonus + kills * 2)
                              updated[idx].points = Math.max(0, 15 - idx * 2) + Number(e.target.value) * 2;
                              setResultRows(updated);
                            }}
                            className="w-16 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs font-bold text-emerald-400"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={row.points}
                            onChange={(e) => {
                              const updated = [...resultRows];
                              updated[idx].points = Number(e.target.value);
                              setResultRows(updated);
                            }}
                            className="w-16 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs font-bold text-sky-400"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={row.prizeWon}
                            onChange={(e) => {
                              const updated = [...resultRows];
                              updated[idx].prizeWon = Number(e.target.value);
                              setResultRows(updated);
                            }}
                            className="w-20 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs font-black text-amber-400"
                          />
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() => setResultRows(resultRows.filter((_, i) => i !== idx))}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-lg shadow-purple-600/30 cursor-pointer active:scale-98 transition-all"
              >
                ফলাফল প্রকাশ ও প্রাইজ প্রদান নিশ্চিত করুন (Publish Results)
              </button>
            </form>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* MODULE 6: WEBSITE SETTINGS                                    */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'settings' && (
          <div className="space-y-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-400" />
                <span>Website Settings (লোগো, কন্টাক্ট, পেমেন্ট নাম্বার ও রুলস)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                এখান থেকে যেকোনো পরিবর্তন করলে তা সরাসরি লাইভ ওয়েবসাইটে আপডেট হয়ে যাবে।
              </p>
            </div>

            {settingsSavedSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950 border border-emerald-600 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>ওয়েবসাইটের সেটিংস সফলভাবে সেভ করা হয়েছে!</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-5">
              {/* 1. Branding & Logo */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  ১. ব্র্যান্ডিং ও লোগো (Branding)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">সাইটের নাম (Website Name):</label>
                    <input
                      type="text"
                      value={settingsForm.siteName}
                      onChange={(e) => setSettingsForm({ ...settingsForm, siteName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">লোগো টেক্সট (Logo Text):</label>
                    <input
                      type="text"
                      value={settingsForm.logoText}
                      onChange={(e) => setSettingsForm({ ...settingsForm, logoText: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* 2. Contact Information */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                  ২. যোগাযোগ ও হেল্পলাইন (Contact Information)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">হটলাইন মোবাইল নাম্বার:</label>
                    <input
                      type="text"
                      value={settingsForm.helplinePhone}
                      onChange={(e) => setSettingsForm({ ...settingsForm, helplinePhone: e.target.value })}
                      className="w-full font-mono bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">WhatsApp নাম্বার (মেসেজের জন্য):</label>
                    <input
                      type="text"
                      value={settingsForm.whatsappNumber}
                      onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                      className="w-full font-mono bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Telegram চ্যানেল / ইউজারনেম:</label>
                    <input
                      type="text"
                      value={settingsForm.telegramUsername}
                      onChange={(e) => setSettingsForm({ ...settingsForm, telegramUsername: e.target.value })}
                      className="w-full font-mono bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">সাপোর্ট ইমেইল এড্রেস:</label>
                    <input
                      type="email"
                      value={settingsForm.supportEmail}
                      onChange={(e) => setSettingsForm({ ...settingsForm, supportEmail: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* 3. Payment Instructions & Numbers */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  ৩. পেমেন্ট নির্দেশনা ও নাম্বার (bKash, Nagad, Rocket)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <span className="font-extrabold text-pink-400 block">বিকাশ (bKash)</span>
                    <input
                      type="text"
                      value={settingsForm.bKashNumber}
                      onChange={(e) => setSettingsForm({ ...settingsForm, bKashNumber: e.target.value })}
                      placeholder="বিকাশ নাম্বার"
                      className="w-full font-mono bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                    />
                    <input
                      type="text"
                      value={settingsForm.bKashNote}
                      onChange={(e) => setSettingsForm({ ...settingsForm, bKashNote: e.target.value })}
                      placeholder="নির্দেশনা"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-300 text-[11px]"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <span className="font-extrabold text-orange-400 block">নগদ (Nagad)</span>
                    <input
                      type="text"
                      value={settingsForm.nagadNumber}
                      onChange={(e) => setSettingsForm({ ...settingsForm, nagadNumber: e.target.value })}
                      placeholder="নগদ নাম্বার"
                      className="w-full font-mono bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                    />
                    <input
                      type="text"
                      value={settingsForm.nagadNote}
                      onChange={(e) => setSettingsForm({ ...settingsForm, nagadNote: e.target.value })}
                      placeholder="নির্দেশনা"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-300 text-[11px]"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <span className="font-extrabold text-purple-400 block">রকেট (Rocket)</span>
                    <input
                      type="text"
                      value={settingsForm.rocketNumber}
                      onChange={(e) => setSettingsForm({ ...settingsForm, rocketNumber: e.target.value })}
                      placeholder="রকেট নাম্বার"
                      className="w-full font-mono bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                    />
                    <input
                      type="text"
                      value={settingsForm.rocketNote}
                      onChange={(e) => setSettingsForm({ ...settingsForm, rocketNote: e.target.value })}
                      placeholder="নির্দেশনা"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-300 text-[11px]"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Tournament Rules Management */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  ৪. টুর্নামেন্টের অল রুলস (All Rules)
                </h4>

                <div className="space-y-2">
                  {settingsForm.rules.map((rule, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs"
                    >
                      <span className="text-slate-200">{rule}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveRule(idx)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    value={newRuleInput}
                    onChange={(e) => setNewRuleInput(e.target.value)}
                    placeholder="নতুন একটি নিয়ম লিখুন..."
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddRule}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
                  >
                    + নিয়ম যুক্ত করুন
                  </button>
                </div>
              </div>

              {/* 5. Live Marquee Notice */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                  ৫. হোমপেজের রানিং নোটিশ বার (Notice Bar)
                </h4>
                <textarea
                  rows={3}
                  value={settingsForm.noticeText}
                  onChange={(e) => setSettingsForm({ ...settingsForm, noticeText: e.target.value })}
                  className="w-full text-xs bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 via-sky-600 to-blue-600 hover:from-indigo-400 hover:to-blue-500 text-white font-black text-xs shadow-xl shadow-indigo-900/40 cursor-pointer active:scale-98 transition-all"
              >
                ওয়েবসাইট সেটিংস সেভ করুন (Save Website Settings)
              </button>
            </form>
          </div>
        )}
      </main>

      {/* MODAL 1: CREATE / EDIT MATCH */}
      {isMatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 p-5 shadow-2xl my-6">
            <h3 className="font-black text-base text-white mb-3">
              {editingMatchId ? 'টুর্নামেন্ট সম্পাদনা (Edit Tournament)' : 'নতুন টুর্নামেন্ট তৈরি করুন'}
            </h3>

            <form onSubmit={handleSubmitMatchForm} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">ক্যাটাগরি:</label>
                <select
                  value={matchForm.categoryId}
                  onChange={(e) => setMatchForm({ ...matchForm, categoryId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">ম্যাচের শিরোনাম:</label>
                <input
                  type="text"
                  value={matchForm.title}
                  onChange={(e) => setMatchForm({ ...matchForm, title: e.target.value })}
                  placeholder="যেমন: LG LEADER BD - CS 4v4 Bermuda Cash Match"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">এন্ট্রি ফি (৳):</label>
                  <input
                    type="number"
                    value={matchForm.entryFee}
                    onChange={(e) => setMatchForm({ ...matchForm, entryFee: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">প্রতি কিল (৳):</label>
                  <input
                    type="number"
                    value={matchForm.perKill}
                    onChange={(e) => setMatchForm({ ...matchForm, perKill: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">মোট প্রাইজ (৳):</label>
                  <input
                    type="number"
                    value={matchForm.totalPrize}
                    onChange={(e) => setMatchForm({ ...matchForm, totalPrize: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">ম্যাপ:</label>
                  <select
                    value={matchForm.map}
                    onChange={(e) => setMatchForm({ ...matchForm, map: e.target.value as any })}
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
                    value={matchForm.matchType}
                    onChange={(e) => setMatchForm({ ...matchForm, matchType: e.target.value as any })}
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
                  <label className="block font-semibold text-slate-300 mb-1">স্লট সংখ্যা:</label>
                  <input
                    type="number"
                    value={matchForm.totalSlots}
                    onChange={(e) => setMatchForm({ ...matchForm, totalSlots: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">শিডিউল সময়:</label>
                <input
                  type="text"
                  value={matchForm.scheduleTime}
                  onChange={(e) => setMatchForm({ ...matchForm, scheduleTime: e.target.value })}
                  placeholder="যেমন: Today at 10:30 PM"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsMatchModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black"
                >
                  {editingMatchId ? 'পরিবর্তন সেভ করুন' : 'ম্যাচ তৈরি করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CANCEL MATCH CONFIRMATION */}
      {cancellingMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700 p-5 shadow-2xl">
            <h3 className="font-black text-sm text-red-400 mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span>ম্যাচ বাতিল করুন (Cancel Tournament)</span>
            </h3>
            <p className="text-xs text-slate-300 mb-3">{cancellingMatch.title}</p>
            <p className="text-[11px] text-slate-400 mb-2">
              ম্যাচে জয়েন করা প্লেয়ারদের এন্ট্রি ফি থাকলে তা স্বয়ংক্রিয়ভাবে তাদের ওয়ালেটে ফেরত দেওয়া হবে।
            </p>

            <textarea
              rows={2}
              value={cancelReasonInput}
              onChange={(e) => setCancelReasonInput(e.target.value)}
              className="w-full text-xs bg-slate-950 border border-slate-700 rounded-xl p-2 text-white mb-3"
              placeholder="বাতিলের কারণ লিখুন..."
            />

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setCancellingMatch(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold"
              >
                না
              </button>
              <button
                type="button"
                onClick={handleConfirmCancelMatch}
                className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-black"
              >
                হ্যাঁ, বাতিল ও রিফান্ড করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: ADJUST PLAYER BALANCE (3 Options: Add, Remove, Edit) */}
      {adjustingPlayer && (() => {
        const currentBal = (adjustingPlayer.depositBalance || 0) + (adjustingPlayer.winningBalance || 0);
        const amountNum = Math.abs(adjustAmountInput || 0);
        const previewBal =
          adjustMode === 'add'
            ? currentBal + amountNum
            : adjustMode === 'remove'
            ? Math.max(0, currentBal - amountNum)
            : Math.max(0, adjustAmountInput || 0);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700 p-5 shadow-2xl animate-fadeIn">
              <h3 className="font-black text-base text-white mb-0.5">ব্যালেন্স এডজাস্ট করুন</h3>
              <p className="text-xs text-sky-400 font-bold mb-3">
                {adjustingPlayer.username || adjustingPlayer.name} ({adjustingPlayer.freeFireUid})
              </p>

              {/* Current Unified Balance */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 mb-3 flex items-center justify-between">
                <span className="text-xs text-slate-400">বর্তমান মোট ব্যালেন্স:</span>
                <span className="font-black text-sm text-emerald-400 tabular-nums">৳{currentBal}</span>
              </div>

              {/* 3 Option Selector Tabs (Add, Remove, Edit) */}
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-xl mb-3 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setAdjustMode('add')}
                  className={`py-2 text-[11px] font-black rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    adjustMode === 'add'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>➕ যোগ</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustMode('remove')}
                  className={`py-2 text-[11px] font-black rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    adjustMode === 'remove'
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>➖ কর্তন</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustMode('edit')}
                  className={`py-2 text-[11px] font-black rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    adjustMode === 'edit'
                      ? 'bg-sky-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>✏️ এডিট</span>
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {adjustMode === 'add'
                      ? 'কত টাকা যোগ করতে চান (৳):'
                      : adjustMode === 'remove'
                      ? 'কত টাকা কর্তন বা মাইনাস করতে চান (৳):'
                      : 'সরাসরি নতুন ব্যালেন্স সেট করুন (৳):'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={adjustAmountInput}
                    onChange={(e) => setAdjustAmountInput(Number(e.target.value))}
                    placeholder="টাকার পরিমাণ লিখুন"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-black text-sm focus:outline-none focus:border-sky-500"
                    required
                  />
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[50, 100, 200, 500, 1000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAdjustAmountInput(amt)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 cursor-pointer"
                    >
                      ৳{amt}
                    </button>
                  ))}
                </div>

                {/* Real-time Preview Banner */}
                <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">আপডেটের পর ব্যালেন্স হবে:</span>
                  <span className="font-black text-sky-300 tabular-nums text-sm">৳{previewBal}</span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setAdjustingPlayer(null)}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
                  >
                    বাতিল
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      adjustPlayerBalance(adjustingPlayer.id, adjustMode, adjustAmountInput);
                      setAdjustingPlayer(null);
                    }}
                    className={`px-4 py-2 rounded-xl text-white font-black shadow-md cursor-pointer active:scale-95 transition-all ${
                      adjustMode === 'add'
                        ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/40'
                        : adjustMode === 'remove'
                        ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/40'
                        : 'bg-sky-500 hover:bg-sky-400 shadow-sky-900/40'
                    }`}
                  >
                    ব্যালেন্স আপডেট করুন
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL 4: PAYMENT REJECTION REASON */}
      {viewingPaymentTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700 p-5 shadow-2xl">
            <h3 className="font-black text-sm text-red-400 mb-2">পেমেন্ট রিজেক্ট করার কারণ</h3>
            <p className="text-xs text-slate-300 mb-3">
              ইউজার: {viewingPaymentTx.userName} (টাকা: ৳{viewingPaymentTx.amount})
            </p>

            <input
              type="text"
              value={rejectReasonInput}
              onChange={(e) => setRejectReasonInput(e.target.value)}
              className="w-full text-xs bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white mb-3"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setViewingPaymentTx(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={() => {
                  if (viewingPaymentTx.type === 'deposit') {
                    rejectDeposit(viewingPaymentTx.id, rejectReasonInput);
                  } else {
                    rejectWithdraw(viewingPaymentTx.id, rejectReasonInput);
                  }
                  setViewingPaymentTx(null);
                }}
                className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-black"
              >
                রিজেক্ট কনফার্ম করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
