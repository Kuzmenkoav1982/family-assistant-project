import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import { useShopping } from '@/hooks/useShopping';
import { useDemoMode } from '@/contexts/DemoModeContext';

const categoryColors: Record<string, string> = {
  'Продукты': 'bg-green-100 text-green-700 border-green-200',
  'Хозтовары': 'bg-blue-100 text-blue-700 border-blue-200',
  'Одежда': 'bg-purple-100 text-purple-700 border-purple-200',
  'Другое': 'bg-gray-100 text-gray-700 border-gray-200'
};

const categoryIcons: Record<string, string> = {
  'Продукты': 'ShoppingBasket',
  'Хозтовары': 'Home',
  'Одежда': 'Shirt',
  'Другое': 'Package'
};

export function ShoppingWidget() {
  const navigate = useNavigate();
  const { items, toggleBought } = useShopping();
  const { isDemoMode, demoShoppingList } = useDemoMode();

  const displayedItems = isDemoMode ? demoShoppingList : items;
  const notBoughtItems = displayedItems.filter(item => isDemoMode ? !item.completed : !item.bought);
  const urgentItems = notBoughtItems.filter(item => item.priority === 'urgent' || item.priority === 'high');

  return (
    <Card 
      className="animate-fade-in border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 cursor-pointer hover:shadow-lg transition-all"
      onClick={() => navigate('/shopping')}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="ShoppingCart" size={24} />
          Покупки
          {urgentItems.length > 0 && (
            <Badge className="ml-auto bg-red-500">
              <Icon name="AlertCircle" size={12} className="mr-1" />
              {urgentItems.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {notBoughtItems.length === 0 ? (
          <div className="text-center py-6">
            <Icon name="CheckSquare" size={48} className="mx-auto text-blue-500 mb-2" />
            <p className="text-sm text-gray-600">Все покупки выполнены! 🎉</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notBoughtItems.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-lg border-2 ${item.priority === 'urgent' ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'} hover:shadow transition-all`}
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={isDemoMode ? item.completed : item.bought}
                    onCheckedChange={(checked) => {
                      if (!isDemoMode) {
                        toggleBought(item.id, !checked);
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1">
                    <p className={`font-semibold text-sm ${(isDemoMode ? item.completed : item.bought) ? 'line-through text-gray-400' : ''}`}>
                      {item.name}
                      {item.quantity && <span className="text-gray-500 ml-1">({item.quantity})</span>}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className={`text-[10px] ${categoryColors[item.category] || categoryColors['Другое']}`}>
                        <Icon name={categoryIcons[item.category] || categoryIcons['Другое']} size={10} className="mr-1" />
                        {item.category}
                      </Badge>
                      {item.priority === 'urgent' && (
                        <Badge className="text-[10px] bg-red-500">
                          Срочно
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {notBoughtItems.length > 5 && (
              <p className="text-xs text-center text-gray-500 pt-2">
                +{notBoughtItems.length - 5} еще...
              </p>
            )}
          </div>
        )}
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full mt-3 text-green-600"
          onClick={(e) => {
            e.stopPropagation();
            navigate('/shopping');
          }}
        >
          Открыть список покупок →
        </Button>
      </CardContent>
    </Card>
  );
}