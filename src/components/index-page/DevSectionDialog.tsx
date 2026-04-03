import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';

interface DevSectionDialogProps {
  selectedDevSection: any;
  onClose: () => void;
  showCommentDialog: boolean;
  setShowCommentDialog: (v: boolean) => void;
  voteComment: string;
  setVoteComment: (v: string) => void;
  pendingVote: { sectionId: string; voteType: 'up' | 'down' } | null;
  setPendingVote: (v: any) => void;
  handleDevSectionVote: (sectionId: string, voteType: 'up' | 'down', withComment?: boolean) => Promise<void>;
  handleSubmitVoteWithComment: () => Promise<void>;
  getDevSectionVotes: (sectionId: string) => { up: number; down: number };
}

export default function DevSectionDialog({
  selectedDevSection,
  onClose,
  showCommentDialog,
  setShowCommentDialog,
  voteComment,
  setVoteComment,
  pendingVote,
  setPendingVote,
  handleDevSectionVote,
  handleSubmitVoteWithComment,
  getDevSectionVotes,
}: DevSectionDialogProps) {
  return (
    <>
      <Dialog open={selectedDevSection !== null} onOpenChange={() => onClose()}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader className="bg-gradient-to-r from-amber-400 to-orange-400 text-white -m-6 mb-0 p-6 rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur">
                <Icon name={selectedDevSection?.icon || 'Wrench'} size={28} />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold">
                  {selectedDevSection?.label}
                </DialogTitle>
                <p className="text-sm text-amber-50 font-normal mt-1">
                  {selectedDevSection?.description}
                </p>
              </div>
              <Badge className="ml-auto bg-white/20 text-white border-white/30">
                <Icon name="Construction" size={12} className="mr-1" />
                В разработке
              </Badge>
            </div>
          </DialogHeader>
          
          <div className="space-y-6 p-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Icon name="Sparkles" size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-blue-900">Что будет в этом разделе?</h3>
                </div>
              </div>
              <p className="text-gray-800 text-base leading-relaxed">
                {selectedDevSection?.description}
              </p>
              <div className="mt-4 pt-4 border-t border-blue-200">
                <p className="text-gray-700 text-sm">
                  Мы активно работаем над реализацией этого функционала. Скоро здесь появятся все планируемые возможности, которые сделают управление семьёй ещё проще и удобнее.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <Icon name="ListChecks" size={20} className="text-purple-600" />
                Планируемые функции
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedDevSection?.features?.map((feature: any, idx: number) => (
                  <Card key={idx} className="border-2 border-purple-100 hover:border-purple-300 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">{feature.icon}</div>
                        <div>
                          <h4 className="font-bold text-sm mb-1">{feature.title}</h4>
                          <p className="text-xs text-muted-foreground">{feature.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-5">
              <div className="flex items-center gap-2 mb-3">
                <Icon name="ThumbsUp" size={22} className="text-green-600" />
                <h3 className="text-lg font-bold text-green-900">Поддержите создание раздела!</h3>
              </div>
              
              <p className="text-sm text-gray-700 mb-4">
                Ваш голос поможет нам понять насколько этот функционал нужен пользователям и приоритизировать разработку.
              </p>

              <div className="space-y-3">
                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      if (selectedDevSection) {
                        handleDevSectionVote(selectedDevSection.id, 'up', false);
                      }
                    }}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    size="lg"
                  >
                    <Icon name="ThumbsUp" size={18} className="mr-2" />
                    Хочу! ({getDevSectionVotes(selectedDevSection?.id || '').up})
                  </Button>
                  <Button
                    onClick={() => {
                      if (selectedDevSection) {
                        handleDevSectionVote(selectedDevSection.id, 'down', false);
                      }
                    }}
                    variant="outline"
                    className="border-red-300 hover:bg-red-50"
                    size="lg"
                  >
                    <Icon name="ThumbsDown" size={18} className="mr-2 text-red-600" />
                    Не нужен ({getDevSectionVotes(selectedDevSection?.id || '').down})
                  </Button>
                </div>
                
                <Button
                  onClick={() => {
                    if (selectedDevSection) {
                      handleDevSectionVote(selectedDevSection.id, 'up', true);
                    }
                  }}
                  variant="outline"
                  className="w-full border-purple-300 text-purple-700 hover:bg-purple-50"
                >
                  <Icon name="MessageSquare" size={18} className="mr-2" />
                  Оставить комментарий или предложение
                </Button>
              </div>
              <p className="text-xs text-green-700 mt-3 text-center">
                ✅ Ваше мнение очень важно для приоритизации разработки
              </p>
            </div>

            <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Icon name="Info" size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-900 mb-1 text-sm">Когда будет готово?</h4>
                  <p className="text-amber-800 text-xs">
                    Мы активно работаем над разработкой. Следите за обновлениями! 
                    Время реализации зависит от количества голосов и технической сложности.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="MessageSquare" size={24} />
              Ваш отзыв или предложение
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Расскажите нам подробнее о том, что вы хотите видеть в этом разделе. 
              Ваш комментарий будет отправлен разработчикам на почту.
            </p>

            <Textarea
              value={voteComment}
              onChange={(e) => setVoteComment(e.target.value)}
              placeholder="Например: Хотел бы видеть возможность..."
              rows={5}
              className="resize-none"
            />

            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Icon name="Info" size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-800">
                Комментарий опционален. Вы можете оставить его пустым и просто проголосовать, 
                или написать развёрнутое предложение.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCommentDialog(false);
                  setVoteComment('');
                  setPendingVote(null);
                }}
              >
                Отмена
              </Button>
              <Button
                onClick={handleSubmitVoteWithComment}
                className="bg-gradient-to-r from-purple-500 to-pink-500"
              >
                <Icon name="Send" size={16} className="mr-2" />
                Отправить
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
