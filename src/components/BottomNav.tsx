import React from 'react';
import { Store, Gamepad2, ListOrdered, BarChart3, User } from 'lucide-react';

export type TabType = 'shop' | 'play' | 'mymatches' | 'results' | 'profile';

interface BottomNavProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange }) => {
  const tabs = [
    {
      id: 'shop' as TabType,
      label: 'Shop',
      icon: Store,
    },
    {
      id: 'play' as TabType,
      label: 'Play',
      icon: Gamepad2,
    },
    {
      id: 'mymatches' as TabType,
      label: 'My Matches',
      icon: ListOrdered,
    },
    {
      id: 'results' as TabType,
      label: 'Results',
      icon: BarChart3,
    },
    {
      id: 'profile' as TabType,
      label: 'Profile',
      icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-2xl safe-area-pb">
      <div className="max-w-md mx-auto grid grid-cols-5 h-16 items-center px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center justify-center h-full w-full py-1 group transition-all cursor-pointer relative"
              aria-label={tab.label}
            >
              {/* Active pill background effect like screenshot */}
              <div
                className={`flex items-center justify-center w-12 h-8 rounded-full transition-all duration-200 ${
                  isActive
                    ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 scale-105'
                    : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              </div>

              {/* Tab label */}
              <span
                className={`text-[11px] font-semibold tracking-tight transition-colors mt-0.5 truncate max-w-full px-1 ${
                  isActive
                    ? 'text-purple-600 dark:text-purple-300 font-bold'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
