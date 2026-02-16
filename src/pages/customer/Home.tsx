import { Link } from 'react-router-dom';
import Hero from '@/components/Hero';
import FeaturedProducts from '@/components/FeaturedProducts';
import Categories from '@/components/Categories';
import TrustBadges from '@/components/TrustBadges';
import ProductCard from '@/components/ProductCard';
import { products } from '@/lib/store';
import { motion } from 'framer-motion';

const Home = () => {
  return (
    <>
      <Hero />
      <TrustBadges />
      <FeaturedProducts />

      {/* Best Sellers */}
      <section className="py-24 md:py-32 bg-secondary/30">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-xs tracking-wide-luxury uppercase text-muted-foreground mb-4">Most Loved</p>
            <h2 className="text-3xl md:text-4xl font-display text-foreground">Best Sellers</h2>
          </motion.div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {products.filter(p => p.badge === 'bestseller' || p.reviews > 100).slice(0, 4).map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </div>
      </section>

      <Categories />
      
      {/* Brand Story Section */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&h=1000&fit=crop"
                  alt="Dogs in nature"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <p className="text-xs tracking-wide-luxury uppercase text-muted-foreground mb-4">
                Our Philosophy
              </p>
              <h2 className="text-4xl md:text-5xl font-display font-normal text-foreground mb-6 leading-tight">
                Luxury with
                <br />
                <span className="italic">Purpose</span>
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  At TAJDO, we believe that the bond between you and your companion 
                  deserves to be celebrated with objects of enduring beauty and quality.
                </p>
                <p>
                  Each piece in our collection is designed in our Swiss studio and 
                  crafted by skilled artisans using the finest materials—Italian leather, 
                  organic cotton, and solid brass hardware.
                </p>
                <p>
                  The result is a quiet luxury: timeless, understated, and made to last 
                  a lifetime.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
