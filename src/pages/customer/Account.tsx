import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Package, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCurrentUser, customerLogout } from '@/lib/auth';

const Account = () => {
  const [user, setUser] = useState<{ email?: string; first_name?: string; last_name?: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser({ email: 'user@tajdo.ch', first_name: 'TAJDO', last_name: 'Customer' }));
  }, []);

  const handleLogout = () => {
    customerLogout();
    navigate('/');
  };

  return (
    <div className="pt-28 md:pt-36 pb-24">
      <div className="container mx-auto max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <p className="text-xs tracking-wide-luxury uppercase text-muted-foreground mb-4">My Account</p>
          <h1 className="text-4xl font-display text-foreground">Account</h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {/* Profile card */}
          <div className="border border-border p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center">
                <User className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <h2 className="font-display text-xl text-foreground">
                  {user?.first_name} {user?.last_name}
                </h2>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div className="grid sm:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/wishlist')}
              className="border border-border p-6 text-left hover:border-foreground transition-colors"
            >
              <Package className="w-5 h-5 text-muted-foreground mb-3" />
              <h3 className="font-display text-foreground mb-1">My Wishlist</h3>
              <p className="text-xs text-muted-foreground">View saved items</p>
            </button>

            <button
              onClick={() => navigate('/cart')}
              className="border border-border p-6 text-left hover:border-foreground transition-colors"
            >
              <Package className="w-5 h-5 text-muted-foreground mb-3" />
              <h3 className="font-display text-foreground mb-1">My Bag</h3>
              <p className="text-xs text-muted-foreground">View your shopping bag</p>
            </button>
          </div>

          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full rounded-none text-xs tracking-luxury uppercase"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default Account;
