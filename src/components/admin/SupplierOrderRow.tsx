import { SupplierOrder, SupplierOrderStatus, getSupplierById, getElapsedDays, getDaysRemaining, getActualTurnaroundDays } from '@/lib/suppliers';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Truck, Package, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

interface SupplierOrderRowProps {
  order: SupplierOrder;
  onUpdateStatus: (orderId: string, status: SupplierOrderStatus) => void;
}

const statusConfig: Record<SupplierOrderStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Pending', color: 'bg-secondary text-secondary-foreground', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'bg-primary/10 text-primary', icon: CheckCircle2 },
  in_production: { label: 'In Production', color: 'bg-accent/20 text-accent-foreground', icon: Package },
  shipped: { label: 'Shipped', color: 'bg-warning/20 text-warning-foreground', icon: Truck },
  received: { label: 'Received', color: 'bg-success/10 text-success', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'bg-destructive/10 text-destructive', icon: XCircle },
};

const nextStatusMap: Partial<Record<SupplierOrderStatus, SupplierOrderStatus>> = {
  pending: 'confirmed',
  confirmed: 'in_production',
  in_production: 'shipped',
  shipped: 'received',
};

const SupplierOrderRow = ({ order, onUpdateStatus }: SupplierOrderRowProps) => {
  const supplier = getSupplierById(order.supplierId);
  const config = statusConfig[order.status];
  const StatusIcon = config.icon;
  const elapsed = getElapsedDays(order);
  const remaining = getDaysRemaining(order);
  const actualTurnaround = getActualTurnaroundDays(order);
  const nextStatus = nextStatusMap[order.status];

  const isOverdue = remaining !== null && remaining === 0 && order.status !== 'received' && order.status !== 'cancelled';

  return (
    <div className="p-4 border border-border hover:border-foreground/20 transition-colors">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Order Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm font-medium text-foreground">{order.id}</span>
            <Badge variant="secondary" className={config.color}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {config.label}
            </Badge>
            {isOverdue && (
              <Badge variant="secondary" className="bg-destructive/10 text-destructive">
                <AlertCircle className="w-3 h-3 mr-1" />
                Overdue
              </Badge>
            )}
          </div>

          <p className="text-xs text-muted-foreground mb-1">
            {supplier?.name} • {supplier?.type === 'alibaba' ? 'Alibaba' : 'Handmade'}
          </p>

          {order.customerOrderId && (
            <p className="text-xs text-muted-foreground">
              Customer Order: <span className="text-foreground">{order.customerOrderId}</span>
            </p>
          )}

          <div className="mt-2 flex flex-wrap gap-1">
            {order.items.map((item, i) => (
              <span key={i} className="text-xs bg-secondary px-2 py-0.5 text-secondary-foreground">
                {item.quantity}× {item.productName}
              </span>
            ))}
          </div>
        </div>

        {/* Turnaround & Cost */}
        <div className="flex flex-col items-end gap-1 text-right min-w-[140px]">
          <p className="text-sm font-medium text-foreground">
            ${order.totalCost.toFixed(0)} {order.currency}
          </p>

          {actualTurnaround !== null ? (
            <p className="text-xs text-success">
              Completed in {actualTurnaround} days
            </p>
          ) : (
            <div className="text-xs text-muted-foreground">
              <p>{elapsed}d elapsed / {order.estimatedDeliveryDays}d est.</p>
              {remaining !== null && (
                <p className={isOverdue ? 'text-destructive font-medium' : 'text-foreground'}>
                  {isOverdue ? 'Overdue' : `${remaining}d remaining`}
                </p>
              )}
            </div>
          )}

          {order.trackingNumber && (
            <p className="text-xs text-muted-foreground">
              Track: {order.trackingNumber}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {nextStatus && (
            <Button
              size="sm"
              variant="outline"
              className="rounded-none text-xs tracking-luxury uppercase h-8"
              onClick={() => onUpdateStatus(order.id, nextStatus)}
            >
              Mark {statusConfig[nextStatus].label}
            </Button>
          )}
        </div>
      </div>

      {order.notes && (
        <p className="mt-3 text-xs text-muted-foreground italic border-t border-border pt-3">
          {order.notes}
        </p>
      )}
    </div>
  );
};

export default SupplierOrderRow;
