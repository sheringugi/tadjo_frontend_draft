// TAJDO - Luxury Pet Accessories Store
import { customerFetch } from './auth';

export interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  image_url: string;
  category_id: string;
  rating: number;
  review_count: number;
  description: string;
  specifications: { spec: string }[];
  shipping_days: number;
  in_stock: boolean;
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

export const fetchProducts = async (): Promise<Product[]> => {
  const res = await customerFetch('/products/');
  if (!res.ok) throw new Error('Failed to fetch products');
  const data = await res.json();
  return data.map((p: any) => ({
    ...p,
    price: Number(p.price),
    original_price: p.original_price ? Number(p.original_price) : undefined,
    rating: p.rating ? Number(p.rating) : 0,
  }));
};

export const fetchProduct = async (id: string): Promise<Product> => {
  const res = await customerFetch(`/products/${id}`);
  if (!res.ok) throw new Error('Failed to fetch product');
  const data = await res.json();
  return {
    ...data,
    price: Number(data.price),
    original_price: data.original_price ? Number(data.original_price) : undefined,
    rating: data.rating ? Number(data.rating) : 0,
  };
};

// Simple cart state management
let cart: CartItem[] = [];

// Initialize from local storage for guests immediately
try {
  const localCart = localStorage.getItem('cart');
  if (localCart) {
    cart = JSON.parse(localCart);
  }
} catch (e) {
  console.error('Failed to parse cart from local storage');
}

export const getCart = () => cart;

export const initializeCart = async () => {
  const token = localStorage.getItem('access_token');
  if (token) {
    try {
      // Get user ID first
      const userRes = await customerFetch('/users/me/');
      
      if (userRes.ok) {
        const user = await userRes.json();
        const cartRes = await customerFetch(`/users/${user.id}/cart/items/`);

        if (cartRes.ok) {
          const backendItems = await cartRes.json();
          const newCart: CartItem[] = [];
          
          // Fetch full product details for each cart item
          for (const item of backendItems) {
            try {
              const product = await fetchProduct(item.product_id);
              newCart.push({ product, quantity: item.quantity });
            } catch (e) {
              console.error(`Failed to load product ${item.product_id}`);
            }
          }
          
          if (newCart.length > 0) {
            cart = newCart;
            localStorage.setItem('cart', JSON.stringify(cart));
            window.dispatchEvent(new Event('cart-updated'));
          }
        }
      }
    } catch (error) {
      console.error('Failed to sync cart with backend', error);
    }
  }
};

export const addToCart = async (product: Product, quantity: number = 1) => {
  const token = localStorage.getItem('access_token');

  const existingItem = cart.find(item => item.product.id === product.id);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({ product, quantity });
  }
  
  localStorage.setItem('cart', JSON.stringify(cart));
  window.dispatchEvent(new Event('cart-updated'));

  if (token) {
    try {
      await customerFetch('/cart/items/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: product.id,
          quantity: quantity
        })
      });
    } catch (e) {
      console.error('Failed to add to backend cart', e);
    }
  }

  return [...cart];
};

export const removeFromCart = async (productId: string) => {
  const token = localStorage.getItem('access_token');
  cart = cart.filter(item => item.product.id !== productId);
  localStorage.setItem('cart', JSON.stringify(cart));
  window.dispatchEvent(new Event('cart-updated'));

  if (token) {
    try {
      await customerFetch(`/cart/items/${productId}`, {
        method: 'DELETE',
      });
    } catch (e) {
      console.error('Failed to remove from backend cart', e);
    }
  }
  return [...cart];
};

export const updateCartQuantity = async (productId: string, quantity: number) => {
  const token = localStorage.getItem('access_token');
  const item = cart.find(item => item.product.id === productId);
  if (item) {
    const newQuantity = Math.max(0, quantity);
    if (newQuantity === 0) {
      return removeFromCart(productId);
    }
    item.quantity = newQuantity;
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cart-updated'));

    if (token) {
      try {
        await customerFetch(`/cart/items/${productId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ quantity: newQuantity })
        });
      } catch (e) {
        console.error('Failed to update backend cart', e);
      }
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
  localStorage.removeItem('cart');
  window.dispatchEvent(new Event('cart-updated'));
  return [];
};