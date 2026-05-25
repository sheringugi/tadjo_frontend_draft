import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowLeft, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const ForgotPassword = () => {
  const { t } = useTranslation('common');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) setSubmitted(true);
    } catch {
      toast({ title: 'Error', description: 'Failed to send reset link.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-24 md:pt-32 pb-24">
      <div className="container mx-auto max-w-md">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-4xl font-display text-foreground">{t('forgotPassword.heading')}</h1>
          <p className="text-muted-foreground mt-4">{t('forgotPassword.description')}</p>
        </motion.div>

        {!submitted ? (
          <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs text-muted-foreground">{t('forgotPassword.emailLabel')}</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-none" required />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-none h-12 text-xs tracking-luxury uppercase">
              {isLoading ? t('forgotPassword.buttonSending') : <><Send className="w-4 h-4 mr-2" /> {t('forgotPassword.buttonSend')}</>}
            </Button>
            <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" /> {t('forgotPassword.backToLogin')}
            </Link>
          </motion.form>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-6">
            <div className="p-4 bg-secondary/30 border border-border italic text-sm text-muted-foreground">
              {t('forgotPassword.successMessage', { email })}
            </div>
            <Link to="/login">
              <Button variant="outline" className="w-full rounded-none h-12 text-xs tracking-luxury uppercase">
                {t('forgotPassword.buttonReturn')}
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;