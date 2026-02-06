// TAJDO - Supplier Management

export interface Supplier {
  id: string;
  name: string;
  type: 'alibaba' | 'handmade';
  location: string;
  contactEmail: string;
  defaultLeadTimeDays: number;
  notes: string;
}

export type SupplierOrderStatus = 'pending' | 'confirmed' | 'in_production' | 'shipped' | 'received' | 'cancelled';

export interface SupplierOrder {
  id: string;
  supplierId: string;
  customerOrderId?: string; // linked customer order, if any
  items: SupplierOrderItem[];
  status: SupplierOrderStatus;
  totalCost: number;
  currency: string;
  dates: {
    created: string;
    confirmed?: string;
    inProduction?: string;
    shipped?: string;
    received?: string;
  };
  estimatedDeliveryDays: number;
  trackingNumber?: string;
  notes: string;
}

export interface SupplierOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
}

// Mock suppliers
export const suppliers: Supplier[] = [
  {
    id: 'sup-alibaba',
    name: 'Alibaba - GoldenPet Co.',
    type: 'alibaba',
    location: 'Guangzhou, China',
    contactEmail: 'orders@goldenpet.cn',
    defaultLeadTimeDays: 14,
    notes: 'Bulk orders. Minimum order quantity: 50 units. Handles collars, leashes, bowls, and carriers.',
  },
  {
    id: 'sup-tanzania',
    name: 'Tanzanian Artisan Collective',
    type: 'handmade',
    location: 'Arusha, Tanzania',
    contactEmail: 'craft@tz-artisans.co.tz',
    defaultLeadTimeDays: 21,
    notes: 'Handmade items. Small batch production. Handles beds, bandanas, and premium accessories.',
  },
];

// Map products to suppliers
export const productSupplierMap: Record<string, string> = {
  '1': 'sup-alibaba',    // Heritage Collar
  '2': 'sup-tanzania',   // Cloud Nine Pet Bed
  '3': 'sup-alibaba',    // Parisian Leash
  '4': 'sup-alibaba',    // Artisan Ceramic Bowl
  '5': 'sup-alibaba',    // Voyager Travel Carrier
  '6': 'sup-alibaba',    // Classic Harness
  '7': 'sup-tanzania',   // Signature Bandana
  '8': 'sup-alibaba',    // Elevated Feeder
};

// Supplier orders state (localStorage-backed)
const STORAGE_KEY = 'tajdo_supplier_orders';

const loadOrders = (): SupplierOrder[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : getMockOrders();
  } catch {
    return getMockOrders();
  }
};

const saveOrders = (orders: SupplierOrder[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
};

function getMockOrders(): SupplierOrder[] {
  const now = new Date();
  const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000).toISOString();

  return [
    {
      id: 'SO-001',
      supplierId: 'sup-alibaba',
      customerOrderId: 'ORD-A1B2C3',
      items: [
        { productId: '1', productName: 'The Heritage Collar', quantity: 30, unitCost: 18 },
        { productId: '3', productName: 'Parisian Leash', quantity: 20, unitCost: 12 },
      ],
      status: 'shipped',
      totalCost: 780,
      currency: 'USD',
      dates: {
        created: daysAgo(12),
        confirmed: daysAgo(11),
        inProduction: daysAgo(9),
        shipped: daysAgo(3),
      },
      estimatedDeliveryDays: 14,
      trackingNumber: 'CN2024ALI78934',
      notes: 'Bulk restock order',
    },
    {
      id: 'SO-002',
      supplierId: 'sup-tanzania',
      customerOrderId: 'ORD-D4E5F6',
      items: [
        { productId: '2', productName: 'Cloud Nine Pet Bed', quantity: 5, unitCost: 45 },
        { productId: '7', productName: 'Signature Bandana', quantity: 15, unitCost: 6 },
      ],
      status: 'in_production',
      totalCost: 315,
      currency: 'USD',
      dates: {
        created: daysAgo(8),
        confirmed: daysAgo(7),
        inProduction: daysAgo(5),
      },
      estimatedDeliveryDays: 21,
      notes: 'Handmade batch — natural dyes',
    },
    {
      id: 'SO-003',
      supplierId: 'sup-alibaba',
      items: [
        { productId: '4', productName: 'Artisan Ceramic Bowl', quantity: 50, unitCost: 8 },
        { productId: '8', productName: 'The Elevated Feeder', quantity: 10, unitCost: 25 },
      ],
      status: 'confirmed',
      totalCost: 650,
      currency: 'USD',
      dates: {
        created: daysAgo(3),
        confirmed: daysAgo(2),
      },
      estimatedDeliveryDays: 14,
      notes: 'Q1 inventory restock',
    },
    {
      id: 'SO-004',
      supplierId: 'sup-tanzania',
      customerOrderId: 'ORD-G7H8I9',
      items: [
        { productId: '7', productName: 'Signature Bandana', quantity: 10, unitCost: 6 },
      ],
      status: 'received',
      totalCost: 60,
      currency: 'USD',
      dates: {
        created: daysAgo(30),
        confirmed: daysAgo(29),
        inProduction: daysAgo(25),
        shipped: daysAgo(10),
        received: daysAgo(2),
      },
      estimatedDeliveryDays: 21,
      trackingNumber: 'TZ2024ART4521',
      notes: 'Custom colour batch — completed',
    },
  ];
}

let supplierOrders: SupplierOrder[] = loadOrders();

export const getSupplierOrders = (): SupplierOrder[] => [...supplierOrders];

export const getSupplierOrdersBySupplier = (supplierId: string): SupplierOrder[] =>
  supplierOrders.filter(o => o.supplierId === supplierId);

export const getSupplierOrdersByStatus = (status: SupplierOrderStatus): SupplierOrder[] =>
  supplierOrders.filter(o => o.status === status);

export const addSupplierOrder = (order: Omit<SupplierOrder, 'id'>): SupplierOrder => {
  const newOrder: SupplierOrder = {
    ...order,
    id: `SO-${String(supplierOrders.length + 1).padStart(3, '0')}`,
  };
  supplierOrders = [newOrder, ...supplierOrders];
  saveOrders(supplierOrders);
  return newOrder;
};

export const updateSupplierOrderStatus = (
  orderId: string,
  status: SupplierOrderStatus,
  trackingNumber?: string,
): SupplierOrder | null => {
  const order = supplierOrders.find(o => o.id === orderId);
  if (!order) return null;

  order.status = status;
  const now = new Date().toISOString();

  switch (status) {
    case 'confirmed':
      order.dates.confirmed = now;
      break;
    case 'in_production':
      order.dates.inProduction = now;
      break;
    case 'shipped':
      order.dates.shipped = now;
      if (trackingNumber) order.trackingNumber = trackingNumber;
      break;
    case 'received':
      order.dates.received = now;
      break;
  }

  saveOrders(supplierOrders);
  return { ...order };
};

export const getSupplierById = (id: string): Supplier | undefined =>
  suppliers.find(s => s.id === id);

export const getSupplierForProduct = (productId: string): Supplier | undefined => {
  const supplierId = productSupplierMap[productId];
  return supplierId ? getSupplierById(supplierId) : undefined;
};

// Auto-generate supplier orders from a customer order
export const createSupplierOrdersFromCustomerOrder = (
  customerOrderId: string,
  items: { productId: string; productName: string; quantity: number }[],
): SupplierOrder[] => {
  // Group items by supplier
  const grouped: Record<string, SupplierOrderItem[]> = {};

  items.forEach(item => {
    const supplierId = productSupplierMap[item.productId] || 'sup-alibaba';
    if (!grouped[supplierId]) grouped[supplierId] = [];
    grouped[supplierId].push({
      ...item,
      unitCost: 0, // cost TBD — manually updated later
    });
  });

  const created: SupplierOrder[] = [];

  Object.entries(grouped).forEach(([supplierId, orderItems]) => {
    const supplier = getSupplierById(supplierId);
    const order = addSupplierOrder({
      supplierId,
      customerOrderId,
      items: orderItems,
      status: 'pending',
      totalCost: 0,
      currency: 'USD',
      dates: { created: new Date().toISOString() },
      estimatedDeliveryDays: supplier?.defaultLeadTimeDays || 14,
      notes: `Auto-generated from customer order ${customerOrderId}`,
    });
    created.push(order);
  });

  return created;
};

// Turnaround time calculations
export const getActualTurnaroundDays = (order: SupplierOrder): number | null => {
  if (!order.dates.received || !order.dates.created) return null;
  const created = new Date(order.dates.created).getTime();
  const received = new Date(order.dates.received).getTime();
  return Math.round((received - created) / 86400000);
};

export const getElapsedDays = (order: SupplierOrder): number => {
  const created = new Date(order.dates.created).getTime();
  const now = Date.now();
  return Math.round((now - created) / 86400000);
};

export const getDaysRemaining = (order: SupplierOrder): number | null => {
  if (order.status === 'received' || order.status === 'cancelled') return null;
  return Math.max(0, order.estimatedDeliveryDays - getElapsedDays(order));
};
