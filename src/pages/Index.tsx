import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import FeaturedProducts from '@/components/FeaturedProducts';
import Categories from '@/components/Categories';
import TrustBadges from '@/components/TrustBadges';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16 md:pt-20">
        <Hero />
        <TrustBadges />
        <FeaturedProducts />
        <Categories />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
