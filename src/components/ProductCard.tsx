import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Star } from 'lucide-react';
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
  const navigate = useNavigate();

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

  const handleRatingClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/product/${product.id}#reviews`);
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
              className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
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
            {product.rating > 0 && (
              <div 
                className="flex items-center gap-1 w-fit cursor-pointer hover:opacity-70 transition-opacity"
                onClick={handleRatingClick}
              >
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${i < Math.round(product.rating) ? 'fill-primary text-primary' : 'text-muted-foreground/30'}`}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-muted-foreground">({product.review_count})</span>
              </div>
            )}
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