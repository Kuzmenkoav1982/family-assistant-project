import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import type { WishlistItem, GuestGift } from '@/types/events';

interface Props {
  wishlist: WishlistItem[];
  guestGifts: GuestGift[];
  wishlistLoading: boolean;
  guestGiftsLoading: boolean;
  onShowAddWishlist: () => void;
  onShowAddGuestGift: () => void;
  fetchWishlist: () => void;
  fetchGuestGifts: () => void;
}

export default function WishlistTab({
  wishlist, guestGifts, wishlistLoading, guestGiftsLoading,
  onShowAddWishlist, onShowAddGuestGift, fetchWishlist, fetchGuestGifts,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Подарки</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="birthday" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="birthday" onClick={fetchWishlist}>Для именинника</TabsTrigger>
            <TabsTrigger value="guests" onClick={fetchGuestGifts}>Для гостей</TabsTrigger>
          </TabsList>

          <TabsContent value="birthday" className="mt-4">
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={() => { onShowAddWishlist(); fetchWishlist(); }}>
                  <Icon name="Plus" size={16} />
                  Добавить подарок
                </Button>
              </div>

              {wishlistLoading ? (
                <div className="flex justify-center py-8">
                  <Icon name="Loader2" className="animate-spin" size={24} />
                </div>
              ) : wishlist.length === 0 ? (
                <div className="text-center py-12">
                  <Icon name="Gift" size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">Виш-лист пуст</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {wishlist.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium">{item.title}</h3>
                        {item.priority === 'high' && (
                          <Badge variant="destructive">Важно</Badge>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                      )}
                      <div className="flex items-center justify-between mt-3">
                        {item.price && (
                          <span className="text-lg font-bold">{item.price.toLocaleString('ru-RU')} ₽</span>
                        )}
                        {item.link && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={item.link} target="_blank" rel="noopener noreferrer">
                              <Icon name="ExternalLink" size={14} />
                              Ссылка
                            </a>
                          </Button>
                        )}
                      </div>
                      {item.reserved && (
                        <Badge variant="success" className="mt-2">
                          Зарезервировано{item.reservedByName && `: ${item.reservedByName}`}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="guests" className="mt-4">
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={() => { onShowAddGuestGift(); fetchGuestGifts(); }}>
                  <Icon name="Plus" size={16} />
                  Добавить подарок для гостей
                </Button>
              </div>

              {guestGiftsLoading ? (
                <div className="flex justify-center py-8">
                  <Icon name="Loader2" className="animate-spin" size={24} />
                </div>
              ) : guestGifts.length === 0 ? (
                <div className="text-center py-12">
                  <Icon name="Gift" size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">Подарков для гостей нет</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {guestGifts.map((gift) => (
                    <div key={gift.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{gift.title}</p>
                        {gift.description && (
                          <p className="text-sm text-gray-600">{gift.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                          {gift.category && (
                            <Badge variant="outline">
                              {gift.category === 'kids' ? 'Детям' : gift.category === 'adults' ? 'Взрослым' : 'Всем'}
                            </Badge>
                          )}
                          {gift.pricePerItem && (
                            <span>{gift.pricePerItem.toLocaleString('ru-RU')} ₽ / шт.</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          {gift.quantityPurchased || 0} / {gift.quantityNeeded}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
