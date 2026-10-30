import React, { useState } from 'react';
import { GameCategory, TournamentMatch } from '../types';
import { useTournament } from '../context/TournamentContext';
import { JoinMatchModal } from './JoinMatchModal';
import { getCharacterBanner } from '../assets/images';
import {
  ArrowLeft,
  Users,
  Trophy,
  Key,
  Copy,
  Check,
  AlertTriangle,
  Flame,
  Clock,
  Sparkles,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';

interface MatchListModalProps {
  category: GameCategory;
  onBack: () => void;
  onOpenWallet: () => void;
}

export const MatchListModal: React.FC<MatchListModalProps> = ({ category, onBack, onOpenWallet }) => {
  const { matches, user } = useTournament();
  const [selectedMatchForJoin, setSelectedMatchForJoin] = useState<TournamentMatch | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showRulesForMatch, setShowRulesForMatch] = useState<TournamentMatch | null>(null);

  const categoryMatches = matches.filter((m) => m.categoryId === category.id);

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header matching Screenshot 2 (Middle): < Free Fire Matches */}
      <div className="sticky top-0 z-20 w-full bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between shadow-md">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-slate-100 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-slate-100" />
          <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
            {category.name} Matches
          </h2>
        </button>

        <button
          onClick={() => window.location.reload()}
          className="p-2 rounded-full bg-slate-800 text-sky-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
          title="Refresh Matches"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Matches Feed */}
      <div className="p-3 sm:p-4 space-y-4 max-w-xl mx-auto">
        {categoryMatches.length === 0 ? (
          <div className="py-12 px-6 text-center rounded-3xl bg-slate-900/60 border border-slate-800 my-4">
            <AlertTriangle className="w-12 h-12 text-amber-400/80 mx-auto mb-3" />
            <h3 className="font-extrabold text-base text-white">এখন কোনো ম্যাচ পাওয়া যায়নি</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              এই ক্যাটাগরিতে খুব শীঘ্রই নতুন টুর্নামেন্ট যুক্ত করা হবে।
            </p>
            <button
              onClick={onBack}
              className="mt-4 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 font-bold text-xs cursor-pointer"
            >
              অন্যান্য ম্যাচ দেখুন
            </button>
          </div>
        ) : (
          categoryMatches.map((match) => {
            const isJoined = user ? match.joinedPlayers.some((p) => p.userId === user.id) : false;
            const isFull = match.joinedPlayers.length >= match.totalSlots;
            const progress = Math.min(100, Math.round((match.joinedPlayers.length / match.totalSlots) * 100));
            const isExpanded = showRulesForMatch?.id === match.id;

            const characterBanner = match.thumbnailUrl || getCharacterBanner(match.categoryId || match.matchType);

            return (
              <div
                key={match.id}
                className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-lg transition-all"
              >
                {/* Upper Match Info Row */}
                <div className="p-3.5 pb-2.5">
                  <div className="flex items-start gap-3">
                    {/* Thumbnail on left matching Screenshot 2 */}
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-slate-800">
                      <img
                        src={characterBanner}
                        alt={match.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[9px] text-amber-300 font-bold text-center py-0.5 truncate px-1">
                        Match #{match.matchNumber}
                      </span>
                    </div>

                    {/* Title & Badge */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white leading-tight truncate">
                            {match.title}
                          </h3>
                          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                            {match.matchType} • {match.version}
                          </p>
                        </div>

                        {/* Orange/Amber Badge matching screenshot */}
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 shrink-0">
                          {match.version === 'Mobile Only' ? 'Mobile' : 'All Device'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 3-Column Stats Grid matching Screenshot 2 */}
                  <div className="grid grid-cols-3 gap-2 mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 text-center text-xs">
                    <div>
                      <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                        WIN PRIZE
                      </div>
                      <div className="text-sm font-black text-slate-900 dark:text-sky-400 tabular-nums mt-0.5">
                        ৳{match.totalPrize}
                      </div>
                    </div>

                    <div className="border-x border-slate-200 dark:border-slate-800">
                      <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                        ENTRY FEE
                      </div>
                      <div className="text-sm font-black text-amber-600 dark:text-amber-400 tabular-nums mt-0.5">
                        {match.entryFee === 0 ? 'FREE' : `৳${match.entryFee}`}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                        PER KILL
                      </div>
                      <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5">
                        ৳{match.perKill}
                      </div>
                    </div>

                    {/* Row 2: MAP / MATCH TYPE / VERSION */}
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80">
                      <div className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                        MAP
                      </div>
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate mt-0.5">
                        {match.map}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 border-x border-slate-200 dark:border-slate-800">
                      <div className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                        TYPE
                      </div>
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate mt-0.5">
                        {match.matchType}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80">
                      <div className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                        VERSION
                      </div>
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate mt-0.5">
                        {match.version}
                      </div>
                    </div>
                  </div>

                  {/* Slot Booking Progress Bar & Join Button matching screenshot 2 */}
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                        <span>স্লট বুকিং</span>
                        <span className="tabular-nums font-extrabold text-slate-800 dark:text-slate-200">
                          {match.joinedPlayers.length} / {match.totalSlots}
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            progress > 85 ? 'bg-red-500' : progress > 50 ? 'bg-amber-500' : 'bg-sky-500'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Join Button */}
                    <div className="shrink-0">
                      {match.status === 'completed' ? (
                        <span className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 font-bold text-xs block">
                          সমাপ্ত
                        </span>
                      ) : isJoined ? (
                        <span className="px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>Joined</span>
                        </span>
                      ) : isFull ? (
                        <span className="px-3.5 py-2 rounded-xl bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 font-bold text-xs block">
                          Full
                        </span>
                      ) : (
                        <button
                          onClick={() => setSelectedMatchForJoin(match)}
                          className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-extrabold text-xs shadow-md active:scale-95 transition-all cursor-pointer"
                        >
                          Join
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Room ID & Pass disclosure (if match is ongoing or published) */}
                  {match.roomId && match.isRoomVisibleToPlayers !== false && (
                    <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-600/50 mt-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                          <Key className="w-4 h-4 text-amber-400" />
                          <span>রুম ডিটেইলস (Room ID & Password)</span>
                        </span>
                        <span className="text-[10px] bg-amber-500/20 text-amber-200 px-2 py-0.5 rounded font-bold">
                          LIVE
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 rounded-lg bg-black/60 flex items-center justify-between">
                          <div>
                            <div className="text-[10px] text-slate-400">Room ID:</div>
                            <div className="font-mono font-black text-amber-300">{match.roomId}</div>
                          </div>
                          <button
                            onClick={() => copyToClipboard(match.roomId || '', `room-${match.id}`)}
                            className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white"
                            title="Copy Room ID"
                          >
                            {copiedKey === `room-${match.id}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        <div className="p-2 rounded-lg bg-black/60 flex items-center justify-between">
                          <div>
                            <div className="text-[10px] text-slate-400">Password:</div>
                            <div className="font-mono font-black text-amber-300">{match.roomPassword || 'None'}</div>
                          </div>
                          <button
                            onClick={() => copyToClipboard(match.roomPassword || '', `pass-${match.id}`)}
                            className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white"
                            title="Copy Password"
                          >
                            {copiedKey === `pass-${match.id}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Expandable Match Rules dropdown accordion matching screenshot 2 */}
                  <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => setShowRulesForMatch(isExpanded ? null : match)}
                      className="w-full flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors py-1 cursor-pointer"
                    >
                      <span>ম্যাচের নিয়ম ও তথ্য (Match Rules & Details)</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180 text-sky-400' : ''}`} />
                    </button>

                    {isExpanded && (
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-1 mt-1.5 animate-fadeIn">
                        {match.rules.map((rule, idx) => (
                          <div key={idx} className="flex items-start gap-1.5">
                            <span className="text-amber-500 font-bold">•</span>
                            <span>{rule}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Full-Width Green Bottom Status Bar matching Screenshot 2 */}
                <div className="w-full bg-[#2e7d32] px-3.5 py-2 text-white text-xs font-bold flex items-center justify-center gap-2 tracking-wide">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Starts at {match.scheduleTime}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Join Match Modal */}
      {selectedMatchForJoin && (
        <JoinMatchModal
          match={selectedMatchForJoin}
          onClose={() => setSelectedMatchForJoin(null)}
          onOpenWallet={onOpenWallet}
        />
      )}

      {/* Rules Modal */}
      {showRulesForMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700 text-slate-100 p-5 shadow-2xl">
            <h3 className="font-extrabold text-base text-white mb-2 flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400" />
              <span>ম্যাচের নিয়ম ও নির্দেশনা</span>
            </h3>
            <p className="text-xs text-sky-300 font-semibold mb-3">{showRulesForMatch.title}</p>

            <ul className="space-y-2 text-xs text-slate-300 mb-5">
              {showRulesForMatch.rules.map((rule, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => setShowRulesForMatch(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
            >
              বুঝেছি (Close)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
