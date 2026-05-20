import type { CategoryType } from '@/types/medquick';

export const CATEGORY_INFO: Record<CategoryType, {
  label: string;
  badgeClasses: string;
  gradientClasses: string;
  accentClass: string;
  iconTextClass: string;
}> = {
  template: {
    label: 'Anamnese',
    badgeClasses: 'bg-blue-100 text-blue-700 border-blue-200',
    gradientClasses: 'from-blue-50 to-blue-100',
    accentClass: 'bg-blue-500',
    iconTextClass: 'text-blue-300',
  },
  drug: {
    label: 'Fármaco',
    badgeClasses: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    gradientClasses: 'from-emerald-50 to-emerald-100',
    accentClass: 'bg-emerald-500',
    iconTextClass: 'text-emerald-300',
  },
  term: {
    label: 'Termo Médico',
    badgeClasses: 'bg-purple-100 text-purple-700 border-purple-200',
    gradientClasses: 'from-purple-50 to-purple-100',
    accentClass: 'bg-purple-500',
    iconTextClass: 'text-purple-300',
  },
  disease: {
    label: 'Doença',
    badgeClasses: 'bg-rose-100 text-rose-700 border-rose-200',
    gradientClasses: 'from-rose-50 to-rose-100',
    accentClass: 'bg-rose-500',
    iconTextClass: 'text-rose-300',
  },
  other: {
    label: 'Outros',
    badgeClasses: 'bg-slate-100 text-slate-700 border-slate-200',
    gradientClasses: 'from-slate-50 to-slate-100',
    accentClass: 'bg-slate-400',
    iconTextClass: 'text-slate-300',
  },
};

export const CATEGORY_TITLES: Record<string, string> = {
  all: 'Todos os Itens',
  template: 'Modelos de Anamnese',
  drug: 'Fármacos e Medicamentos',
  term: 'Termos Médicos',
  disease: 'Doenças',
  other: 'Outros Cadastros',
};

export const COLLECTION_NAME = 'medquick_items';
