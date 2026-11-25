import React, { useState, useEffect } from 'react';
import { TournamentProvider, useTournament } from './context/TournamentContext';
import { Header } from './components/Header';
import { BottomNav, TabType } from './components/BottomNav';
import { CategoryCard } from './components/CategoryCard';
import { MatchListModal } from './components/MatchListModal';
import { NotificationsView } from './components/NotificationsView';
import { MyMatchesView } from './components/MyMatchesView';
import { ResultsView } from './components/ResultsView';
import { ProfileView } from './components/ProfileView';
import { FloatingSupport } from './components/FloatingSupport';
import { WalletModal } from './components/WalletModal';
import { AdminPanel } from './components/admin/AdminPanel';
import { AuthModal } from './components/AuthModal';
import { WebLockScreen } from './components/WebLockScreen';
import { LandingPage } from './components/LandingPage';

const AppContent: React.FC = () => {
  const {
    categories,
    selectedCategory,
    setSelectedCategory,
    user,
    settings,
    unreadNotificationCount,
  } = useTournament();

  // Route state: checks whether path is '/admin' or '/play'
  const [isAdminPath, setIsAdminPath] = useState<boolean>(() => {
    return window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin');
  });

  const [showWebApp, setShowWebApp] = useState<boolean>(() => {
    return window.location.pathname === '/play' || window.location.pathname.startsWith('/play');
  });

  // Web Lock Unlock State: stored in session & local storage
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    try {
      return (
        sessionStorage.getItem('lgleader_web_unlocked') === 'true' ||
        localStorage.getItem('lgleader_web_unlocked') === 'true'
      );
    } catch {
      return false;
    }
  });

  const [currentTab, setCurrentTab] = useState<TabType>('play');
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [walletDefaultTab, setWalletDefaultTab] = useState<'deposit' | 'withdraw' | 'history'>('deposit');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalReason, setAuthModalReason] = useState<string | null>(null);

  const handleRequireAuth = (reason?: string) => {
    setAuthModalReason(
      reason || 'এই ফিচারটি ব্যবহার করতে অনুগ্রহ করে একটি একাউন্ট তৈরি করুন অথবা লগইন করুন।'
    );
    setIsAuthModalOpen(true);
  };

  const handleOpenWallet = (tab: 'deposit' | 'withdraw' | 'history' = 'deposit') => {
    if (!user) {
      handleRequireAuth('টাকা ডিপোজিট বা ওয়ালেট ব্যবহার করতে অনুগ্রহ করে একটি একাউন্ট তৈরি করুন অথবা লগইন করুন।');
      return;
    }
    setWalletDefaultTab(tab);
    setIsWalletOpen(true);
  };

  // Synchronize browser history and path changes
  useEffect(() => {
    const handlePopState = () => {
      setIsAdminPath(window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin'));
      setShowWebApp(window.location.pathname === '/play' || window.location.pathname.startsWith('/play'));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToAdmin = () => {
    window.history.pushState(null, '', '/admin');
    setIsAdminPath(true);
  };

  const navigateToWebApp = () => {
    window.history.pushState(null, '', '/play');
    setIsAdminPath(false);
    setShowWebApp(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToApp = () => {
    window.history.pushState(null, '', '/');
    setIsAdminPath(false);
    setShowWebApp(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If user requested domain/admin, show Admin Panel
  if (isAdminPath) {
    return <AdminPanel onBackToApp={navigateToApp} />;
  }

  // Web Lock Check: When enabled in settings and visitor hasn't entered the security PIN
  const isWebLockActive = settings?.isWebLockEnabled !== false;
  if (isWebLockActive && !isUnlocked) {
    return (
      <WebLockScreen
        onUnlock={() => setIsUnlocked(true)}
        onAdminAccess={navigateToAdmin}
      />
    );
  }

  // Show App Download Landing Page on '/' unless user clicked "ওয়েবসাইট ভিজিট করুন" (/play)
  if (!showWebApp) {
    return <LandingPage onVisitWebsite={navigateToWebApp} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col items-center">
      {/* Mobile-first ergonomic container centered on large viewports */}
      <div className="w-full max-w-md min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col shadow-2xl relative border-x border-slate-200">
        {/* App Header with status bar & marquee */}
        <Header
          onOpenWallet={() => handleOpenWallet('deposit')}
          onOpenAuth={() => handleRequireAuth()}
          onBackToLanding={navigateToApp}
          currentTab={currentTab}
        />

        {/* Dynamic View Content */}
        <main className="flex-1 w-full flex flex-col bg-[#f8fafc]">
          {/* TAB 1: PLAY (Main Tournament Screen) */}
          {currentTab === 'play' && (
            <div className="flex-1 w-full pb-20 bg-[#f8fafc]">
              {selectedCategory ? (
                <MatchListModal
                  category={selectedCategory}
                  onBack={() => setSelectedCategory(null)}
                  onOpenWallet={() => handleOpenWallet('deposit')}
                  onRequireAuth={handleRequireAuth}
                />
              ) : (
                <div className="p-3 sm:p-4 space-y-4 bg-[#f8fafc]">
                  {/* Top How to Add Money Banner matching Screenshots 2 & 3 */}
                  <div
                    onClick={() => handleOpenWallet('deposit')}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-50 via-sky-50 to-rose-50 border border-slate-200/80 p-4 text-slate-900 shadow-md cursor-pointer hover:shadow-lg transition-all active:scale-[0.99] group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="text-2xl font-black leading-tight tracking-tight">
                          <span className="text-amber-500">কিভাবে?</span><br />
                          <span className="text-sky-600">টাকা ADD</span><br />
                          <span className="text-[#d81b60]">করবেন?</span>
                        </div>
                        <div className="inline-flex items-center gap-1 mt-2 text-[11px] font-bold text-slate-700 bg-white/90 px-2.5 py-1 rounded-full border border-slate-200 shadow-xs">
                          <span>টাকা এড করার সহজ নিয়ম</span>
                          <span className="text-xs">➔</span>
                        </div>
                      </div>

                      {/* Brand gateway icons grid matching Screenshot */}
                      <div className="flex flex-col items-end gap-1.5">
                        <div className="grid grid-cols-2 gap-1.5">
                          <div className="w-10 h-10 rounded-xl bg-[#d81b60] text-white flex items-center justify-center font-black text-[10px] shadow-sm">
                            bKash
                          </div>
                          <div className="w-10 h-10 rounded-xl bg-[#ea580c] text-white flex items-center justify-center font-black text-[10px] shadow-sm">
                            নগদ
                          </div>
                          <div className="w-10 h-10 rounded-xl bg-[#7c3aed] text-white flex items-center justify-center font-black text-[10px] shadow-sm">
                            Rocket
                          </div>
                          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-[10px] shadow-sm">
                            Upay
                          </div>
                        </div>
                        <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                          FAST DEPOSIT
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Running Notice Bar strictly matching Screenshots */}
                  <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold overflow-hidden">
                    <span className="shrink-0 text-amber-600 font-black">📢</span>
                    <div className="truncate text-[11px] text-amber-800 font-bold">
                      {settings.noticeText || 'সব টুর্নামেন্টে অংশ গ্রহন করুন এবং প্রতিদিন হাজার টাকা ইনকাম করুন!'}
                    </div>
                  </div>

                  {/* Section 1: FREE FIRE */}
                  <div className="space-y-2.5">
                    <div className="text-center pt-1">
                      <h2 className="text-lg font-black tracking-wider text-slate-800 uppercase">
                        FREE FIRE
                      </h2>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:gap-3.5">
                      {categories.slice(0, 4).map((category) => (
                        <CategoryCard
                          key={category.id}
                          category={category}
                          onSelect={(cat) => setSelectedCategory(cat)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Section 2: LUDO AND FREE MATCH strictly matching Screenshot */}
                  {categories.length > 4 && (
                    <div className="space-y-2.5 pt-2">
                      <div className="text-center pt-1">
                        <h2 className="text-lg font-black tracking-wider text-slate-800 uppercase">
                          LUDO AND FREE MATCH
                        </h2>
                      </div>

                      <div className="grid grid-cols-2 gap-3 sm:gap-3.5">
                        {categories.slice(4).map((category) => (
                          <CategoryCard
                            key={category.id}
                            category={category}
                            onSelect={(cat) => setSelectedCategory(cat)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MY MATCHES */}
          {currentTab === 'mymatches' && <MyMatchesView onRequireAuth={handleRequireAuth} />}

          {/* TAB 3: RESULTS */}
          {currentTab === 'results' && <ResultsView />}

          {/* TAB 4: NOTIFICATIONS */}
          {currentTab === 'notifications' && (
            <NotificationsView onRequireAuth={handleRequireAuth} />
          )}

          {/* TAB 5: PROFILE */}
          {currentTab === 'profile' && (
            <ProfileView
              onOpenWallet={() => handleOpenWallet('deposit')}
              onOpenWithdraw={() => handleOpenWallet('withdraw')}
              onOpenAuth={() => handleRequireAuth()}
            />
          )}
        </main>

        {/* Floating Customer Support Widget matching screenshots */}
        <FloatingSupport />

        {/* Fixed Mobile Bottom Navigation Bar */}
        <BottomNav
          currentTab={currentTab}
          unreadCount={unreadNotificationCount}
          onTabChange={(tab) => {
            setCurrentTab(tab);
            if (tab !== 'play') {
              setSelectedCategory(null);
            }
          }}
        />

        {/* Wallet Modal (Add Money / Withdraw / History) */}
        {isWalletOpen && (
          <WalletModal
            defaultTab={walletDefaultTab}
            onClose={() => setIsWalletOpen(false)}
          />
        )}

        {/* Login / Registration Popup Modal */}
        {isAuthModalOpen && (
          <AuthModal
            onClose={() => setIsAuthModalOpen(false)}
            reason={authModalReason}
            onSuccess={() => setIsAuthModalOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <TournamentProvider>
      <AppContent />
    </TournamentProvider>
  );
}
