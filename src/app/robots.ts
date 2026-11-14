import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/es/', '/en/'],
      disallow: ['/admin', '/api/admin'],
    },
    sitemap: 'https://cuadraimperialloy.com/sitemap.xml',
  };
}

