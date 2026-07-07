/**
 * Preset color palettes for the app.
 *
 * Each palette is a set of color-token overrides defined in
 * `packages/ui/src/globals.css` under `[data-theme='<id>']` (light) and
 * `[data-theme='<id>'].dark` (dark). The `default` palette is the base
 * (`:root` / `.dark`) and has no `data-theme` selector of its own.
 *
 * This registry is the single source of truth consumed by the PaletteProvider
 * and the appearance picker. To add a new palette: add the token blocks in
 * globals.css, then append an entry here.
 */

export type PaletteId = 'default' | 'pro';

export interface PaletteMeta {
  /** Matches the `data-theme` attribute value (except `default`, which is unset). */
  id: PaletteId;
  /** Human-readable name shown in the picker. */
  label: string;
  /** Short description shown in the picker. */
  description: string;
  /**
   * Preview colors for the picker swatch, one per mode. These are static hints
   * for the UI only; the real values live in globals.css.
   */
  swatch: { light: string; dark: string };
}

export const PALETTES: PaletteMeta[] = [
  {
    id: 'default',
    label: 'Default',
    description: 'Clean monochrome with subtle accents.',
    swatch: { light: 'oklch(0.15 0 0)', dark: 'oklch(0.95 0 0)' },
  },
  {
    id: 'pro',
    label: 'Pro',
    description: 'Brand-forward warm amber palette.',
    swatch: { light: 'oklch(0.58 0.11 61)', dark: 'oklch(0.78 0.13 61)' },
  },
];

export const DEFAULT_PALETTE: PaletteId = 'default';

export const PALETTE_STORAGE_KEY = 'scilent-palette';

export const PALETTE_IDS = PALETTES.map((p) => p.id);

export function isPaletteId(value: unknown): value is PaletteId {
  return typeof value === 'string' && PALETTE_IDS.includes(value as PaletteId);
}
