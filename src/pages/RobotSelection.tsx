import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Users, Zap, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageToggle } from '@/components/LanguageToggle';

export default function RobotSelection() {
  const [, setLocation] = useLocation();
  const { t, language } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);

  const robots = [
    {
      id: 'master',
      path: '/master',
      title: t('selection.master.title'),
      subtitle: t('selection.master.subtitle'),
      desc: t('selection.master.desc'),
      icon: Crown,
      color: 'cyan',
      buttonText: t('selection.master.button'),
    },
    {
      id: 'follower',
      path: '/slave',
      title: t('selection.follower.title'),
      subtitle: t('selection.follower.subtitle'),
      desc: t('selection.follower.desc'),
      icon: Users,
      color: 'purple',
      buttonText: t('selection.follower.button'),
    },
    {
      id: 'dual',
      path: '/dual',
      title: t('selection.dual.title'),
      subtitle: t('selection.dual.subtitle'),
      desc: t('selection.dual.desc'),
      icon: Zap,
      color: 'pink',
      buttonText: t('selection.dual.button'),
    },
  ];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % robots.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + robots.length) % robots.length);
  };

  const currentRobot = robots[currentIndex];
  const Icon = currentRobot.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-${currentRobot.color}-500/10 rounded-full blur-[120px] transition-colors duration-700`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-${currentRobot.color}-500/10 rounded-full blur-[120px] transition-colors duration-700`} />
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

      <div className="w-full max-w-4xl relative z-10 flex flex-col items-center">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1 
            key={`title-${language}`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-4"
          >
            {t('selection.title')}
          </motion.h1>
          <p className="text-xl text-gray-400">
            {t('selection.subtitle')}
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative w-full flex items-center justify-center gap-4 md:gap-8">
          {/* Left Arrow */}
          <Button
            onClick={prevSlide}
            variant="ghost"
            size="icon"
            className="rounded-full h-12 w-12 bg-white/5 hover:bg-white/10 text-white z-20"
          >
            <ChevronLeft className="h-8 w-8 rtl:rotate-180" />
          </Button>

          {/* Main Card */}
          <div className="flex-1 max-w-lg">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentRobot.id}
                initial={{ opacity: 0, scale: 0.9, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: -20 }}
                transition={{ duration: 0.4 }}
              >
                <Card 
                  onClick={() => setLocation(currentRobot.path)}
                  className={`p-8 bg-card/40 backdrop-blur-md border-${currentRobot.color}-500/30 hover:border-${currentRobot.color}-400 transition-all cursor-pointer shadow-2xl shadow-${currentRobot.color}-500/10`}
                >
                  <div className="flex flex-col items-center text-center space-y-6">
                    <motion.div 
                      initial={{ rotate: -10 }}
                      animate={{ rotate: 0 }}
                      className={`p-6 bg-${currentRobot.color}-500/20 rounded-2xl`}
                    >
                      <Icon className={`w-20 h-20 text-${currentRobot.color}-400`} />
                    </motion.div>
                    <div>
                      <h2 className={`text-4xl font-bold text-${currentRobot.color}-400 mb-2`}>{currentRobot.title}</h2>
                      <p className="text-gray-300 mb-4 font-medium text-lg">{currentRobot.subtitle}</p>
                      <p className="text-gray-400 leading-relaxed">
                        {currentRobot.desc}
                      </p>
                    </div>
                    <Button
                      onClick={(e) => { e.stopPropagation(); setLocation(currentRobot.path); }}
                      className={`w-full py-6 text-lg bg-${currentRobot.color}-600 hover:bg-${currentRobot.color}-700 text-white shadow-lg shadow-${currentRobot.color}-600/20`}
                    >
                      {currentRobot.buttonText}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Arrow */}
          <Button
            onClick={nextSlide}
            variant="ghost"
            size="icon"
            className="rounded-full h-12 w-12 bg-white/5 hover:bg-white/10 text-white z-20"
          >
            <ChevronRight className="h-8 w-8 rtl:rotate-180" />
          </Button>
        </div>

        {/* Indicators */}
        <div className="flex gap-2 mt-8">
          {robots.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex ? `w-8 bg-${currentRobot.color}-500` : 'w-2 bg-gray-600'
              }`}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>{t('selection.footer')}</p>
        </div>
      </div>
    </div>
  );
}
