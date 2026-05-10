export default function WelcomePromo() {
  return (
    <section className="py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row gap-6 items-center rounded-3xl overflow-hidden bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-100 p-0">
          <img
            src="https://cdn.poehali.dev/files/60de9dee-ead5-4091-8871-69dba42ea135.jpg"
            alt="Домовёнок показывает все разделы приложения Наша Семья — ромашка с 12 направлениями"
            className="w-full sm:w-1/2 object-cover rounded-3xl"
          />
          <div className="px-6 pb-6 sm:pb-0 sm:pr-8 flex flex-col justify-center gap-3">
            <p className="text-2xl font-extrabold text-gray-900 leading-snug">«И всё это — бесплатно. Для каждой семьи!»</p>
            <p className="text-gray-500 text-sm">Домовёнок собрал 12 направлений семейной жизни в одной операционке: Семья, Здоровье, Питание, Финансы, Путешествия, Дом и быт, Развитие, Семейный код и многое другое — бесплатно.</p>
          </div>
        </div>
      </div>
    </section>
  );
}