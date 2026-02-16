import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { getCart, getCartTotal, clearCart, CartItem } from '@/lib/store';
import { createSupplierOrdersFromCustomerOrder } from '@/lib/suppliers';
import { useToast } from '@/hooks/use-toast';

const Checkout = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const items = getCart();
    if (items.length === 0) {
      navigate('/cart');
    }
    setCartItems(items);
  }, [navigate]);

  const subtotal = getCartTotal();
  const shipping = subtotal > 150 ? 0 : 15;
  const total = subtotal + shipping;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Generate a customer order ID and auto-create supplier orders
    const customerOrderId = `ORD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const orderItems = cartItems.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      quantity: item.quantity,
    }));
    createSupplierOrdersFromCustomerOrder(customerOrderId, orderItems);

    clearCart();
    toast({
      title: "Order confirmed",
      description: "Supplier orders have been auto-generated.",
    });
    navigate('/order-confirmation');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-28 md:pt-36 pb-24">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <Link
              to="/cart"
              className="inline-flex items-center gap-2 text-xs tracking-luxury uppercase text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Bag
            </Link>
            <h1 className="text-4xl font-display text-foreground">
              Checkout
            </h1>
          </motion.div>

          <form onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-5 gap-12">
              {/* Form */}
              <div className="lg:col-span-3 space-y-10">
                {/* Shipping Information */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h2 className="text-xs tracking-luxury uppercase font-medium text-foreground mb-6">
                    Shipping Information
                  </h2>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-xs text-muted-foreground">First Name</Label>
                      <Input id="firstName" className="rounded-none" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-xs text-muted-foreground">Last Name</Label>
                      <Input id="lastName" className="rounded-none" required />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="email" className="text-xs text-muted-foreground">Email</Label>
                      <Input id="email" type="email" className="rounded-none" required />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="address" className="text-xs text-muted-foreground">Address</Label>
                      <Input id="address" className="rounded-none" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-xs text-muted-foreground">City</Label>
                      <Input id="city" className="rounded-none" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zip" className="text-xs text-muted-foreground">Postal Code</Label>
                      <Input id="zip" className="rounded-none" required />
                    </div>
                  </div>
                </motion.div>

                {/* Payment Method */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h2 className="text-xs tracking-luxury uppercase font-medium text-foreground mb-6">
                    Payment Method
                  </h2>

                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                    className="space-y-3"
                  >
                    <label className="flex items-center gap-4 p-4 border border-border cursor-pointer hover:border-foreground transition-colors [&:has(:checked)]:border-foreground">
                      <RadioGroupItem value="card" id="card" />
                      <div className="flex-1">
                        <p className="font-medium text-foreground text-sm">Credit Card</p>
                        <p className="text-xs text-muted-foreground">Visa, Mastercard, Amex</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-4 p-4 border border-border cursor-pointer hover:border-foreground transition-colors [&:has(:checked)]:border-foreground">
                      <RadioGroupItem value="paypal" id="paypal" />
                      <div className="flex-1">
                        <p className="font-medium text-foreground text-sm">PayPal</p>
                        <p className="text-xs text-muted-foreground">Secure checkout</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-4 p-4 border border-border cursor-pointer hover:border-foreground transition-colors [&:has(:checked)]:border-foreground">
                      <RadioGroupItem value="klarna" id="klarna" />
                      <div className="flex-1">
                        <p className="font-medium text-foreground text-sm">Klarna</p>
                        <p className="text-xs text-muted-foreground">Pay in 3 interest-free installments</p>
                      </div>
                    </label>
                  </RadioGroup>

                  {paymentMethod === 'card' && (
                    <div className="mt-6 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="cardNumber" className="text-xs text-muted-foreground">Card Number</Label>
                        <Input id="cardNumber" placeholder="1234 5678 9012 3456" className="rounded-none" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiry" className="text-xs text-muted-foreground">Expiry Date</Label>
                          <Input id="expiry" placeholder="MM/YY" className="rounded-none" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvv" className="text-xs text-muted-foreground">CVV</Label>
                          <Input id="cvv" placeholder="123" className="rounded-none" />
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="sticky top-36"
                >
                  <h2 className="text-xs tracking-luxury uppercase font-medium text-foreground mb-6">
                    Order Summary
                  </h2>

                  <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                    {cartItems.map((item) => (
                      <div key={item.product.id} className="flex gap-4">
                        <div className="w-16 h-20 overflow-hidden bg-secondary flex-shrink-0">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-display text-foreground line-clamp-1">
                            {item.product.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-medium text-foreground">
                          CHF {(item.product.price * item.quantity).toFixed(0)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4 border-t border-border pt-6 mb-6">
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
                  </div>

                  <div className="border-t border-border pt-6 mb-8">
                    <div className="flex justify-between">
                      <span className="text-foreground">Total</span>
                      <span className="text-lg font-medium text-foreground">
                        CHF {total.toFixed(0)}
                      </span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-none h-12 text-xs tracking-luxury uppercase"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Place Order
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground mt-6">
                    Your payment is secure and encrypted
                  </p>
                </motion.div>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;