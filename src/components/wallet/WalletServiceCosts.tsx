import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { SERVICE_COSTS } from './walletConstants';

export default function WalletServiceCosts() {
  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="font-bold mb-3 flex items-center gap-2">
          <Icon name="Zap" size={18} className="text-amber-500" />
          На что тратится баланс?
        </h3>
        <div className="space-y-2 text-sm">
          {SERVICE_COSTS.map(item => (
            <div key={item.label} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                <Icon name={item.icon} size={16} className="text-amber-600" />
              </div>
              <span className="flex-1">{item.label}</span>
              <Badge variant="outline" className="text-xs">{item.cost}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
