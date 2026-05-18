import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { BOOK_CATEGORIES, getReligionEmoji, getReligionLabel } from '../constants';
import { apiFetch } from '../api';
import type { BasicArticle, SacredBook } from '../types';

export default function LibraryTab({ religion }: { religion: string }) {
  const { toast } = useToast();
  const [basics, setBasics] = useState<BasicArticle[]>([]);
  const [books, setBooks] = useState<SacredBook[]>([]);
  const [progress, setProgress] = useState<Record<string, { isRead: boolean; bookmark: string }>>({});
  const [loading, setLoading] = useState(true);
  const [expandedBasic, setExpandedBasic] = useState<number | null>(0);
  const [bookFilter, setBookFilter] = useState('all');
  const [editingBookmark, setEditingBookmark] = useState<string | null>(null);
  const [bookmarkText, setBookmarkText] = useState('');

  const progressKey = (type: string, title: string) => `${type}::${title}`;

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await apiFetch('get_library', { religion });
        setBasics(data.basics || []);
        setBooks(data.books || []);
        const map: Record<string, { isRead: boolean; bookmark: string }> = {};
        (data.progress || []).forEach((p: { type: string; title: string; isRead: boolean; bookmark: string }) => {
          map[progressKey(p.type, p.title)] = { isRead: p.isRead, bookmark: p.bookmark || '' };
        });
        setProgress(map);
      } catch {
        setBasics([]);
        setBooks([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [religion]);

  const saveProgress = async (itemType: string, itemTitle: string, isRead: boolean, bookmark: string) => {
    const key = progressKey(itemType, itemTitle);
    setProgress(prev => ({ ...prev, [key]: { isRead, bookmark } }));
    try {
      await apiFetch('save_reading_progress', { religion, itemType, itemTitle, isRead, bookmark });
    } catch {
      toast({ title: 'Ошибка сохранения', variant: 'destructive' });
    }
  };

  const toggleRead = (type: string, title: string) => {
    const key = progressKey(type, title);
    const current = progress[key];
    const newRead = !current?.isRead;
    saveProgress(type, title, newRead, current?.bookmark || '');
    if (newRead) {
      toast({ title: 'Отмечено как прочитанное', description: title });
    }
  };

  const saveBookmark = (type: string, title: string) => {
    const key = progressKey(type, title);
    const current = progress[key];
    saveProgress(type, title, current?.isRead || false, bookmarkText);
    setEditingBookmark(null);
    toast({ title: 'Закладка сохранена', description: bookmarkText ? `«${bookmarkText.slice(0, 40)}...»` : 'Закладка удалена' });
  };

  const filteredBooks = bookFilter === 'all' ? books : books.filter(b => b.category === bookFilter);
  const availableCategories = ['all', ...new Set(books.map(b => b.category))];
  const readBasicsCount = basics.filter((_, i) => progress[progressKey('basic', basics[i]?.title)]?.isRead).length;
  const readBooksCount = books.filter(b => progress[progressKey('book', b.title)]?.isRead).length;

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-3 border-amber-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {(readBasicsCount > 0 || readBooksCount > 0) && (
        <Card className="border-emerald-200/60 bg-gradient-to-r from-emerald-50/60 to-green-50/40">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <Icon name="Trophy" size={18} className="text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-emerald-900">Ваш прогресс</p>
              <p className="text-[10px] text-emerald-700/70">
                Статьи: {readBasicsCount}/{basics.length} · Книги: {readBooksCount}/{books.length}
              </p>
            </div>
            <div className="w-10 h-10">
              <svg viewBox="0 0 36 36" className="w-10 h-10 -rotate-90">
                <circle cx="18" cy="18" r="15" fill="none" stroke="#d1fae5" strokeWidth="3" />
                <circle cx="18" cy="18" r="15" fill="none" stroke="#059669" strokeWidth="3"
                  strokeDasharray={`${((readBasicsCount + readBooksCount) / Math.max(basics.length + books.length, 1)) * 94} 94`}
                  strokeLinecap="round" />
              </svg>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h3 className="font-semibold text-amber-900 flex items-center gap-2">
          <Icon name="Lightbulb" size={18} className="text-amber-500" />
          Основы веры — {getReligionEmoji(religion)} {getReligionLabel(religion)}
        </h3>
        <p className="text-xs text-amber-700/70 -mt-2">Простым и доступным языком о самом важном</p>

        <div className="space-y-2">
          {basics.map((article, i) => {
            const key = progressKey('basic', article.title);
            const isRead = progress[key]?.isRead || false;
            const bm = progress[key]?.bookmark || '';
            const isEditing = editingBookmark === key;
            return (
              <Card
                key={i}
                className={`border-amber-100 overflow-hidden transition-all ${expandedBasic === i ? 'ring-1 ring-amber-300 shadow-md' : 'hover:shadow-sm'} ${isRead ? 'opacity-75' : ''}`}
              >
                <button
                  onClick={() => setExpandedBasic(expandedBasic === i ? null : i)}
                  className="w-full p-3 flex items-center gap-3 text-left"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isRead ? 'bg-emerald-100' : 'bg-gradient-to-br from-amber-100 to-yellow-100'}`}>
                    {isRead ? (
                      <Icon name="Check" size={16} className="text-emerald-600" />
                    ) : (
                      <span className="text-sm font-bold text-amber-700">{i + 1}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${isRead ? 'text-amber-700 line-through' : 'text-amber-900'}`}>{article.title}</p>
                    {bm && <p className="text-[10px] text-blue-600 flex items-center gap-0.5 mt-0.5"><Icon name="Bookmark" size={9} />{bm.slice(0, 50)}{bm.length > 50 ? '...' : ''}</p>}
                  </div>
                  <Icon name={expandedBasic === i ? 'ChevronUp' : 'ChevronDown'} size={16} className="text-amber-400 shrink-0" />
                </button>
                {expandedBasic === i && (
                  <div className="px-4 pb-4 space-y-3">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50/80 to-yellow-50/40 border border-amber-100">
                      <p className="text-sm text-amber-900 leading-relaxed whitespace-pre-line">{article.text}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={isRead ? 'outline' : 'default'}
                        onClick={(e) => { e.stopPropagation(); toggleRead('basic', article.title); }}
                        className={isRead ? 'border-emerald-300 text-emerald-700' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}
                      >
                        <Icon name={isRead ? 'RotateCcw' : 'Check'} size={14} className="mr-1" />
                        {isRead ? 'Прочитано' : 'Прочитал'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => { e.stopPropagation(); setEditingBookmark(isEditing ? null : key); setBookmarkText(bm); }}
                        className="border-blue-300 text-blue-700"
                      >
                        <Icon name="Bookmark" size={14} className="mr-1" />
                        Закладка
                      </Button>
                    </div>
                    {isEditing && (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Где остановились? Напр: Прочитал до раздела «Таинства»"
                          value={bookmarkText}
                          onChange={e => setBookmarkText(e.target.value)}
                          className="border-blue-200 text-sm flex-1"
                          onKeyDown={e => e.key === 'Enter' && saveBookmark('basic', article.title)}
                        />
                        <Button size="sm" onClick={() => saveBookmark('basic', article.title)} className="bg-blue-600 hover:bg-blue-700 text-white shrink-0">
                          <Icon name="Save" size={14} />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-amber-200" />
          <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
            <Icon name="BookOpen" size={14} />
            Священные книги и литература
          </span>
          <div className="h-px flex-1 bg-amber-200" />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {availableCategories.map(cat => {
            const info = cat === 'all'
              ? { label: 'Все', icon: 'Library', color: 'amber' }
              : BOOK_CATEGORIES[cat] || { label: cat, icon: 'Book', color: 'gray' };
            return (
              <button
                key={cat}
                onClick={() => setBookFilter(cat)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1 ${
                  bookFilter === cat
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-white text-amber-700 hover:bg-amber-50 border border-amber-200'
                }`}
              >
                <Icon name={info.icon} size={11} />
                {info.label}
              </button>
            );
          })}
        </div>

        <div className="space-y-2">
          {filteredBooks.map((book, i) => {
            const catInfo = BOOK_CATEGORIES[book.category] || { label: '', icon: 'Book', color: 'gray' };
            const key = progressKey('book', book.title);
            const isRead = progress[key]?.isRead || false;
            const bm = progress[key]?.bookmark || '';
            const isEditing = editingBookmark === key;
            return (
              <Card key={i} className={`border-amber-100 transition-shadow ${isRead ? 'opacity-75' : 'hover:shadow-sm'}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleRead('book', book.title)}
                      className={`w-11 h-14 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                        isRead
                          ? 'bg-emerald-100 ring-2 ring-emerald-300'
                          : `bg-gradient-to-br from-${catInfo.color}-100 to-${catInfo.color}-200 hover:ring-2 hover:ring-amber-300`
                      }`}
                    >
                      {isRead ? (
                        <Icon name="CheckCheck" size={20} className="text-emerald-600" />
                      ) : (
                        <Icon name={catInfo.icon} size={20} className={`text-${catInfo.color}-600`} />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm ${isRead ? 'text-amber-700 line-through' : 'text-amber-900'}`}>{book.title}</p>
                      {book.author && <p className="text-xs text-amber-600 mt-0.5">{book.author}</p>}
                      <p className="text-xs text-amber-700/70 mt-1.5 leading-relaxed">{book.description}</p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Badge className={`bg-${catInfo.color}-50 text-${catInfo.color}-700 border-${catInfo.color}-200 text-[9px]`}>
                          {catInfo.label}
                        </Badge>
                        {isRead && <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[9px]">Прочитано</Badge>}
                      </div>
                      {bm && !isEditing && (
                        <button
                          onClick={() => { setEditingBookmark(key); setBookmarkText(bm); }}
                          className="mt-2 text-[10px] text-blue-600 flex items-center gap-1 hover:underline"
                        >
                          <Icon name="Bookmark" size={10} className="text-blue-500" />
                          {bm}
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => { setEditingBookmark(isEditing ? null : key); setBookmarkText(bm); }}
                      className={`p-1.5 rounded-lg shrink-0 transition-colors ${bm || isEditing ? 'text-blue-600 bg-blue-50' : 'text-amber-400 hover:bg-amber-50'}`}
                      title="Закладка"
                    >
                      <Icon name={bm ? 'BookmarkCheck' : 'Bookmark'} size={16} />
                    </button>
                  </div>
                  {isEditing && (
                    <div className="flex gap-2 mt-3">
                      <Input
                        placeholder="Где остановились? Напр: Глава 5, стр. 123"
                        value={bookmarkText}
                        onChange={e => setBookmarkText(e.target.value)}
                        className="border-blue-200 text-sm flex-1"
                        onKeyDown={e => e.key === 'Enter' && saveBookmark('book', book.title)}
                        autoFocus
                      />
                      <Button size="sm" onClick={() => saveBookmark('book', book.title)} className="bg-blue-600 hover:bg-blue-700 text-white shrink-0">
                        <Icon name="Save" size={14} />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredBooks.length === 0 && (
          <Card className="border-dashed border-amber-200">
            <CardContent className="py-8 text-center text-amber-600/60">
              <Icon name="BookX" size={36} className="mx-auto mb-2 text-amber-300" />
              <p className="text-sm">Нет книг в этой категории</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
