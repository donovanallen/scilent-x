'use client';

import * as React from 'react';

import { authClient, useSession } from '@/lib/auth-client';
import {
  DEFAULT_PALETTE,
  PALETTE_STORAGE_KEY,
  isPaletteId,
  type PaletteId,
} from '@/lib/themes';

interface PaletteContextValue {
  palette: PaletteId;
  setPalette: (palette: PaletteId) => void;
}

const PaletteContext = React.createContext<PaletteContextValue | undefined>(
  undefined
);

function applyPalette(palette: PaletteId) {
  const root = document.documentElement;
  if (palette === DEFAULT_PALETTE) {
    // Default palette is the base (:root / .dark); no data-theme needed.
    delete root.dataset.theme;
  } else {
    root.dataset.theme = palette;
  }
}

export function PaletteProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  // Lazy init from the DOM: the inline no-flash script in the root layout has
  // already applied data-theme (from localStorage) before hydration, so read it
  // back to stay in sync and avoid a mismatch. For logged-in users this is later
  // reconciled with the value stored on their account (DB wins - see below).
  const [palette, setPaletteState] = React.useState<PaletteId>(() => {
    if (typeof document === 'undefined') return DEFAULT_PALETTE;
    const current = document.documentElement.dataset.theme;
    return isPaletteId(current) ? current : DEFAULT_PALETTE;
  });

  // Applies + caches to localStorage. The localStorage copy is what the no-flash
  // script reads on the next load, so keeping it current avoids a flash even for
  // logged-in users.
  const applyAndCache = React.useCallback((next: PaletteId) => {
    setPaletteState(next);
    applyPalette(next);
    try {
      window.localStorage.setItem(PALETTE_STORAGE_KEY, next);
    } catch {
      // Ignore storage failures (e.g. private mode); palette still applies for
      // the current session.
    }
  }, []);

  const setPalette = React.useCallback(
    (next: PaletteId) => {
      applyAndCache(next);
      // Persist to the account when signed in. Fire-and-forget: the local state
      // is the source of truth for this session; the DB is for cross-device
      // persistence on the next load/login.
      if (session?.user) {
        void authClient.updateUser({ palette: next }).catch(() => {
          // Best-effort; the choice still applies locally.
        });
      }
    },
    [applyAndCache, session?.user]
  );

  // Adopt the account's stored palette once per signed-in user (DB is the source
  // of truth on login). Tracking the user id prevents a stale session value from
  // clobbering a change the user just made in this tab.
  const syncedUserIdRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    const user = session?.user;
    if (!user) {
      syncedUserIdRef.current = null;
      return;
    }
    if (syncedUserIdRef.current === user.id) return;
    syncedUserIdRef.current = user.id;

    const dbPalette = user.palette;
    if (isPaletteId(dbPalette)) {
      applyAndCache(dbPalette);
    }
  }, [session?.user, applyAndCache]);

  // Keep the palette in sync across tabs/windows.
  React.useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== PALETTE_STORAGE_KEY) return;
      const next = isPaletteId(event.newValue)
        ? event.newValue
        : DEFAULT_PALETTE;
      setPaletteState(next);
      applyPalette(next);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const value = React.useMemo(
    () => ({ palette, setPalette }),
    [palette, setPalette]
  );

  return (
    <PaletteContext.Provider value={value}>{children}</PaletteContext.Provider>
  );
}

export function usePalette() {
  const context = React.useContext(PaletteContext);
  if (context === undefined) {
    throw new Error('usePalette must be used within a PaletteProvider');
  }
  return context;
}
