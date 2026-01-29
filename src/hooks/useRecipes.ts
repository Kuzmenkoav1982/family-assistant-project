import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Recipe, RecipeFilters, OCRResponse } from '@/types/recipe.types';
import { DEMO_RECIPES } from '@/data/demoRecipes';

const RECIPES_API_URL = 'https://functions.poehali.dev/1469e458-c83d-4831-b626-ea58c331d634';

const getHeaders = () => {
  const token = localStorage.getItem('authToken') || '';
  return {
    'Content-Type': 'application/json',
    'X-Auth-Token': token
  };
};

export const useRecipes = (filters?: RecipeFilters) => {
  return useQuery({
    queryKey: ['recipes', filters],
    queryFn: async () => {
      const isDemoMode = localStorage.getItem('isDemoMode') === 'true';
      
      if (isDemoMode) {
        let filtered = DEMO_RECIPES.map(r => ({
          ...r,
          id: parseInt(r.id.replace('recipe-', '')),
          meal_type: r.category,
          prep_time: r.prepTime,
          cook_time: r.cookTime,
          created_by: 'Анастасия',
          created_at: '2026-01-29',
          likes: r.rating * 5,
          images: r.image ? [r.image] : []
        }));

        if (filters?.category && filters.category !== 'all') {
          filtered = filtered.filter(r => r.category === filters.category);
        }
        if (filters?.search) {
          const query = filters.search.toLowerCase();
          filtered = filtered.filter(r => 
            r.name.toLowerCase().includes(query) || 
            r.description?.toLowerCase().includes(query)
          );
        }
        
        return filtered as Recipe[];
      }

      const params = new URLSearchParams();
      if (filters?.category && filters.category !== 'all') params.append('category', filters.category);
      if (filters?.cuisine && filters.cuisine !== 'all') params.append('cuisine', filters.cuisine);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.favorites) params.append('favorites', 'true');

      const response = await fetch(`${RECIPES_API_URL}?${params.toString()}`, {
        headers: getHeaders()
      });

      const data = await response.json();
      return data.recipes as Recipe[];
    }
  });
};

export const useRecipe = (id: number) => {
  return useQuery({
    queryKey: ['recipe', id],
    queryFn: async () => {
      const response = await fetch(`${RECIPES_API_URL}?id=${id}`, {
        headers: getHeaders()
      });

      const data = await response.json();
      return data.recipe as Recipe;
    },
    enabled: !!id
  });
};

export const useCreateRecipe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recipe: Partial<Recipe>) => {
      const response = await fetch(RECIPES_API_URL, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(recipe)
      });

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    }
  });
};

export const useUpdateRecipe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recipe: Partial<Recipe> & { id: number }) => {
      const response = await fetch(RECIPES_API_URL, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(recipe)
      });

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    }
  });
};

export const useDeleteRecipe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(RECIPES_API_URL, {
        method: 'DELETE',
        headers: getHeaders(),
        body: JSON.stringify({ id })
      });

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    }
  });
};

export const useOCR = () => {
  return useMutation({
    mutationFn: async (imageUrl: string): Promise<OCRResponse> => {
      const response = await fetch(RECIPES_API_URL, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          action: 'ocr',
          image_url: imageUrl
        })
      });

      return response.json();
    }
  });
};

export interface StorageStats {
  total_size_bytes: number;
  total_size_mb: number;
  photo_count: number;
  limits: {
    free_size_mb: number;
    free_photos: number;
  };
  usage_percent: {
    size: number;
    photos: number;
  };
  is_limit_reached: boolean;
}

const STORAGE_STATS_URL = 'https://functions.poehali.dev/0fb2bb45-d1cb-43c5-b526-0baaaa91df3a';

export const useStorageStats = () => {
  return useQuery({
    queryKey: ['storage-stats'],
    queryFn: async () => {
      const response = await fetch(STORAGE_STATS_URL, {
        headers: getHeaders()
      });
      return response.json() as Promise<StorageStats>;
    }
  });
};