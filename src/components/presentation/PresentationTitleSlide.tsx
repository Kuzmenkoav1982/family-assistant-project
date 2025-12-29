export function PresentationTitleSlide() {
  return (
    <div className="text-center mb-16">
      <div className="flex justify-center mb-6">
        <img 
          src="https://cdn.poehali.dev/files/Логотип Наша Семья.JPG" 
          alt="Наша семья"
          className="h-32 w-32 object-contain"
        />
      </div>
      <h1 className="text-5xl font-bold mb-4 text-slate-800">
        Наша семья
      </h1>
      <p className="text-2xl text-emerald-900">
        Объединяем семьи. Укрепляем общество.
      </p>
    </div>
  );
}