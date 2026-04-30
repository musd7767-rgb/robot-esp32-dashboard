import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  Database,
  ShieldCheck,
  History,
  TrendingUp,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { fetchRobotData, getAdafruitConfig, saveAdafruitConfig, RobotData } from '@/lib/adafruit';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

export default function InformationPage() {
  const [, setLocation] = useLocation();
  const { t, language } = useLanguage();
  const isArabic = language === 'ar';

  const initialConfig = getAdafruitConfig();
  const [config, setConfig] = useState(initialConfig);
  const [rememberMe, setRememberMe] = useState(!!(initialConfig.username && initialConfig.key));
  const [isConnected, setIsConnected] = useState(!!(initialConfig.username && initialConfig.key));
  
  const [showSettings, setShowSettings] = useState(!initialConfig.username || !initialConfig.key);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const shouldPoll = useRef(isConnected);

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

  // Pre-fill history with empty points to avoid "centered" look when empty
  const initialHistory = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      time: '',
      masterPower: 0,
      followerPower: 0,
      masterTemp: 0,
      followerTemp: 0,
      masterVoltage: 0,
      followerVoltage: 0,
      isEmpty: true
    }));
  }, []);

  const [history, setHistory] = useState<any[]>(initialHistory);

  const updateData = useCallback(async (currentConfig = config) => {
    if (!shouldPoll.current || !currentConfig.username || !currentConfig.key) return;
    
    setIsLoading(true);
    try {
      const [newMaster, newFollower] = await Promise.all([
        fetchRobotData(currentConfig, 'robot-master-data'),
        fetchRobotData(currentConfig, 'robot-follower-data'),
      ]);

      if (!newMaster && !newFollower) {
        setError(isArabic ? 'فشل الاتصال: تأكد من صحة البيانات والـ Feeds' : 'Connection failed: Check credentials and Feeds');
        setIsConnected(false);
        shouldPoll.current = false;
        return;
      }

      if (newMaster) setMasterData(newMaster);
      if (newFollower) setFollowerData(newFollower);

      setLastUpdate(new Date());
      setError(null);
      setIsConnected(true);
      
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setHistory((prev) => {
        // Filter out the initial empty points once we have real data
        const filteredPrev = prev.filter(p => !p.isEmpty);
        const newHistory = [
          ...filteredPrev,
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
        return newHistory.slice(-15);
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
    if (isConnected) {
      shouldPoll.current = true;
      updateData();
      const interval = setInterval(() => {
        if (shouldPoll.current) {
          updateData();
        }
      }, 5000);
      return () => clearInterval(interval);
    } else {
      shouldPoll.current = false;
    }
  }, [isConnected, updateData]);

  const handleSaveAndConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!config.username || !config.key) {
      setError(isArabic ? 'يرجى إدخال اسم المستخدم والمفتاح' : 'Please enter username and key');
      return;
    }
    if (rememberMe) {
      saveAdafruitConfig(config);
    } else {
      localStorage.removeItem('adafruit_config');
    }
    setError(null);
    setIsConnected(true);
    setShowSettings(false);
    shouldPoll.current = true;
    updateData(config);
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
    <div className="p-4 bg-slate-900/40 backdrop-blur-md border border-slate-800 hover:border-blue-500/30 transition-all duration-300 group rounded-xl">
      <div className="flex items-center justify-between mb-2">
        <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">{title}</span>
        <div className={cn("p-2 rounded-lg bg-slate-800 group-hover:scale-110 transition-transform duration-300", color.replace('text-', 'bg-').replace('400', '500/10'))}>
          <Icon className={cn("w-4 h-4", color)} />
        </div>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-white tabular-nums">{value}</span>
        <span className="text-slate-500 text-xs font-medium">{unit}</span>
      </div>
    </div>
  );

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length && label) {
      return (
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 p-3 rounded-lg shadow-xl">
          <p className="text-slate-400 text-xs mb-2 font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-slate-300">{entry.name}:</span>
              <span className="text-white font-bold">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={cn("min-h-screen bg-[#0B0F1A] text-slate-200 selection:bg-blue-500/30", isArabic ? 'font-tajawal rtl' : 'font-inter ltr')}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[120px]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-slate-800/50 bg-[#0B0F1A]/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation('/selection')} className="hover:bg-slate-800 text-slate-400 hover:text-white">
              <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
            </Button>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent flex items-center gap-2">
                {t('information.title')}
                {isConnected && <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
              </h1>
              <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-tighter">
                <History className="w-3 h-3" />
                {lastUpdate ? `${isArabic ? 'تحديث:' : 'Last:'} ${lastUpdate.toLocaleTimeString()}` : (isArabic ? 'بانتظار البيانات' : 'Waiting')}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className={cn(
              "flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all duration-500",
              isConnected ? "border-green-500/20 bg-green-500/5 text-green-500" : "border-red-500/20 bg-red-500/5 text-red-500"
            )}>
              <div className={cn("w-1.5 h-1.5 rounded-full", isConnected ? "bg-green-500" : "bg-red-500")} />
              {isConnected ? (isArabic ? 'متصل' : 'Connected') : (isArabic ? 'غير متصل' : 'Disconnected')}
            </div>
            <Button variant="ghost" size="icon" onClick={() => setShowSettings(!showSettings)} className={cn("hover:bg-slate-800", showSettings && "bg-slate-800 text-blue-400")}>
              <Settings className="w-5 h-5" />
            </Button>
            <LanguageToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 relative">
        <AnimatePresence>
          {showSettings && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="mb-8">
              <Card className="p-6 bg-slate-900/50 border-blue-500/20 backdrop-blur-md">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-500/10 rounded-lg"><Database className="w-5 h-5 text-blue-400" /></div>
                  <div>
                    <h2 className="text-lg font-bold text-white">{isArabic ? 'إعدادات الاتصال' : 'Connection Settings'}</h2>
                    <p className="text-xs text-slate-500">{isArabic ? 'أدخل بيانات Adafruit IO للبدء' : 'Enter Adafruit IO credentials to start'}</p>
                  </div>
                </div>
                <form onSubmit={handleSaveAndConnect} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">{isArabic ? 'اسم المستخدم' : 'Username'}</Label>
                      <Input value={config.username} onChange={e => setConfig({...config, username: e.target.value})} className="bg-slate-800/50 border-slate-700 focus:border-blue-500/50 transition-colors" placeholder="Kazuma_EXE" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">{isArabic ? 'مفتاح API' : 'AIO Key'}</Label>
                      <Input type="password" value={config.key} onChange={e => setConfig({...config, key: e.target.value})} className="bg-slate-800/50 border-slate-700 focus:border-blue-500/50 transition-colors" placeholder="aio_..." />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Checkbox id="remember" checked={rememberMe} onCheckedChange={(checked) => setRememberMe(checked as boolean)} />
                      <label htmlFor="remember" className="text-xs text-slate-400 cursor-pointer">{isArabic ? 'تذكر بياناتي' : 'Remember me'}</label>
                    </div>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700 px-8">{isArabic ? 'اتصال بالروبوت' : 'Connect to Robot'}</Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3 text-red-400"><AlertTriangle className="w-5 h-5" /><span className="text-sm font-medium">{error}</span></div>
            <Button variant="ghost" size="sm" onClick={() => setShowSettings(true)} className="text-red-400 hover:bg-red-500/10">{isArabic ? 'تعديل' : 'Fix'}</Button>
          </motion.div>
        )}

        <div className="space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg"><ShieldCheck className="w-5 h-5 text-purple-400" /></div>
                  <h2 className="text-lg font-bold text-white uppercase tracking-tight">{isArabic ? 'الروبوت القائد' : 'Master Robot'}</h2>
                </div>
                <div className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter", masterData.motor_status !== 'offline' ? "bg-green-500/10 text-green-500" : "bg-slate-800 text-slate-500")}>{masterData.motor_status}</div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard title={t('dashboard.voltage')} value={masterData.voltage} unit="V" icon={Zap} color="text-yellow-400" />
                <StatCard title={t('dashboard.current')} value={masterData.current} unit="A" icon={Activity} color="text-blue-400" />
                <StatCard title={t('dashboard.temp')} value={masterData.temperature} unit="°C" icon={Thermometer} color="text-orange-400" />
                <StatCard title={t('information.battery')} value={masterData.battery} unit="%" icon={Battery} color="text-green-400" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pink-500/10 rounded-lg"><Cpu className="w-5 h-5 text-pink-400" /></div>
                  <h2 className="text-lg font-bold text-white uppercase tracking-tight">{isArabic ? 'الروبوت التابع' : 'Follower Robot'}</h2>
                </div>
                <div className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter", followerData.motor_status !== 'offline' ? "bg-green-500/10 text-green-500" : "bg-slate-800 text-slate-500")}>{followerData.motor_status}</div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard title={t('dashboard.voltage')} value={followerData.voltage} unit="V" icon={Zap} color="text-yellow-400" />
                <StatCard title={t('dashboard.current')} value={followerData.current} unit="A" icon={Activity} color="text-blue-400" />
                <StatCard title={t('dashboard.temp')} value={followerData.temperature} unit="°C" icon={Thermometer} color="text-orange-400" />
                <StatCard title={t('information.battery')} value={followerData.battery} unit="%" icon={Battery} color="text-green-400" />
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="grid grid-cols-1 gap-8">
            <Card className="p-6 bg-slate-900/40 border-slate-800/50 backdrop-blur-md">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg"><TrendingUp className="w-5 h-5 text-blue-400" /></div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-tight">{t('information.charts')}</h3>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest">
                  <div className="flex items-center gap-2"><div className="w-3 h-1 bg-blue-500 rounded-full" /><span className="text-slate-400">{isArabic ? 'القائد' : 'Master'}</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-1 bg-pink-500 rounded-full" /><span className="text-slate-400">{isArabic ? 'التابع' : 'Follower'}</span></div>
                </div>
              </div>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history}>
                    <defs>
                      <linearGradient id="colorMaster" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                      <linearGradient id="colorFollower" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/><stop offset="95%" stopColor="#ec4899" stopOpacity={0}/></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}W`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="masterPower" name={isArabic ? 'طاقة القائد' : 'Master Power'} stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorMaster)" animationDuration={1000} animationEasing="linear" />
                    <Area type="monotone" dataKey="followerPower" name={isArabic ? 'طاقة التابع' : 'Follower Power'} stroke="#ec4899" strokeWidth={3} fillOpacity={1} fill="url(#colorFollower)" animationDuration={1000} animationEasing="linear" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="p-6 bg-slate-900/40 border-slate-800/50 backdrop-blur-md h-[300px]">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6">{isArabic ? 'مراقبة الحرارة' : 'Temperature Monitor'}</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="time" hide />
                    <YAxis hide domain={['auto', 'auto']} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="masterTemp" stroke="#f97316" strokeWidth={2} fill="#f97316" fillOpacity={0.1} animationDuration={1000} animationEasing="linear" />
                    <Area type="monotone" dataKey="followerTemp" stroke="#f43f5e" strokeWidth={2} fill="#f43f5e" fillOpacity={0.1} animationDuration={1000} animationEasing="linear" />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
              <Card className="p-6 bg-slate-900/40 border-slate-800/50 backdrop-blur-md h-[300px]">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6">{isArabic ? 'مراقبة الجهد' : 'Voltage Monitor'}</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="time" hide />
                    <YAxis hide domain={['auto', 'auto']} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="masterVoltage" stroke="#eab308" strokeWidth={2} fill="#eab308" fillOpacity={0.1} animationDuration={1000} animationEasing="linear" />
                    <Area type="monotone" dataKey="followerVoltage" stroke="#84cc16" strokeWidth={2} fill="#84cc16" fillOpacity={0.1} animationDuration={1000} animationEasing="linear" />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </motion.div>
        </div>
      </main>

      {isLoading && !isConnected && (
        <div className="fixed inset-0 bg-[#0B0F1A]/60 backdrop-blur-sm z-[100] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-sm font-medium text-blue-400 animate-pulse uppercase tracking-widest">{isArabic ? 'جاري الاتصال...' : 'Connecting...'}</p>
          </div>
        </div>
      )}
    </div>
  );
}
