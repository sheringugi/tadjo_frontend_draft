import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { customerLogin } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const { t } = useTranslation('common');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  // Get the redirect path from location state or default to /account
  const from = location.state?.from?.pathname || '/account';

  useEffect(() => {
    // Check if we were redirected here because of an expired session
    if (searchParams.get('session_expired')) {
      toast({
        title: "Session Expired",
        description: "Your session has expired. Please log in again.",
        variant: "destructive",
      });
      
      // Optional: Clean up the URL so the toast doesn't show again on refresh
      navigate('/login', { replace: true });
    }
  }, [searchParams, toast, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await customerLogin(email, password);
      toast({ title: 'Welcome back!', description: 'Successfully signed in.' });
      navigate(from, { replace: true });
    } catch (error) {
      toast({ title: 'Login failed', description: 'Invalid email or password.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-24 md:pt-32 pb-24">
      <div className="container mx-auto max-w-md">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <p className="text-xs tracking-wide-luxury uppercase text-muted-foreground mb-4">{t('login.welcomeBack')}</p>
          <h1 className="text-4xl font-display text-foreground">{t('login.heading')}</h1>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs text-muted-foreground">{t('login.emailLabel')}</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-none" required />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between mb-1">
              <Label htmlFor="password" className="text-xs text-muted-foreground">{t('login.passwordLabel')}</Label>
              <Link to="/forgot-password" className="text-xs text-foreground/60 hover:text-foreground underline underline-offset-4 transition-colors">
                {t('login.forgotPassword')}
              </Link>
            </div>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-none" required />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-none h-12 text-xs tracking-luxury uppercase"
          >
            {isLoading ? t('login.signingIn') : (
              <>
                {t('login.buttonSignIn')}
                <ArrowRight className="ml-2 w-4 h-4" />
              </>
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {t('login.noAccount')}{' '}
            <Link to="/register" className="text-foreground underline underline-offset-4">
              {t('login.createAccount')}
            </Link>
          </p>
        </motion.form>
      </div>
    </div>
  );
};

export default Login;