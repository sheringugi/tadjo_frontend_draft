import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Package, Truck, Home, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStripe, Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/utils/stripe';
import { customerFetch, getCurrentUser } from '@/lib/auth';
import { clearCart } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';

const steps = [
  { icon: CheckCircle2, label: 'Order Placed', status: 'complete' },
  { icon: Package, label: 'Processing', status: 'current' },
  { icon: Truck, label: 'Shipped', status: 'upcoming' },
  { icon: Home, label: 'Delivered', status: 'upcoming' },
];

const OrderConfirmationContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const stripe = useStripe();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState<string | null>(null);

  useEffect(() => {
    let interval: any;

    const handleOrderProcessing = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const clientSecret = urlParams.get('payment_intent_client_secret');
      const paymentIntentId = urlParams.get('payment_intent');
      const urlOrderNumber = urlParams.get('order_number');

      // Case 1: Returning from Stripe/Redirect (3D Secure)
      if (clientSecret && stripe) {
        try {
          const { paymentIntent, error } = await stripe.retrievePaymentIntent(clientSecret);
          
          if (error) throw new Error(error.message);
          if (paymentIntent.status !== 'succeeded') throw new Error('Payment not completed');

          // Retrieve saved data
          const orderDataStr = sessionStorage.getItem('pending_order_data');
          if (!orderDataStr) throw new Error('Order data missing');
          
          const { address, items, paymentMethod } = JSON.parse(orderDataStr);
          const user = await getCurrentUser();

          // Create Address
          const addressRes = await customerFetch('/addresses/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(address)
          });
          if (!addressRes.ok) throw new Error('Failed to save address');
          const savedAddress = await addressRes.json();

          // Create Order
          const orderRes = await customerFetch('/orders/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: user.id,
              shipping_address_id: savedAddress.id,
              payment_method: paymentMethod || 'card',
              payment_intent_id: paymentIntentId,
              items
            })
          });
          if (!orderRes.ok) throw new Error('Failed to create order');
          const savedOrder = await orderRes.json();

          // Cleanup
          clearCart();
          sessionStorage.removeItem('pending_order_data');
          setOrderNumber(savedOrder.order_number);
          toast({ title: "Order confirmed!", description: "Twint payment successful." });

        } catch (err: any) {
          console.error(err);
          toast({ title: "Error", description: err.message, variant: "destructive" });
          navigate('/cart');
          return;
        }
      } 
      // Case 2: Direct navigation (Card payment success) OR Manual Twint Link
      else if (location.state?.orderId) {
        setOrderNumber(location.state.orderId);
        setOrderStatus('processing');
        setIsProcessing(false);
      } 
      // Case 3: URL Parameter (Twint Manual Return)
      else if (urlOrderNumber) {
        try {
          // Verify order exists in the database for this user
          const user = await getCurrentUser();
          const res = await customerFetch(`/users/${user.id}/orders/`);
          if (!res.ok) throw new Error('Could not verify order');
          
          const orders = await res.json();
          const foundOrder = orders.find((o: any) => o.order_number === urlOrderNumber);
          
          if (!foundOrder) throw new Error('Order not found');
          setOrderNumber(urlOrderNumber);
          
          if (foundOrder.status === 'pending_payment') {
            setOrderStatus('pending_payment');
            // Keep isProcessing true and poll faster
            interval = setInterval(async () => {
              const pollRes = await customerFetch(`/users/${user.id}/orders/`);
              if (pollRes.ok) {
                const pollData = await pollRes.json();
                const updatedOrder = pollData.find((o: any) => o.order_number === urlOrderNumber);
                if (updatedOrder && updatedOrder.status !== 'pending_payment') {
                  setOrderStatus(updatedOrder.status);
                  setIsProcessing(false);
                  clearInterval(interval);
                }
              }
            }, 5000);
            return;
          } else {
            setOrderStatus(foundOrder.status);
          }
        } catch (e) {
          console.error("Order verification failed", e);
          navigate('/'); // Redirect to home if invalid
          return;
        }
        setIsProcessing(false);
        return;
      }
      // Case 3: Invalid access (wait for stripe if clientSecret exists)
      else if (!clientSecret) {
        navigate('/');
        return;
      }

      if (clientSecret && !stripe) return; // Wait for stripe to load

      setIsProcessing(false);
    };

    handleOrderProcessing();

    return () => { if (interval) clearInterval(interval); };
  }, [stripe, location, navigate, toast]);

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <h1 className="text-2xl font-display text-foreground">
            {orderStatus === 'pending_payment' ? 'Awaiting Payment Confirmation' : 'Finalizing your order...'}
          </h1>
          <p className="text-muted-foreground max-w-xs mx-auto">
            {orderStatus === 'pending_payment' 
              ? 'We are waiting for the payment system to confirm your transaction. This will update automatically.' 
              : 'Please wait a moment while we verify your order details.'}
          </p>
        </div>
      </div>
    );
  }

  // If we reach here and status is still pending, something is wrong or we are still polling
  if (!orderNumber || orderStatus === 'pending_payment') return null;

  return (
    <div className="pt-24 md:pt-32 pb-16">
        <div className="container mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center mb-10"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-success/10 flex items-center justify-center"
            >
              <CheckCircle2 className="w-10 h-10 text-success" />
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Thank You for Your Order!
            </h1>
            <p className="text-muted-foreground">
              Your order has been placed successfully
            </p>
          </motion.div>

          {/* Order Number */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-xl p-6 shadow-card mb-8 text-center"
          >
            <p className="text-sm text-muted-foreground mb-1">Order Number</p>
            <p className="text-2xl font-bold text-primary">{orderNumber}</p>
          </motion.div>

          {/* Order Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card rounded-xl p-6 shadow-card mb-8"
          >
            <h2 className="text-lg font-semibold text-foreground mb-6 text-center">
              Order Status
            </h2>
            <div className="flex justify-between items-center">
              {steps.map((step, index) => (
                <div key={step.label} className="flex flex-col items-center relative">
                  {index > 0 && (
                    <div
                      className={`absolute top-5 -left-1/2 w-full h-0.5 ${
                        step.status === 'upcoming' ? 'bg-border' : 'bg-primary'
                      }`}
                      style={{ transform: 'translateX(-50%)' }}
                    />
                  )}
                  <div
                    className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center ${
                      step.status === 'complete'
                        ? 'bg-primary text-primary-foreground'
                        : step.status === 'current'
                        ? 'bg-primary/20 text-primary animate-pulse-soft'
                        : 'bg-secondary text-muted-foreground'
                    }`}
                  >
                    <step.icon className="w-5 h-5" />
                  </div>
                  <p
                    className={`text-xs mt-2 text-center ${
                      step.status === 'upcoming' ? 'text-muted-foreground' : 'text-foreground font-medium'
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Estimated Delivery */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-success/10 rounded-xl p-6 mb-8 text-center"
          >
            <Truck className="w-8 h-8 text-success mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-1">
              Estimated Delivery
            </h3>
            <p className="text-success font-bold text-lg">
              {new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/products">
              <Button className="gradient-cta text-accent-foreground w-full sm:w-auto">
                Continue Shopping
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" className="w-full sm:w-auto">
                Back to Home
              </Button>
            </Link>
          </motion.div>
        </div>
    </div>
  );
};

const OrderConfirmation = () => {
  return (
    <Elements stripe={stripePromise}>
      <OrderConfirmationContent />
    </Elements>
  );
};

export default OrderConfirmation;
