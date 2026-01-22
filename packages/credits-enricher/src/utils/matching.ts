import { normalizeIsrc, normalizeString } from '@scilent-one/harmony-engine';

/**
 * Validates and normalizes an ISRC for lookup
 */
export function prepareIsrc(isrc: string): string | null {
  const normalized = normalizeIsrc(isrc);
  // ISRC format: 2 letters + 3 alphanumeric + 7 digits = 12 characters
  if (!/^[A-Z]{2}[A-Z0-9]{3}\d{7}$/.test(normalized)) {
    return null;
  }
  return normalized;
}

/**
 * Calculate similarity score between two strings (0-1)
 * Uses Levenshtein distance normalized by max length
 */
export function calculateSimilarity(str1: string, str2: string): number {
  const s1 = normalizeString(str1);
  const s2 = normalizeString(str2);

  if (s1 === s2) return 1;
  if (s1.length === 0 || s2.length === 0) return 0;

  const distance = levenshteinDistance(s1, s2);
  const maxLength = Math.max(s1.length, s2.length);
  return 1 - distance / maxLength;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;

  // Create a 2D array to store distances
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array.from({ length: n + 1 }, () => 0)
  );

  // Initialize base cases
  for (let i = 0; i <= m; i++) dp[i]![0] = i;
  for (let j = 0; j <= n; j++) dp[0]![j] = j;

  // Fill the matrix
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i]![j] = dp[i - 1]![j - 1]!;
      } else {
        dp[i]![j] = 1 + Math.min(dp[i - 1]![j]!, dp[i]![j - 1]!, dp[i - 1]![j - 1]!);
      }
    }
  }

  return dp[m]![n]!;
}

/**
 * Check if two track titles match (with some fuzzy tolerance)
 */
export function titlesMatch(title1: string, title2: string, threshold = 0.85): boolean {
  return calculateSimilarity(title1, title2) >= threshold;
}

/**
 * Check if artist names match (allowing for variations)
 */
export function artistsMatch(artist1: string, artist2: string, threshold = 0.8): boolean {
  // First try exact normalized match
  if (normalizeString(artist1) === normalizeString(artist2)) {
    return true;
  }

  // Check if one contains the other (for "Artist feat. Someone" cases)
  const norm1 = normalizeString(artist1);
  const norm2 = normalizeString(artist2);

  if (norm1.includes(norm2) || norm2.includes(norm1)) {
    return true;
  }

  // Fall back to similarity check
  return calculateSimilarity(artist1, artist2) >= threshold;
}

/**
 * Extract the primary artist name from a credit string
 * Handles "Artist feat. Other Artist" and "Artist & Other Artist" patterns
 */
export function extractPrimaryArtist(artistString: string): string {
  // Remove common featuring patterns
  const patterns = [
    / feat\.? .+$/i,
    / featuring .+$/i,
    / ft\.? .+$/i,
    / with .+$/i,
    / & .+$/i,
    / and .+$/i,
    / x .+$/i,
    /,.+$/,
  ];

  let result = artistString;
  for (const pattern of patterns) {
    result = result.replace(pattern, '');
  }

  return result.trim();
}

/**
 * Build a search-friendly query string from track info
 */
export function buildSearchQuery(
  title: string,
  artistName?: string
): string {
  const parts: string[] = [];

  if (artistName) {
    parts.push(extractPrimaryArtist(artistName));
  }

  parts.push(title);

  return parts.join(' ').trim();
}
