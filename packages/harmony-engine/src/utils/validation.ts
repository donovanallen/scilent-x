/**
 * Validates a GTIN (Global Trade Item Number) / UPC / EAN barcode
 */
export function isValidGtin(gtin: string): boolean {
  // Remove any spaces or dashes
  const cleaned = gtin.replace(/[\s-]/g, "");

  // GTIN can be 8, 12, 13, or 14 digits
  if (!/^\d{8}$|^\d{12,14}$/.test(cleaned)) {
    return false;
  }

  // Validate check digit using modulo 10 algorithm
  const digits = cleaned.split("").map(Number);
  const checkDigit = digits.pop()!;

  let sum = 0;
  const multipliers =
    digits.length % 2 === 0 ? [1, 3] : ([3, 1] as [number, number]);

  for (let i = 0; i < digits.length; i++) {
    sum += digits[i]! * multipliers[i % 2]!;
  }

  const calculatedCheck = (10 - (sum % 10)) % 10;
  return calculatedCheck === checkDigit;
}

/**
 * Validates an ISRC (International Standard Recording Code)
 * Format: CC-XXX-YY-NNNNN (country-registrant-year-designation)
 */
export function isValidIsrc(isrc: string): boolean {
  // Remove any dashes or spaces
  const cleaned = isrc.replace(/[\s-]/g, "").toUpperCase();

  // ISRC is exactly 12 characters: 2 letters + 3 alphanumeric + 2 digits + 5 digits
  return /^[A-Z]{2}[A-Z0-9]{3}\d{7}$/.test(cleaned);
}

/**
 * Normalizes a GTIN to its canonical form (zero-padded to 14 digits)
 */
export function normalizeGtin(gtin: string): string {
  const cleaned = gtin.replace(/[\s-]/g, "");
  return cleaned.padStart(14, "0");
}

/**
 * Normalizes an ISRC to its canonical form (uppercase, no separators)
 */
export function normalizeIsrc(isrc: string): string {
  return isrc.replace(/[\s-]/g, "").toUpperCase();
}

/**
 * Normalizes a string for comparison/matching purposes
 */
export function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/[^a-z0-9\s]/g, "") // Remove non-alphanumeric
    .replace(/\s+/g, " ") // Collapse whitespace
    .trim();
}
