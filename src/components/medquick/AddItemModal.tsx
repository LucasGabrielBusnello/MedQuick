import { useState, useEffect } from 'react';
import { X, Save, Stethoscope, Pill, BookOpen, Bug, FileText, MoreHorizontal } from 'lucide-react';
import type { MedItem, FormData, CategoryType } from '@/types/medquick';
import { emptyForm } from '@/types/medquick';

interface AddItemModalProps {
  isOpen: boolean;
  editItem?: MedItem | null;
  onClose: () => void;
  onSave: (data: Omit<MedItem, 'id' | 'createdAt'>, isEdit: boolean, id?: string) => Promise<void>;
}

const fieldClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-clinical-500/20 focus:border-clinical-500 bg-white text-slate-700 transition-all outline-none text-sm";
const textareaClass = "w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-clinical-500/20 focus:border-clinical-500 bg-white text-slate-700 transition-all outline-none resize-y text-sm leading-relaxed";

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
      {children} {required && <span className="text-red-500">*</span>}
    </label>
  );
}

function CategoryFields({ form, onChange }: { form: FormData; onChange: (field: keyof FormData, value: string) => void }) {
  switch (form.type) {
    case 'template':
      return (
        <div>
          <FieldLabel>Texto da Anamnese</FieldLabel>
          <textarea
            className={textareaClass}
            rows={16}
            placeholder="Cole ou escreva aqui o modelo completo de anamnese..."
            value={form.anamneseText}
            onChange={(e) => onChange('anamneseText', e.target.value)}
          />
        </div>
      );

    case 'drug':
      return (
        <div className="space-y-4">
          <div>
            <FieldLabel>Mecanismo de Ação</FieldLabel>
            <textarea className={textareaClass} rows={4} placeholder="Como o fármaco age no organismo..." value={form.mechanismOfAction} onChange={(e) => onChange('mechanismOfAction', e.target.value)} />
          </div>
          <div>
            <FieldLabel>Interações Medicamentosas</FieldLabel>
            <textarea className={textareaClass} rows={3} placeholder="Interações com outros medicamentos, alimentos ou condições..." value={form.drugInteractions} onChange={(e) => onChange('drugInteractions', e.target.value)} />
          </div>
          <div>
            <FieldLabel>Indicações</FieldLabel>
            <textarea className={textareaClass} rows={3} placeholder="Para quais condições é indicado..." value={form.indications} onChange={(e) => onChange('indications', e.target.value)} />
          </div>
          <div>
            <FieldLabel>Nomes Comerciais</FieldLabel>
            <input type="text" className={fieldClass} placeholder="Ex: Novalgina, Anador, Tylenol..." value={form.commercialNames} onChange={(e) => onChange('commercialNames', e.target.value)} />
          </div>
          <div>
            <FieldLabel>Palavras Chaves <span className="text-xs text-slate-400 font-normal">(separadas por vírgula)</span></FieldLabel>
            <input type="text" className={fieldClass} placeholder="Ex: analgésico, febre, dor..." value={form.keywords} onChange={(e) => onChange('keywords', e.target.value)} />
          </div>
        </div>
      );

    case 'term':
      return (
        <div className="space-y-4">
          <div>
            <FieldLabel>Significado</FieldLabel>
            <textarea className={textareaClass} rows={5} placeholder="Definição e explicação do termo médico..." value={form.meaning} onChange={(e) => onChange('meaning', e.target.value)} />
          </div>
          <div>
            <FieldLabel>Termos Populares</FieldLabel>
            <input type="text" className={fieldClass} placeholder="Como o paciente pode chamar, ex: falta de ar, tosse..." value={form.popularTerms} onChange={(e) => onChange('popularTerms', e.target.value)} />
          </div>
          <div>
            <FieldLabel>Palavras Chaves <span className="text-xs text-slate-400 font-normal">(separadas por vírgula)</span></FieldLabel>
            <input type="text" className={fieldClass} placeholder="Ex: respiração, pulmão, cardiologia..." value={form.keywords} onChange={(e) => onChange('keywords', e.target.value)} />
          </div>
        </div>
      );

    case 'disease':
      return (
        <div className="space-y-4">
          <div>
            <FieldLabel>O que é</FieldLabel>
            <textarea className={textareaClass} rows={4} placeholder="Definição geral da doença..." value={form.whatIs} onChange={(e) => onChange('whatIs', e.target.value)} />
          </div>
          <div>
            <FieldLabel>Mecanismo Patológico Específico</FieldLabel>
            <textarea className={textareaClass} rows={4} placeholder="Fisiopatologia, como a doença se desenvolve no organismo..." value={form.pathologicalMechanism} onChange={(e) => onChange('pathologicalMechanism', e.target.value)} />
          </div>
          <div>
            <FieldLabel>Diagnóstico</FieldLabel>
            <textarea className={textareaClass} rows={4} placeholder="Critérios diagnósticos, exames, sinais e sintomas..." value={form.diagnosis} onChange={(e) => onChange('diagnosis', e.target.value)} />
          </div>
          <div>
            <FieldLabel>Tratamento</FieldLabel>
            <textarea className={textareaClass} rows={4} placeholder="Conduta terapêutica, medicamentos, posologia..." value={form.treatment} onChange={(e) => onChange('treatment', e.target.value)} />
          </div>
          <div>
            <FieldLabel>Nomes Populares</FieldLabel>
            <input type="text" className={fieldClass} placeholder="Ex: Pressão Alta, Açúcar no Sangue..." value={form.popularNames} onChange={(e) => onChange('popularNames', e.target.value)} />
          </div>
          <div>
            <FieldLabel>Palavras Chaves <span className="text-xs text-slate-400 font-normal">(separadas por vírgula)</span></FieldLabel>
            <input type="text" className={fieldClass} placeholder="Ex: cardio, crônica, pressão..." value={form.keywords} onChange={(e) => onChange('keywords', e.target.value)} />
          </div>
        </div>
      );

    case 'other':
      return (
        <div className="space-y-4">
          <div>
            <FieldLabel>Conteúdo</FieldLabel>
            <textarea className={textareaClass} rows={10} placeholder="Escreva o conteúdo aqui..." value={form.otherText} onChange={(e) => onChange('otherText', e.target.value)} />
          </div>
          <div>
            <FieldLabel>Palavras Chaves <span className="text-xs text-slate-400 font-normal">(separadas por vírgula)</span></FieldLabel>
            <input type="text" className={fieldClass} placeholder="Ex: protocolo, emergência, rotina..." value={form.keywords} onChange={(e) => onChange('keywords', e.target.value)} />
          </div>
        </div>
      );

    default:
      return null;
  }
}

const CATEGORY_BUTTONS: { value: CategoryType; label: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
  { value: 'template', label: 'Anamnese', icon: FileText, color: 'hover:border-blue-400 hover:bg-blue-50 data-[active=true]:border-blue-400 data-[active=true]:bg-blue-50 data-[active=true]:text-blue-700' },
  { value: 'drug', label: 'Fármaco', icon: Pill, color: 'hover:border-emerald-400 hover:bg-emerald-50 data-[active=true]:border-emerald-400 data-[active=true]:bg-emerald-50 data-[active=true]:text-emerald-700' },
  { value: 'term', label: 'Termo Médico', icon: BookOpen, color: 'hover:border-purple-400 hover:bg-purple-50 data-[active=true]:border-purple-400 data-[active=true]:bg-purple-50 data-[active=true]:text-purple-700' },
  { value: 'disease', label: 'Doença', icon: Bug, color: 'hover:border-rose-400 hover:bg-rose-50 data-[active=true]:border-rose-400 data-[active=true]:bg-rose-50 data-[active=true]:text-rose-700' },
  { value: 'other', label: 'Outros', icon: MoreHorizontal, color: 'hover:border-slate-400 hover:bg-slate-100 data-[active=true]:border-slate-400 data-[active=true]:bg-slate-100 data-[active=true]:text-slate-700' },
];

export function AddItemModal({ isOpen, editItem, onClose, onSave }: AddItemModalProps) {
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editItem) {
        setForm({
          type: editItem.type,
          name: editItem.name,
          subcategory: editItem.subcategory ?? '',
          imageUrl: editItem.imageUrl ?? '',
          keywords: editItem.keywords?.join(', ') ?? '',
          anamneseText: editItem.anamneseText ?? '',
          mechanismOfAction: editItem.mechanismOfAction ?? editItem.characteristics ?? editItem.description ?? '',
          drugInteractions: editItem.drugInteractions ?? '',
          indications: editItem.indications ?? editItem.diagnosis ?? '',
          commercialNames: editItem.commercialNames ?? editItem.popularNames ?? '',
          meaning: editItem.meaning ?? editItem.characteristics ?? editItem.description ?? '',
          popularTerms: editItem.popularTerms ?? '',
          whatIs: editItem.whatIs ?? editItem.characteristics ?? editItem.description ?? '',
          pathologicalMechanism: editItem.pathologicalMechanism ?? '',
          diagnosis: editItem.diagnosis ?? '',
          treatment: editItem.treatment ?? '',
          popularNames: editItem.popularNames ?? '',
          otherText: editItem.otherText ?? editItem.characteristics ?? editItem.description ?? '',
        });
      } else {
        setForm(emptyForm);
      }
    }
  }, [isOpen, editItem]);

  const onChange = (field: keyof FormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.type || !form.name.trim()) return;

    setSaving(true);
    const keywords = form.keywords ? form.keywords.split(',').map(k => k.trim()).filter(Boolean) : [];

    const itemData: Omit<MedItem, 'id' | 'createdAt'> = {
      type: form.type as CategoryType,
      name: form.name.trim(),
      subcategory: form.subcategory.trim() || undefined,
      imageUrl: form.imageUrl.trim() || undefined,
      keywords,
      anamneseText: form.type === 'template' ? form.anamneseText : undefined,
      mechanismOfAction: form.type === 'drug' ? form.mechanismOfAction : undefined,
      drugInteractions: form.type === 'drug' ? form.drugInteractions : undefined,
      indications: form.type === 'drug' ? form.indications : undefined,
      commercialNames: form.type === 'drug' ? form.commercialNames : undefined,
      meaning: form.type === 'term' ? form.meaning : undefined,
      popularTerms: form.type === 'term' ? form.popularTerms : undefined,
      whatIs: form.type === 'disease' ? form.whatIs : undefined,
      pathologicalMechanism: form.type === 'disease' ? form.pathologicalMechanism : undefined,
      diagnosis: form.type === 'disease' ? form.diagnosis : undefined,
      treatment: form.type === 'disease' ? form.treatment : undefined,
      popularNames: form.type === 'disease' ? form.popularNames : undefined,
      otherText: form.type === 'other' ? form.otherText : undefined,
    };

    await onSave(itemData, !!editItem, editItem?.id);
    setSaving(false);
    onClose();
  };

  if (!isOpen) return null;

  const showSubcategory = form.type === 'drug' || form.type === 'disease' || form.type === 'term';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[95vh] flex flex-col overflow-hidden">

        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-clinical-600" />
            {editItem ? 'Editar Item' : 'Criar Novo Item'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="p-6 overflow-y-auto flex-1 space-y-6">

            {/* Seleção de Categoria */}
            <div>
              <FieldLabel required>Categoria</FieldLabel>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {CATEGORY_BUTTONS.map(cat => (
                  <button
                    key={cat.value}
                    type="button"
                    data-active={form.type === cat.value}
                    onClick={() => onChange('type', cat.value)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 border-slate-200 text-slate-600 transition-all text-sm font-medium ${cat.color}`}
                  >
                    <cat.icon className="w-5 h-5" />
                    <span className="text-xs">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {form.type && (
              <>
                {/* Nome e Subcategoria */}
                <div className={`grid gap-4 ${showSubcategory ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                  <div>
                    <FieldLabel required>Nome / Título</FieldLabel>
                    <input
                      type="text"
                      required
                      className={fieldClass}
                      placeholder={
                        form.type === 'template' ? 'Ex: Anamnese Pediátrica' :
                        form.type === 'drug' ? 'Ex: Dipirona, Losartana' :
                        form.type === 'term' ? 'Ex: Dispneia, Taquicardia' :
                        form.type === 'disease' ? 'Ex: Hipertensão Arterial' :
                        'Ex: Protocolo ABCDE'
                      }
                      value={form.name}
                      onChange={(e) => onChange('name', e.target.value)}
                    />
                  </div>
                  {showSubcategory && (
                    <div>
                      <FieldLabel>Subcategoria <span className="text-xs text-slate-400 font-normal">(Opcional)</span></FieldLabel>
                      <input
                        type="text"
                        className={fieldClass}
                        placeholder="Ex: Cardiologia, Antibiótico..."
                        value={form.subcategory}
                        onChange={(e) => onChange('subcategory', e.target.value)}
                      />
                    </div>
                  )}
                </div>

                {/* Campos específicos por categoria */}
                <CategoryFields form={form} onChange={onChange} />

                {/* URL da Imagem (Opcional) */}
                <div>
                  <FieldLabel>URL da Imagem <span className="text-xs text-slate-400 font-normal">(Opcional)</span></FieldLabel>
                  <input
                    type="url"
                    className={fieldClass}
                    placeholder="https://exemplo.com/imagem.jpg"
                    value={form.imageUrl}
                    onChange={(e) => onChange('imageUrl', e.target.value)}
                  />
                </div>
              </>
            )}
          </div>

          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-200 transition-colors">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || !form.type || !form.name.trim()}
              className="px-5 py-2.5 rounded-xl font-medium text-white bg-clinical-600 hover:bg-clinical-700 shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Salvando...' : editItem ? 'Salvar Alterações' : 'Salvar Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
