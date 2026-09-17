'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ProductDetailPage from '@/components/products/ProductDetailPage';

export default function ProductRoutePage({ params }) {
  const routeParams = useParams();
  const slug = routeParams?.slug || params?.slug || '';

  return <ProductDetailPage slug={slug} />;
}
