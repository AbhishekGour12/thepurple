import React from 'react';
import ProductDetailPage from '@/components/products/ProductDetailPage';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1').replace(/\/$/, '');
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

// Format slug into readable fallback title if API is unreachable
function formatSlugToTitle(slug = '') {
  if (!slug) return 'Exclusive Product';
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Server-side metadata generator for Next.js App Router.
 * Powers rich link previews with Product Image, Title, Price, and Description
 * on WhatsApp, Facebook, Twitter, Telegram, LinkedIn, iMessage, etc.
 */
export async function generateMetadata({ params }) {
  const slug = params?.slug || '';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`${API_BASE}/products/${encodeURIComponent(slug)}`, {
      signal: controller.signal,
      next: { revalidate: 60 },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const payload = await res.json();
      const product = payload?.data?.product || payload?.data;

      if (product) {
        const title = `${product.name} | ${product.brand || 'ThePurple'}`;
        const rawDesc =
          product.shortDescription ||
          product.description?.replace(/[•\-\*#_`]/g, ' ').replace(/\s+/g, ' ').trim() ||
          `Shop ${product.name} online at ThePurple. Premium quality & certified craftsmanship.`;
        const description = rawDesc.length > 160 ? rawDesc.slice(0, 157) + '...' : rawDesc;

        // Find primary or first image
        const rawImg =
          product.images?.find((img) => img.isPrimary)?.imageUrl ||
          product.images?.[0]?.imageUrl ||
          '/images/storefront/hero-gold.jpg';

        // Must be an absolute URL for social crawlers (WhatsApp, Facebook, Twitter)
        const absoluteImageUrl =
          rawImg.startsWith('http://') || rawImg.startsWith('https://')
            ? rawImg
            : `${SITE_URL}${rawImg.startsWith('/') ? '' : '/'}${rawImg}`;

        const productUrl = `${SITE_URL}/products/${slug}`;
        const price = product.salePrice || product.price;

        return {
          title,
          description,
          openGraph: {
            title,
            description,
            url: productUrl,
            siteName: 'ThePurple',
            type: 'website',
            images: [
              {
                url: absoluteImageUrl,
                width: 1200,
                height: 1200,
                alt: product.name,
              },
            ],
          },
          twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [absoluteImageUrl],
          },
          other: {
            'product:price:amount': price ? String(price) : '0',
            'product:price:currency': 'INR',
            'product:brand': product.brand || 'ThePurple',
            'product:availability': product.stock > 0 ? 'in stock' : 'out of stock',
          },
        };
      }
    }
  } catch {
    // Backend unreachable or timeout - fallback to clean defaults
  }

  const fallbackTitle = `${formatSlugToTitle(slug)} | ThePurple`;
  const fallbackUrl = `${SITE_URL}/products/${slug}`;
  const fallbackImg = `${SITE_URL}/images/storefront/hero-gold.jpg`;

  return {
    title: fallbackTitle,
    description:
      'Explore certified fine jewellery, bespoke gift hampers & luxury handcrafted collections on ThePurple.',
    openGraph: {
      title: fallbackTitle,
      description:
        'Explore certified fine jewellery, bespoke gift hampers & luxury handcrafted collections on ThePurple.',
      url: fallbackUrl,
      siteName: 'ThePurple',
      type: 'website',
      images: [
        {
          url: fallbackImg,
          width: 1200,
          height: 1200,
          alt: fallbackTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fallbackTitle,
      description:
        'Explore certified fine jewellery, bespoke gift hampers & luxury handcrafted collections on ThePurple.',
      images: [fallbackImg],
    },
  };
}

export default function ProductRoutePage({ params }) {
  const slug = params?.slug || '';
  return <ProductDetailPage slug={slug} />;
}
