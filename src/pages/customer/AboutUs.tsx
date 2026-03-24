import { motion } from 'framer-motion';
import { useTranslation, Trans } from 'react-i18next';
import { Heart, ExternalLink, Leaf, Globe, HandHeart, TrendingUp, BookOpen, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AboutUs = () => {
  const { t } = useTranslation('common');

  const missions = [
    { icon: Heart, title: t('about.mission1Title'), description: t('about.mission1Desc') },
    { icon: TrendingUp, title: t('about.mission2Title'), description: t('about.mission2Desc') },
    { icon: BookOpen, title: t('about.mission3Title'), description: t('about.mission3Desc') },
  ];

  const values = [
    { icon: HandHeart, title: t('about.value1Title'), description: t('about.value1Desc') },
    { icon: Leaf, title: t('about.value2Title'), description: t('about.value2Desc') },
    { icon: Globe, title: t('about.value3Title'), description: t('about.value3Desc') },
  ];

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
              <h1 className="text-5xl md:text-6xl font-display font-normal text-foreground mb-6 leading-tight">
                {t('about.heroHeading')}
                <br />
               
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                {t('about.heroSubheading')}
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
                <h2 className="text-3xl md:text-4xl font-display text-foreground mb-6">{t('about.storyTitle')}</h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    <Trans i18nKey="about.storyText1" ns="common" components={{ 1: <strong className="text-foreground"/>, 3: <strong className="text-foreground"/> }} />
                  </p>	
                  <p>
                    {t('about.storyText2')}
                  </p>
                  <p>
                    <Trans i18nKey="about.storyText3" ns="common" components={{ 0: <strong className="text-foreground"/> }} />
                  </p>
                  <p>
                    <Trans i18nKey="about.storyText4" ns="common" components={{ 0: <strong className="text-foreground"/> }} />
                  </p>
                  <p className="font-semibold text-foreground">
                    <Trans i18nKey="about.storyText5" ns="common" components={{ 0: <em /> }} />
                  </p>

                </div>
                <a
                  href="https://tajdo-rescue.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 inline-block"
                >
                  <Button variant="outline" className="rounded-none text-xs tracking-luxury uppercase gap-2">
                    {t('about.buttonVisitRescue')}
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
                {t('about.missionSubheading')}
              </p>
              <h2 className="text-3xl md:text-4xl font-display text-foreground mb-4">
                {t('about.missionHeading')}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t('about.missionDescription')}
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="grid md:grid-cols-3 gap-8 md:gap-12"
            >
              {missions.map((mission, index) => (
                <div key={index} className="text-center">
                  <div className="w-14 h-14 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <mission.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-display text-xl text-foreground mb-3">{mission.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {mission.description}
                  </p>
                </div>
              ))}
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
                {t('about.valuesSubheading')}
              </p>
              <h2 className="text-3xl md:text-4xl font-display text-foreground">
                {t('about.valuesHeading')}
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-12">
              {values.map((value, i) => (
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
                {t('about.ctaHeading')}
              </h2>
              <p className="text-background/70 leading-relaxed mb-8 max-w-xl mx-auto">
                {t('about.ctaDescription')}
              </p>
              <a href="/products">
                <Button
                  variant="outline"
                  className="rounded-none text-xs tracking-luxury uppercase border-background/30 text-background hover:bg-background hover:text-foreground"
                >
                  {t('about.ctaButton')}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </a>
            </motion.div>
          </div>
        </section>
    </>
  );
};

export default AboutUs;
