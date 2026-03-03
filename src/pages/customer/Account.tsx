import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Package, LogOut, MapPin, Edit2, Save, X, Trash2, Bell, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getCurrentUser, customerFetch, customerLogout } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

interface Order {
  id: string;
  order_number: string;
  status: string;
  total: number;
  created_at?: string;
  items: any[];
}

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
}

interface Address {
  id: string;
  line1: string;
  city: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  type: string;
}

const Account = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
        setFormData({
          full_name: userData.full_name,
          email: userData.email,
          phone: userData.phone || ''
        });

        const ordersRes = await customerFetch(`/users/${userData.id}/orders/`);
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setOrders(ordersData);
        }

        const addressesRes = await customerFetch(`/users/${userData.id}/addresses/`);
        if (addressesRes.ok) {
          const addressesData = await addressesRes.json();
          setAddresses(addressesData);
        }

        const notificationsRes = await customerFetch(`/users/${userData.id}/notifications/`);
        if (notificationsRes.ok) {
          const notificationsData = await notificationsRes.json();
          setNotifications(notificationsData);
        }
      } catch (error) {
        console.error('Failed to load account data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleLogout = () => {
    customerLogout();
    window.dispatchEvent(new Event('cart-updated'));
    window.dispatchEvent(new Event('wishlist-updated'));
    toast({ title: "Logged out", description: "See you soon!" });
    navigate('/');
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    try {
      const res = await customerFetch(`/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        setIsEditing(false);
        toast({ title: "Profile updated", description: "Your information has been saved." });
      } else {
        throw new Error('Failed to update');
      }
    } catch (error) {
      toast({ title: "Update failed", description: "Could not update profile.", variant: "destructive" });
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      const res = await customerFetch(`/addresses/${addressId}`, { method: 'DELETE' });
      if (res.ok || res.status === 204) {
        setAddresses(prev => prev.filter(a => a.id !== addressId));
        toast({ title: "Address deleted" });
      }
    } catch (error) {
      toast({ title: "Delete failed", description: "Could not delete address.", variant: "destructive" });
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const res = await customerFetch(`/notifications/${notificationId}/read`, { method: 'PUT' });
      if (res.ok) {
        setNotifications(prev => prev.map(n => 
          n.id === notificationId ? { ...n, is_read: true } : n
        ));
        window.dispatchEvent(new Event('notifications-updated'));
      }
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  if (isLoading) {
    return (
      <div className="pt-32 pb-24 container mx-auto text-center">
        <p className="text-muted-foreground">Loading account...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="pt-24 md:pt-32 pb-24">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-display text-foreground mb-2">My Account</h1>
            <p className="text-muted-foreground">Welcome back, {user.full_name}</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="gap-2 w-full md:w-auto">
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </motion.div>

        <Tabs defaultValue="orders" className="space-y-8">
          <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-8">
            <TabsTrigger
              value="orders"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent px-0 pb-3 text-sm tracking-wide uppercase"
            >
              Order History
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent px-0 pb-3 text-sm tracking-wide uppercase"
            >
              Notifications
            </TabsTrigger>
            <TabsTrigger
              value="profile"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent px-0 pb-3 text-sm tracking-wide uppercase"
            >
              Profile Details
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            {orders.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-border">
                <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-medium mb-2">No orders yet</h3>
                <p className="text-muted-foreground mb-6">Start your collection today.</p>
                <Button onClick={() => navigate('/products')} className="rounded-none text-xs tracking-luxury uppercase">Browse Shop</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border border-border p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-medium text-foreground">{order.order_number}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide ${
                          // order.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          // order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          order.status === 'refunded' ? 'bg-orange-100 text-orange-800' :
                          'bg-secondary text-muted-foreground'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'Date N/A'} • {order.items?.length || 0} items
                      </p>
                    </div>
                    <div className="flex items-center gap-6">
                      <p className="font-medium">CHF {Number(order.total).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="notifications">
            {notifications.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-border">
                <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-medium mb-2">No notifications</h3>
                <p className="text-muted-foreground">You're all caught up.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`border p-6 flex items-start justify-between gap-4 transition-colors ${
                      notification.is_read ? 'border-border bg-background' : 'border-foreground/20 bg-secondary/10'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-medium ${notification.is_read ? 'text-muted-foreground' : 'text-foreground'}`}>
                          {notification.title}
                        </h4>
                        {!notification.is_read && <span className="w-2 h-2 rounded-full bg-primary"></span>}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                      <p className="text-xs text-muted-foreground/60">{new Date(notification.created_at).toLocaleDateString()}</p>
                    </div>
                    {!notification.is_read && (
                      <Button variant="ghost" size="icon" onClick={() => handleMarkAsRead(notification.id)} title="Mark as read">
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="profile">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="border border-border p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-muted-foreground" />
                    <h3 className="font-medium text-lg">Personal Information</h3>
                  </div>
                  {!isEditing ? (
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                        <X className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={handleUpdateProfile}>
                        <Save className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
                
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input 
                        id="full_name" 
                        value={formData.full_name} 
                        onChange={(e) => setFormData({...formData, full_name: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        value={formData.email} 
                        onChange={(e) => setFormData({...formData, email: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input 
                        id="phone" 
                        value={formData.phone} 
                        onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Full Name</p>
                      <p>{user.full_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Email</p>
                      <p>{user.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Phone</p>
                      <p>{user.phone || 'Not provided'}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="border border-border p-8">
                <div className="flex items-center gap-3 mb-6">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <h3 className="font-medium text-lg">Addresses</h3>
                </div>
                {addresses.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No addresses saved yet.</p>
                ) : (
                  <div className="space-y-6">
                    {addresses.map((addr) => (
                      <div key={addr.id} className="pb-4 border-b border-border last:border-0 last:pb-0 flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-sm">{addr.line1}</p>
                            {addr.is_default && (
                              <span className="text-[10px] bg-secondary px-2 py-0.5 rounded-full uppercase tracking-wide text-muted-foreground">Default</span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{addr.postal_code} {addr.city}</p>
                          <p className="text-sm text-muted-foreground">{addr.country}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteAddress(addr.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Account;