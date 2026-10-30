import React, { useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import { Trophy, Crosshair, Award, Sparkles, CheckCircle2 } from 'lucide-react';
import { getCharacterBanner } from '../assets/images';

export const ResultsView: React.FC = () => {
  const { matches, topPlayers } = useTournament();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const filterTags = [
    { id: 'all', label: 'All Results' },
    { id: 'free-fire', label: 'Free Fire' },
    { id: 'cs-4v4', label: 'CS 4v4' },
    { id: 'lw-zone-rush', label: 'Lone Wolf' },
    { id: 'free-match', label: 'Free Match' },
  ];

  const completedMatches = matches.filter((m) => {
    if (m.status !== 'completed') return false;
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'free-fire') return m.categoryId.includes('br') || m.categoryId.includes('free-fire') || m.title.toLowerCase().includes('bermuda');
    if (selectedFilter === 'cs-4v4') return m.categoryId.includes('cs') || m.categoryId.includes('4v4');
    if (selectedFilter === 'lw-zone-rush') return m.categoryId.includes('lw') || m.categoryId.includes('wolf');
    if (selectedFilter === 'free-match') return m.categoryId.includes('free');
    return true;
  });

  return (
    <div className="w-full pb-24 animate-fadeIn">
      {/* Top Header matching Screenshot 2 (Right): Result */}
      <div className="sticky top-0 z-20 w-full bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 shadow-md">
        <h1 className="text-center text-lg sm:text-xl font-black text-white tracking-tight">
          Result
        </h1>
      </div>

      {/* Filter Tags Row matching Screenshot 2 */}
      <div className="p-3 bg-slate-950 border-b border-slate-800/80 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 min-w-max">
          {filterTags.map((tag) => {
            const isActive = selectedFilter === tag.id;
            return (
              <button
                key={tag.id}
                onClick={() => setSelectedFilter(tag.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {tag.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-3 sm:p-4 max-w-xl mx-auto space-y-4">
        {/* Completed Match Cards */}
        {completedMatches.length === 0 ? (
          <div className="py-12 px-6 text-center rounded-3xl bg-slate-900/60 border border-slate-800 my-4">
            <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-2" />
            <h3 className="font-bold text-sm text-white">কোনো ফলাফল পাওয়া যায়নি</h3>
            <p className="text-xs text-slate-400 mt-1">ম্যাচ সম্পন্ন হলে এখানে রেজাল্ট প্রদর্শিত হবে।</p>
          </div>
        ) : (
          completedMatches.map((m) => {
            const characterBanner = m.thumbnailUrl || getCharacterBanner(m.categoryId || m.matchType);

            return (
              <div
                key={m.id}
                className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-lg"
              >
                {/* Winner & Result Header Tag matching Screenshot 2 */}
                <div className="px-3.5 pt-3 pb-1 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80">
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wide flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Winner & Result</span>
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-500 text-slate-950">
                    Match #{m.matchNumber}
                  </span>
                </div>

                <div className="p-3.5">
                  {/* Top Match Info Row */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-slate-800">
                      <img
                        src={characterBanner}
                        alt={m.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                        {m.title}
                      </h3>
                      <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                        {m.matchType} • {m.map}
                      </p>
                    </div>
                  </div>

                  {/* 3-Column Stats Grid matching Screenshot 2 */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 text-center text-xs mb-3">
                    <div>
                      <div className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                        WIN PRIZE
                      </div>
                      <div className="text-sm font-black text-slate-900 dark:text-sky-400 tabular-nums mt-0.5">
                        ৳{m.winnerPrize || m.totalPrize}
                      </div>
                    </div>
                    <div className="border-x border-slate-200 dark:border-slate-800">
                      <div className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                        ENTRY FEE
                      </div>
                      <div className="text-sm font-black text-amber-600 dark:text-amber-400 tabular-nums mt-0.5">
                        {m.entryFee === 0 ? 'FREE' : `৳${m.entryFee}`}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                        TOTAL KILLS
                      </div>
                      <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5">
                        {m.totalKillsWinner || 0}
                      </div>
                    </div>

                    {/* Row 2 */}
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80">
                      <div className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                        PER KILL
                      </div>
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-200 tabular-nums mt-0.5">
                        ৳{m.perKill}
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 border-x border-slate-200 dark:border-slate-800">
                      <div className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                        MAP
                      </div>
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate mt-0.5">
                        {m.map}
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80">
                      <div className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                        VERSION
                      </div>
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate mt-0.5">
                        {m.version}
                      </div>
                    </div>
                  </div>

                  {/* Booyah Champion Box */}
                  <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-yellow-500/15 to-emerald-500/10 border border-amber-400/40 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-400 border border-amber-400/40 flex items-center justify-center font-bold">
                        <Trophy className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-extrabold text-amber-500 dark:text-amber-300 block">
                          Booyah Winner
                        </span>
                        <span className="font-black text-sm text-slate-900 dark:text-white">
                          {m.winnerName || 'Winner'}
                        </span>
                        {m.winnerUid && (
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                            UID: {m.winnerUid}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black text-amber-500 dark:text-amber-300 tabular-nums block">
                        ৳{m.winnerPrize || m.totalPrize}
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        {m.totalKillsWinner || 0} Kills
                      </span>
                    </div>
                  </div>

                  {/* Scoreboard Breakdown if published */}
                  {m.results && m.results.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2">
                        ফলাফল স্কোরবোর্ড (Scoreboard)
                      </div>
                      <div className="space-y-1">
                        {m.results.map((res) => (
                          <div
                            key={res.playerId}
                            className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/60"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-amber-500 w-5">#{res.position}</span>
                              <span className="font-bold text-slate-800 dark:text-slate-200">{res.gamerName}</span>
                              <span className="font-mono text-[10px] text-slate-400">{res.uid}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px]">
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{res.kills} Kills</span>
                              {res.prizeWon > 0 && (
                                <span className="text-amber-500 dark:text-amber-300 font-black">৳{res.prizeWon}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

