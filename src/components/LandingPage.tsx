import React, { useState, useEffect } from 'react';
import {
  Download,
  Globe,
  ArrowRight,
  Users,
  Headphones,
  Trophy,
  CreditCard,
  Wallet,
  ShieldCheck,
  Award,
  UserPlus,
  Play,
  ChevronDown,
  Send,
  Mail,
  MapPin,
  Check,
  AlertCircle,
  CheckCircle2,
  Code2,
} from 'lucide-react';
import { useTournament } from '../context/TournamentContext';
import appLogo from '../assets/images/lg_leader_logo_1795588158182.jpg';

interface LandingPageProps {
  onVisitWebsite: () => void;
}

interface ServerApkInfo {
  exists: boolean;
  fileName?: string;
  fileSize?: number;
  version?: string;
  uploadedAt?: string;
  downloadUrl?: string;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onVisitWebsite }) => {
  const { settings } = useTournament();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [serverApkInfo, setServerApkInfo] = useState<ServerApkInfo | null>(null);
  const [downloadNotice, setDownloadNotice] = useState<{
    type: 'success' | 'info';
    message: string;
  } | null>(null);

  useEffect(() => {
    let active = true;
    fetch('/api/apk-info')
      .then((res) => (res.ok ? res.json() : { exists: false }))
      .then((data: ServerApkInfo) => {
        if (active) setServerApkInfo(data);
      })
      .catch(() => {
        if (active) setServerApkInfo({ exists: false });
      });
    return () => {
      active = false;
    };
  }, [settings.appUpdatedAt, settings.appApkUrl]);

  const formatFileSize = (bytes?: number) => {
    if (!bytes || bytes <= 0) return '';
    const mb = bytes / (1024 * 1024);
    return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
  };

  const handleDownloadApk = () => {
    setDownloadNotice(null);

    // Priority 1: Server-hosted APK uploaded by admin
    if (serverApkInfo?.exists) {
      const fileName = serverApkInfo.fileName || settings.appApkFileName || 'LG_LEADER_BD.apk';
      const link = document.createElement('a');
      link.href = `/api/download-apk?t=${Date.now()}`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadNotice({
        type: 'success',
        message: `ডাউনলোড শুরু হয়েছে! (${fileName}${serverApkInfo.fileSize ? ` • ${formatFileSize(serverApkInfo.fileSize)}` : ''})। ডাউনলোড শেষ হলে APK ফাইলটি ইনস্টল করুন।`,
      });
      return;
    }

    // Priority 2: External direct APK link set by admin
    if (settings.appApkUrl && settings.appApkUrl.trim() && settings.appApkUrl !== '/api/download-apk') {
      const targetUrl = settings.appApkUrl.trim();
      const fileName = settings.appApkFileName || 'LG_LEADER_BD.apk';
      const link = document.createElement('a');
      link.href = targetUrl;
      link.setAttribute('download', fileName);
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadNotice({
        type: 'success',
        message: `ডাউনলোড শুরু হয়েছে! (${fileName})। ডাউনলোড শেষ হলে ফাইলটি ইনস্টল করুন।`,
      });
      return;
    }

    // Fallback when no APK is uploaded yet
    setDownloadNotice({
      type: 'info',
      message:
        'অফিশিয়াল APK ফাইলটি এখনো আপডেট/আপলোড করা হয়নি। আপনি চাইলে নিচের "ওয়েবসাইট ভিজিট করুন" বাটনে ক্লিক করে সরাসরি ওয়েবসাইটে খেলতে পারেন!',
    });
  };

  const siteName = settings.siteName || 'LG LEADER BD';
  const downloadsLabel = settings.appDownloadsLabel || '১২হাজার+';
  const playersLabel = settings.appPlayersLabel || '৪হাজার+';
  const supportEmail = settings.appSupportEmail || settings.supportEmail || 'support@app.lgleaderbd.site';
  const locationLabel = settings.appLocationLabel || 'Dhaka, Bangladesh';
  const telegramHref = settings.telegramUsername?.startsWith('http')
    ? settings.telegramUsername
    : settings.telegramUsername
    ? `https://t.me/${settings.telegramUsername.replace('@', '')}`
    : 'https://t.me';

  const faqs = [
    {
      q: 'অ্যাপটি কি ইনস্টল করা নিরাপদ?',
      a: 'হ্যাঁ, আমাদের অফিশিয়াল অ্যাপটি সম্পূর্ণ ভাইরাস-মুক্ত এবং নিরাপদ। লক্ষ লক্ষ প্লেয়ার প্রতিদিন নিশ্চিন্তে এই অ্যাপ ব্যবহার করে টুর্নামেন্টে অংশগ্রহণ করছেন।',
    },
    {
      q: 'APK ইনস্টল করতে কী করতে হবে?',
      a: 'প্রথমে "অ্যাপ ডাউনলোড করুন" বাটনে ক্লিক করে APK ফাইলটি ডাউনলোড করুন। এরপর আপনার ফোনের Settings থেকে "Install from Unknown Sources" অনুমতি অন করে অ্যাপটি ইনস্টল করুন।',
    },
    {
      q: 'সাপোর্ট কীভাবে পাব?',
      a: 'যেকোনো সমস্যায় আমাদের ২৪/৭ টেলিগ্রাম চ্যানেল অথবা হোয়াটসঅ্যাপ হেল্পলাইনে যোগাযোগ করতে পারেন। কয়েক মিনিটের মধ্যেই সমাধান দেওয়া হয়।',
    },
  ];

  const versionDisplay = serverApkInfo?.version || settings.appVersion;
  const sizeDisplay = serverApkInfo?.fileSize
    ? formatFileSize(serverApkInfo.fileSize)
    : settings.appFileSize || '';

  return (
    <div className="min-h-screen w-full bg-[#060917] text-slate-100 relative overflow-x-hidden font-sans selection:bg-purple-500 selection:text-white">
      {/* Subtle Dark Grid Overlay + Ambient Radial Glows matching design */}
      <div
        className="pointer-events-none fixed inset-0 opacity-25"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(148, 163, 184, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.08) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <div className="pointer-events-none fixed -top-24 -left-24 w-96 h-96 rounded-full bg-cyan-500/15 blur-[120px]" />
      <div className="pointer-events-none fixed top-1/3 -right-24 w-96 h-96 rounded-full bg-purple-600/20 blur-[130px]" />
      <div className="pointer-events-none fixed bottom-0 left-1/4 w-80 h-80 rounded-full bg-indigo-600/15 blur-[120px]" />

      {/* Top Sticky Navbar */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#070b1a]/80 border-b border-white/10">
        <div className="max-w-lg mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src={appLogo}
              alt={siteName}
              className="w-9 h-9 rounded-xl object-cover ring-1 ring-white/20 shadow-md"
            />
            <span className="font-black text-base tracking-wide text-white uppercase">
              {siteName}
            </span>
          </div>

          <button
            type="button"
            onClick={handleDownloadApk}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 hover:from-indigo-400 hover:to-fuchsia-400 text-white font-bold text-xs shadow-lg shadow-purple-500/25 active:scale-95 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ডাউনলোড</span>
          </button>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="relative z-10 max-w-lg mx-auto px-4 pt-8 pb-12 space-y-14">
        {/* ================= HERO SECTION ================= */}
        <section className="flex flex-col items-center text-center">
          {/* Glowing App Icon */}
          <div className="relative mb-5">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-cyan-400/35 via-purple-500/35 to-amber-400/35 blur-xl scale-110" />
            <img
              src={appLogo}
              alt={siteName}
              className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover border-2 border-cyan-400/50 shadow-2xl"
            />
          </div>

          {/* Live Status Indicator */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>অফিশিয়াল অ্যাপ • এখন লাইভ</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-snug text-white">
            বাংলাদেশের
            <span className="block bg-gradient-to-r from-cyan-300 via-sky-400 to-teal-300 bg-clip-text text-transparent mt-0.5">
              #১ গেমিং প্ল্যাটফর্ম
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm text-slate-300/90 max-w-sm mt-3 leading-relaxed">
            দ্রুত ডিপোজিট, ঝটপট উইথড্র আর ২৪/৭ সাপোর্ট, সবকিছু এক অ্যাপেই।
          </p>

          {/* Three Action Highlights (Clean unboxed metadata separated by dots) */}
          <div className="flex items-center justify-center gap-3 mt-4 text-xs font-bold text-slate-300">
            <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10">খেলুন</span>
            <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10">জিতুন</span>
            <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10">উপভোগ করুন</span>
          </div>

          {/* Primary CTA: App Download */}
          <div className="w-full space-y-3 mt-6">
            <button
              type="button"
              onClick={handleDownloadApk}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 hover:from-indigo-400 hover:via-purple-400 hover:to-fuchsia-400 text-white font-black text-base shadow-xl shadow-purple-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Download className="w-5 h-5" />
              <span>অ্যাপ ডাউনলোড করুন</span>
            </button>

            {/* Secondary CTA right below: Visit Website */}
            <button
              type="button"
              onClick={onVisitWebsite}
              className="w-full py-3.5 px-6 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-cyan-400/40 hover:border-cyan-400 text-cyan-300 hover:text-cyan-200 font-black text-sm shadow-lg shadow-cyan-950/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>ওয়েবসাইট ভিজিট করুন</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Download Feedback Message */}
          {downloadNotice && (
            <div
              className={`w-full mt-4 p-3.5 rounded-2xl text-xs font-semibold flex items-start gap-2.5 text-left border ${
                downloadNotice.type === 'success'
                  ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-200'
                  : 'bg-amber-950/60 border-amber-500/40 text-amber-200'
              }`}
            >
              {downloadNotice.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              )}
              <span>{downloadNotice.message}</span>
            </div>
          )}

          {/* Trust Micro Checkmarks */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 mt-4 text-[11px] font-semibold text-slate-400">
            <span className="flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-emerald-400" /> ফ্রি ডাউনলোড
            </span>
            <span className="flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-emerald-400" /> অ্যান্ড্রয়েড APK
              {sizeDisplay ? ` (${sizeDisplay})` : ''}
            </span>
            <span className="flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-emerald-400" /> নিরাপদ
              {versionDisplay ? ` · ${versionDisplay}` : ''}
            </span>
          </div>

          {/* 2x2 Stats Grid */}
          <div className="w-full grid grid-cols-2 gap-3 mt-8">
            <div className="p-4 rounded-2xl bg-[#0e1428]/90 border border-white/10 flex flex-col items-center text-center shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-400/20 text-sky-400 flex items-center justify-center mb-2.5">
                <Download className="w-5 h-5" />
              </div>
              <div className="text-xl font-black text-white">{downloadsLabel}</div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">Downloads</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0e1428]/90 border border-white/10 flex flex-col items-center text-center shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-400/20 text-emerald-400 flex items-center justify-center mb-2.5">
                <Users className="w-5 h-5" />
              </div>
              <div className="text-xl font-black text-white">{playersLabel}</div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">Regular Players</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0e1428]/90 border border-white/10 flex flex-col items-center text-center shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-400/20 text-purple-400 flex items-center justify-center mb-2.5">
                <Headphones className="w-5 h-5" />
              </div>
              <div className="text-xl font-black text-white">24/7</div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">Support</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0e1428]/90 border border-white/10 flex flex-col items-center text-center shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-400/20 text-amber-400 flex items-center justify-center mb-2.5">
                <Trophy className="w-5 h-5" />
              </div>
              <div className="text-xl font-black text-white">২+</div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">Games &amp; Modes</div>
            </div>
          </div>
        </section>

        {/* ================= WHY CHOOSE US ================= */}
        <section className="space-y-4">
          <div className="text-center">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-cyan-400">
              WHY CHOOSE US
            </span>
            <h2 className="text-2xl font-black text-white mt-1">
              কেন আমাদের প্ল্যাটফর্ম বেছে নিবেন?
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              বাংলাদেশের সবচেয়ে বিশ্বস্ত এবং নিরাপদ গেমিং প্ল্যাটফর্ম
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-[#0e1428]/90 border border-white/10 flex items-center gap-4 shadow-md">
              <div className="w-11 h-11 rounded-xl bg-rose-500/15 border border-rose-400/20 text-rose-400 flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white">Instant Deposits</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Deposit money instantly and start playing
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0e1428]/90 border border-white/10 flex items-center gap-4 shadow-md">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-400/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white">Instant Withdrawal</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Withdraw your winnings immediately without any delay
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0e1428]/90 border border-white/10 flex items-center gap-4 shadow-md">
              <div className="w-11 h-11 rounded-xl bg-sky-500/15 border border-sky-400/20 text-sky-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white">Secure and Safe</h3>
                <p className="text-xs text-slate-400 mt-0.5">Your money is safe with us</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0e1428]/90 border border-white/10 flex items-center gap-4 shadow-md">
              <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-400/20 text-amber-400 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white">Best Rewards</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Get the best rewards for your performance
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= GET STARTED ================= */}
        <section className="space-y-5">
          <div className="text-center">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-cyan-400">
              GET STARTED
            </span>
            <h2 className="text-2xl font-black text-white mt-1">মাত্র ৩ ধাপে শুরু করুন</h2>
            <p className="text-xs text-slate-400 mt-1">সহজ প্রক্রিয়ায় কয়েক মিনিটেই রেডি</p>
          </div>

          <div className="relative space-y-3">
            {/* Vertical Connecting Line */}
            <div className="pointer-events-none absolute left-9 top-10 bottom-10 w-0.5 bg-gradient-to-b from-indigo-500/60 via-purple-500/60 to-sky-500/60" />

            <div className="relative p-4 rounded-2xl bg-[#0e1428]/90 border border-white/10 flex items-center gap-4 shadow-md">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/25 z-10">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white">অ্যাপ ডাউনলোড করুন</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  নিচের বাটন থেকে APK ফাইলটি নামান।
                </p>
              </div>
            </div>

            <div className="relative p-4 rounded-2xl bg-[#0e1428]/90 border border-white/10 flex items-center gap-4 shadow-md">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/25 z-10">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white">অ্যাকাউন্ট খুলুন</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  অ্যাপ ইনস্টল করে সহজে রেজিস্ট্রেশন করুন।
                </p>
              </div>
            </div>

            <div className="relative p-4 rounded-2xl bg-[#0e1428]/90 border border-white/10 flex items-center gap-4 shadow-md">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-sky-500/25 z-10">
                <Play className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white">খেলা শুরু করুন</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  ডিপোজিট করে পছন্দের গেম খেলুন।
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= FAQ ACCORDION ================= */}
        <section className="space-y-4">
          <div className="text-center">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-cyan-400">
              FAQ
            </span>
            <h2 className="text-2xl font-black text-white mt-1">সাধারণ জিজ্ঞাসা</h2>
          </div>

          <div className="space-y-2.5">
            {faqs.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-[#0e1428]/90 border border-white/10 overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 flex items-center justify-between text-left text-sm font-bold text-white hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-cyan-400' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-slate-300 leading-relaxed border-t border-white/5 pt-3">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ================= BOTTOM CTA ================= */}
        <section className="text-center space-y-3 pt-2">
          <h2 className="text-lg font-extrabold text-white">Download now and start playing!</h2>
          <button
            type="button"
            onClick={handleDownloadApk}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 hover:from-indigo-400 hover:to-fuchsia-400 text-white font-black text-base shadow-xl shadow-purple-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-5 h-5" />
            <span>Download App</span>
          </button>

          <button
            type="button"
            onClick={onVisitWebsite}
            className="w-full py-3.5 px-6 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-cyan-400/40 text-cyan-300 font-black text-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Globe className="w-4 h-4 text-cyan-400" />
            <span>ওয়েবসাইট ভিজিট করুন</span>
          </button>
        </section>

        {/* ================= OUR COMMUNITY ================= */}
        <section className="p-6 rounded-3xl bg-[#0e1428]/90 border border-white/10 text-center space-y-4 shadow-xl">
          <div>
            <h3 className="text-lg font-black text-white">Our Community</h3>
            <p className="text-xs text-slate-400 mt-1">
              আপডেট ও সাপোর্টের জন্য আমাদের সাথে যুক্ত থাকুন
            </p>
          </div>

          <div className="flex justify-center">
            <a
              href={telegramHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1.5 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-400/30 text-sky-400 group-hover:bg-sky-500 group-hover:text-white flex items-center justify-center transition-all shadow-md">
                <Send className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-300 group-hover:text-white">
                Telegram
              </span>
            </a>
          </div>
        </section>

        {/* ================= FOOTER ================= */}
        <footer className="pt-4 border-t border-white/10 text-center space-y-4">
          <div className="flex items-center justify-center gap-2.5">
            <img
              src={appLogo}
              alt={siteName}
              className="w-8 h-8 rounded-xl object-cover ring-1 ring-white/20"
            />
            <span className="font-black text-base tracking-wide uppercase">
              <span className="text-white">{siteName.split(' ').slice(0, -1).join(' ') || siteName} </span>
              <span className="text-cyan-400">{siteName.split(' ').slice(-1)[0]}</span>
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-semibold text-slate-300">
            <Code2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Official App</span>
          </div>

          <div className="space-y-2.5">
            <a
              href={`mailto:${supportEmail}`}
              className="w-full py-3 px-4 rounded-xl bg-[#0e1428]/90 border border-white/10 text-xs text-slate-300 hover:text-white flex items-center justify-center gap-2 transition-colors"
            >
              <Mail className="w-4 h-4 text-sky-400" />
              <span>{supportEmail}</span>
            </a>

            <div className="w-full py-3 px-4 rounded-xl bg-[#0e1428]/90 border border-white/10 text-xs text-slate-300 flex items-center justify-center gap-2">
              <MapPin className="w-4 h-4 text-sky-400" />
              <span>{locationLabel}</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
            ১৮+ বয়সীদের জন্য। দায়িত্বশীলতার সাথে খেলুন এবং নিজের ঝুঁকি বুঝে সিদ্ধান্ত নিন।
          </p>

          <div className="text-[11px] text-slate-500 space-y-1 pb-4">
            <p>© 2026 {siteName} | All Rights Reserved</p>
            <p className="text-[10px] tracking-wider uppercase text-slate-500">
              DEVELOPED BY <span className="text-cyan-400 font-bold">{siteName}</span>
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
};
