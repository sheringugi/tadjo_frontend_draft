import { motion } from 'framer-motion';
import { Heart, ExternalLink, Leaf, Globe, HandHeart } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AboutUs = () => {
  return (
    <>
      {/* Hero */}
      <section className="pt-20 md:pt-24 pb-24">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-16"
            >
              <p className="text-xs tracking-wide-luxury uppercase text-muted-foreground mb-4">
                Our Story
              </p>
              <h1 className="text-5xl md:text-6xl font-display font-normal text-foreground mb-6 leading-tight">
                Luxury with
                <br />
                <span className="italic">Purpose</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Every TAJDO purchase supports the rescue and rehabilitation of street dogs in Zanzibar.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="aspect-[21/9] overflow-hidden mb-24"
            >
              <img
                src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1400&h=600&fit=crop"
                alt="Dogs running on a beach"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </section>

        {/* Mission */}
        <section className="py-24 bg-secondary/30">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-4xl font-display text-foreground mb-6">
                  A Percentage of Every Purchase Goes to{' '}
                  <span className="italic">TAJDO Rescue</span>
                </h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    TAJDO was born from a simple belief: that the love we share with our
                    companions should extend to those still waiting for a home.
                  </p>
                  <p>
                    A percentage of every purchase goes directly to the TAJDO Rescue in
                    Zanzibar — a shelter dedicated to rescuing, rehabilitating, and rehoming
                    street dogs across the island.
                  </p>
                  <p>
                    When you choose TAJDO, you're not just buying a beautifully crafted
                    accessory — you're giving a dog in need a second chance.
                  </p>
                </div>
                <a
                  href="https://tajdo.ch"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 inline-block"
                >
                  <Button variant="outline" className="rounded-none text-xs tracking-luxury uppercase gap-2">
                    Visit TAJDO Rescue
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </a>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&h=750&fit=crop"
                    alt="Rescued dog in Zanzibar"
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-24">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <p className="text-xs tracking-wide-luxury uppercase text-muted-foreground mb-4">
                What We Stand For
              </p>
              <h2 className="text-3xl md:text-4xl font-display text-foreground">
                Our Values
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-12">
              {[
                {
                  icon: HandHeart,
                  title: 'Philanthropy First',
                  description:
                    'Every product sold contributes directly to the TAJDO Rescue in Zanzibar, funding shelter, medical care, and rehoming for street dogs.',
                },
                {
                  icon: Leaf,
                  title: 'Sustainable Craft',
                  description:
                    'We work with artisans in Tanzania and ethical suppliers to create products using sustainable materials — organic cotton, vegetable-tanned leather, and natural dyes.',
                },
                {
                  icon: Globe,
                  title: 'Swiss Quality, Global Heart',
                  description:
                    'Designed in Switzerland, handmade in Tanzania, and shipped worldwide. We combine Swiss precision with the warmth and soul of East African craftsmanship.',
                },
              ].map((value, i) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="w-14 h-14 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <value.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-display text-xl text-foreground mb-3">{value.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-foreground text-background">
          <div className="container mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Heart className="w-8 h-8 mx-auto mb-6 opacity-60" />
              <h2 className="text-3xl md:text-4xl font-display mb-6">
                Shop with Heart
              </h2>
              <p className="text-background/70 leading-relaxed mb-8 max-w-xl mx-auto">
                Browse our collection of luxury pet accessories and know that every
                purchase makes a difference.
              </p>
              <a href="/products">
                <Button
                  variant="outline"
                  className="rounded-none text-xs tracking-luxury uppercase border-background/30 text-background hover:bg-background hover:text-foreground"
                >
                  Shop the Collection
                </Button>
              </a>
            </motion.div>
          </div>
        </section>
    </>
  );
};

export default AboutUs;
