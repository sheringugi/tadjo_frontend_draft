import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, List, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { adminFetch } from '@/lib/auth';

interface CardTransaction {
  id: string;
  order_number: string;
  customer_email: string;
  total: number;
  created_at: string;
  payment_intent_id: string;
  status: string;
}

const AdminCardPayments = () => {
  const [transactions, setTransactions] = useState<CardTransaction[]>([]);
  const [showTransactions, setShowTransactions] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await adminFetch('/admin/payments/card/transactions');
        if (res.ok) {
          const data = await res.json();
          setTransactions(Array.isArray(data) ? data : []);
        }
      } catch (error: any) {
        console.error('Failed to fetch Card transactions:', error);
        toast({
          title: 'Error',
          description: 'Failed to load card transactions.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchTransactions();
  }, [toast]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display text-foreground">Card Payments (Stripe)</h1>
        <div className="flex items-center gap-2 bg-secondary/30 px-4 py-2 rounded-none">
          <CreditCard className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Stripe Verified</span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground">Loading transactions...</p>
          ) : transactions.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No card transactions found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Number</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Stripe Intent ID</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="font-medium">{tx.order_number}</TableCell>
                    <TableCell>{tx.customer_email}</TableCell>
                    <TableCell>CHF {tx.total.toFixed(2)}</TableCell>
                    <TableCell>{new Date(tx.created_at).toLocaleString()}</TableCell>
                    <TableCell className="font-mono text-xs">
                      <a 
                        href={`https://dashboard.stripe.com/payments/${tx.payment_intent_id}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {tx.payment_intent_id}
                      </a>
                    </TableCell>
                    <TableCell>
                      <span className="capitalize px-2 py-1 rounded-none bg-secondary text-secondary-foreground text-xs">
                        {tx.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AdminCardPayments;