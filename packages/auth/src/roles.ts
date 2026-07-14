/**
 * Auth role helpers shared by server and client.
 */

/**
 * Returns true when the Better Auth role value includes `admin`.
 * Roles may be a single string or a comma-separated list.
 */
export function hasAdminRole(
  role: string | string[] | null | undefined
): boolean {
  if (!role) return false;
  const roles = Array.isArray(role) ? role : role.split(',');
  return roles.some((r) => r.trim() === 'admin');
}
