import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Languages } from "lucide-react";

export function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center gap-2 border-cyan-500/30 hover:border-cyan-500/60 bg-card/50"
    >
      <Languages className="w-4 h-4 text-cyan-400" />
      <span className="text-xs font-medium">
        {language === 'ar' ? 'English' : 'العربية'}
      </span>
    </Button>
  );
}
