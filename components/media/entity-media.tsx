'use client';

import { useState } from 'react';
import { Shield } from 'lucide-react';

type PlayerTone = 'emerald' | 'orange' | 'blue' | 'sky' | 'violet';

type PlayerAvatarProps = {
  firstName?: string;
  lastName?: string;
  name?: string;
  imageUrl?: string | null;
  tone?: PlayerTone;
  className?: string;
  imageClassName?: string;
  textClassName?: string;
};

type ClubLogoProps = {
  name: string;
  logoUrl?: string | null;
  className?: string;
  imageClassName?: string;
  fallbackClassName?: string;
  iconClassName?: string;
};

const playerToneClasses: Record<PlayerTone, string> = {
  emerald: 'from-emerald-600 to-emerald-800',
  orange: 'from-orange-600 to-orange-800',
  blue: 'from-blue-600 to-blue-800',
  sky: 'from-sky-500 to-sky-700',
  violet: 'from-violet-600 to-violet-800',
};

function getInitials(firstName?: string, lastName?: string, fallbackName?: string) {
  const fallbackInitials = fallbackName
    ? fallbackName
        .split(' ')
        .filter(Boolean)
        .map((part) => part[0])
        .join('')
    : '';

  return `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase() || fallbackInitials.slice(0, 2).toUpperCase() || '??';
}

export function PlayerAvatar({
  firstName,
  lastName,
  name,
  imageUrl,
  tone = 'emerald',
  className = 'flex h-12 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg',
  imageClassName = 'h-full w-full object-cover object-center',
  textClassName = 'text-xs font-bold', // <-- tekst wraca do własnego propsa
}: PlayerAvatarProps) {
  const displayName = name ?? `${firstName ?? ''} ${lastName ?? ''}`.trim();
  const initials = getInitials(firstName, lastName, displayName);

  return (
    <div className={`bg-linear-to-br ${playerToneClasses[tone]} text-white ${className}`.trim()}>
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={displayName} className={imageClassName} />
      ) : (
        // Zawsze renderuj inicjały ze sparametryzowanym lub domyślnym textClassName
        <span className={textClassName}>{initials}</span>
      )}
    </div>
  );
}

export function ClubLogo({
  name,
  logoUrl,
  className = 'h-8 w-8', // Tu przekazujemy WYŁĄCZNIE wymiary, np. 'h-14 w-14'
  imageClassName = 'object-contain object-center',
  fallbackClassName = 'bg-muted border border-border/30',
  iconClassName = 'text-muted-foreground',
}: ClubLogoProps) {
  const [imageError, setImageError] = useState(false);
  const shouldShowFallback = !logoUrl || imageError;

  if (!shouldShowFallback) {
    return (
      // Kiedy jest logo: Przezroczysty kontener, identyczne wymiary co fallback, brak tła
      <div className={`flex shrink-0 items-center justify-center bg-transparent ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoUrl} alt={name} className={`h-full w-full ${imageClassName}`} onError={() => setImageError(true)} />
      </div>
    );
  }

  return (
    // Kiedy NIE ma logo: Okrągła tarcza (rounded-full), sztywne wymiary z className
    <div className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full ${fallbackClassName} ${className}`}>
      <Shield className={`h-1/2 w-1/2 ${iconClassName}`} />
    </div>
  );
}
