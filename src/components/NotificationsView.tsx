import React, { useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import {
  Bell,
  Key,
  Copy,
  Check,
  CheckCheck,
  Trophy,
  AlertCircle,
  Sparkles,
  CheckCircle,
  XCircle,
} from 'lucide-react';

interface NotificationsViewProps {
  onRequireAuth?: (reason?: string) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({ onRequireAuth }) => {
  const {
    user,
    notifications,
    unreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useTournament();

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'room_details':
        return (
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <Key className="w-5 h-5" />
          </div>
        );
      case 'match_prize':
        return (
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
        );
      case 'deposit_approved':
      case 'withdraw_approved':
        return (
          <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
        );
      case 'deposit_rejected':
      case 'withdraw_rejected':
        return (
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5" />
          </div>
        );
    }
  };

  return (
    <div className="w-full pb-24 min-h-screen bg-[#f8fafc] text-slate-900 animate-fadeIn">
      {/* Header */}
      <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">
              নোটিফিকেশন (Notifications)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ম্যাচের রুম আইডি, পাসওয়ার্ড, ডিপোজিট ও উইনিং আপডেট এখানে পাবেন।
          </p>
        </div>

        {user && unreadNotificationCount > 0 && (
          <button
            onClick={markAllNotificationsAsRead}
            className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold text-[11px] flex items-center gap-1 shrink-0 cursor-pointer transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>সব পড়া হয়েছে</span>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4 max-w-2xl mx-auto space-y-3">
        {!user ? (
          <div className="py-12 px-5 text-center rounded-3xl bg-white border border-slate-200 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3 border border-purple-100">
              <Bell className="w-7 h-7" />
            </div>
            <h3 className="font-extrabold text-base text-slate-800">নোটিফিকেশন দেখতে লগইন করুন</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
              ম্যাচে জয়েন করলে এডমিন রুম আইডি ও পাসওয়ার্ড দেওয়ার সাথে সাথে এখানে নোটিফিকেশন পাবেন।
            </p>
            <button
              onClick={() =>
                onRequireAuth?.('আপনার ম্যাচ ও রুম আইডি নোটিফিকেশন দেখতে লগইন অথবা নতুন একাউন্ট তৈরি করুন।')
              }
              className="mt-4 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer"
            >
              লগইন / একাউন্ট তৈরি করুন
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-12 px-4 text-center rounded-3xl bg-white border border-slate-200 shadow-xs">
            <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <h3 className="font-extrabold text-sm text-slate-800">এখনো কোনো নোটিফিকেশন নেই</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              কোনো ম্যাচে জয়েন করলে এডমিন যখন রুম আইডি ও পাসওয়ার্ড দিবে, তখন আপনি সাথে সাথে এখানে নোটিফিকেশন পাবেন।
            </p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => {
                if (!notif.read) markNotificationAsRead(notif.id);
              }}
              className={`rounded-2xl p-4 border transition-all cursor-pointer shadow-xs ${
                notif.read
                  ? 'bg-white border-slate-200'
                  : 'bg-gradient-to-r from-purple-50/80 via-white to-amber-50/50 border-purple-300 shadow-sm'
              }`}
            >
              <div className="flex items-start gap-3">
                {getNotificationIcon(notif.type)}

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-extrabold text-sm text-slate-900 leading-snug">
                      {notif.title}
                    </h3>
                    {!notif.read && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-600 text-white text-[9px] font-black uppercase shrink-0">
                        NEW
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {notif.message}
                  </p>

                  {/* Special Room ID & Password Box */}
                  {notif.type === 'room_details' && notif.roomId && (
                    <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
                      {notif.matchTitle && (
                        <div className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span className="truncate">{notif.matchTitle}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {/* Room ID */}
                        <div className="p-2 rounded-lg bg-white border border-amber-200 flex items-center justify-between gap-1">
                          <div className="min-w-0">
                            <div className="text-[10px] text-slate-500 font-semibold">Room ID</div>
                            <div className="font-mono font-black text-slate-900 truncate">
                              {notif.roomId}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(notif.roomId || '', `rid-${notif.id}`);
                              if (!notif.read) markNotificationAsRead(notif.id);
                            }}
                            className="p-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 shrink-0 cursor-pointer"
                            title="Copy Room ID"
                          >
                            {copiedKey === `rid-${notif.id}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        {/* Room Password */}
                        <div className="p-2 rounded-lg bg-white border border-amber-200 flex items-center justify-between gap-1">
                          <div className="min-w-0">
                            <div className="text-[10px] text-slate-500 font-semibold">Password</div>
                            <div className="font-mono font-black text-slate-900 truncate">
                              {notif.roomPassword || 'N/A'}
                            </div>
                          </div>
                          {notif.roomPassword && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(notif.roomPassword || '', `rpass-${notif.id}`);
                                if (!notif.read) markNotificationAsRead(notif.id);
                              }}
                              className="p-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 shrink-0 cursor-pointer"
                              title="Copy Password"
                            >
                              {copiedKey === `rpass-${notif.id}` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400 font-medium">
                    <span>{notif.createdAt}</span>
                    {notif.read && (
                      <span className="text-slate-400 flex items-center gap-0.5">
                        <CheckCheck className="w-3 h-3" /> দেখা হয়েছে
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
