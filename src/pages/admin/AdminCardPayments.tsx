import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, List, XCircle, DollarSign } from 'lucide-react';
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
  const [totalBalance, setTotalBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<CardTransaction[]>([]);
  const [showTransactions, setShowTransactions] = useState(false);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const { toast } = useToast();

  // Fetch total confirmed Card balance on component mount
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await adminFetch('/admin/payments/card/balance');
        const data = await res.json();
        setTotalBalance(data.total_confirmed_card_revenue);
      } catch (error: any) {
        console.error('Failed to fetch Card balance:', error);
        toast({
          title: 'Error',
          description: `Failed to load Card balance: ${error.message}`,
          variant: 'destructive',
        });
      } finally {
        setIsLoadingBalance(false);
      }
    };
    fetchBalance();
  }, [toast]);

  const handleViewTransactions = async () => {
    if (showTransactions) {
      setShowTransactions(false);
      return;
    }

    setIsLoadingTransactions(true);
    try {
      const res = await adminFetch('/admin/payments/card/transactions');
      if (res.ok) {
        const data = await res.json();
        setTransactions(Array.isArray(data) ? data : []);
        setShowTransactions(true);
      } else {
        throw new Error('Failed to fetch');
      }
    } catch (error: any) {
      console.error('Failed to fetch Card transactions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load card transactions.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingTransactions(false);
    }
  };

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
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Confirmed Card Revenue
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoadingBalance ? 'Loading...' : `CHF ${totalBalance?.toFixed(2) || '0.00'}`}
          </div>
          <p className="text-xs text-muted-foreground">
            Sum of all successfully confirmed card orders.
          </p>
        </CardContent>
      </Card>

      <Button
        onClick={handleViewTransactions}
        disabled={isLoadingTransactions}
        className="gap-2"
      >
        {showTransactions ? (
          <>
            <XCircle className="w-4 h-4" /> Hide Transactions
          </>
        ) : (
          <>
            <List className="w-4 h-4" /> {isLoadingTransactions ? 'Loading...' : 'View Transactions'}
          </>
        )}
      </Button>

      {showTransactions && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Card Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
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
      )}
    </motion.div>
  );
};

export default AdminCardPayments;