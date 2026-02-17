import { useState, useEffect } from 'react';
import { HeartHandshake } from 'lucide-react';
import { adminFetch } from '@/lib/auth';

interface Contribution {
  id: string;
  amount: number;
  currency: string;
  created_at: string;
  order_id: string;
}

const AdminContributions = () => {
  const [contributions, setContributions] = useState<Contribution[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const res = await adminFetch('/admin/rescue-contributions/');
      if (res.ok) setContributions(await res.json());
    };
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-display flex items-center gap-3">
        <HeartHandshake className="w-8 h-8 text-primary" />
        Rescue Contributions
      </h1>

      <div className="bg-card border border-border overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-secondary text-muted-foreground font-medium">
            <tr>
              <th className="p-4">Date</th>
              <th className="p-4">Order ID</th>
              <th className="p-4 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {contributions.map((c) => (
              <tr key={c.id}>
                <td className="p-4 text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</td>
                <td className="p-4 font-mono text-xs">{c.order_id}</td>
                <td className="p-4 text-right font-medium text-green-600">
                  {c.currency} {Number(c.amount).toFixed(2)}
                </td>
              </tr>
            ))}
            {contributions.length === 0 && <tr><td colSpan={3} className="p-8 text-center text-muted-foreground">No contributions recorded yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminContributions;