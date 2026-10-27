import alokBanner from './ff_alok_br_banner_1793071503171.jpg';
import hayatoBanner from './ff_hayato_cs_1793071520440.jpg';
import chronoBanner from './ff_chrono_banner_1793071536791.jpg';
import kellyBanner from './ff_kelly_banner_1793071553425.jpg';

export { alokBanner, hayatoBanner, chronoBanner, kellyBanner };

export const CHARACTER_IMAGES: Record<string, string> = {
  alok: alokBanner,
  hayato: hayatoBanner,
  chrono: chronoBanner,
  kelly: kellyBanner,
};

// Map match category or mode to appropriate character banner
export function getCharacterBanner(themeOrCategory: string): string {
  const t = (themeOrCategory || '').toLowerCase();
  if (t.includes('cs') || t.includes('clash') || t.includes('headshot') || t.includes('4v4')) {
    return hayatoBanner;
  }
  if (t.includes('lone') || t.includes('wolf') || t.includes('1hp') || t.includes('1-hp') || t.includes('zone')) {
    return chronoBanner;
  }
  if (t.includes('free') || t.includes('survival') || t.includes('loss') || t.includes('rush')) {
    return kellyBanner;
  }
  return alokBanner;
}
