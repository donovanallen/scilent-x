import type { MetadataRoute } from 'next';

import { getSiteUrl } from '@/lib/site-url';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/login', '/signup'],
        disallow: ['/admin/', '/api/', '/settings/', '/messages/'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
