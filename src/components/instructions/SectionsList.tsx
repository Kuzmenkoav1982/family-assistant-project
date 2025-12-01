import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import { Section, inDevelopmentSections } from './sectionsData';

interface SectionsListProps {
  sections: Section[];
  onSelectSection: (section: Section) => void;
}

export default function SectionsList({ sections, onSelectSection }: SectionsListProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button 
            onClick={() => navigate('/')} 
            variant="outline" 
            className="gap-2"
          >
            <Icon name="ArrowLeft" size={18} />
            На главную
          </Button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            📚 Инструкции по использованию
          </h1>
          <p className="text-lg text-muted-foreground">
            Выберите раздел чтобы узнать как им пользоваться
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map((section) => (
            <Card 
              key={section.id}
              className="cursor-pointer hover:shadow-lg transition-all hover:scale-105 group"
              onClick={() => onSelectSection(section)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon name={section.icon as any} size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg">{section.title}</h3>
                    <p className="text-sm text-muted-foreground font-normal">
                      {section.description}
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full group-hover:bg-blue-50">
                  Открыть инструкцию
                  <Icon name="ChevronRight" className="ml-2" size={16} />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {inDevelopmentSections.length > 0 && (
          <div className="mt-12">
            <div className="text-center mb-6">
              <Badge className="bg-amber-500 text-white mb-3">
                <Icon name="Wrench" size={14} className="mr-1" />
                В разработке
              </Badge>
              <h2 className="text-2xl font-bold text-amber-700">
                Разделы в разработке
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                Эти разделы скоро появятся в приложении
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inDevelopmentSections.map((section) => (
                <Card 
                  key={section.id}
                  className="cursor-pointer hover:shadow-lg transition-all hover:scale-105 group border-2 border-amber-200 bg-amber-50/50"
                  onClick={() => onSelectSection(section)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Icon name={section.icon as any} size={24} className="text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg">{section.title}</h3>
                          <Badge variant="outline" className="text-[10px] bg-amber-100 text-amber-700 border-amber-300">
                            DEV
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground font-normal">
                          {section.description}
                        </p>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full group-hover:bg-amber-100 border-amber-300 text-amber-700">
                      Просмотреть планы
                      <Icon name="ChevronRight" className="ml-2" size={16} />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}