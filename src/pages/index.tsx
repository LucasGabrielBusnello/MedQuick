import { useState, useEffect, useCallback } from 'react';
import {
  Search, Plus, Stethoscope, LayoutGrid, FileText, Pill, BookOpen, Bug, MoreHorizontal,
  CloudCheck, WifiOff, Database
} from 'lucide-react';
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc,
  serverTimestamp, query, orderBy
} from 'firebase/firestore';
import { db, firebaseConfig } from '@/lib/firebase';
import type { MedItem, CategoryType } from '@/types/medquick';
import { CATEGORY_INFO, CATEGORY_TITLES, COLLECTION_NAME } from '@/components/medquick/constants';
import { ItemCard } from '@/components/medquick/ItemCard';
import { AddItemModal } from '@/components/medquick/AddItemModal';
import { ViewItemModal } from '@/components/medquick/ViewItemModal';
import { ImportModal } from '@/components/medquick/ImportModal';

type FilterCategory = CategoryType | 'all';

const NAV_ITEMS: { category: FilterCategory; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { category: 'all', label: 'Todos os Itens', icon: LayoutGrid },
  { category: 'template', label: 'Anamnese', icon: FileText },
  { category: 'drug', label: 'Fármacos', icon: Pill },
  { category: 'term', label: 'Termos Médicos', icon: BookOpen },
  { category: 'disease', label: 'Doenças', icon: Bug },
  { category: 'other', label: 'Outros', icon: MoreHorizontal },
];

type ToastType = { id: number; message: string; type: 'success' | 'error' | 'info' };

export default function Index() {
  const [items, setItems] = useState<MedItem[]>([]);
  const [filter, setFilter] = useState<FilterCategory>('all');
  const [subcategoryFilter, setSubcategoryFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [useFirebase, setUseFirebase] = useState(false);
  const [connected, setConnected] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);

  const [editItem, setEditItem] = useState<MedItem | null>(null);
  const [viewItem, setViewItem] = useState<MedItem | null>(null);

  const [toasts, setToasts] = useState<ToastType[]>([]);

  const showToast = useCallback((message: string, type: ToastType['type'] = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  // Firebase Init
  useEffect(() => {
    if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'SUA_API_KEY') {
      const stored = localStorage.getItem('medquick_data_v2');
      if (stored) {
        try { setItems(JSON.parse(stored)); } catch { /* ignore */ }
      }
      return;
    }

    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      const unsub = onSnapshot(q, (snapshot) => {
        const data: MedItem[] = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as MedItem));
        setItems(data);
        setUseFirebase(true);
        setConnected(true);
      }, (err) => {
        console.error('Firestore error:', err);
        setConnected(false);
        const stored = localStorage.getItem('medquick_data_v2');
        if (stored) {
          try { setItems(JSON.parse(stored)); } catch { /* ignore */ }
        }
      });
      return unsub;
    } catch (e) {
      console.error('Firebase init error:', e);
    }
  }, []);

  // Persist locally when not using Firebase
  useEffect(() => {
    if (!useFirebase) {
      localStorage.setItem('medquick_data_v2', JSON.stringify(items));
    }
  }, [items, useFirebase]);

  const saveItem = async (
    itemData: Omit<MedItem, 'id' | 'createdAt'>,
    isEdit: boolean,
    id?: string
  ) => {
    // 1. FILTRO DE LIMPEZA: Remove qualquer campo que seja undefined
    const cleanData = { ...itemData };
    Object.keys(cleanData).forEach(key => {
      if (cleanData[key as keyof typeof cleanData] === undefined) {
        delete cleanData[key as keyof typeof cleanData];
      }
    });

    // 2. SALVA NO FIREBASE OU LOCAL
    if (useFirebase) {
      if (isEdit && id) {
        await updateDoc(doc(db, COLLECTION_NAME, id), cleanData);
        showToast('Item atualizado na nuvem!', 'success');
      } else {
        await addDoc(collection(db, COLLECTION_NAME), { ...cleanData, createdAt: serverTimestamp() });
        showToast('Item criado na nuvem!', 'success');
      }
    } else {
      if (isEdit && id) {
        setItems(prev => prev.map(i => i.id === id ? { ...i, ...cleanData } as MedItem : i));
        showToast('Item atualizado!', 'success');
      } else {
        const newItem = { ...cleanData, id: 'local_' + Date.now(), keywords: cleanData.keywords ?? [] } as MedItem;
        setItems(prev => [newItem, ...prev]);
        showToast('Item salvo localmente!', 'success');
      }
    }
  };
  const deleteItem = async (id: string) => {
    if (useFirebase) {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
      showToast('Item excluído da nuvem.', 'success');
    } else {
      setItems(prev => prev.filter(i => i.id !== id));
      showToast('Item excluído.', 'success');
    }
  };

  const handleImport = async (newItems: Omit<MedItem, 'id' | 'createdAt'>[]) => {
    for (const item of newItems) {
      await saveItem(item, false);
    }
    showToast(`${newItems.length} item(ns) importado(s) com sucesso!`, 'success');
  };

  const handleCopyItem = (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    const text = item.anamneseText ?? item.otherText ?? '';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => showToast('Texto copiado!', 'success'));
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('Texto copiado!', 'success');
    }
  };

  const openEdit = (id: string) => {
    const item = items.find(i => i.id === id);
    if (item) {
      setEditItem(item);
      setShowViewModal(false);
      setShowAddModal(true);
    }
  };

  const openView = (id: string) => {
    const item = items.find(i => i.id === id);
    if (item) {
      setViewItem(item);
      setShowViewModal(true);
    }
  };

  // Filtering & Search
  const baseFiltered = items.filter(item => {
    const matchesCat = filter === 'all' || item.type === filter;
    const q = search.toLowerCase().trim();
    if (!q) return matchesCat;
    const keyMatch = item.keywords?.some(k => k.toLowerCase().includes(q));
    const textSearch = [
      item.name,
      item.subcategory,
      item.anamneseText,
      item.mechanismOfAction,
      item.drugInteractions,
      item.indications,
      item.commercialNames,
      item.meaning,
      item.popularTerms,
      item.whatIs,
      item.pathologicalMechanism,
      item.diagnosis,
      item.treatment,
      item.popularNames,
      item.otherText,
      item.characteristics,
      item.description,
      CATEGORY_INFO[item.type]?.label,
    ].filter(Boolean).join(' ').toLowerCase();
    return matchesCat && (textSearch.includes(q) || keyMatch);
  });

  const uniqueSubcats = Array.from(new Set(baseFiltered.map(i => i.subcategory).filter(Boolean) as string[])).sort();

  const filtered = baseFiltered
    .filter(item => subcategoryFilter === 'all' || item.subcategory === subcategoryFilter)
    .sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        const aTs = (a.createdAt as { seconds?: number }).seconds ?? 0;
        const bTs = (b.createdAt as { seconds?: number }).seconds ?? 0;
        return bTs - aTs;
      }
      return b.id.localeCompare(a.id);
    });

  const handleFilterChange = (cat: FilterCategory) => {
    setFilter(cat);
    setSubcategoryFilter('all');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-800 font-sans antialiased">

      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 h-full shadow-sm z-10 shrink-0">
        <div className="p-6 flex items-center gap-3 text-clinical-600 border-b border-slate-100">
          <Stethoscope className="w-8 h-8" />
          <h1 className="text-xl font-bold tracking-tight">MedQuick</h1>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto">
          {NAV_ITEMS.map(({ category, label, icon: Icon }) => (
            <button
              key={category}
              onClick={() => handleFilterChange(category)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-colors ${
                filter === category
                  ? 'bg-clinical-50 text-clinical-700'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200">
          {connected ? (
            <p className="text-xs text-emerald-600 text-center flex flex-col items-center gap-1 font-medium">
              <CloudCheck className="w-5 h-5" />
              Nuvem Sincronizada
            </p>
          ) : useFirebase ? (
            <p className="text-xs text-amber-600 text-center flex flex-col items-center gap-1">
              <WifiOff className="w-5 h-5" />
              Reconectando...
            </p>
          ) : (
            <p className="text-xs text-slate-400 text-center flex flex-col items-center gap-1">
              <Database className="w-5 h-5" />
              Modo Local
            </p>
          )}
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col h-full min-w-0">

        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 flex gap-4 justify-between items-center z-10 shadow-sm sticky top-0 shrink-0">
          <div className="flex items-center gap-2 text-clinical-600 md:hidden">
            <Stethoscope className="w-6 h-6" />
            <span className="text-lg font-bold">MedQuick</span>
          </div>

          <div className="relative flex-1 max-w-2xl group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-clinical-500 transition-colors w-4 h-4" />
            <input
              type="text"
              placeholder="Pesquisar por nome, indicação, palavras-chave..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-clinical-500/20 focus:border-clinical-500 transition-all text-sm"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="relative hidden sm:block">
            <button
              onClick={() => setShowActionMenu(v => !v)}
              className="flex whitespace-nowrap items-center gap-2 bg-clinical-600 hover:bg-clinical-700 text-white px-5 py-3 rounded-xl font-medium transition-all shadow-md hover:shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Novo Item
            </button>
            {showActionMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowActionMenu(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 z-40 overflow-hidden">
                  <button
                    onClick={() => { setShowActionMenu(false); setEditItem(null); setShowAddModal(true); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
                  >
                    <span className="bg-clinical-100 text-clinical-600 w-8 h-8 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Criar Manualmente</p>
                      <p className="text-xs text-slate-500">Preencher formulário</p>
                    </div>
                  </button>
                  <button
                    onClick={() => { setShowActionMenu(false); setShowImportModal(true); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left border-t border-slate-100"
                  >
                    <span className="bg-emerald-100 text-emerald-600 w-8 h-8 rounded-lg flex items-center justify-center">
                      <Plus className="w-4 h-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Importar em Massa</p>
                      <p className="text-xs text-slate-500">Colar texto estruturado</p>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Mobile Nav */}
        <div className="md:hidden flex overflow-x-auto gap-2 px-4 py-3 bg-white border-b border-slate-200 hide-scrollbar shrink-0">
          {NAV_ITEMS.map(({ category, label }) => (
            <button
              key={category}
              onClick={() => handleFilterChange(category)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === category
                  ? 'bg-clinical-100 text-clinical-700'
                  : 'text-slate-600 bg-slate-100'
              }`}
            >
              {label === 'Todos os Itens' ? 'Todos' : label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-4 flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">{CATEGORY_TITLES[filter]}</h2>
                <p className="text-sm text-slate-500 mt-1">{filtered.length} item(ns) encontrado(s)</p>
              </div>
            </div>

            {/* Subcategory filters */}
            {uniqueSubcats.length > 0 && (
              <div className="flex overflow-x-auto gap-2 mb-6 hide-scrollbar pb-1">
                <button
                  onClick={() => setSubcategoryFilter('all')}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                    subcategoryFilter === 'all'
                      ? 'bg-clinical-600 text-white border-clinical-600 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Todas
                </button>
                {uniqueSubcats.map(sub => (
                  <button
                    key={sub}
                    onClick={() => setSubcategoryFilter(sub)}
                    className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                      subcategoryFilter === sub
                        ? 'bg-clinical-600 text-white border-clinical-600 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            )}

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                  <Search className="w-10 h-10" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700">Nenhum item encontrado</h3>
                <p className="text-slate-500 max-w-sm mt-2">Tente pesquisar com termos diferentes ou adicione um novo item.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filtered.map(item => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onView={openView}
                    onEdit={openEdit}
                    onCopy={handleCopyItem}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile FAB */}
      <button
        onClick={() => { setEditItem(null); setShowAddModal(true); }}
        className="sm:hidden fixed bottom-6 right-6 w-14 h-14 bg-clinical-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-clinical-700 active:scale-95 transition-all z-40"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Modals */}
      <AddItemModal
        isOpen={showAddModal}
        editItem={editItem}
        onClose={() => { setShowAddModal(false); setEditItem(null); }}
        onSave={saveItem}
      />

      <ViewItemModal
        item={viewItem}
        isOpen={showViewModal}
        onClose={() => { setShowViewModal(false); setViewItem(null); }}
        onEdit={(id) => { setShowViewModal(false); setTimeout(() => openEdit(id), 150); }}
        onDelete={deleteItem}
      />

      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImport}
      />

      {/* Toast Notifications */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-white pointer-events-auto text-sm font-medium ${
              toast.type === 'success' ? 'bg-emerald-600' : toast.type === 'error' ? 'bg-red-600' : 'bg-slate-800'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}
