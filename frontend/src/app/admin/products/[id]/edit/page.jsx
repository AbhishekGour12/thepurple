"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ProductForm from '@/components/admin/ProductForm';
import { adminProductApi } from '@/lib/api/admin/products';

export default function EditProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      adminProductApi
        .getProduct(id)
        .then((res) => {
          setProduct(res?.product || null);
        })
        .catch((err) => {
          setError(err.message || 'Failed to load product');
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: '#6B7280' }}>
        Loading product data...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{
        maxWidth: '500px',
        margin: '40px auto',
        padding: '24px',
        backgroundColor: '#FEF2F2',
        border: '1px solid #FECACA',
        borderRadius: '12px',
        textAlign: 'center',
        color: '#DC2626',
      }}>
        {error || 'Product not found'}
      </div>
    );
  }

  return <ProductForm initialData={product} isEdit={true} />;
}
