import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Power, Zap, Gauge, AlertCircle, Play, Square, RotateCw, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageToggle } from '@/components/LanguageToggle';

interface RobotData {
  voltage: number;
  current: number;
  power: number;
  temperature: number;
  motorSpeed: number;
  motorStatus: 'stopped' | 'forward' | 'backward';
}

interface ChartDataPoint {
  time: string;
  power: number;
  voltage: number;
  current: number;
  temperature: number;
}

export default function DualDashboard() {
  const [, setLocation] = useLocation();
  const { t, language } = useLanguage();

  // Master Robot State
  const [masterData, setMasterData] = useState<RobotData>({
    voltage: 12.5,
    current: 2.3,
    power: 28.75,
    temperature: 35.2,
    motorSpeed: 0,
    motorStatus: 'stopped',
  });

  // Follower Robot State
  const [followerData, setFollowerData] = useState<RobotData>({
    voltage: 12.3,
    current: 1.8,
    power: 22.14,
    temperature: 32.5,
    motorSpeed: 0,
    motorStatus: 'stopped',
  });

  const [masterMotorSpeed, setMasterMotorSpeed] = useState(0);
  const [followerMotorSpeed, setFollowerMotorSpeed] = useState(0);
  const [masterChartData, setMasterChartData] = useState<ChartDataPoint[]>([]);
  const [followerChartData, setFollowerChartData] = useState<ChartDataPoint[]>([]);
  const [masterStats, setMasterStats] = useState({ maxPower: 0, avgPower: 0, totalEnergy: 0, maxCurrent: 0 });
  const [followerStats, setFollowerStats] = useState({ maxPower: 0, avgPower: 0, totalEnergy: 0, maxCurrent: 0 });

  // Update Master Robot Data
  useEffect(() => {
    const interval = setInterval(() => {
      const newVoltage = 11.8 + Math.random() * 1.4;
      const newCurrent = masterMotorSpeed > 0 ? (masterMotorSpeed / 255) * 3.5 + (Math.random() - 0.5) * 0.5 : Math.random() * 0.3;
      const newPower = newVoltage * newCurrent;
      const newTemp = 30 + (masterMotorSpeed / 255) * 15 + (Math.random() - 0.5) * 2;

      setMasterData((prev) => ({
        ...prev,
        voltage: parseFloat(newVoltage.toFixed(2)),
        current: parseFloat(newCurrent.toFixed(2)),
        power: parseFloat(newPower.toFixed(2)),
        temperature: parseFloat(newTemp.toFixed(1)),
        motorSpeed: masterMotorSpeed,
      }));

      setMasterChartData((prev) => {
        const updated = [
          ...prev,
          {
            time: new Date().toLocaleTimeString(),
            power: parseFloat(newPower.toFixed(2)),
            voltage: parseFloat(newVoltage.toFixed(2)),
            current: parseFloat(newCurrent.toFixed(2)),
            temperature: parseFloat(newTemp.toFixed(1)),
          },
        ];
        return updated.slice(-60);
      });
    }, 500);

    return () => clearInterval(interval);
  }, [masterMotorSpeed]);

  // Update Follower Robot Data
  useEffect(() => {
    const interval = setInterval(() => {
      const newVoltage = 11.9 + Math.random() * 1.2;
      const newCurrent = followerMotorSpeed > 0 ? (followerMotorSpeed / 255) * 3.2 + (Math.random() - 0.5) * 0.4 : Math.random() * 0.25;
      const newPower = newVoltage * newCurrent;
      const newTemp = 28 + (followerMotorSpeed / 255) * 12 + (Math.random() - 0.5) * 1.5;

      setFollowerData((prev) => ({
        ...prev,
        voltage: parseFloat(newVoltage.toFixed(2)),
        current: parseFloat(newCurrent.toFixed(2)),
        power: parseFloat(newPower.toFixed(2)),
        temperature: parseFloat(newTemp.toFixed(1)),
        motorSpeed: followerMotorSpeed,
      }));

      setFollowerChartData((prev) => {
        const updated = [
          ...prev,
          {
            time: new Date().toLocaleTimeString(),
            power: parseFloat(newPower.toFixed(2)),
            voltage: parseFloat(newVoltage.toFixed(2)),
            current: parseFloat(newCurrent.toFixed(2)),
            temperature: parseFloat(newTemp.toFixed(1)),
          },
        ];
        return updated.slice(-60);
      });
    }, 500);

    return () => clearInterval(interval);
  }, [followerMotorSpeed]);

  // Update Master Stats
  useEffect(() => {
    if (masterChartData.length > 0) {
      const powers = masterChartData.map((d) => d.power);
      const currents = masterChartData.map((d) => d.current);
      setMasterStats({
        maxPower: Math.max(...powers),
        avgPower: (powers.reduce((a, b) => a + b, 0) / powers.length),
        totalEnergy: (powers.reduce((a, b) => a + b, 0) / powers.length) * (masterChartData.length * 0.5) / 3600,
        maxCurrent: Math.max(...currents),
      });
    }
  }, [masterChartData]);

  // Update Follower Stats
  useEffect(() => {
    if (followerChartData.length > 0) {
      const powers = followerChartData.map((d) => d.power);
      const currents = followerChartData.map((d) => d.current);
      setFollowerStats({
        maxPower: Math.max(...powers),
        avgPower: (powers.reduce((a, b) => a + b, 0) / powers.length),
        totalEnergy: (powers.reduce((a, b) => a + b, 0) / powers.length) * (followerChartData.length * 0.5) / 3600,
        maxCurrent: Math.max(...currents),
      });
    }
  }, [followerChartData]);

  const handleMasterMotorCommand = (command: 'forward' | 'backward' | 'stop') => {
    if (command === 'stop') {
      setMasterMotorSpeed(0);
      setMasterData((prev) => ({ ...prev, motorStatus: 'stopped' }));
    } else {
      setMasterData((prev) => ({ ...prev, motorStatus: command }));
    }
  };

  const handleFollowerMotorCommand = (command: 'forward' | 'backward' | 'stop') => {
    if (command === 'stop') {
      setFollowerMotorSpeed(0);
      setFollowerData((prev) => ({ ...prev, motorStatus: 'stopped' }));
    } else {
      setFollowerData((prev) => ({ ...prev, motorStatus: command }));
    }
  };

  const RobotCard = ({ 
    title, 
    subtitle, 
    data, 
    stats, 
    motorSpeed, 
    onMotorSpeedChange, 
    onMotorCommand, 
    chartData,
    colorScheme 
  }: any) => {
    const colors = {
      master: { primary: 'cyan', secondary: 'purple', accent: 'green' },
      follower: { primary: 'purple', secondary: 'pink', accent: 'indigo' }
    };

    const scheme = colorScheme === 'master' ? colors.master : colors.follower;

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-card to-background p-6 rounded-lg border border-border">
          <h2 className={`text-3xl font-bold bg-gradient-to-r from-${scheme.primary}-400 to-${scheme.secondary}-500 bg-clip-text text-transparent mb-2`}>
            {title}
          </h2>
          <p className="text-muted">{subtitle}</p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className={`p-4 bg-card border-${scheme.primary}-500/30`}>
            <p className="text-muted text-xs font-medium">{t('dashboard.voltage')}</p>
            <p className={`text-2xl font-bold text-${scheme.primary}-400 mt-1`}>{data.voltage.toFixed(2)}V</p>
          </Card>
          <Card className={`p-4 bg-card border-${scheme.secondary}-500/30`}>
            <p className="text-muted text-xs font-medium">{t('dashboard.current')}</p>
            <p className={`text-2xl font-bold text-${scheme.secondary}-400 mt-1`}>{data.current.toFixed(2)}A</p>
          </Card>
          <Card className={`p-4 bg-card border-${scheme.accent}-500/30`}>
            <p className="text-muted text-xs font-medium">{t('dashboard.power')}</p>
            <p className={`text-2xl font-bold text-${scheme.accent}-400 mt-1`}>{data.power.toFixed(2)}W</p>
          </Card>
          <Card className="p-4 bg-card border-orange-500/30">
            <p className="text-muted text-xs font-medium">{t('dashboard.temp')}</p>
            <p className="text-2xl font-bold text-orange-400 mt-1">{data.temperature.toFixed(1)}°C</p>
          </Card>
        </div>

        {/* Motor Control */}
        <Card className="p-6 bg-card border-border">
          <h3 className={`text-lg font-bold mb-4 text-${scheme.primary}-400`}>{t('dashboard.motor_control')}</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium">{t('dashboard.speed')}</label>
                <span className={`text-sm font-bold text-${scheme.primary}-400`}>{motorSpeed}/255</span>
              </div>
              <Slider value={[motorSpeed]} onValueChange={(value) => onMotorSpeedChange(value[0])} min={0} max={255} step={1} className="w-full" />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Button onClick={() => onMotorCommand('forward')} className="h-10 bg-green-600 hover:bg-green-700 text-white text-sm">
                <Play className="w-3 h-3 mr-1" /> {t('dashboard.forward')}
              </Button>
              <Button onClick={() => onMotorCommand('stop')} className="h-10 bg-red-600 hover:bg-red-700 text-white text-sm">
                <Square className="w-3 h-3 mr-1" /> {t('dashboard.stop')}
              </Button>
              <Button onClick={() => onMotorCommand('backward')} className="h-10 bg-blue-600 hover:bg-blue-700 text-white text-sm">
                <RotateCw className="w-3 h-3 mr-1" /> {t('dashboard.backward')}
              </Button>
            </div>

            <div className="p-3 bg-background rounded-lg border border-border">
              <p className="text-xs text-muted mb-1">{t('dashboard.motor_status')}</p>
              <p className={`text-sm font-bold text-${scheme.primary}-400`}>
                {data.motorStatus === 'stopped' ? t('dashboard.status.stopped') : data.motorStatus === 'forward' ? t('dashboard.status.forward') : t('dashboard.status.backward')}
              </p>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <Card className="p-6 bg-card border-border">
          <h3 className={`text-lg font-bold mb-4 text-${scheme.primary}-400`}>{t('dashboard.energy_stats')}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-background rounded-lg border border-border">
              <p className="text-xs text-muted mb-1">{t('dashboard.max_power')}</p>
              <p className="text-lg font-bold text-green-400">{stats.maxPower.toFixed(2)}W</p>
            </div>
            <div className="p-3 bg-background rounded-lg border border-border">
              <p className="text-xs text-muted mb-1">{t('dashboard.avg_power')}</p>
              <p className={`text-lg font-bold text-${scheme.primary}-400`}>{stats.avgPower.toFixed(2)}W</p>
            </div>
            <div className="p-3 bg-background rounded-lg border border-border">
              <p className="text-xs text-muted mb-1">{t('dashboard.max_current')}</p>
              <p className={`text-lg font-bold text-${scheme.secondary}-400`}>{stats.maxCurrent.toFixed(2)}A</p>
            </div>
            <div className="p-3 bg-background rounded-lg border border-border">
              <p className="text-xs text-muted mb-1">{t('dashboard.total_energy')}</p>
              <p className="text-lg font-bold text-orange-400">{stats.totalEnergy.toFixed(3)}Wh</p>
            </div>
          </div>
        </Card>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 bg-card border-border">
            <h4 className={`text-sm font-bold mb-3 text-${scheme.primary}-400`}>{t('dashboard.power_consumption')}</h4>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id={`colorPower${colorScheme}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colorScheme === 'master' ? '#00D9FF' : '#D946EF'} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={colorScheme === 'master' ? '#00D9FF' : '#D946EF'} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2D3E5F" />
                <XAxis dataKey="time" stroke="#A0A0A0" tick={{ fontSize: 12 }} />
                <YAxis stroke="#A0A0A0" tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1A1F3A', border: '1px solid #2D3E5F' }} />
                <Area type="monotone" dataKey="power" stroke={colorScheme === 'master' ? '#00D9FF' : '#D946EF'} fillOpacity={1} fill={`url(#colorPower${colorScheme})`} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6 bg-card border-border">
            <h4 className={`text-sm font-bold mb-3 text-${scheme.primary}-400`}>{t('dashboard.voltage_current')}</h4>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2D3E5F" />
                <XAxis dataKey="time" stroke="#A0A0A0" tick={{ fontSize: 12 }} />
                <YAxis stroke="#A0A0A0" tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1A1F3A', border: '1px solid #2D3E5F' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="voltage" stroke={colorScheme === 'master' ? '#00D9FF' : '#D946EF'} dot={false} strokeWidth={2} name={t('dashboard.voltage')} />
                <Line type="monotone" dataKey="current" stroke={colorScheme === 'master' ? '#B026FF' : '#EC4899'} dot={false} strokeWidth={2} name={t('dashboard.current')} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <motion.div className="border-b border-border bg-gradient-to-r from-card to-background p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              🤖 {language === 'ar' ? 'التحكم المشترك' : 'Dual Control'}
            </h1>
            <p className="text-muted mt-1">
              {language === 'ar' ? '✨ التحكم في الروبوتين معاً' : '✨ Control Both Robots Together'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <Button
              onClick={() => setLocation('/selection')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
              {t('dashboard.back')}
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Master Robot */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <RobotCard
              title={t('master.title')}
              subtitle={t('master.subtitle')}
              data={masterData}
              stats={masterStats}
              motorSpeed={masterMotorSpeed}
              onMotorSpeedChange={setMasterMotorSpeed}
              onMotorCommand={handleMasterMotorCommand}
              chartData={masterChartData}
              colorScheme="master"
            />
          </motion.div>

          {/* Follower Robot */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <RobotCard
              title={t('follower.title')}
              subtitle={t('follower.subtitle')}
              data={followerData}
              stats={followerStats}
              motorSpeed={followerMotorSpeed}
              onMotorSpeedChange={setFollowerMotorSpeed}
              onMotorCommand={handleFollowerMotorCommand}
              chartData={followerChartData}
              colorScheme="follower"
            />
          </motion.div>
        </div>

        {/* Connection Status Note */}
        <motion.div 
          className="mt-8 p-4 bg-card border border-border rounded-lg text-center text-sm text-muted"
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.2 }}
        >
          <p>
            {language === 'ar' 
              ? '📡 نظام التحكم المشترك - جاهز لربط الروبوتين عبر WiFi/Bluetooth'
              : '📡 Dual Control System - Ready to connect both robots via WiFi/Bluetooth'
            }
          </p>
        </motion.div>
      </div>
    </div>
  );
}
