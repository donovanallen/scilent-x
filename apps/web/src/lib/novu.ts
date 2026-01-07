/**
 * Novu Server-Side Configuration
 *
 * This module provides the server-side Novu client for triggering notifications.
 * Use this in API routes, server actions, or any server-side code.
 *
 * ## Setup Requirements
 *
 * 1. Create a Novu account at https://novu.co and create an application
 * 2. Get your API key from the Novu dashboard (Settings > API Keys)
 * 3. Add `NOVU_SECRET_KEY` to your environment variables
 *
 * ## Core Concepts
 *
 * - **Subscribers**: Users who receive notifications (identified by subscriberId)
 * - **Workflows**: Notification templates/flows created in Novu dashboard
 * - **Triggers**: Actions that send notifications via workflows
 *
 * ## Usage Examples
 *
 * ### Trigger a notification:
 * ```ts
 * import { novu, triggerNotification } from '@/lib/novu';
 *
 * // Using the helper function
 * await triggerNotification({
 *   workflowId: 'welcome-email',
 *   subscriberId: user.id,
 *   payload: { userName: user.name, email: user.email },
 * });
 *
 * // Or using the client directly for more control
 * await novu.trigger({
 *   workflowId: 'order-confirmation',
 *   to: { subscriberId: user.id, email: user.email },
 *   payload: { orderId: '123', total: '$99.99' },
 * });
 * ```
 *
 * ### Create or update a subscriber:
 * ```ts
 * await novu.subscribers.identify(user.id, {
 *   email: user.email,
 *   firstName: user.firstName,
 *   lastName: user.lastName,
 *   avatar: user.avatar,
 * });
 * ```
 *
 * @see https://docs.novu.co/sdks/nodejs for full API documentation
 */

import { Novu } from '@novu/node';

// ============================================================================
// Configuration
// ============================================================================

/**
 * Novu API secret key from environment variables.
 * Required for server-side operations.
 */
const NOVU_SECRET_KEY = process.env.NOVU_SECRET_KEY;

/**
 * Check if Novu is properly configured.
 * Useful for conditional logic when Novu may not be set up yet.
 */
export const isNovuConfigured = (): boolean => {
  return Boolean(NOVU_SECRET_KEY);
};

// ============================================================================
// Novu Client Instance
// ============================================================================

/**
 * Novu server-side client instance.
 *
 * This client is used for:
 * - Triggering notification workflows
 * - Managing subscribers (create, update, delete)
 * - Managing topics (group subscribers)
 * - Accessing notification feeds and preferences
 *
 * @throws Will throw if NOVU_SECRET_KEY is not configured when methods are called
 */
export const novu = new Novu(NOVU_SECRET_KEY ?? 'not-configured');

// ============================================================================
// Helper Types
// ============================================================================

/**
 * Valid payload value types for Novu notifications.
 */
export type NovuPayloadValue =
  | string
  | number
  | boolean
  | Record<string, unknown>
  | string[]
  | undefined;

/**
 * Novu notification payload type.
 */
export type NovuPayload = Record<string, NovuPayloadValue>;

/**
 * Parameters for triggering a notification.
 */
export interface TriggerNotificationParams {
  /**
   * The ID of the workflow to trigger (created in Novu dashboard).
   * Example: 'welcome-email', 'order-shipped', 'password-reset'
   */
  workflowId: string;

  /**
   * Unique identifier for the subscriber (typically user ID).
   * This links the notification to a specific user.
   */
  subscriberId: string;

  /**
   * Optional email address for the subscriber.
   * Useful for email notifications or if subscriber doesn't exist yet.
   */
  email?: string | undefined;

  /**
   * Dynamic data to pass to the notification template.
   * These values will be available in your workflow templates.
   *
   * Example: { userName: 'John', orderId: '12345' }
   */
  payload?: NovuPayload | undefined;

  /**
   * Optional overrides for notification content or channels.
   * Allows customizing specific aspects of the notification.
   */
  overrides?: Record<string, unknown> | undefined;
}

/**
 * Parameters for creating/updating a subscriber.
 * All optional properties explicitly allow undefined for exactOptionalPropertyTypes.
 */
export interface UpsertSubscriberParams {
  /**
   * Unique identifier for the subscriber (typically user ID).
   */
  subscriberId: string;

  /**
   * Subscriber's email address.
   */
  email?: string | undefined;

  /**
   * Subscriber's first name.
   */
  firstName?: string | undefined;

  /**
   * Subscriber's last name.
   */
  lastName?: string | undefined;

  /**
   * URL to subscriber's avatar image.
   */
  avatar?: string | undefined;

  /**
   * Subscriber's phone number (for SMS notifications).
   */
  phone?: string | undefined;

  /**
   * Additional custom data for the subscriber.
   */
  data?: Record<string, unknown> | undefined;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Trigger a notification workflow.
 *
 * This is a convenience wrapper around `novu.trigger()` with better
 * error handling and logging.
 *
 * @example
 * ```ts
 * // Send a welcome notification
 * await triggerNotification({
 *   workflowId: 'welcome',
 *   subscriberId: user.id,
 *   email: user.email,
 *   payload: { name: user.name },
 * });
 *
 * // Send an in-app notification
 * await triggerNotification({
 *   workflowId: 'new-comment',
 *   subscriberId: postAuthor.id,
 *   payload: {
 *     commenterName: commenter.name,
 *     postTitle: post.title,
 *     commentPreview: comment.content.slice(0, 100),
 *   },
 * });
 * ```
 */
export async function triggerNotification({
  workflowId,
  subscriberId,
  email,
  payload = {},
  overrides,
}: TriggerNotificationParams): Promise<{ success: boolean; error?: string }> {
  // Check if Novu is configured
  if (!isNovuConfigured()) {
    console.warn('[Novu] Not configured - skipping notification trigger');
    return { success: false, error: 'Novu is not configured' };
  }

  try {
    // Novu SDK v2.x uses (workflowIdentifier, data) signature
    // Cast payload to match Novu's ITriggerPayload type
    const triggerPayload = payload as Record<
      string,
      string | number | boolean | Record<string, unknown> | string[] | undefined
    >;

    await novu.trigger(workflowId, {
      to: {
        subscriberId,
        ...(email ? { email } : {}),
      },
      payload: triggerPayload,
      ...(overrides ? { overrides } : {}),
    });

    console.log(
      `[Novu] Triggered workflow "${workflowId}" for subscriber "${subscriberId}"`
    );
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Novu] Failed to trigger notification: ${message}`);
    return { success: false, error: message };
  }
}

/**
 * Create or update a subscriber in Novu.
 *
 * Call this when a user signs up or updates their profile to keep
 * subscriber data in sync with your database.
 *
 * @example
 * ```ts
 * // When user signs up
 * await upsertSubscriber({
 *   subscriberId: newUser.id,
 *   email: newUser.email,
 *   firstName: newUser.firstName,
 *   lastName: newUser.lastName,
 * });
 *
 * // When user updates profile
 * await upsertSubscriber({
 *   subscriberId: user.id,
 *   avatar: user.newAvatarUrl,
 * });
 * ```
 */
export async function upsertSubscriber({
  subscriberId,
  email,
  firstName,
  lastName,
  avatar,
  phone,
  data,
}: UpsertSubscriberParams): Promise<{ success: boolean; error?: string }> {
  // Check if Novu is configured
  if (!isNovuConfigured()) {
    console.warn('[Novu] Not configured - skipping subscriber upsert');
    return { success: false, error: 'Novu is not configured' };
  }

  try {
    // Build subscriber payload, only including defined values
    const subscriberPayload: Record<
      string,
      string | Record<string, string | number | boolean | string[]>
    > = {};
    if (email) subscriberPayload.email = email;
    if (firstName) subscriberPayload.firstName = firstName;
    if (lastName) subscriberPayload.lastName = lastName;
    if (avatar) subscriberPayload.avatar = avatar;
    if (phone) subscriberPayload.phone = phone;
    if (data) {
      // Filter data to only include valid types for Novu
      const filteredData: Record<string, string | number | boolean | string[]> =
        {};
      for (const [key, value] of Object.entries(data)) {
        if (
          typeof value === 'string' ||
          typeof value === 'number' ||
          typeof value === 'boolean' ||
          (Array.isArray(value) && value.every((v) => typeof v === 'string'))
        ) {
          filteredData[key] = value as string | number | boolean | string[];
        }
      }
      subscriberPayload.data = filteredData;
    }

    await novu.subscribers.identify(subscriberId, subscriberPayload);

    console.log(`[Novu] Upserted subscriber "${subscriberId}"`);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Novu] Failed to upsert subscriber: ${message}`);
    return { success: false, error: message };
  }
}

/**
 * Delete a subscriber from Novu.
 *
 * Call this when a user deletes their account.
 *
 * @example
 * ```ts
 * await deleteSubscriber(user.id);
 * ```
 */
export async function deleteSubscriber(
  subscriberId: string
): Promise<{ success: boolean; error?: string }> {
  if (!isNovuConfigured()) {
    console.warn('[Novu] Not configured - skipping subscriber deletion');
    return { success: false, error: 'Novu is not configured' };
  }

  try {
    await novu.subscribers.delete(subscriberId);
    console.log(`[Novu] Deleted subscriber "${subscriberId}"`);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Novu] Failed to delete subscriber: ${message}`);
    return { success: false, error: message };
  }
}

// ============================================================================
// Workflow ID Constants (Define your workflow IDs here)
// ============================================================================

/**
 * Notification workflow IDs.
 *
 * Define your workflow IDs here for type safety and easy reference.
 * These should match the workflow IDs created in your Novu dashboard.
 *
 * @example
 * ```ts
 * import { WORKFLOWS, triggerNotification } from '@/lib/novu';
 *
 * await triggerNotification({
 *   workflowId: WORKFLOWS.WELCOME,
 *   subscriberId: user.id,
 *   payload: { name: user.name },
 * });
 * ```
 */
export const WORKFLOWS = {
  // -------------------------------------------------------------------------
  // Authentication & Account
  // -------------------------------------------------------------------------
  /** Sent when a new user signs up */
  WELCOME: 'welcome',
  /** Sent when user requests password reset */
  PASSWORD_RESET: 'password-reset',
  /** Sent when email verification is required */
  EMAIL_VERIFICATION: 'email-verification',

  // -------------------------------------------------------------------------
  // User Activity (add your custom workflows here)
  // -------------------------------------------------------------------------
  // COMMENT_RECEIVED: 'comment-received',
  // NEW_FOLLOWER: 'new-follower',
  // MENTION: 'mention',

  // -------------------------------------------------------------------------
  // System Notifications
  // -------------------------------------------------------------------------
  // MAINTENANCE: 'maintenance',
  // FEATURE_UPDATE: 'feature-update',
} as const;

/**
 * Type for workflow IDs for type-safe usage.
 */
export type WorkflowId = (typeof WORKFLOWS)[keyof typeof WORKFLOWS];
