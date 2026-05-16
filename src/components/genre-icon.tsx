'use client';

import {
  RiSwordLine,
  RiCompass3Line,
  RiPaintBrushLine,
  RiEmotionLaughLine,
  RiSpyLine,
  RiFilmLine,
  RiHeart2Line,
  RiGroupLine,
  RiMagicLine,
  RiBookOpenLine,
  RiGhostLine,
  RiMusic2Line,
  RiSearchEyeLine,
  RiHeartLine,
  RiRocketLine,
  RiAlarmWarningLine,
  RiShieldLine,
  RiSunLine,
} from 'react-icons/ri';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  action: RiSwordLine,
  adventure: RiCompass3Line,
  animation: RiPaintBrushLine,
  comedy: RiEmotionLaughLine,
  crime: RiSpyLine,
  documentary: RiFilmLine,
  drama: RiHeart2Line,
  family: RiGroupLine,
  fantasy: RiMagicLine,
  history: RiBookOpenLine,
  horror: RiGhostLine,
  music: RiMusic2Line,
  mystery: RiSearchEyeLine,
  romance: RiHeartLine,
  'sci-fi': RiRocketLine,
  thriller: RiAlarmWarningLine,
  war: RiShieldLine,
  western: RiSunLine,
};

interface GenreIconProps {
  slug: string;
  className?: string;
}

export function GenreIcon({ slug, className = 'w-5 h-5' }: GenreIconProps) {
  const Icon = iconMap[slug] || RiFilmLine;
  return <Icon className={className} />;
}
