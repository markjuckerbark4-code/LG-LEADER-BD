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
      className="group relative flex flex-col w-full text-left rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-lg hover:border-sky-500/80 hover:shadow-sky-500/20 hover:shadow-2xl transition-all duration-300 active:scale-[0.98] cursor-pointer"
    >
      {/* Upper art banner with Free Fire Character Illustration */}
      <div className="relative w-full h-32 sm:h-36 overflow-hidden bg-slate-950">
        <img
          src={characterBanner}
          alt={category.name}
          className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Cinematic gradient overlay & vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/30" />

        {/* Free Fire Character Tag badge */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-amber-400/40 text-[10px] font-black text-amber-300 shadow-sm">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>{getFeaturedCharacter()}</span>
        </div>

        {/* Category Badge (HOT / TOP 10 / 4v4 / FREE) */}
        {category.badge && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-600/90 text-white shadow-lg border border-red-400/50 backdrop-blur-sm flex items-center gap-1">
            <Flame className="w-2.5 h-2.5" />
            <span>{category.badge}</span>
          </div>
        )}

        {/* Match Count Badge */}
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/80 text-sky-300 border border-sky-500/40 backdrop-blur-sm">
          {category.matchCount} Matches
        </div>
      </div>

      {/* Lower label banner */}
      <div className="w-full bg-gradient-to-b from-slate-900 to-slate-950 px-3 py-2.5 flex flex-col justify-center border-t border-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-sm sm:text-base text-white tracking-tight uppercase truncate group-hover:text-sky-400 transition-colors">
            {category.name}
          </h3>
          <Trophy className="w-3.5 h-3.5 text-amber-400/80 shrink-0 ml-1 group-hover:scale-110 transition-transform" />
        </div>
        <p className="text-[11px] font-medium text-slate-400 mt-0.5 truncate">
          {category.matchFoundText}
        </p>
      </div>
    </button>
  );
};
