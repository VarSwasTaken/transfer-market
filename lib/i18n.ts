export type Language = 'pl' | 'en';

const SUPPORTED_LANGUAGES: Language[] = ['pl', 'en'];

export function normalizeLanguage(value: string | null | undefined): Language {
  if (!value) return 'pl';
  const normalized = value.toLowerCase();
  return SUPPORTED_LANGUAGES.includes(normalized as Language) ? (normalized as Language) : 'pl';
}

export function pickLocalizedName(language: Language, value: { name: string; namePL?: string | null } | null | undefined): string {
  if (!value) return '';
  if (language === 'pl') {
    return value.namePL?.trim() || value.name;
  }
  return value.name;
}
