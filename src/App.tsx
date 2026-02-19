import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CustomerLayout from './layouts/CustomerLayout';
import AdminLayout from './layouts/AdminLayout';
import Home from './pages/customer/Home';
import Login from './pages/customer/Login';
import Account from './pages/customer/Account';
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import AdminOrders from './pages/admin/Orders';
import OrderDetail from './pages/admin/OrderDetail';
import Complaints from './pages/admin/Complaints';
import AdminReturns from './pages/admin/Returns';
import AdminProducts from './pages/admin/Products';
import AdminProductForm from './pages/admin/ProductForm';
import AdminCategories from './pages/admin/Categories';
import AdminReviews from './pages/admin/Reviews';
import AdminContributions from './pages/admin/Contributions';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import ProtectedCustomerRoute from './components/ProtectedCustomerRoute';
import Products from './pages/customer/Products';
import AboutUs from './pages/customer/AboutUs';
import Contact from './pages/customer/Contact';
import Wishlist from './pages/customer/Wishlist';
import Cart from './pages/customer/Cart';
import ProductDetail from './pages/customer/ProductDetail';
import Checkout from './pages/customer/Checkout';
import Register from './pages/customer/Register';
import OrderConfirmation from './pages/customer/OrderConfirmation';
import Returns from './pages/customer/Returns';
import OrderTracking from './pages/customer/OrderTracking';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Customer Routes */}
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/products" element={<Products />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/returns" element={<Returns />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/track-order" element={<OrderTracking />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          

          
          {/* Protected Customer Routes */}
          <Route element={<ProtectedCustomerRoute />}>
            <Route path="/checkout" element={< Checkout/>} />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            <Route path="/account" element={<Account />} />
          </Route>
        </Route>

        {/* Admin Login */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected Admin Routes */}
        <Route element={<ProtectedAdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/new" element={<AdminProductForm />} />
            <Route path="products/:id" element={<AdminProductForm />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="contributions" element={<AdminContributions />} />
            <Route path="complaints" element={<Complaints />} />
            <Route path="returns" element={<AdminReturns />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
