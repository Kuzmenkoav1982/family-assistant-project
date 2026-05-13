/**
 * PageLoader — глобальный fallback для React.Suspense вокруг lazy-роутов.
 *
 * Раньше был inline в App.tsx. Вынесен отдельно в Stage refactor B1, чтобы
 * App.tsx не разрастался и чтобы один и тот же loader можно было
 * переиспользовать в локальных Suspense-обёртках при будущем разбиении
 * глобального Suspense.
 *
 * Поведение и разметку НЕ менять без согласования — этот спиннер видят
 * пользователи во время первой загрузки большинства страниц.
 */
export default function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
    </div>
  );
}
