import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';

export interface Game {
  id: string;
  name: string;
  type: 'video' | 'board' | 'outdoor';
  favorite: boolean;
}

interface GamesSectionProps {
  games: Game[];
  newGameDialog: boolean;
  editGameDialog: boolean;
  newGameData: { name: string; type: 'video' | 'board' | 'outdoor'; favorite: boolean };
  onNewGameDialogChange: (open: boolean) => void;
  onEditGameDialogChange: (open: boolean) => void;
  onNewGameDataChange: (data: { name: string; type: 'video' | 'board' | 'outdoor'; favorite: boolean }) => void;
  onAddGame: () => void;
  onEditGame: (game: Game) => void;
  onUpdateGame: () => void;
  onDeleteGame: (id: string) => void;
}

const gameTypeNames: Record<string, string> = {
  video: 'Видеоигра',
  board: 'Настольная',
  outdoor: 'На улице',
};

const gameTypeIcons: Record<string, string> = {
  video: 'Gamepad2',
  board: 'Dices',
  outdoor: 'TreePine',
};

export function GamesSection({
  games,
  newGameDialog,
  editGameDialog,
  newGameData,
  onNewGameDialogChange,
  onEditGameDialogChange,
  onNewGameDataChange,
  onAddGame,
  onEditGame,
  onUpdateGame,
  onDeleteGame,
}: GamesSectionProps) {
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon name="Gamepad2" size={20} />
              Любимые игры
            </CardTitle>
            <Dialog open={newGameDialog} onOpenChange={onNewGameDialogChange}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Icon name="Plus" size={16} />
                  Добавить игру
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Добавить игру</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Название игры</label>
                    <Input
                      value={newGameData.name}
                      onChange={(e) => onNewGameDataChange({ ...newGameData, name: e.target.value })}
                      placeholder="Например: Minecraft"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Тип игры</label>
                    <select
                      value={newGameData.type}
                      onChange={(e) => onNewGameDataChange({ ...newGameData, type: e.target.value as 'video' | 'board' | 'outdoor' })}
                      className="w-full border rounded-md p-2"
                    >
                      <option value="video">Видеоигра</option>
                      <option value="board">Настольная игра</option>
                      <option value="outdoor">Игра на улице</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="favorite"
                      checked={newGameData.favorite}
                      onChange={(e) => onNewGameDataChange({ ...newGameData, favorite: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="favorite" className="text-sm">Любимая игра</label>
                  </div>
                  <Button onClick={onAddGame} className="w-full">Сохранить</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {games.map((game) => (
              <div key={game.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Icon name={gameTypeIcons[game.type] as any} size={24} className="text-blue-600" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{game.name}</p>
                    {game.favorite && <span className="text-yellow-500">⭐</span>}
                  </div>
                  <p className="text-xs text-gray-500">{gameTypeNames[game.type]}</p>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => onEditGame(game)}>
                    <Icon name="Edit" size={16} />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={() => onDeleteGame(game.id)}>
                    <Icon name="Trash2" size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={editGameDialog} onOpenChange={onEditGameDialogChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать игру</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Название игры</label>
              <Input
                value={newGameData.name}
                onChange={(e) => onNewGameDataChange({ ...newGameData, name: e.target.value })}
                placeholder="Например: Minecraft"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Тип игры</label>
              <select
                value={newGameData.type}
                onChange={(e) => onNewGameDataChange({ ...newGameData, type: e.target.value as 'video' | 'board' | 'outdoor' })}
                className="w-full border rounded-md p-2"
              >
                <option value="video">Видеоигра</option>
                <option value="board">Настольная игра</option>
                <option value="outdoor">Игра на улице</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit-favorite"
                checked={newGameData.favorite}
                onChange={(e) => onNewGameDataChange({ ...newGameData, favorite: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="edit-favorite" className="text-sm">Любимая игра</label>
            </div>
            <Button onClick={onUpdateGame} className="w-full">Сохранить изменения</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
