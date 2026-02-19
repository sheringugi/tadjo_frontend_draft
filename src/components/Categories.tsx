import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface Category {
  id: string;
  name: string;
  description: string;
  image_url?: string;
}

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Fetch categories from the backend
        const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';
        const response = await fetch(`${apiUrl}/categories/`);
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <section className="py-24 md:py-32 bg-secondary/30">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-xs tracking-wide-luxury uppercase text-muted-foreground mb-4">
            Collections
          </p>
          <h2 className="text-4xl md:text-5xl font-display font-normal text-foreground">
            Shop by Category
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {isLoading ? (
            <div className="col-span-3 text-center py-12 text-muted-foreground">Loading collections...</div>
          ) : (
            categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
            >
              <Link to={`/products?category=${category.id}`}>
                <div className="group relative overflow-hidden bg-background border border-border h-full flex flex-col items-center justify-center text-center min-h-[300px]">
                  {category.image_url && (
                    <>
                      <img 
                        src={category.image_url} 
                        alt={category.name} 
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
                    </>
                  )}
                  <div className="relative z-10 p-12">
                    <h3 className={`text-2xl font-display mb-3 transition-transform duration-300 ${category.image_url ? 'text-white' : 'text-foreground'}`}>
                    {category.name}
                  </h3>
                    <p className={`text-sm tracking-wide ${category.image_url ? 'text-white/90' : 'text-muted-foreground'}`}>
                    {category.description}
                  </p>
                  </div>
                </div>
              </Link>
            </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default Categories;