import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface WhatIsFamilyHeaderProps {
  onNavigateBack: () => void;
}

export function WhatIsFamilyHeader({ onNavigateBack }: WhatIsFamilyHeaderProps) {
  return (
    <>
      <div className="flex justify-between items-center">
        <Button onClick={onNavigateBack} variant="outline">
          <Icon name="ArrowLeft" className="mr-2" size={16} />
          Назад к Семейной политике
        </Button>
      </div>

      <Card className="border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4 rounded-full">
              <Icon name="Users" size={48} />
            </div>
          </div>
          <CardTitle className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-orange-600">
            Что такое Семья?
          </CardTitle>
          <p className="text-lg text-gray-700 mt-4">
            Полная историческая справка: от древности до наших дней
          </p>
        </CardHeader>
      </Card>
    </>
  );
}
