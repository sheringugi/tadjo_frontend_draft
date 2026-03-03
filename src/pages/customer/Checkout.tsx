import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { getCart, getCartTotal, clearCart, CartItem } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { getCurrentUser, customerFetch } from '@/lib/auth';

// ✅ ADD: Stripe imports
import {
  CardElement,
  useStripe,
  useElements,
  Elements
} from '@stripe/react-stripe-js';
import { stripePromise } from '@/utils/stripe';

// ============================================
// Inner component (needs to be inside Elements)
// ============================================
const CheckoutForm = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zip: '',
  });

  // ✅ ADD: Stripe hooks
  const stripe = useStripe();
  const elements = useElements();

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await getCurrentUser();
        setFormData(prev => ({
          ...prev,
          firstName: user.full_name?.split(' ')[0] || '',
          lastName: user.full_name?.split(' ').slice(1).join(' ') || '',
          email: user.email || '',
          phone: user.phone || '',
        }));
      } catch (e) {
        console.error("Failed to load user data", e);
      }
    };
    loadUser();

    const items = getCart();
    if (items.length === 0) {
      navigate('/cart');
    }
    setCartItems(items);
  }, [navigate]);

  const subtotal = getCartTotal();
  // const shipping = subtotal > 150 ? 0 : 15;
  // const total = subtotal + shipping;
  const total = subtotal; // Free shipping for simplicity

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  // ============================================
  // ✅ UPDATED: handleSubmit with Stripe payment
  // ============================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Guard: Stripe must be loaded
    if (!stripe || !elements) {
      toast({
        title: "Payment not ready",
        description: "Please wait a moment and try again.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const user = await getCurrentUser();

      // ============================================
      // STEP 1: Create Payment Intent on backend
      // (Like M-Pesa STK Push initiation)
      // ============================================
      const intentRes = await customerFetch('/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total,
          payment_method: paymentMethod  // "card" or "twint"
        })
      });

      if (!intentRes.ok) throw new Error('Failed to create payment intent');
      const { client_secret } = await intentRes.json();

      // ============================================
      // STEP 2: Confirm Payment with Stripe
      // (Like customer entering M-Pesa PIN)
      // ============================================
      if (paymentMethod === 'twint') {
        // 1. Save order data for after redirect
        sessionStorage.setItem('pending_order_data', JSON.stringify({
          address: {
            user_id: user.id,
            line1: formData.address,
            city: formData.city,
            postal_code: formData.zip,
            country: 'CH',
            is_default: true
          },
          items: cartItems.map(item => ({
            product_id: item.product.id,
            quantity: item.quantity
          }))
        }));

        // 2. Create payment method
        const { error: pmError, paymentMethod: pm } = await stripe.createPaymentMethod({
          type: 'twint',
          billing_details: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            phone: formData.phone,
          }
        });

        if (pmError) throw new Error(pmError.message);

        // 3. Redirect to Twint (user leaves page here)
        const { error } = await stripe.confirmTwintPayment(client_secret, {
          payment_method: pm.id,
          return_url: `${window.location.origin}/order-confirmation`
        });

        if (error) throw new Error(error.message);
        
        // Code never reaches here for Twint usually
        return;
      }

      // ============================================
      // CARD FLOW (Immediate)
      // ============================================
      const paymentResult = await stripe.confirmCardPayment(client_secret, {
          payment_method: {
            card: elements.getElement(CardElement)!,
            billing_details: {
              name: `${formData.firstName} ${formData.lastName}`,
              email: formData.email,
              phone: formData.phone,
              address: {
                line1: formData.address,
                city: formData.city,
                postal_code: formData.zip,
                country: 'CH'
              }
            }
          }
        });

      // ============================================
      // STEP 3: Check Payment Result
      // (Like checking M-Pesa callback ResultCode)
      // ============================================
      if (paymentResult.error) {
        // Payment failed (like M-Pesa ResultCode: 1032)
        throw new Error(paymentResult.error.message);
      }

      if (paymentResult.paymentIntent?.status !== 'succeeded') {
        throw new Error('Payment was not completed');
      }

      // Payment succeeded! (like M-Pesa ResultCode: 0)
      const paymentIntentId = paymentResult.paymentIntent.id;

      // ============================================
      // STEP 4: Create Address (same as before)
      // ============================================
      const addressRes = await customerFetch('/addresses/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          line1: formData.address,
          city: formData.city,
          postal_code: formData.zip,
          country: 'CH',
          is_default: true
        })
      });

      if (!addressRes.ok) throw new Error('Failed to save address');
      const savedAddress = await addressRes.json();

      // ============================================
      // STEP 5: Create Order (with payment proof)
      // ============================================
      const orderRes = await customerFetch('/orders/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          shipping_address_id: savedAddress.id,
          payment_method: paymentMethod,
          payment_intent_id: paymentIntentId, // ✅ Proof of payment
          items: cartItems.map(item => ({
            product_id: item.product.id,
            quantity: item.quantity
          }))
        })
      });

      if (!orderRes.ok) throw new Error('Failed to place order');
      const savedOrder = await orderRes.json();

      // ============================================
      // STEP 6: Success
      // ============================================
      clearCart();
      toast({
        title: "Order confirmed! 🎉",
        description: "Your TAJDO order has been placed successfully.",
      });
      navigate('/order-confirmation', {
        state: { orderId: savedOrder.order_number }
      });

    } catch (error: any) {
      console.error(error);
      toast({
        title: "Checkout failed",
        description: error.message || "There was a problem processing your order.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="pt-24 md:pt-32 pb-24">
      <div className="container mx-auto">
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
            {/* Left: Form */}
            <div className="lg:col-span-3 space-y-10">

              {/* Shipping Information - UNCHANGED */}
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
                    <Input id="firstName" className="rounded-none" required value={formData.firstName} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-xs text-muted-foreground">Last Name</Label>
                    <Input id="lastName" className="rounded-none" required value={formData.lastName} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="email" className="text-xs text-muted-foreground">Email</Label>
                    <Input id="email" type="email" className="rounded-none" required value={formData.email} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="phone" className="text-xs text-muted-foreground">Phone</Label>
                    <Input id="phone" type="tel" className="rounded-none" required value={formData.phone} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="address" className="text-xs text-muted-foreground">Address</Label>
                    <Input id="address" className="rounded-none" required value={formData.address} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-xs text-muted-foreground">City</Label>
                    <Input id="city" className="rounded-none" required value={formData.city} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip" className="text-xs text-muted-foreground">Postal Code</Label>
                    <Input id="zip" className="rounded-none" required value={formData.zip} onChange={handleInputChange} />
                  </div>
                </div>
              </motion.div>

              {/* ✅ UPDATED: Payment Method Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-xs tracking-luxury uppercase font-medium text-foreground mb-6">
                  Payment Method
                </h2>

                {/* ✅ Only Card and Twint */}
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                  className="space-y-3"
                >
                  {/* Card Option */}
                  <label className="flex items-center gap-4 p-4 border border-border cursor-pointer hover:border-foreground transition-colors [&:has(:checked)]:border-foreground">
                    <RadioGroupItem value="card" id="card" />
                    <div className="flex-1">
                      <p className="font-medium text-foreground text-sm">
                        Credit / Debit Card
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Visa, Mastercard, Amex
                      </p>
                    </div>
                    {/* Card logos */}
                    <div className="flex gap-1">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">VISA</span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">MC</span>
                    </div>
                  </label>

                  {/* Twint Option */}
                  <label className="flex items-center gap-4 p-4 border border-border cursor-pointer hover:border-foreground transition-colors [&:has(:checked)]:border-foreground">
                    <RadioGroupItem value="twint" id="twint" />
                    <div className="flex-1">
                      <p className="font-medium text-foreground text-sm">
                        Twint
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Swiss mobile payment
                      </p>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold">
                      TWINT
                    </span>
                  </label>
                </RadioGroup>

                {/* ✅ Stripe Card Element (replaces plain inputs) */}
                {paymentMethod === 'card' && (
                  <div className="mt-6">
                    <Label className="text-xs text-muted-foreground mb-2 block">
                      Card Details
                    </Label>
                    <div className="border border-border p-4 rounded-none focus-within:border-foreground transition-colors">
                      <CardElement
                        options={{
                          style: {
                            base: {
                              fontSize: '14px',
                              color: '#1a1a1a',
                              fontFamily: 'Inter, sans-serif',
                              '::placeholder': {
                                color: '#9ca3af'
                              }
                            },
                            invalid: {
                              color: '#ef4444'
                            }
                          },
                          hidePostalCode: true
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      🔒 Your card details are encrypted and secure
                    </p>
                  </div>
                )}

                {/* Twint Info */}
                {paymentMethod === 'twint' && (
                  <div className="mt-6 bg-blue-50 border border-blue-100 p-4">
                    <p className="text-sm text-blue-800 font-medium mb-1">
                      How Twint works:
                    </p>
                    <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                      <li>Click "Place Order" below</li>
                      <li>You will be redirected to the Twint app</li>
                      <li>Confirm payment in your Twint app</li>
                      <li>You'll be returned here automatically</li>
                    </ol>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Right: Order Summary - UNCHANGED */}
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
                          src={item.product.image_url}
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
                    {/* <span className="text-muted-foreground">Shipping</span> */}
                    {/* <span className="font-medium">
                      {shipping === 0 ? 'Complimentary' : `CHF ${shipping.toFixed(0)}`}
                    </span> */}
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
                  disabled={isProcessing || !stripe}
                >
                  {isProcessing ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      {paymentMethod === 'twint' ? 'Continue to Twint' : 'Place Order'}
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground mt-6">
                  🔒 Secured by Stripe • PCI DSS Compliant
                </p>
              </motion.div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================
// ✅ Wrapper: Provides Stripe context
// Like wrapping M-Pesa components with provider
// ============================================
const Checkout = () => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
};

export default Checkout;