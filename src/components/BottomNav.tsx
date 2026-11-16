import React from 'react';
import { Gamepad2, ListOrdered, BarChart3, Bell, User } from 'lucide-react';

export type TabType = 'play' | 'mymatches' | 'results' | 'notifications' | 'profile';

interface BottomNavProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  unreadCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onTabChange,
  unreadCount = 0,
}) => {
  const tabs = [
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
      id: 'notifications' as TabType,
      label: 'Notification',
      icon: Bell,
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
          const showBadge = tab.id === 'notifications' && unreadCount > 0;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center justify-center h-full w-full py-1 group transition-all cursor-pointer relative"
              aria-label={tab.label}
            >
              {/* Active pill background effect */}
              <div
                className={`relative flex items-center justify-center w-12 h-8 rounded-full transition-all duration-200 ${
                  isActive
                    ? 'bg-purple-100 text-purple-600 scale-105 shadow-xs'
                    : 'text-slate-500 group-hover:text-slate-800'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                {showBadge && (
                  <span className="absolute -top-0.5 right-1 min-w-[16px] h-4 px-1 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center shadow-sm ring-2 ring-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
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
