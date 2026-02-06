import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Filter, Package, Clock, CheckCircle2, Truck, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import SupplierCard from '@/components/admin/SupplierCard';
import SupplierOrderRow from '@/components/admin/SupplierOrderRow';
import CreateSupplierOrderDialog from '@/components/admin/CreateSupplierOrderDialog';
import {
  suppliers,
  getSupplierOrders,
  updateSupplierOrderStatus,
  SupplierOrder,
  SupplierOrderStatus,
} from '@/lib/suppliers';
import { useToast } from '@/hooks/use-toast';

const statusFilters: { value: string; label: string }[] = [
  { value: 'all', label: 'All Orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'in_production', label: 'In Production' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'received', label: 'Received' },
];

const SupplierManagement = () => {
  const [orders, setOrders] = useState<SupplierOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();

  const refreshOrders = () => {
    setOrders(getSupplierOrders());
  };

  useEffect(() => {
    refreshOrders();
  }, []);

  const handleUpdateStatus = (orderId: string, status: SupplierOrderStatus) => {
    const updated = updateSupplierOrderStatus(orderId, status);
    if (updated) {
      refreshOrders();
      toast({
        title: 'Order updated',
        description: `${orderId} marked as ${status.replace('_', ' ')}.`,
      });
    }
  };

  const filteredOrders = orders.filter(o => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (supplierFilter !== 'all' && o.supplierId !== supplierFilter) return false;
    return true;
  });

  // Stats
  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const activeCount = orders.filter(o => ['confirmed', 'in_production', 'shipped'].includes(o.status)).length;
  const completedCount = orders.filter(o => o.status === 'received').length;
  const overdueCount = orders.filter(o => {
    if (o.status === 'received' || o.status === 'cancelled') return false;
    const elapsed = Math.round((Date.now() - new Date(o.dates.created).getTime()) / 86400000);
    return elapsed > o.estimatedDeliveryDays;
  }).length;

  const stats = [
    { label: 'Pending', value: pendingCount, icon: Clock, color: 'text-muted-foreground' },
    { label: 'Active', value: activeCount, icon: Package, color: 'text-primary' },
    { label: 'Completed', value: completedCount, icon: CheckCircle2, color: 'text-success' },
    { label: 'Overdue', value: overdueCount, icon: AlertCircle, color: 'text-destructive' },
  ];

  return (
    <div className="min-h-screen bg-secondary/30">
      <Header />
      <main className="pt-28 md:pt-36 pb-24">
        <div className="container mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 text-xs tracking-luxury uppercase text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-display text-foreground">
                  Supplier Management
                </h1>
                <p className="text-muted-foreground mt-1">
                  Manage orders across Alibaba and Tanzania suppliers
                </p>
              </div>
              <Button
                className="bg-foreground text-background hover:bg-foreground/90 rounded-none h-10 px-6 text-xs tracking-luxury uppercase"
                onClick={() => setIsCreateOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Supplier Order
              </Button>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="shadow-card">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full bg-secondary flex items-center justify-center ${stat.color}`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-medium text-foreground">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Suppliers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <h2 className="text-xs tracking-luxury uppercase font-medium text-foreground mb-6">
              Suppliers
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {suppliers.map(supplier => {
                const supplierOrders = orders.filter(o => o.supplierId === supplier.id);
                const pending = supplierOrders.filter(o => o.status === 'pending').length;
                return (
                  <SupplierCard
                    key={supplier.id}
                    supplier={supplier}
                    orderCount={supplierOrders.length}
                    pendingCount={pending}
                    onClick={() => setSupplierFilter(supplier.id === supplierFilter ? 'all' : supplier.id)}
                  />
                );
              })}
            </div>
          </motion.div>

          {/* Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <h2 className="text-xs tracking-luxury uppercase font-medium text-foreground">
                Supplier Orders ({filteredOrders.length})
              </h2>
              <div className="flex gap-3">
                <Select value={supplierFilter} onValueChange={setSupplierFilter}>
                  <SelectTrigger className="rounded-none w-[180px] text-xs">
                    <SelectValue placeholder="All Suppliers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Suppliers</SelectItem>
                    {suppliers.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="rounded-none w-[160px] text-xs">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusFilters.map(f => (
                      <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              {filteredOrders.length > 0 ? (
                filteredOrders.map(order => (
                  <SupplierOrderRow
                    key={order.id}
                    order={order}
                    onUpdateStatus={handleUpdateStatus}
                  />
                ))
              ) : (
                <div className="text-center py-16">
                  <Truck className="w-10 h-10 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No orders match your filters</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>

      <CreateSupplierOrderDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onOrderCreated={refreshOrders}
      />
    </div>
  );
};

export default SupplierManagement;
