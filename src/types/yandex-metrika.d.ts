// Яндекс.Метрика TypeScript декларации
interface Window {
  ym?: (counterId: number, action: string, goal: string, params?: Record<string, unknown>) => void;
}
