import { useState } from 'react';
import { X, Pencil, Trash2, Copy, Check, Tag, Users } from 'lucide-react';
import type { MedItem } from '@/types/medquick';
import { CATEGORY_INFO } from './constants';
import { CategoryIcon } from './CategoryIcon';

interface ViewItemModalProps {
  item: MedItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

function buildCopyText(item: MedItem): string {
  const nl = '\n';
  const sep = nl + nl;
  switch (item.type) {
    case 'template':
      return item.anamneseText ?? '';
    case 'drug': {
      const parts: string[] = [`[FÁRMACO: ${item.name.toUpperCase()}]`];
      if (item.mechanismOfAction) parts.push('-- MECANISMO DE AÇÃO --' + nl + item.mechanismOfAction);
      if (item.drugInteractions) parts.push('-- INTERAÇÕES MEDICAMENTOSAS --' + nl + item.drugInteractions);
      if (item.indications) parts.push('-- INDICAÇÕES --' + nl + item.indications);
      if (item.commercialNames) parts.push('-- NOMES COMERCIAIS --' + nl + item.commercialNames);
      return parts.join(sep).trim();
    }
    case 'term': {
      const parts: string[] = [`[TERMO: ${item.name.toUpperCase()}]`];
      if (item.meaning) parts.push('-- SIGNIFICADO --' + nl + item.meaning);
      if (item.popularTerms) parts.push('-- TERMOS POPULARES --' + nl + item.popularTerms);
      return parts.join(sep).trim();
    }
    case 'disease': {
      const parts: string[] = [`[DOENÇA: ${item.name.toUpperCase()}]`];
      if (item.whatIs) parts.push('-- O QUE É --' + nl + item.whatIs);
      if (item.pathologicalMechanism) parts.push('-- MECANISMO PATOLÓGICO --' + nl + item.pathologicalMechanism);
      if (item.diagnosis) parts.push('-- DIAGNÓSTICO --' + nl + item.diagnosis);
      if (item.treatment) parts.push('-- TRATAMENTO --' + nl + item.treatment);
      if (item.popularNames) parts.push('-- NOMES POPULARES --' + nl + item.popularNames);
      return parts.join(sep).trim();
    }
    case 'other':
      return item.otherText ?? '';
    default:
      return '';
  }
}

interface Section {
  title: string;
  content: string;
  accentClass: string;
  titleColorClass: string;
  mono?: boolean;
}

function getSections(item: MedItem): Section[] {
  switch (item.type) {
    case 'template':
      return [
        { title: 'Texto da Anamnese', content: item.anamneseText ?? '', accentClass: 'bg-blue-500', titleColorClass: 'text-blue-700' },
      ].filter(s => s.content.trim());
    case 'drug':
      return [
        { title: 'Mecanismo de Ação', content: item.mechanismOfAction ?? item.characteristics ?? item.description ?? '', accentClass: 'bg-emerald-500', titleColorClass: 'text-emerald-700' },
        { title: 'Interações Medicamentosas', content: item.drugInteractions ?? '', accentClass: 'bg-amber-500', titleColorClass: 'text-amber-700' },
        { title: 'Indicações', content: item.indications ?? item.diagnosis ?? '', accentClass: 'bg-sky-500', titleColorClass: 'text-sky-700' },
        { title: 'Nomes Comerciais', content: item.commercialNames ?? '', accentClass: 'bg-purple-500', titleColorClass: 'text-purple-700' },
      ].filter(s => s.content.trim());
    case 'term':
      return [
        { title: 'Significado', content: item.meaning ?? item.characteristics ?? item.description ?? '', accentClass: 'bg-purple-500', titleColorClass: 'text-purple-700' },
        { title: 'Termos Populares', content: item.popularTerms ?? '', accentClass: 'bg-slate-400', titleColorClass: 'text-slate-600' },
      ].filter(s => s.content.trim());
    case 'disease':
      return [
        { title: 'O que é', content: item.whatIs ?? item.characteristics ?? item.description ?? '', accentClass: 'bg-rose-500', titleColorClass: 'text-rose-700' },
        { title: 'Mecanismo Patológico', content: item.pathologicalMechanism ?? '', accentClass: 'bg-orange-500', titleColorClass: 'text-orange-700' },
        { title: 'Diagnóstico', content: item.diagnosis ?? '', accentClass: 'bg-amber-500', titleColorClass: 'text-amber-700' },
        { title: 'Tratamento', content: item.treatment ?? '', accentClass: 'bg-emerald-500', titleColorClass: 'text-emerald-700', mono: true },
      ].filter(s => s.content.trim());
    case 'other':
      return [
        { title: 'Conteúdo', content: item.otherText ?? item.characteristics ?? item.description ?? '', accentClass: 'bg-slate-400', titleColorClass: 'text-slate-600' },
      ].filter(s => s.content.trim());
    default:
      return [];
  }
}

export function ViewItemModal({ item, isOpen, onClose, onEdit, onDelete }: ViewItemModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !item) return null;

  const cat = CATEGORY_INFO[item.type] ?? CATEGORY_INFO.other;
  const sections = getSections(item);

  const handleCopy = () => {
    const text = buildCopyText(item);
    const copyFn = () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(copyFn).catch(() => fallbackCopy(text, copyFn));
    } else {
      fallbackCopy(text, copyFn);
    }
  };

  const fallbackCopy = (text: string, cb: () => void) => {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    cb();
  };

  const handleDelete = () => {
    if (confirm('Tem certeza que deseja excluir? Esta ação excluirá de TODOS os dispositivos.')) {
      onDelete(item.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">

        <div className={`relative h-36 sm:h-48 w-full shrink-0 ${item.imageUrl ? 'bg-black' : 'bg-slate-800'}`}>
          {item.imageUrl && (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover opacity-70"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />

          <div className="absolute top-3 right-3 flex gap-2 z-10">
            <button
              onClick={() => { onClose(); setTimeout(() => onEdit(item.id), 200); }}
              className="text-white bg-black/40 hover:bg-black/60 backdrop-blur-md p-2 rounded-full transition-colors"
              title="Editar"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="text-white bg-black/40 hover:bg-black/60 backdrop-blur-md p-2 rounded-full transition-colors" title="Fechar">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-white/20 text-white backdrop-blur-md border border-white/30">
                <CategoryIcon type={item.type} className="w-3 h-3" />
                {cat.label}
              </span>
              {item.subcategory && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-white/20 text-white backdrop-blur-md border border-white/30">
                  <Tag className="w-3 h-3" /> {item.subcategory}
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-md">{item.name}</h2>
            {(item.popularNames || item.popularTerms) && (
              <p className="text-sm text-slate-300 mt-1 italic flex items-center gap-1">
                <Users className="w-3 h-3" />
                Popular: {item.popularNames ?? item.popularTerms}
              </p>
            )}
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-slate-50 space-y-4">
          {sections.map((section, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${section.accentClass}`} />
              <h4 className={`text-xs font-bold ${section.titleColorClass} uppercase tracking-wider mb-3`}>{section.title}</h4>
              <pre className={`whitespace-pre-wrap font-sans text-sm text-slate-700 leading-relaxed ${section.mono ? 'font-mono bg-slate-50 p-3 rounded-xl border border-slate-100' : ''}`}>
                {section.content}
              </pre>
            </div>
          ))}

          {item.keywords && item.keywords.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {item.keywords.map((k, i) => (
                <span key={i} className="bg-slate-200 text-slate-600 px-2.5 py-1 rounded-md text-xs font-medium border border-slate-300">#{k}</span>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-white flex justify-between items-center shrink-0">
          <button
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" /> Excluir
          </button>
          <button
            onClick={handleCopy}
            className={`px-6 py-2.5 rounded-xl font-bold text-white shadow-sm transition-all flex items-center gap-2 ${copied ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-clinical-600 hover:bg-clinical-700'}`}
          >
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            {copied ? 'Copiado!' : 'Copiar para o Prontuário'}
          </button>
        </div>
      </div>
    </div>
  );
}
