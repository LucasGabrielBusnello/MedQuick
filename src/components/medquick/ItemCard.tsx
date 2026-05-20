import { Copy, Eye, Maximize2, Pencil } from 'lucide-react';
import type { MedItem } from '@/types/medquick';
import { CATEGORY_INFO } from './constants';
import { CategoryIcon } from './CategoryIcon';

interface ItemCardProps {
  item: MedItem;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onCopy: (id: string) => void;
}

export function ItemCard({ item, onView, onEdit, onCopy }: ItemCardProps) {
  const cat = CATEGORY_INFO[item.type] ?? CATEGORY_INFO.other;
  const canCopy = item.type === 'template';

  const previewText =
    item.anamneseText ||
    item.indications ||
    item.mechanismOfAction ||
    item.meaning ||
    item.whatIs ||
    item.diagnosis ||
    item.otherText ||
    item.characteristics ||
    item.description ||
    '';

  return (
    <div
      className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden cursor-pointer group relative"
      onClick={() => onView(item.id)}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onEdit(item.id); }}
        className="absolute top-3 right-3 bg-white/90 hover:bg-white text-slate-500 hover:text-clinical-600 p-2 rounded-lg transition-all shadow-sm border border-slate-200/50 z-10 opacity-0 group-hover:opacity-100 focus:opacity-100"
        title="Editar"
      >
        <Pencil className="w-4 h-4" />
      </button>

      {item.imageUrl ? (
        <div className="h-32 w-full overflow-hidden border-b border-slate-100 bg-slate-100">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x200/f1f5f9/94a3b8?text=Sem+Imagem'; }}
          />
        </div>
      ) : (
        <div className={`h-20 w-full border-b border-slate-100 bg-gradient-to-br ${cat.gradientClasses} flex items-center justify-center`}>
          <CategoryIcon type={item.type} className={`w-8 h-8 opacity-40 ${cat.iconTextClass}`} />
        </div>
      )}

      <div className="p-5 flex-1 flex flex-col">
        <div className="mb-3 flex flex-wrap gap-2 items-center">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${cat.badgeClasses}`}>
            <CategoryIcon type={item.type} className="w-3 h-3" />
            {cat.label}
          </span>
          {item.subcategory && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium border bg-slate-50 text-slate-500 border-slate-200">
              {item.subcategory}
            </span>
          )}
        </div>

        <h3 className="font-bold text-slate-800 text-base mb-2 leading-tight group-hover:text-clinical-600 transition-colors line-clamp-2">
          {item.name}
        </h3>

        <p className="text-xs text-slate-500 line-clamp-3 mb-4 flex-1 whitespace-pre-wrap">
          {previewText}
        </p>

        <div className="flex gap-2 mt-auto pt-4 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
          {canCopy ? (
            <>
              <button
                onClick={() => onCopy(item.id)}
                className="bg-clinical-50 hover:bg-clinical-100 text-clinical-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 flex-1 transition-colors border border-clinical-100"
              >
                <Copy className="w-4 h-4" /> Copiar
              </button>
              <button
                onClick={() => onView(item.id)}
                className="bg-slate-50 hover:bg-slate-100 text-slate-600 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center transition-colors border border-slate-200"
                title="Expandir"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={() => onView(item.id)}
              className="bg-slate-50 hover:bg-slate-100 text-slate-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 flex-1 transition-colors border border-slate-200"
            >
              <Eye className="w-4 h-4" /> Visualizar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
