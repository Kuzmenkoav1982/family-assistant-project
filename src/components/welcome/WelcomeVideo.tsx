export default function WelcomeVideo() {
  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-white to-orange-50/30">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Посмотрите, как это работает
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Короткое видео о возможностях платформы «Наша Семья»
          </p>
        </div>

        <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black aspect-video">
          <iframe
            src="https://rutube.ru/play/embed/107d70091a1da69108300a906a38471b/"
            width="100%"
            height="100%"
            frameBorder="0"
            allow="clipboard-write; autoplay"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>
      </div>
    </section>
  );
}