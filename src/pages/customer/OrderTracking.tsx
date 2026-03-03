import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Package, Truck, CheckCircle, Clock, XCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const OrderTracking = () => {
  const [searchParams] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const orderNumFromUrl = searchParams.get('order_number');
    const emailFromUrl = searchParams.get('email');
    if (orderNumFromUrl && emailFromUrl) {
      setOrderNumber(orderNumFromUrl);
      setEmail(emailFromUrl);
      handleTrackOrder(null, orderNumFromUrl, emailFromUrl);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleTrackOrder = async (e: React.FormEvent | null, orderNum?: string, userEmail?: string) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    setOrder(null);

    const numToTrack = orderNum || orderNumber;
    const emailToTrack = userEmail || email;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/orders/track?order_number=${numToTrack}&email=${emailToTrack}`
      );
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Order not found');
      }
      const data = await response.json();
      setOrder(data);
    } catch (err: any) {
      setError(err.message || 'Order not found');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return <Clock className="w-6 h-6 text-yellow-600" />;
      case 'shipped':
        return <Truck className="w-6 h-6 text-blue-600" />;
      case 'delivered':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-6 h-6 text-red-600" />;
      case 'refunded':
        return <RotateCcw className="w-6 h-6 text-orange-600" />;
      default:
        return <Package className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      processing: 'Being Prepared',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      refunded: 'Refunded'
    };
    return statusMap[status] || status;
  };

  return (
    <div className="pt-24 md:pt-32 pb-24">
      <div className="container mx-auto max-w-2xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <h1 className="text-4xl font-display text-foreground mb-4">
            Track Your Order
          </h1>
          <p className="text-muted-foreground">
            Enter your order details to check the status
          </p>
        </motion.div>

        {/* Search Form */}
        {!order && (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleTrackOrder}
            className="bg-secondary p-8"
          >
            <div className="space-y-6">
              <div>
                <Label htmlFor="orderNumber" className="text-sm text-muted-foreground">
                  Order Number
                </Label>
                <Input
                  id="orderNumber"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="e.g., ORD-123456"
                  required
                  className="rounded-none mt-2"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-sm text-muted-foreground">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="rounded-none mt-2"
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-700 p-4 text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-none h-12 text-xs tracking-luxury uppercase"
              >
                {loading ? (
                  <>Searching...</>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Track Order
                  </>
                )}
              </Button>
            </div>
          </motion.form>
        )}

        {/* Order Details */}
        {order && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Order Info */}
            <div className="bg-secondary p-6">
              <h2 className="text-xs tracking-luxury uppercase font-medium mb-4">
                Order Details
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Order Number</p>
                  <p className="font-medium">{order.order_number}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Order Date</p>
                  <p className="font-medium">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="font-medium">CHF {Number(order.total).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Payment</p>
                  <p className="font-medium capitalize">{order.payment_method}</p>
                </div>
              </div>
            </div>

            {/* Status Timeline */}
            <div className="bg-secondary p-6">
              <h2 className="text-xs tracking-luxury uppercase font-medium mb-6">
                Order Status
              </h2>
              
              {['cancelled', 'refunded'].includes(order.status) ? (
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 opacity-100">
                    {getStatusIcon(order.status)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{getStatusText(order.status)}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {order.status === 'cancelled' 
                        ? 'This order has been cancelled.' 
                        : 'This order has been refunded.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {['processing', 'shipped', 'delivered'].map((status, index) => {
                    const isActive = order.status === status;
                    const isPast = ['processing', 'shipped', 'delivered'].indexOf(order.status) > index;
                    
                    return (
                      <div key={status} className="flex items-start gap-4">
                        <div className={`flex-shrink-0 ${isActive || isPast ? 'opacity-100' : 'opacity-30'}`}>{getStatusIcon(status)}</div>
                        <div className="flex-1">
                          <p className={`font-medium ${isActive || isPast ? 'text-foreground' : 'text-muted-foreground'}`}>{getStatusText(status)}</p>
                          {isActive && <p className="text-sm text-muted-foreground mt-1">Current status</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {order.tracking_number && (
                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-2">Tracking Number</p>
                  <p className="font-mono text-sm font-medium">{order.tracking_number}</p>
                </div>
              )}
            </div>

            <Button
              onClick={() => {
                setOrder(null);
                setOrderNumber('');
                setEmail('');
              }}
              variant="outline"
              className="w-full rounded-none"
            >
              Track Another Order
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;