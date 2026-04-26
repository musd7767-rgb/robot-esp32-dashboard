import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Crown, Users, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageToggle } from '@/components/LanguageToggle';

export default function RobotSelection() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
        <Button 
          onClick={() => setLocation('/')}
          variant="ghost" 
          className="text-white hover:bg-white/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4 rtl:rotate-180" />
          {t('dashboard.back')}
        </Button>
        <LanguageToggle />
      </div>

      <motion.div
        className="w-full max-w-4xl relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div className="text-center mb-12" variants={itemVariants}>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-4">
            {t('selection.title')}
          </h1>
          <p className="text-xl text-gray-400">
            {t('selection.subtitle')}
          </p>
        </motion.div>

        {/* Selection Cards */}
        <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-8" variants={itemVariants}>
          {/* Master Robot Card */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setLocation('/master')}
            className="cursor-pointer group"
          >
            <Card className="p-8 bg-card/40 backdrop-blur-md border-cyan-500/30 group-hover:border-cyan-400 transition-all h-full shadow-xl shadow-cyan-500/5">
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="p-4 bg-cyan-500/20 rounded-full group-hover:bg-cyan-500/30 transition-colors">
                  <Crown className="w-16 h-16 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-cyan-400 mb-2">{t('selection.master.title')}</h2>
                  <p className="text-gray-400 mb-4 font-medium">{t('selection.master.subtitle')}</p>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {t('selection.master.desc')}
                  </p>
                </div>
                <Button
                  onClick={(e) => { e.stopPropagation(); setLocation('/master'); }}
                  className="w-full bg-cyan-600 hover:bg-cyan-700 text-white mt-4 shadow-lg shadow-cyan-600/20"
                >
                  {t('selection.master.button')}
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Follower Robot Card */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setLocation('/follower')}
            className="cursor-pointer group"
          >
            <Card className="p-8 bg-card/40 backdrop-blur-md border-purple-500/30 group-hover:border-purple-400 transition-all h-full shadow-xl shadow-purple-500/5">
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="p-4 bg-purple-500/20 rounded-full group-hover:bg-purple-500/30 transition-colors">
                  <Users className="w-16 h-16 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-purple-400 mb-2">{t('selection.follower.title')}</h2>
                  <p className="text-gray-400 mb-4 font-medium">{t('selection.follower.subtitle')}</p>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {t('selection.follower.desc')}
                  </p>
                </div>
                <Button
                  onClick={(e) => { e.stopPropagation(); setLocation('/follower'); }}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white mt-4 shadow-lg shadow-purple-600/20"
                >
                  {t('selection.follower.button')}
                </Button>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.div className="text-center mt-12 text-gray-500 text-sm" variants={itemVariants}>
          <p>{t('selection.footer')}</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
