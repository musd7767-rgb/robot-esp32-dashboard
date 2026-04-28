import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Zap,
  Gauge,
  Power,
  AlertCircle,
  ArrowLeft,
  Battery,
  Thermometer,
} from 'lucide-react';

interface RobotData {
  voltage: number;
  current: number;
  power: number;
  temperature: number;
  battery: number;
  motorStatus: 'stopped' | 'forward' | 'backward';
}

interface ChartDataPoint {
  time: string;
  masterPower: number;
  followerPower: number;
  masterVoltage: number;
  followerVoltage: number;
  masterCurrent: number;
  followerCurrent: number;
  masterTemperature: number;
  followerTemperature: number;
}

export default function InformationPage() {
  const [, setLocation] = useLocation();
  const { t, language } = useLanguage();
  const isArabic = language === 'ar';

  // Master robot data
  const [masterData, setMasterData] = useState<RobotData>({
    voltage: 12.5,
    current: 2.3,
    power: 28.75,
    temperature: 35.2,
    battery: 85,
    motorStatus: 'stopped',
  });

  // Follower robot data (received from master via Adafruit IO)
  const [followerData, setFollowerData] = useState<RobotData>({
    voltage: 12.0,
    current: 1.8,
    power: 21.6,
    temperature: 32.5,
    battery: 78,
    motorStatus: 'stopped',
  });

  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [masterStats, setMasterStats] = useState({
    maxPower: 0,
    avgPower: 0,
    maxCurrent: 0,
  });
  const [followerStats, setFollowerStats] = useState({
    maxPower: 0,
    avgPower: 0,
    maxCurrent: 0,
  });

  // Simulate data updates (in real scenario, this would come from Adafruit IO)
  useEffect(() => {
    const interval = setInterval(() => {
      const newMasterVoltage = 12.0 + Math.random() * 1.0;
      const newMasterCurrent = 1.5 + Math.random() * 2.0;
      const newMasterPower = newMasterVoltage * newMasterCurrent;
      const newMasterTemp = 32 + Math.random() * 10;

      const newFollowerVoltage = 11.8 + Math.random() * 0.8;
      const newFollowerCurrent = 1.0 + Math.random() * 1.5;
      const newFollowerPower = newFollowerVoltage * newFollowerCurrent;
      const newFollowerTemp = 30 + Math.random() * 8;

      setMasterData((prev) => ({
        ...prev,
        voltage: parseFloat(newMasterVoltage.toFixed(2)),
        current: parseFloat(newMasterCurrent.toFixed(2)),
        power: parseFloat(newMasterPower.toFixed(2)),
        temperature: parseFloat(newMasterTemp.toFixed(1)),
        battery: Math.max(0, prev.battery - Math.random() * 0.1),
      }));

      setFollowerData((prev) => ({
        ...prev,
        voltage: parseFloat(newFollowerVoltage.toFixed(2)),
        current: parseFloat(newFollowerCurrent.toFixed(2)),
        power: parseFloat(newFollowerPower.toFixed(2)),
        temperature: parseFloat(newFollowerTemp.toFixed(1)),
        battery: Math.max(0, prev.battery - Math.random() * 0.08),
      }));

      setChartData((prev) => {
        const updated = [
          ...prev,
          {
            time: new Date().toLocaleTimeString(),
            masterPower: parseFloat(newMasterPower.toFixed(2)),
            followerPower: parseFloat(newFollowerPower.toFixed(2)),
            masterVoltage: parseFloat(newMasterVoltage.toFixed(2)),
            followerVoltage: parseFloat(newFollowerVoltage.toFixed(2)),
            masterCurrent: parseFloat(newMasterCurrent.toFixed(2)),
            followerCurrent: parseFloat(newFollowerCurrent.toFixed(2)),
            masterTemperature: parseFloat(newMasterTemp.toFixed(1)),
            followerTemperature: parseFloat(newFollowerTemp.toFixed(1)),
          },
        ];
        return updated.slice(-60);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Calculate statistics
  useEffect(() => {
    if (chartData.length > 0) {
      const masterPowers = chartData.map((d) => d.masterPower);
      const masterCurrents = chartData.map((d) => d.masterCurrent);
      const followerPowers = chartData.map((d) => d.followerPower);
      const followerCurrents = chartData.map((d) => d.followerCurrent);

      setMasterStats({
        maxPower: Math.max(...masterPowers),
        avgPower: masterPowers.reduce((a, b) => a + b, 0) / masterPowers.length,
        maxCurrent: Math.max(...masterCurrents),
      });

      setFollowerStats({
        maxPower: Math.max(...followerPowers),
        avgPower: followerPowers.reduce((a, b) => a + b, 0) / followerPowers.length,
        maxCurrent: Math.max(...followerCurrents),
      });
    }
  }, [chartData]);

  const getBatteryColor = (battery: number) => {
    if (battery > 60) return 'text-green-500';
    if (battery > 30) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getTempColor = (temp: number) => {
    if (temp < 45) return 'text-blue-500';
    if (temp < 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const MetricCard = ({
    icon: Icon,
    label,
    value,
    unit,
    color,
  }: {
    icon: any;
    label: string;
    value: string | number;
    unit: string;
    color: string;
  }) => (
    <Card className={`p-4 bg-card border-${color}-500/30`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted text-xs font-medium">{label}</p>
          <p className={`text-2xl font-bold ${color} mt-1`}>
            {value}
            {unit}
          </p>
        </div>
        <Icon className={`w-10 h-10 ${color}/40`} />
      </div>
    </Card>
  );

  const RobotSection = ({
    title,
    data,
    stats,
    isMaster,
  }: {
    title: string;
    data: RobotData;
    stats: any;
    isMaster: boolean;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className={`bg-gradient-to-r ${isMaster ? 'from-cyan-600 to-blue-600' : 'from-purple-600 to-pink-600'} text-white p-4 rounded-lg`}>
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          icon={Zap}
          label={t('dashboard.voltage') || 'الجهد'}
          value={data.voltage.toFixed(2)}
          unit="V"
          color="text-cyan-400"
        />
        <MetricCard
          icon={Gauge}
          label={t('dashboard.current') || 'التيار'}
          value={data.current.toFixed(2)}
          unit="A"
          color="text-blue-400"
        />
        <MetricCard
          icon={Power}
          label={t('dashboard.power') || 'الطاقة'}
          value={data.power.toFixed(2)}
          unit="W"
          color="text-indigo-400"
        />
        <MetricCard
          icon={Thermometer}
          label={t('dashboard.temp') || 'الحرارة'}
          value={data.temperature.toFixed(1)}
          unit="°C"
          color={getTempColor(data.temperature)}
        />
      </div>

      {/* Battery and Status */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3">
            <Battery className={`w-8 h-8 ${getBatteryColor(data.battery)}`} />
            <div>
              <p className="text-xs text-muted">{t('dashboard.battery') || 'البطارية'}</p>
              <p className={`text-2xl font-bold ${getBatteryColor(data.battery)}`}>
                {data.battery.toFixed(0)}%
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-card border-border">
          <div>
            <p className="text-xs text-muted">{t('dashboard.motor_status') || 'حالة المحرك'}</p>
            <p className="text-lg font-bold text-cyan-400 capitalize">
              {data.motorStatus === 'stopped'
                ? t('dashboard.status.stopped') || 'متوقف'
                : data.motorStatus === 'forward'
                  ? t('dashboard.status.forward') || 'للأمام'
                  : t('dashboard.status.backward') || 'للخلف'}
            </p>
          </div>
        </Card>
      </div>

      {/* Statistics */}
      <Card className="p-4 bg-card border-border">
        <h3 className="text-lg font-bold text-white mb-3">
          {t('dashboard.energy_stats') || 'إحصائيات الطاقة'}
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-background rounded-lg border border-border">
            <p className="text-xs text-muted">{t('dashboard.max_power') || 'أقصى طاقة'}</p>
            <p className="text-xl font-bold text-indigo-400">{stats.maxPower.toFixed(2)}W</p>
          </div>
          <div className="p-3 bg-background rounded-lg border border-border">
            <p className="text-xs text-muted">{t('dashboard.avg_power') || 'متوسط الطاقة'}</p>
            <p className="text-xl font-bold text-cyan-400">{stats.avgPower.toFixed(2)}W</p>
          </div>
          <div className="p-3 bg-background rounded-lg border border-border">
            <p className="text-xs text-muted">{t('dashboard.max_current') || 'أقصى تيار'}</p>
            <p className="text-xl font-bold text-blue-400">{stats.maxCurrent.toFixed(2)}A</p>
          </div>
        </div>
      </Card>

      {/* Warnings */}
      {data.battery < 20 && (
        <div className="bg-red-900/30 border-l-4 border-red-500 text-red-100 p-3 rounded">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} />
            <span className="text-sm">
              {isArabic ? '⚠️ تحذير: البطارية منخفضة جداً!' : '⚠️ Warning: Battery critically low!'}
            </span>
          </div>
        </div>
      )}

      {data.temperature > 60 && (
        <div className="bg-orange-900/30 border-l-4 border-orange-500 text-orange-100 p-3 rounded">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} />
            <span className="text-sm">
              {isArabic ? '⚠️ تحذير: درجة الحرارة مرتفعة!' : '⚠️ Warning: Temperature high!'}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 ${isArabic ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <motion.div
        className="border-b border-border bg-gradient-to-r from-cyan-600 to-blue-600 text-white p-6 shadow-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">📊 {t('information.title') || 'معلومات الروبوتات'}</h1>
            <p className="text-cyan-100 mt-1">{t('information.subtitle') || 'عرض معلومات القائد والتابع'}</p>
          </div>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <Button
              onClick={() => setLocation('/selection')}
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-blue-600"
            >
              <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
              {isArabic ? 'رجوع' : 'Back'}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="container mx-auto p-6 max-w-6xl space-y-12">
        {/* Master Robot Section */}
        <RobotSection
          title={t('master.title') || '🤖 الروبوت القائد'}
          data={masterData}
          stats={masterStats}
          isMaster={true}
        />

        {/* Divider */}
        <div className="border-t border-border/50" />

        {/* Follower Robot Section */}
        <RobotSection
          title={t('follower.title') || '🤖 الروبوت التابع'}
          data={followerData}
          stats={followerStats}
          isMaster={false}
        />

        {/* Charts Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-bold text-white">📈 {t('information.charts') || 'الرسوم البيانية'}</h2>

          {/* Power Consumption Chart */}
          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-bold mb-4 text-cyan-400">
              {t('dashboard.power_consumption') || 'استهلاك الطاقة'}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorMasterPower" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22D3EE" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorFollowerPower" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A855F7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#A855F7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2D3E5F" />
                <XAxis dataKey="time" stroke="#A0A0A0" />
                <YAxis stroke="#A0A0A0" />
                <Tooltip contentStyle={{ backgroundColor: '#1A1F3A', border: '1px solid #2D3E5F' }} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="masterPower"
                  stroke="#22D3EE"
                  fillOpacity={1}
                  fill="url(#colorMasterPower)"
                  name={t('master.title') || 'القائد'}
                />
                <Area
                  type="monotone"
                  dataKey="followerPower"
                  stroke="#A855F7"
                  fillOpacity={1}
                  fill="url(#colorFollowerPower)"
                  name={t('follower.title') || 'التابع'}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Voltage Chart */}
          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-bold mb-4 text-cyan-400">
              {t('dashboard.voltage') || 'الجهد'}
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2D3E5F" />
                <XAxis dataKey="time" stroke="#A0A0A0" />
                <YAxis stroke="#A0A0A0" />
                <Tooltip contentStyle={{ backgroundColor: '#1A1F3A', border: '1px solid #2D3E5F' }} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="masterVoltage"
                  stroke="#22D3EE"
                  dot={false}
                  name={t('master.title') || 'القائد'}
                />
                <Line
                  type="monotone"
                  dataKey="followerVoltage"
                  stroke="#A855F7"
                  dot={false}
                  name={t('follower.title') || 'التابع'}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Temperature Chart */}
          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-bold mb-4 text-cyan-400">
              {t('dashboard.temp') || 'درجة الحرارة'}
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2D3E5F" />
                <XAxis dataKey="time" stroke="#A0A0A0" />
                <YAxis stroke="#A0A0A0" />
                <Tooltip contentStyle={{ backgroundColor: '#1A1F3A', border: '1px solid #2D3E5F' }} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="masterTemperature"
                  stroke="#F97316"
                  dot={false}
                  name={t('master.title') || 'القائد'}
                />
                <Line
                  type="monotone"
                  dataKey="followerTemperature"
                  stroke="#EC4899"
                  dot={false}
                  name={t('follower.title') || 'التابع'}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
