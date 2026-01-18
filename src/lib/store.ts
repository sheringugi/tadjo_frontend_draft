// TAJDO - Luxury Pet Accessories Store

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  description: string;
  specifications: string[];
  shippingDays: number;
  inStock: boolean;
  badge?: 'bestseller' | 'new' | 'limited';
  material?: string;
  color?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  productCount: number;
}

export const categories: Category[] = [
  { id: 'collars', name: 'Collars', description: 'Handcrafted leather collars', productCount: 12 },
  { id: 'leashes', name: 'Leashes', description: 'Premium walking essentials', productCount: 8 },
  { id: 'beds', name: 'Beds', description: 'Luxurious comfort', productCount: 6 },
  { id: 'carriers', name: 'Carriers', description: 'Travel in style', productCount: 5 },
  { id: 'bowls', name: 'Bowls & Feeders', description: 'Ceramic & stainless', productCount: 10 },
  { id: 'accessories', name: 'Accessories', description: 'Finishing touches', productCount: 15 },
];

export const products: Product[] = [
  {
    id: '1',
    name: 'The Heritage Collar',
    price: 145.00,
    image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=600&h=600&fit=crop',
    category: 'collars',
    rating: 5.0,
    reviews: 127,
    description: 'Handcrafted from Italian vegetable-tanned leather with solid brass hardware. Features a subtle embossed TAJDO logo and adjustable fit.',
    specifications: ['Italian vegetable-tanned leather', 'Solid brass hardware', 'Hand-stitched', 'Water-resistant finish'],
    shippingDays: 5,
    inStock: true,
    badge: 'bestseller',
    material: 'Italian Leather',
    color: 'Cognac',
  },
  {
    id: '2',
    name: 'Cloud Nine Pet Bed',
    price: 295.00,
    image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=600&h=600&fit=crop',
    category: 'beds',
    rating: 4.9,
    reviews: 89,
    description: 'Ultra-plush memory foam bed with removable linen cover. Designed for orthopedic support and timeless elegance.',
    specifications: ['Memory foam core', 'Removable linen cover', 'Machine washable', 'Non-slip base'],
    shippingDays: 7,
    inStock: true,
    badge: 'new',
    material: 'Linen & Memory Foam',
    color: 'Natural Oatmeal',
  },
  {
    id: '3',
    name: 'Parisian Leash',
    price: 120.00,
    image: 'https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?w=600&h=600&fit=crop',
    category: 'leashes',
    rating: 4.8,
    reviews: 156,
    description: 'Woven cotton rope leash with leather handle. Features champagne gold hardware for a refined finish.',
    specifications: ['Cotton rope with leather accent', 'Champagne gold hardware', '1.5m length', 'Comfortable grip'],
    shippingDays: 4,
    inStock: true,
    material: 'Cotton & Leather',
    color: 'Sand',
  },
  {
    id: '4',
    name: 'Artisan Ceramic Bowl',
    price: 85.00,
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=600&fit=crop',
    category: 'bowls',
    rating: 4.9,
    reviews: 203,
    description: 'Hand-thrown ceramic bowl with a weighted base. Each piece is unique with subtle variations.',
    specifications: ['Hand-thrown ceramic', 'Food-safe glaze', 'Weighted base', 'Dishwasher safe'],
    shippingDays: 3,
    inStock: true,
    badge: 'bestseller',
    material: 'Ceramic',
    color: 'Warm White',
  },
  {
    id: '5',
    name: 'Voyager Travel Carrier',
    price: 425.00,
    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&h=600&fit=crop',
    category: 'carriers',
    rating: 5.0,
    reviews: 64,
    description: 'Airline-approved carrier in soft Italian leather with breathable mesh panels. Features a padded interior and secure closure.',
    specifications: ['Italian leather exterior', 'Padded sherpa interior', 'Airline approved', 'Ventilated mesh panels'],
    shippingDays: 7,
    inStock: true,
    badge: 'limited',
    material: 'Italian Leather',
    color: 'Graphite',
  },
  {
    id: '6',
    name: 'Classic Harness',
    price: 165.00,
    image: 'https://images.unsplash.com/photo-1558788353-f76d92427f16?w=600&h=600&fit=crop',
    category: 'accessories',
    rating: 4.7,
    reviews: 98,
    description: 'Step-in harness designed for comfort and control. Features soft padding and adjustable straps.',
    specifications: ['Padded construction', 'Adjustable fit', 'D-ring for leash', 'Quick-release buckle'],
    shippingDays: 5,
    inStock: true,
    material: 'Leather & Canvas',
    color: 'Taupe',
  },
  {
    id: '7',
    name: 'Signature Bandana',
    price: 48.00,
    image: 'https://images.unsplash.com/photo-1587764379873-97837921fd44?w=600&h=600&fit=crop',
    category: 'accessories',
    rating: 4.8,
    reviews: 312,
    description: 'Soft organic cotton bandana with subtle TAJDO monogram. Perfect for everyday style.',
    specifications: ['100% organic cotton', 'TAJDO monogram', 'Adjustable snap closure', 'Multiple sizes'],
    shippingDays: 2,
    inStock: true,
    badge: 'new',
    material: 'Organic Cotton',
    color: 'Cream',
  },
  {
    id: '8',
    name: 'The Elevated Feeder',
    price: 195.00,
    image: 'https://images.unsplash.com/photo-1560807707-8cc77767d783?w=600&h=600&fit=crop',
    category: 'bowls',
    rating: 4.9,
    reviews: 76,
    description: 'Solid oak stand with twin stainless steel bowls. Ergonomic height for comfortable dining.',
    specifications: ['Solid oak construction', 'Stainless steel bowls', 'Ergonomic height', 'Non-slip feet'],
    shippingDays: 6,
    inStock: true,
    material: 'Oak & Stainless Steel',
    color: 'Natural Oak',
  },
];

// Simple cart state management
let cart: CartItem[] = [];

export const getCart = () => cart;

export const addToCart = (product: Product, quantity: number = 1) => {
  const existingItem = cart.find(item => item.product.id === product.id);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({ product, quantity });
  }
  return [...cart];
};

export const removeFromCart = (productId: string) => {
  cart = cart.filter(item => item.product.id !== productId);
  return [...cart];
};

export const updateCartQuantity = (productId: string, quantity: number) => {
  const item = cart.find(item => item.product.id === productId);
  if (item) {
    item.quantity = Math.max(0, quantity);
    if (item.quantity === 0) {
      return removeFromCart(productId);
    }
  }
  return [...cart];
};

export const getCartTotal = () => {
  return cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
};

export const getCartCount = () => {
  return cart.reduce((count, item) => count + item.quantity, 0);
};

export const clearCart = () => {
  cart = [];
  return [];
};