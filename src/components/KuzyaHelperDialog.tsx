import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

interface KuzyaHelperDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function KuzyaHelperDialog({ open, onOpenChange }: KuzyaHelperDialogProps) {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    onOpenChange(false);
    navigate(path);
  };

  const openJivoChat = () => {
    onOpenChange(false);
    
    // Показываем виджет и открываем чат
    const jivoElements = document.querySelectorAll('jdiv[id^="jivo"], jdiv.jivo-iframe-container, #jivo-iframe-container, .__jivoMobileButton');
    jivoElements.forEach((el: Element) => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.display = 'block';
      htmlEl.style.visibility = 'visible';
      htmlEl.style.opacity = '1';
      htmlEl.style.pointerEvents = 'auto';
    });
    
    // Открываем чат
    setTimeout(() => {
      if (typeof window !== 'undefined' && (window as any).jivo_api) {
        (window as any).jivo_api.open();
      }
    }, 100);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl">
              <img 
                src="https://cdn.poehali.dev/files/c1b4ec81-b6c7-4a35-ac49-cc9849f6843f.png"
                alt="Кузя"
                className="w-48 h-48 object-cover object-top"
              />
              <div>
                <div>Помощь и поддержка</div>
                <div className="text-sm text-gray-600 font-normal">Мы здесь, чтобы помочь вам</div>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-gray-700">Чем могу помочь?</p>
            <div className="grid gap-3">
              <Button
                onClick={openJivoChat}
                variant="outline"
                className="h-auto py-4 flex items-start gap-3 hover:border-orange-500 hover:bg-orange-50"
              >
                <Icon name="Headphones" size={24} className="text-orange-600 mt-1" />
                <div className="text-left">
                  <div className="font-semibold">Техническая поддержка</div>
                  <div className="text-sm text-gray-600">Напишите нам в чат прямо сейчас</div>
                </div>
              </Button>

              <Button
                onClick={() => handleNavigation('/feedback')}
                variant="outline"
                className="h-auto py-4 flex items-start gap-3 hover:border-purple-500 hover:bg-purple-50"
              >
                <Icon name="MessageSquare" size={24} className="text-purple-600 mt-1" />
                <div className="text-left">
                  <div className="font-semibold">Отзывы</div>
                  <div className="text-sm text-gray-600">Поделитесь впечатлениями о сервисе</div>
                </div>
              </Button>

              <Button
                onClick={() => handleNavigation('/suggestions')}
                variant="outline"
                className="h-auto py-4 flex items-start gap-3 hover:border-blue-500 hover:bg-blue-50"
              >
                <Icon name="Lightbulb" size={24} className="text-blue-600 mt-1" />
                <div className="text-left">
                  <div className="font-semibold">Предложения</div>
                  <div className="text-sm text-gray-600">Идеи по улучшению сервиса</div>
                </div>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}