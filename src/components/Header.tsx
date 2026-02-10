import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Menu, X, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCartCount } from '@/lib/store';
import { getWishlistCount } from '@/lib/wishlist';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setCartCount(getCartCount());
  }, [location]);

  const navLinks = [
    { to: '/products', label: 'Shop' },
    { to: '/products?category=collars', label: 'Collars' },
    { to: '/products?category=leashes', label: 'Leashes' },
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
        <div className="hidden md:flex items-center justify-center py-2 border-b border-border/50">
          <p className="text-xs tracking-luxury text-muted-foreground uppercase">
            Complimentary shipping on orders over CHF 150
          </p>
        </div>

        <div className="flex items-center justify-between h-16 md:h-20">
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
            {navLinks.slice(0, 3).map((link) => (
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

          {/* Logo - Center */}
          <Link to="/" className="absolute left-1/2 -translate-x-1/2">
            <h1 className="text-2xl md:text-3xl font-display font-medium tracking-wide text-foreground">
              TAJDO
            </h1>
          </Link>

          {/* Desktop Navigation - Right */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.slice(3).map((link) => (
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

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Link to="/wishlist">
              <Button variant="ghost" size="icon" className="relative">
                <Heart className="w-4 h-4" />
                {getWishlistCount() > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-foreground text-background text-[10px] font-medium flex items-center justify-center">
                    {getWishlistCount()}
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