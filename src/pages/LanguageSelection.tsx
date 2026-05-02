import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Languages } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function LanguageSelection() {
  const [, setLocation] = useLocation();
  const { setLanguage, t } = useLanguage();

  const handleSelect = (lang: 'ar' | 'en') => {
    setLanguage(lang);
    setLocation('/selection');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-2xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="text-center mb-12" variants={itemVariants}>
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-cyan-500/20 rounded-full">
              <Languages className="w-16 h-16 text-cyan-400" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-4">
            {t('lang.title')}
          </h1>
        </motion.div>

        <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6" variants={itemVariants}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSelect('ar')}
            className="cursor-pointer"
          >
            <Card className="p-8 bg-gradient-to-br from-cyan-900/20 to-cyan-800/10 border-cyan-500/50 hover:border-cyan-400 transition-all text-center">
              <span className="text-3xl font-bold text-cyan-400">العربية</span>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSelect('en')}
            className="cursor-pointer"
          >
            <Card className="p-8 bg-gradient-to-br from-purple-900/20 to-purple-800/10 border-purple-500/50 hover:border-purple-400 transition-all text-center">
              <span className="text-3xl font-bold text-purple-400">English</span>
            </Card>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
