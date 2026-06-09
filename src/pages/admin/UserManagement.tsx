import { useState, useEffect } from 'react';
import { User, Crown } from 'lucide-react'; // Assuming lucide-react is available for icons
import { adminFetch } from '@/lib/auth'; // Assuming adminFetch handles auth headers
import { toast } from 'sonner'; // Assuming sonner for toasts

interface AppUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

const UserManagement = () => {
  const [allUsers, setAllUsers] = useState<AppUser[]>([]);
  const [adminUsers, setAdminUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [promotingUserId, setPromotingUserId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const allUsersRes = await adminFetch('/admin/users/');
      const adminUsersRes = await adminFetch('/admin/users/admins');

      if (allUsersRes.ok) {
        setAllUsers(await allUsersRes.json());
      } else {
        toast.error('Failed to fetch all users.');
      }

      if (adminUsersRes.ok) {
        setAdminUsers(await adminUsersRes.json());
      } else {
        toast.error('Failed to fetch admin users.');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('An error occurred while fetching user data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handlePromoteUser = async (user: AppUser) => {
    if (user.role === 'admin') {
      toast.info(`${user.full_name} is already an admin.`);
      return;
    }

    setPromotingUserId(user.id);
    const confirmed = window.confirm(`Are you sure you want to promote ${user.full_name} (${user.email}) to admin?`);
    setPromotingUserId(null);

    if (!confirmed) {
      return;
    }

    try {
      const res = await adminFetch('/admin/users/promote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: user.email }),
      });

      if (res.ok) {
        toast.success(`${user.full_name} has been promoted to admin.`);
        fetchUsers(); // Re-fetch to update lists
      } else {
        const errorData = await res.json();
        toast.error(`Failed to promote user: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error promoting user:', error);
      toast.error('An error occurred while promoting the user.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-display flex items-center gap-3">
          <User className="w-8 h-8 text-primary" />
          User Management
        </h1>
        <p>Loading user data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-display flex items-center gap-3">
        <User className="w-8 h-8 text-primary" />
        User Management
      </h1>

      <section className="space-y-4">
        <h2 className="text-2xl font-display flex items-center gap-2">
          <Crown className="w-6 h-6 text-yellow-500" />
          Current Administrators
        </h2>
        <div className="bg-card border border-border overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary text-muted-foreground font-medium">
              <tr>
                <th className="p-4">Full Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {adminUsers.length > 0 ? (
                adminUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="p-4">{user.full_name}</td>
                    <td className="p-4 font-mono text-xs">{user.email}</td>
                    <td className="p-4 text-muted-foreground">{new Date(user.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-muted-foreground">
                    No administrators found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-display">All Users</h2>
        <div className="bg-card border border-border overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary text-muted-foreground font-medium">
              <tr>
                <th className="p-4">Full Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {allUsers.length > 0 ? (
                allUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="p-4">{user.full_name}</td>
                    <td className="p-4 font-mono text-xs">{user.email}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => handlePromoteUser(user)}
                          disabled={promotingUserId === user.id}
                          className="px-3 py-1 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {promotingUserId === user.id ? 'Promoting...' : 'Promote to Admin'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default UserManagement;