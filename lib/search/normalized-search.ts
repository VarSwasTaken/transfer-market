const EXTRA_CHAR_REPLACEMENTS: Record<string, string> = {
  // Latin extended letters that are not handled well enough by simple NFD.
  ł: "l",
  Ł: "l",
  ø: "o",
  Ø: "o",
  đ: "d",
  Đ: "d",
  ð: "d",
  Ð: "d",
  þ: "th",
  Þ: "th",
  ı: "i",
  İ: "i",
  ŋ: "n",
  Ŋ: "n",
  ħ: "h",
  Ħ: "h",
  ŧ: "t",
  Ŧ: "t",
  ĸ: "k",
  ſ: "s",
  æ: "ae",
  Æ: "ae",
  œ: "oe",
  Œ: "oe",
  ĳ: "ij",
  Ĳ: "ij",
  ƒ: "f",
  ß: "ss",
};

export function normalizeForSearch(value: string): string {
  const replaced = value
    .split("")
    .map((char) => EXTRA_CHAR_REPLACEMENTS[char] ?? char)
    .join("");

  return replaced
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}

export function includesNormalized(value: string, normalizedQuery: string): boolean {
  if (!normalizedQuery) {
    return true;
  }

  return normalizeForSearch(value).includes(normalizedQuery);
}

export function matchesAnyNormalizedField(
  normalizedQuery: string,
  fields: string[],
): boolean {
  if (!normalizedQuery) {
    return true;
  }

  return fields.some((field) => includesNormalized(field, normalizedQuery));
}
