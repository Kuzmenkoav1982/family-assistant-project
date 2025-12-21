import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

export function FamilyDefinitions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Icon name="BookOpen" className="text-amber-600" size={28} />
          Определение семьи
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-amber-50 p-6 rounded-lg border-l-4 border-amber-500">
          <h3 className="font-bold text-lg mb-2">📖 Современное определение (Семейный кодекс РФ)</h3>
          <p className="text-gray-700 leading-relaxed">
            <strong>Семья</strong> — это объединение лиц, связанных между собой взаимными правами и обязанностями, 
            возникающими из брака, родства, усыновления или иной формы принятия детей на воспитание.
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Источник: <a href="https://www.consultant.ru/document/cons_doc_LAW_8982/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Семейный кодекс РФ, ст. 2</a>
          </p>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
          <h3 className="font-bold text-lg mb-2">🌍 Определение ООН</h3>
          <p className="text-gray-700 leading-relaxed">
            Семья — это основная ячейка общества и естественная среда для роста и благополучия всех её членов, 
            особенно детей. Семье должны быть предоставлены самая широкая охрана и помощь.
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Источник: <a href="https://www.un.org/ru/documents/decl_conv/declarations/pactfam.shtml" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Всеобщая декларация прав человека ООН, ст. 16</a>
          </p>
        </div>

        <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-500">
          <h3 className="font-bold text-lg mb-2">⚖️ Конституция РФ</h3>
          <p className="text-gray-700 leading-relaxed">
            Материнство и детство, семья находятся под защитой государства. Забота о детях, их воспитание — 
            равное право и обязанность родителей.
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Источник: <a href="http://www.constitution.ru/10003000/10003000-4.htm" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Конституция РФ, ст. 38</a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
