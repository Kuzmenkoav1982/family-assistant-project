import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface PlansInstructionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PlansInstruction({ open, onOpenChange }: PlansInstructionProps) {
  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-blue-100/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Icon name="Info" size={20} className="text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">Инструкция по управлению тарифами</CardTitle>
                  <CardDescription>Как настроить тарифные планы для пользователей</CardDescription>
                </div>
              </div>
              <Icon
                name={open ? 'ChevronUp' : 'ChevronDown'}
                size={24}
                className="text-blue-600"
              />
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <Icon name="Edit2" size={16} />
                  Как редактировать тариф
                </h4>
                <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                  <li>Нажмите "Редактировать" на нужном тарифе</li>
                  <li>Измените название, цену, период или описание</li>
                  <li>Включите/выключите нужные функции</li>
                  <li>Нажмите "Сохранить изменения"</li>
                </ol>
              </div>

              <div className="p-4 bg-white rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <Icon name="Plus" size={16} />
                  Как добавить функции
                </h4>
                <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                  <li>Откройте режим редактирования тарифа</li>
                  <li>Найдите раздел "Добавить функцию"</li>
                  <li>Выберите нужные функции из списка</li>
                  <li>Они автоматически добавятся в тариф</li>
                </ol>
              </div>

              <div className="p-4 bg-white rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <Icon name="Eye" size={16} />
                  Видимость тарифа
                </h4>
                <p className="text-sm text-gray-700">
                  Переключатель "Видимость" управляет отображением тарифа на сайте. 
                  Выключенные тарифы не показываются пользователям, но активные подписки продолжают работать.
                </p>
              </div>

              <div className="p-4 bg-white rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <Icon name="Tag" size={16} />
                  Скидки и периоды
                </h4>
                <p className="text-sm text-gray-700">
                  Укажите процент скидки для длинных периодов подписки (например, 20% за 3 месяца, 50% за год). 
                  Это мотивирует пользователей покупать долгие подписки.
                </p>
              </div>

              <div className="p-4 bg-white rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <Icon name="Calendar" size={16} />
                  Планирование запуска
                </h4>
                <p className="text-sm text-gray-700">
                  Поле "Активен с даты" позволяет запланировать появление тарифа на сайте. 
                  До указанной даты тариф не будет виден пользователям, даже если он включён. 
                  Используйте для предзапуска акций и новых тарифов.
                </p>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-orange-200">
              <h4 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
                <Icon name="AlertTriangle" size={16} />
                Важно помнить
              </h4>
              <ul className="text-sm text-orange-800 space-y-1 list-disc list-inside">
                <li>Изменение цены не влияет на уже активные подписки</li>
                <li>Удаление функции из тарифа не отключит её у текущих пользователей</li>
                <li>Сохраняйте изменения после каждого редактирования</li>
                <li>Тарифы с будущей датой "Активен с" не отображаются на сайте до этой даты</li>
                <li>Рекомендуем не менять цены чаще 1 раза в квартал</li>
              </ul>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
