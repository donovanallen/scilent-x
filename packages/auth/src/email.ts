/**
 * Optional auth email delivery via Resend.
 *
 * When `RESEND_API_KEY` is unset, callers no-op (with a warn log) so local
 * and launch deploys work without an email provider. Password reset and
 * verification endpoints still exist; emails are simply not delivered.
 */

import { createLogger } from '@scilent-one/logger';

const logger = createLogger('auth:email');

export function isAuthEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

function emailFrom(): string {
  return (
    process.env.AUTH_EMAIL_FROM?.trim() || 'Scilent <onboarding@resend.dev>'
  );
}

/**
 * Send a transactional auth email through Resend's HTTP API.
 * Uses fetch to avoid a hard dependency on the Resend SDK.
 */
export async function sendAuthEmail(params: {
  to: string;
  subject: string;
  text: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    logger.warn('Auth email skipped — RESEND_API_KEY not set', {
      subject: params.subject,
      toDomain: params.to.includes('@') ? params.to.split('@')[1] : undefined,
    });
    return;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: emailFrom(),
      to: [params.to],
      subject: params.subject,
      text: params.text,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    logger.error('Resend API error sending auth email', {
      status: response.status,
      subject: params.subject,
      body: body.slice(0, 500),
    });
    throw new Error(`Failed to send auth email (${response.status})`);
  }

  logger.info('Auth email sent', { subject: params.subject });
}
