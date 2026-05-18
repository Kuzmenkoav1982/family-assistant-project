import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import { PSYCH_TESTS } from '../data/tests';

export default function TestsTab() {
  const navigate = useNavigate();

  return (
    <div className="space-y-3 mt-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
          <Icon name="ClipboardList" size={16} className="text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 text-sm">Психологические тесты</h3>
          <p className="text-xs text-gray-500">Оцените различные аспекты семейной жизни</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {PSYCH_TESTS.map((test) => (
          <Card key={test.id} className="border-blue-200/60 bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-colors">
            <CardContent className="py-3 px-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center flex-shrink-0">
                  <Icon name={test.icon} size={20} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-800 text-sm">{test.title}</h4>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{test.description}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400">{test.questions} вопросов</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate('/development')}
                      className="text-xs h-7 px-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      Пройти тест
                      <Icon name="ArrowRight" size={12} className="ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-blue-200/40 bg-blue-50/50 backdrop-blur-sm">
        <CardContent className="py-3 px-4">
          <div className="flex items-center gap-2">
            <Icon name="Info" size={14} className="text-blue-500 flex-shrink-0" />
            <p className="text-xs text-blue-700">
              Тесты находятся в разделе «Развитие». После прохождения результаты сохраняются в вашем профиле.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
