import Icon from '@/components/ui/icon';
import type { Slide } from './slidesData';

interface SlideRendererProps {
  slide: Slide;
}

export default function SlideRenderer({ slide }: SlideRendererProps) {
  return (
    <>
      {slide.type === 'cover' && (
        <div className={`text-center py-10 sm:py-20 rounded-2xl bg-gradient-to-br ${slide.gradient} text-white`}>
          <h1 className="text-3xl sm:text-6xl font-bold mb-4 sm:mb-6">{slide.title}</h1>
          <h2 className="text-xl sm:text-3xl font-semibold mb-3 sm:mb-4">{slide.subtitle}</h2>
          <p className="text-base sm:text-xl opacity-90">{slide.content}</p>
        </div>
      )}

      {slide.type === 'problem' && (
        <div>
          <h2 className="text-2xl sm:text-4xl font-bold mb-4 sm:mb-8 text-gray-900">{slide.title}</h2>
          <div className="space-y-4">
            {slide.points?.map((point, idx) => (
              <div key={idx} className="flex items-start gap-4 p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                <Icon name="AlertCircle" className="text-red-500 mt-1" size={24} />
                <p className="text-lg text-gray-800">{point}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {slide.type === 'solution' && (
        <div>
          <h2 className="text-2xl sm:text-4xl font-bold mb-2 text-gray-900">{slide.title}</h2>
          <p className="text-base sm:text-xl text-gray-600 mb-4 sm:mb-8">{slide.subtitle}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {slide.points?.map((point, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 sm:p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                <Icon name="CheckCircle2" className="text-green-500 mt-1" size={20} />
                <p className="text-gray-800">{point}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {slide.type === 'familyid' && (
        <div>
          <div className="text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-2">Ключевая концепция</div>
          <h2 className="text-2xl sm:text-4xl font-bold mb-2 text-gray-900">{slide.title}</h2>
          <p className="text-base sm:text-xl text-gray-500 mb-2">{slide.subtitle}</p>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-8 leading-relaxed">{slide.description}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5 mb-4 sm:mb-6">
            {slide.pillars?.map((p, idx) => (
              <div key={idx} className="flex items-start gap-3 sm:gap-4 p-3 sm:p-5 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border-2 border-indigo-200">
                <div className="text-2xl sm:text-3xl">{p.icon}</div>
                <div>
                  <div className="font-bold text-gray-900 mb-1">{p.title}</div>
                  <div className="text-sm text-gray-600">{p.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-5 bg-gradient-to-r from-indigo-900 to-blue-800 rounded-xl text-white text-center">
            <Icon name="Lightbulb" size={24} className="mx-auto mb-2 text-yellow-300" />
            <p className="font-semibold">{slide.b2b}</p>
          </div>
        </div>
      )}

      {slide.type === 'traction' && (
        <div>
          <h2 className="text-2xl sm:text-4xl font-bold mb-4 sm:mb-8 text-gray-900">{slide.title}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6 mb-4 sm:mb-8">
            {slide.stats?.map((stat, idx) => (
              <div key={idx} className="text-center p-3 sm:p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
                <Icon name={stat.icon as string} className="mx-auto mb-2 sm:mb-3 text-purple-600" size={28} />
                <div className="text-2xl sm:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">{stat.value}</div>
                <div className="text-xs sm:text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
          <div className="p-6 bg-green-100 border-2 border-green-500 rounded-xl text-center">
            <p className="text-xl font-semibold text-green-900">{slide.note}</p>
          </div>
        </div>
      )}

      {slide.type === 'tech' && (
        <div>
          <h2 className="text-2xl sm:text-4xl font-bold mb-2 text-gray-900">{slide.title}</h2>
          <p className="text-xl text-gray-600 mb-8">{slide.subtitle}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
            {slide.tech?.map((tech, idx) => (
              <div key={idx} className="p-3 sm:p-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border-2 border-indigo-200">
                <h3 className="text-base sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">{tech.name}</h3>
                <p className="text-gray-600">{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {slide.type === 'market' && (
        <div>
          <h2 className="text-2xl sm:text-4xl font-bold mb-4 sm:mb-8 text-gray-900">{slide.title}</h2>
          <div className="grid grid-cols-3 gap-2 sm:gap-6 mb-4 sm:mb-8">
            <div className="p-3 sm:p-6 bg-blue-50 rounded-xl text-center">
              <div className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">TAM</div>
              <div className="text-xl sm:text-3xl font-bold text-blue-600 mb-1 sm:mb-2">{slide.data?.tam.value}</div>
              <div className="text-sm text-gray-700">{slide.data?.tam.desc}</div>
            </div>
            <div className="p-3 sm:p-6 bg-purple-50 rounded-xl text-center">
              <div className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">SAM</div>
              <div className="text-xl sm:text-3xl font-bold text-purple-600 mb-1 sm:mb-2">{slide.data?.sam.value}</div>
              <div className="text-sm text-gray-700">{slide.data?.sam.desc}</div>
            </div>
            <div className="p-3 sm:p-6 bg-green-50 rounded-xl text-center">
              <div className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">SOM</div>
              <div className="text-xl sm:text-3xl font-bold text-green-600 mb-1 sm:mb-2">{slide.data?.som.value}</div>
              <div className="text-sm text-gray-700">{slide.data?.som.desc}</div>
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-4">Конкуренты vs Мы</h3>
          <div className="space-y-3">
            {slide.competitors?.map((comp, idx) => (
              <div key={idx} className={`p-4 rounded-lg ${comp.advantage ? 'bg-green-100 border-2 border-green-500' : 'bg-gray-100'}`}>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{comp.name}</span>
                  <span className={comp.advantage ? 'text-green-700 font-bold' : 'text-red-600'}>{comp.issue || comp.advantage}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {slide.type === 'business' && (
        <div>
          <h2 className="text-2xl sm:text-4xl font-bold mb-2 text-gray-900">{slide.title}</h2>
          <p className="text-xl text-gray-600 mb-8">{slide.subtitle}</p>
          <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border-2 border-emerald-300 mb-8">
            <div className="flex items-center gap-3 mb-3">
              <Icon name="Wallet" size={28} className="text-emerald-600" />
              <h3 className="text-2xl font-bold text-emerald-900">Семейный кошелёк</h3>
            </div>
            <p className="text-gray-700 mb-4">{slide.walletInfo}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {slide.services?.map((s, idx) => (
                <div key={idx} className="bg-white rounded-lg p-3 text-center">
                  <div className="font-bold text-emerald-700">{s.price}</div>
                  <div className="text-sm text-gray-600">{s.name}</div>
                </div>
              ))}
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-4">Unit Economics</h3>
          <div className="grid grid-cols-2 gap-6">
            {slide.revenue?.map((item, idx) => (
              <div key={idx} className="p-4 bg-green-50 rounded-lg">
                <div className="text-gray-600 mb-1">{item.metric}</div>
                <div className="text-2xl font-bold text-green-700">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {slide.type === 'valuation' && (
        <div>
          <h2 className="text-2xl sm:text-4xl font-bold mb-4 sm:mb-8 text-gray-900">{slide.title}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
            <div className="p-4 sm:p-6 bg-blue-50 rounded-xl border-2 border-blue-500">
              <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">{slide.current?.title}</h3>
              <div className="text-2xl sm:text-4xl font-bold text-blue-600 mb-3 sm:mb-4">{slide.current?.value}</div>
              <ul className="space-y-2">
                {slide.current?.items.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Icon name="Check" className="text-blue-600 mt-1" size={16} />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-4 sm:p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-500">
              <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">{slide.potential?.title}</h3>
              <div className="text-2xl sm:text-4xl font-bold text-green-600 mb-3 sm:mb-4">{slide.potential?.value}</div>
              <ul className="space-y-2">
                {slide.potential?.items.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Icon name="TrendingUp" className="text-green-600 mt-1" size={16} />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {slide.type === 'roadmap' && (
        <div>
          <h2 className="text-2xl sm:text-4xl font-bold mb-4 sm:mb-8 text-gray-900">{slide.title}</h2>
          <div className="space-y-6">
            {slide.phases?.map((phase, idx) => (
              <div key={idx} className="p-3 sm:p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border-l-4 border-purple-500">
                <h3 className="text-lg sm:text-2xl font-bold text-purple-700 mb-2 sm:mb-3">{phase.period}</h3>
                <ul className="space-y-2">
                  {phase.goals.map((goal, gIdx) => (
                    <li key={gIdx} className="flex items-center gap-3">
                      <Icon name="Target" className="text-purple-600" size={20} />
                      <span className="text-gray-800 text-lg">{goal}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {slide.type === 'ask' && (
        <div>
          <h2 className="text-2xl sm:text-4xl font-bold mb-4 sm:mb-8 text-center text-gray-900">{slide.title}</h2>
          <div className="text-center mb-4 sm:mb-8">
            <div className="text-3xl sm:text-6xl font-bold text-purple-600 mb-2">{slide.ask}</div>
            <div className="text-lg sm:text-2xl text-gray-600">{slide.equity}</div>
          </div>
          <div className="mb-4 sm:mb-8">
            <h3 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-4">Использование средств:</h3>
            <div className="space-y-2 sm:space-y-3">
              {slide.use?.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 sm:p-4 bg-gray-50 rounded-lg gap-2">
                  <span className="text-sm sm:text-base text-gray-800">{item.item}</span>
                  <span className="text-sm sm:text-base font-bold text-purple-600 whitespace-nowrap">{item.amount}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="p-3 sm:p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-500">
            <h3 className="text-base sm:text-xl font-bold mb-2 sm:mb-4">Ключевые вехи:</h3>
            <ul className="space-y-2">
              {slide.milestones?.map((milestone, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <Icon name="Rocket" className="text-green-600 mt-1" size={20} />
                  <span className="text-gray-800">{milestone}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
