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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-[0_-4px_25px_rgba(0,0,0,0.08)]">
      <div className="max-w-md mx-auto grid grid-cols-5 h-16 items-center px-1 bg-white">
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
                    ? 'bg-purple-100 text-purple-600 scale-105 shadow-xs'
                    : 'text-slate-500 group-hover:text-slate-800'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              </div>

              {/* Tab label */}
              <span
                className={`text-[11px] font-semibold tracking-tight transition-colors mt-0.5 truncate max-w-full px-1 ${
                  isActive
                    ? 'text-purple-600 font-bold'
                    : 'text-slate-500 group-hover:text-slate-700'
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
