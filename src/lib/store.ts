// Mock data and store utilities for the e-commerce app

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
  badge?: 'bestseller' | 'new' | 'sale';
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  productCount: number;
}

export const categories: Category[] = [
  { id: 'electronics', name: 'Electronics', icon: '📱', productCount: 234 },
  { id: 'fashion', name: 'Fashion', icon: '👕', productCount: 567 },
  { id: 'home', name: 'Home & Garden', icon: '🏠', productCount: 189 },
  { id: 'sports', name: 'Sports', icon: '⚽', productCount: 145 },
  { id: 'beauty', name: 'Beauty', icon: '💄', productCount: 312 },
  { id: 'toys', name: 'Toys & Games', icon: '🎮', productCount: 98 },
];

export const products: Product[] = [
  {
    id: '1',
    name: 'Wireless Bluetooth Earbuds Pro',
    price: 49.99,
    originalPrice: 79.99,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop',
    category: 'electronics',
    rating: 4.8,
    reviews: 2341,
    description: 'Premium wireless earbuds with active noise cancellation, 30-hour battery life, and crystal-clear sound quality.',
    specifications: ['Active Noise Cancellation', '30-hour battery', 'IPX5 Water Resistant', 'Touch Controls'],
    shippingDays: 3,
    inStock: true,
    badge: 'bestseller',
  },
  {
    id: '2',
    name: 'Smart Fitness Watch Series X',
    price: 129.99,
    originalPrice: 199.99,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
    category: 'electronics',
    rating: 4.6,
    reviews: 1823,
    description: 'Advanced fitness tracking with heart rate monitoring, GPS, and 7-day battery life.',
    specifications: ['Heart Rate Monitor', 'Built-in GPS', '7-day battery', '50m Water Resistant'],
    shippingDays: 2,
    inStock: true,
    badge: 'sale',
  },
  {
    id: '3',
    name: 'Premium Cotton Hoodie',
    price: 39.99,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop',
    category: 'fashion',
    rating: 4.9,
    reviews: 892,
    description: 'Ultra-soft premium cotton hoodie with minimalist design. Perfect for everyday comfort.',
    specifications: ['100% Premium Cotton', 'Machine Washable', 'Unisex Fit', 'Available in 8 colors'],
    shippingDays: 4,
    inStock: true,
    badge: 'new',
  },
  {
    id: '4',
    name: 'Portable Power Bank 20000mAh',
    price: 34.99,
    image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&h=400&fit=crop',
    category: 'electronics',
    rating: 4.7,
    reviews: 3421,
    description: 'High-capacity power bank with fast charging support for all your devices.',
    specifications: ['20000mAh Capacity', 'Fast Charging', '3 USB Ports', 'LED Display'],
    shippingDays: 3,
    inStock: true,
  },
  {
    id: '5',
    name: 'Minimalist Desk Lamp',
    price: 59.99,
    originalPrice: 79.99,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=400&fit=crop',
    category: 'home',
    rating: 4.5,
    reviews: 567,
    description: 'Modern LED desk lamp with adjustable brightness and color temperature.',
    specifications: ['LED Light', 'Touch Control', '5 Brightness Levels', 'USB Charging Port'],
    shippingDays: 5,
    inStock: true,
  },
  {
    id: '6',
    name: 'Yoga Mat Premium Non-Slip',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=400&fit=crop',
    category: 'sports',
    rating: 4.8,
    reviews: 1234,
    description: 'Extra thick yoga mat with superior grip and cushioning for all types of exercise.',
    specifications: ['6mm Thickness', 'Non-Slip Surface', 'Eco-Friendly Material', 'Carrying Strap Included'],
    shippingDays: 3,
    inStock: true,
    badge: 'bestseller',
  },
  {
    id: '7',
    name: 'Skincare Gift Set',
    price: 79.99,
    originalPrice: 120.00,
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop',
    category: 'beauty',
    rating: 4.9,
    reviews: 2156,
    description: 'Complete skincare routine with cleanser, toner, serum, and moisturizer.',
    specifications: ['Natural Ingredients', 'For All Skin Types', 'Cruelty-Free', 'Travel-Size Bottles'],
    shippingDays: 2,
    inStock: true,
    badge: 'sale',
  },
  {
    id: '8',
    name: 'Wireless Gaming Mouse',
    price: 45.99,
    image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=400&fit=crop',
    category: 'electronics',
    rating: 4.7,
    reviews: 987,
    description: 'High-precision gaming mouse with RGB lighting and programmable buttons.',
    specifications: ['16000 DPI', 'RGB Lighting', '6 Programmable Buttons', '70-hour Battery'],
    shippingDays: 3,
    inStock: true,
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
