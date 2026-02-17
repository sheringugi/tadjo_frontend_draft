import { Link, useLocation, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Package, Truck, Home, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const steps = [
  { icon: CheckCircle2, label: 'Order Placed', status: 'complete' },
  { icon: Package, label: 'Processing', status: 'current' },
  { icon: Truck, label: 'Shipped', status: 'upcoming' },
  { icon: Home, label: 'Delivered', status: 'upcoming' },
];

const OrderConfirmation = () => {
  const location = useLocation();
  const orderNumber = location.state?.orderId;

  // If there's no order number in the state, the user likely accessed this page directly.
  // Redirect them to the homepage.
  if (!orderNumber) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="pt-20 md:pt-24 pb-16">
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
            <p className="text-sm text-muted-foreground mt-3">
              We've sent a confirmation email to your inbox
            </p>
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

export default OrderConfirmation;
