/**
 * Auth Client for the Web App
 *
 * Re-exports the auth client from @scilent-one/auth for use in React components.
 *
 * @example
 * ```tsx
 * import { useSession, signIn, signOut } from '@/lib/auth-client';
 *
 * function AuthButton() {
 *   const { data: session, isPending } = useSession();
 *
 *   if (isPending) return <button disabled>Loading...</button>;
 *
 *   if (session) {
 *     return (
 *       <button onClick={() => signOut()}>
 *         Sign out ({session.user.email})
 *       </button>
 *     );
 *   }
 *
 *   return (
 *     <button onClick={() => signIn.social({ provider: 'google' })}>
 *       Sign in with Google
 *     </button>
 *   );
 * }
 * ```
 */

export {
  authClient,
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} from '@scilent-one/auth/client';

export type { Session } from '@scilent-one/auth/client';
