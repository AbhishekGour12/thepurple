'use client';

import AnnouncementBar from '../components/layout/AnnouncementBar';
import MainHeader from '../components/layout/MainHeader';
import CategoryNav from '../components/layout/CategoryNav';
import HeroBanner from '../components/home/HeroBanner';
import HeroTrustStrip from '../components/home/HeroTrustStrip';
import FeaturedCategories from '../components/home/FeaturedCategories';
import SearchWhatYouLove from '../components/home/SearchWhatYouLove';
import RecentlyViewed from '../components/home/RecentlyViewed';
import SpecialOfferBanner from '../components/home/SpecialOfferBanner';
import BenefitsStrip from '../components/home/BenefitsStrip';
import NewsletterSection from '../components/home/NewsletterSection';
import Footer from '../components/layout/Footer';

export default function HomePage() {
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

      {/* 2. Main Header */}
      <MainHeader />

      {/* 3. Category Navigation */}
      <CategoryNav />

      {/* Main Storefront Content Area */}
      <main style={{ flex: 1 }}>
        {/* 4. Hero Banner Carousel */}
        <HeroBanner />

        {/* 5. Hero Trust / Feature Strip */}
        <HeroTrustStrip />

        {/* 6. Shop By Category Visual Showcase */}
        <FeaturedCategories />

        {/* 7. Search & Explore What You Love (Main Product Grid) */}
        <SearchWhatYouLove />

        {/* 8. Recently Viewed Products (First in Part 2) */}
        <RecentlyViewed />

        {/* 9. Special Offer Banner (WELCOME10 Coupon) */}
        <SpecialOfferBanner />

        {/* 10. Service / Benefits Assurance Strip */}
        <BenefitsStrip />

        {/* 11. Newsletter Subscription */}
        <NewsletterSection />
      </main>

      {/* 12. Complete Customer Storefront Footer */}
      <Footer />
    </div>
  );
}
