import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

export interface Book {
  id: string;
  title: string;
  author: string;
  status: 'reading' | 'completed' | 'planned';
  rating?: number;
}

interface BooksSectionProps {
  books: Book[];
  newBookDialog: boolean;
  editBookDialog: boolean;
  selectedBook: Book | null;
  newBookData: { title: string; author: string; status: 'reading' | 'completed' | 'planned'; rating?: number };
  onNewBookDialogChange: (open: boolean) => void;
  onEditBookDialogChange: (open: boolean) => void;
  onSelectedBookChange: (book: Book | null) => void;
  onNewBookDataChange: (data: { title: string; author: string; status: 'reading' | 'completed' | 'planned'; rating?: number }) => void;
  onAddBook: () => void;
  onEditBook: (book: Book) => void;
  onUpdateBook: () => void;
  onDeleteBook: (id: string) => void;
}

export function BooksSection({
  books,
  newBookDialog,
  editBookDialog,
  selectedBook,
  newBookData,
  onNewBookDialogChange,
  onEditBookDialogChange,
  onSelectedBookChange,
  onNewBookDataChange,
  onAddBook,
  onEditBook,
  onUpdateBook,
  onDeleteBook,
}: BooksSectionProps) {
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon name="BookOpen" size={20} />
              Библиотека
            </CardTitle>
            <Dialog open={newBookDialog} onOpenChange={onNewBookDialogChange}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Icon name="Plus" size={16} />
                  Добавить книгу
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Добавить книгу</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Название книги</label>
                    <Input
                      placeholder="Например: Гарри Поттер"
                      value={newBookData.title}
                      onChange={(e) => onNewBookDataChange({ ...newBookData, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Автор</label>
                    <Input
                      placeholder="Например: Дж.К. Роулинг"
                      value={newBookData.author}
                      onChange={(e) => onNewBookDataChange({ ...newBookData, author: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Статус</label>
                    <select
                      className="w-full border rounded-md p-2"
                      value={newBookData.status}
                      onChange={(e) => onNewBookDataChange({ ...newBookData, status: e.target.value as 'planned' | 'reading' | 'completed' })}
                    >
                      <option value="planned">Запланировано</option>
                      <option value="reading">Читает сейчас</option>
                      <option value="completed">Прочитано</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Оценка (1-5)</label>
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      placeholder="5"
                      value={newBookData.rating || ''}
                      onChange={(e) => onNewBookDataChange({ ...newBookData, rating: parseInt(e.target.value) || undefined })}
                    />
                  </div>
                  <Button onClick={onAddBook} className="w-full">Сохранить</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {books.map((book) => (
            <div key={book.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <Icon name="Book" size={24} className="text-purple-600 mt-1" />
              <div className="flex-1">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <h4 className="font-medium">{book.title}</h4>
                    <p className="text-sm text-gray-600">{book.author}</p>
                  </div>
                  <div className="flex gap-2">
                    {book.status === 'reading' && (
                      <Badge className="bg-blue-100 text-blue-700">Читает</Badge>
                    )}
                    {book.status === 'completed' && (
                      <Badge className="bg-green-100 text-green-700">Прочитано</Badge>
                    )}
                    {book.status === 'planned' && (
                      <Badge variant="outline">Планируется</Badge>
                    )}
                  </div>
                </div>
                {book.rating && (
                  <div className="flex gap-1 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < book.rating! ? 'text-yellow-500' : 'text-gray-300'}>
                        ⭐
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => onEditBook(book)}>
                  <Icon name="Edit" size={16} />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => onDeleteBook(book.id)}>
                  <Icon name="Trash2" size={16} />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={editBookDialog} onOpenChange={onEditBookDialogChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать книгу</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Input
                id="edit-book-title"
                value={selectedBook?.title || ''}
                onChange={(e) => onSelectedBookChange(selectedBook ? { ...selectedBook, title: e.target.value } : null)}
                className="w-full"
              />
              <label htmlFor="edit-book-title" className="text-sm">Название книги</label>
            </div>
            <div>
              <Input
                id="edit-book-author"
                value={selectedBook?.author || ''}
                onChange={(e) => onSelectedBookChange(selectedBook ? { ...selectedBook, author: e.target.value } : null)}
                className="w-full"
              />
              <label htmlFor="edit-book-author" className="text-sm">Автор</label>
            </div>
            <div>
              <select
                id="edit-book-status"
                value={selectedBook?.status || 'planned'}
                onChange={(e) => onSelectedBookChange(selectedBook ? { ...selectedBook, status: e.target.value as 'planned' | 'reading' | 'completed' } : null)}
                className="w-full border rounded-md p-2"
              >
                <option value="planned">Запланировано</option>
                <option value="reading">Читает сейчас</option>
                <option value="completed">Прочитано</option>
              </select>
              <label htmlFor="edit-book-status" className="text-sm">Статус</label>
            </div>
            <div>
              <Input
                id="edit-book-rating"
                type="number"
                min="1"
                max="5"
                value={selectedBook?.rating || ''}
                onChange={(e) => onSelectedBookChange(selectedBook ? { ...selectedBook, rating: parseInt(e.target.value) || undefined } : null)}
                className="w-full"
              />
              <label htmlFor="edit-book-rating" className="text-sm">Оценка (1-5)</label>
            </div>
            <Button onClick={onUpdateBook} className="w-full">Сохранить изменения</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
