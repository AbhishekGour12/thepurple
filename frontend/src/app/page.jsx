'use client';

import AnnouncementBar from '../components/layout/AnnouncementBar';
import MainHeader from '../components/layout/MainHeader';
import CategoryNav from '../components/layout/CategoryNav';
import HeroBanner from '../components/home/HeroBanner';
import HeroTrustStrip from '../components/home/HeroTrustStrip';
import FeaturedCategories from '../components/home/FeaturedCategories';
import HomeFeaturedProducts from '../components/home/HomeFeaturedProducts';
import HomeAboutSection from '../components/home/HomeAboutSection';
import RecentlyViewed from '../components/home/RecentlyViewed';
import SpecialOfferBanner from '../components/home/SpecialOfferBanner';
import BenefitsStrip from '../components/home/BenefitsStrip';
import HomeContactSection from '../components/home/HomeContactSection';
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

      {/* 3. Category Navigation (Only on HomePage) */}
      <CategoryNav />

      {/* Main Storefront Content Area */}
      <main style={{ flex: 1 }}>
        {/* 4. Hero Banner Carousel */}
        <HeroBanner />

        {/* 5. Shop By Category Visual Showcase (6-Box Slider) */}
        <FeaturedCategories />

        {/* 6. Trending Products Showcase (10 items + View All CTA) */}
        <HomeFeaturedProducts />

        {/* 7. Brand Story / About Us Section with luxury visuals */}
        <HomeAboutSection />

        {/* 8. Special Offer Banner (WELCOME10 Coupon) */}
        <SpecialOfferBanner />

        {/* 9. Recently Viewed Products */}
        <RecentlyViewed />

        {/* 10. Service / Benefits Assurance Strip */}
        <BenefitsStrip />

        {/* 11. Contact Us Section */}
        <HomeContactSection />
      </main>

      {/* 12. Complete Customer Storefront Footer */}
      <Footer />
    </div>
  );
}
