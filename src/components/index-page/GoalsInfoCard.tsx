import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

/**
 * GoalsInfoCard — подсказка "Как работают цели?" над списком семейных целей
 * на вкладке Goals.
 *
 * Вынесено из inline-блока Index.tsx (Stage refactor Index B2).
 * Разметка 1-в-1 как была. Никаких пропсов, никакой логики.
 */
export default function GoalsInfoCard() {
  return (
    <Card className="border-2 border-purple-200 bg-purple-50/50 mb-4">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
            <Icon name="Target" size={24} className="text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-2">Как работают цели?</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><strong>Ставьте долгосрочные цели</strong> — накопить на квартиру, поехать в отпуск, сделать ремонт.</p>
              <p><strong>Добавляйте контрольные точки</strong> для отслеживания прогресса на диаграмме Ганта.</p>
              <p><strong>Получайте подсказки от ИИ</strong> для достижения целей быстрее.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
