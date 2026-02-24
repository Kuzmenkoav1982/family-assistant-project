import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const MAMA = 'https://cdn.poehali.dev/files/e7230598-9d77-4116-be67-0ef731d8c863.jpg';
const PAPA = 'https://cdn.poehali.dev/files/8f60262a-1ae2-4766-9842-50aa2637721d.jpg';
const KID1 = 'https://cdn.poehali.dev/files/7b37fcba-0c22-4efa-a374-703dcf5af0a5.jpg';
const KID2 = 'https://cdn.poehali.dev/files/64708a2f-5955-458f-b4eb-fd302f99bed2.jpg';
const KID3 = 'https://cdn.poehali.dev/files/4dd44398-2de7-45e4-9819-c4c14a84e05b.jpg';

interface WelcomeCTAProps {
  isLoggedIn: boolean;
}

export default function WelcomeCTA({ isLoggedIn }: WelcomeCTAProps) {
  const navigate = useNavigate();

  return (
    <section className="py-16 sm:py-24">
      <div className="max-w-4xl mx-auto px-4">
        <div className="relative bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 rounded-[2rem] p-8 sm:p-12 lg:p-16 text-center text-white overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10">
            <div className="flex justify-center mb-6">
              <div className="flex -space-x-3">
                {[PAPA, MAMA, KID1, KID2, KID3].map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt=""
                    className="w-12 h-12 rounded-full border-3 border-white object-cover shadow-lg"
                    style={{ zIndex: 5 - i }}
                  />
                ))}
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/50 text-sm font-bold">
                  +500
                </div>
              </div>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 leading-tight">
              Присоединяйтесь к семьям,<br className="hidden sm:block" />
              которые уже с нами
            </h2>

            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              Начните организовывать семейную жизнь прямо сейчас. 
              Регистрация занимает 30 секунд.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {isLoggedIn ? (
                <Button
                  onClick={() => navigate('/')}
                  size="lg"
                  className="bg-white text-orange-600 hover:bg-gray-100 text-lg px-10 py-7 font-bold shadow-xl rounded-2xl"
                >
                  <Icon name="Home" size={22} className="mr-3" />
                  В приложение
                </Button>
              ) : (
                <>
                  <Button
                    onClick={() => navigate('/register')}
                    size="lg"
                    className="bg-white text-orange-600 hover:bg-gray-100 text-lg px-10 py-7 font-bold shadow-xl rounded-2xl w-full sm:w-auto"
                  >
                    <Icon name="Rocket" size={20} className="mr-2" />
                    Начать бесплатно
                  </Button>
                  <Button
                    onClick={() => {
                      localStorage.setItem('isDemoMode', 'true');
                      localStorage.setItem('demoStartTime', Date.now().toString());
                      navigate('/');
                    }}
                    size="lg"
                    variant="outline"
                    className="border-2 border-white/50 text-white hover:bg-white/10 text-lg px-8 py-7 font-semibold rounded-2xl w-full sm:w-auto"
                  >
                    <Icon name="Eye" size={20} className="mr-2" />
                    Смотреть демо
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
