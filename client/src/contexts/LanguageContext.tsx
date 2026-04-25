import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations = {
  ar: {
    // Selection Page
    'selection.title': '🤖 متحكم الروبوت',
    'selection.subtitle': 'اختر نوع الروبوت الذي تريد التحكم به',
    'selection.master.title': 'الروبوت القائد',
    'selection.master.subtitle': 'Master Robot',
    'selection.master.desc': 'تحكم كامل في الروبوت الرئيسي مع مراقبة جميع البيانات والإحصائيات',
    'selection.master.button': 'اختر القائد',
    'selection.follower.title': 'الروبوت التابع',
    'selection.follower.subtitle': 'Follower Robot',
    'selection.follower.desc': 'تحكم في الروبوت التابع مع مراقبة بيانات الأداء والاستهلاك',
    'selection.follower.button': 'اختر التابع',
    'selection.footer': 'اختر الروبوت المطلوب للبدء في التحكم والمراقبة',
    
    // Dashboards Common
    'dashboard.back': 'رجوع',
    'dashboard.voltage': 'الجهد (Voltage)',
    'dashboard.current': 'التيار (Current)',
    'dashboard.power': 'الطاقة (Power)',
    'dashboard.temp': 'درجة الحرارة (Temp)',
    'dashboard.motor_control': 'التحكم بالمحرك',
    'dashboard.speed': 'السرعة',
    'dashboard.forward': 'للأمام',
    'dashboard.stop': 'إيقاف',
    'dashboard.backward': 'للخلف',
    'dashboard.motor_status': 'حالة المحرك',
    'dashboard.status.stopped': 'متوقف',
    'dashboard.status.forward': 'للأمام',
    'dashboard.status.backward': 'للخلف',
    'dashboard.energy_stats': 'إحصائيات الطاقة',
    'dashboard.max_power': 'أقصى طاقة',
    'dashboard.avg_power': 'متوسط الطاقة',
    'dashboard.max_current': 'أقصى تيار',
    'dashboard.total_energy': 'الطاقة الكلية',
    'dashboard.power_consumption': 'استهلاك الطاقة',
    'dashboard.voltage_current': 'الجهد والتيار',
    'dashboard.temp_monitor': 'مراقبة درجة الحرارة',
    
    // Master Specific
    'master.title': '👑 الروبوت القائد (Master)',
    'master.subtitle': '✨ نظام التحكم والمراقبة الرئيسي',
    'master.footer': '🚀 لوحة تحكم الروبوت القائد - بيانات فعلية من ESP32',
    
    // Follower Specific
    'follower.title': '🤝 الروبوت التابع (Follower)',
    'follower.subtitle': '✨ نظام المراقبة والتحكم الثانوي',
    'follower.footer': '🚀 لوحة تحكم الروبوت التابع - بيانات فعلية من ESP32',

    // Language Selection Page
    'lang.title': 'اختر اللغة / Choose Language',
    'lang.arabic': 'العربية',
    'lang.english': 'English',
    '404.title': 'الصفحة غير موجودة',
    '404.message': 'عذراً، الصفحة التي تبحث عنها غير موجودة. قد تكون قد تم نقلها أو حذفها.'
  },
  en: {
    // Selection Page
    'selection.title': '🤖 Robot Controller',
    'selection.subtitle': 'Choose the robot type you want to control',
    'selection.master.title': 'Master Robot',
    'selection.master.subtitle': 'Main Controller',
    'selection.master.desc': 'Full control of the main robot with monitoring of all data and statistics',
    'selection.master.button': 'Select Master',
    'selection.follower.title': 'Follower Robot',
    'selection.follower.subtitle': 'Secondary Controller',
    'selection.follower.desc': 'Control the follower robot with performance and consumption data monitoring',
    'selection.follower.button': 'Select Follower',
    'selection.footer': 'Select the desired robot to start control and monitoring',
    
    // Dashboards Common
    'dashboard.back': 'Back',
    'dashboard.voltage': 'Voltage',
    'dashboard.current': 'Current',
    'dashboard.power': 'Power',
    'dashboard.temp': 'Temperature',
    'dashboard.motor_control': 'Motor Control',
    'dashboard.speed': 'Speed',
    'dashboard.forward': 'Forward',
    'dashboard.stop': 'Stop',
    'dashboard.backward': 'Backward',
    'dashboard.motor_status': 'Motor Status',
    'dashboard.status.stopped': 'Stopped',
    'dashboard.status.forward': 'Forward',
    'dashboard.status.backward': 'Backward',
    'dashboard.energy_stats': 'Energy Statistics',
    'dashboard.max_power': 'Max Power',
    'dashboard.avg_power': 'Avg Power',
    'dashboard.max_current': 'Max Current',
    'dashboard.total_energy': 'Total Energy',
    'dashboard.power_consumption': 'Power Consumption',
    'dashboard.voltage_current': 'Voltage & Current',
    'dashboard.temp_monitor': 'Temperature Monitoring',
    
    // Master Specific
    'master.title': '👑 Master Robot',
    'master.subtitle': '✨ Main Control & Monitoring System',
    'master.footer': '🚀 Master Robot Dashboard - Real-time data from ESP32',
    
    // Follower Specific
    'follower.title': '🤝 Follower Robot',
    'follower.subtitle': '✨ Secondary Monitoring & Control System',
    'follower.footer': '🚀 Follower Robot Dashboard - Real-time data from ESP32',

    // Language Selection Page
    'lang.title': 'Choose Language / اختر اللغة',
    'lang.arabic': 'Arabic',
    'lang.english': 'English',
    '404.title': 'Page Not Found',
    '404.message': "Sorry, the page you are looking for doesn't exist. It may have been moved or deleted."
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app_language');
    return (saved as Language) || 'ar';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
  };

  const toggleLanguage = () => {
    const newLang = language === 'ar' ? 'en' : 'ar';
    setLanguage(newLang);
  };

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    
    // Force a small delay to ensure layout shifts are handled
    const timeout = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
    
    return () => clearTimeout(timeout);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['ar']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
