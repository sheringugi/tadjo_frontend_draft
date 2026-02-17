import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1920&h=1080&fit=crop"
          alt="Elegant dog with luxury accessories"
          className="w-full h-full object-cover"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-transparent" />
      </div>

      <div className="container mx-auto relative z-10">
        <div className="max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-xs tracking-wide-luxury uppercase text-muted-foreground mb-6">
              Luxury with Purpose
            </p>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-normal text-foreground leading-[1.1] mb-6">
              Timeless Elegance
              <br />
              <span className="italic">for Your Companion</span>
            </h1>
            
            <p className="text-base text-muted-foreground max-w-md mb-10 leading-relaxed">
              Handcrafted pet accessories in the finest materials. 
              Designed in Switzerland for discerning pet owners who appreciate 
              quiet luxury and enduring quality.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/products">
                <Button 
                  size="lg" 
                  className="bg-foreground text-background hover:bg-foreground/90 rounded-none px-10 h-12 text-xs tracking-luxury uppercase"
                >
                  Shop Collection
                  <ArrowRight className="ml-3 w-4 h-4" />
                </Button>
              </Link>
              
              <Link to="/about">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-foreground text-foreground hover:bg-foreground hover:text-background rounded-none px-10 h-12 text-xs tracking-luxury uppercase"
                >
                  Our Story
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-wrap gap-8 mt-16 text-xs text-muted-foreground tracking-wide uppercase"
          >
            <span>Free Shipping</span>
            <span>•</span>
            <span>Handcrafted</span>
            <span>•</span>
            <span>Swiss Design</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;