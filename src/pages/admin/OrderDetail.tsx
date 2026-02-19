import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { adminFetch } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

interface OrderData {
  id: string;
  order_number: string;
  user?: {
    full_name: string;
    email: string;
  };
  status: string;
  tax?: number;
  subtotal?: number;
  total?: number;
  currency?: string;
  tracking_number?: string;
  shipping_address?: { line1: string; city: string; postal_code: string; country: string };
  items?: { product_name: string; quantity: number; unit_price: number}[];
  created_at?: string;
  status_history?: {
    old_status: string;
    new_status: string;
    note: string;
    created_at: string;
  }[];
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchOrder = () => {
    adminFetch(`/orders/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setOrder(data);
        setStatus(data.status || '');
        setTrackingNumber(data.tracking_number || '');
      })
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const params = new URLSearchParams({
        new_status: status,
      });
      if (trackingNumber) {
        params.append('tracking_number', trackingNumber);
      }
      await adminFetch(`/orders/${id}/status?${params.toString()}`, { method: 'PUT' });
      fetchOrder(); // Refresh data
      setIsDialogOpen(false);
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
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-medium text-foreground">Order {order.order_number}</h1>
            <Badge variant="outline" className="capitalize rounded-full px-3 py-1">
              {order.status}
            </Badge>
          </div>
        </div>
        <div className="ml-auto">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-none uppercase tracking-wide text-xs">
                Update Status
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-none border-border">
              <DialogHeader>
                <DialogTitle className="font-display text-xl">Update Order Status</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="rounded-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {status === 'shipped' && (
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Tracking Number</Label>
                    <Input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="Enter tracking number" className="rounded-none" />
                  </div>
                )}

                <Button onClick={handleSave} disabled={saving} className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-none uppercase tracking-wide text-xs h-10">
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Customer & Items */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border rounded-none">
            <CardHeader>
              <CardTitle className="text-base">Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-foreground font-medium">{order.user?.full_name || 'N/A'}</p>
              <p className="text-sm text-muted-foreground">{order.user?.email || ''}</p>
              {order.shipping_address && (
                <p className="text-sm text-muted-foreground">{order.shipping_address.line1}, {order.shipping_address.postal_code} {order.shipping_address.city}, {order.shipping_address.country}</p>
              )}
              <p className="text-sm text-muted-foreground pt-2 border-t border-border mt-2">
                Order placed on: {order.created_at ? new Date(order.created_at).toLocaleString() : ''}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border rounded-none">
            <CardHeader>
              <CardTitle className="text-base">Items</CardTitle>
            </CardHeader>
            <CardContent>
              {order.items && order.items.length > 0 ? (
                <div className="space-y-3">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-foreground">
                        {item.product_name} <span className="text-muted-foreground">× {item.quantity}</span>
                      </span>
                      <span className="font-medium">{order.currency} {Number(item.unit_price).toFixed(2)}</span>
                    </div>
                  ))}
                </div> 
              ) : (
                <p className="text-sm text-muted-foreground">No item details available</p>
              )}
              {order.total != null && (
                <div className="flex justify-between text-sm font-semibold mt-4 pt-4 border-t border-border">
                  <span>Total</span>
                  <span>{order.currency} {Number(order.total).toFixed(2)}</span>
                </div>
              )}
            </CardContent>
          </Card> 
          <Card className="border-border rounded-none">
            <CardHeader>
              <CardTitle className="text-base">Summary Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {order.subtotal != null && (
                <div className="flex justify-between text-sm">
                  <span className="text-foreground">Subtotal</span>
                  <span>{Number(order.subtotal).toFixed(2)}</span>
                </div>
              )}
              {order.tax != null && (
                <div className="flex justify-between text-sm">
                  <span className="text-foreground">Tax</span>
                  <span>{Number(order.tax).toFixed(2)}</span>
                </div>
              )}
              {order.total != null && (
                <div className="flex justify-between text-sm font-semibold mt-4 pt-4 border-t border-border">
                  <span>Total</span>
                  <span>{order.currency} {Number(order.total).toFixed(2)}</span>
                </div>
              )}

            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          {/* Status History Timeline */}
          {order.status_history && order.status_history.length > 0 && (
            <Card className="border-border mt-6 rounded-none">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6 border-l-2 border-border ml-2 pl-6 py-2">
                  {order.status_history.map((history, index) => (
                    <div key={index} className="relative">
                      <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-secondary border-2 border-background" />
                      <p className="text-sm font-medium text-foreground">
                        Changed to <span className="capitalize">{history.new_status}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(history.created_at).toLocaleString()}
                      </p>
                      {history.note && <p className="text-xs text-slate-600 mt-1 italic">{history.note}</p>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        </div>
      </div>
  
  );
};

export default OrderDetail;
