import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import AIAssistantWidget from '@/components/AIAssistantWidget';

interface KuzyaHelperDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function KuzyaHelperDialog({ open, onOpenChange }: KuzyaHelperDialogProps) {
  const navigate = useNavigate();
  const [aiOpen, setAiOpen] = useState(false);

  const handleNavigation = (path: string) => {
    onOpenChange(false);
    navigate(path);
  };

  const openAIAssistant = () => {
    onOpenChange(false);
    setAiOpen(true);
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
                onClick={openAIAssistant}
                variant="outline"
                className="h-auto py-4 flex items-start gap-3 hover:border-orange-500 hover:bg-orange-50"
              >
                <Icon name="Bot" size={24} className="text-orange-600 mt-1" />
                <div className="text-left">
                  <div className="font-semibold">AI Помощник Кузя</div>
                  <div className="text-sm text-gray-600">Умный семейный ассистент на базе YandexGPT</div>
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

      <AIAssistantWidget isOpen={aiOpen} onOpenChange={setAiOpen} />
    </>
  );
}
