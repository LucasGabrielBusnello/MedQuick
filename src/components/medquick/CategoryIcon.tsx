import { FileText, Pill, BookOpen, Bug, MoreHorizontal } from 'lucide-react';
import type { CategoryType } from '@/types/medquick';

const iconMap: Record<CategoryType, React.ComponentType<{ className?: string }>> = {
  template: FileText,
  drug: Pill,
  term: BookOpen,
  disease: Bug,
  other: MoreHorizontal,
};

interface CategoryIconProps {
  type: CategoryType | string;
  className?: string;
}

export function CategoryIcon({ type, className = 'w-4 h-4' }: CategoryIconProps) {
  const Icon = iconMap[type as CategoryType] ?? MoreHorizontal;
  return <Icon className={className} />;
}
