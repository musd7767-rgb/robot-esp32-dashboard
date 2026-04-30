/**
 * صفحة التحكم الرئيسية (Control Panel)
 * واجهة بسيطة وواضحة لتحكم الروبوت
 * مصممة ليفهمها أي شخص من أول ثانية
 */

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import CommandButton from '@/components/CommandButton';
import { getCommandsByRobot, groupCommandsByCategory, RobotType, Command } from '@/lib/commands';
import { Button } from '@/components/ui/button';
import { AlertCircle, Battery, Zap, Thermometer } from 'lucide-react';

interface RobotState {
  voltage: number;
  current: number;
  power: number;
  temperature: number;
  battery: number;
  motorStatus: 'stopped' | 'forward' | 'backward';
  armStatus: 'idle' | 'moving' | 'grabbing';
}

interface ControlPanelProps {
  robotType: RobotType;
}

export default function ControlPanel({ robotType }: ControlPanelProps) {
  const { language } = useLanguage();
  const [, setLocation] = useLocation();
  const isArabic = language === 'ar';

  // حالة الروبوت (بيانات محاكاة)
  const [robotState, setRobotState] = useState<RobotState>({
    voltage: 12.0,
    current: 0.5,
    power: 6.0,
    temperature: 35,
    battery: 85,
    motorStatus: 'stopped',
    armStatus: 'idle',
  });

  const [lastCommand, setLastCommand] = useState<Command | null>(null);
  const [commandFeedback, setCommandFeedback] = useState<string>('');
  const [isExecuting, setIsExecuting] = useState(false);

  // الأوامر المجمعة حسب الفئة
  const commandsByCategory = groupCommandsByCategory(robotType);

  // محاكاة تحديث بيانات الروبوت
  useEffect(() => {
    const interval = setInterval(() => {
      setRobotState((prev) => ({
        ...prev,
        voltage: 11.5 + Math.random() * 1.0,
        current: Math.random() * 2.0,
        power: Math.random() * 20,
        temperature: 30 + Math.random() * 20,
        battery: Math.max(0, prev.battery - Math.random() * 0.5),
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // معالجة تنفيذ الأمر
  const handleCommand = async (command: Command) => {
    // تأكيد الأوامر الحرجة
    if (command.requiresConfirm) {
      const confirmed = window.confirm(
        isArabic
          ? `هل أنت متأكد من ${command.nameAr}؟`
          : `Are you sure about ${command.name}?`
      );
      if (!confirmed) return;
    }

    setIsExecuting(true);
    setLastCommand(command);

    // محاكاة تنفيذ الأمر
    const feedback = isArabic ? command.descriptionAr : command.description;
    setCommandFeedback(feedback);

    // تحديث حالة الروبوت بناءً على الأمر
    if (command.action === 'moveForward') {
      setRobotState((prev) => ({ ...prev, motorStatus: 'forward' }));
    } else if (command.action === 'moveBackward') {
      setRobotState((prev) => ({ ...prev, motorStatus: 'backward' }));
    } else if (command.action === 'stop' || command.action === 'emergencyStop') {
      setRobotState((prev) => ({ ...prev, motorStatus: 'stopped' }));
    }

    // محاكاة تأخير التنفيذ
    setTimeout(() => {
      setIsExecuting(false);
    }, 500);
  };

  // الألوان بناءً على حالة البطارية
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

  const robotName = robotType === 'master' ? 'الروبوت القائد' : 'الروبوت التابع';

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 ${isArabic ? 'rtl' : 'ltr'}`}>
      {/* رأس الصفحة */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white p-6 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">🎮 {robotName}</h1>
            <p className="text-cyan-100 mt-1">
              {isArabic ? 'غرفة التحكم الرئيسية' : 'Main Control Room'}
            </p>
          </div>
          <Button
            onClick={() => setLocation('/')}
            variant="outline"
            className="text-white border-white hover:bg-white hover:text-blue-600"
          >
            {isArabic ? '← رجوع' : 'Back →'}
          </Button>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="container mx-auto p-6 max-w-7xl">
        {/* شريط المعلومات الحية */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {/* الجهد */}
          <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg p-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={20} />
              <span className="text-sm opacity-80">
                {isArabic ? 'الجهد' : 'Voltage'}
              </span>
            </div>
            <div className="text-2xl font-bold">{robotState.voltage.toFixed(1)}V</div>
          </div>

          {/* التيار */}
          <div className="bg-gradient-to-br from-orange-600 to-orange-800 rounded-lg p-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={20} />
              <span className="text-sm opacity-80">
                {isArabic ? 'التيار' : 'Current'}
              </span>
            </div>
            <div className="text-2xl font-bold">{robotState.current.toFixed(2)}A</div>
          </div>

          {/* درجة الحرارة */}
          <div className={`bg-gradient-to-br from-red-600 to-red-800 rounded-lg p-4 text-white`}>
            <div className="flex items-center gap-2 mb-2">
              <Thermometer size={20} />
              <span className="text-sm opacity-80">
                {isArabic ? 'الحرارة' : 'Temperature'}
              </span>
            </div>
            <div className={`text-2xl font-bold ${getTempColor()}`}>
              {robotState.temperature.toFixed(1)}°C
            </div>
          </div>

          {/* البطارية */}
          <div className={`bg-gradient-to-br from-green-600 to-green-800 rounded-lg p-4 text-white`}>
            <div className="flex items-center gap-2 mb-2">
              <Battery size={20} />
              <span className="text-sm opacity-80">
                {isArabic ? 'البطارية' : 'Battery'}
              </span>
            </div>
            <div className={`text-2xl font-bold ${getBatteryColor()}`}>
              {robotState.battery.toFixed(0)}%
            </div>
          </div>
        </div>

        {/* تحذيرات */}
        {robotState.battery < 20 && (
          <div className="bg-red-900 border-l-4 border-red-500 text-red-100 p-4 mb-6 rounded">
            <div className="flex items-center gap-2">
              <AlertCircle size={20} />
              <span>
                {isArabic
                  ? '⚠️ تحذير: البطارية منخفضة جداً! قد تفقد الاتصال قريباً'
                  : '⚠️ Warning: Battery critically low! May lose connection soon'}
              </span>
            </div>
          </div>
        )}

        {robotState.temperature > 60 && (
          <div className="bg-orange-900 border-l-4 border-orange-500 text-orange-100 p-4 mb-6 rounded">
            <div className="flex items-center gap-2">
              <AlertCircle size={20} />
              <span>
                {isArabic
                  ? '⚠️ تحذير: درجة الحرارة مرتفعة! قد يؤثر على الأداء'
                  : '⚠️ Warning: Temperature high! May affect performance'}
              </span>
            </div>
          </div>
        )}

        {/* آخر أمر تم تنفيذه */}
        {lastCommand && (
          <div className="bg-blue-900 border-l-4 border-blue-500 text-blue-100 p-4 mb-6 rounded">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{lastCommand.icon}</span>
              <div>
                <div className="font-bold">
                  {isArabic ? 'آخر أمر: ' : 'Last Command: '}
                  {isArabic ? lastCommand.nameAr : lastCommand.name}
                </div>
                <div className="text-sm opacity-90">{commandFeedback}</div>
              </div>
            </div>
          </div>
        )}

        {/* أقسام الأوامر */}
        <div className="space-y-8">
          {/* أوامر الحركة */}
          {commandsByCategory.movement.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <span>⬆️</span>
                {isArabic ? 'أوامر الحركة' : 'Movement Commands'}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {commandsByCategory.movement.map((cmd) => (
                  <CommandButton
                    key={cmd.id}
                    command={cmd}
                    onClick={handleCommand}
                    isLoading={isExecuting && lastCommand?.id === cmd.id}
                    size="lg"
                  />
                ))}
              </div>
            </div>
          )}

          {/* أوامر الذراع */}
          {commandsByCategory.arm.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <span>🦾</span>
                {isArabic ? 'أوامر الذراع' : 'Arm Commands'}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {commandsByCategory.arm.map((cmd) => (
                  <CommandButton
                    key={cmd.id}
                    command={cmd}
                    onClick={handleCommand}
                    isLoading={isExecuting && lastCommand?.id === cmd.id}
                    size="lg"
                  />
                ))}
              </div>
            </div>
          )}

          {/* أوامر خاصة */}
          {commandsByCategory.special.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <span>🎯</span>
                {isArabic ? 'أوامر خاصة' : 'Special Commands'}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {commandsByCategory.special.map((cmd) => (
                  <CommandButton
                    key={cmd.id}
                    command={cmd}
                    onClick={handleCommand}
                    isLoading={isExecuting && lastCommand?.id === cmd.id}
                    size="lg"
                  />
                ))}
              </div>
            </div>
          )}

          {/* أوامر الطوارئ */}
          {commandsByCategory.emergency.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <span>🚨</span>
                {isArabic ? 'أوامر الطوارئ' : 'Emergency Commands'}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {commandsByCategory.emergency.map((cmd) => (
                  <CommandButton
                    key={cmd.id}
                    command={cmd}
                    onClick={handleCommand}
                    isLoading={isExecuting && lastCommand?.id === cmd.id}
                    size="lg"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* تعليمات الاستخدام */}
        <div className="mt-12 bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-bold text-white mb-3">
            {isArabic ? '📖 نصائح الاستخدام' : '📖 Usage Tips'}
          </h3>
          <ul className="text-slate-300 space-y-2 text-sm">
            <li>
              {isArabic
                ? '✓ اضغط على أي زر لتنفيذ الأمر المقابل'
                : '✓ Click any button to execute the corresponding command'}
            </li>
            <li>
              {isArabic
                ? '✓ الألوان تحت كل زر تمثل استهلاك الطاقة'
                : '✓ Colors under each button represent power consumption'}
            </li>
            <li>
              {isArabic
                ? '✓ راقب البطارية والحرارة في الأعلى'
                : '✓ Monitor battery and temperature at the top'}
            </li>
            <li>
              {isArabic
                ? '✓ استخدم إيقاف الطوارئ في حالات الخطر'
                : '✓ Use Emergency Stop in case of danger'}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
