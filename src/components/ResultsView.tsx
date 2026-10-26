import React from 'react';
import { useTournament } from '../context/TournamentContext';
import { Trophy, Medal, Flame, CheckCircle, Crosshair, Award } from 'lucide-react';

export const ResultsView: React.FC = () => {
  const { matches, topPlayers } = useTournament();

  const completedMatches = matches.filter((m) => m.status === 'completed');

  return (
    <div className="w-full pb-24 animate-fadeIn">
      {/* Header */}
      <div className="p-4 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-400" />
          <h2 className="text-xl font-black text-white tracking-tight uppercase">
            টুর্নামেন্ট ফলাফল (Match Results)
          </h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          সম্পন্ন হওয়া সকল ম্যাচের ফলাফল, উইনার তালিকা এবং সর্বোচ্চ প্রাইজ জয়ীদের বিবরণ।
        </p>
      </div>

      <div className="p-4 max-w-2xl mx-auto space-y-5">
        {/* Leaderboard Podiums Top 3 */}
        <div>
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-3 px-1">
            <span className="flex items-center gap-1.5 text-yellow-400">
              <Award className="w-4 h-4" />
              <span>টপ ৩ চ্যাম্পিয়ন প্লেয়ার</span>
            </span>
            <span className="text-slate-500">সর্বমোট জয়</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {topPlayers.slice(0, 3).map((player, index) => {
              const colors = [
                'from-amber-500/20 to-yellow-600/30 border-yellow-500/60 text-yellow-300',
                'from-slate-400/20 to-slate-600/30 border-slate-400/60 text-slate-200',
                'from-amber-700/20 to-orange-800/30 border-amber-700/60 text-amber-400',
              ];

              return (
                <div
                  key={player.rank}
                  className={`p-3 rounded-2xl bg-gradient-to-b border text-center flex flex-col items-center justify-between shadow-lg ${
                    colors[index]
                  }`}
                >
                  <div className="text-xl font-black mb-1">
                    {player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : '🥉'}
                  </div>
                  <h4 className="font-extrabold text-xs text-white truncate max-w-full">
                    {player.name}
                  </h4>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">UID: {player.uid}</div>
                  <div className="text-sm font-black text-amber-300 tabular-nums mt-1.5">
                    ৳{player.wonBDT}
                  </div>
                  <div className="text-[9px] font-bold text-emerald-400 mt-0.5">
                    {player.kills} Kills
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Completed Tournament Cards */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-400 px-1">
            সাম্প্রতিক সম্পন্ন হওয়া ম্যাচ ({completedMatches.length})
          </div>

          {completedMatches.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">কোনো ম্যাচ এখনো সমাপ্ত হয়নি।</p>
          ) : (
            completedMatches.map((m) => (
              <div
                key={m.id}
                className="rounded-2xl bg-slate-900 border border-slate-700/80 p-4 shadow-xl"
              >
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-extrabold text-amber-400 uppercase">
                    {m.categoryName} • Match #{m.matchNumber}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700 font-bold">
                    COMPLETED
                  </span>
                </div>

                <h3 className="font-extrabold text-sm text-white">{m.title}</h3>
                <div className="text-[11px] text-slate-400 mt-0.5 mb-3">
                  ম্যাপ: {m.map} · ধরন: {m.matchType}
                </div>

                {/* Winner Card */}
                <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950/70 via-slate-950 to-emerald-950/70 border border-emerald-600/50 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-yellow-500/20 border border-yellow-500/50 flex items-center justify-center text-yellow-400 shadow-inner">
                      <Trophy className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-emerald-400 uppercase">BOOYAH CHAMPION</div>
                      <div className="text-sm font-black text-white">{m.winnerName || 'Winner'}</div>
                      {m.winnerUid && (
                        <div className="text-[10px] text-slate-400 font-mono">UID: {m.winnerUid}</div>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-black text-amber-400 tabular-nums">
                      ৳{m.winnerPrize || m.totalPrize}
                    </div>
                    <div className="text-[10px] font-semibold text-emerald-300 flex items-center justify-end gap-1">
                      <Crosshair className="w-3 h-3" />
                      <span>{m.totalKillsWinner || 0} Kills</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
