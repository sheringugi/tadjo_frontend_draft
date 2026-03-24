import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'en', label: 'EN' },
    { code: 'de', label: 'DE' },
    
  ];

  return (
    <div className="flex gap-1">
      {languages.map(({ code, label }) => (
        <Button
          key={code}
          variant={i18n.resolvedLanguage === code ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => i18n.changeLanguage(code)}
        >
          {label}
        </Button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;