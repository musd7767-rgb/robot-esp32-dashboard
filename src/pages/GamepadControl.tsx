/**
 * صفحة التحكم بالـ Gamepad (مثل لعبة الفيديو)
 * واجهة احترافية مع Joystick والدواسات
 */

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import VirtualJoystick, { JoystickState } from '@/components/VirtualJoystick';
import { Button } from '@/components/ui/button';
import { Battery, Zap, Thermometer, AlertCircle } from 'lucide-react';
import { RobotType } from '@/lib/commands';

interface RobotState {
  voltage: number;
  current: number;
  power: number;
  temperature: number;
  battery: number;
  motorStatus: 'stopped' | 'forward' | 'backward' | 'turning';
  speed: number; // 0-100
}

interface GamepadControlProps {
  robotType: RobotType;
}

export default function GamepadControl({ robotType }: GamepadControlProps) {
  const { language } = useLanguage();
  const [, setLocation] = useLocation();
  const isArabic = language === 'ar';

  // حالة الروبوت
  const [robotState, setRobotState] = useState<RobotState>({
    voltage: 12.0,
    current: 0.5,
    power: 6.0,
    temperature: 35,
    battery: 85,
    motorStatus: 'stopped',
    speed: 50,
  });

  const [joystickState, setJoystickState] = useState<JoystickState>({
    x: 0,
    y: 0,
    isActive: false,
  });

  const [throttle, setThrottle] = useState(50); // 0-100
  const [brake, setBrake] = useState(0); // 0-100

  // محاكاة تحديث البيانات
  useEffect(() => {
    const interval = setInterval(() => {
      setRobotState((prev) => ({
        ...prev,
        voltage: 11.5 + Math.random() * 1.0,
        current: Math.random() * 2.0,
        power: Math.random() * 20,
        temperature: 30 + Math.random() * 20,
        battery: Math.max(0, prev.battery - Math.random() * 0.2),
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // تحديث حالة المحرك بناءً على Joystick والدواسات
  useEffect(() => {
    let status: 'stopped' | 'forward' | 'backward' | 'turning' = 'stopped';

    if (joystickState.isActive) {
      if (joystickState.y > 10) {
        status = 'forward';
      } else if (joystickState.y < -10) {
        status = 'backward';
      }

      if (Math.abs(joystickState.x) > 10) {
        status = 'turning';
      }
    }

    setRobotState((prev) => ({
      ...prev,
      motorStatus: status,
      speed: throttle - brake,
    }));
  }, [joystickState, throttle, brake]);

  // الألوان بناءً على الحالة
  const getBatteryColor = () => {
    if (robotState.battery > 60) return 'text-green-500';
    if (robotState.battery > 30) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getTempColor = () => {
    if (robotState.temperature < 45) return 'text-blue-500';
    if (robotState.temperature < 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getMotorStatusColor = () => {
    switch (robotState.motorStatus) {
      case 'forward':
        return 'text-green-500';
      case 'backward':
        return 'text-orange-500';
      case 'turning':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  const getMotorStatusText = () => {
    switch (robotState.motorStatus) {
      case 'forward':
        return isArabic ? '⬆️ للأمام' : '⬆️ Forward';
      case 'backward':
        return isArabic ? '⬇️ للخلف' : '⬇️ Backward';
      case 'turning':
        return isArabic ? '🔄 دوران' : '🔄 Turning';
      default:
        return isArabic ? '⏹️ متوقف' : '⏹️ Stopped';
    }
  };

  const robotName = robotType === 'master' ? 'الروبوت القائد' : 'الروبوت التابع';

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 ${isArabic ? 'rtl' : 'ltr'}`}>
      {/* رأس الصفحة */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">🎮 {robotName}</h1>
            <p className="text-cyan-100 text-sm">
              {isArabic ? 'وضع التحكم بالـ Gamepad' : 'Gamepad Control Mode'}
            </p>
          </div>
          <Button
            onClick={() => setLocation(`/${robotType === 'master' ? 'master' : 'follower'}`)}
            variant="outline"
            className="text-white border-white hover:bg-white hover:text-blue-600"
          >
            {isArabic ? '← رجوع' : 'Back →'}
          </Button>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="container mx-auto p-4 max-w-6xl">
        {/* شريط المعلومات الحية */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {/* الجهد */}
          <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg p-3 text-white text-sm">
            <div className="flex items-center gap-1 mb-1">
              <Zap size={16} />
              <span className="opacity-80">{isArabic ? 'الجهد' : 'Voltage'}</span>
            </div>
            <div className="text-xl font-bold">{robotState.voltage.toFixed(1)}V</div>
          </div>

          {/* درجة الحرارة */}
          <div className={`bg-gradient-to-br from-red-600 to-red-800 rounded-lg p-3 text-white text-sm`}>
            <div className="flex items-center gap-1 mb-1">
              <Thermometer size={16} />
              <span className="opacity-80">{isArabic ? 'الحرارة' : 'Temp'}</span>
            </div>
            <div className={`text-xl font-bold ${getTempColor()}`}>
              {robotState.temperature.toFixed(0)}°C
            </div>
          </div>

          {/* البطارية */}
          <div className={`bg-gradient-to-br from-green-600 to-green-800 rounded-lg p-3 text-white text-sm`}>
            <div className="flex items-center gap-1 mb-1">
              <Battery size={16} />
              <span className="opacity-80">{isArabic ? 'البطارية' : 'Battery'}</span>
            </div>
            <div className={`text-xl font-bold ${getBatteryColor()}`}>
              {robotState.battery.toFixed(0)}%
            </div>
          </div>

          {/* حالة المحرك */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg p-3 text-white text-sm">
            <div className="flex items-center gap-1 mb-1">
              <span>⚙️</span>
              <span className="opacity-80">{isArabic ? 'الحالة' : 'Status'}</span>
            </div>
            <div className={`text-lg font-bold ${getMotorStatusColor()}`}>
              {getMotorStatusText()}
            </div>
          </div>
        </div>

        {/* تحذيرات */}
        {robotState.battery < 20 && (
          <div className="bg-red-900 border-l-4 border-red-500 text-red-100 p-3 mb-4 rounded text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} />
              <span>
                {isArabic
                  ? '⚠️ تحذير: البطارية منخفضة جداً!'
                  : '⚠️ Warning: Battery critically low!'}
              </span>
            </div>
          </div>
        )}

        {robotState.temperature > 60 && (
          <div className="bg-orange-900 border-l-4 border-orange-500 text-orange-100 p-3 mb-4 rounded text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} />
              <span>
                {isArabic
                  ? '⚠️ تحذير: درجة الحرارة مرتفعة!'
                  : '⚠️ Warning: Temperature high!'}
              </span>
            </div>
          </div>
        )}

        {/* منطقة التحكم الرئيسية */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* الـ Joystick */}
          <div className="lg:col-span-1 flex justify-center">
            <div className="bg-slate-800 rounded-lg p-6 border border-cyan-500/30">
              <h2 className="text-white font-bold text-center mb-4">
                {isArabic ? '🎮 التحكم' : '🎮 Control'}
              </h2>
              <VirtualJoystick onMove={setJoystickState} size={220} sensitivity={1} />
            </div>
          </div>

          {/* الدواسات والمعلومات */}
          <div className="lg:col-span-2 space-y-4">
            {/* الدواسات */}
            <div className="bg-slate-800 rounded-lg p-6 border border-cyan-500/30">
              <h2 className="text-white font-bold mb-4">
                {isArabic ? '⚡ الدواسات' : '⚡ Pedals'}
              </h2>

              {/* دواسة الإسراع */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-green-400 font-bold">
                    {isArabic ? '🚀 الإسراع (Throttle)' : '🚀 Throttle (Accelerate)'}
                  </label>
                  <span className="text-green-400 font-bold text-lg">{throttle}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={throttle}
                  onChange={(e) => setThrottle(Number(e.target.value))}
                  className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                />
                <div className="text-xs text-gray-400 mt-1">
                  {isArabic ? 'اسحب لليمين للإسراع' : 'Drag right to accelerate'}
                </div>
              </div>

              {/* دواسة الفرملة */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-red-400 font-bold">
                    {isArabic ? '🛑 الفرملة (Brake)' : '🛑 Brake (Decelerate)'}
                  </label>
                  <span className="text-red-400 font-bold text-lg">{brake}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={brake}
                  onChange={(e) => setBrake(Number(e.target.value))}
                  className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500"
                />
                <div className="text-xs text-gray-400 mt-1">
                  {isArabic ? 'اسحب لليمين للفرملة' : 'Drag right to brake'}
                </div>
              </div>

              {/* السرعة الفعلية */}
              <div className="bg-slate-700 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">
                    {isArabic ? 'السرعة الفعلية:' : 'Actual Speed:'}
                  </span>
                  <span className="text-cyan-400 font-bold text-2xl">
                    {Math.max(0, robotState.speed)}%
                  </span>
                </div>
                <div className="w-full bg-slate-600 rounded-full h-2 mt-3">
                  <div
                    className="bg-gradient-to-r from-cyan-400 to-cyan-600 h-full rounded-full transition-all duration-100"
                    style={{ width: `${Math.max(0, robotState.speed)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* معلومات إضافية */}
            <div className="bg-slate-800 rounded-lg p-6 border border-cyan-500/30">
              <h2 className="text-white font-bold mb-4">
                {isArabic ? '📊 معلومات التحكم' : '📊 Control Info'}
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">X Axis:</span>
                  <div className="text-cyan-400 font-mono">{joystickState.x.toFixed(0)}</div>
                </div>
                <div>
                  <span className="text-gray-400">Y Axis:</span>
                  <div className="text-cyan-400 font-mono">{joystickState.y.toFixed(0)}</div>
                </div>
                <div>
                  <span className="text-gray-400">
                    {isArabic ? 'الطاقة:' : 'Power:'}
                  </span>
                  <div className="text-purple-400 font-mono">{robotState.power.toFixed(1)}W</div>
                </div>
                <div>
                  <span className="text-gray-400">
                    {isArabic ? 'التيار:' : 'Current:'}
                  </span>
                  <div className="text-orange-400 font-mono">{robotState.current.toFixed(2)}A</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* نصائح الاستخدام */}
        <div className="mt-6 bg-slate-800 rounded-lg p-4 border border-cyan-500/30">
          <h3 className="text-lg font-bold text-white mb-3">
            {isArabic ? '📖 نصائح الاستخدام' : '📖 Usage Tips'}
          </h3>
          <ul className="text-slate-300 space-y-2 text-sm grid grid-cols-1 md:grid-cols-2 gap-4">
            <li>
              {isArabic
                ? '✓ اسحب الـ Joystick للتحكم في الحركة والدوران'
                : '✓ Drag Joystick to control movement and rotation'}
            </li>
            <li>
              {isArabic
                ? '✓ استخدم دواسة الإسراع لزيادة السرعة'
                : '✓ Use throttle pedal to increase speed'}
            </li>
            <li>
              {isArabic
                ? '✓ استخدم دواسة الفرملة لتقليل السرعة'
                : '✓ Use brake pedal to decrease speed'}
            </li>
            <li>
              {isArabic
                ? '✓ راقب البطارية والحرارة في الأعلى'
                : '✓ Monitor battery and temperature at top'}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
