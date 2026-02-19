import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Clock, TrendingUp, DollarSign, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { adminFetch } from '@/lib/auth';

interface Order {
  id: string;
  order_number: string;
  user?: {
    full_name: string;
  };
  status: string;
  total: number;
  created_at: string;
}

const Dashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [balance, setBalance] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [ordersRes, balanceRes] = await Promise.all([
          adminFetch('/admin/orders/'),
          adminFetch('/payments/admin/stripe-balance')
        ]);

        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setOrders(Array.isArray(ordersData) ? ordersData : []);
        }

        if (balanceRes.ok) {
          const balanceData = await balanceRes.json();
          setBalance(balanceData);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'pending' || o.status === 'processing').length;
  const revenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  const stats = [
    { label: 'Total Orders', value: totalOrders, icon: ShoppingCart, color: 'bg-blue-100 text-blue-600' },
    { label: 'Pending', value: pendingOrders, icon: Clock, color: 'bg-amber-100 text-amber-600' },
    { label: 'Revenue (Est)', value: `CHF ${revenue.toLocaleString()}`, icon: TrendingUp, color: 'bg-emerald-100 text-emerald-600' },
  ];

  const statusColor = (s: string) => {
    switch (s) {
      case 'delivered': return 'bg-emerald-100 text-emerald-700';
      case 'shipped': return 'bg-blue-100 text-blue-700';
      case 'processing': return 'bg-amber-100 text-amber-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'refunded': return 'bg-orange-100 text-orange-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-medium text-foreground">Dashboard</h1>
        <p className="text-sm text-slate-500">Overview of your store performance</p>
      </div>

      {/* Stripe Balance Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border rounded-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance (Stripe)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : balance?.available?.map((b: any) => formatCurrency(b.amount, b.currency)).join(', ') || 'CHF 0.00'}
            </div>
            <p className="text-xs text-muted-foreground">Ready to pay out</p>
          </CardContent>
        </Card>

        <Card className="border-border rounded-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Balance (Stripe)</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : balance?.pending?.map((b: any) => formatCurrency(b.amount, b.currency)).join(', ') || 'CHF 0.00'}
            </div>
            <p className="text-xs text-muted-foreground">Future payouts</p>
          </CardContent>
        </Card>
      </div>

      {/* Store Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="border-border rounded-none">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-none ${s.color} flex items-center justify-center`}>
                  <s.icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-semibold text-foreground">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      <Card className="border-border rounded-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">Recent Orders</CardTitle>
          <Link to="/admin/orders" className="text-sm text-primary hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Loading orders...</p>
          ) : orders.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No orders yet</p>
          ) : (
            <div className="space-y-1">
              {orders.slice(0, 5).map((order) => (
                <Link
                  key={order.id}
                  to={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between p-3 hover:bg-secondary/50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">Order {order.order_number || `#${order.id}`}</p>
                    <p className="text-xs text-muted-foreground">{order.user?.full_name || 'Customer'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className={`rounded-none ${statusColor(order.status)}`}>
                      {order.status}
                    </Badge>
                    {order.total != null && (
                      <span className="text-sm font-medium text-foreground">CHF {Number(order.total).toFixed(2)}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
