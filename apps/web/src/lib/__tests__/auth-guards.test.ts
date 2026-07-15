import { describe, expect, it, beforeEach, afterEach } from 'vitest';

import {
  getAdminEmails,
  isAdminPath,
  isAdminUser,
  isPublicPath,
  sanitizeInternalRedirect,
} from '../auth-guards';

describe('auth-guards', () => {
  const original = process.env.ADMIN_EMAILS;

  beforeEach(() => {
    delete process.env.ADMIN_EMAILS;
  });

  afterEach(() => {
    if (original === undefined) {
      delete process.env.ADMIN_EMAILS;
    } else {
      process.env.ADMIN_EMAILS = original;
    }
  });

  it('parses ADMIN_EMAILS allowlist case-insensitively', () => {
    process.env.ADMIN_EMAILS = ' Alice@Example.com , bob@example.com ';
    expect(getAdminEmails()).toEqual(
      new Set(['alice@example.com', 'bob@example.com'])
    );
    expect(isAdminUser({ email: 'ALICE@example.com' })).toBe(true);
    expect(isAdminUser({ email: 'other@example.com' })).toBe(false);
  });

  it('treats empty ADMIN_EMAILS as no admins', () => {
    expect(isAdminUser({ email: 'anyone@example.com' })).toBe(false);
    expect(isAdminUser(null)).toBe(false);
  });

  it('identifies public vs protected paths', () => {
    expect(isPublicPath('/')).toBe(true);
    expect(isPublicPath('/login')).toBe(true);
    expect(isPublicPath('/signup')).toBe(true);
    expect(isPublicPath('/api/auth/callback/spotify')).toBe(true);
    expect(isPublicPath('/api/v1/feed')).toBe(true);
    expect(isPublicPath('/feed')).toBe(false);
    expect(isPublicPath('/admin/users')).toBe(false);
  });

  it('identifies admin paths', () => {
    expect(isAdminPath('/admin')).toBe(true);
    expect(isAdminPath('/admin/users')).toBe(true);
    expect(isAdminPath('/feed')).toBe(false);
  });

  it('sanitizes internal redirects', () => {
    expect(sanitizeInternalRedirect('/feed')).toBe('/feed');
    expect(sanitizeInternalRedirect('/reviews/new?url=x')).toBe(
      '/reviews/new?url=x'
    );
    expect(sanitizeInternalRedirect('https://evil.com')).toBeNull();
    expect(sanitizeInternalRedirect('//evil.com')).toBeNull();
    expect(sanitizeInternalRedirect(null)).toBeNull();
  });
});
