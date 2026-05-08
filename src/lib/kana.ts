export const SMALL_TO_LARGE: Record<string, string> = {
  'ァ': 'ア', 'ィ': 'イ', 'ゥ': 'ウ', 'ェ': 'エ', 'ォ': 'オ',
  'ャ': 'ヤ', 'ュ': 'ユ', 'ョ': 'ヨ', 'ッ': 'ツ',
};

export function getLastMora(name: string): string {
  const chars = [...name];
  let last = chars[chars.length - 1];
  if (last === 'ー') last = chars[chars.length - 2] ?? last;
  return SMALL_TO_LARGE[last] ?? last;
}

export function getFirstMora(name: string): string {
  const chars = [...name];
  const first = chars[0];
  return SMALL_TO_LARGE[first] ?? first;
}

export function normalizeKana(input: string): string {
  return input
    .trim()
    // Hiragana → Katakana
    .replace(/[ぁ-ん]/g, c => String.fromCharCode(c.charCodeAt(0) + 0x60))
    // Full-width alphanumerics → half-width
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0));
}
