import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Hero from '@/components/Hero';
import FeaturedProducts from '@/components/FeaturedProducts';
import Categories from '@/components/Categories';
// import TrustBadges from '@/components/TrustBadges';
import ProductCard from '@/components/ProductCard';
import { fetchProducts, Product } from '@/lib/store';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <>
      <Hero />
      {/* <TrustBadges /> */}
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
            {/* <p className="text-xs tracking-wide-luxury uppercase text-muted-foreground mb-4">Most Loved</p> */}
            <h2 className="text-3xl md:text-4xl font-display text-foreground">Best Sellers</h2>
          </motion.div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading ? (
              <p className="text-center col-span-4 text-muted-foreground">Loading products...</p>
            ) : (
              products.slice(0, 4).map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))
            )}
          </div>
        </div>
      </section>

      <Categories />
      
      {/* Brand Story Section */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            {/* <p className="text-xs tracking-wide-luxury uppercase text-muted-foreground mb-4">
              Our Philosophy
            </p> */}
            <h2 className="text-4xl md:text-5xl font-display font-normal text-foreground mb-4">
              Our Story
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src="https://le-cdn.website-editor.net/6ab80cd7b8b644baa0545c7019a6ba1b/dms3rep/multi/opt/Foto_015-1920w.jpg?m"
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
              <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                TAJDO is a name born from a bond: a combination of <strong>Tajana</strong> and her dog, <strong>Dollar</strong>. An unbeatable team from Switzerland to Zanzibar, their story is the heart of our brand.
              </p>
              <p>
                A journey to Zanzibar changed everything for our founder. Moved by the plight of street dogs, she dedicated her life to their cause, creating a brand that gives back with every purchase.
              </p>
              <p>
                TAJDO was born from this love—a desire to take on responsibility and make a meaningful difference.
              </p>
              </div>
              <Link to="/about" className="mt-8 inline-block">
                <Button variant="outline" className="rounded-none text-xs tracking-luxury uppercase">
                  Read Our Full Story
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
