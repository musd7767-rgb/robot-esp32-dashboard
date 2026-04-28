import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
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

  const updateData = async () => {
    if (!config.username || !config.key) return;
    
    setIsLoading(true);
    try {
      const [newMaster, newFollower] = await Promise.all([
        fetchRobotData(config, 'robot-master-data'),
        fetchRobotData(config, 'robot-follower-data'),
      ]);

      if (newMaster) setMasterData(newMaster);
      if (newFollower) setFollowerData(newFollower);

      if (newMaster || newFollower) {
        setLastUpdate(new Date());
        setError(null);
        
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
          return newHistory.slice(-20); // Keep last 20 points
        });
      } else {
        setError(isArabic ? 'لم يتم العثور على بيانات. تأكد من تشغيل السكريبت.' : 'No data found. Make sure the simulator is running.');
      }
    } catch (err) {
      setError(isArabic ? 'خطأ في الاتصال بـ Adafruit IO' : 'Error connecting to Adafruit IO');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (config.username && config.key) {
      updateData();
      const interval = setInterval(updateData, 5000); // Fetch every 5 seconds (Adafruit Free Tier safe)
      return () => clearInterval(interval);
    }
  }, [config]);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveAdafruitConfig(config);
    setShowSettings(false);
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
    <Card className="p-4 bg-slate-800/50 border-slate-700">
      <div className="flex items-center justify-between mb-2">
        <span className="text-slate-400 text-sm">{title}</span>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-white">{value}</span>
        <span className="text-slate-400 text-xs">{unit}</span>
      </div>
    </Card>
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
              <h1 className="text-xl font-bold">{t('information.title')}</h1>
              <p className="text-xs text-slate-400">
                {lastUpdate 
                  ? `${isArabic ? 'آخر تحديث:' : 'Last update:'} ${lastUpdate.toLocaleTimeString()}`
                  : (isArabic ? 'بانتظار البيانات...' : 'Waiting for data...')}
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
        {showSettings && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}>
            <Card className="p-6 bg-slate-800 border-blue-500/50 border-2">
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

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 p-4 rounded-lg flex items-center gap-3 text-red-200">
            <AlertTriangle className="w-5 h-5" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
        </div>

        {/* Charts Section */}
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
                <Line type="monotone" dataKey="masterPower" name={isArabic ? 'طاقة القائد (W)' : 'Master Power (W)'} stroke="#a855f7" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="followerPower" name={isArabic ? 'طاقة التابع (W)' : 'Follower Power (W)'} stroke="#ec4899" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 bg-slate-800/50 border-slate-700 h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                <Line type="monotone" dataKey="masterTemp" name={isArabic ? 'حرارة القائد' : 'Master Temp'} stroke="#f97316" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="followerTemp" name={isArabic ? 'حرارة التابع' : 'Follower Temp'} stroke="#f43f5e" strokeWidth={2} dot={false} />
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
                <Line type="monotone" dataKey="masterVoltage" name={isArabic ? 'جهد القائد' : 'Master Voltage'} stroke="#eab308" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="followerVoltage" name={isArabic ? 'جهد التابع' : 'Follower Voltage'} stroke="#84cc16" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </div>
  );
}
