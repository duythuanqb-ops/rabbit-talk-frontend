import { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/profile', '/admin', '/settings'],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
