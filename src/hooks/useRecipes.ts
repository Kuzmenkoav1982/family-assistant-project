import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Recipe, RecipeFilters, OCRResponse } from '@/types/recipe.types';

const RECIPES_API_URL = 'https://functions.poehali.dev/1469e458-c83d-4831-b626-ea58c331d634';

const getHeaders = () => {
  const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
  return {
    'Content-Type': 'application/json',
    'X-Family-Id': authUser.family_id || '',
    'X-User-Id': authUser.id || ''
  };
};

export const useRecipes = (filters?: RecipeFilters) => {
  return useQuery({
    queryKey: ['recipes', filters],
    queryFn: async () => {
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
