import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Footer = () => {
  const { pathname, search } = useLocation();
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';
        const res = await fetch(`${apiUrl}/categories/`);
        if (res.ok) {
          setCategories(await res.json());
        }
      } catch (e) {
        console.error('Failed to fetch categories for footer', e);
      }
    };
    fetchCategories();
  }, []);

  return (
    <footer className="bg-foreground text-background">
      {/* Newsletter Section */}
      <div className="border-b border-background/10">
        <div className="container mx-auto py-16">
          <div className="max-w-lg mx-auto text-center">
            <h3 className="text-2xl font-display mb-3">Join the TAJDO World</h3>
            <p className="text-sm text-background/60 mb-6">
              Be the first to discover new collections, exclusive offers, and stories from our atelier.
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Your email address"
                className="bg-transparent border-background/30 text-background placeholder:text-background/40 rounded-none focus-visible:ring-background/50"
              />
              <Button className="bg-background text-foreground hover:bg-background/90 rounded-none px-6 text-xs tracking-luxury uppercase">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <h2 className="text-2xl font-display tracking-wide">TAJDO</h2>
            </Link>
            <p className="text-sm text-background/60 leading-relaxed">
              Luxury with purpose. Timeless accessories for the modern companion.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-xs tracking-luxury uppercase mb-6">Shop</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/products" className="text-sm text-background/60 hover:text-background transition-colors">
                  All Products
                </Link>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link to={`/products?category=${cat.id}`} className="text-sm text-background/60 hover:text-background transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="text-xs tracking-luxury uppercase mb-6">About</h4>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-sm text-background/60 hover:text-background transition-colors">Our Story</Link></li>
              <li><a href="https://tajdo.ch" target="_blank" rel="noopener noreferrer" className="text-sm text-background/60 hover:text-background transition-colors">TAJDO Rescue</a></li>
              <li><Link to="/contact" className="text-sm text-background/60 hover:text-background transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-xs tracking-luxury uppercase mb-6">Help</h4>
            <ul className="space-y-3">
              <li><Link to="/returns" className="text-sm text-background/60 hover:text-background transition-colors">Returns & Exchanges</Link></li>
              <li><Link to="/contact" className="text-sm text-background/60 hover:text-background transition-colors">Contact</Link></li>
              <li><Link to="/wishlist" className="text-sm text-background/60 hover:text-background transition-colors">Wishlist</Link></li>
            </ul>
            <div className="flex items-center gap-2 mt-6 text-sm text-background/60">
              <Mail className="w-4 h-4" />
              Info@tajdo.ch
            </div>
          </div>
        </div>

        <div className="border-t border-background/10 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-background/40">
            © 2024 TAJDO. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/" className="text-xs text-background/40 hover:text-background/60 transition-colors">
              Privacy
            </Link>
            <Link to="/" className="text-xs text-background/40 hover:text-background/60 transition-colors">
              Terms
            </Link>
            <Link to="/" className="text-xs text-background/40 hover:text-background/60 transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;