import React from 'react';
import * as LucideIcons from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
  size?: number;
  color?: string;
}

export const AVAILABLE_CATEGORY_ICONS = [
  'Utensils',
  'ShoppingBag',
  'Car',
  'Zap',
  'Film',
  'HeartPulse',
  'Shirt',
  'Coffee',
  'Plane',
  'Home',
  'GraduationCap',
  'Briefcase',
  'Dumbbell',
  'Gift',
  'Smartphone',
  'Wifi',
  'BookOpen',
  'Music',
  'Camera',
  'Fuel',
  'CreditCard',
  'ShieldCheck',
  'Gamepad2',
  'Baby',
  'Sparkles',
  'Folder',
];

export const AVAILABLE_COLORS = [
  '#f97316', // Orange
  '#10b981', // Emerald
  '#3b82f6', // Blue
  '#eab308', // Yellow
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#ef4444', // Red
  '#14b8a6', // Teal
  '#6366f1', // Indigo
  '#84cc16', // Lime
  '#64748b', // Slate
];

export const CategoryIcon: React.FC<CategoryIconProps> = React.memo(({ name, className = 'w-5 h-5', size, color }) => {
  // Access dynamically from LucideIcons
  const IconComponent = (LucideIcons as unknown as Record<string, React.ElementType>)[name] || LucideIcons.Folder;

  return <IconComponent className={className} size={size} style={color ? { color } : undefined} aria-hidden="true" />;
});
