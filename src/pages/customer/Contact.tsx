import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Clock, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('');
  const [orderId, setOrderId] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      });
      return; // Stop the submission
    }

    setIsSubmitting(true);
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';
      const response = await fetch(`${apiUrl}/contact/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          topic,
          order_id: orderId,
          message,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      toast({ title: 'Message sent', description: "We'll get back to you within 24 hours." });
      setName('');
      setEmail('');
      setTopic('');
      setOrderId('');
      setMessage('');
    } catch (error) {
      toast({ title: 'Error', description: 'Could not send your message. Please try again.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-24 md:pt-32 pb-24">
      <div className="container mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
            {/* <p className="text-xs tracking-wide-luxury uppercase text-muted-foreground mb-4">Get in Touch</p> */}
            <h1 className="text-4xl md:text-5xl font-display text-muted-foreground mb-4">Contact Us</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Questions, concerns, or feedback — we'd love to hear from you.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12">
            {/* Contact info */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-8">
              {[
                { icon: Mail, label: 'Email', value: 'Info@tajdo.ch' },
                { icon: MapPin, label: 'Location', value: 'Luzern, Switzerland' },
                { icon: Clock, label: 'Response Time', value: 'Within 24 hours' },
              ].map(item => (
                <div key={item.label} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-luxury">{item.label}</p>
                    <p className="text-foreground font-medium">{item.value}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Contact form */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="md:col-span-2">
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

                <div className="space-y-2">
                  <Label htmlFor="topic" className="text-xs text-muted-foreground">Topic</Label>
                  <Select required value={topic} onValueChange={setTopic}>
                    <SelectTrigger className="rounded-none">
                      <SelectValue placeholder="Select a topic" />
                    </SelectTrigger>
                    <SelectContent className="rounded-none">
                      <SelectItem value="general">General Inquiry</SelectItem>
                      <SelectItem value="order">Order Question</SelectItem>
                      <SelectItem value="complaint">Complaint</SelectItem>
                      <SelectItem value="return">Return / Exchange</SelectItem>
                      <SelectItem value="partnership">Partnership</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="orderId" className="text-xs text-muted-foreground">Order ID (optional)</Label>
                  <Input id="orderId" placeholder="ORD-XXXXXX" value={orderId} onChange={(e) => setOrderId(e.target.value)} className="rounded-none" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-xs text-muted-foreground">Message</Label>
                  <Textarea id="message" rows={5} value={message} onChange={(e) => setMessage(e.target.value)} className="rounded-none resize-none" required />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-foreground text-background hover:bg-foreground/90 rounded-none text-xs tracking-luxury uppercase h-12 px-8"
                >
                  {isSubmitting ? 'Sending...' : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
    </div>
  );
};

export default Contact;
