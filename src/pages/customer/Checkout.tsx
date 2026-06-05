import { useState, useEffect, useRef } from 'react';
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

import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
  Elements
} from '@stripe/react-stripe-js';
import { stripePromise } from '@/utils/stripe';

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
  const [twintOrder, setTwintOrder] = useState<{ order_number: string, total: number } | null>(null);

  // ✅ NEW: ref to track the opened TWINT tab
  const twintTabRef = useRef<Window | null>(null);

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
    if (items.length === 0) navigate('/cart');
    setCartItems(items);
  }, [navigate]);

  const subtotal = getCartTotal();
  const total = subtotal;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (twintOrder) {
      navigate(`/order-confirmation?order_number=${twintOrder.order_number}`);
      return;
    }

    if (!stripe || !elements) {
      toast({
        title: "Payment not ready",
        description: "Please wait a moment and try again.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    const pendingOrderData = {
      address: { line1: formData.address, city: formData.city, postal_code: formData.zip, country: 'CH' },
      items: cartItems.map(item => ({ product_id: item.product.id, quantity: item.quantity })),
      paymentMethod: paymentMethod,
      email: formData.email
    };
    sessionStorage.setItem('pending_order_data', JSON.stringify(pendingOrderData));

    try {
      const user = await getCurrentUser();

      // ── TWINT FLOW ──────────────────────────────────────────────────────────
      if (paymentMethod === 'twint') {
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

        const orderRes = await customerFetch('/orders/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            shipping_address_id: savedAddress.id,
            payment_method: 'twint',
            payment_intent_id: `TWINT_PENDING_${Date.now()}`,
            items: cartItems.map(item => ({ product_id: item.product.id, quantity: item.quantity }))
          })
        });
        if (!orderRes.ok) throw new Error('Failed to place order');
        const savedOrder = await orderRes.json();

        clearCart();
        setTwintOrder({ order_number: savedOrder.order_number, total: Number(savedOrder.total) });
        setIsProcessing(false);
        return;
      }

      // ── CARD FLOW ────────────────────────────────────────────────────────────
      const intentRes = await customerFetch('/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total, payment_method: paymentMethod })
      });
      if (!intentRes.ok) throw new Error('Failed to create payment intent');
      const { client_secret } = await intentRes.json();

      const paymentResult = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: elements.getElement(CardNumberElement)!,
          billing_details: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            phone: formData.phone,
            address: { line1: formData.address, city: formData.city, postal_code: formData.zip, country: 'CH' }
          }
        },
        return_url: `${window.location.origin}/order-confirmation`
      });

      if (paymentResult.error) throw new Error(paymentResult.error.message);
      if (paymentResult.paymentIntent?.status !== 'succeeded') throw new Error('Payment was not completed');

      const paymentIntentId = paymentResult.paymentIntent.id;

      const addressRes = await customerFetch('/addresses/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id, line1: formData.address, city: formData.city,
          postal_code: formData.zip, country: 'CH', is_default: true
        })
      });
      if (!addressRes.ok) throw new Error('Failed to save address');
      const savedAddress = await addressRes.json();

      const orderRes = await customerFetch('/orders/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          shipping_address_id: savedAddress.id,
          payment_method: paymentMethod,
          payment_intent_id: paymentIntentId,
          items: cartItems.map(item => ({ product_id: item.product.id, quantity: item.quantity }))
        })
      });
      if (!orderRes.ok) throw new Error('Failed to place order');
      const savedOrder = await orderRes.json();

      clearCart();
      window.dispatchEvent(new Event('cart-updated'));
      toast({ title: "Order confirmed! 🎉", description: "Your TAJDO order has been placed successfully." });
      navigate('/order-confirmation', { state: { orderId: savedOrder.order_number } });

    } catch (error: any) {
      console.error("Checkout submission error:", error);
      const msg = error?.message || "There was a problem processing your order.";
      const isNetErr = msg.toLowerCase().includes("fetch") || msg.toLowerCase().includes("network error");
      toast({
        title: "Checkout failed",
        description: isNetErr
          ? "Could not connect to the server. Your payment may have gone through—please check your email before trying again."
          : msg,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // ✅ UPDATED: Poll + auto-close the TWINT tab on confirmation
  useEffect(() => {
    let interval: any;
    if (twintOrder) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(
            `${import.meta.env.VITE_API_BASE_URL}/orders/track?order_number=${twintOrder.order_number}&email=${formData.email}`
          );
          if (res.ok) {
            const data = await res.json();
            // if (data.status !== 'pending_payment') {
            //   clearInterval(interval);

            //   // ✅ Close the TWINT tab if it's still open
            //   if (twintTabRef.current && !twintTabRef.current.closed) {
            //     window.focus();
            //     twintTabRef.current.close();
            //     twintTabRef.current = null;
            //   }

            //   navigate('/order-confirmation', { state: { orderId: data.order_number } });
            // }

          //   if (data.status !== 'pending_payment') {
          //   clearInterval(interval);

          //   // ✅ Navigate first, then close the tab after a short delay
          //   navigate('/order-confirmation', { state: { orderId: data.order_number } });

          //   setTimeout(() => {
          //     if (twintTabRef.current && !twintTabRef.current.closed) {
          //       twintTabRef.current.close();
          //       twintTabRef.current = null;
          //     }
          //   }, 300);
          // }

          if (data.status !== 'pending_payment') {
  clearInterval(interval);
  navigate('/order-confirmation', { state: { orderId: data.order_number } });
}

          }
        } catch (e) {
          console.error("Polling for payment status failed", e);
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [twintOrder, formData.email, navigate]);

  // ── TWINT STEP 2 VIEW ──────────────────────────────────────────────────────
  // if (twintOrder) {
  //   const twintUrl = `https://go.twint.ch/1/e/tw?tw=acq.CEeb5AsGTJC-XG4DVUh3ZbQUFwvQJblSBrQaeQCLPTswCKQm7PSbLYeECDSAU3Id&amount=${twintOrder.total.toFixed(2)}&trxInfo=Order%20${twintOrder.order_number}`;

  //   return (
  //     <div className="pt-24 md:pt-32 pb-24 container mx-auto text-center max-w-lg">
  //       <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
  //         <h1 className="text-3xl font-display text-foreground">Order Placed!</h1>
  //         <p className="text-muted-foreground">
  //           Your order <strong>{twintOrder.order_number}</strong> has been created.
  //           <br />
  //           Please pay <strong>CHF {twintOrder.total.toFixed(2)}</strong> using the button below.
  //         </p>

  //         <div className="flex justify-center mb-4">
  //           <button
  //             onClick={() => {
  //               // ✅ Open TWINT in new tab and store the reference
  //               twintTabRef.current = window.open(twintUrl, '_blank');
  //             }}
  //             className="flex items-center justify-center cursor-pointer bg-transparent border-none p-0 transition-opacity hover:opacity-90"
  //             title="Pay with TWINT"
  //           >
  //             <div className="relative">
  //               <img
  //                 style={{ height: '58px', width: '220px' }}
  //                 alt="Pay with TWINT"
  //                 src="https://go.twint.ch/static/img/button_dark_en.svg"
  //                 onError={(e) => {
  //                   e.currentTarget.style.display = 'none';
  //                   e.currentTarget.parentElement!.innerHTML = '<div class="bg-[#000] text-white px-8 py-4 rounded-md font-bold">PAY WITH TWINT</div>';
  //                 }}
  //               />
  //             </div>
  //           </button>
  //         </div>

  //         <p className="text-xs text-muted-foreground">
  //           Complete your payment in the TWINT tab. This page will update automatically and the payment tab will close once confirmed.
  //         </p>
  //       </motion.div>
  //     </div>
  //   );
  // }

// ── TWINT STEP 2 VIEW ──────────────────────────────────────────────────────
if (twintOrder) {
  const twintUrl = `https://go.twint.ch/1/e/tw?tw=acq.CEeb5AsGTJC-XG4DVUh3ZbQUFwvQJblSBrQaeQCLPTswCKQm7PSbLYeECDSAU3Id&amount=${twintOrder.total.toFixed(2)}&trxInfo=Order%20${twintOrder.order_number}`;
  const [showIframe, setShowIframe] = useState(false);

  return (
    <div className="pt-24 md:pt-32 pb-24 container mx-auto text-center max-w-lg">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <h1 className="text-3xl font-display text-foreground">Order Placed!</h1>
        <p className="text-muted-foreground">
          Your order <strong>{twintOrder.order_number}</strong> has been created.
          <br />
          Please pay <strong>CHF {twintOrder.total.toFixed(2)}</strong> using the button below.
        </p>

        <div className="flex justify-center mb-4">
          <button
            onClick={() => setShowIframe(true)}
            className="flex items-center justify-center cursor-pointer bg-transparent border-none p-0 transition-opacity hover:opacity-90"
            title="Pay with TWINT"
          >
            <img
              style={{ height: '58px', width: '220px' }}
              alt="Pay with TWINT"
              src="https://go.twint.ch/static/img/button_dark_en.svg"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = '<div class="bg-[#000] text-white px-8 py-4 rounded-md font-bold">PAY WITH TWINT</div>';
              }}
            />
          </button>
        </div>

        <p className="text-xs text-muted-foreground">
          Complete your payment in the TWINT window. This page will update automatically once confirmed.
        </p>
      </motion.div>

      {/* TWINT iframe modal */}
      {showIframe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="relative bg-white w-full max-w-lg h-[600px] rounded-lg overflow-hidden shadow-2xl">
            <button
              onClick={() => setShowIframe(false)}
              className="absolute top-3 right-3 z-10 text-gray-500 hover:text-gray-800 text-xl font-bold"
            >
              ✕
            </button>
            <iframe
              src={twintUrl}
              className="w-full h-full border-none"
              title="TWINT Payment"
            />
          </div>
        </div>
      )}
    </div>
  );
}

  // ── MAIN CHECKOUT FORM ─────────────────────────────────────────────────────
  return (
    <div className="pt-24 md:pt-32 pb-24">
      <div className="container mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 text-xs tracking-luxury uppercase text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Bag
          </Link>
          <h1 className="text-4xl font-display text-foreground">Checkout</h1>
        </motion.div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Left: Form */}
            <div className="lg:col-span-3 space-y-10">

              {/* Shipping Information */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
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

              {/* Payment Method */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <h2 className="text-xs tracking-luxury uppercase font-medium text-foreground mb-6">
                  Payment Method
                </h2>

                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                  <label className="flex items-center gap-4 p-4 border border-border cursor-pointer hover:border-foreground transition-colors [&:has(:checked)]:border-foreground">
                    <RadioGroupItem value="card" id="card" />
                    <div className="flex-1">
                      <p className="font-medium text-foreground text-sm">Credit / Debit Card</p>
                      <p className="text-xs text-muted-foreground">Visa, Mastercard, Amex</p>
                    </div>
                    <div className="flex gap-1">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">VISA</span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">MC</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-4 p-4 border border-border cursor-pointer hover:border-foreground transition-colors [&:has(:checked)]:border-foreground">
                    <RadioGroupItem value="twint" id="twint" />
                    <div className="flex-1">
                      <p className="font-medium text-foreground text-sm">Twint</p>
                      <p className="text-xs text-muted-foreground">Swiss mobile payment</p>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold">TWINT</span>
                  </label>
                </RadioGroup>

                {paymentMethod === 'card' && (
                  <div className="mt-6 space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Card Number</Label>
                      <div className="border border-border p-4 rounded-none focus-within:border-foreground transition-colors bg-white">
                        <CardNumberElement
                          options={{
                            style: {
                              base: { fontSize: '14px', color: '#1a1a1a', fontFamily: 'Inter, sans-serif', '::placeholder': { color: '#9ca3af' } },
                              invalid: { color: '#ef4444' }
                            },
                            showIcon: true,
                          }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Expiry Date</Label>
                        <div className="border border-border p-4 rounded-none focus-within:border-foreground transition-colors bg-white">
                          <CardExpiryElement
                            options={{
                              style: {
                                base: { fontSize: '14px', color: '#1a1a1a', fontFamily: 'Inter, sans-serif', '::placeholder': { color: '#9ca3af' } },
                                invalid: { color: '#ef4444' }
                              }
                            }}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">CVC</Label>
                        <div className="border border-border p-4 rounded-none focus-within:border-foreground transition-colors bg-white">
                          <CardCvcElement
                            options={{
                              style: {
                                base: { fontSize: '14px', color: '#1a1a1a', fontFamily: 'Inter, sans-serif', '::placeholder': { color: '#9ca3af' } },
                                invalid: { color: '#ef4444' }
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">🔒 Your card details are encrypted and secure</p>
                  </div>
                )}

                {paymentMethod === 'twint' && (
                  <div className="mt-6 bg-blue-50 border border-blue-100 p-4">
                    <p className="text-sm text-blue-800 font-medium mb-1">How Twint works:</p>
                    <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                      <li>Click "Place Order" below</li>
                      <li>A new tab will open with the Twint payment page</li>
                      <li>Confirm payment in your Twint app</li>
                      <li>The payment tab will close automatically and you'll be redirected here</li>
                    </ol>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Right: Order Summary */}
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
                        <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-display text-foreground line-clamp-1">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
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
                </div>

                <div className="border-t border-border pt-6 mb-8">
                  <div className="flex justify-between">
                    <span className="text-foreground">Total</span>
                    <span className="text-lg font-medium text-foreground">CHF {total.toFixed(0)}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-none h-12 text-xs tracking-luxury uppercase"
                  disabled={isProcessing || !stripe}
                >
                  {isProcessing ? <>Processing...</> : <><Lock className="w-4 h-4 mr-2" />Place Order</>}
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

const Checkout = () => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
};

export default Checkout;



// import { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import { ArrowLeft, Lock } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
// import { getCart, getCartTotal, clearCart, CartItem } from '@/lib/store';
// import { useToast } from '@/hooks/use-toast';
// import { getCurrentUser, customerFetch } from '@/lib/auth';

// // ✅ ADD: Stripe imports
// import {
//   CardNumberElement,
//   CardExpiryElement,
//   CardCvcElement,
//   useStripe,
//   useElements,
//   Elements
// } from '@stripe/react-stripe-js';
// import { stripePromise } from '@/utils/stripe';

// // ============================================
// // Inner component (needs to be inside Elements)
// // ============================================
// const CheckoutForm = () => {
//   const [cartItems, setCartItems] = useState<CartItem[]>([]);
//   const [paymentMethod, setPaymentMethod] = useState('card');
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [formData, setFormData] = useState({
//     firstName: '',
//     lastName: '',
//     email: '',
//     phone: '',
//     address: '',
//     city: '',
//     zip: '',
//   });
//   // State for Twint Step 2
//   const [twintOrder, setTwintOrder] = useState<{ order_number: string, total: number } | null>(null);

//   // ✅ ADD: Stripe hooks
//   const stripe = useStripe();
//   const elements = useElements();

//   const navigate = useNavigate();
//   const { toast } = useToast();

//   useEffect(() => {
//     const loadUser = async () => {
//       try {
//         const user = await getCurrentUser();
//         setFormData(prev => ({
//           ...prev,
//           firstName: user.full_name?.split(' ')[0] || '',
//           lastName: user.full_name?.split(' ').slice(1).join(' ') || '',
//           email: user.email || '',
//           phone: user.phone || '',
//         }));
//       } catch (e) {
//         console.error("Failed to load user data", e);
//       }
//     };
//     loadUser();

//     const items = getCart();
//     if (items.length === 0) {
//       navigate('/cart');
//     }
//     setCartItems(items);
//   }, [navigate]);

//   const subtotal = getCartTotal();
//   // const shipping = subtotal > 150 ? 0 : 15;
//   // const total = subtotal + shipping;
//   const total = subtotal; // Free shipping for simplicity

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { id, value } = e.target;
//     setFormData(prev => ({ ...prev, [id]: value }));
//   };

//   // ============================================
//   // ✅ UPDATED: handleSubmit with Stripe payment
//   // ============================================
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     // If this is the "I have completed payment" button action (handled via link, but safety check)
//     if (twintOrder) {
//       navigate(`/order-confirmation?order_number=${twintOrder.order_number}`);
//       return;
//     }

//     // Guard: Stripe must be loaded
//     if (!stripe || !elements) {
//       toast({
//         title: "Payment not ready",
//         description: "Please wait a moment and try again.",
//         variant: "destructive"
//       });
//       return;
//     }

//     setIsProcessing(true);

//     // ✅ SAVE: Store order data for redirect recovery (e.g., 3D Secure or Page Refresh)
//     const pendingOrderData = {
//       address: { line1: formData.address, city: formData.city, postal_code: formData.zip, country: 'CH' },
//       items: cartItems.map(item => ({ product_id: item.product.id, quantity: item.quantity })),
//       paymentMethod: paymentMethod,
//       email: formData.email // Needed for polling on return
//     };
//     sessionStorage.setItem('pending_order_data', JSON.stringify(pendingOrderData));

//     try {
//       const user = await getCurrentUser();

//       // ============================================
//       // TWINT FLOW (Two-Step: Order First, Pay Second)
//       // ============================================
//       if (paymentMethod === 'twint') {
//         // 1. Create Address
//         const addressRes = await customerFetch('/addresses/', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({
//             user_id: user.id,
//             line1: formData.address,
//             city: formData.city,
//             postal_code: formData.zip,
//             country: 'CH',
//             is_default: true
//           })
//         });

//         if (!addressRes.ok) throw new Error('Failed to save address');
//         const savedAddress = await addressRes.json();

//         // 2. Create Order (Status: Processing/Pending)
//         // We use a placeholder ID since payment happens externally
//         const orderRes = await customerFetch('/orders/', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({
//             user_id: user.id,
//             shipping_address_id: savedAddress.id,
//             payment_method: 'twint',
//             payment_intent_id: `TWINT_PENDING_${Date.now()}`, 
//             items: cartItems.map(item => ({
//               product_id: item.product.id,
//               quantity: item.quantity
//             }))
//           })
//         });

//         if (!orderRes.ok) throw new Error('Failed to place order');
//         const savedOrder = await orderRes.json();

//         // 3. Clear Cart and Show Payment Step
//         clearCart();
//         setTwintOrder({ order_number: savedOrder.order_number, total: Number(savedOrder.total) });
//         setIsProcessing(false);
//         return;
//       }

//       // ============================================
//       // STEP 1: Create Payment Intent on backend
//       // (Like M-Pesa STK Push initiation)
//       // ============================================
//       const intentRes = await customerFetch('/payments/create-intent', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           amount: total,
//           payment_method: paymentMethod  // "card" or "twint"
//         })
//       });

//       if (!intentRes.ok) throw new Error('Failed to create payment intent');
//       const { client_secret } = await intentRes.json();

//       // ============================================
//       // CARD FLOW (Immediate)
//       // ============================================
//       const paymentResult = await stripe.confirmCardPayment(client_secret, {
//           payment_method: {
//             card: elements.getElement(CardNumberElement)!,
//             billing_details: {
//               name: `${formData.firstName} ${formData.lastName}`,
//               email: formData.email,
//               phone: formData.phone,
//               address: {
//                 line1: formData.address,
//                 city: formData.city,
//                 postal_code: formData.zip,
//                 country: 'CH'
//               }
//             }
//           },
//           return_url: `${window.location.origin}/order-confirmation`
//         });

//       // ============================================
//       // STEP 3: Check Payment Result
//       // (Like checking M-Pesa callback ResultCode)
//       // ============================================
//       if (paymentResult.error) {
//         // Payment failed (like M-Pesa ResultCode: 1032)
//         throw new Error(paymentResult.error.message);
//       }

//       if (paymentResult.paymentIntent?.status !== 'succeeded') {
//         throw new Error('Payment was not completed');
//       }

//       // Payment succeeded! (like M-Pesa ResultCode: 0)
//       const paymentIntentId = paymentResult.paymentIntent.id;

//       // ============================================
//       // STEP 4: Create Address (same as before)
//       // ============================================
//       const addressRes = await customerFetch('/addresses/', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           user_id: user.id,
//           line1: formData.address,
//           city: formData.city,
//           postal_code: formData.zip,
//           country: 'CH',
//           is_default: true
//         })
//       });

//       if (!addressRes.ok) throw new Error('Failed to save address');
//       const savedAddress = await addressRes.json();

//       // ============================================
//       // STEP 5: Create Order (with payment proof)
//       // ============================================
//       const orderRes = await customerFetch('/orders/', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           user_id: user.id,
//           shipping_address_id: savedAddress.id,
//           payment_method: paymentMethod,
//           payment_intent_id: paymentIntentId, // ✅ Proof of payment
//           items: cartItems.map(item => ({
//             product_id: item.product.id,
//             quantity: item.quantity
//           }))
//         })
//       });

//       if (!orderRes.ok) throw new Error('Failed to place order');
//       const savedOrder = await orderRes.json();

//       // ============================================
//       // STEP 6: Success
//       // ============================================
//       clearCart();
//       window.dispatchEvent(new Event('cart-updated'));
//       toast({
//         title: "Order confirmed! 🎉",
//         description: "Your TAJDO order has been placed successfully.",
//       });
//       navigate('/order-confirmation', {
//         state: { orderId: savedOrder.order_number }
//       });

//     } catch (error: any) {
//       console.error("Checkout submission error:", error);
      
//       const msg = error?.message || "There was a problem processing your order.";
//       const isNetErr = msg.toLowerCase().includes("fetch") || msg.toLowerCase().includes("network error");
      
//       toast({
//         title: "Checkout failed",
//         description: isNetErr
//           ? "Could not connect to the server. Your payment may have gone through—please check your email before trying again."
//           : msg,
//         variant: "destructive"
//       });
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   // ✅ Poll for payment confirmation for Twint
//   useEffect(() => {
//     let interval: any;
//     if (twintOrder) {
//       interval = setInterval(async () => {
//         try {
//           const res = await fetch(
//             `${import.meta.env.VITE_API_BASE_URL}/orders/track?order_number=${twintOrder.order_number}&email=${formData.email}`
//           );
//           if (res.ok) {
//             const data = await res.json();
//             // Once the background listener updates the status, redirect
//             if (data.status !== 'pending_payment') {
//               clearInterval(interval);
//               navigate('/order-confirmation', { state: { orderId: data.order_number } });
//             }
//           }
//         } catch (e) {
//           console.error("Polling for payment status failed", e);
//         }
//       }, 5000); // Check every 5 seconds
//     }
//     return () => clearInterval(interval);
//   }, [twintOrder, formData.email, navigate]);

//   // ============================================
//   // STEP 2 VIEW: Pay with Twint
//   // ============================================
//   if (twintOrder) {
//     // const twintUrl = `https://go.twint.ch/1/e/tw?tw=acq.m6hRmNXzRFif8Usa0nkjxP68X0niErIPXSrcY1XoYUkayz9rr87yHxiIxAxS-6C2&amount=${twintOrder.total.toFixed(2)}&trxInfo=${twintOrder.order_number}`;
//     const twintUrl = `https://go.twint.ch/1/e/tw?tw=acq.CEeb5AsGTJC-XG4DVUh3ZbQUFwvQJblSBrQaeQCLPTswCKQm7PSbLYeECDSAU3Id&amount=${twintOrder.total.toFixed(2)}&trxInfo=Order%20${twintOrder.order_number}`;

//     return (
//       <div className="pt-24 md:pt-32 pb-24 container mx-auto text-center max-w-lg">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="space-y-8"
//         >
//           <h1 className="text-3xl font-display text-foreground">Order Placed!</h1>
//           <p className="text-muted-foreground">
//             Your order <strong>{twintOrder.order_number}</strong> has been created.
//             <br />
//             Please pay <strong>CHF {twintOrder.total.toFixed(2)}</strong> using the button below.
//           </p>
//           <div className="flex justify-center mb-4">
//             <button
//               onClick={() => window.open(twintUrl, '_blank')}
//               className="flex items-center justify-center cursor-pointer bg-transparent border-none p-0 transition-opacity hover:opacity-90"
//               title="Pay with TWINT"
//             >
//               <div className="relative">
//                 <img 
//                   style={{ height: '58px', width: '220px' }} 
//                   alt="Pay with TWINT" 
//                   src="https://go.twint.ch/static/img/button_dark_en.svg"
//                   onError={(e) => {
//                     // Fallback if image fails to load (AdBlockers)
//                     e.currentTarget.style.display = 'none';
//                     e.currentTarget.parentElement!.innerHTML = '<div class="bg-[#000] text-white px-8 py-4 rounded-md font-bold">PAY WITH TWINT</div>';
//                   }}
//                 />
//               </div>
//             </button>
//           </div>

//           <p className="text-xs text-muted-foreground">
//             Use the button above to pay. This page will update automatically once your payment is confirmed.
//           </p>
//         </motion.div>
//       </div>
//     );
//   }

//   return (
//     <div className="pt-24 md:pt-32 pb-24">
//       <div className="container mx-auto">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="mb-10"
//         >
//           <Link
//             to="/cart"
//             className="inline-flex items-center gap-2 text-xs tracking-luxury uppercase text-muted-foreground hover:text-foreground transition-colors mb-6"
//           >
//             <ArrowLeft className="w-4 h-4" />
//             Back to Bag
//           </Link>
//           <h1 className="text-4xl font-display text-foreground">
//             Checkout
//           </h1>
//         </motion.div>

//         <form onSubmit={handleSubmit}>
//           <div className="grid lg:grid-cols-5 gap-12">
//             {/* Left: Form */}
//             <div className="lg:col-span-3 space-y-10">

//               {/* Shipping Information - UNCHANGED */}
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//               >
//                 <h2 className="text-xs tracking-luxury uppercase font-medium text-foreground mb-6">
//                   Shipping Information
//                 </h2>
//                 <div className="grid sm:grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="firstName" className="text-xs text-muted-foreground">First Name</Label>
//                     <Input id="firstName" className="rounded-none" required value={formData.firstName} onChange={handleInputChange} />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="lastName" className="text-xs text-muted-foreground">Last Name</Label>
//                     <Input id="lastName" className="rounded-none" required value={formData.lastName} onChange={handleInputChange} />
//                   </div>
//                   <div className="space-y-2 sm:col-span-2">
//                     <Label htmlFor="email" className="text-xs text-muted-foreground">Email</Label>
//                     <Input id="email" type="email" className="rounded-none" required value={formData.email} onChange={handleInputChange} />
//                   </div>
//                   <div className="space-y-2 sm:col-span-2">
//                     <Label htmlFor="phone" className="text-xs text-muted-foreground">Phone</Label>
//                     <Input id="phone" type="tel" className="rounded-none" required value={formData.phone} onChange={handleInputChange} />
//                   </div>
//                   <div className="space-y-2 sm:col-span-2">
//                     <Label htmlFor="address" className="text-xs text-muted-foreground">Address</Label>
//                     <Input id="address" className="rounded-none" required value={formData.address} onChange={handleInputChange} />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="city" className="text-xs text-muted-foreground">City</Label>
//                     <Input id="city" className="rounded-none" required value={formData.city} onChange={handleInputChange} />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="zip" className="text-xs text-muted-foreground">Postal Code</Label>
//                     <Input id="zip" className="rounded-none" required value={formData.zip} onChange={handleInputChange} />
//                   </div>
//                 </div>
//               </motion.div>

//               {/* ✅ UPDATED: Payment Method Section */}
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.1 }}
//               >
//                 <h2 className="text-xs tracking-luxury uppercase font-medium text-foreground mb-6">
//                   Payment Method
//                 </h2>

//                 {/* ✅ Only Card and Twint */}
//                 <RadioGroup
//                   value={paymentMethod}
//                   onValueChange={setPaymentMethod}
//                   className="space-y-3"
//                 >
//                   {/* Card Option */}
//                   <label className="flex items-center gap-4 p-4 border border-border cursor-pointer hover:border-foreground transition-colors [&:has(:checked)]:border-foreground">
//                     <RadioGroupItem value="card" id="card" />
//                     <div className="flex-1">
//                       <p className="font-medium text-foreground text-sm">
//                         Credit / Debit Card
//                       </p>
//                       <p className="text-xs text-muted-foreground">
//                         Visa, Mastercard, Amex
//                       </p>
//                     </div>
//                     {/* Card logos */}
//                     <div className="flex gap-1">
//                       <span className="text-xs bg-gray-100 px-2 py-1 rounded">VISA</span>
//                       <span className="text-xs bg-gray-100 px-2 py-1 rounded">MC</span>
//                     </div>
//                   </label>

//                   {/* Twint Option */}
//                   <label className="flex items-center gap-4 p-4 border border-border cursor-pointer hover:border-foreground transition-colors [&:has(:checked)]:border-foreground">
//                     <RadioGroupItem value="twint" id="twint" />
//                     <div className="flex-1">
//                       <p className="font-medium text-foreground text-sm">
//                         Twint
//                       </p>
//                       <p className="text-xs text-muted-foreground">
//                         Swiss mobile payment
//                       </p>
//                     </div>
//                     <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold">
//                       TWINT
//                     </span>
//                   </label>
//                 </RadioGroup>

//                 {/* ✅ Separate Stripe Elements for a better filling experience */}
//                 {paymentMethod === 'card' && (
//                   <div className="mt-6 space-y-4">
//                     <div className="space-y-2">
//                       <Label className="text-xs text-muted-foreground">Card Number</Label>
//                       <div className="border border-border p-4 rounded-none focus-within:border-foreground transition-colors bg-white">
//                         <CardNumberElement
//                           options={{
//                             style: {
//                               base: { fontSize: '14px', color: '#1a1a1a', fontFamily: 'Inter, sans-serif', '::placeholder': { color: '#9ca3af' } },
//                               invalid: { color: '#ef4444' }
//                             },
//                             showIcon: true,
//                           }}
//                         />
//                       </div>
//                     </div>

//                     <div className="grid grid-cols-2 gap-4">
//                       <div className="space-y-2">
//                         <Label className="text-xs text-muted-foreground">Expiry Date</Label>
//                         <div className="border border-border p-4 rounded-none focus-within:border-foreground transition-colors bg-white">
//                           <CardExpiryElement
//                             options={{
//                               style: {
//                                 base: { fontSize: '14px', color: '#1a1a1a', fontFamily: 'Inter, sans-serif', '::placeholder': { color: '#9ca3af' } },
//                                 invalid: { color: '#ef4444' }
//                               }
//                             }}
//                           />
//                         </div>
//                       </div>

//                       <div className="space-y-2">
//                         <Label className="text-xs text-muted-foreground">CVC</Label>
//                         <div className="border border-border p-4 rounded-none focus-within:border-foreground transition-colors bg-white">
//                           <CardCvcElement
//                             options={{
//                               style: {
//                                 base: { fontSize: '14px', color: '#1a1a1a', fontFamily: 'Inter, sans-serif', '::placeholder': { color: '#9ca3af' } },
//                                 invalid: { color: '#ef4444' }
//                               }
//                             }}
//                           />
//                         </div>
//                       </div>
//                     </div>
//                     <p className="text-xs text-muted-foreground mt-2">
//                       🔒 Your card details are encrypted and secure
//                     </p>
//                   </div>
//                 )}

//                 {/* Twint Info */}
//                 {paymentMethod === 'twint' && (
//                   <div className="mt-6 bg-blue-50 border border-blue-100 p-4">
//                     <p className="text-sm text-blue-800 font-medium mb-1">
//                       How Twint works:
//                     </p>
//                     <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
//                       <li>Click "Place Order" below</li>
//                       <li>You will be redirected to the Twint app</li>
//                       <li>Confirm payment in your Twint app</li>
//                       <li>You'll be returned here automatically</li>
//                     </ol>
//                   </div>
//                 )}
//               </motion.div>
//             </div>

//             {/* Right: Order Summary - UNCHANGED */}
//             <div className="lg:col-span-2">
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.2 }}
//                 className="sticky top-36"
//               >
//                 <h2 className="text-xs tracking-luxury uppercase font-medium text-foreground mb-6">
//                   Order Summary
//                 </h2>

//                 <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
//                   {cartItems.map((item) => (
//                     <div key={item.product.id} className="flex gap-4">
//                       <div className="w-16 h-20 overflow-hidden bg-secondary flex-shrink-0">
//                         <img
//                           src={item.product.image_url}
//                           alt={item.product.name}
//                           className="w-full h-full object-cover"
//                         />
//                       </div>
//                       <div className="flex-1 min-w-0">
//                         <p className="text-sm font-display text-foreground line-clamp-1">
//                           {item.product.name}
//                         </p>
//                         <p className="text-xs text-muted-foreground">
//                           Qty: {item.quantity}
//                         </p>
//                       </div>
//                       <p className="text-sm font-medium text-foreground">
//                         CHF {(item.product.price * item.quantity).toFixed(0)}
//                       </p>
//                     </div>
//                   ))}
//                 </div>

//                 <div className="space-y-4 border-t border-border pt-6 mb-6">
//                   <div className="flex justify-between text-sm">
//                     <span className="text-muted-foreground">Subtotal</span>
//                     <span className="font-medium">CHF {subtotal.toFixed(0)}</span>
//                   </div>
//                   <div className="flex justify-between text-sm">
//                     {/* <span className="text-muted-foreground">Shipping</span> */}
//                     {/* <span className="font-medium">
//                       {shipping === 0 ? 'Complimentary' : `CHF ${shipping.toFixed(0)}`}
//                     </span> */}
//                   </div>
//                 </div>

//                 <div className="border-t border-border pt-6 mb-8">
//                   <div className="flex justify-between">
//                     <span className="text-foreground">Total</span>
//                     <span className="text-lg font-medium text-foreground">
//                       CHF {total.toFixed(0)}
//                     </span>
//                   </div>
//                 </div>

//                 <Button
//                   type="submit"
//                   className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-none h-12 text-xs tracking-luxury uppercase"
//                   disabled={isProcessing || !stripe}
//                 >
//                   {isProcessing ? (
//                     <>Processing...</>
//                   ) : (
//                     <>
//                       <Lock className="w-4 h-4 mr-2" />
//                       Place Order
//                     </>
//                   )}
//                 </Button>

//                 <p className="text-xs text-center text-muted-foreground mt-6">
//                   🔒 Secured by Stripe • PCI DSS Compliant
//                 </p>
//               </motion.div>
//             </div>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// // ============================================
// // ✅ Wrapper: Provides Stripe context
// // Like wrapping M-Pesa components with provider
// // ============================================
// const Checkout = () => {
//   return (
//     <Elements stripe={stripePromise}>
//       <CheckoutForm />
//     </Elements>
//   );
// };

// export default Checkout;
