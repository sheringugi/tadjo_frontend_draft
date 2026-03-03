import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Shield, Clock, Send } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getCurrentUser, isCustomerAuthenticated } from '@/lib/auth';

const Returns = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isCustomerAuthenticated()) {
      getCurrentUser().then((user) => {
        setName(user.full_name);
        setEmail(user.email);
      }).catch(() => {
        // Silent fail if user fetch fails, user can fill manually
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';
      // Using the contact endpoint for now as it handles general inquiries including returns
      const response = await fetch(`${apiUrl}/contact/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          topic: 'return',
          order_id: orderNumber,
          message: `Reason: ${reason}\n\n${message}`,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit return request');

      toast({ title: 'Request Submitted', description: "We'll email you a return label shortly." });
      setName(''); setEmail(''); setOrderNumber(''); setReason(''); setMessage('');
    } catch (error) {
      toast({ title: 'Error', description: 'Could not submit request. Please try again.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-24 md:pt-32 pb-24">
      <div className="container mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <p className="text-xs tracking-wide-luxury uppercase text-muted-foreground mb-4">Customer Care</p>
            <h1 className="text-4xl md:text-5xl font-display text-foreground mb-4">Returns & Exchanges</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              We want you and your companion to be completely satisfied.
            </p>
          </motion.div>

          {/* Highlights */}
          <div className="grid sm:grid-cols-3 gap-6 mb-16">
            {[
              { icon: Clock, title: '30 Days', desc: 'Return window from delivery' },
              { icon: RotateCcw, title: 'Free Returns', desc: 'On all unused items' },
              { icon: Shield, title: 'Quality Guarantee', desc: 'Craftsmanship warranty' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="text-center p-6 border border-border"
              >
                <item.icon className="w-6 h-6 mx-auto mb-3 text-primary" />
                <h3 className="font-display text-foreground mb-1">{item.title}</h3>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* FAQ */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="text-xs tracking-luxury uppercase font-medium text-foreground mb-6">
              Frequently Asked Questions
            </h2>

            <Accordion type="single" collapsible className="space-y-2">
              {[
                {
                  q: 'How do I initiate a return?',
                  a: 'Email us at returns@tajdo.ch with your order number and reason for return. We\'ll send you a prepaid return label within 24 hours.',
                },
                {
                  q: 'What items are eligible for return?',
                  a: 'All unused items in their original packaging can be returned within 30 days of delivery. Personalized or custom items are final sale.',
                },
                {
                  q: 'How long does a refund take?',
                  a: 'Refunds are processed within 5–7 business days after we receive the returned item. The amount will be credited to your original payment method.',
                },
                {
                  q: 'Can I exchange an item?',
                  a: 'Yes! Contact us and we\'ll arrange an exchange. If the new item has a different price, we\'ll adjust accordingly.',
                },
                {
                  q: 'What if my item arrived damaged?',
                  a: 'We\'re sorry! Please email us with photos of the damage within 48 hours of delivery. We\'ll send a replacement immediately at no cost.',
                },
                {
                  q: 'Do handmade items have a warranty?',
                  a: 'All handmade items from our Tanzanian artisans carry a 6-month craftsmanship warranty covering material defects and stitching.',
                },
              ].map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="border border-border px-6">
                  <AccordionTrigger className="text-sm text-foreground hover:no-underline">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>

          {/* Return Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 max-w-2xl mx-auto"
          >
            <div className="text-center mb-10">
              <h2 className="text-3xl font-display text-foreground mb-4">Start a Return</h2>
              <p className="text-muted-foreground">
                Enter your details below to request a return label.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs text-muted-foreground">Full Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="rounded-none" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs text-muted-foreground">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-none" required />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="orderNumber" className="text-xs text-muted-foreground">Order Number</Label>
                  <Input id="orderNumber" placeholder="ORD-XXXXXX" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} className="rounded-none" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason" className="text-xs text-muted-foreground">Reason</Label>
                  <Select value={reason} onValueChange={setReason} required>
                    <SelectTrigger className="rounded-none"><SelectValue placeholder="Select reason" /></SelectTrigger>
                    <SelectContent className="rounded-none">
                      <SelectItem value="size">Wrong Size</SelectItem>
                      <SelectItem value="damaged">Damaged / Defective</SelectItem>
                      <SelectItem value="incorrect">Incorrect Item</SelectItem>
                      <SelectItem value="changed_mind">Changed Mind</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-xs text-muted-foreground">Additional Comments</Label>
                <Textarea id="message" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} className="rounded-none resize-none" />
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-none h-12 text-xs tracking-luxury uppercase">
                {isSubmitting ? 'Submitting...' : <><Send className="w-4 h-4 mr-2" /> Request Return Label</>}
              </Button>
            </form>
          </motion.div>
        </div>
    </div>
  );
};

export default Returns;
