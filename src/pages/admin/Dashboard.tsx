import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Clock, TrendingUp, DollarSign, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { adminFetch } from '@/lib/auth';

interface Order {
  id: string | number;
  customer_name?: string;
  status: string;
  total?: number;
  created_at?: string;
}

const Dashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch('/admin/orders/')
      .then((res) => res.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const revenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  const stats = [
    { label: 'Total Orders', value: totalOrders, icon: ShoppingCart, color: 'bg-blue-100 text-blue-600' },
    { label: 'Pending', value: pendingOrders, icon: Clock, color: 'bg-amber-100 text-amber-600' },
    { label: 'Revenue', value: `$${revenue.toLocaleString()}`, icon: DollarSign, color: 'bg-emerald-100 text-emerald-600' },
    { label: 'Avg. Order', value: totalOrders ? `$${Math.round(revenue / totalOrders)}` : '$0', icon: TrendingUp, color: 'bg-purple-100 text-purple-600' },
  ];

  const statusColor = (s: string) => {
    switch (s) {
      case 'delivered': return 'bg-emerald-100 text-emerald-700';
      case 'shipped': return 'bg-blue-100 text-blue-700';
      case 'processing': return 'bg-amber-100 text-amber-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">Overview of your store performance</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="border-slate-200">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center`}>
                  <s.icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-semibold text-slate-900">{s.value}</p>
              <p className="text-sm text-slate-500">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent orders */}
      <Card className="border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold text-slate-900">Recent Orders</CardTitle>
          <Link to="/admin/orders" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-slate-500 py-8 text-center">Loading orders...</p>
          ) : orders.length === 0 ? (
            <p className="text-sm text-slate-500 py-8 text-center">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 5).map((order) => (
                <Link
                  key={order.id}
                  to={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">Order #{order.id}</p>
                    <p className="text-xs text-slate-500">{order.customer_name || 'Customer'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className={statusColor(order.status)}>
                      {order.status}
                    </Badge>
                    {order.total != null && (
                      <span className="text-sm font-medium text-slate-900">${order.total}</span>
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
