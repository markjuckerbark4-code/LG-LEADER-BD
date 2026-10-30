import React, { useState, useEffect } from 'react';
import { TournamentProvider, useTournament } from './context/TournamentContext';
import { Header } from './components/Header';
import { BottomNav, TabType } from './components/BottomNav';
import { CategoryCard } from './components/CategoryCard';
import { MatchListModal } from './components/MatchListModal';
import { ShopView } from './components/ShopView';
import { MyMatchesView } from './components/MyMatchesView';
import { ResultsView } from './components/ResultsView';
import { ProfileView } from './components/ProfileView';
import { FloatingSupport } from './components/FloatingSupport';
import { WalletModal } from './components/WalletModal';
import { AdminPanel } from './components/admin/AdminPanel';
import { AuthModal } from './components/AuthModal';

const AppContent: React.FC = () => {
  const { categories, selectedCategory, setSelectedCategory, user, settings } = useTournament();

  // Route state: checks whether path is '/admin'
  const [isAdminPath, setIsAdminPath] = useState<boolean>(() => {
    return window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin');
  });

  const [currentTab, setCurrentTab] = useState<TabType>('play');
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [walletDefaultTab, setWalletDefaultTab] = useState<'deposit' | 'withdraw' | 'history'>('deposit');

  // Synchronize browser history and path changes
  useEffect(() => {
    const handlePopState = () => {
      setIsAdminPath(window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin'));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToAdmin = () => {
    window.history.pushState(null, '', '/admin');
    setIsAdminPath(true);
  };

  const navigateToApp = () => {
    window.history.pushState(null, '', '/');
    setIsAdminPath(false);
  };

  // If user requested domain/admin, show Admin Panel
  if (isAdminPath) {
    return <AdminPanel onBackToApp={navigateToApp} />;
  }

  // If user is not logged in, show beautiful Login / Registration form first!
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center">
        <AuthModal />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center">
      {/* Mobile-first ergonomic container centered on large viewports */}
      <div className="w-full max-w-md min-h-screen bg-slate-950 flex flex-col shadow-2xl relative border-x border-slate-900">
        {/* App Header with status bar & marquee */}
        <Header
          onOpenWallet={() => {
            setWalletDefaultTab('deposit');
            setIsWalletOpen(true);
          }}
          currentTab={currentTab}
        />

        {/* Dynamic View Content */}
        <main className="flex-1 w-full flex flex-col">
          {/* TAB 1: PLAY (Main Tournament Screen) */}
          {currentTab === 'play' && (
            <div className="flex-1 w-full pb-20">
              {selectedCategory ? (
                <MatchListModal
                  category={selectedCategory}
                  onBack={() => setSelectedCategory(null)}
                  onOpenWallet={() => {
                    setWalletDefaultTab('deposit');
                    setIsWalletOpen(true);
                  }}
                />
              ) : (
                <div className="p-3 sm:p-4 space-y-4">
                  {/* Top How to Add Money Banner matching Screenshots 2 & 3 */}
                  <div
                    onClick={() => {
                      setWalletDefaultTab('deposit');
                      setIsWalletOpen(true);
                    }}
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
                  <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold overflow-hidden">
                    <span className="shrink-0 text-amber-400 font-black">📢</span>
                    <div className="truncate text-[11px] text-amber-200">
                      {settings.noticeText || 'সব টুর্নামেন্টে অংশ গ্রহন করুন এবং প্রতিদিন হাজার টাকা ইনকাম করুন!'}
                    </div>
                  </div>

                  {/* Section 1: FREE FIRE */}
                  <div className="space-y-2.5">
                    <div className="text-center pt-1">
                      <h2 className="text-xl font-black tracking-wider text-white uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
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
                        <h2 className="text-xl font-black tracking-wider text-white uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
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

          {/* TAB 2: SHOP (Diamond Top-up) */}
          {currentTab === 'shop' && <ShopView />}

          {/* TAB 3: MY MATCHES */}
          {currentTab === 'mymatches' && <MyMatchesView />}

          {/* TAB 4: RESULTS */}
          {currentTab === 'results' && <ResultsView />}

          {/* TAB 5: PROFILE */}
          {currentTab === 'profile' && (
            <ProfileView
              onOpenWallet={() => {
                setWalletDefaultTab('deposit');
                setIsWalletOpen(true);
              }}
              onOpenWithdraw={() => {
                setWalletDefaultTab('withdraw');
                setIsWalletOpen(true);
              }}
            />
          )}
        </main>

        {/* Floating Customer Support Widget matching screenshots */}
        <FloatingSupport />

        {/* Fixed Mobile Bottom Navigation Bar */}
        <BottomNav
          currentTab={currentTab}
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
