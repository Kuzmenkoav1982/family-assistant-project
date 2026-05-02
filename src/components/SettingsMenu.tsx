import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import FamilyInviteManager from './FamilyInviteManager';
import EffectsSettings from './settings/EffectsSettings';
import ExportSettings from './settings/ExportSettings';
import SubscriptionSettings from './settings/SubscriptionSettings';
import AccountSettings from './settings/AccountSettings';
import NotificationTest from './settings/NotificationTest';
import { useSettingsActions } from './settings/useSettingsActions';
import { useNavigate } from 'react-router-dom';

interface SettingsMenuProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function SettingsMenu({ open: externalOpen, onOpenChange }: SettingsMenuProps = {}) {
  const navigate = useNavigate();
  const [internalOpen, setInternalOpen] = useState(false);
  
  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;
  const setIsOpen = (value: boolean) => {
    if (onOpenChange) {
      onOpenChange(value);
    } else {
      setInternalOpen(value);
    }
  };

  const {
    isExporting,
    chamomileEnabled,
    soundEnabled,
    setChamomileEnabled,
    setSoundEnabled,
    handleExport,
    handleDeleteAccount,
  } = useSettingsActions();

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="ghost"
        size="sm"
        className="h-9 w-9 p-0"
        title="Настройки"
      >
        <Icon name="Settings" size={18} />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle className="flex items-center gap-2 text-xl md:text-2xl">
              <Icon name="Settings" size={24} />
              Настройки
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="invites" className="w-full flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid w-full grid-cols-3 mx-6 my-2">
              <TabsTrigger value="invites" className="text-xs md:text-sm">
                <Icon name="Users" className="mr-1 md:mr-2" size={14} />
                <span className="hidden sm:inline">Приглашения</span>
                <span className="sm:hidden">Семья</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="text-xs md:text-sm">
                <Icon name="Mail" className="mr-1 md:mr-2" size={14} />
                <span className="hidden sm:inline">Уведомления</span>
                <span className="sm:hidden">Уведом.</span>
              </TabsTrigger>
              {/* Подписки временно скрыты — используется кошелёк */}
              <TabsTrigger value="account" className="text-xs md:text-sm">
                <Icon name="UserCog" className="mr-1 md:mr-2" size={14} />
                <span className="hidden sm:inline">Аккаунт</span>
                <span className="sm:hidden">Аккаунт</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="invites" className="flex-1 overflow-y-auto px-6 pb-6">
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-lg p-6 border border-orange-200">
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <Icon name="Home" size={20} className="text-orange-600" />
                    Информация о семье
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Настройки названия и логотипа находятся в левом меню → Настройки → Информация о семье
                  </p>
                  <Button 
                    onClick={() => {
                      setIsOpen(false);
                      setTimeout(() => navigate('/settings'), 100);
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    <Icon name="ArrowRight" size={16} className="mr-2" />
                    Перейти к настройкам
                  </Button>
                </div>
                <FamilyInviteManager />
              </div>
            </TabsContent>

            <TabsContent value="effects" className="flex-1 overflow-y-auto px-6 pb-6">
              <EffectsSettings
                chamomileEnabled={chamomileEnabled}
                soundEnabled={soundEnabled}
                onChamomileChange={setChamomileEnabled}
                onSoundChange={setSoundEnabled}
              />
            </TabsContent>

            <TabsContent value="export" className="flex-1 overflow-y-auto px-6 pb-6">
              <ExportSettings
                isExporting={isExporting}
                onExport={handleExport}
              />
            </TabsContent>

            <TabsContent value="notifications" className="flex-1 overflow-y-auto px-6 pb-6">
              <NotificationTest />
            </TabsContent>

            {/* Подписки временно скрыты — используется кошелёк */}

            <TabsContent value="account" className="flex-1 overflow-y-auto px-6 pb-6">
              <AccountSettings
                onDeleteAccount={handleDeleteAccount}
                onLogout={() => {
                  setIsOpen(false);
                  navigate('/login');
                }}
              />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}
