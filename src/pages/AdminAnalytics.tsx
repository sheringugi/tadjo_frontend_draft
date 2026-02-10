import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign, TrendingUp, BarChart3, Package, ArrowLeft,
  Truck, Users, AlertTriangle, PieChart,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { products } from '@/lib/store';
import { suppliers, getSupplierOrders, getActualTurnaroundDays } from '@/lib/suppliers';

// Mock cost data per product (manufacturing + transport)
const productCosts: Record<string, { manufacturing: number; transport: number }> = {
  '1': { manufacturing: 18, transport: 5 },
  '2': { manufacturing: 45, transport: 12 },
  '3': { manufacturing: 12, transport: 4 },
  '4': { manufacturing: 8, transport: 3 },
  '5': { manufacturing: 55, transport: 15 },
  '6': { manufacturing: 20, transport: 5 },
  '7': { manufacturing: 6, transport: 2 },
  '8': { manufacturing: 25, transport: 8 },
};

// Mock order volume data
const orderVolumes = {
  daily: [
    { label: 'Mon', orders: 12, revenue: 1840 },
    { label: 'Tue', orders: 8, revenue: 1230 },
    { label: 'Wed', orders: 15, revenue: 2650 },
    { label: 'Thu', orders: 11, revenue: 1920 },
    { label: 'Fri', orders: 19, revenue: 3100 },
    { label: 'Sat', orders: 22, revenue: 3850 },
    { label: 'Sun', orders: 14, revenue: 2100 },
  ],
  weekly: [
    { label: 'Wk 1', orders: 78, revenue: 12400 },
    { label: 'Wk 2', orders: 92, revenue: 15200 },
    { label: 'Wk 3', orders: 85, revenue: 13800 },
    { label: 'Wk 4', orders: 101, revenue: 16900 },
  ],
  monthly: [
    { label: 'Oct', orders: 320, revenue: 48500 },
    { label: 'Nov', orders: 356, revenue: 54200 },
    { label: 'Dec', orders: 412, revenue: 67800 },
    { label: 'Jan', orders: 389, revenue: 59300 },
  ],
};

// Mock supplier payments
const supplierPayments = [
  { supplierId: 'sup-alibaba', month: 'Jan', amount: 4200 },
  { supplierId: 'sup-alibaba', month: 'Dec', amount: 5100 },
  { supplierId: 'sup-alibaba', month: 'Nov', amount: 3800 },
  { supplierId: 'sup-tanzania', month: 'Jan', amount: 1450 },
  { supplierId: 'sup-tanzania', month: 'Dec', amount: 1800 },
  { supplierId: 'sup-tanzania', month: 'Nov', amount: 1200 },
];

// Mock complaints
const complaints = [
  { id: 'CMP-001', orderId: 'ORD-A1B2C3', type: 'Damaged item', status: 'open', date: '2 days ago' },
  { id: 'CMP-002', orderId: 'ORD-D4E5F6', type: 'Wrong size', status: 'resolved', date: '5 days ago' },
  { id: 'CMP-003', orderId: 'ORD-G7H8I9', type: 'Late delivery', status: 'in_progress', date: '1 week ago' },
];

const rescueContribution = 0.05; // 5% to TAJDO Rescue

const AdminAnalytics = () => {
  const [volumePeriod, setVolumePeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const supplierOrders = getSupplierOrders();

  const profitData = products.map(p => {
    const costs = productCosts[p.id] || { manufacturing: 0, transport: 0 };
    const totalCost = costs.manufacturing + costs.transport;
    const margin = p.price - totalCost;
    const marginPct = ((margin / p.price) * 100).toFixed(1);
    const rescue = p.price * rescueContribution;
    return { ...p, ...costs, totalCost, margin, marginPct, rescue };
  });

  const totalRevenue = profitData.reduce((s, p) => s + p.price * (p.reviews || 1), 0);
  const totalRescue = totalRevenue * rescueContribution;

  const volumeData = orderVolumes[volumePeriod];
  const totalOrders = volumeData.reduce((s, d) => s + d.orders, 0);
  const totalVolumeRevenue = volumeData.reduce((s, d) => s + d.revenue, 0);

  return (
    <div className="min-h-screen bg-secondary/30">
      <Header />
      <main className="pt-20 md:pt-24 pb-16">
        <div className="container mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 text-xs tracking-luxury uppercase text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Analytics & Finance</h1>
            <p className="text-muted-foreground">Profit margins, volumes, supplier payments, and contributions.</p>
          </motion.div>

          <Tabs defaultValue="margins" className="space-y-6">
            <TabsList className="bg-background border border-border rounded-none">
              <TabsTrigger value="margins" className="rounded-none text-xs tracking-luxury uppercase">Profit Margins</TabsTrigger>
              <TabsTrigger value="volumes" className="rounded-none text-xs tracking-luxury uppercase">Order Volumes</TabsTrigger>
              <TabsTrigger value="suppliers" className="rounded-none text-xs tracking-luxury uppercase">Supplier Payments</TabsTrigger>
              <TabsTrigger value="complaints" className="rounded-none text-xs tracking-luxury uppercase">Complaints</TabsTrigger>
            </TabsList>

            {/* Profit Margins */}
            <TabsContent value="margins" className="space-y-6">
              {/* Summary cards */}
              <div className="grid sm:grid-cols-3 gap-4">
                <Card className="shadow-card">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <DollarSign className="w-5 h-5 text-primary" />
                      <span className="text-xs text-muted-foreground uppercase tracking-luxury">Avg Margin</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                      {(profitData.reduce((s, p) => s + parseFloat(p.marginPct), 0) / profitData.length).toFixed(1)}%
                    </p>
                  </CardContent>
                </Card>
                <Card className="shadow-card">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      <span className="text-xs text-muted-foreground uppercase tracking-luxury">Highest Margin</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                      {Math.max(...profitData.map(p => parseFloat(p.marginPct)))}%
                    </p>
                  </CardContent>
                </Card>
                <Card className="shadow-card">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <PieChart className="w-5 h-5 text-primary" />
                      <span className="text-xs text-muted-foreground uppercase tracking-luxury">TAJDO Rescue Fund</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">5%</p>
                    <p className="text-xs text-muted-foreground">of every sale</p>
                  </CardContent>
                </Card>
              </div>

              {/* Product breakdown */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg">Product Cost Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-xs text-muted-foreground uppercase tracking-luxury">
                          <th className="text-left py-3 pr-4">Product</th>
                          <th className="text-right py-3 px-2">Sell Price</th>
                          <th className="text-right py-3 px-2">Mfg Cost</th>
                          <th className="text-right py-3 px-2">Transport</th>
                          <th className="text-right py-3 px-2">Rescue (5%)</th>
                          <th className="text-right py-3 px-2">Net Margin</th>
                          <th className="text-right py-3 pl-2">Margin %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {profitData.map(p => (
                          <tr key={p.id} className="border-b border-border/50">
                            <td className="py-3 pr-4 font-medium text-foreground">{p.name}</td>
                            <td className="text-right py-3 px-2">CHF {p.price.toFixed(0)}</td>
                            <td className="text-right py-3 px-2 text-muted-foreground">{p.manufacturing}</td>
                            <td className="text-right py-3 px-2 text-muted-foreground">{p.transport}</td>
                            <td className="text-right py-3 px-2 text-muted-foreground">{p.rescue.toFixed(1)}</td>
                            <td className="text-right py-3 px-2 font-medium text-foreground">
                              CHF {(p.margin - p.rescue).toFixed(1)}
                            </td>
                            <td className="text-right py-3 pl-2">
                              <Badge
                                variant="secondary"
                                className={parseFloat(p.marginPct) > 70 ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}
                              >
                                {p.marginPct}%
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Order Volumes */}
            <TabsContent value="volumes" className="space-y-6">
              <div className="flex gap-2 mb-4">
                {(['daily', 'weekly', 'monthly'] as const).map(period => (
                  <button
                    key={period}
                    onClick={() => setVolumePeriod(period)}
                    className={`px-4 py-2 text-xs tracking-luxury uppercase border transition-colors ${
                      volumePeriod === period
                        ? 'bg-foreground text-background border-foreground'
                        : 'bg-background text-foreground border-border hover:border-foreground'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <Card className="shadow-card">
                  <CardContent className="p-6">
                    <Package className="w-5 h-5 text-primary mb-2" />
                    <p className="text-2xl font-bold text-foreground">{totalOrders}</p>
                    <p className="text-xs text-muted-foreground">Total Orders ({volumePeriod})</p>
                  </CardContent>
                </Card>
                <Card className="shadow-card">
                  <CardContent className="p-6">
                    <DollarSign className="w-5 h-5 text-primary mb-2" />
                    <p className="text-2xl font-bold text-foreground">CHF {totalVolumeRevenue.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Revenue ({volumePeriod})</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg">Order Volume</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {volumeData.map(d => {
                      const maxOrders = Math.max(...volumeData.map(v => v.orders));
                      return (
                        <div key={d.label} className="flex items-center gap-4">
                          <span className="w-10 text-xs text-muted-foreground">{d.label}</span>
                          <div className="flex-1 bg-secondary rounded-full h-6 overflow-hidden">
                            <div
                              className="h-full bg-primary/80 rounded-full flex items-center justify-end pr-2"
                              style={{ width: `${(d.orders / maxOrders) * 100}%` }}
                            >
                              <span className="text-[10px] text-primary-foreground font-medium">{d.orders}</span>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground w-24 text-right">CHF {d.revenue.toLocaleString()}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Supplier Payments */}
            <TabsContent value="suppliers" className="space-y-6">
              {suppliers.map(supplier => {
                const payments = supplierPayments.filter(p => p.supplierId === supplier.id);
                const total = payments.reduce((s, p) => s + p.amount, 0);
                const orders = supplierOrders.filter(o => o.supplierId === supplier.id);

                return (
                  <Card key={supplier.id} className="shadow-card">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{supplier.name}</CardTitle>
                        <Badge variant="outline" className="rounded-none text-xs">
                          {supplier.type === 'alibaba' ? 'Alibaba' : 'Handmade'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid sm:grid-cols-3 gap-4 mb-6">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Total Paid (3 months)</p>
                          <p className="text-xl font-bold text-foreground">USD {total.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Active Orders</p>
                          <p className="text-xl font-bold text-foreground">
                            {orders.filter(o => !['received', 'cancelled'].includes(o.status)).length}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Contact</p>
                          <p className="text-sm text-foreground">{supplier.contactEmail}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {payments.map((p, i) => (
                          <div key={i} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                            <span className="text-sm text-muted-foreground">{p.month}</span>
                            <span className="text-sm font-medium text-foreground">USD {p.amount.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>

            {/* Complaints */}
            <TabsContent value="complaints" className="space-y-6">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg">Customer Complaints & Returns</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {complaints.map(c => (
                      <div key={c.id} className="flex items-center justify-between p-4 border border-border rounded-none">
                        <div className="flex items-center gap-4">
                          <AlertTriangle className={`w-4 h-4 ${c.status === 'open' ? 'text-destructive' : c.status === 'in_progress' ? 'text-warning' : 'text-success'}`} />
                          <div>
                            <p className="text-sm font-medium text-foreground">{c.id} — {c.type}</p>
                            <p className="text-xs text-muted-foreground">Order: {c.orderId} · {c.date}</p>
                          </div>
                        </div>
                        <Badge
                          variant="secondary"
                          className={`rounded-none text-xs ${
                            c.status === 'open' ? 'bg-destructive/10 text-destructive' :
                            c.status === 'in_progress' ? 'bg-warning/10 text-warning' :
                            'bg-success/10 text-success'
                          }`}
                        >
                          {c.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default AdminAnalytics;
