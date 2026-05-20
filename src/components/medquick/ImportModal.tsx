import { useState } from 'react';
import { X, ClipboardList, Check, Info } from 'lucide-react';
import type { MedItem, CategoryType } from '@/types/medquick';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (items: Omit<MedItem, 'id' | 'createdAt'>[]) => Promise<void>;
}

const CAT_MAP: Record<string, CategoryType> = {
  'anamnese': 'template', 'modelo': 'template', 'template': 'template',
  'fármaco': 'drug', 'farmaco': 'drug', 'medicamento': 'drug', 'remédio': 'drug', 'remedio': 'drug', 'drug': 'drug',
  'termo médico': 'term', 'termo medico': 'term', 'termo': 'term', 'term': 'term',
  'doença': 'disease', 'doenca': 'disease', 'disease': 'disease',
  'outro': 'other', 'outros': 'other', 'other': 'other',
};

function parseBlock(block: string): Omit<MedItem, 'id' | 'createdAt'> | null {
  const lines = block.split('\n');
  const fields: Record<string, string> = {};
  let currentKey = '';

  for (const line of lines) {
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      const possibleKey = line.substring(0, colonIdx).trim();
      if (possibleKey.length > 0 && possibleKey.length < 50) {
        currentKey = possibleKey.toLowerCase();
        fields[currentKey] = line.substring(colonIdx + 1).trim();
        continue;
      }
    }
    if (currentKey && line.trim()) {
      fields[currentKey] += '\n' + line;
    }
  }

  const get = (...keys: string[]): string => {
    for (const k of keys) {
      const val = fields[k.toLowerCase()];
      if (val !== undefined && val.trim()) return val.trim();
    }
    return '';
  };

  const nome = get('nome');
  if (!nome) return null;

  const rawCat = get('categoria').toLowerCase();
  const tipo: CategoryType = CAT_MAP[rawCat] ?? 'other';

  const tagsRaw = get('palavras chaves', 'palavras-chaves', 'tags', 'palavras_chaves');
  const keywords = tagsRaw ? tagsRaw.split(',').map(k => k.trim()).filter(Boolean) : [];

  const item: Omit<MedItem, 'id' | 'createdAt'> = {
    type: tipo,
    name: nome,
    subcategory: get('subcategoria') || undefined,
    imageUrl: get('imagem', 'image') || undefined,
    keywords,
  };

  switch (tipo) {
    case 'template':
      item.anamneseText = get('texto', 'text', 'anamnese');
      break;
    case 'drug':
      item.mechanismOfAction = get('mecanismo de ação', 'mecanismo de acao', 'mecanismo') || get('características', 'caracteristicas', 'descrição', 'descricao');
      item.drugInteractions = get('interações medicamentosas', 'interacoes medicamentosas', 'interações', 'interacoes');
      item.indications = get('indicações', 'indicacoes', 'indicação', 'indicacao') || get('diagnóstico', 'diagnostico');
      item.commercialNames = get('nomes comerciais', 'nome comercial');
      break;
    case 'term':
      item.meaning = get('significado') || get('características', 'caracteristicas', 'descrição', 'descricao');
      item.popularTerms = get('termos populares', 'popular');
      break;
    case 'disease':
      item.whatIs = get('o que é', 'o que e', 'definição', 'definicao') || get('características', 'caracteristicas', 'descrição', 'descricao');
      item.pathologicalMechanism = get('mecanismo patológico', 'mecanismo patologico', 'fisiopatologia', 'mecanismo');
      item.diagnosis = get('diagnóstico', 'diagnostico', 'sinais', 'sintomas');
      item.treatment = get('tratamento', 'tratamentos');
      item.popularNames = get('nomes populares', 'nome popular', 'nomes populares');
      break;
    case 'other':
      item.otherText = get('texto', 'descrição', 'descricao', 'características', 'caracteristicas');
      break;
  }

  return item;
}

const PLACEHOLDER = `===
Categoria: Anamnese
Nome: Anamnese Pediátrica
Texto: [Cole aqui o texto completo da anamnese]
===

===
Categoria: Fármaco
Nome: Dipirona
Subcategoria: Analgésico/Antipirético
Mecanismo de Ação: Inibição da síntese de prostaglandinas...
Interações Medicamentosas: Warfarina, álcool...
Indicações: Dor e febre
Nomes Comerciais: Novalgina, Anador
Palavras Chaves: dor, febre, analgésico
===

===
Categoria: Termo Médico
Nome: Dispneia
Significado: Sensação subjetiva de dificuldade respiratória
Termos Populares: falta de ar, sufocamento
Palavras Chaves: respiração, pulmão
===

===
Categoria: Doença
Nome: Hipertensão Arterial
Subcategoria: Cardiologia
O que é: Aumento persistente da PA acima de 140/90 mmHg
Mecanismo Patológico: Aumento da resistência vascular periférica...
Diagnóstico: PA >= 140/90 em duas medidas distintas
Tratamento: MEV + Losartana 50mg 1x/dia
Nomes Populares: Pressão Alta
Palavras Chaves: cardio, pressao, cronica
===

===
Categoria: Outro
Nome: Protocolo ABCDE
Texto: Airway, Breathing, Circulation, Disability, Exposure
Palavras Chaves: emergência, trauma, protocolo
===`;

export function ImportModal({ isOpen, onClose, onImport }: ImportModalProps) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<{ count: number; categories: Record<string, number> } | null>(null);

  if (!isOpen) return null;

  const updatePreview = (val: string) => {
    setText(val);
    const blocks = val.split('===').filter(b => b.trim());
    const parsed = blocks.map(parseBlock).filter(Boolean);
    if (parsed.length > 0) {
      const cats: Record<string, number> = {};
      parsed.forEach(p => { cats[p!.type] = (cats[p!.type] ?? 0) + 1; });
      setPreview({ count: parsed.length, categories: cats });
    } else {
      setPreview(null);
    }
  };

  const handleProcess = async () => {
    const blocks = text.split('===').filter(b => b.trim());
    const parsed = blocks.map(parseBlock).filter(Boolean) as Omit<MedItem, 'id' | 'createdAt'>[];

    if (parsed.length === 0) {
      alert('Formato inválido. Siga o modelo estruturado com ===.');
      return;
    }

    setLoading(true);
    await onImport(parsed);
    setLoading(false);
    setText('');
    setPreview(null);
    onClose();
  };

  const catLabels: Record<string, string> = {
    template: 'Anamnese', drug: 'Fármaco', term: 'Termo', disease: 'Doença', other: 'Outro'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">

        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-emerald-600" />
            Importar Itens em Massa
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 text-sm text-sky-800 flex gap-3">
            <Info className="w-5 h-5 shrink-0 mt-0.5 text-sky-600" />
            <div>
              <p className="font-semibold mb-1">Como usar:</p>
              <p>Cole o texto abaixo. Cada item deve ser separado por <code className="bg-white px-1.5 py-0.5 rounded border border-sky-200 font-bold">===</code> em linha própria. Você pode pedir a uma IA para gerar vários itens nesse formato de uma vez.</p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-slate-700">Texto estruturado:</label>
              {preview && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                  <Check className="w-3 h-3" />
                  {preview.count} item(ns) detectado(s): {Object.entries(preview.categories).map(([k, v]) => `${v} ${catLabels[k]}`).join(', ')}
                </div>
              )}
            </div>
            <textarea
              rows={16}
              className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white text-slate-700 transition-all outline-none font-mono text-xs resize-y"
              placeholder={PLACEHOLDER}
              value={text}
              onChange={(e) => updatePreview(e.target.value)}
            />
          </div>

          <details className="text-xs text-slate-500">
            <summary className="cursor-pointer font-medium text-slate-600 hover:text-slate-800">Ver formato completo por categoria</summary>
            <pre className="mt-3 bg-slate-50 border border-slate-200 rounded-xl p-4 overflow-x-auto whitespace-pre text-xs leading-relaxed">{PLACEHOLDER}</pre>
          </details>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-200 transition-colors">
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleProcess}
            disabled={loading || !text.trim()}
            className="px-5 py-2.5 rounded-xl font-medium text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="w-4 h-4" />
            {loading ? 'Importando...' : 'Processar Importação'}
          </button>
        </div>
      </div>
    </div>
  );
}
