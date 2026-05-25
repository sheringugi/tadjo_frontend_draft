import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const ResetPassword = () => {
  const { t } = useTranslation('common');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const token = searchParams.get('token');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: t('resetPassword.toastErrorTitle'), description: t('resetPassword.toastErrorMismatch'), variant: 'destructive' });
      return;
    }
    if (!token) {
      toast({ title: t('resetPassword.toastErrorTitle'), description: t('resetPassword.toastErrorInvalidToken'), variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: password }),
      });

      if (res.ok) {
        toast({ title: t('resetPassword.toastSuccessTitle'), description: t('resetPassword.toastSuccess') });
        navigate('/login');
      } else {
        const data = await res.json();
        throw new Error(data.detail);
      }
    } catch (err: any) {
      toast({ title: t('resetPassword.toastErrorTitle'), description: err.message || t('resetPassword.toastErrorInvalidToken'), variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-24 md:pt-32 pb-24">
      <div className="container mx-auto max-w-md">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-4xl font-display text-foreground">{t('resetPassword.heading')}</h1>
          <p className="text-muted-foreground mt-4">{t('resetPassword.description')}</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="password">{t('resetPassword.newPasswordLabel')}</Label>
            <div className="relative">
              <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-none pr-10" required />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t('resetPassword.confirmPasswordLabel')}</Label>
            <div className="relative">
              <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="rounded-none pr-10" required />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <Button type="submit" disabled={isLoading} className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-none h-12 text-xs tracking-luxury uppercase">
            {isLoading ? t('resetPassword.buttonUpdating') : t('resetPassword.buttonUpdate')}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;