import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product, addToCart } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: Product;
  index?: number;
}

const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    toast({
      title: "Added to bag",
      description: `${product.name} has been added to your bag.`,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link to={`/product/${product.id}`}>
        <div
          className="group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Image Container */}
          <div className="relative aspect-[3/4] overflow-hidden bg-secondary mb-4">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            
            {/* Badge */}
            {product.badge && (
              <div className="absolute top-4 left-4">
                <span className="text-[10px] tracking-luxury uppercase bg-background/95 backdrop-blur-sm px-3 py-1.5 text-foreground">
                  {product.badge === 'bestseller' ? 'Best Seller' : 
                   product.badge === 'new' ? 'New' : 
                   product.badge === 'limited' ? 'Limited' : ''}
                </span>
              </div>
            )}

            {/* Quick Add Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-4 right-4"
            >
              <Button
                onClick={handleAddToCart}
                size="icon"
                className="w-10 h-10 rounded-full bg-background text-foreground hover:bg-foreground hover:text-background shadow-lg"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </motion.div>
          </div>

          {/* Content */}
          <div className="space-y-1">
            <p className="text-[11px] tracking-wide uppercase text-muted-foreground">
              {product.material}
            </p>
            <h3 className="text-base font-display text-foreground group-hover:text-muted-foreground transition-colors">
              {product.name}
            </h3>
            <p className="text-sm text-foreground">
              CHF {product.price.toFixed(0)}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;