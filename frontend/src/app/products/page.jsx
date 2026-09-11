'use client';

import React, { useState, useEffect } from 'react';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import MainHeader from '@/components/layout/MainHeader';
import ProductsPageCarousel from '@/components/products/ProductsPageCarousel';
import ProductsCategoryBar from '@/components/products/ProductsCategoryBar';
import CategoryGridModal from '@/components/products/CategoryGridModal';
import AllProductsCatalog from '@/components/products/AllProductsCatalog';
import Footer from '@/components/layout/Footer';

export default function ProductsPage() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);

  // Fetch categories for category strip & modal
  useEffect(() => {
    let isMounted = true;
    async function loadCategories() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
        const res = await fetch(`${apiUrl}/categories`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data?.categories) && isMounted) {
          setCategories(json.data.categories);
        }
      } catch {
        // Fallback
      }
    }
    loadCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelectCategory = (catName) => {
    setSelectedCategory(catName);
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
      {/* 1. Top Announcement Bar */}
      <AnnouncementBar />

      {/* 2. Main Luxury Header */}
      <MainHeader />

      {/* Main Page Area */}
      <main style={{ flex: 1 }}>
        {/* 3. Products Page Carousel Banner */}
        <ProductsPageCarousel
          onOpenCategoryModal={() => setIsCatModalOpen(true)}
          onSelectCategory={handleSelectCategory}
        />

        {/* 4. Products Category Strip / Slider with Images and View All Button */}
        <ProductsCategoryBar
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
          onOpenAllCategoriesModal={() => setIsCatModalOpen(true)}
        />

        {/* 5. All Products Catalog with Filters, Search & Auto-scroll */}
        <AllProductsCatalog
          initialCategory={selectedCategory}
          isCategoryModalOpenExternal={isCatModalOpen}
          onCategoryModalClose={() => setIsCatModalOpen(false)}
        />
      </main>

      {/* 6. All Categories Grid Modal (Only pure categories with images, no subcategories) */}
      <CategoryGridModal
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
      />

      {/* 7. Storefront Footer */}
      <Footer />
    </div>
  );
}
