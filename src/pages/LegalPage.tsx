import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

interface LegalPageProps {
  type: 'terms' | 'privacy' | 'refund';
}

const LegalPage = ({ type }: LegalPageProps) => {
  const { t } = useTranslation('common');

  const content = {
    title: t(`legal.${type}Title`),
    body: t(`legal.${type}Content`),
  };

  return (
    <div className="pt-32 pb-24 min-h-screen bg-background">
      <div className="container mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-[10px] tracking-luxury uppercase text-muted-foreground mb-4">
            {t('legal.lastUpdated')}
          </p>
          <h1 className="text-4xl md:text-5xl font-display mb-12 text-foreground">
            {content.title}
          </h1>
          <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none">
            <p className="text-base leading-relaxed text-muted-foreground whitespace-pre-wrap">
              {content.body}
            </p>
            {content.body.split('\n\n').map((paragraph, index) => (
              <p key={index} className="text-base leading-relaxed text-muted-foreground mb-4">
                {paragraph}
              </p>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LegalPage;