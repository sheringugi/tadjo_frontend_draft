import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const categoryImages = [
  {
    id: 'collars',
    name: 'Collars',
    image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=600&h=800&fit=crop',
    description: 'Handcrafted in Italian leather',
  },
  {
    id: 'beds',
    name: 'Beds',
    image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=600&h=800&fit=crop',
    description: 'Designed for comfort',
  },
  {
    id: 'accessories',
    name: 'Accessories',
    image: 'https://images.unsplash.com/photo-1587764379873-97837921fd44?w=600&h=800&fit=crop',
    description: 'Finishing touches',
  },
];

const Categories = () => {
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
          {categoryImages.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
            >
              <Link to={`/products?category=${category.id}`}>
                <div className="group relative aspect-[3/4] overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-foreground/20 transition-opacity duration-300 group-hover:opacity-0" />
                  
                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-end p-8">
                    <div className="bg-background/95 backdrop-blur-sm px-8 py-6 text-center w-full max-w-xs transition-transform duration-300 group-hover:-translate-y-2">
                      <h3 className="text-xl font-display text-foreground mb-1">
                        {category.name}
                      </h3>
                      <p className="text-xs text-muted-foreground tracking-wide">
                        {category.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;