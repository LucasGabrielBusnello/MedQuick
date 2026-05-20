import type { Timestamp } from 'firebase/firestore';

export type CategoryType = 'template' | 'drug' | 'term' | 'exam' | 'disease' | 'other';

export interface MedItem {
  id: string;
  type: CategoryType;
  name: string;
  subcategory?: string;
  imageUrl?: string;
  keywords: string[];
  createdAt?: Timestamp | null;

  // Campos específicos
  anamneseText?: string;
  
  // Fármacos
  mechanismOfAction?: string;
  drugInteractions?: string;
  indications?: string;
  commercialNames?: string;

  // Termos
  meaning?: string;
  popularTerms?: string;

  // Doenças
  whatIs?: string;
  pathologicalMechanism?: string;
  diagnosis?: string;
  treatment?: string;
  popularNames?: string;

  // Outros
  otherText?: string;

  // --- ADICIONE ESTAS DUAS LINHAS AQUI ---
  characteristics?: string;
  description?: string;
}

export type FormData = {
  type: CategoryType | '';
  name: string;
  subcategory: string;
  imageUrl: string;
  keywords: string;
  // Campos agregados
  anamneseText: string;
  mechanismOfAction: string;
  drugInteractions: string;
  indications: string;
  commercialNames: string;
  meaning: string;
  popularTerms: string;
  whatIs: string;
  pathologicalMechanism: string;
  diagnosis: string;
  treatment: string;
  popularNames: string; // Corrigido: Removida a duplicata
  otherText: string;
};

export const emptyForm: FormData = {
  type: '',
  name: '',
  subcategory: '',
  imageUrl: '',
  keywords: '',
  anamneseText: '',
  mechanismOfAction: '',
  drugInteractions: '',
  indications: '',
  commercialNames: '',
  meaning: '',
  popularTerms: '',
  whatIs: '',
  pathologicalMechanism: '',
  diagnosis: '',
  treatment: '',
  popularNames: '', // Corrigido: Removida a duplicata
  otherText: '',
};