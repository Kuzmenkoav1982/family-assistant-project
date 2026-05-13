/**
 * IndexLoadingScreen — спиннер, который показывается на главной странице,
 * пока подгружаются членов семьи и задачи (`membersLoading || tasksLoading`).
 *
 * Вынесено из inline-блока Index.tsx (Stage refactor Index B1).
 * Разметка 1-в-1 как была. Никаких пропсов, никакой логики.
 */
export default function IndexLoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 via-white to-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600 mx-auto mb-4"></div>
        <p className="text-sm text-muted-foreground">Загрузка данных семьи...</p>
      </div>
    </div>
  );
}
