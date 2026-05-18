import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';

interface RuleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: string[];
  newRuleTitle: string;
  setNewRuleTitle: (v: string) => void;
  newRuleDescription: string;
  setNewRuleDescription: (v: string) => void;
  newRuleCategory: string;
  setNewRuleCategory: (v: string) => void;
  currentUserData?: { role: string; canApproveAlone: boolean };
  onSubmit: () => void;
}

export default function RuleFormDialog({
  open, onOpenChange, categories,
  newRuleTitle, setNewRuleTitle,
  newRuleDescription, setNewRuleDescription,
  newRuleCategory, setNewRuleCategory,
  currentUserData, onSubmit,
}: RuleFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600">
          <Icon name="Plus" className="mr-2" size={18} />
          Предложить правило
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Новое семейное правило</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {currentUserData?.canApproveAlone && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
              <Icon name="Crown" size={16} className="inline mr-2 text-green-600" />
              Как {currentUserData.role}, вы можете утвердить правило единолично
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-2">Категория</label>
            <select value={newRuleCategory} onChange={(e) => setNewRuleCategory(e.target.value)} className="w-full border rounded-md p-2">
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Название правила</label>
            <Input value={newRuleTitle} onChange={(e) => setNewRuleTitle(e.target.value)} placeholder="Например: Убирать за собой посуду" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Описание правила</label>
            <Textarea value={newRuleDescription} onChange={(e) => setNewRuleDescription(e.target.value)} placeholder="Опишите правило подробно: что, когда, как..." className="min-h-[100px]" />
          </div>
          <Button onClick={onSubmit} disabled={!newRuleTitle || !newRuleDescription} className="w-full bg-gradient-to-r from-indigo-500 to-purple-500">
            {currentUserData?.canApproveAlone ? 'Утвердить правило' : 'Предложить на голосование'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
