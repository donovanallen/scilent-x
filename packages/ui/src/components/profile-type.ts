/**
 * Profile type categories for users.
 * Kept as a local union so `@scilent-one/ui` does not depend on `@scilent-one/db`.
 * Values must stay in sync with the Prisma `ProfileType` enum.
 */
export type ProfileType = 'USER' | 'VOICE' | 'ARTIST';

export const PROFILE_TYPES = [
  'USER',
  'VOICE',
  'ARTIST',
] as const satisfies ReadonlyArray<ProfileType>;
