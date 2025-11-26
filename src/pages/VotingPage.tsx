import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VotingWidget } from '@/components/VotingWidget';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

export default function VotingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button onClick={() => navigate('/')} variant="outline">
            <Icon name="ArrowLeft" className="mr-2" size={16} />
            На главную
          </Button>
        </div>

        <Card className="border-2 border-purple-300">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Icon name="Vote" size={24} className="text-white" />
              </div>
              <div>
                <div>Голосования семьи</div>
                <div className="text-sm text-gray-600 font-normal">
                  Создавайте вопросы и голосуйте всей семьёй
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <VotingWidget />
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-2 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Icon name="Info" size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-700">
                <p className="font-semibold mb-2">Как это работает:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Создайте вопрос на голосование (меню, правила, общие вопросы)</li>
                  <li>Добавьте варианты ответов с описанием</li>
                  <li>Укажите срок окончания голосования</li>
                  <li>Все члены семьи смогут проголосовать за/против</li>
                  <li>После завершения результаты будут доступны всем</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
