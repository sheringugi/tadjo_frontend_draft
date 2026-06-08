import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, List, XCircle } from 'lucide-react';
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

interface TwintTransaction {
  id: string;
  order_number: string;
  customer_email: string; // Assuming this is returned by the backend
  total: number;
  created_at: string;
  payment_intent_id: string; // TWINT Ref ID
  status: string;
}

const AdminTwintPayments = () => {
  const [totalBalance, setTotalBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<TwintTransaction[]>([]);
  const [showTransactions, setShowTransactions] = useState(false);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const { toast } = useToast();

  // Fetch total confirmed TWINT balance on component mount
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await adminFetch('/admin/payments/twint/balance');
        const data = await res.json();
        setTotalBalance(data.total_confirmed_twint_revenue);
      } catch (error: any) {
        console.error('Failed to fetch TWINT balance:', error);
        toast({
          title: 'Error',
          description: `Failed to load TWINT balance: ${error.message}`,
          variant: 'destructive',
        });
      } finally {
        setIsLoadingBalance(false);
      }
    };
    fetchBalance();
  }, [toast]);

  // Fetch transactions when "View Transactions" is clicked
  const handleViewTransactions = async () => {
    if (showTransactions) {
      setShowTransactions(false);
      return;
    }

    setIsLoadingTransactions(true);
    try {
      const res = await adminFetch('/admin/payments/twint/transactions');
      const data = await res.json();
      setTransactions(Array.isArray(data) ? data : []); // Ensure data is an array to prevent .map() error
      setShowTransactions(true);
    } catch (error: any) {
      console.error('Failed to fetch TWINT transactions:', error);
      toast({
        title: 'Error',
        description: `Failed to load TWINT transactions: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <h1 className="text-3xl font-display text-foreground">TWINT Payments Overview</h1>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Confirmed TWINT Revenue
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoadingBalance ? 'Loading...' : `CHF ${totalBalance?.toFixed(2) || '0.00'}`}
          </div>
          <p className="text-xs text-muted-foreground">
            Sum of all successfully confirmed TWINT orders.
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
          <h2 className="text-xl font-display text-foreground mb-4">Confirmed TWINT Transactions</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order Number</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>TWINT Ref ID</TableHead>
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
                  <TableCell className="font-mono text-xs">{tx.payment_intent_id}</TableCell>
                  <TableCell className="capitalize">{tx.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AdminTwintPayments;