import { motion } from 'framer-motion';
import { RotateCcw, Shield, Clock, Mail } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const Returns = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-28 md:pt-36 pb-24">
        <div className="container mx-auto max-w-3xl">
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

          {/* Contact CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 text-center p-10 bg-secondary/30 border border-border"
          >
            <Mail className="w-6 h-6 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-display text-xl text-foreground mb-2">Still Need Help?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Our customer care team is here for you.
            </p>
            <a
              href="/contact"
              className="text-xs tracking-luxury uppercase font-medium text-foreground underline underline-offset-4"
            >
              Contact Us
            </a>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Returns;
