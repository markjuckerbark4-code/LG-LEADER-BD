import React, { useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import { Headphones, X, MessageSquare, Phone, Send, CheckCircle, ExternalLink } from 'lucide-react';

export const FloatingSupport: React.FC = () => {
  const { settings } = useTournament();
  const [isOpen, setIsOpen] = useState(false);
  const [ticketMessage, setTicketMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSendTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketMessage.trim()) return;
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setTicketMessage('');
      setIsOpen(false);
    }, 2000);
  };

  return (
    <>
      {/* Floating Action Buttons: Telegram & Customer Support */}
      <div className="fixed bottom-20 right-4 z-40 flex flex-col items-center gap-2.5">
        {/* Telegram Direct Floating Button */}
        <a
          href="https://t.me/+krR4oOt5WJxkMzc1"
          target="_blank"
          rel="noopener noreferrer"
          className="relative group w-12 h-12 rounded-full bg-gradient-to-tr from-[#229ED9] to-[#2AABEE] p-0.5 shadow-xl hover:scale-110 active:scale-95 transition-all duration-200 border-2 border-white flex items-center justify-center cursor-pointer shadow-sky-500/30"
          title="অফিশিয়াল টেলিগ্রাম চ্যানেলে জয়েন করুন"
          aria-label="Telegram Channel"
        >
          <svg className="w-6 h-6 fill-white ml-[-1px] mt-[1px]" viewBox="0 0 24 24">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.828.946z" />
          </svg>
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-sky-300 border-2 border-white animate-ping" />
        </a>

        {/* Floating Headset Avatar Button */}
        <button
          onClick={() => setIsOpen(true)}
          className="relative group w-12 h-12 rounded-full bg-gradient-to-tr from-purple-200 via-indigo-100 to-amber-100 p-0.5 shadow-xl hover:scale-110 active:scale-95 transition-all duration-200 border-2 border-purple-400 flex items-center justify-center cursor-pointer"
          aria-label="Customer Support"
          title="২৪/৭ কাস্টমার সাপোর্ট"
        >
          {/* Support Headset Agent Graphic */}
          <div className="w-9 h-9 rounded-full bg-amber-200 flex items-center justify-center text-slate-800 shadow-inner relative overflow-hidden">
            <Headphones className="w-5 h-5 text-indigo-950" />
            <div className="absolute -bottom-1 w-5 h-2.5 bg-amber-400 rounded-t-full" />
          </div>

          {/* Active online green badge */}
          <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
        </button>
      </div>

      {/* Support Dialog Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700 text-slate-100 p-5 shadow-2xl">
            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-lg">
                <Headphones className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">{settings.siteName} হেল্পলাইন</h3>
                <p className="text-xs text-emerald-400 font-medium">২৪/৭ অনলাইন কাস্টমার সাপোর্ট</p>
              </div>
            </div>

            {/* Instant Channels */}
            <div className="space-y-2 mb-4">
              <a
                href={`https://wa.me/88${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(settings.siteName)}%20Support`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-emerald-950/60 border border-emerald-600/40 hover:bg-emerald-900/60 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="w-5 h-5 text-emerald-400" />
                  <div>
                    <div className="text-sm font-bold text-emerald-200">হোয়াটসঅ্যাপ সাপোর্ট</div>
                    <div className="text-[11px] text-emerald-400">{settings.whatsappNumber} (সরাসরি মেসেজ)</div>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-emerald-400" />
              </a>

              <a
                href={settings.telegramUsername.startsWith('http') ? settings.telegramUsername : `https://t.me/${settings.telegramUsername.replace('@', '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-sky-950/60 border border-sky-600/40 hover:bg-sky-900/60 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Send className="w-5 h-5 text-sky-400" />
                  <div>
                    <div className="text-sm font-bold text-sky-200">অফিশিয়াল টেলিগ্রাম চ্যানেল</div>
                    <div className="text-[11px] text-sky-400 font-mono">Join Telegram Channel</div>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-sky-400" />
              </a>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                <div className="flex items-center gap-2.5">
                  <Phone className="w-5 h-5 text-amber-400" />
                  <div>
                    <div className="text-sm font-bold text-slate-200">হটলাইন নাম্বার</div>
                    <div className="text-[11px] text-slate-400 font-mono">{settings.helplinePhone}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* In-app Message Form */}
            {isSubmitted ? (
              <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-center">
                <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-1" />
                <p className="text-xs font-bold text-emerald-200">আপনার মেসেজ পাঠানো হয়েছে!</p>
                <p className="text-[11px] text-emerald-300/80 mt-0.5">এডমিন টিম দ্রুত আপনার সাথে যোগাযোগ করবে।</p>
              </div>
            ) : (
              <form onSubmit={handleSendTicket} className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">এডমিনকে সরাসরি মেসেজ লিখুন:</label>
                <textarea
                  rows={2}
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  placeholder="ডিপোজিট, উইথড্র বা রুম আইডি সংক্রান্ত সমস্যা লিখুন..."
                  className="w-full text-xs bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-sky-500 resize-none"
                  required
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-sky-900/40 cursor-pointer active:scale-95 transition-all"
                >
                  মেসেজ পাঠান
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};
