import { describe, expect, it } from 'vitest';

import {
  resolveBuildTimestamp,
  sanitizeDatabaseMetadata,
} from '../admin-status-utils';

describe('sanitizeDatabaseMetadata', () => {
  it('returns only safe connection metadata', () => {
    const result = sanitizeDatabaseMetadata(
      'postgresql://private-user:private-password@db.example.com:6543/secret-db?sslmode=require'
    );

    expect(result).toEqual({
      host: 'db.example.com',
      port: '6543',
      environment: 'remote',
    });
    expect(JSON.stringify(result)).not.toContain('private');
    expect(JSON.stringify(result)).not.toContain('secret-db');
  });

  it('recognizes local and missing database configurations', () => {
    expect(
      sanitizeDatabaseMetadata('postgresql://user:pass@localhost/app')
    ).toEqual({
      host: 'localhost',
      port: '5432',
      environment: 'local',
    });

    expect(sanitizeDatabaseMetadata(undefined)).toEqual({
      host: 'Not configured',
      port: 'N/A',
      environment: 'not configured',
    });
  });
});

describe('resolveBuildTimestamp', () => {
  it('prefers deployment metadata and falls back to build metadata', () => {
    expect(
      resolveBuildTimestamp(
        {
          NODE_ENV: 'test',
          VERCEL_DEPLOYMENT_CREATED_AT: '2026-07-15T12:00:00.000Z',
          SCILENT_BUILD_TIME: '2026-07-14T12:00:00.000Z',
        },
        '2026-07-13T12:00:00.000Z'
      )
    ).toEqual({
      timestamp: '2026-07-15T12:00:00.000Z',
      source: 'deployment',
    });

    expect(
      resolveBuildTimestamp(
        {
          NODE_ENV: 'test',
          SCILENT_BUILD_TIME: '2026-07-14T12:00:00.000Z',
        },
        '2026-07-13T12:00:00.000Z'
      )
    ).toEqual({
      timestamp: '2026-07-14T12:00:00.000Z',
      source: 'build',
    });
  });
});
