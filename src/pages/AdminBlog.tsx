import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import {
  blogApi,
  BlogAdminPost,
  BlogAdminStats,
  CATEGORY_COLORS,
  formatBlogDate,
} from '@/lib/blogApi';
import BlogPostEditDialog from '@/components/admin/blog/BlogPostEditDialog';
import ManualMirrorDialog from '@/components/admin/max/ManualMirrorDialog';
import { useBlogCoverJob } from '@/contexts/BlogCoverJobContext';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  published: { label: 'Опубликован', color: 'bg-green-100 text-green-700' },
  draft: { label: 'Черновик', color: 'bg-gray-100 text-gray-700' },
  archived: { label: 'В архиве', color: 'bg-orange-100 text-orange-700' },
};

export default function AdminBlog() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogAdminPost[]>([]);
  const [stats, setStats] = useState<BlogAdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mirrorOpen, setMirrorOpen] = useState(false);

  const loadPosts = useCallback(() => {
    setLoading(true);
    blogApi.admin
      .list({ page, limit: 20, status: statusFilter, q: searchQuery })
      .then(d => {
        setPosts(d.posts);
        setPages(d.pages);
        setTotal(d.total);
      })
      .catch(e => toast.error(`Ошибка загрузки: ${e.message}`))
      .finally(() => setLoading(false));
  }, [page, statusFilter, searchQuery]);

  const loadStats = useCallback(() => {
    blogApi.admin.stats().then(setStats).catch(console.error);
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput.trim());
    setPage(1);
  };

  const handleStatusChange = async (id: number, status: 'published' | 'draft' | 'archived') => {
    try {
      await blogApi.admin.toggleStatus(id, status);
      toast.success(`Статус изменён: ${STATUS_LABELS[status].label}`);
      loadPosts();
      loadStats();
    } catch (e) {
      toast.error(`Ошибка: ${(e as Error).message}`);
    }
  };

  const openEditor = (id: number) => {
    setEditingId(id);
    setDialogOpen(true);
  };

  const { job, startJob, progress } = useBlogCoverJob();
  const isJobActive = !!job?.active;

  useEffect(() => {
    if (job && !job.active && progress.done > 0) {
      loadPosts();
      loadStats();
    }
  }, [job?.active, progress.done, job, loadPosts, loadStats]);

  const handleBulkGenerateCovers = async () => {
    if (isJobActive) {
      toast.info('Генерация уже запущена в фоне');
      return;
    }
    if (!confirm('Запустить ИИ-генерацию обложек для всех постов без картинки? Процесс пойдёт в фоне — можно продолжать работу.')) return;
    await startJob();
  };

  const postsWithoutCover = posts.filter(p => !p.cover_image_url).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-pink-50">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
              📰 Управление блогом
            </h1>
            <p className="text-gray-600 mt-1">
              Все материалы публичного SEO-блога «Наша Семья»
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {postsWithoutCover > 0 && !isJobActive && (
              <Button
                onClick={handleBulkGenerateCovers}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                <Icon name="Sparkles" size={16} className="mr-2" />
                ИИ-обложки ({postsWithoutCover} без картинки)
              </Button>
            )}
            {isJobActive && (
              <Button
                disabled
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white opacity-90"
              >
                <Icon name="Loader2" size={16} className="animate-spin mr-2" />
                Генерация в фоне ({progress.done + progress.failed}/{progress.total})
              </Button>
            )}
            <Button
              onClick={() => setMirrorOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
            >
              <Icon name="Upload" size={16} className="mr-2" />
              Залить из MAX вручную
            </Button>
            <Button
              onClick={() => window.open('/blog', '_blank')}
              className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white"
            >
              <Icon name="ExternalLink" size={16} className="mr-2" />
              Открыть блог
            </Button>
            <Button variant="outline" onClick={() => { loadPosts(); loadStats(); }}>
              <Icon name="RefreshCw" size={16} className="mr-2" />
              Обновить
            </Button>
            <Button variant="outline" onClick={() => navigate('/admin/dashboard')}>
              <Icon name="ArrowLeft" size={16} className="mr-2" />
              Назад
            </Button>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <StatCard
              icon="FileText"
              label="Опубликовано"
              value={stats.published}
              color="from-green-400 to-emerald-500"
            />
            <StatCard
              icon="Eye"
              label="Всего просмотров"
              value={stats.total_views}
              color="from-blue-400 to-cyan-500"
            />
            <StatCard
              icon="TrendingUp"
              label="За 7 дней"
              value={stats.views_7d}
              color="from-purple-400 to-pink-500"
            />
            <StatCard
              icon="Clock"
              label="За 24 часа"
              value={stats.views_24h}
              color="from-orange-400 to-red-500"
            />
          </div>
        )}

        {stats && stats.top_posts.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Icon name="Trophy" size={18} className="text-amber-500" />
                Топ-5 по просмотрам
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats.top_posts.map((p, i) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <span className="w-6 text-center font-bold text-amber-600">{i + 1}</span>
                    <button
                      onClick={() => window.open(`/blog/${p.slug}`, '_blank')}
                      className="flex-1 text-left text-sm font-medium text-gray-800 hover:text-orange-600 truncate"
                    >
                      {p.title}
                    </button>
                    <Badge variant="outline" className="text-xs">
                      <Icon name="Eye" size={11} className="mr-1" />
                      {p.views_count}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <CardTitle className="text-base">
                Все посты <span className="text-gray-500 text-sm font-normal">({total})</span>
              </CardTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <form onSubmit={handleSearch} className="flex gap-1">
                  <Input
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                    placeholder="Поиск..."
                    className="h-9 w-48"
                  />
                  <Button type="submit" size="sm" variant="outline">
                    <Icon name="Search" size={14} />
                  </Button>
                </form>
                <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
                  <SelectTrigger className="w-44 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все статусы</SelectItem>
                    <SelectItem value="published">Опубликовано</SelectItem>
                    <SelectItem value="draft">Черновики</SelectItem>
                    <SelectItem value="archived">В архиве</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-12 text-center">
                <Icon name="Loader2" size={32} className="animate-spin mx-auto text-gray-400" />
              </div>
            ) : posts.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <Icon name="FileX" size={48} className="mx-auto mb-3 text-gray-300" />
                Постов не найдено
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 md:mx-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs text-gray-500 uppercase">
                      <th className="py-2 px-2 md:px-3 font-medium">Пост</th>
                      <th className="py-2 px-2 md:px-3 font-medium hidden md:table-cell">Категория</th>
                      <th className="py-2 px-2 md:px-3 font-medium hidden lg:table-cell">Просмотры</th>
                      <th className="py-2 px-2 md:px-3 font-medium hidden lg:table-cell">Дата</th>
                      <th className="py-2 px-2 md:px-3 font-medium">Статус</th>
                      <th className="py-2 px-2 md:px-3 font-medium text-right">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map(p => (
                      <tr key={p.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-2 md:px-3 max-w-xs">
                          <div className="font-medium text-gray-900 line-clamp-1">{p.title}</div>
                          <div className="text-xs text-gray-500 font-mono mt-0.5 truncate">/{p.slug}</div>
                        </td>
                        <td className="py-3 px-2 md:px-3 hidden md:table-cell">
                          {p.category_name && p.category_slug ? (
                            <Badge className={CATEGORY_COLORS[p.category_slug] ?? 'bg-gray-100 text-gray-700'}>
                              {p.category_emoji} {p.category_name}
                            </Badge>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                        <td className="py-3 px-2 md:px-3 hidden lg:table-cell">
                          <span className="flex items-center gap-1 text-gray-700">
                            <Icon name="Eye" size={13} className="text-gray-400" />
                            {p.views_count}
                          </span>
                        </td>
                        <td className="py-3 px-2 md:px-3 hidden lg:table-cell text-xs text-gray-500">
                          {formatBlogDate(p.published_at)}
                        </td>
                        <td className="py-3 px-2 md:px-3">
                          <Badge className={STATUS_LABELS[p.status]?.color ?? 'bg-gray-100'}>
                            {STATUS_LABELS[p.status]?.label ?? p.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 md:px-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Icon name="MoreVertical" size={16} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => window.open(`/blog/${p.slug}`, '_blank')}>
                                <Icon name="ExternalLink" size={14} className="mr-2 text-gray-500" />
                                Открыть
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEditor(p.id)}>
                                <Icon name="Edit" size={14} className="mr-2 text-blue-500" />
                                Редактировать
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {p.status !== 'published' && (
                                <DropdownMenuItem onClick={() => handleStatusChange(p.id, 'published')}>
                                  <Icon name="Eye" size={14} className="mr-2 text-green-500" />
                                  Опубликовать
                                </DropdownMenuItem>
                              )}
                              {p.status !== 'draft' && (
                                <DropdownMenuItem onClick={() => handleStatusChange(p.id, 'draft')}>
                                  <Icon name="EyeOff" size={14} className="mr-2 text-gray-500" />
                                  Скрыть (черновик)
                                </DropdownMenuItem>
                              )}
                              {p.status !== 'archived' && (
                                <DropdownMenuItem onClick={() => handleStatusChange(p.id, 'archived')}>
                                  <Icon name="Archive" size={14} className="mr-2 text-orange-500" />
                                  В архив
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {pages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  <Icon name="ChevronLeft" size={16} />
                  Назад
                </Button>
                <span className="px-4 text-sm text-gray-600">
                  Страница <strong>{page}</strong> из <strong>{pages}</strong>
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pages}
                  onClick={() => setPage(page + 1)}
                >
                  Вперёд
                  <Icon name="ChevronRight" size={16} />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <BlogPostEditDialog
        postId={editingId}
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditingId(null); }}
        onSaved={() => { loadPosts(); loadStats(); }}
      />

      <ManualMirrorDialog
        open={mirrorOpen}
        onOpenChange={setMirrorOpen}
        onSuccess={() => { loadPosts(); loadStats(); }}
      />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-sm`}>
            <Icon name={icon} size={18} />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium">{label}</div>
            <div className="text-xl font-bold text-gray-900">{value.toLocaleString('ru-RU')}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}