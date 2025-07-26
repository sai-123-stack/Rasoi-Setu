import React from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Globe } from 'lucide-react';

const LanguageToggle: React.FC = () => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="fixed top-4 right-4 z-50 bg-card/80 backdrop-blur-sm hover:bg-card/90 transition-all duration-300"
    >
      <Globe className="w-4 h-4 mr-2" />
      {language === 'en' ? 'हिं' : 'EN'}
    </Button>
  );
};

export default LanguageToggle;