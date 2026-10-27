import React, { useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import { Key, Copy, Check, Clock, Trophy, Flame, AlertCircle } from 'lucide-react';

export const MyMatchesView: React.FC = () => {
  const { matches, user } = useTournament();
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Filter matches where user is enrolled
  const myJoinedMatches = user
    ? matches.filter((m) =>
        m.joinedPlayers.some((p) => p.userId === user.id || p.uid === user.freeFireUid)
      )
    : [];

  const filteredMatches = myJoinedMatches.filter((m) => {
    if (filter === 'upcoming') return m.status === 'upcoming' || m.status === 'ongoing';
    if (filter === 'completed') return m.status === 'completed';
    return true;
  });

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="w-full pb-24 animate-fadeIn">
      {/* Header */}
      <div className="p-4 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 border-b border-slate-800">
        <h2 className="text-xl font-black text-white tracking-tight uppercase">
          আমার ম্যাচ সমূহ (My Matches)
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          আপনি যে সকল টুর্নামেন্টে জয়েন করেছেন তার তালিকা ও রুম আইডি পাসওয়ার্ড।
        </p>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 mt-3">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === 'all'
                ? 'bg-sky-500 text-white'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            সবগুলো ({myJoinedMatches.length})
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === 'upcoming'
                ? 'bg-sky-500 text-white'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            আসন্ন / লাইভ
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === 'completed'
                ? 'bg-sky-500 text-white'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            সমাপ্ত
          </button>
        </div>
      </div>

      {/* Matches List */}
      <div className="p-4 max-w-2xl mx-auto space-y-4">
        {filteredMatches.length === 0 ? (
          <div className="py-12 px-4 text-center rounded-3xl bg-slate-900/60 border border-slate-800">
            <AlertCircle className="w-10 h-10 text-slate-500 mx-auto mb-2" />
            <h3 className="font-extrabold text-sm text-white">এখনো কোনো ম্যাচে জয়েন করেননি</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Play সেকশনে গিয়ে আপনার পছন্দের টুর্নামেন্টে জয়েন করুন এবং ক্যাশ প্রাইজ জিতে নিন!
            </p>
          </div>
        ) : (
          filteredMatches.map((match) => {
            const myEntry = match.joinedPlayers.find(
              (p) => user && (p.userId === user.id || p.uid === user.freeFireUid)
            );

            return (
              <div
                key={match.id}
                className="rounded-2xl bg-slate-900 border border-slate-700 overflow-hidden shadow-xl"
              >
                {/* Match Card Top */}
                <div className="px-4 py-2.5 bg-slate-800/70 border-b border-slate-700/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-amber-400 uppercase">
                      {match.categoryName}
                    </span>
                    <span className="text-slate-500">·</span>
                    <span className="text-slate-300 font-semibold">{match.map}</span>
                  </div>

                  <span
                    className={`font-black text-[10px] px-2 py-0.5 rounded uppercase tracking-wider ${
                      match.status === 'completed'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                        : match.roomId
                        ? 'bg-amber-950 text-amber-300 border border-amber-600 animate-pulse'
                        : 'bg-sky-950 text-sky-300 border border-sky-700'
                    }`}
                  >
                    {match.status === 'completed'
                      ? 'COMPLETED'
                      : match.roomId
                      ? 'ROOM READY'
                      : 'UPCOMING'}
                  </span>
                </div>

                {/* Match Card Content */}
                <div className="p-4">
                  <h3 className="font-black text-sm text-white">{match.title}</h3>

                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 mb-3">
                    <Clock className="w-3.5 h-3.5 text-sky-400" />
                    <span>{match.scheduleTime}</span>
                    {myEntry && (
                      <span className="text-sky-300 font-bold bg-sky-950/80 px-2 py-0.5 rounded text-[10px]">
                        Slot #{myEntry.slotNo}
                      </span>
                    )}
                  </div>

                  {/* ROOM DETAILS BOX */}
                  {match.roomId && match.isRoomVisibleToPlayers !== false ? (
                    <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/60 mb-3">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 mb-2">
                        <Key className="w-4 h-4 text-amber-400" />
                        <span>কাস্টম রুম তথ্য (Room Info)</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 rounded-lg bg-black/60 flex items-center justify-between">
                          <div>
                            <div className="text-[10px] text-slate-400">Room ID:</div>
                            <div className="font-mono font-black text-amber-300">{match.roomId}</div>
                          </div>
                          <button
                            onClick={() => copyToClipboard(match.roomId || '', `m-room-${match.id}`)}
                            className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white"
                          >
                            {copiedKey === `m-room-${match.id}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        <div className="p-2 rounded-lg bg-black/60 flex items-center justify-between">
                          <div>
                            <div className="text-[10px] text-slate-400">Password:</div>
                            <div className="font-mono font-black text-amber-300">
                              {match.roomPassword || 'None'}
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              copyToClipboard(match.roomPassword || '', `m-pass-${match.id}`)
                            }
                            className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white"
                          >
                            {copiedKey === `m-pass-${match.id}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                      <p className="text-[10px] text-amber-300/80 mt-2">
                        দ্রুত ফ্রি ফায়ারে ঢুকে কাস্টম রুমে জয়েন করুন। ম্যাচ শুরুর পর রুমে ঢুকতে না পারলে কতৃপক্ষ দায়ী নয়।
                      </p>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 mb-3 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>রুম আইডি ও পাসওয়ার্ড ম্যাচ শুরুর ১০ মিনিট আগে এখানে শো করবে।</span>
                    </div>
                  )}

                  {/* Winner banner if completed */}
                  {match.status === 'completed' && match.winnerName && (
                    <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-600/50 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-yellow-400" />
                        <div>
                          <span className="text-[10px] text-emerald-300 font-bold block">Booyah Winner:</span>
                          <span className="font-black text-white">{match.winnerName}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-amber-400 font-black">৳{match.winnerPrize}</span>
                      </div>
                    </div>
                  )}

                  {/* Registered details */}
                  {myEntry && (
                    <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2 mt-2">
                      <span>IGN: <strong className="text-slate-200">{myEntry.gamerName}</strong></span>
                      <span>UID: <strong className="font-mono text-slate-200">{myEntry.uid}</strong></span>
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
