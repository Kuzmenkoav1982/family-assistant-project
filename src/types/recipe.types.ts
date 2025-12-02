export interface Recipe {
  id: number;
  family_id: string;
  name: string;
  description?: string;
  category: RecipeCategory;
  cuisine: CuisineType;
  cooking_time?: number;
  difficulty: DifficultyLevel;
  servings: number;
  ingredients: string;
  instructions: string;
  dietary_tags: string[];
  image_url?: string;
  is_favorite: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export type RecipeCategory = 
  | 'breakfast' 
  | 'soup' 
  | 'main' 
  | 'side' 
  | 'salad' 
  | 'dessert' 
  | 'snack' 
  | 'drink'
  | 'other';

export type CuisineType = 
  | 'russian' 
  | 'italian' 
  | 'asian' 
  | 'american' 
  | 'french' 
  | 'mexican' 
  | 'mediterranean'
  | 'other';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface RecipeFilters {
  category?: RecipeCategory | 'all';
  cuisine?: CuisineType | 'all';
  difficulty?: DifficultyLevel | 'all';
  search?: string;
  favorites?: boolean;
}

export interface OCRResponse {
  success: boolean;
  text: string;
  parsed: {
    name: string;
    ingredients: string;
    instructions: string;
  };
}
