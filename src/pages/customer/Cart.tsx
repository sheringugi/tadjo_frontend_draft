import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  getCart,
  updateCartQuantity,
  removeFromCart,
  getCartTotal,
  CartItem,
} from '@/lib/store';

const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [promoCode, setPromoCode] = useState('');

  useEffect(() => {
    setCartItems(getCart());
  }, []);

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    const updated = updateCartQuantity(productId, quantity);
    setCartItems(updated);
  };

  const handleRemove = (productId: string) => {
    const updated = removeFromCart(productId);
    setCartItems(updated);
  };

  const subtotal = getCartTotal();
  const shipping = subtotal > 150 ? 0 : 15;
  const total = subtotal + shipping;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-28 md:pt-36 pb-24">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-secondary flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-muted-foreground" />
              </div>
              <h1 className="text-3xl font-display text-foreground mb-3">
                Your Bag is Empty
              </h1>
              <p className="text-muted-foreground mb-8">
                Discover our curated collection of luxury pet accessories.
              </p>
              <Link to="/products">
                <Button className="bg-foreground text-background hover:bg-foreground/90 rounded-none px-10 h-12 text-xs tracking-luxury uppercase">
                  Shop Now
                  <ArrowRight className="ml-3 w-4 h-4" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-28 md:pt-36 pb-24">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-xs tracking-luxury uppercase text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </Link>
            <h1 className="text-4xl font-display text-foreground">
              Shopping Bag
            </h1>
            <p className="text-muted-foreground mt-2">
              {cartItems.reduce((sum, item) => sum + item.quantity, 0)} items
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              <AnimatePresence>
                {cartItems.map((item) => (
                  <motion.div
                    key={item.product.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex gap-6 pb-6 border-b border-border"
                  >
                    <Link to={`/product/${item.product.id}`}>
                      <div className="w-28 h-36 md:w-32 md:h-40 overflow-hidden bg-secondary flex-shrink-0">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </Link>

                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${item.product.id}`}>
                        <h3 className="font-display text-lg text-foreground hover:text-muted-foreground transition-colors">
                          {item.product.name}
                        </h3>
                      </Link>
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.product.material}
                      </p>
                      {item.product.color && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.product.color}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-6">
                        <div className="flex items-center border border-border">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-none"
                            onClick={() =>
                              handleUpdateQuantity(item.product.id, item.quantity - 1)
                            }
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-none"
                            onClick={() =>
                              handleUpdateQuantity(item.product.id, item.quantity + 1)
                            }
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>

                        <p className="font-medium text-foreground">
                          CHF {(item.product.price * item.quantity).toFixed(0)}
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-foreground flex-shrink-0"
                      onClick={() => handleRemove(item.product.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="sticky top-36"
              >
                <h2 className="text-xs tracking-luxury uppercase font-medium text-foreground mb-6">
                  Order Summary
                </h2>

                {/* Promo Code */}
                <div className="flex gap-2 mb-8">
                  <Input
                    placeholder="Promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="rounded-none"
                  />
                  <Button variant="outline" className="rounded-none text-xs tracking-luxury uppercase">
                    Apply
                  </Button>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">CHF {subtotal.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">
                      {shipping === 0 ? 'Complimentary' : `CHF ${shipping.toFixed(0)}`}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Add CHF {(150 - subtotal).toFixed(0)} more for complimentary shipping
                    </p>
                  )}
                </div>

                <div className="border-t border-border pt-6 mb-8">
                  <div className="flex justify-between">
                    <span className="text-foreground">Total</span>
                    <span className="text-lg font-medium text-foreground">
                      CHF {total.toFixed(0)}
                    </span>
                  </div>
                </div>

                <Link to="/checkout">
                  <Button className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-none h-12 text-xs tracking-luxury uppercase">
                    Proceed to Checkout
                    <ArrowRight className="ml-3 w-4 h-4" />
                  </Button>
                </Link>

                <p className="text-xs text-center text-muted-foreground mt-6">
                  Secure checkout • 30-day returns
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;