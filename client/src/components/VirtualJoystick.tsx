/**
 * مكون Virtual Joystick
 * تحكم بالروبوت مثل لعبة الفيديو
 * يدعم الماوس والـ Touch
 */

import { useEffect, useRef, useState } from 'react';

export interface JoystickState {
  x: number; // -100 إلى 100 (يسار/يمين)
  y: number; // -100 إلى 100 (أمام/خلف)
  isActive: boolean;
}

interface VirtualJoystickProps {
  onMove: (state: JoystickState) => void;
  size?: number; // حجم الـ Joystick بالبكسل
  sensitivity?: number; // حساسية الحركة
}

export default function VirtualJoystick({
  onMove,
  size = 200,
  sensitivity = 1,
}: VirtualJoystickProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const radius = size / 2;
  const knobRadius = size / 6;

  // حساب الموضع بناءً على إحداثيات الماوس/Touch
  const calculatePosition = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let x = (clientX - centerX) / radius;
    let y = (clientY - centerY) / radius;

    // تحديد المسافة من المركز
    const distance = Math.sqrt(x * x + y * y);

    // إذا كانت المسافة أكبر من 1، نقلل الإحداثيات
    if (distance > 1) {
      x = x / distance;
      y = y / distance;
    }

    // تطبيق الحساسية
    x = x * 100 * sensitivity;
    y = -y * 100 * sensitivity; // معكوس لأن الـ Y يزيد للأسفل

    setPosition({ x, y });
    onMove({ x, y, isActive: true });
  };

  // معالجة بداية الحركة (ماوس)
  const handleMouseDown = () => {
    setIsActive(true);
  };

  // معالجة حركة الماوس
  const handleMouseMove = (e: MouseEvent) => {
    if (!isActive) return;
    calculatePosition(e.clientX, e.clientY);
  };

  // معالجة نهاية الحركة (ماوس)
  const handleMouseUp = () => {
    setIsActive(false);
    setPosition({ x: 0, y: 0 });
    onMove({ x: 0, y: 0, isActive: false });
  };

  // معالجة Touch
  const handleTouchStart = () => {
    setIsActive(true);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isActive || e.touches.length === 0) return;
    e.preventDefault();
    const touch = e.touches[0];
    calculatePosition(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = () => {
    setIsActive(false);
    setPosition({ x: 0, y: 0 });
    onMove({ x: 0, y: 0, isActive: false });
  };

  // إضافة مستمعي الأحداث
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isActive]);

  const knobX = (position.x / 100) * (radius - knobRadius);
  const knobY = -(position.y / 100) * (radius - knobRadius);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* الـ Joystick */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className="relative bg-gradient-to-br from-slate-700 to-slate-900 rounded-full border-4 border-cyan-500/50 shadow-2xl shadow-cyan-500/20 cursor-grab active:cursor-grabbing select-none"
        style={{
          width: `${size}px`,
          height: `${size}px`,
        }}
      >
        {/* خطوط التوجيه */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* خط أفقي */}
          <div className="absolute w-full h-px bg-cyan-500/20" />
          {/* خط عمودي */}
          <div className="absolute h-full w-px bg-cyan-500/20" />
        </div>

        {/* الـ Knob (المقبض) */}
        <div
          ref={knobRef}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full shadow-lg shadow-cyan-500/50 transition-all duration-75 pointer-events-none"
          style={{
            width: `${knobRadius * 2}px`,
            height: `${knobRadius * 2}px`,
            transform: `translate(calc(-50% + ${knobX}px), calc(-50% + ${knobY}px))`,
          }}
        >
          {/* تأثير داخلي */}
          <div className="absolute inset-1 bg-gradient-to-br from-cyan-300 to-cyan-500 rounded-full opacity-50" />
        </div>

        {/* مؤشرات الاتجاهات */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* أعلى */}
          <div className="absolute top-2 text-cyan-400 text-xs font-bold opacity-50">⬆️</div>
          {/* أسفل */}
          <div className="absolute bottom-2 text-cyan-400 text-xs font-bold opacity-50">⬇️</div>
          {/* يسار */}
          <div className="absolute left-2 text-cyan-400 text-xs font-bold opacity-50">⬅️</div>
          {/* يمين */}
          <div className="absolute right-2 text-cyan-400 text-xs font-bold opacity-50">➡️</div>
        </div>
      </div>

      {/* عرض القيم الحالية */}
      <div className="text-center text-white text-sm">
        <div className="font-mono">
          <div>X: {position.x.toFixed(0)}</div>
          <div>Y: {position.y.toFixed(0)}</div>
        </div>
      </div>

      {/* تعليمات */}
      <div className="text-center text-gray-400 text-xs">
        <p>اسحب الـ Joystick للتحكم</p>
        <p className="text-gray-500">Drag to control</p>
      </div>
    </div>
  );
}
