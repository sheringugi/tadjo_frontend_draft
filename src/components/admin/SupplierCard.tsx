import { Supplier } from '@/lib/suppliers';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Mail, Clock, Package } from 'lucide-react';

interface SupplierCardProps {
  supplier: Supplier;
  orderCount: number;
  pendingCount: number;
  onClick: () => void;
}

const SupplierCard = ({ supplier, orderCount, pendingCount, onClick }: SupplierCardProps) => {
  return (
    <Card
      className="shadow-card hover:shadow-card-hover transition-all cursor-pointer group"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <Badge
              variant="secondary"
              className={
                supplier.type === 'alibaba'
                  ? 'bg-primary/10 text-primary'
                  : 'bg-accent/20 text-accent-foreground'
              }
            >
              {supplier.type === 'alibaba' ? 'Alibaba' : 'Handmade'}
            </Badge>
          </div>
          {pendingCount > 0 && (
            <span className="text-xs font-medium bg-warning/20 text-warning-foreground px-2 py-1 rounded">
              {pendingCount} pending
            </span>
          )}
        </div>

        <h3 className="text-lg font-display text-foreground mb-1 group-hover:text-muted-foreground transition-colors">
          {supplier.name}
        </h3>

        <div className="space-y-2 mt-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5" />
            {supplier.location}
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5" />
            {supplier.contactEmail}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" />
            {supplier.defaultLeadTimeDays} days lead time
          </div>
          <div className="flex items-center gap-2">
            <Package className="w-3.5 h-3.5" />
            {orderCount} total orders
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SupplierCard;
