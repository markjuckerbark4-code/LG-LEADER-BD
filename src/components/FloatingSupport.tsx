import React, { useState } from 'react';
import { Headphones, X, MessageSquare, Phone, Send, CheckCircle, ExternalLink } from 'lucide-react';

export const FloatingSupport: React.FC = () => {
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
      {/* Floating Headset Avatar Button */}
      <div className="fixed bottom-20 right-4 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="relative group w-13 h-13 rounded-full bg-gradient-to-tr from-purple-200 via-indigo-100 to-amber-100 p-1 shadow-xl hover:scale-110 active:scale-95 transition-all duration-200 border-2 border-purple-400 flex items-center justify-center cursor-pointer"
          aria-label="Customer Support"
        >
          {/* Support Headset Agent Graphic */}
          <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center text-slate-800 shadow-inner relative overflow-hidden">
            <Headphones className="w-6 h-6 text-indigo-950" />
            <div className="absolute -bottom-1 w-6 h-3 bg-amber-400 rounded-t-full" />
          </div>

          {/* Active online green badge */}
          <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
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
                <h3 className="font-extrabold text-base text-white">LG LEADER BD হেল্পলাইন</h3>
                <p className="text-xs text-emerald-400 font-medium">২৪/৭ অনলাইন কাস্টমার সাপোর্ট</p>
              </div>
            </div>

            {/* Instant Channels */}
            <div className="space-y-2 mb-4">
              <a
                href="https://wa.me/8801812345678?text=Hello%20LG%20LEADER%20BD%20Support,%20I%20need%20help"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-emerald-950/60 border border-emerald-600/40 hover:bg-emerald-900/60 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="w-5 h-5 text-emerald-400" />
                  <div>
                    <div className="text-sm font-bold text-emerald-200">হোয়াটসঅ্যাপ সাপোর্ট</div>
                    <div className="text-[11px] text-emerald-400">01812-345678 (সরাসরি মেসেজ)</div>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-emerald-400" />
              </a>

              <a
                href="https://t.me/lgleaderbd"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-sky-950/60 border border-sky-600/40 hover:bg-sky-900/60 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Send className="w-5 h-5 text-sky-400" />
                  <div>
                    <div className="text-sm font-bold text-sky-200">টেলিগ্রাম চ্যানেল ও গ্রুপ</div>
                    <div className="text-[11px] text-sky-400">@LG_LEADER_BD_OFFICIAL</div>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-sky-400" />
              </a>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                <div className="flex items-center gap-2.5">
                  <Phone className="w-5 h-5 text-amber-400" />
                  <div>
                    <div className="text-sm font-bold text-slate-200">হটলাইন নাম্বার</div>
                    <div className="text-[11px] text-slate-400 font-mono">+880 1812-345678</div>
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
