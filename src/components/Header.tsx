import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Menu, X, Heart, User, LogOut, Package, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCartCount, initializeCart } from '@/lib/store';
import { getWishlistCount, initializeWishlist } from '@/lib/wishlist';
import { isCustomerAuthenticated, customerLogout, customerFetch, getCurrentUser } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    initializeCart();
    initializeWishlist();
    const updateCounts = () => {
      const authenticated = isCustomerAuthenticated();
      setCartCount(getCartCount());
      setWishlistCount(getWishlistCount());
      setIsLoggedIn(authenticated);
      setIsProfileOpen(false);

      if (authenticated) {
        getCurrentUser().then(user => {
          customerFetch(`/users/${user.id}/notifications/`).then(res => {
            if (res.ok) {
              res.json().then((notifications: any[]) => {
                const unread = notifications.filter(n => !n.is_read).length;
                setUnreadNotificationsCount(unread);
              });
            }
          });
        }).catch(() => {});
      }
    };

    updateCounts();
    window.addEventListener('wishlist-updated', updateCounts);
    window.addEventListener('cart-updated', updateCounts);
    window.addEventListener('notifications-updated', updateCounts);

    return () => {
      window.removeEventListener('wishlist-updated', updateCounts);
      window.removeEventListener('cart-updated', updateCounts);
      window.removeEventListener('notifications-updated', updateCounts);
    };
  }, [location]);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Shop' },
    // { to: '/products?category=collars', label: 'Collars' },
    // { to: '/products?category=leashes', label: 'Leashes' },
    { to: '/about', label: 'Our Story' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? 'bg-background/98 backdrop-blur-sm border-b border-border' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto">
        {/* Top bar - subtle announcement */}
        {/* <div className="hidden md:flex items-center justify-center py-2 border-b border-border/50">
          <p className="text-xs tracking-luxury text-muted-foreground uppercase">
            Complimentary shipping on orders over CHF 150
          </p>
        </div> */}

        <div className="relative flex items-center justify-between h-16 md:h-20">
          {/* Left Section */}
          <div className="flex items-center justify-start">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>

            {/* Desktop Navigation - Left */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-xs tracking-luxury uppercase font-medium transition-colors hover:text-foreground ${
                    location.pathname === link.to ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Center Section - Logo */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Link to="/">
              <h1 className="text-2xl md:text-3xl font-display font-medium tracking-wide text-foreground">
                TAJDO
              </h1>
            </Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center justify-end">
            {/* Actions */}
            <div className="flex items-center gap-1">
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (isLoggedIn) {
                      setIsProfileOpen(!isProfileOpen);
                    } else {
                      navigate('/login');
                    }
                  }}
                >
                  <User className="w-4 h-4" />
                </Button>

                <AnimatePresence>
                  {isLoggedIn && isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full right-0 mt-2 w-56 bg-background border border-border shadow-lg p-2 z-50"
                    >
                      <div className="space-y-1">
                        <Link to="/account" className="flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors">
                          <User className="w-4 h-4 text-muted-foreground" />
                          My Profile
                        </Link>
                        <Link to="/account" className="flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors">
                          <Package className="w-4 h-4 text-muted-foreground" />
                          Orders
                        </Link>
                        <Link to="/account" className="flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors">
                          <div className="relative">
                            <Bell className="w-4 h-4 text-muted-foreground" />
                            {unreadNotificationsCount > 0 && (
                              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500" />
                            )}
                          </div>
                          Notifications
                        </Link>
                        <div className="h-px bg-border my-1" />
                        <button
                          onClick={() => {
                            customerLogout();
                            setIsLoggedIn(false);
                            setIsProfileOpen(false);
                            navigate('/');
                            toast({ title: "Logged out", description: "See you soon!" });
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link to="/wishlist">
                <Button variant="ghost" size="icon" className="relative">
                  <Heart className="w-4 h-4" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-foreground text-background text-[10px] font-medium flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </Button>
              </Link>
              
              <Link to="/cart">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingBag className="w-4 h-4" />
                  {cartCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-foreground text-background text-[10px] font-medium flex items-center justify-center"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-border bg-background"
            >
              <nav className="flex flex-col py-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`px-6 py-3 text-sm tracking-luxury uppercase font-medium transition-colors ${
                      location.pathname === link.to
                        ? 'text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;