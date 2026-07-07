'use client';

/**
 * Client-side helpers for connecting an Apple Music account via MusicKit JS.
 *
 * Flow:
 * 1. Fetch a short-lived developer token from our server.
 * 2. Lazily load + configure MusicKit JS (Apple's hosted script).
 * 3. Prompt the subscriber to authorize, yielding a Music User Token.
 * 4. POST that token to our server, which stores it as an `apple_music` account.
 *
 * @see https://developer.apple.com/documentation/musickitjs
 */

const MUSICKIT_SCRIPT_SRC =
  'https://js-cdn.music.apple.com/musickit/v3/musickit.js';
const MUSICKIT_SCRIPT_ID = 'apple-musickit-js';

interface MusicKitInstance {
  authorize: () => Promise<string>;
  unauthorize: () => Promise<void>;
}

interface MusicKitConfigureOptions {
  developerToken: string;
  app: { name: string; build: string };
}

interface MusicKitNamespace {
  configure: (options: MusicKitConfigureOptions) => Promise<MusicKitInstance>;
  getInstance: () => MusicKitInstance;
}

declare global {
  interface Window {
    MusicKit?: MusicKitNamespace;
  }
}

let musicKitScriptPromise: Promise<MusicKitNamespace> | null = null;

/**
 * Inject and resolve the MusicKit JS namespace, loading the script once.
 */
function loadMusicKit(): Promise<MusicKitNamespace> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('MusicKit can only load in the browser'));
  }

  if (window.MusicKit) {
    return Promise.resolve(window.MusicKit);
  }

  if (musicKitScriptPromise) {
    return musicKitScriptPromise;
  }

  musicKitScriptPromise = new Promise<MusicKitNamespace>((resolve, reject) => {
    const finish = () => {
      if (window.MusicKit) {
        resolve(window.MusicKit);
      } else {
        reject(new Error('MusicKit failed to initialize'));
      }
    };

    const existing = document.getElementById(
      MUSICKIT_SCRIPT_ID
    ) as HTMLScriptElement | null;

    // MusicKit signals readiness via a `musickitloaded` event on document.
    document.addEventListener('musickitloaded', finish, { once: true });

    if (existing) {
      // Script tag already present (e.g. from a previous attempt).
      if (window.MusicKit) finish();
      return;
    }

    const script = document.createElement('script');
    script.id = MUSICKIT_SCRIPT_ID;
    script.src = MUSICKIT_SCRIPT_SRC;
    script.async = true;
    script.onerror = () => {
      musicKitScriptPromise = null;
      reject(new Error('Failed to load MusicKit JS'));
    };
    document.head.appendChild(script);
  });

  return musicKitScriptPromise;
}

async function fetchDeveloperToken(): Promise<string> {
  const response = await fetch('/api/v1/apple-music/developer-token');
  if (!response.ok) {
    throw new Error('Could not obtain an Apple Music developer token');
  }
  const data = (await response.json()) as { token?: string };
  if (!data.token) {
    throw new Error('Developer token response was empty');
  }
  return data.token;
}

/**
 * Configure MusicKit (loading it if necessary) and return the instance.
 */
async function getConfiguredMusicKit(): Promise<MusicKitInstance> {
  const MusicKit = await loadMusicKit();
  const developerToken = await fetchDeveloperToken();
  return MusicKit.configure({
    developerToken,
    app: { name: 'Scilent', build: '1.0.0' },
  });
}

/**
 * Prompt the user to authorize Apple Music and persist the resulting token.
 * Resolves when the connection has been stored server-side.
 */
export async function connectAppleMusic(): Promise<void> {
  const instance = await getConfiguredMusicKit();
  const musicUserToken = await instance.authorize();

  if (!musicUserToken) {
    throw new Error('Apple Music authorization was cancelled');
  }

  const response = await fetch('/api/v1/apple-music/connect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ musicUserToken }),
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(data?.error ?? 'Failed to store Apple Music connection');
  }
}

/**
 * Remove the stored Apple Music connection and, best-effort, unauthorize the
 * MusicKit instance in the browser.
 */
export async function disconnectAppleMusic(): Promise<void> {
  const response = await fetch('/api/v1/apple-music/connect', {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to disconnect Apple Music');
  }

  // Best-effort: clear the browser-side authorization if MusicKit is loaded.
  try {
    if (window.MusicKit) {
      await window.MusicKit.getInstance().unauthorize();
    }
  } catch {
    // Non-fatal; the server-side record is already removed.
  }
}
