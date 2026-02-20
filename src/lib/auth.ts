// TAJDO - Authentication helpers

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

// Customer auth
export const getCustomerToken = (): string | null =>
  localStorage.getItem('access_token');

export const setCustomerToken = (token: string) =>
  localStorage.setItem('access_token', token);

export const clearCustomerToken = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user_role');
  window.dispatchEvent(new Event('cart-updated'));
  window.dispatchEvent(new Event('wishlist-updated'));
  window.dispatchEvent(new Event('notifications-updated'));
};

export const isCustomerAuthenticated = (): boolean =>
  !!getCustomerToken() && localStorage.getItem('user_role') === 'customer';

// Admin auth
export const getAdminToken = (): string | null =>
  localStorage.getItem('admin_token');

export const setAdminToken = (token: string) =>
  localStorage.setItem('admin_token', token);

export const clearAdminToken = () => {
  localStorage.removeItem('admin_token');
  localStorage.removeItem('user_role');
};

export const isAdminAuthenticated = (): boolean =>
  !!getAdminToken() && localStorage.getItem('user_role') === 'admin';

// API helpers
export const customerFetch = async (url: string, options: RequestInit = {}) => {
  const token = getCustomerToken();
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (response.status === 401) {
    if (window.location.pathname !== '/login') {
      customerLogout();
      window.location.href = '/login?session_expired=true';
    }
    throw new Error('Session expired');
  }

  return response;
};

export const adminFetch = async (url: string, options: RequestInit = {}) => {
  const token = getAdminToken();
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (response.status === 401) {
    if (window.location.pathname !== '/admin/login') {
      adminLogout();
      window.location.href = '/admin/login?session_expired=true';
    }
    throw new Error('Admin session expired');
  }

  return response;
};

// Customer login
export const customerLogin = async (email: string, password: string) => {
  const formData = new FormData();
  formData.append('username', email);
  formData.append('password', password);

  const res = await fetch(`${API_BASE}/token`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) throw new Error('Invalid credentials');

  const data = await res.json();
  setCustomerToken(data.access_token);
  localStorage.setItem('user_role', 'customer');
  return data;
};

// Customer register
export const customerRegister = async (userData: {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
}) => {
  const res = await fetch(`${API_BASE}/users/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: userData.email,
      password: userData.password,
      full_name: `${userData.first_name} ${userData.last_name}`,
      phone: userData.phone,
      locale: "en",
    }),
  });

  if (!res.ok) throw new Error('Registration failed');
  return res.json();
};

// Admin login
export const adminLogin = async (email: string, password: string) => {
  const formData = new FormData();
  formData.append('username', email);
  formData.append('password', password);

  const res = await fetch(`${API_BASE}/auth/admin/login`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) throw new Error('Invalid admin credentials');

  const data = await res.json();
  setAdminToken(data.access_token || data.token);
  localStorage.setItem('user_role', 'admin');
  return data;
};

// Get current user
export const getCurrentUser = async () => {
  const res = await customerFetch('/users/me/');
  if (!res.ok) throw new Error('Not authenticated');
  return res.json();
};

// Logout
export const customerLogout = () => {
  clearCustomerToken();
};

export const adminLogout = () => {
  clearAdminToken();
};
