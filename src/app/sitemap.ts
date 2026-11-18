import type { MetadataRoute } from 'next';
import { getPublicProducts } from '@/lib/products-db';
import { PLACEHOLDER_PRODUCTS } from '@/lib/placeholder-data';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://secondjlitch.in').replace(/\/+$/, '');
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

  // Dynamic product routes from Supabase database with fallback to placeholder items
  try {
    const dbProducts = await getPublicProducts();
    if (dbProducts && dbProducts.length > 0) {
      const productRoutes: MetadataRoute.Sitemap = dbProducts.map((p) => ({
        url: `${baseUrl}/products/${p.slug || p.id}`,
        lastModified: p.updated_at ? new Date(p.updated_at) : (p.created_at ? new Date(p.created_at) : now),
        changeFrequency: 'weekly',
        priority: 0.8,
      }));
      return [...staticRoutes, ...productRoutes];
    }
  } catch {
    // Database query failed (e.g. offline during build) — proceed to fallback
  }

  // Fallback to placeholder products so sitemap is always populated
  const fallbackRoutes: MetadataRoute.Sitemap = PLACEHOLDER_PRODUCTS.map((p) => ({
    url: `${baseUrl}/products/${p.slug || p.id}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...fallbackRoutes];
}
