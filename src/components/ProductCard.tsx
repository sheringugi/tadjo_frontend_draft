import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
// import { Plus, Heart } from 'lucide-react';
import {Heart} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product, addToCart } from '@/lib/store';
import { isInWishlist, toggleWishlist } from '@/lib/wishlist';
import { useToast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: Product;
  index?: number;
}

const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [wishlisted, setWishlisted] = useState(isInWishlist(product.id));
  const { toast } = useToast();

  const badgeLabel = product.badge === 'bestseller' ? 'Best Seller' : 
                     product.badge === 'new' ? 'New' : 
                     product.badge === 'limited' ? 'Limited' : null;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await addToCart(product);
    window.dispatchEvent(new Event('cart-updated'));
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
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            
            {/* Badge */}
            {badgeLabel && (
              <div className="absolute top-4 left-4">
                <span className="text-[10px] tracking-luxury uppercase bg-background/95 backdrop-blur-sm px-3 py-1.5 text-foreground">
                  {badgeLabel}
                </span>
              </div>
            )}

            {/* Wishlist Button */}
            <button
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const added = await toggleWishlist(product.id);
                setWishlisted(added);
                window.dispatchEvent(new Event('wishlist-updated'));
                toast({ title: added ? 'Added to wishlist' : 'Removed from wishlist' });
              }}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-full hover:bg-background transition-colors"
            >
              <Heart className={`w-4 h-4 ${wishlisted ? 'fill-foreground text-foreground' : 'text-foreground'}`} />
            </button>

            {/* Quick Add Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-4 left-4 right-4"
            >
              <Button
                onClick={handleAddToCart}
                className="w-full bg-background/95 backdrop-blur-sm text-foreground hover:bg-foreground hover:text-background shadow-lg text-xs uppercase tracking-wider"
              >
                Add to Cart
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
              CHF {Number(product.price).toFixed(0)}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;