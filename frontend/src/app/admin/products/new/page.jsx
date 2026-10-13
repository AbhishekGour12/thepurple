"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import ProductForm from '@/components/admin/ProductForm';

export default function NewProductPage() {
  const router = useRouter();
  const currentAdmin = useSelector((state) => state.auth?.admin?.profile);

  useEffect(() => {
    if (currentAdmin?.role === 'MANAGER') {
      router.replace('/admin/products');
    }
  }, [currentAdmin, router]);

  if (currentAdmin?.role === 'MANAGER') {
    return null;
  }

  return <ProductForm isEdit={false} />;
}
