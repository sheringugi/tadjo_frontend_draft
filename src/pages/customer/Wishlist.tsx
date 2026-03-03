import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Trash2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { addToCart, Product, fetchProducts } from '@/lib/store';
import { getWishlist, removeFromWishlist } from '@/lib/wishlist';
import { useToast } from '@/hooks/use-toast';

const Wishlist = () => {
  const [wishlistIds, setWishlistIds] = useState(getWishlist());
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]); // Placeholder
  const { toast } = useToast();

  useEffect(() => {
    const loadWishlistProducts = async () => {
      const allProducts = await fetchProducts();
      const filtered = allProducts.filter(p => wishlistIds.includes(p.id));
      setWishlistProducts(filtered);
    };

    if (wishlistIds.length > 0) loadWishlistProducts();
    else setWishlistProducts([]);
  }, [wishlistIds]);

  const handleRemove = async (productId: string) => {
    await removeFromWishlist(productId);
    setWishlistIds(getWishlist());
    window.dispatchEvent(new Event('wishlist-updated'));
    toast({ title: 'Removed from wishlist' });
  };

  const handleMoveToCart = async (productId: string) => {
    const product = wishlistProducts.find(p => p.id === productId);
    if (product) {
      await addToCart(product, 1);
      window.dispatchEvent(new Event('cart-updated'));
      await removeFromWishlist(productId);
      setWishlistIds(getWishlist());
      window.dispatchEvent(new Event('wishlist-updated'));
      toast({ title: 'Moved to bag', description: `${product.name} added to your bag.` });
    }
  };

  return (
    <div className="pt-24 md:pt-32 pb-24">
      <div className="container mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-xs tracking-luxury uppercase text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </Link>
            <h1 className="text-4xl font-display text-foreground">Wishlist</h1>
            <p className="text-muted-foreground mt-2">{wishlistProducts.length} item{wishlistProducts.length !== 1 ? 's' : ''} saved</p>
          </motion.div>

          {wishlistProducts.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
              <Heart className="w-12 h-12 mx-auto mb-6 text-muted-foreground/40" />
              <h2 className="text-2xl font-display text-foreground mb-3">Your wishlist is empty</h2>
              <p className="text-muted-foreground mb-8">Save items you love to revisit them later.</p>
              <Link to="/products">
                <Button className="bg-foreground text-background hover:bg-foreground/90 rounded-none text-xs tracking-luxury uppercase">
                  Browse Products
                </Button>
              </Link>
            </motion.div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistProducts.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group border border-border"
                >
                  <Link to={`/product/${product.id}`} className="block">
                    <div className="aspect-square overflow-hidden bg-secondary">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </Link>
                  <div className="p-4">
                    <Link to={`/product/${product.id}`}>
                      <h3 className="font-display text-foreground mb-1 hover:underline">{product.name}</h3>
                    </Link>
                    <p className="text-sm text-muted-foreground mb-4">CHF {product.price.toFixed(0)}</p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleMoveToCart(product.id)}
                        className="flex-1 bg-foreground text-background hover:bg-foreground/90 rounded-none text-xs tracking-luxury uppercase h-9"
                      >
                        <ShoppingBag className="w-3 h-3 mr-2" />
                        Add to Bag
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-none h-9 w-9"
                        onClick={() => handleRemove(product.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
    </div>
  );
};

export default Wishlist;
