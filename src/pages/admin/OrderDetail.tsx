import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { adminFetch } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

interface OrderData {
  id: string | number;
  customer_name?: string;
  customer_email?: string;
  status: string;
  total?: number;
  tracking_number?: string;
  shipping_address?: string;
  items?: { product_name: string; quantity: number; price: number }[];
  created_at?: string;
}

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminFetch(`/orders/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setOrder(data);
        setStatus(data.status || '');
        setTrackingNumber(data.tracking_number || '');
      })
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminFetch(`/orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, tracking_number: trackingNumber }),
      });
      toast({ title: 'Order updated' });
    } catch {
      toast({ title: 'Update failed', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-slate-500 py-12 text-center">Loading order...</p>;
  }

  if (!order) {
    return <p className="text-sm text-slate-500 py-12 text-center">Order not found</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/orders')} className="text-slate-500">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Order #{order.id}</h1>
          <p className="text-sm text-slate-500">
            {order.created_at ? new Date(order.created_at).toLocaleString() : ''}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Customer & Items */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-base">Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-slate-900">{order.customer_name || 'N/A'}</p>
              <p className="text-sm text-slate-500">{order.customer_email || ''}</p>
              {order.shipping_address && (
                <p className="text-sm text-slate-500">{order.shipping_address}</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-base">Items</CardTitle>
            </CardHeader>
            <CardContent>
              {order.items && order.items.length > 0 ? (
                <div className="space-y-3">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-slate-900">
                        {item.product_name} <span className="text-slate-400">× {item.quantity}</span>
                      </span>
                      <span className="font-medium">${item.price}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No item details available</p>
              )}
              {order.total != null && (
                <div className="flex justify-between text-sm font-semibold mt-4 pt-4 border-t border-slate-200">
                  <span>Total</span>
                  <span>${order.total}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Update Status */}
        <div>
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-base">Update Order</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm text-slate-700">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-slate-700">Tracking Number</Label>
                <Input
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number"
                  className="rounded-lg"
                />
              </div>

              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
