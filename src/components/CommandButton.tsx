/**
 * مكون CommandButton
 * زر أمر بسيط وواضح مع أيقونة وتأثيرات بصرية
 */

import { Button } from '@/components/ui/button';
import { Command } from '@/lib/commands';
import { useLanguage } from '@/contexts/LanguageContext';

interface CommandButtonProps {
  command: Command;
  onClick: (command: Command) => void;
  isLoading?: boolean;
  isDisabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function CommandButton({
  command,
  onClick,
  isLoading = false,
  isDisabled = false,
  size = 'md',
}: CommandButtonProps) {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  const name = isArabic ? command.nameAr : command.name;
  const description = isArabic ? command.descriptionAr : command.description;

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-6 py-4 text-base',
    lg: 'px-8 py-6 text-lg',
  };

  return (
    <button
      onClick={() => onClick(command)}
      disabled={isDisabled || isLoading}
      className={`
        relative overflow-hidden rounded-lg
        bg-gradient-to-br ${command.color}
        text-white font-bold
        ${sizeClasses[size]}
        transition-all duration-300
        hover:shadow-lg hover:scale-105
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        active:scale-95
        group
      `}
      title={description}
    >
      {/* خلفية متوهجة عند التفاعل */}
      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300" />

      {/* محتوى الزر */}
      <div className="relative flex flex-col items-center gap-1">
        {/* الأيقونة */}
        <span className="text-2xl group-hover:scale-110 transition-transform duration-300">
          {command.icon}
        </span>

        {/* الاسم */}
        <span className="font-bold leading-tight">{name}</span>

        {/* مؤشر استهلاك الطاقة */}
        {command.power > 0 && (
          <div className="w-full bg-white bg-opacity-30 rounded-full h-1 mt-1">
            <div
              className="bg-white h-full rounded-full transition-all duration-300"
              style={{ width: `${command.power}%` }}
            />
          </div>
        )}

        {/* مؤشر التحميل */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg">
            <div className="animate-spin">⏳</div>
          </div>
        )}
      </div>
    </button>
  );
}
