import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import {
  BlogPostListItem,
  CATEGORY_COLORS,
  CATEGORY_GRADIENTS,
  formatBlogDate,
} from '@/lib/blogApi';

interface BlogPostCardProps {
  post: BlogPostListItem;
  variant?: 'default' | 'compact';
}

export default function BlogPostCard({ post, variant = 'default' }: BlogPostCardProps) {
  const catColor = post.category_slug
    ? CATEGORY_COLORS[post.category_slug] ?? 'bg-gray-100 text-gray-700'
    : 'bg-gray-100 text-gray-700';
  const catGradient = post.category_slug
    ? CATEGORY_GRADIENTS[post.category_slug] ?? 'from-orange-500 to-pink-500'
    : 'from-orange-500 to-pink-500';

  return (
    <Link to={`/blog/${post.slug}`} className="group block h-full">
      <Card className="overflow-hidden h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-0 shadow-md bg-white">
        <div className={`relative ${variant === 'compact' ? 'h-32' : 'h-48'} overflow-hidden`}>
          {post.cover_image_url ? (
            <img
              src={post.cover_image_url}
              alt={post.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${catGradient} flex items-center justify-center`}>
              <span className="text-7xl drop-shadow-lg">{post.category_emoji ?? '📖'}</span>
            </div>
          )}
          {post.category_name && (
            <Badge className={`absolute top-3 left-3 ${catColor} font-medium border-0 shadow-sm`}>
              {post.category_emoji} {post.category_name}
            </Badge>
          )}
        </div>

        <div className="p-5 space-y-3">
          <h3 className="font-bold text-lg leading-tight text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-2 font-[Montserrat]">
            {post.title}
          </h3>

          {variant === 'default' && (
            <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
              {post.excerpt}
            </p>
          )}

          <div className="flex items-center justify-between pt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <Icon name="Calendar" size={13} />
              {formatBlogDate(post.published_at)}
            </span>
            <span className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Icon name="Clock" size={13} />
                {post.reading_time_min} мин
              </span>
              {post.views_count > 0 && (
                <span className="flex items-center gap-1">
                  <Icon name="Eye" size={13} />
                  {post.views_count}
                </span>
              )}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
