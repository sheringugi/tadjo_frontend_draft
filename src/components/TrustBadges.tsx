import { motion } from 'framer-motion';

const values = [
  {
    title: 'Swiss Design',
    description: 'Designed with precision and care in our Zurich studio',
  },
  {
    title: 'Sustainable Materials',
    description: 'Ethically sourced leather, organic cotton, and natural fibers',
  },
  {
    title: 'Artisan Crafted',
    description: 'Handmade by skilled craftspeople using traditional techniques',
  },
  {
    title: 'Lifetime Care',
    description: 'Complimentary repairs and conditioning for all leather goods',
  },
];

const TrustBadges = () => {
  return (
    <section className="py-20 border-y border-border">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-6">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="text-center"
            >
              <h4 className="text-sm tracking-luxury uppercase font-medium text-foreground mb-2">
                {value.title}
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {value.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBadges;