import { motion } from 'framer-motion';
import { Heart, ExternalLink, Leaf, Globe, HandHeart, TrendingUp, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AboutUs = () => {
  return (
    <>
      {/* Hero */}
      <section className="pt-24 md:pt-32 pb-16">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-16"
            >
              {/* <p className="text-xs tracking-wide-luxury uppercase text-muted-foreground mb-4">
                Our Story
              </p> */}
              <h1 className="text-5xl md:text-6xl font-display font-normal text-muted-foreground mb-6 leading-tight">
                Our Story
                <br />
               
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Every TAJDO purchase supports the rescue and rehabilitation of street dogs in Zanzibar.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="aspect-[21/9] overflow-hidden mb-16"
            >
              <img
                src="https://le-cdn.website-editor.net/6ab80cd7b8b644baa0545c7019a6ba1b/dms3rep/multi/opt/Foto_016-1920w.jpg?m"
                alt="TAJDO Rescue dogs"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </section>

        {/* Mission */}
        <section className="py-16 md:py-20 bg-secondary/30">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-4xl font-display text-foreground mb-6">The Story of Tajana & Dollar</h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    TAJDO is a name born from a bond: a combination of <strong>Tajana</strong> and her dog, <strong>Dollar</strong>. An unbeatable team from Switzerland to Zanzibar, their story is the heart of our brand.
                  </p>
                  <p>
                    Raised in Switzerland, Tajana's love for animals led her to an animal shelter in Italy, where she found Dollar. For seven years, they were inseparable. A journey to Zanzibar changed everything. Feeling at home and moved by the plight of street dogs, Tajana dedicated her life to their cause.
                  </p>
                  <p>
                    TAJDO was born from this love—a desire to take on responsibility and make a meaningful difference. It's a promise to celebrate the connection we share with our companions by extending a hand to those still waiting for a home.
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
                    src="https://le-cdn.website-editor.net/6ab80cd7b8b644baa0545c7019a6ba1b/dms3rep/multi/opt/Foto_013-1920w.jpg?m"
                    alt="Tajana holding a rescued puppy"
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Detailed Mission */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <p className="text-xs tracking-wide-luxury uppercase text-muted-foreground mb-4">
                Together for each other
              </p>
              <h2 className="text-3xl md:text-4xl font-display text-foreground mb-4">
                Our Mission
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                TAJDO is more than just an organization – we are a community of people who are wholeheartedly and passionately committed to helping the street dogs of Zanzibar. Our goal is to enable every dog to live a safe, loving and healthy life.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="grid md:grid-cols-3 gap-8 md:gap-12"
            >
              {/* Mission Item 1 */}
              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-xl text-foreground mb-3">Maintenance & Care</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  Our main mission is to sustainably improve the welfare of street dogs. We ensure every animal has access to food, water, medical care, and a safe environment.
                </p>
              </div>
              {/* Mission Item 2 */}
              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-xl text-foreground mb-3">Development & Vision</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  We place dogs in loving homes and work with local vets for vaccinations, surgeries, and spaying/neutering to sustainably regulate the population.
                </p>
              </div>
              {/* Mission Item 3 */}
              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-xl text-foreground mb-3">Education & Enlightenment</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  We work to change cultural misconceptions about dogs, raising awareness of their needs and rights to promote harmonious coexistence within the community.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 md:py-20">
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
                    'Every purchase directly funds our rescue station in Zanzibar, providing food, medical care, shelter, and neutering programs for dogs in need.',
                },
                {
                  icon: Leaf,
                  title: 'Sustainable Craft',
                  description:
                    'We believe luxury and responsibility go hand-in-hand. We choose durable, high-quality materials and timeless designs that are made to last.',
                },
                {
                  icon: Globe,
                  title: 'Beautiful Quality, Global Heart',
                  description:
                    'Designed for your fluffy companion, handmade in Tanzania, and shipped worldwide. We combine precision with the warmth and soul of East African craftsmanship.',
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
        <section className="py-16 md:py-20 bg-foreground text-background">
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
