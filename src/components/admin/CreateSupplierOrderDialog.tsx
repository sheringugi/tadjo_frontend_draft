import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { suppliers, addSupplierOrder, SupplierOrderItem } from '@/lib/suppliers';
import { products } from '@/lib/store';
import { Plus, X } from 'lucide-react';

interface CreateSupplierOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrderCreated: () => void;
}

const CreateSupplierOrderDialog = ({ open, onOpenChange, onOrderCreated }: CreateSupplierOrderDialogProps) => {
  const [supplierId, setSupplierId] = useState('');
  const [customerOrderId, setCustomerOrderId] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<SupplierOrderItem[]>([
    { productId: '', productName: '', quantity: 1, unitCost: 0 },
  ]);

  const addItem = () => {
    setItems([...items, { productId: '', productName: '', quantity: 1, unitCost: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof SupplierOrderItem, value: string | number) => {
    const updated = [...items];
    if (field === 'productId') {
      const product = products.find(p => p.id === value);
      updated[index] = {
        ...updated[index],
        productId: value as string,
        productName: product?.name || '',
      };
    } else {
      (updated[index] as any)[field] = value;
    }
    setItems(updated);
  };

  const totalCost = items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);

  const selectedSupplier = suppliers.find(s => s.id === supplierId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!supplierId || items.some(item => !item.productId)) return;

    addSupplierOrder({
      supplierId,
      customerOrderId: customerOrderId || undefined,
      items: items.filter(i => i.productId),
      status: 'pending',
      totalCost,
      currency: 'USD',
      dates: { created: new Date().toISOString() },
      estimatedDeliveryDays: selectedSupplier?.defaultLeadTimeDays || 14,
      notes,
    });

    // Reset form
    setSupplierId('');
    setCustomerOrderId('');
    setNotes('');
    setItems([{ productId: '', productName: '', quantity: 1, unitCost: 0 }]);
    onOrderCreated();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">New Supplier Order</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Supplier Select */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-luxury">Supplier</Label>
            <Select value={supplierId} onValueChange={setSupplierId}>
              <SelectTrigger className="rounded-none">
                <SelectValue placeholder="Select supplier" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map(s => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} ({s.type === 'alibaba' ? 'Alibaba' : 'Handmade'})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedSupplier && (
              <p className="text-xs text-muted-foreground">
                Default lead time: {selectedSupplier.defaultLeadTimeDays} days • {selectedSupplier.location}
              </p>
            )}
          </div>

          {/* Customer Order ID (optional) */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-luxury">
              Customer Order ID <span className="normal-case tracking-normal">(optional)</span>
            </Label>
            <Input
              value={customerOrderId}
              onChange={e => setCustomerOrderId(e.target.value)}
              placeholder="e.g. ORD-A1B2C3"
              className="rounded-none"
            />
          </div>

          {/* Items */}
          <div className="space-y-3">
            <Label className="text-xs text-muted-foreground uppercase tracking-luxury">Items</Label>
            {items.map((item, index) => (
              <div key={index} className="flex gap-2 items-end">
                <div className="flex-1">
                  <Select
                    value={item.productId}
                    onValueChange={v => updateItem(index, 'productId', v)}
                  >
                    <SelectTrigger className="rounded-none">
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map(p => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-20">
                  <Input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={e => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                    placeholder="Qty"
                    className="rounded-none"
                  />
                </div>
                <div className="w-24">
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    value={item.unitCost || ''}
                    onChange={e => updateItem(index, 'unitCost', parseFloat(e.target.value) || 0)}
                    placeholder="Unit $"
                    className="rounded-none"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 flex-shrink-0"
                  onClick={() => removeItem(index)}
                  disabled={items.length === 1}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-none text-xs tracking-luxury uppercase"
              onClick={addItem}
            >
              <Plus className="w-3 h-3 mr-2" />
              Add Item
            </Button>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-luxury">Notes</Label>
            <Textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Order notes, special instructions..."
              className="rounded-none resize-none"
              rows={3}
            />
          </div>

          {/* Summary */}
          <div className="border-t border-border pt-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">
                Total: <span className="text-foreground font-medium">${totalCost.toFixed(2)} USD</span>
              </p>
              {selectedSupplier && (
                <p className="text-xs text-muted-foreground">
                  Est. delivery: {selectedSupplier.defaultLeadTimeDays} days
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="bg-foreground text-background hover:bg-foreground/90 rounded-none h-10 px-8 text-xs tracking-luxury uppercase"
              disabled={!supplierId || items.some(i => !i.productId)}
            >
              Create Order
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSupplierOrderDialog;
