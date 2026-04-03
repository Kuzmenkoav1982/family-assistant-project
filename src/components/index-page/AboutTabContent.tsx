import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

export default function AboutTabContent() {
  return (
    <TabsContent value="about">
      <Card key="about-card" className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Icon name="Heart" className="text-red-500" />
            О проекте
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-lg max-w-none">
          <div className="space-y-6">
            <div className="text-center py-8 bg-white rounded-lg shadow-sm">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent mb-4">
                Здоровая семья - Здоровая страна!
              </h1>
              <p className="text-2xl font-semibold text-purple-700 mb-2">
                Проект создан для объединения семей!
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm space-y-4">
              <p className="text-lg leading-relaxed">
                Семья - главный проект нашей жизни, от успехов в семье зависит успех нашего общества.
              </p>

              <p className="text-lg leading-relaxed">
                Самое важное в семейных ценностях — это возможность сблизить членов семьи, сделать их командой, которая может справиться с любыми невзгодами и каждый в ней имеет значение. Поэтому берегите фамильное наследие вместе, уделяя при этом достаточно внимания ребенку и позволяя ему или ей играть определенную роль, чтобы дать маленькому человеку почувствовать себя частью чего-то большего.
              </p>

              <p className="text-lg leading-relaxed">
                Дети полюбят семейные традиции и ценности, если будут счастливы им следовать. И здесь очень важно поговорить о семейных традициях. Это принятые в семье нормы, манеры поведения, взгляды, которые передаются из поколения в поколение.
              </p>

              <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-6">
                <p className="text-lg leading-relaxed font-semibold mb-3">
                  Семейные традиции и ритуалы, с одной стороны, — важный признак здоровой и функциональной семьи, а, с другой — один из важнейших механизмов передачи следующим поколениям законов внутрисемейного взаимодействия:
                </p>
                <ul className="space-y-2 ml-6">
                  <li key="role-distribution" className="text-lg flex items-start gap-2">
                    <Icon name="ArrowRight" size={20} className="text-purple-600 mt-1 flex-shrink-0" />
                    <span>распределения ролей во всех сферах семейной жизни;</span>
                  </li>
                  <li key="communication-rules" className="text-lg flex items-start gap-2">
                    <Icon name="ArrowRight" size={20} className="text-purple-600 mt-1 flex-shrink-0" />
                    <span>правил внутрисемейного общения;</span>
                  </li>
                  <li key="conflict-resolution" className="text-lg flex items-start gap-2">
                    <Icon name="ArrowRight" size={20} className="text-purple-600 mt-1 flex-shrink-0" />
                    <span>способов разрешения конфликтов и преодоления возникающих проблем.</span>
                  </li>
                </ul>
              </div>

              <p className="text-lg leading-relaxed">
                Семейные традиции и обряды основываются не только на общественных, религиозных и исторических традициях и обрядах, но творчески дополняются собственными, поэтому они уникальны.
              </p>

              <p className="text-lg leading-relaxed font-semibold text-purple-700">
                Традиции помогают укрепить доверие и близость между родными людьми и демонстрируют детям, какой на самом деле может быть семья.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
