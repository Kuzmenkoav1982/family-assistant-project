import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { 
  ChildHealth, 
  PurchasePlan, 
  Gift, 
  Development, 
  School, 
  Dream, 
  DiaryEntry 
} from '@/types/family.types';

interface ChildData {
  health: ChildHealth;
  purchases: PurchasePlan[];
  gifts: Gift[];
  development: Development[];
  school?: School;
  dreams: Dream[];
  diary: DiaryEntry[];
  piggyBank: {
    balance: number;
    transactions: any[];
  };
}

const CHILDREN_DATA_API = 'https://functions.poehali.dev/d6f787e2-2e12-4c83-959c-8220442c6203';

const getAuthToken = () => localStorage.getItem('authToken') || '';

const fetchChildData = async (childId: string, type: string = 'all'): Promise<ChildData> => {
  const token = getAuthToken();
  
  const response = await fetch(
    `${CHILDREN_DATA_API}?child_id=${childId}&type=${type}`,
    {
      headers: {
        'X-Auth-Token': token,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Ошибка загрузки данных');
  }

  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Ошибка загрузки');
  }

  return result.data;
};

export function useChildrenDataQuery(childId: string, type: string = 'all', enabled: boolean = true) {
  return useQuery({
    queryKey: ['childData', childId, type],
    queryFn: () => fetchChildData(childId, type),
    enabled: !!childId && enabled,
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });
}

interface MutationParams {
  action: 'add' | 'update' | 'delete';
  child_id: string;
  type: string;
  item_id?: string;
  data?: any;
}

const mutateChildData = async (params: MutationParams) => {
  const token = getAuthToken();
  
  const response = await fetch(CHILDREN_DATA_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-Token': token,
    },
    body: JSON.stringify(params),
  });

  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Ошибка операции');
  }
  
  return result;
};

export function useChildDataMutation(childId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mutateChildData,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['childData', childId] });
    },
  });
}