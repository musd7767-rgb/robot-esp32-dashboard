/**
 * نظام الأوامر المركزي للروبوت
 * يحتوي على جميع الأوامر المتاحة للقائد والتابع
 */

export type RobotType = 'master' | 'follower';
export type CommandCategory = 'movement' | 'arm' | 'emergency' | 'special';

export interface Command {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  category: CommandCategory;
  icon: string;
  color: string;
  action: string;
  power: number; // استهلاك الطاقة (0-100)
  duration?: number; // مدة الأمر بالثواني
  requiresConfirm?: boolean; // هل يحتاج تأكيد
  robotTypes: RobotType[]; // الروبوتات المتاحة لهذا الأمر
}

/**
 * أوامر الروبوت القائد (Master)
 */
export const masterCommands: Command[] = [
  // أوامر الحركة
  {
    id: 'master-forward',
    name: 'Forward',
    nameAr: 'للأمام',
    description: 'Move the robot forward',
    descriptionAr: 'حرك الروبوت للأمام بسرعة ثابتة',
    category: 'movement',
    icon: '⬆️',
    color: 'from-green-400 to-green-600',
    action: 'moveForward',
    power: 40,
    robotTypes: ['master'],
  },
  {
    id: 'master-backward',
    name: 'Backward',
    nameAr: 'للخلف',
    description: 'Move the robot backward',
    descriptionAr: 'حرك الروبوت للخلف بسرعة ثابتة',
    category: 'movement',
    icon: '⬇️',
    color: 'from-orange-400 to-orange-600',
    action: 'moveBackward',
    power: 40,
    robotTypes: ['master'],
  },
  {
    id: 'master-left',
    name: 'Turn Left',
    nameAr: 'دوران يسار',
    description: 'Turn the robot left',
    descriptionAr: 'أدر الروبوت نحو اليسار',
    category: 'movement',
    icon: '⬅️',
    color: 'from-blue-400 to-blue-600',
    action: 'turnLeft',
    power: 35,
    robotTypes: ['master'],
  },
  {
    id: 'master-right',
    name: 'Turn Right',
    nameAr: 'دوران يمين',
    description: 'Turn the robot right',
    descriptionAr: 'أدر الروبوت نحو اليمين',
    category: 'movement',
    icon: '➡️',
    color: 'from-purple-400 to-purple-600',
    action: 'turnRight',
    power: 35,
    robotTypes: ['master'],
  },
  {
    id: 'master-stop',
    name: 'Stop',
    nameAr: 'إيقاف',
    description: 'Stop all motors',
    descriptionAr: 'أوقف جميع المحركات فوراً',
    category: 'movement',
    icon: '⏹️',
    color: 'from-red-400 to-red-600',
    action: 'stop',
    power: 5,
    robotTypes: ['master'],
  },
  {
    id: 'master-emergency',
    name: 'Emergency Stop',
    nameAr: 'إيقاف طوارئ',
    description: 'Emergency stop - immediate halt',
    descriptionAr: 'إيقاف طوارئ - توقف فوري تام',
    category: 'emergency',
    icon: '🚨',
    color: 'from-red-600 to-red-800',
    action: 'emergencyStop',
    power: 0,
    requiresConfirm: true,
    robotTypes: ['master'],
  },
];

/**
 * أوامر الروبوت التابع (Follower)
 */
export const followerCommands: Command[] = [
  // أوامر الحركة
  {
    id: 'follower-forward',
    name: 'Forward',
    nameAr: 'للأمام',
    description: 'Move forward',
    descriptionAr: 'حرك الروبوت للأمام',
    category: 'movement',
    icon: '⬆️',
    color: 'from-green-400 to-green-600',
    action: 'moveForward',
    power: 30,
    robotTypes: ['follower'],
  },
  {
    id: 'follower-backward',
    name: 'Backward',
    nameAr: 'للخلف',
    description: 'Move backward',
    descriptionAr: 'حرك الروبوت للخلف',
    category: 'movement',
    icon: '⬇️',
    color: 'from-orange-400 to-orange-600',
    action: 'moveBackward',
    power: 30,
    robotTypes: ['follower'],
  },
  {
    id: 'follower-stop',
    name: 'Stop',
    nameAr: 'إيقاف',
    description: 'Stop all motors',
    descriptionAr: 'أوقف جميع المحركات',
    category: 'movement',
    icon: '⏹️',
    color: 'from-red-400 to-red-600',
    action: 'stop',
    power: 5,
    robotTypes: ['follower'],
  },

  // أوامر الذراع
  {
    id: 'follower-arm-up',
    name: 'Arm Up',
    nameAr: 'الذراع لأعلى',
    description: 'Raise the robotic arm',
    descriptionAr: 'ارفع الذراع الروبوتية لأعلى',
    category: 'arm',
    icon: '🦾',
    color: 'from-cyan-400 to-cyan-600',
    action: 'armUp',
    power: 25,
    robotTypes: ['follower'],
  },
  {
    id: 'follower-arm-down',
    name: 'Arm Down',
    nameAr: 'الذراع لأسفل',
    description: 'Lower the robotic arm',
    descriptionAr: 'اخفض الذراع الروبوتية لأسفل',
    category: 'arm',
    icon: '🦾',
    color: 'from-cyan-400 to-cyan-600',
    action: 'armDown',
    power: 25,
    robotTypes: ['follower'],
  },
  {
    id: 'follower-grab',
    name: 'Grab',
    nameAr: 'قبض',
    description: 'Close the gripper',
    descriptionAr: 'أغلق الملقط لقبض الأشياء',
    category: 'arm',
    icon: '✋',
    color: 'from-yellow-400 to-yellow-600',
    action: 'grab',
    power: 20,
    robotTypes: ['follower'],
  },
  {
    id: 'follower-release',
    name: 'Release',
    nameAr: 'إفلات',
    description: 'Open the gripper',
    descriptionAr: 'افتح الملقط لإفلات الأشياء',
    category: 'arm',
    icon: '🖐️',
    color: 'from-yellow-400 to-yellow-600',
    action: 'release',
    power: 20,
    robotTypes: ['follower'],
  },

  // أوامر خاصة
  {
    id: 'follower-follow-master',
    name: 'Follow Master',
    nameAr: 'اتبع القائد',
    description: 'Autonomously follow the master robot',
    descriptionAr: 'اتبع الروبوت القائد تلقائياً',
    category: 'special',
    icon: '🎯',
    color: 'from-pink-400 to-pink-600',
    action: 'followMaster',
    power: 35,
    robotTypes: ['follower'],
  },
  {
    id: 'follower-avoid-obstacle',
    name: 'Avoid Obstacle',
    nameAr: 'تجنب العائق',
    description: 'Automatically avoid obstacles',
    descriptionAr: 'تجنب العوائق تلقائياً',
    category: 'special',
    icon: '🚧',
    color: 'from-indigo-400 to-indigo-600',
    action: 'avoidObstacle',
    power: 40,
    robotTypes: ['follower'],
  },
  {
    id: 'follower-return-home',
    name: 'Return Home',
    nameAr: 'العودة للبيت',
    description: 'Return to starting position',
    descriptionAr: 'عد إلى موقع البداية',
    category: 'special',
    icon: '🏠',
    color: 'from-violet-400 to-violet-600',
    action: 'returnHome',
    power: 45,
    robotTypes: ['follower'],
  },

  // إيقاف طوارئ
  {
    id: 'follower-emergency',
    name: 'Emergency Stop',
    nameAr: 'إيقاف طوارئ',
    description: 'Emergency stop - immediate halt',
    descriptionAr: 'إيقاف طوارئ - توقف فوري تام',
    category: 'emergency',
    icon: '🚨',
    color: 'from-red-600 to-red-800',
    action: 'emergencyStop',
    power: 0,
    requiresConfirm: true,
    robotTypes: ['follower'],
  },
];

/**
 * الحصول على أوامر روبوت معين
 */
export const getCommandsByRobot = (robotType: RobotType): Command[] => {
  if (robotType === 'master') {
    return masterCommands;
  }
  return followerCommands;
};

/**
 * الحصول على أوامر حسب الفئة
 */
export const getCommandsByCategory = (
  robotType: RobotType,
  category: CommandCategory
): Command[] => {
  const commands = getCommandsByRobot(robotType);
  return commands.filter((cmd) => cmd.category === category);
};

/**
 * الحصول على أمر معين بـ ID
 */
export const getCommandById = (robotType: RobotType, commandId: string): Command | undefined => {
  const commands = getCommandsByRobot(robotType);
  return commands.find((cmd) => cmd.id === commandId);
};

/**
 * تجميع الأوامر حسب الفئة
 */
export const groupCommandsByCategory = (robotType: RobotType) => {
  const commands = getCommandsByRobot(robotType);
  const grouped: Record<CommandCategory, Command[]> = {
    movement: [],
    arm: [],
    emergency: [],
    special: [],
  };

  commands.forEach((cmd) => {
    grouped[cmd.category].push(cmd);
  });

  return grouped;
};
