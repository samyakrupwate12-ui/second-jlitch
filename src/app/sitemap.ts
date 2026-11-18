import type { MetadataRoute } from 'next';
import { PLACEHOLDER_PRODUCTS } from '@/lib/placeholder-data';

export default function sitemap(): MetadataRoute.Sitemap {
  const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://secondjlitch.in';
  const siteUrl = rawSiteUrl.startsWith('http') ? rawSiteUrl : `https://${rawSiteUrl}`;
  const baseUrl = siteUrl.replace(/\/+$/, '');
  const now = new Date();

  // Core static store & informational routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pre-loved`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/shipping`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/refunds`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Product routes with explicit literal changeFrequency
  const productRoutes: MetadataRoute.Sitemap = PLACEHOLDER_PRODUCTS.map((p) => ({
    url: `${baseUrl}/products/${p.slug || p.id}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...productRoutes];
}
