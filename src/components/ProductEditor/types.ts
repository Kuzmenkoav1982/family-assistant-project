export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  dosage: string;
  count: string;
  description: string;
  emoji: string;
  rating: number;
  popular: boolean;
  inStock: boolean;
  images?: string[];
  mainImage?: string;
  aboutDescription?: string;
  aboutUsage?: string;
  documents?: Array<{name: string; url: string}>;
  videos?: Array<{title: string; url: string}>;
  compositionDescription?: string;
  compositionTable?: Array<{component: string; mass: string; percentage: string}>;
  recommendation_tags?: string[];
}

export interface ProductEditorProps {
  product: Product;
  onChange: (product: Product) => void;
  onSave: () => void;
  onCancel: () => void;
  loading: boolean;
}

export const tagMapping: Record<string, string[]> = {
  'vitamin_d3': ['витамин d', 'витамин д', 'холекальциферол', 'cholecalciferol', 'vitamin d3', 'vitamin d'],
  'omega_3': ['омега-3', 'омега 3', 'omega-3', 'omega 3', 'эпк', 'дгк', 'epa', 'dha', 'рыбий жир'],
  'magnesium': ['магний', 'magnesium', 'цитрат магния', 'оксид магния', 'magnesium citrate'],
  'b_complex': ['витамин b', 'витамин в', 'b-комплекс', 'b complex', 'тиамин', 'рибофлавин', 'ниацин', 'b1', 'b2', 'b3', 'b6', 'b12', 'фолиевая', 'folic'],
  'vitamin_c': ['витамин c', 'витамин с', 'аскорбиновая', 'ascorbic', 'vitamin c'],
  'zinc': ['цинк', 'zinc'],
  'coq10': ['коэнзим', 'q10', 'coq10', 'убихинон', 'coenzyme'],
  'iron': ['железо', 'iron', 'феррум'],
  'curcumin': ['куркумин', 'curcumin', 'куркума', 'turmeric'],
  'probiotics': ['пробиотик', 'probiotics', 'лактобактерии', 'бифидобактерии', 'lactobacillus', 'bifidobacterium'],
  'collagen': ['коллаген', 'collagen'],
  'ashwagandha': ['ашваганда', 'ашвагандха', 'ashwagandha', 'withania'],
  'l_theanine': ['л-теанин', 'l-theanine', 'теанин', 'theanine'],
  'melatonin': ['мелатонин', 'melatonin'],
  'creatine': ['креатин', 'creatine'],
  'rhodiola': ['родиола', 'rhodiola', 'золотой корень']
};
