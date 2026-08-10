import React from 'react';
import * as LucideIcons from 'lucide-react';

export interface IconProps {
  name?: string;
  size?: number;
  style?: React.CSSProperties;
  className?: string;
}

type LucideComponent = React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;

const iconMap: Record<string, LucideComponent> = {
  sun: LucideIcons.Sun as LucideComponent,
  'calendar-days': LucideIcons.CalendarDays as LucideComponent,
  sprout: LucideIcons.Sprout as LucideComponent,
  utensils: LucideIcons.Utensils as LucideComponent,
  'shopping-basket': LucideIcons.ShoppingBasket as LucideComponent,
  plus: LucideIcons.Plus as LucideComponent,
  check: LucideIcons.Check as LucideComponent,
  bell: LucideIcons.Bell as LucideComponent,
  'chevron-right': LucideIcons.ChevronRight as LucideComponent,
  x: LucideIcons.X as LucideComponent,
  sparkles: LucideIcons.Sparkles as LucideComponent,
  settings: LucideIcons.Settings as LucideComponent,
  clock: LucideIcons.Clock as LucideComponent,
  pencil: LucideIcons.Pencil as LucideComponent,
  'user-round': LucideIcons.UserRound as LucideComponent,
  home: LucideIcons.Home as LucideComponent,
  list: LucideIcons.ListTodo as LucideComponent,
  pin: LucideIcons.Pin as LucideComponent,
  trash: LucideIcons.Trash2 as LucideComponent,
};

export function Icon({ name = 'circle', size = 22, style, className }: IconProps) {
  const IconComponent = iconMap[name] || (LucideIcons.Circle as LucideComponent);
  return <IconComponent size={size} className={className} style={style} />;
}
