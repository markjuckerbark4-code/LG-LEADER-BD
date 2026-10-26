import React from 'react';
import { GameCategory } from '../types';
import { Trophy, Swords, Zap, Shield, Flame, Crosshair, Skull, Award } from 'lucide-react';

interface CategoryCardProps {
  category: GameCategory;
  onSelect: (category: GameCategory) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, onSelect }) => {
  // Get an appropriate icon and art styling based on theme
  const renderThemeArt = () => {
    switch (category.imageTheme) {
      case 'br':
        return (
          <div className="relative w-full h-full bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-black/60" />
            <div className="text-center z-10 px-2">
              <span className="font-extrabold text-2xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-100 to-amber-400 drop-shadow-[0_2px_10px_rgba(234,179,8,0.4)]">
                FREE FIRE
              </span>
              <div className="mt-1 flex items-center justify-center gap-1.5 text-xs font-bold text-sky-300 uppercase tracking-wider">
                <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                <span>BATTLE ROYALE</span>
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 text-purple-600/30 font-black text-6xl select-none">
              BR
            </div>
          </div>
        );

      case 'solo':
        return (
          <div className="relative w-full h-full bg-gradient-to-br from-amber-950 via-orange-900 to-slate-950 flex items-center justify-center overflow-hidden">
            <div className="absolute top-2 right-2 bg-red-600 text-white font-black text-[10px] px-2 py-0.5 rounded shadow">
              TOP 10
            </div>
            <div className="text-center z-10 px-2">
              <Flame className="w-8 h-8 text-amber-400 mx-auto animate-pulse" />
              <span className="font-extrabold text-lg text-yellow-300 drop-shadow">
                SOLO SURVIVAL
              </span>
              <p className="text-[10px] text-amber-200/80 font-medium">TOURNAMENT</p>
            </div>
          </div>
        );

      case 'pro':
        return (
          <div className="relative w-full h-full bg-gradient-to-br from-yellow-950 via-amber-900 to-slate-950 flex items-center justify-center overflow-hidden">
            <div className="text-center z-10 px-2">
              <Award className="w-8 h-8 text-yellow-400 mx-auto" />
              <span className="font-extrabold text-xl text-yellow-200 tracking-tight">
                PRO LEAGUE
              </span>
              <p className="text-[10px] text-yellow-400 font-semibold tracking-widest mt-0.5">ELITE ONLY</p>
            </div>
          </div>
        );

      case 'cs4v4':
        return (
          <div className="relative w-full h-full bg-gradient-to-br from-rose-950 via-red-900 to-slate-950 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-500/25 to-transparent" />
            <div className="text-center z-10 px-2">
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className="text-sm font-black text-white">4</span>
                <Swords className="w-4 h-4 text-red-400" />
                <span className="text-sm font-black text-white">4</span>
              </div>
              <span className="font-black text-xl text-white tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                CLASH SQUAD
              </span>
              <div className="text-[10px] font-bold text-red-300">CUSTOM ROOM</div>
            </div>
          </div>
        );

      case 'headshot':
        return (
          <div className="relative w-full h-full bg-gradient-to-br from-red-950 via-orange-950 to-slate-950 flex items-center justify-center overflow-hidden">
            <div className="text-center z-10 px-2">
              <Crosshair className="w-8 h-8 text-red-500 mx-auto" />
              <span className="font-black text-xl text-red-400 tracking-tight drop-shadow">
                CS HEADSHOT
              </span>
              <p className="text-[10px] text-orange-300 font-bold">1-TAP ONLY</p>
            </div>
          </div>
        );

      case 'zonerush':
        return (
          <div className="relative w-full h-full bg-gradient-to-br from-blue-950 via-cyan-900 to-slate-950 flex items-center justify-center overflow-hidden">
            <div className="text-center z-10 px-2">
              <Zap className="w-8 h-8 text-cyan-400 mx-auto" />
              <span className="font-black text-lg text-cyan-200">
                LONE WOLF
              </span>
              <div className="text-[10px] font-bold text-yellow-300 bg-black/40 px-2 py-0.5 rounded inline-block mt-0.5">
                ZONE RUSH
              </div>
            </div>
          </div>
        );

      case 'onehp':
        return (
          <div className="relative w-full h-full bg-gradient-to-br from-zinc-950 via-red-950 to-black flex items-center justify-center overflow-hidden">
            <div className="text-center z-10 px-2">
              <Skull className="w-8 h-8 text-red-600 mx-auto" />
              <span className="font-black text-2xl text-red-500 tracking-wider">
                1 HP
              </span>
              <div className="text-[10px] text-neutral-300 font-bold">ONLY 1 HP CHALLENGE</div>
            </div>
          </div>
        );

      case 'freematch':
        return (
          <div className="relative w-full h-full bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-950 flex items-center justify-center overflow-hidden">
            <div className="text-center z-10 px-2">
              <Shield className="w-8 h-8 text-emerald-400 mx-auto" />
              <span className="font-black text-xl text-emerald-300 tracking-tight">
                FREE MATCH
              </span>
              <div className="text-[10px] font-bold text-yellow-300">GIVEAWAY ৳</div>
            </div>
          </div>
        );

      default:
        return (
          <div className="relative w-full h-full bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 flex items-center justify-center overflow-hidden">
            <div className="text-center z-10 px-2">
              <Trophy className="w-8 h-8 text-sky-400 mx-auto" />
              <span className="font-bold text-lg text-white">
                {category.name}
              </span>
            </div>
          </div>
        );
    }
  };

  return (
    <button
      onClick={() => onSelect(category)}
      className="group relative flex flex-col w-full text-left rounded-2xl overflow-hidden border-2 border-slate-700/80 bg-slate-900 shadow-md hover:border-sky-500/80 hover:shadow-sky-500/20 hover:shadow-xl transition-all duration-200 active:scale-[0.98] cursor-pointer"
    >
      {/* Upper art banner (60% height) */}
      <div className="relative w-full h-28 sm:h-32">
        {renderThemeArt()}
        {category.badge && (
          <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-black/60 text-white backdrop-blur-sm border border-white/20">
            {category.badge}
          </div>
        )}
      </div>

      {/* Lower label banner (White card footer matching screenshot) */}
      <div className="w-full bg-white px-3 py-2.5 flex flex-col justify-center border-t border-slate-300/60">
        <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight uppercase truncate">
          {category.name}
        </h3>
        <p className="text-xs font-semibold text-slate-500 mt-0.5 truncate">
          {category.matchFoundText}
        </p>
      </div>
    </button>
  );
};
