import React, { useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import { Trophy, CheckCircle2 } from 'lucide-react';
import { getCharacterBanner } from '../assets/images';

export const ResultsView: React.FC = () => {
  const { matches } = useTournament();
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
    <div className="w-full min-h-screen bg-[#f8fafc] text-slate-900 pb-24 animate-fadeIn">
      {/* Top Header matching Screenshot 2 (Right): Result */}
      <div className="sticky top-0 z-20 w-full bg-white backdrop-blur-md border-b border-slate-200 px-4 py-3 shadow-xs">
        <h1 className="text-center text-lg sm:text-xl font-black text-slate-900 tracking-tight">
          Result
        </h1>
      </div>

      {/* Filter Tags Row matching Screenshot 2 */}
      <div className="p-3 bg-white border-b border-slate-200 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 min-w-max">
          {filterTags.map((tag) => {
            const isActive = selectedFilter === tag.id;
            return (
              <button
                key={tag.id}
                onClick={() => setSelectedFilter(tag.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 shadow-xs font-extrabold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
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
          <div className="py-12 px-6 text-center rounded-3xl bg-white border border-slate-200 my-4 shadow-xs">
            <Trophy className="w-12 h-12 text-slate-400 mx-auto mb-2" />
            <h3 className="font-bold text-sm text-slate-800">কোনো ফলাফল পাওয়া যায়নি</h3>
            <p className="text-xs text-slate-500 mt-1">ম্যাচ সম্পন্ন হলে এখানে রেজাল্ট প্রদর্শিত হবে।</p>
          </div>
        ) : (
          completedMatches.map((m) => {
            const characterBanner = m.thumbnailUrl || getCharacterBanner(m.categoryId || m.matchType);

            return (
              <div
                key={m.id}
                className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm"
              >
                {/* Winner & Result Header Tag matching Screenshot 2 */}
                <div className="px-3.5 pt-3 pb-1 flex items-center justify-between border-b border-slate-100">
                  <span className="text-xs font-black text-emerald-600 uppercase tracking-wide flex items-center gap-1">
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
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-200">
                      <img
                        src={characterBanner}
                        alt={m.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-extrabold text-sm text-slate-900 truncate">
                        {m.title}
                      </h3>
                      <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                        {m.matchType} • {m.map}
                      </p>
                    </div>
                  </div>

                  {/* 3-Column Stats Grid matching Screenshot 2 */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs mb-3">
                    <div>
                      <div className="text-[9px] font-bold text-slate-500 uppercase">
                        WIN PRIZE
                      </div>
                      <div className="text-sm font-black text-slate-900 tabular-nums mt-0.5">
                        ৳{m.winnerPrize || m.totalPrize}
                      </div>
                    </div>
                    <div className="border-x border-slate-200">
                      <div className="text-[9px] font-bold text-slate-500 uppercase">
                        ENTRY FEE
                      </div>
                      <div className="text-sm font-black text-amber-600 tabular-nums mt-0.5">
                        {m.entryFee === 0 ? 'FREE' : `৳${m.entryFee}`}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] font-bold text-slate-500 uppercase">
                        TOTAL KILLS
                      </div>
                      <div className="text-sm font-black text-emerald-600 tabular-nums mt-0.5">
                        {m.totalKillsWinner || 0}
                      </div>
                    </div>

                    {/* Row 2 */}
                    <div className="pt-2 border-t border-slate-200">
                      <div className="text-[9px] font-bold text-slate-500 uppercase">
                        PER KILL
                      </div>
                      <div className="text-xs font-bold text-slate-700 tabular-nums mt-0.5">
                        ৳{m.perKill}
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-200 border-x border-slate-200">
                      <div className="text-[9px] font-bold text-slate-500 uppercase">
                        MAP
                      </div>
                      <div className="text-xs font-bold text-slate-700 truncate mt-0.5">
                        {m.map}
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-200">
                      <div className="text-[9px] font-bold text-slate-500 uppercase">
                        VERSION
                      </div>
                      <div className="text-xs font-bold text-slate-700 truncate mt-0.5">
                        {m.version}
                      </div>
                    </div>
                  </div>

                  {/* Booyah Champion Box */}
                  <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-yellow-500/15 to-emerald-500/10 border border-amber-400/40 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-500 border border-amber-400/40 flex items-center justify-center font-bold">
                        <Trophy className="w-5 h-5 text-amber-500" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-extrabold text-amber-600 block">
                          Booyah Winner
                        </span>
                        <span className="font-black text-sm text-slate-900">
                          {m.winnerName || 'Winner'}
                        </span>
                        {m.winnerUid && (
                          <div className="text-[10px] text-slate-500 font-mono">
                            UID: {m.winnerUid}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black text-amber-600 tabular-nums block">
                        ৳{m.winnerPrize || m.totalPrize}
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-600">
                        {m.totalKillsWinner || 0} Kills
                      </span>
                    </div>
                  </div>

                  {/* Scoreboard Breakdown if published */}
                  {m.results && m.results.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <div className="text-[11px] font-bold text-slate-500 mb-2">
                        ফলাফল স্কোরবোর্ড (Scoreboard)
                      </div>
                      <div className="space-y-1">
                        {m.results.map((res) => (
                          <div
                            key={res.playerId}
                            className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 border border-slate-200"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-amber-600 w-5">#{res.position}</span>
                              <span className="font-bold text-slate-800">{res.gamerName}</span>
                              <span className="font-mono text-[10px] text-slate-500">{res.uid}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px]">
                              <span className="text-emerald-600 font-bold">{res.kills} Kills</span>
                              {res.prizeWon > 0 && (
                                <span className="text-amber-600 font-black">৳{res.prizeWon}</span>
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
