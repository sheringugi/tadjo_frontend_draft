import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
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
  const { t } = useTranslation('common');

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
            <h2 className="text-3xl md:text-4xl font-display text-foreground">{t('home.bestsellersHeading')}</h2>
          </motion.div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading ? (
              <p className="text-center col-span-4 text-muted-foreground">{t('home.loadingProducts')}</p>
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
              {t('home.storyHeading')}
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
                  <Trans 
                    i18nKey="home.storyText1" 
                    ns="common"
                    components={{ 1: <strong />, 3: <strong /> }}
                  />
                </p>
                <p>{t('home.storyText2')}</p>
                <p>{t('home.storyText3')}</p>
              </div>
              <Link to="/about" className="mt-8 inline-block">
                <Button variant="outline" className="rounded-none text-xs tracking-luxury uppercase">
                  {t('home.storyButton')}
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
