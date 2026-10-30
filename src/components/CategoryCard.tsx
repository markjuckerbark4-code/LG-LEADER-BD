import React from 'react';
import { GameCategory } from '../types';
import { getCharacterBanner } from '../assets/images';
import { Trophy, Swords, Flame, Sparkles } from 'lucide-react';

interface CategoryCardProps {
  category: GameCategory;
  onSelect: (category: GameCategory) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, onSelect }) => {
  const characterBanner = getCharacterBanner(category.id || category.imageTheme);

  // Return the featured Free Fire character name based on mode
  const getFeaturedCharacter = () => {
    const id = (category.id || '').toLowerCase();
    if (id.includes('br') || id.includes('pro')) return 'DJ ALOK';
    if (id.includes('cs') || id.includes('headshot')) return 'HAYATO';
    if (id.includes('zone') || id.includes('wolf') || id.includes('1-hp')) return 'CHRONO';
    return 'KELLY SWIFT';
  };

  return (
    <button
      onClick={() => onSelect(category)}
      className="group relative flex flex-col w-full text-left rounded-2xl overflow-hidden border border-slate-800/80 bg-white dark:bg-slate-900 shadow-md hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
    >
      {/* Upper art banner with Free Fire Character Illustration */}
      <div className="relative w-full h-28 sm:h-32 overflow-hidden bg-slate-950">
        <img
          src={characterBanner}
          alt={category.name}
          className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Mode / Character Tag on art */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-black text-amber-300 border border-amber-400/30">
          <Sparkles className="w-2.5 h-2.5 text-amber-400" />
          <span>{getFeaturedCharacter()}</span>
        </div>

        {/* Badge (HOT / PRO / FREE) */}
        {category.badge && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-red-600 text-white shadow-md border border-red-400/40">
            {category.badge}
          </div>
        )}
      </div>

      {/* Lower label banner matching screenshot 1 (Clean card base) */}
      <div className="w-full bg-white dark:bg-slate-900 px-3 py-2.5 flex flex-col justify-center border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white tracking-tight uppercase truncate">
            {category.name}
          </h3>
          <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0 ml-1" />
        </div>
        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5 truncate">
          {category.matchCount} Tournament {category.matchCount === 1 ? 'Match' : 'Matches'}
        </p>
      </div>
    </button>
  );
};
