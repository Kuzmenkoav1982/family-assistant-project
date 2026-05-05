import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import {
  blogApi,
  BlogAdminPostFull,
  BlogCategory,
} from '@/lib/blogApi';

interface Props {
  postId: number | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function BlogPostEditDialog({ postId, open, onClose, onSaved }: Props) {
  const [post, setPost] = useState<BlogAdminPostFull | null>(null);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generatingCover, setGeneratingCover] = useState(false);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');
  const [readingTime, setReadingTime] = useState(3);

  useEffect(() => {
    if (!open) return;
    blogApi.getCategories().then(d => setCategories(d.categories)).catch(console.error);
  }, [open]);

  useEffect(() => {
    if (!open || !postId) return;
    setLoading(true);
    blogApi.admin
      .getPost(postId)
      .then(d => {
        const p = d.post;
        setPost(p);
        setTitle(p.title || '');
        setSlug(p.slug || '');
        setExcerpt(p.excerpt || '');
        setContent(p.content || '');
        setCoverUrl(p.cover_image_url || '');
        setCategoryId(p.category_id ? String(p.category_id) : '');
        setSeoTitle(p.seo_title || '');
        setSeoDescription(p.seo_description || '');
        setSeoKeywords(p.seo_keywords || '');
        setReadingTime(p.reading_time_min || 3);
      })
      .catch(e => toast.error(`Не удалось загрузить пост: ${e.message}`))
      .finally(() => setLoading(false));
  }, [postId, open]);

  const handleSave = async () => {
    if (!postId) return;
    setSaving(true);
    try {
      await blogApi.admin.update(postId, {
        title,
        slug,
        excerpt,
        content,
        cover_image_url: coverUrl || null,
        category_id: categoryId ? Number(categoryId) : null,
        seo_title: seoTitle || null,
        seo_description: seoDescription || null,
        seo_keywords: seoKeywords || null,
        reading_time_min: readingTime,
      });
      toast.success('Пост обновлён');
      onSaved();
      onClose();
    } catch (e) {
      toast.error(`Ошибка: ${(e as Error).message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateCover = async () => {
    if (!postId) return;
    setGeneratingCover(true);
    toast.info('Генерируем обложку через ИИ... это займёт ~30–60 сек');
    try {
      const result = await blogApi.admin.generateCover(postId);
      if (result.ok && result.url) {
        setCoverUrl(result.url);
        toast.success('Обложка сгенерирована и сохранена');
        onSaved();
      } else {
        toast.error(`Не удалось сгенерировать: ${result.error || 'неизвестная ошибка'}`);
      }
    } catch (e) {
      toast.error(`Ошибка: ${(e as Error).message}`);
    } finally {
      setGeneratingCover(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Edit" size={20} className="text-pink-600" />
            Редактирование поста
          </DialogTitle>
          <DialogDescription>
            Изменения сразу попадут в публичный блог и индексацию поисковиков
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-12 text-center">
            <Icon name="Loader2" size={32} className="animate-spin mx-auto text-gray-400" />
          </div>
        ) : !post ? (
          <div className="py-12 text-center text-gray-500">Пост не найден</div>
        ) : (
          <div className="space-y-5 py-2">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Badge variant="outline">ID: {post.id}</Badge>
              <Badge variant="outline">{post.source}</Badge>
              <Badge variant="outline">
                <Icon name="Eye" size={12} className="mr-1" />
                {post.views_count} просмотров
              </Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <Label htmlFor="title">Заголовок *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="slug">URL-адрес (slug)</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={e => setSlug(e.target.value)}
                  className="mt-1.5 font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  /blog/<strong>{slug || '...'}</strong>
                </p>
              </div>
              <div>
                <Label htmlFor="category">Категория</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger id="category" className="mt-1.5">
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.emoji} {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="excerpt">Краткое описание (excerpt)</Label>
              <Textarea
                id="excerpt"
                value={excerpt}
                onChange={e => setExcerpt(e.target.value)}
                rows={2}
                className="mt-1.5"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label htmlFor="cover">URL обложки</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleGenerateCover}
                  disabled={generatingCover || saving}
                  className="border-purple-300 text-purple-700 hover:bg-purple-50 h-8"
                >
                  {generatingCover ? (
                    <>
                      <Icon name="Loader2" size={14} className="animate-spin mr-1.5" />
                      Генерируем...
                    </>
                  ) : (
                    <>
                      <Icon name="Sparkles" size={14} className="mr-1.5 text-purple-600" />
                      {coverUrl ? 'Перегенерировать через ИИ' : 'Сгенерировать через ИИ'}
                    </>
                  )}
                </Button>
              </div>
              <Input
                id="cover"
                value={coverUrl}
                onChange={e => setCoverUrl(e.target.value)}
                placeholder="https://cdn.poehali.dev/..."
                className="font-mono text-sm"
              />
              {coverUrl ? (
                <img
                  src={coverUrl}
                  alt="Обложка"
                  className="mt-2 w-full max-h-48 object-cover rounded-lg border"
                />
              ) : (
                <p className="text-xs text-gray-500 mt-1.5">
                  Обложки нет. Нажмите «Сгенерировать через ИИ» — получим картинку под тематику и категорию поста.
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="content">Содержание (Markdown)</Label>
              <Textarea
                id="content"
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={12}
                className="mt-1.5 font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Поддерживается Markdown: **жирный**, *курсив*, - списки, заголовки **Текст:**
              </p>
            </div>

            <div className="border-t pt-5">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Icon name="Search" size={16} className="text-orange-500" />
                SEO для поисковиков
              </h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="seo_title">SEO Title (50–70 символов)</Label>
                  <Input
                    id="seo_title"
                    value={seoTitle}
                    onChange={e => setSeoTitle(e.target.value)}
                    placeholder="Заголовок для Google и Яндекса"
                    className="mt-1.5"
                  />
                  <p className="text-xs text-gray-500 mt-1">{seoTitle.length} симв.</p>
                </div>
                <div>
                  <Label htmlFor="seo_desc">SEO Description (130–160 символов)</Label>
                  <Textarea
                    id="seo_desc"
                    value={seoDescription}
                    onChange={e => setSeoDescription(e.target.value)}
                    rows={2}
                    placeholder="Краткое описание, которое покажет поисковик"
                    className="mt-1.5"
                  />
                  <p className="text-xs text-gray-500 mt-1">{seoDescription.length} симв.</p>
                </div>
                <div>
                  <Label htmlFor="seo_kw">Ключевые слова (через запятую)</Label>
                  <Input
                    id="seo_kw"
                    value={seoKeywords}
                    onChange={e => setSeoKeywords(e.target.value)}
                    placeholder="семья, дети, психология"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="reading_time">Время чтения (мин)</Label>
                  <Input
                    id="reading_time"
                    type="number"
                    min={1}
                    max={60}
                    value={readingTime}
                    onChange={e => setReadingTime(Number(e.target.value) || 1)}
                    className="mt-1.5 w-32"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Отмена
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || loading || !title}
            className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
          >
            {saving ? (
              <>
                <Icon name="Loader2" size={16} className="animate-spin mr-2" />
                Сохранение...
              </>
            ) : (
              <>
                <Icon name="Save" size={16} className="mr-2" />
                Сохранить
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}