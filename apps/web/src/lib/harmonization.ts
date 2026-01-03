// apps/web/src/lib/harmonization.ts
import { HarmonizationEngine } from '@scilent-one/harmonization-engine';

// Singleton instance
let engine: HarmonizationEngine | null = null;

export function getHarmonizationEngine() {
  if (!engine) {
    engine = new HarmonizationEngine({
      providers: {
        providers: {
          musicbrainz: {
            enabled: true,
            priority: 100,
            rateLimit: { requests: 1, windowMs: 1000 },
            cache: { ttlSeconds: 86400 },
            retry: {
              retries: 3,
              minTimeout: 1000,
              maxTimeout: 10000,
              factor: 2,
            },
            appName: 'ScilentWeb',
            appVersion: '0.1.0',
            contact: 'dev@example.com', // Update with your contact
          },
        },
      },
      // redis: null, // Add Redis connection for production caching
    });
  }
  return engine;
}
