import React, { useState } from 'react';
import { GameCategory, TournamentMatch } from '../types';
import { useTournament } from '../context/TournamentContext';
import { JoinMatchModal } from './JoinMatchModal';
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
    <div className="w-full pb-24 animate-fadeIn">
      {/* Top Category Hero Banner */}
      <div className="relative w-full bg-slate-900 border-b border-slate-800 p-4 pt-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-sky-400 hover:text-sky-300 mb-2 py-1 px-2 -ml-2 rounded-lg hover:bg-slate-800/60 transition-colors w-fit cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>সকল ক্যাটাগরি (Back)</span>
        </button>

        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
                {category.name}
              </h2>
              {category.badge && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {category.badge}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">{category.description}</p>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-sky-400 bg-sky-950/80 px-2.5 py-1 rounded-full border border-sky-800">
              {categoryMatches.length} টি ম্যাচ উপলব্ধ
            </span>
          </div>
        </div>
      </div>

      {/* Matches Feed */}
      <div className="p-4 space-y-4 max-w-2xl mx-auto">
        {categoryMatches.length === 0 ? (
          <div className="py-12 px-6 text-center rounded-3xl bg-slate-900/60 border border-slate-800 my-4">
            <AlertTriangle className="w-12 h-12 text-amber-400/80 mx-auto mb-3" />
            <h3 className="font-extrabold text-base text-white">এখন কোনো ম্যাচ পাওয়া যায়নি</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              এই ক্যাটাগরিতে খুব শীঘ্রই নতুন টুর্নামেন্ট যুক্ত করা হবে। অন্যান্য ক্যাটাগরি দেখুন অথবা অ্যাডমিনের নোটিশ খেয়াল রাখুন।
            </p>
            <button
              onClick={onBack}
              className="mt-4 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 font-bold text-xs"
            >
              অন্যান্য ম্যাচ দেখুন
            </button>
          </div>
        ) : (
          categoryMatches.map((match) => {
            const isJoined = match.joinedPlayers.some((p) => p.userId === user.id);
            const isFull = match.joinedPlayers.length >= match.totalSlots;
            const progress = Math.min(100, Math.round((match.joinedPlayers.length / match.totalSlots) * 100));

            return (
              <div
                key={match.id}
                className="rounded-2xl bg-slate-900/90 border border-slate-700/80 overflow-hidden shadow-xl hover:border-slate-600 transition-all"
              >
                {/* Match Header Bar */}
                <div className="px-4 py-3 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700/70 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      Match #{match.matchNumber}
                    </span>
                    <span className="text-xs font-semibold text-slate-300">{match.matchType}</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-xs font-semibold text-slate-300">{match.map}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{match.scheduleTime}</span>
                  </div>
                </div>

                {/* Match Details Body */}
                <div className="p-4">
                  <h3 className="font-extrabold text-base text-white leading-snug mb-3">
                    {match.title}
                  </h3>

                  {/* 3 Metric Cards */}
                  <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-center mb-3">
                    <div>
                      <div className="text-[10px] font-semibold text-slate-400 uppercase">মোট প্রাইজ</div>
                      <div className="text-sm sm:text-base font-black text-sky-400 tabular-nums">
                        ৳{match.totalPrize}
                      </div>
                    </div>
                    <div className="border-x border-slate-800">
                      <div className="text-[10px] font-semibold text-slate-400 uppercase">প্রতি কিল</div>
                      <div className="text-sm sm:text-base font-black text-emerald-400 tabular-nums">
                        ৳{match.perKill}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-semibold text-slate-400 uppercase">এন্ট্রি ফি</div>
                      <div className="text-sm sm:text-base font-black text-amber-400 tabular-nums">
                        {match.entryFee === 0 ? 'FREE' : `৳${match.entryFee}`}
                      </div>
                    </div>
                  </div>

                  {/* Slot progress bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-sky-400" />
                        <span>স্লট বুকিং</span>
                      </div>
                      <span className="tabular-nums font-bold text-slate-200">
                        {match.joinedPlayers.length} / {match.totalSlots} জন
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          progress > 85 ? 'bg-red-500' : progress > 50 ? 'bg-amber-400' : 'bg-sky-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Room ID & Pass disclosure (if match is ongoing or published) */}
                  {match.roomId && match.isRoomVisibleToPlayers !== false ? (
                    <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-600/50 mb-4">
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
                  ) : (
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-slate-500" />
                        <span>রুম আইডি ও পাসওয়ার্ড ম্যাচ শুরুর ১০ মিনিট আগে দেওয়া হবে।</span>
                      </div>
                    </div>
                  )}

                  {/* Completed Winner Highlight */}
                  {match.status === 'completed' && match.winnerName && (
                    <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-600/50 mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-400" />
                        <div>
                          <div className="text-[10px] uppercase font-bold text-emerald-300">Booyah Winner</div>
                          <div className="text-xs font-black text-white">{match.winnerName}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-black text-yellow-400">৳{match.winnerPrize}</div>
                        <div className="text-[10px] text-emerald-300">{match.totalKillsWinner} Kills</div>
                      </div>
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => setShowRulesForMatch(match)}
                      className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                    >
                      নিয়মাবলী
                    </button>

                    {match.status === 'completed' ? (
                      <div className="flex-1 py-2.5 rounded-xl bg-slate-800/60 text-slate-500 text-center text-xs font-bold">
                        ম্যাচ সমাপ্ত
                      </div>
                    ) : isJoined ? (
                      <div className="flex-1 py-2.5 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 text-center text-xs font-extrabold flex items-center justify-center gap-1.5">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>আপনি জয়েন করেছেন</span>
                      </div>
                    ) : isFull ? (
                      <div className="flex-1 py-2.5 rounded-xl bg-red-950/40 border border-red-800/40 text-red-400 text-center text-xs font-bold">
                        স্লট পূর্ণ (Full)
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedMatchForJoin(match)}
                        className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-extrabold shadow-md shadow-sky-900/30 flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                        <span>জয়েন করুন (Join)</span>
                      </button>
                    )}
                  </div>
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
