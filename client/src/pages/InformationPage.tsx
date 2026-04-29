import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Activity,
  Battery,
  Thermometer,
  Zap,
  Cpu,
  RefreshCw,
  Settings,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { fetchRobotData, getAdafruitConfig, saveAdafruitConfig, RobotData } from '@/lib/adafruit';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function InformationPage() {
  const [, setLocation] = useLocation();
  const { t, language } = useLanguage();
  const isArabic = language === 'ar';

  const [config, setConfig] = useState(getAdafruitConfig());
  const [showSettings, setShowSettings] = useState(!config.username || !config.key);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // Use a ref to track if we should keep polling
  const shouldPoll = useRef(false);

  const [masterData, setMasterData] = useState<RobotData>({
    voltage: 0,
    current: 0,
    power: 0,
    temperature: 0,
    battery: 0,
    motor_status: 'offline',
    timestamp: '',
  });

  const [followerData, setFollowerData] = useState<RobotData>({
    voltage: 0,
    current: 0,
    power: 0,
    temperature: 0,
    battery: 0,
    motor_status: 'offline',
    timestamp: '',
  });

  const [history, setHistory] = useState<any[]>([]);

  const updateData = useCallback(async () => {
    // Stop if polling is disabled or config is missing
    if (!shouldPoll.current || !config.username || !config.key) return;
    
    setIsLoading(true);
    try {
      const [newMaster, newFollower] = await Promise.all([
        fetchRobotData(config, 'robot-master-data'),
        fetchRobotData(config, 'robot-follower-data'),
      ]);

      // If both fail, it's likely a connection/config issue
      if (!newMaster && !newFollower) {
        setError(isArabic ? 'فشل الاتصال: تأكد من صحة البيانات والـ Feeds' : 'Connection failed: Check credentials and Feeds');
        setIsConnected(false);
        shouldPoll.current = false; // Stop polling on error
        return;
      }

      if (newMaster) setMasterData(newMaster);
      if (newFollower) setFollowerData(newFollower);

      setLastUpdate(new Date());
      setError(null);
      setIsConnected(true);
      
      // Update history for charts
      const timestamp = new Date().toLocaleTimeString();
      setHistory((prev) => {
        const newHistory = [
          ...prev,
          {
            time: timestamp,
            masterPower: newMaster?.power || 0,
            followerPower: newFollower?.power || 0,
            masterTemp: newMaster?.temperature || 0,
            followerTemp: newFollower?.temperature || 0,
            masterVoltage: newMaster?.voltage || 0,
            followerVoltage: newFollower?.voltage || 0,
          },
        ];
        return newHistory.slice(-20);
      });
    } catch (err) {
      setError(isArabic ? 'خطأ غير متوقع في الاتصال' : 'Unexpected connection error');
      setIsConnected(false);
      shouldPoll.current = false;
    } finally {
      setIsLoading(false);
    }
  }, [config, isArabic]);

  useEffect(() => {
    if (config.username && config.key) {
      shouldPoll.current = true;
      updateData();
      const interval = setInterval(() => {
        if (shouldPoll.current) {
          updateData();
        }
      }, 5000);
      return () => clearInterval(interval);
    } else {
      setIsConnected(false);
      shouldPoll.current = false;
    }
  }, [config, updateData]);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveAdafruitConfig(config);
    setShowSettings(false);
    setError(null);
    shouldPoll.current = true; // Re-enable polling on save
    updateData();
  };

  const StatCard = ({
    title,
    value,
    unit,
    icon: Icon,
    color,
  }: {
    title: string;
    value: string | number;
    unit: string;
    icon: any;
    color: string;
  }) => (
    <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
      <div className="flex items-center justify-between mb-2">
        <span className="text-slate-400 text-sm">{title}</span>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-white tabular-nums">{value}</span>
        <span className="text-slate-400 text-xs">{unit}</span>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-slate-900 text-white ${isArabic ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation('/selection')}>
              <ArrowLeft className="w-6 h-6 rtl:rotate-180" />
            </Button>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                {t('information.title')}
                {isConnected && <CheckCircle2 className="w-4 h-4 text-green-500" />}
              </h1>
              <p className="text-xs text-slate-400">
                {lastUpdate 
                  ? `${isArabic ? 'آخر تحديث:' : 'Last update:'} ${lastUpdate.toLocaleTimeString()}`
                  : (isArabic ? 'بانتظار الاتصال...' : 'Waiting for connection...')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isLoading && <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />}
            <Button variant="ghost" size="icon" onClick={() => setShowSettings(!showSettings)}>
              <Settings className="w-5 h-5" />
            </Button>
            <LanguageToggle />
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4 space-y-6">
        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} 
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <Card className="p-6 bg-slate-800 border-blue-500/50 border-2 mb-4">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-400" />
                  {isArabic ? 'إعدادات Adafruit IO' : 'Adafruit IO Settings'}
                </h2>
                <form onSubmit={handleSaveConfig} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div className="space-y-2">
                    <Label>{isArabic ? 'اسم المستخدم' : 'Username'}</Label>
                    <Input 
                      value={config.username} 
                      onChange={e => setConfig({...config, username: e.target.value})}
                      className="bg-slate-700 border-slate-600"
                      placeholder="Kazuma_EXE"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{isArabic ? 'مفتاح API (AIO Key)' : 'AIO Key'}</Label>
                    <Input 
                      type="password"
                      value={config.key} 
                      onChange={e => setConfig({...config, key: e.target.value})}
                      className="bg-slate-700 border-slate-600"
                      placeholder="aio_..."
                    />
                  </div>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    {isArabic ? 'حفظ والاتصال' : 'Save & Connect'}
                  </Button>
                </form>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-500/20 border border-red-500/50 p-4 rounded-lg flex items-center justify-between gap-3 text-red-200"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5" />
              {error}
            </div>
            <Button size="sm" variant="outline" className="border-red-500/50 hover:bg-red-500/20" onClick={() => setShowSettings(true)}>
              {isArabic ? 'تعديل البيانات' : 'Edit Credentials'}
            </Button>
          </motion.div>
        )}

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Master Robot Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-2">
              <Cpu className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-bold">{isArabic ? 'الروبوت القائد (Master)' : 'Master Robot'}</h2>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${masterData.motor_status !== 'offline' ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                {masterData.motor_status.toUpperCase()}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard title={t('dashboard.voltage')} value={masterData.voltage} unit="V" icon={Zap} color="text-yellow-400" />
              <StatCard title={t('dashboard.current')} value={masterData.current} unit="A" icon={Activity} color="text-blue-400" />
              <StatCard title={t('dashboard.temp')} value={masterData.temperature} unit="°C" icon={Thermometer} color="text-orange-400" />
              <StatCard title={t('information.battery')} value={masterData.battery} unit="%" icon={Battery} color="text-green-400" />
            </div>
          </div>

          {/* Follower Robot Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-2">
              <Cpu className="w-5 h-5 text-pink-400" />
              <h2 className="text-lg font-bold">{isArabic ? 'الروبوت التابع (Follower)' : 'Follower Robot'}</h2>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${followerData.motor_status !== 'offline' ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                {followerData.motor_status.toUpperCase()}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard title={t('dashboard.voltage')} value={followerData.voltage} unit="V" icon={Zap} color="text-yellow-400" />
              <StatCard title={t('dashboard.current')} value={followerData.current} unit="A" icon={Activity} color="text-blue-400" />
              <StatCard title={t('dashboard.temp')} value={followerData.temperature} unit="°C" icon={Thermometer} color="text-orange-400" />
              <StatCard title={t('information.battery')} value={followerData.battery} unit="%" icon={Battery} color="text-green-400" />
            </div>
          </div>
        </motion.div>

        {/* Charts Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 bg-slate-800/50 border-slate-700">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              {t('information.charts')}
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ fontSize: '12px' }}
                  />
                  <Legend />
                  <Line isAnimationActive={false} type="monotone" dataKey="masterPower" name={isArabic ? 'طاقة القائد (W)' : 'Master Power (W)'} stroke="#a855f7" strokeWidth={2} dot={false} />
                  <Line isAnimationActive={false} type="monotone" dataKey="followerPower" name={isArabic ? 'طاقة التابع (W)' : 'Follower Power (W)'} stroke="#ec4899" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 bg-slate-800/50 border-slate-700 h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                <Line isAnimationActive={false} type="monotone" dataKey="masterTemp" name={isArabic ? 'حرارة القائد' : 'Master Temp'} stroke="#f97316" strokeWidth={2} dot={false} />
                <Line isAnimationActive={false} type="monotone" dataKey="followerTemp" name={isArabic ? 'حرارة التابع' : 'Follower Temp'} stroke="#f43f5e" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
          <Card className="p-6 bg-slate-800/50 border-slate-700 h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                <Line isAnimationActive={false} type="monotone" dataKey="masterVoltage" name={isArabic ? 'جهد القائد' : 'Master Voltage'} stroke="#eab308" strokeWidth={2} dot={false} />
                <Line isAnimationActive={false} type="monotone" dataKey="followerVoltage" name={isArabic ? 'جهد التابع' : 'Follower Voltage'} stroke="#84cc16" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </div>
  );
}
