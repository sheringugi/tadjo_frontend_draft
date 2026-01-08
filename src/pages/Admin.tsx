import { motion } from 'framer-motion';
import {
  DollarSign,
  ShoppingBag,
  Users,
  TrendingUp,
  Package,
  Truck,
  Clock,
  CheckCircle2,
  BarChart3,
  Settings,
  Bell,
} from 'lucide-react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { products } from '@/lib/store';

const stats = [
  {
    title: 'Total Revenue',
    value: '$12,426',
    change: '+12.5%',
    icon: DollarSign,
    trend: 'up',
  },
  {
    title: 'Total Orders',
    value: '156',
    change: '+8.2%',
    icon: ShoppingBag,
    trend: 'up',
  },
  {
    title: 'New Customers',
    value: '89',
    change: '+23.1%',
    icon: Users,
    trend: 'up',
  },
  {
    title: 'Conversion Rate',
    value: '3.42%',
    change: '+0.8%',
    icon: TrendingUp,
    trend: 'up',
  },
];

const recentOrders = [
  { id: 'ORD-001', customer: 'John Doe', amount: 129.99, status: 'delivered', date: '2 hours ago' },
  { id: 'ORD-002', customer: 'Jane Smith', amount: 89.99, status: 'shipped', date: '4 hours ago' },
  { id: 'ORD-003', customer: 'Bob Johnson', amount: 249.99, status: 'processing', date: '6 hours ago' },
  { id: 'ORD-004', customer: 'Alice Brown', amount: 59.99, status: 'pending', date: '8 hours ago' },
];

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'delivered':
      return { color: 'bg-success text-success-foreground', icon: CheckCircle2 };
    case 'shipped':
      return { color: 'bg-primary text-primary-foreground', icon: Truck };
    case 'processing':
      return { color: 'bg-warning text-warning-foreground', icon: Package };
    default:
      return { color: 'bg-secondary text-secondary-foreground', icon: Clock };
  }
};

const Admin = () => {
  return (
    <div className="min-h-screen bg-secondary/30">
      <Header />
      <main className="pt-20 md:pt-24 pb-16">
        <div className="container mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Dashboard
              </h1>
              <p className="text-muted-foreground">
                Welcome back! Here's what's happening with your store.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="icon">
                <Bell className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Settings className="w-4 h-4" />
              </Button>
              <Button className="gradient-cta text-accent-foreground">
                <Package className="w-4 h-4 mr-2" />
                Import Products
              </Button>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="shadow-card hover:shadow-card-hover transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <stat.icon className="w-6 h-6 text-primary" />
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-success/10 text-success font-medium"
                      >
                        {stat.change}
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Recent Orders */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-2"
            >
              <Card className="shadow-card">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Recent Orders</CardTitle>
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentOrders.map((order) => {
                      const statusConfig = getStatusConfig(order.status);
                      return (
                        <div
                          key={order.id}
                          className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full ${statusConfig.color} flex items-center justify-center`}>
                              <statusConfig.icon className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{order.id}</p>
                              <p className="text-sm text-muted-foreground">{order.customer}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-foreground">${order.amount}</p>
                            <p className="text-xs text-muted-foreground">{order.date}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Top Products */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="shadow-card">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Top Products</CardTitle>
                  <BarChart3 className="w-5 h-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {products.slice(0, 4).map((product, index) => (
                      <div key={product.id} className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground line-clamp-1">
                            {product.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {Math.floor(Math.random() * 50 + 20)} sold
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-foreground">
                          ${product.price}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Analytics Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8"
          >
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-3 gap-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Conversion Rate</span>
                      <span className="text-sm font-medium text-foreground">3.42%</span>
                    </div>
                    <Progress value={34.2} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Cart Abandonment</span>
                      <span className="text-sm font-medium text-foreground">68%</span>
                    </div>
                    <Progress value={68} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Return Rate</span>
                      <span className="text-sm font-medium text-foreground">4.2%</span>
                    </div>
                    <Progress value={4.2} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Admin;
