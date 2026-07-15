import { describe, expect, it } from 'vitest';

import {
  isAdminPath,
  isAdminUser,
  isPublicPath,
  sanitizeInternalRedirect,
} from '../auth-guards';

describe('auth-guards', () => {
  it('detects admin role from Better Auth role strings', () => {
    expect(isAdminUser({ role: 'admin' })).toBe(true);
    expect(isAdminUser({ role: 'user,admin' })).toBe(true);
    expect(isAdminUser({ role: ['user', 'admin'] })).toBe(true);
    expect(isAdminUser({ role: 'user' })).toBe(false);
    expect(isAdminUser({ role: null })).toBe(false);
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
