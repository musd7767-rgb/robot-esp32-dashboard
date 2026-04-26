import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Power, Zap, Gauge, AlertCircle, Play, Square, RotateCw, ArrowLeft, ChevronLeft, ChevronRight, Users } from 'lucide-react';
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

export default function MasterDashboard() {
  const [, setLocation] = useLocation();
  const { t, language } = useLanguage();
  const [robotData, setRobotData] = useState<RobotData>({
    voltage: 12.5,
    current: 2.3,
    power: 28.75,
    temperature: 35.2,
    motorSpeed: 0,
    motorStatus: 'stopped',
  });

  const [motorSpeed, setMotorSpeed] = useState(0);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [stats, setStats] = useState({ maxPower: 0, avgPower: 0, totalEnergy: 0, maxCurrent: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      const newVoltage = 12.0 + Math.random() * 1.0;
      const newCurrent = motorSpeed > 0 ? (motorSpeed / 255) * 4.5 + (Math.random() - 0.5) * 0.5 : Math.random() * 0.2;
      const newPower = newVoltage * newCurrent;
      const newTemp = 32 + (motorSpeed / 255) * 20 + (Math.random() - 0.5) * 3;

      setRobotData((prev) => ({
        ...prev,
        voltage: parseFloat(newVoltage.toFixed(2)),
        current: parseFloat(newCurrent.toFixed(2)),
        power: parseFloat(newPower.toFixed(2)),
        temperature: parseFloat(newTemp.toFixed(1)),
        motorSpeed: motorSpeed,
      }));

      setChartData((prev) => {
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
  }, [motorSpeed]);

  useEffect(() => {
    if (chartData.length > 0) {
      const powers = chartData.map((d) => d.power);
      const currents = chartData.map((d) => d.current);
      setStats({
        maxPower: Math.max(...powers),
        avgPower: (powers.reduce((a, b) => a + b, 0) / powers.length),
        totalEnergy: (powers.reduce((a, b) => a + b, 0) / powers.length) * (chartData.length * 0.5) / 3600,
        maxCurrent: Math.max(...currents),
      });
    }
  }, [chartData]);

  const handleMotorCommand = (command: 'forward' | 'backward' | 'stop') => {
    if (command === 'stop') {
      setMotorSpeed(0);
      setRobotData((prev) => ({ ...prev, motorStatus: 'stopped' }));
    } else {
      setRobotData((prev) => ({ ...prev, motorStatus: command }));
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <motion.div className="border-b border-border bg-gradient-to-r from-card to-background p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setLocation('/dual')}
              variant="ghost"
              size="icon"
              className="hidden md:flex rounded-full hover:bg-white/10"
              title={t('selection.dual.title')}
            >
              <ChevronLeft className="w-8 h-8 rtl:rotate-180" />
            </Button>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                {t('master.title')}
              </h1>
              <p className="text-muted mt-1">{t('master.subtitle')}</p>
            </div>
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
            <Button
              onClick={() => setLocation('/slave')}
              variant="ghost"
              size="icon"
              className="hidden md:flex rounded-full hover:bg-white/10"
              title={t('selection.follower.title')}
            >
              <ChevronRight className="w-8 h-8 rtl:rotate-180" />
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Metric Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 bg-card border-cyan-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted text-sm font-medium">{t('dashboard.voltage')}</p>
                <p className="text-3xl font-bold text-cyan-400 mt-2">{robotData.voltage.toFixed(2)}V</p>
              </div>
              <Zap className="w-12 h-12 text-cyan-400/40" />
            </div>
          </Card>

          <Card className="p-6 bg-card border-blue-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted text-sm font-medium">{t('dashboard.current')}</p>
                <p className="text-3xl font-bold text-blue-400 mt-2">{robotData.current.toFixed(2)}A</p>
              </div>
              <Gauge className="w-12 h-12 text-blue-400/40" />
            </div>
          </Card>

          <Card className="p-6 bg-card border-indigo-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted text-sm font-medium">{t('dashboard.power')}</p>
                <p className="text-3xl font-bold text-indigo-400 mt-2">{robotData.power.toFixed(2)}W</p>
              </div>
              <Power className="w-12 h-12 text-indigo-400/40" />
            </div>
          </Card>

          <Card className="p-6 bg-card border-orange-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted text-sm font-medium">{t('dashboard.temp')}</p>
                <p className="text-3xl font-bold text-orange-400 mt-2">{robotData.temperature.toFixed(1)}°C</p>
              </div>
              <AlertCircle className="w-12 h-12 text-orange-400/40" />
            </div>
          </Card>
        </div>

        {/* Controls Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 p-6 bg-card border-border">
            <h2 className="text-xl font-bold mb-6 text-cyan-400">{t('dashboard.motor_control')}</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium">{t('dashboard.speed')}</label>
                  <span className="text-sm font-bold text-cyan-400">{motorSpeed}/255</span>
                </div>
                <Slider value={[motorSpeed]} onValueChange={(value) => setMotorSpeed(value[0])} min={0} max={255} step={1} className="w-full" />
              </div>

              <div className="grid grid-cols-3 gap-3 pt-4">
                <Button onClick={() => handleMotorCommand('forward')} className="w-full h-12 bg-green-600 hover:bg-green-700 text-white">
                  <Play className="w-4 h-4 mr-2" /> {t('dashboard.forward')}
                </Button>
                <Button onClick={() => handleMotorCommand('stop')} className="w-full h-12 bg-red-600 hover:bg-red-700 text-white">
                  <Square className="w-4 h-4 mr-2" /> {t('dashboard.stop')}
                </Button>
                <Button onClick={() => handleMotorCommand('backward')} className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white">
                  <RotateCw className="w-4 h-4 mr-2" /> {t('dashboard.backward')}
                </Button>
              </div>

              <div className="mt-6 p-4 bg-background rounded-lg border border-border">
                <p className="text-xs text-muted mb-1">{t('dashboard.motor_status')}</p>
                <p className="text-lg font-bold text-cyan-400 capitalize">
                  {robotData.motorStatus === 'stopped' ? t('dashboard.status.stopped') : robotData.motorStatus === 'forward' ? t('dashboard.status.forward') : t('dashboard.status.backward')}
                </p>
              </div>
              
              <Button 
                onClick={() => setLocation('/master/control')}
                className="w-full mt-4 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-500/50"
              >
                🎮 {t('dashboard.manual_control')}
              </Button>
            </div>
          </Card>

          <Card className="lg:col-span-2 p-6 bg-card border-border">
            <h2 className="text-xl font-bold mb-6 text-cyan-400">{t('dashboard.energy_stats')}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-background rounded-lg border border-border">
                <p className="text-xs text-muted mb-2">{t('dashboard.max_power')}</p>
                <p className="text-2xl font-bold text-indigo-400">{stats.maxPower.toFixed(2)}W</p>
              </div>
              <div className="p-4 bg-background rounded-lg border border-border">
                <p className="text-xs text-muted mb-2">{t('dashboard.avg_power')}</p>
                <p className="text-2xl font-bold text-cyan-400">{stats.avgPower.toFixed(2)}W</p>
              </div>
              <div className="p-4 bg-background rounded-lg border border-border">
                <p className="text-xs text-muted mb-2">{t('dashboard.max_current')}</p>
                <p className="text-2xl font-bold text-blue-400">{stats.maxCurrent.toFixed(2)}A</p>
              </div>
              <div className="p-4 bg-background rounded-lg border border-border">
                <p className="text-xs text-muted mb-2">{t('dashboard.total_energy')}</p>
                <p className="text-2xl font-bold text-orange-400">{stats.totalEnergy.toFixed(3)}Wh</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-bold mb-4 text-cyan-400">{t('dashboard.power_consumption')}</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22D3EE" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2D3E5F" />
                <XAxis dataKey="time" stroke="#A0A0A0" />
                <YAxis stroke="#A0A0A0" />
                <Tooltip contentStyle={{ backgroundColor: '#1A1F3A', border: '1px solid #2D3E5F' }} />
                <Area type="monotone" dataKey="power" stroke="#22D3EE" fillOpacity={1} fill="url(#colorPower)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-bold mb-4 text-cyan-400">{t('dashboard.voltage_current')}</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2D3E5F" />
                <XAxis dataKey="time" stroke="#A0A0A0" />
                <YAxis stroke="#A0A0A0" />
                <Tooltip contentStyle={{ backgroundColor: '#1A1F3A', border: '1px solid #2D3E5F' }} />
                <Legend />
                <Line type="monotone" dataKey="voltage" stroke="#22D3EE" dot={false} strokeWidth={2} name={t('dashboard.voltage')} />
                <Line type="monotone" dataKey="current" stroke="#3B82F6" dot={false} strokeWidth={2} name={t('dashboard.current')} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <Card className="p-6 bg-card border-border">
          <h3 className="text-lg font-bold mb-4 text-cyan-400">{t('dashboard.temp_monitor')}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2D3E5F" />
              <XAxis dataKey="time" stroke="#A0A0A0" />
              <YAxis stroke="#A0A0A0" />
              <Tooltip contentStyle={{ backgroundColor: '#1A1F3A', border: '1px solid #2D3E5F' }} />
              <Area type="monotone" dataKey="temperature" stroke="#F97316" fillOpacity={1} fill="url(#colorTemp)" name={t('dashboard.temp')} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <div className="p-4 bg-card border border-border rounded-lg text-center text-sm text-muted">
          <p>{t('master.footer')}</p>
        </div>
      </div>
    </div>
  );
}
