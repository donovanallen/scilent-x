'use server';

/**
 * Notification Actions
 *
 * Server actions for triggering notifications via Novu.
 * These are example implementations showing common notification patterns.
 *
 * ## Usage
 *
 * Import and call these functions from your server components or actions:
 *
 * ```ts
 * import { sendWelcomeNotification, sendInAppNotification } from '@/lib/notifications';
 *
 * // In a signup action:
 * await sendWelcomeNotification(newUser.id, newUser.name, newUser.email);
 *
 * // In a comment action:
 * await sendInAppNotification(authorId, 'new-comment', {
 *   title: 'New comment on your post',
 *   body: `${commenter.name} commented: "${comment.text}"`,
 * });
 * ```
 *
 * ## Creating Workflows in Novu Dashboard
 *
 * Before using these functions, create corresponding workflows in Novu:
 *
 * 1. Go to https://dashboard.novu.co
 * 2. Navigate to Workflows → Create Workflow
 * 3. Add steps (In-App, Email, Push, etc.)
 * 4. Use the workflow ID in your code
 *
 * @see https://docs.novu.co/workflows/introduction
 */

import {
  triggerNotification,
  upsertSubscriber,
  WORKFLOWS,
  type TriggerNotificationParams,
  type UpsertSubscriberParams,
  type NovuPayload,
} from './novu';

// ============================================================================
// User Lifecycle Notifications
// ============================================================================

/**
 * Send a welcome notification to a new user.
 *
 * Call this after user signup to:
 * 1. Register them as a Novu subscriber
 * 2. Send them a welcome email/notification
 *
 * @example
 * ```ts
 * // In your signup action
 * const user = await db.user.create({ ... });
 * await sendWelcomeNotification(user.id, user.name, user.email);
 * ```
 */
export async function sendWelcomeNotification(
  userId: string,
  userName: string,
  userEmail: string
): Promise<{ success: boolean; error?: string }> {
  // Parse name parts
  const nameParts = userName.split(' ');
  const firstName = nameParts[0] || userName;
  const lastNamePart = nameParts.slice(1).join(' ');

  // Build subscriber params conditionally to satisfy exactOptionalPropertyTypes
  const subscriberParams: UpsertSubscriberParams = {
    subscriberId: userId,
    email: userEmail,
    firstName,
  };
  if (lastNamePart) {
    subscriberParams.lastName = lastNamePart;
  }

  // First, ensure the user is registered as a subscriber
  const subscriberResult = await upsertSubscriber(subscriberParams);

  if (!subscriberResult.success) {
    return subscriberResult;
  }

  // Then, trigger the welcome workflow
  return triggerNotification({
    workflowId: WORKFLOWS.WELCOME,
    subscriberId: userId,
    email: userEmail,
    payload: {
      userName,
      userEmail,
      // Add any other data your welcome template needs
      signupDate: new Date().toISOString(),
    },
  });
}

/**
 * Sync a user's profile to Novu when they update their info.
 *
 * Call this when user updates their profile to keep Novu in sync.
 *
 * @example
 * ```ts
 * // In your profile update action
 * await db.user.update({ where: { id: userId }, data: { name, avatar } });
 * await syncUserToNovu(userId, { name, email, avatar });
 * ```
 */
export async function syncUserToNovu(
  userId: string,
  data: {
    name?: string;
    email?: string;
    avatar?: string;
    phone?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  // Build subscriber params conditionally to satisfy exactOptionalPropertyTypes
  const subscriberParams: UpsertSubscriberParams = {
    subscriberId: userId,
  };

  // Add email if provided
  if (data.email) {
    subscriberParams.email = data.email;
  }

  // Parse and add name parts if provided
  if (data.name) {
    const nameParts = data.name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');

    if (firstName) subscriberParams.firstName = firstName;
    if (lastName) subscriberParams.lastName = lastName;
  }

  // Add optional fields if provided
  if (data.avatar) {
    subscriberParams.avatar = data.avatar;
  }
  if (data.phone) {
    subscriberParams.phone = data.phone;
  }

  return upsertSubscriber(subscriberParams);
}

// ============================================================================
// In-App Notifications
// ============================================================================

/**
 * Send an in-app notification to a user.
 *
 * This is a flexible function for sending custom in-app notifications.
 * The workflow should have an "In-App" step configured.
 *
 * @example
 * ```ts
 * // Notify a user about a new follower
 * await sendInAppNotification(
 *   targetUserId,
 *   'new-follower',
 *   {
 *     title: 'New follower!',
 *     body: `${follower.name} started following you`,
 *     avatarUrl: follower.avatar,
 *     actionUrl: `/profile/${follower.username}`,
 *   }
 * );
 * ```
 */
export async function sendInAppNotification(
  userId: string,
  workflowId: string,
  payload: NovuPayload & {
    title: string;
    body: string;
    avatarUrl?: string;
    actionUrl?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  return triggerNotification({
    workflowId,
    subscriberId: userId,
    payload,
  });
}

// ============================================================================
// Bulk Notifications
// ============================================================================

/**
 * Send a notification to multiple users.
 *
 * Useful for broadcasting announcements or notifying groups.
 *
 * @example
 * ```ts
 * // Notify all team members about a new post
 * const memberIds = team.members.map(m => m.id);
 * await sendBulkNotification(memberIds, 'new-team-post', {
 *   title: 'New post in your team',
 *   postTitle: post.title,
 *   authorName: author.name,
 * });
 * ```
 */
export async function sendBulkNotification(
  userIds: string[],
  workflowId: string,
  payload: NovuPayload
): Promise<{ successCount: number; failureCount: number; errors: string[] }> {
  const results = await Promise.allSettled(
    userIds.map((userId) =>
      triggerNotification({
        workflowId,
        subscriberId: userId,
        payload,
      })
    )
  );

  const errors: string[] = [];
  let successCount = 0;
  let failureCount = 0;

  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value.success) {
      successCount++;
    } else {
      failureCount++;
      const errorMsg =
        result.status === 'rejected'
          ? result.reason?.message || 'Unknown error'
          : result.value.error || 'Unknown error';
      errors.push(`User ${userIds[index]}: ${errorMsg}`);
    }
  });

  return { successCount, failureCount, errors };
}

// ============================================================================
// Notification Wrapper Type (for custom workflows)
// ============================================================================

/**
 * Create a typed notification function for a specific workflow.
 *
 * This pattern allows you to create type-safe notification functions
 * for your custom workflows.
 *
 * @example
 * ```ts
 * // Define your workflow's payload type
 * interface NewCommentPayload {
 *   commenterName: string;
 *   commentText: string;
 *   postTitle: string;
 *   postUrl: string;
 * }
 *
 * // Create a typed notification function
 * export const sendNewCommentNotification = createNotificationFn<NewCommentPayload>(
 *   'new-comment'
 * );
 *
 * // Use it with full type safety
 * await sendNewCommentNotification(authorId, {
 *   commenterName: 'John',
 *   commentText: 'Great post!',
 *   postTitle: 'My First Post',
 *   postUrl: '/posts/123',
 * });
 * ```
 */
export function createNotificationFn<TPayload extends NovuPayload>(
  workflowId: string
) {
  return async function (
    subscriberId: string,
    payload: TPayload,
    options?: Omit<
      TriggerNotificationParams,
      'workflowId' | 'subscriberId' | 'payload'
    >
  ): Promise<{ success: boolean; error?: string }> {
    return triggerNotification({
      workflowId,
      subscriberId,
      payload,
      ...options,
    });
  };
}

// ============================================================================
// Example: Custom Notification Functions
// ============================================================================

// Uncomment and modify these examples for your specific use cases:

// interface NewCommentPayload {
//   commenterName: string;
//   commentPreview: string;
//   postTitle: string;
//   postUrl: string;
// }
//
// export const sendNewCommentNotification = createNotificationFn<NewCommentPayload>(
//   'new-comment'
// );

// interface NewFollowerPayload {
//   followerName: string;
//   followerAvatar?: string;
//   followerProfileUrl: string;
// }
//
// export const sendNewFollowerNotification = createNotificationFn<NewFollowerPayload>(
//   'new-follower'
// );
