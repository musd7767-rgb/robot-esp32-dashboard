import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Crown, Users } from 'lucide-react';

export default function RobotSelection() {
  const [, setLocation] = useLocation();

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
        className="w-full max-w-4xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div className="text-center mb-12" variants={itemVariants}>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-4">
            🤖 Robot Controller
          </h1>
          <p className="text-xl text-gray-400">
            اختر نوع الروبوت الذي تريد التحكم به
          </p>
        </motion.div>

        {/* Selection Cards */}
        <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-8" variants={itemVariants}>
          {/* Master Robot Card */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setLocation('/master')}
            className="cursor-pointer"
          >
            <Card className="p-8 bg-gradient-to-br from-cyan-900/20 to-cyan-800/10 border-cyan-500/50 hover:border-cyan-400 transition-all h-full">
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="p-4 bg-cyan-500/20 rounded-full">
                  <Crown className="w-16 h-16 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-cyan-400 mb-2">الروبوت القائد</h2>
                  <p className="text-gray-400 mb-4">Master Robot</p>
                  <p className="text-sm text-gray-500">
                    تحكم كامل في الروبوت الرئيسي مع مراقبة جميع البيانات والإحصائيات
                  </p>
                </div>
                <Button
                  onClick={() => setLocation('/master')}
                  className="w-full bg-cyan-600 hover:bg-cyan-700 text-white mt-4"
                >
                  اختر القائد
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Follower Robot Card */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setLocation('/follower')}
            className="cursor-pointer"
          >
            <Card className="p-8 bg-gradient-to-br from-purple-900/20 to-purple-800/10 border-purple-500/50 hover:border-purple-400 transition-all h-full">
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="p-4 bg-purple-500/20 rounded-full">
                  <Users className="w-16 h-16 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-purple-400 mb-2">الروبوت التابع</h2>
                  <p className="text-gray-400 mb-4">Follower Robot</p>
                  <p className="text-sm text-gray-500">
                    تحكم في الروبوت التابع مع مراقبة بيانات الأداء والاستهلاك
                  </p>
                </div>
                <Button
                  onClick={() => setLocation('/follower')}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white mt-4"
                >
                  اختر التابع
                </Button>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.div className="text-center mt-12 text-gray-500 text-sm" variants={itemVariants}>
          <p>اختر الروبوت المطلوب للبدء في التحكم والمراقبة</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
