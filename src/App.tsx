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
  const { categories, selectedCategory, setSelectedCategory, user } = useTournament();

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
                  {/* Category Title Header matching Screenshot */}
                  <div className="text-center pt-1 pb-2">
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
                      FREE FIRE
                    </h2>
                    <p className="text-xs font-semibold text-slate-400 mt-0.5">
                      টুর্নামেন্ট মোড সিলেক্ট করে ম্যাচ তালিকা দেখুন
                    </p>
                  </div>

                  {/* 2-Column Game Categories Grid strictly matching screenshots */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-3.5">
                    {categories.map((category) => (
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
