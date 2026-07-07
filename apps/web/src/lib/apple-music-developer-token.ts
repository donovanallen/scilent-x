import { createPrivateKey, sign, type KeyObject } from 'node:crypto';

/**
 * Mints Apple Music developer tokens (ES256 JWTs) for delivery to MusicKit JS in
 * the browser.
 *
 * This is intentionally separate from the harmony-engine `AppleMusicProvider`,
 * which mints its own tokens for server-to-server catalog calls. Browser tokens
 * additionally carry an `origin` claim (recommended by Apple) so a leaked token
 * cannot be used from another site.
 *
 * @see https://developer.apple.com/documentation/applemusicapi/generating-developer-tokens
 */

// Browser tokens are short-lived; MusicKit only needs them at authorize() time.
const BROWSER_TOKEN_TTL_SECONDS = 60 * 30; // 30 minutes

let cachedPrivateKey: KeyObject | null = null;

export interface AppleMusicCredentials {
  teamId: string;
  keyId: string;
  privateKey: string;
}

/**
 * Read Apple Music credentials from the environment, or return null when they
 * are not fully configured.
 */
export function getAppleMusicCredentials(): AppleMusicCredentials | null {
  const teamId = process.env.APPLE_MUSIC_TEAM_ID;
  const keyId = process.env.APPLE_MUSIC_KEY_ID;
  const privateKey = process.env.APPLE_MUSIC_PRIVATE_KEY;

  if (!teamId || !keyId || !privateKey) {
    return null;
  }

  return { teamId, keyId, privateKey };
}

function base64UrlJson(value: Record<string, unknown>): string {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function getPrivateKeyObject(pem: string): KeyObject {
  if (cachedPrivateKey) return cachedPrivateKey;

  const normalized = pem.includes('\\n') ? pem.replace(/\\n/g, '\n') : pem;
  cachedPrivateKey = createPrivateKey(normalized);
  return cachedPrivateKey;
}

/**
 * Mint a developer token restricted to the given origins.
 *
 * @param credentials - Apple Music Team ID, Key ID, and PEM private key
 * @param origins - Allowed origins for the `origin` claim (e.g. ['https://app.example.com'])
 * @returns A signed ES256 JWT valid for a short window
 */
export function mintAppleMusicDeveloperToken(
  credentials: AppleMusicCredentials,
  origins: string[]
): string {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const expSeconds = nowSeconds + BROWSER_TOKEN_TTL_SECONDS;

  const header = { alg: 'ES256', kid: credentials.keyId };
  const payload: Record<string, unknown> = {
    iss: credentials.teamId,
    iat: nowSeconds,
    exp: expSeconds,
  };

  // Only include the origin claim when we actually have origins; an empty array
  // would reject every request.
  if (origins.length > 0) {
    payload['origin'] = origins;
  }

  const signingInput = `${base64UrlJson(header)}.${base64UrlJson(payload)}`;
  const signature = sign('sha256', Buffer.from(signingInput), {
    key: getPrivateKeyObject(credentials.privateKey),
    dsaEncoding: 'ieee-p1363',
  });

  return `${signingInput}.${signature.toString('base64url')}`;
}
