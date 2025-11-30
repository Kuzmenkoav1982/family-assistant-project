import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_URL = 'https://functions.poehali.dev/5cab3ca7-6fa8-4ffb-b9d1-999d93d29d2e';

interface FamilyData {
  members: any[];
  tasks: any[];
  children_profiles: any[];
  test_results: any[];
  calendar_events: any[];
  family_values: any[];
  traditions: any[];
  blog_posts: any[];
  family_album: any[];
  family_tree: any[];
  chat_messages: any[];
}

const getAuthToken = () => localStorage.getItem('authToken') || '';

const fetchFamilyData = async (): Promise<FamilyData> => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Требуется авторизация');
  }

  const response = await fetch(API_URL, {
    method: 'GET',
    headers: {
      'X-Auth-Token': token
    }
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || 'Ошибка загрузки данных');
  }

  return result.data;
};

export function useFamilyDataQuery() {
  const token = getAuthToken();

  return useQuery({
    queryKey: ['familyData'],
    queryFn: fetchFamilyData,
    enabled: !!token,
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchInterval: 60000,
  });
}

interface SaveTestResultParams {
  childMemberId: string;
  testData: any;
}

const saveTestResult = async (params: SaveTestResultParams) => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Требуется авторизация');
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-Token': token
    },
    body: JSON.stringify({
      action: 'save_test_result',
      childMemberId: params.childMemberId,
      testData: params.testData
    })
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || 'Ошибка сохранения');
  }

  return result;
};

export function useSaveTestResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveTestResult,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['familyData'] });
    },
  });
}
