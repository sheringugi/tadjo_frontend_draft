import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { adminFetch } from '@/lib/auth';

interface Return {
  id: string | number;
  customer_name?: string;
  order_id?: string | number;
  reason?: string;
  status?: string;
  created_at?: string;
}

const AdminReturns = () => {
  const [returns, setReturns] = useState<Return[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch('/admin/returns/')
      .then((res) => res.json())
      .then((data) => setReturns(Array.isArray(data) ? data : []))
      .catch(() => setReturns([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Returns</h1>
        <p className="text-sm text-slate-500">Customer return requests</p>
      </div>

      <Card className="border-slate-200">
        <CardContent className="pt-6">
          {loading ? (
            <p className="text-sm text-slate-500 py-8 text-center">Loading...</p>
          ) : returns.length === 0 ? (
            <p className="text-sm text-slate-500 py-8 text-center">No returns found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {returns.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">#{r.id}</TableCell>
                    <TableCell>{r.customer_name || '—'}</TableCell>
                    <TableCell>{r.order_id ? `#${r.order_id}` : '—'}</TableCell>
                    <TableCell className="max-w-xs truncate">{r.reason || '—'}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                        {r.status || 'pending'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-500">
                      {r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminReturns;
