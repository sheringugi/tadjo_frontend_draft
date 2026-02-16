import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layouts
import CustomerLayout from "./layouts/CustomerLayout";
import AdminLayout from "./layouts/AdminLayout";

// Route guards
import ProtectedCustomerRoute from "./components/ProtectedCustomerRoute";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";

// Customer pages
import Home from "./pages/customer/Home";
import Products from "./pages/customer/Products";
import ProductDetail from "./pages/customer/ProductDetail";
import Cart from "./pages/customer/Cart";
import Checkout from "./pages/customer/Checkout";
import OrderConfirmation from "./pages/customer/OrderConfirmation";
import AboutUs from "./pages/customer/AboutUs";
import Wishlist from "./pages/customer/Wishlist";
import Contact from "./pages/customer/Contact";
import Returns from "./pages/customer/Returns";
import Login from "./pages/customer/Login";
import Register from "./pages/customer/Register";
import Account from "./pages/customer/Account";

// Admin pages
import AdminLogin from "./pages/admin/AdminLogin";
import Dashboard from "./pages/admin/Dashboard";
import AdminOrders from "./pages/admin/Orders";
import OrderDetail from "./pages/admin/OrderDetail";
import Complaints from "./pages/admin/Complaints";
import AdminReturns from "./pages/admin/Returns";

// Other
import ERDDiagram from "./pages/ERDDiagram";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Customer routes with CustomerLayout */}
          <Route element={<CustomerLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/returns" element={<Returns />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected customer routes */}
            <Route element={<ProtectedCustomerRoute />}>
              <Route path="/cart" element={<Cart />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-confirmation" element={<OrderConfirmation />} />
              <Route path="/account" element={<Account />} />
            </Route>
          </Route>

          {/* Admin login (no layout) */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin routes with AdminLayout */}
          <Route element={<ProtectedAdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin/dashboard" element={<Dashboard />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/orders/:id" element={<OrderDetail />} />
              <Route path="/admin/complaints" element={<Complaints />} />
              <Route path="/admin/returns" element={<AdminReturns />} />
            </Route>
          </Route>

          {/* Utility */}
          <Route path="/erd" element={<ERDDiagram />} />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
