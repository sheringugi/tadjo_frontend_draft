import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Trash2, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { adminFetch } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

interface Order {
  id: string;
  order_number: string;
  user?: {
    full_name: string;
  };
  status: string;
  tracking_number?: string;
  total: number;
  created_at: string;
}

const statusColor = (s: string) => {
    switch (s) {
      case 'delivered': return 'bg-emerald-100 text-emerald-700';
      case 'shipped': return 'bg-blue-100 text-blue-700';
      case 'processing': return 'bg-amber-100 text-amber-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'refunded': return 'bg-orange-100 text-orange-700';
      case 'pending_payment': return 'bg-amber-100 text-amber-800';
      default: return 'bg-slate-100 text-slate-600';
    }
  };
const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  
  // Delete Modal State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [confirmValue, setConfirmValue] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();


  useEffect(() => {
    adminFetch('/admin/orders/')
      .then((res) => res.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const handleDeleteClick = (e: React.MouseEvent, order: Order) => {
    e.stopPropagation(); // Prevent row click navigation
    setOrderToDelete(order);
    setConfirmValue('');
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!orderToDelete || confirmValue !== orderToDelete.order_number) return;

    setIsDeleting(true);
    try {
      const res = await adminFetch(`/admin/orders/${orderToDelete.id}`, { method: 'DELETE' });
      if (res.ok || res.status === 204) {
        setOrders(orders.filter(o => o.id !== orderToDelete.id));
        toast({ title: "Order deleted", description: `Order ${orderToDelete.order_number} removed.` });
        setIsDeleteDialogOpen(false);
      } else {
        const err = await res.json();
        throw new Error(err.detail || "Failed to delete");
      }
    } catch (error: any) {
      toast({ 
        title: "Deletion failed", 
        description: error.message, 
        variant: "destructive" 
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = orders.filter((o) => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        String(o.order_number).toLowerCase().includes(q) ||
        (o.user?.full_name || '').toLowerCase().includes(q) ||
        (o.tracking_number || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Orders</h1>
        <p className="text-sm text-slate-500">Manage customer orders</p>
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search orders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 rounded-lg w-64"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 rounded-lg">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="pending_payment">Awaiting Payment</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-slate-500 py-8 text-center">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-slate-500 py-8 text-center">No orders found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tracking #</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((order) => (
                  <TableRow key={order.order_number} className="cursor-pointer" onClick={() => {navigate(`/admin/orders/${order.id}`)}}>
                    <TableCell>
                      <Link to={`/admin/orders/${order.id}`} className="text-blue-600 hover:underline font-medium">
                        {order.order_number}
                      </Link>
                    </TableCell>
                    <TableCell>{order.user?.full_name || 'Customer'}</TableCell>
                    <TableCell className="text-slate-500">
                      {order.created_at ? new Date(order.created_at).toLocaleDateString() : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={statusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-blue-600 hover:underline font-medium">
                        {order.tracking_number || '—'}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {order.total != null ? `$${order.total}` : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      {['pending_payment', 'cancelled', 'pending'].includes(order.status) && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={(e) => handleDeleteClick(e, order)} 
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Thorough Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="rounded-none sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Confirm Order Deletion
            </DialogTitle>
            <DialogDescription className="pt-2">
              This action is permanent and cannot be undone. You are about to delete order <strong>{orderToDelete?.order_number}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Label className="text-xs text-muted-foreground uppercase tracking-luxury">Type "{orderToDelete?.order_number}" to confirm</Label>
            <Input 
              value={confirmValue} 
              onChange={(e) => setConfirmValue(e.target.value)} 
              className="rounded-none border-destructive/30 focus:border-destructive"
              placeholder={orderToDelete?.order_number}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-none" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button 
              variant="destructive" 
              className="rounded-none px-8" 
              disabled={confirmValue !== orderToDelete?.order_number || isDeleting}
              onClick={handleConfirmDelete}
            >
              {isDeleting ? "Deleting..." : "Delete Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders;
