import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { adminFetch } from '@/lib/auth';

interface Complaint {
  id: string | number;
  customer_name?: string;
  order_id?: string | number;
  issue?: string;
  status?: string;
  created_at?: string;
}

const Complaints = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch('/admin/complaints/')
      .then((res) => res.json())
      .then((data) => setComplaints(Array.isArray(data) ? data : []))
      .catch(() => setComplaints([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Complaints</h1>
        <p className="text-sm text-slate-500">Customer complaints and issues</p>
      </div>

      <Card className="border-slate-200">
        <CardContent className="pt-6">
          {loading ? (
            <p className="text-sm text-slate-500 py-8 text-center">Loading...</p>
          ) : complaints.length === 0 ? (
            <p className="text-sm text-slate-500 py-8 text-center">No complaints found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Issue</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {complaints.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">#{c.id}</TableCell>
                    <TableCell>{c.customer_name || '—'}</TableCell>
                    <TableCell>{c.order_id ? `#${c.order_id}` : '—'}</TableCell>
                    <TableCell className="max-w-xs truncate">{c.issue || '—'}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                        {c.status || 'open'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-500">
                      {c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}
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

export default Complaints;
