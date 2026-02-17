// TAJDO - Wishlist (localStorage-backed)

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
const STORAGE_KEY = 'tajdo_wishlist';

const loadWishlist = (): string[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveWishlist = (ids: string[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
};

let wishlistIds: string[] = loadWishlist();

export const getWishlist = (): string[] => [...wishlistIds];

export const initializeWishlist = async () => {
  const token = localStorage.getItem('access_token');
  if (token) {
    try {
      const userRes = await fetch(`${API_BASE}/users/me/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (userRes.ok) {
        const user = await userRes.json();
        const wishlistRes = await fetch(`${API_BASE}/users/${user.id}/wishlist/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (wishlistRes.ok) {
          const products = await wishlistRes.json();
          wishlistIds = products.map((p: any) => p.id);
          saveWishlist(wishlistIds);
          window.dispatchEvent(new Event('wishlist-updated'));
        }
      }
    } catch (error) {
      console.error('Failed to sync wishlist', error);
    }
  }
};

export const isInWishlist = (productId: string): boolean =>
  wishlistIds.includes(productId);

export const toggleWishlist = async (productId: string): Promise<boolean> => {
  const token = localStorage.getItem('access_token');
  let added = false;

  if (wishlistIds.includes(productId)) {
    wishlistIds = wishlistIds.filter(id => id !== productId);
    saveWishlist(wishlistIds);
    added = false; // removed

    if (token) {
      try {
        await fetch(`${API_BASE}/wishlists/`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ product_id: productId })
        });
      } catch (e) { console.error(e); }
    }
  } else {
    wishlistIds = [...wishlistIds, productId];
    saveWishlist(wishlistIds);
    added = true; // added

    if (token) {
      try {
        await fetch(`${API_BASE}/wishlists/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ product_id: productId })
        });
      } catch (e) { console.error(e); }
    }
  }
  window.dispatchEvent(new Event('wishlist-updated'));
  return added;
};

export const removeFromWishlist = async (productId: string) => {
  const token = localStorage.getItem('access_token');
  wishlistIds = wishlistIds.filter(id => id !== productId);
  saveWishlist(wishlistIds);
  window.dispatchEvent(new Event('wishlist-updated'));

  if (token) {
    try {
      await fetch(`${API_BASE}/wishlists/`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ product_id: productId })
      });
    } catch (e) { console.error(e); }
  }
};

export const getWishlistCount = (): number => wishlistIds.length;
