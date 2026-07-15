import { describe, expect, it } from 'vitest';

describe('env', () => {
  it('loads under NODE_ENV=test (skipValidation)', async () => {
    const { env } = await import('@/env');
    expect(env).toBeDefined();
    expect(env.NODE_ENV).toBeDefined();
  });
});
