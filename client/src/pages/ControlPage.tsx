import { useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export default function ControlPage() {
  const [, setLocation] = useLocation();
  const { t, language } = useLanguage();
  const isArabic = language === 'ar';

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 ${isArabic ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <motion.div
        className="border-b border-border bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 shadow-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">🎮 {t('control.title') || 'التحكم بالروبوتات'}</h1>
            <p className="text-pink-100 mt-1">{t('control.subtitle') || 'قيد التطوير'}</p>
          </div>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <Button
              onClick={() => setLocation('/selection')}
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-purple-600"
            >
              <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
              {isArabic ? 'رجوع' : 'Back'}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="container mx-auto p-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-12 bg-card border-border text-center">
            <div className="flex flex-col items-center justify-center gap-6">
              <div className="p-4 bg-purple-500/20 rounded-full">
                <AlertCircle className="w-16 h-16 text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-3">
                  {isArabic ? '🚧 قيد التطوير' : '🚧 Under Development'}
                </h2>
                <p className="text-slate-300 text-lg mb-6">
                  {isArabic
                    ? 'صفحة التحكم قيد التطوير حالياً. سيتم إضافة المزيد من الميزات قريباً.'
                    : 'The control page is currently under development. More features will be added soon.'}
                </p>
              </div>
              <Button
                onClick={() => setLocation('/selection')}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-3"
              >
                {isArabic ? '← العودة للخيارات' : 'Back to Options →'}
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
