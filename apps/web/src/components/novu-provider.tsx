'use client';

/**
 * Novu Client-Side Provider and Components
 *
 * This module provides React components for displaying in-app notifications
 * using Novu's notification inbox.
 *
 * ## Setup Requirements
 *
 * 1. Add `NEXT_PUBLIC_NOVU_APP_ID` to your environment variables
 *    (Get this from Novu Dashboard > Settings > API Keys > Application Identifier)
 *
 * 2. Wrap your app with `<NovuProvider>` in a client component
 *
 * 3. Use `<NotificationInbox>` to display the notification bell/inbox
 *
 * ## Architecture
 *
 * - `NovuProvider`: Context provider that initializes the Novu client
 * - `NotificationInbox`: Ready-to-use notification bell with popover inbox
 * - `useNovuContext`: Hook to access Novu state and methods
 *
 * @see https://docs.novu.co/inbox/react/get-started
 */

import { createContext, useContext, useMemo } from 'react';
import { Inbox, InboxContent } from '@novu/react';

// ============================================================================
// Configuration
// ============================================================================

/**
 * Novu Application ID from environment variables.
 * This is the public identifier for your Novu application.
 */
const NOVU_APP_ID = process.env.NEXT_PUBLIC_NOVU_APP_ID ?? '';

/**
 * Check if Novu client is properly configured.
 */
export const isNovuClientConfigured = (): boolean => {
  return Boolean(NOVU_APP_ID);
};

// ============================================================================
// Context
// ============================================================================

interface NovuContextValue {
  /** Whether Novu is configured and ready */
  isConfigured: boolean;
  /** The current subscriber ID */
  subscriberId: string | null;
  /** The Novu application ID */
  applicationId: string;
  /** Whether in-app notifications are enabled for this user */
  inAppNotificationsEnabled: boolean;
}

const NovuContext = createContext<NovuContextValue>({
  isConfigured: false,
  subscriberId: null,
  applicationId: '',
  inAppNotificationsEnabled: true,
});

/**
 * Hook to access Novu context values.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isConfigured, subscriberId } = useNovuContext();
 *
 *   if (!isConfigured) {
 *     return <span>Notifications not available</span>;
 *   }
 *
 *   return <span>Subscriber: {subscriberId}</span>;
 * }
 * ```
 */
export const useNovuContext = () => useContext(NovuContext);

// ============================================================================
// Provider Component
// ============================================================================

interface NovuProviderProps {
  children: React.ReactNode;
  /**
   * The subscriber ID (user ID) for the current user.
   * Pass null if user is not authenticated.
   */
  subscriberId: string | null;
  /**
   * Whether in-app notifications are enabled for this user.
   * Defaults to true. When false, the notification inbox will be hidden.
   */
  inAppNotificationsEnabled?: boolean;
}

/**
 * Novu Provider Component
 *
 * Wraps your application to provide Novu context.
 * Should be placed inside your auth provider so you have access to user info.
 *
 * @example
 * ```tsx
 * // In your authenticated layout
 * import { NovuProvider } from '@/components/novu-provider';
 *
 * export default async function AuthenticatedLayout({ children }) {
 *   const session = await getSession();
 *   const prefs = await getUserPreferences();
 *
 *   return (
 *     <NovuProvider
 *       subscriberId={session?.user?.id ?? null}
 *       inAppNotificationsEnabled={prefs?.inAppNotificationsEnabled ?? true}
 *     >
 *       {children}
 *     </NovuProvider>
 *   );
 * }
 * ```
 */
export function NovuProvider({
  children,
  subscriberId,
  inAppNotificationsEnabled = true,
}: NovuProviderProps) {
  const contextValue = useMemo(
    () => ({
      isConfigured: isNovuClientConfigured(),
      subscriberId,
      applicationId: NOVU_APP_ID,
      inAppNotificationsEnabled,
    }),
    [subscriberId, inAppNotificationsEnabled]
  );

  return (
    <NovuContext.Provider value={contextValue}>{children}</NovuContext.Provider>
  );
}

// ============================================================================
// Notification Inbox Component
// ============================================================================

interface NotificationInboxProps {
  /**
   * The subscriber ID (user ID) for the current user.
   * Required for the inbox to load notifications.
   */
  subscriberId: string;
}

/**
 * Notification Inbox Component
 *
 * Displays a notification bell with unread count and a popover inbox.
 * Uses Novu's pre-built Inbox component with customizable appearance.
 * Respects user's in-app notification preferences from the NovuProvider context.
 *
 * @example
 * ```tsx
 * // In your header or sidebar
 * import { NotificationInbox } from '@/components/novu-provider';
 *
 * function Header() {
 *   const session = useSession();
 *
 *   return (
 *     <header>
 *       {session?.user && (
 *         <NotificationInbox subscriberId={session.user.id} />
 *       )}
 *     </header>
 *   );
 * }
 * ```
 */
export function NotificationInbox({ subscriberId }: NotificationInboxProps) {
  const { inAppNotificationsEnabled } = useNovuContext();

  // Don't render if Novu is not configured
  if (!isNovuClientConfigured()) {
    // You can return a disabled bell icon here if you want
    // For now, we'll return null to hide it completely
    console.warn('[Novu] Client not configured - NotificationInbox hidden');
    return null;
  }

  // Don't render if user has disabled in-app notifications
  if (!inAppNotificationsEnabled) {
    return null;
  }

  return (
    <Inbox applicationIdentifier={NOVU_APP_ID} subscriberId={subscriberId}>
      <InboxContent />
    </Inbox>
  );
}

// ============================================================================
// Custom Notification Bell Component (Alternative)
// ============================================================================

// If you want more control over the UI, you can use the lower-level components:
//
// import { Inbox, Bell, Notifications } from '@novu/react';
//
// export function CustomNotificationBell({ subscriberId }: { subscriberId: string }) {
//   if (!isNovuClientConfigured()) return null;
//
//   return (
//     <Inbox applicationIdentifier={NOVU_APP_ID} subscriberId={subscriberId}>
//       {/* Custom Bell with Popover */}
//       <Popover>
//         <PopoverTrigger asChild>
//           <Bell />
//         </PopoverTrigger>
//         <PopoverContent>
//           <Notifications />
//         </PopoverContent>
//       </Popover>
//     </Inbox>
//   );
// }
