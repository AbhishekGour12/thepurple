'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams } from 'next/navigation';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import MainHeader from '@/components/layout/MainHeader';
import ProductsPageCarousel from '@/components/products/ProductsPageCarousel';
import ProductsCategoryBar from '@/components/products/ProductsCategoryBar';
import CategoryGridModal from '@/components/products/CategoryGridModal';
import AllProductsCatalog from '@/components/products/AllProductsCatalog';
import Footer from '@/components/layout/Footer';

function slugToName(slug) {
  if (!slug) return null;
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function CategoryPage({ params }) {
  const routeParams = useParams();
  const slug = routeParams?.slug || params?.slug || '';
  const initialCategoryName = slugToName(slug);

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(initialCategoryName);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadCategories() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
        const res = await fetch(`${apiUrl}/categories`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data?.categories) && isMounted) {
          const catList = json.data.categories;
          setCategories(catList);

          // 1. Check if slug matches a Category
          const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const matchedCat = catList.find(
            (c) => (c.slug && c.slug.toLowerCase() === cleanSlug) || c.name.toLowerCase() === slug.replace(/-/g, ' ').toLowerCase()
          );

          if (matchedCat) {
            setSelectedCategory(matchedCat.name);
            setSelectedSubcategory(null);
          } else {
            // 2. Check if slug matches a Subcategory
            for (const c of catList) {
              const matchedSub = (c.subcategories || []).find(
                (s) => (s.slug && s.slug.toLowerCase() === cleanSlug) || s.name.toLowerCase() === slug.replace(/-/g, ' ').toLowerCase()
              );
              if (matchedSub) {
                setSelectedCategory(c.name);
                setSelectedSubcategory(matchedSub.name);
                break;
              }
            }
          }
        }
      } catch {
        // Fallback
      }
    }
    loadCategories();

    // Auto-scroll directly to catalog section
    const scrollTimer = setTimeout(() => {
      const catalogEl = document.getElementById('catalog-products-section');
      if (catalogEl) {
        catalogEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(scrollTimer);
    };
  }, [slug]);

  const handleSelectCategory = (catName) => {
    setSelectedCategory(catName);
    setSelectedSubcategory(null);
    const catalogEl = document.getElementById('catalog-products-section');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: '#FCFBFE',
      }}
    >
      <AnnouncementBar />
      <MainHeader />

      <main style={{ flex: 1 }}>
        <ProductsPageCarousel
          onOpenCategoryModal={() => setIsCatModalOpen(true)}
          onSelectCategory={handleSelectCategory}
        />

        <ProductsCategoryBar
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
          onOpenAllCategoriesModal={() => setIsCatModalOpen(true)}
        />

        <Suspense fallback={<div style={{ padding: '60px 20px', textAlign: 'center', color: '#7E22CE' }}>Loading products catalog...</div>}>
          <AllProductsCatalog
            initialCategory={selectedCategory}
            initialSubcategory={selectedSubcategory}
            isCategoryModalOpenExternal={isCatModalOpen}
            onCategoryModalClose={() => setIsCatModalOpen(false)}
          />
        </Suspense>
      </main>

      <CategoryGridModal
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
      />

      <Footer />
    </div>
  );
}
