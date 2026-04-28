import { useState } from 'react';
import { useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BarChart3, Gamepad2 } from 'lucide-react';

export default function PageSelection() {
  const [, setLocation] = useLocation();
  const { t, language } = useLanguage();
  const isArabic = language === 'ar';

  const pages = [
    {
      id: 'information',
      titleKey: 'pageSelection.information.title',
      subtitleKey: 'pageSelection.information.subtitle',
      icon: BarChart3,
      color: 'from-cyan-500 to-blue-500',
      path: '/information',
      description: 'عرض معلومات الروبوتات',
    },
    {
      id: 'control',
      titleKey: 'pageSelection.control.title',
      subtitleKey: 'pageSelection.control.subtitle',
      icon: Gamepad2,
      color: 'from-purple-500 to-pink-500',
      path: '/control',
      description: 'التحكم في الروبوتات',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 ${isArabic ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white p-6 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">🤖 {t('pageSelection.title') || 'اختر الصفحة'}</h1>
            <p className="text-cyan-100 mt-1">{t('pageSelection.subtitle') || 'اختر ما تريد أن تفعله'}</p>
          </div>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <Button
              onClick={() => setLocation('/')}
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-blue-600"
            >
              {isArabic ? '← رجوع' : 'Back →'}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto p-6 max-w-4xl">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {pages.map((page) => {
            const IconComponent = page.icon;
            return (
              <motion.div key={page.id} variants={itemVariants as any}>
                <Card
                  className={`p-8 bg-gradient-to-br ${page.color} hover:shadow-2xl transition-all duration-300 cursor-pointer group border-0 h-full`}
                  onClick={() => setLocation(page.path)}
                >
                  <div className="flex flex-col items-center justify-center h-full gap-6">
                    <div className="p-4 bg-white/20 rounded-full group-hover:bg-white/30 transition-all duration-300">
                      <IconComponent className="w-12 h-12 text-white" />
                    </div>
                    <div className="text-center">
                      <h2 className="text-2xl font-bold text-white mb-2">
                        {t(page.titleKey) || page.titleKey}
                      </h2>
                      <p className="text-white/90 text-sm">
                        {t(page.subtitleKey) || page.subtitleKey}
                      </p>
                    </div>
                    <Button
                      className="w-full bg-white text-slate-900 hover:bg-white/90 font-semibold mt-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocation(page.path);
                      }}
                    >
                      {isArabic ? 'اذهب' : 'Go'}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
