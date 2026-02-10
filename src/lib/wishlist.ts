// TAJDO - Wishlist (localStorage-backed)

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

export const isInWishlist = (productId: string): boolean =>
  wishlistIds.includes(productId);

export const toggleWishlist = (productId: string): boolean => {
  if (wishlistIds.includes(productId)) {
    wishlistIds = wishlistIds.filter(id => id !== productId);
    saveWishlist(wishlistIds);
    return false; // removed
  } else {
    wishlistIds = [...wishlistIds, productId];
    saveWishlist(wishlistIds);
    return true; // added
  }
};

export const removeFromWishlist = (productId: string) => {
  wishlistIds = wishlistIds.filter(id => id !== productId);
  saveWishlist(wishlistIds);
};

export const getWishlistCount = (): number => wishlistIds.length;
