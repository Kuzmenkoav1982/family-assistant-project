import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import {
  BlogPostListItem,
  CATEGORY_ICONS,
  formatBlogDate,
} from '@/lib/blogApi';

interface BlogPostCardProps {
  post: BlogPostListItem;
  variant?: 'default' | 'compact';
}

export default function BlogPostCard({ post, variant = 'default' }: BlogPostCardProps) {
  const iconName = post.category_slug ? CATEGORY_ICONS[post.category_slug] : null;

  return (
    <Link to={`/blog/${post.slug}`} className="group block h-full">
      <Card className="overflow-hidden h-full hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 border border-[#EFE5D2] shadow-sm bg-white rounded-2xl">
        <div className={`relative ${variant === 'compact' ? 'h-32' : 'h-48'} overflow-hidden bg-[#F4EBDD]`}>
          {post.cover_image_url ? (
            <img
              src={post.cover_image_url}
              alt={post.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#F4EBDD] to-[#E8DDC8] flex items-center justify-center">
              {iconName && (
                <Icon
                  name={iconName}
                  size={56}
                  className="text-[#B89B7A]"
                  strokeWidth={1.2}
                />
              )}
            </div>
          )}
          {post.category_name && (
            <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-white/95 backdrop-blur-sm border border-[#EFE5D2] px-2.5 py-1 rounded-full text-xs font-medium text-[#6B5340] shadow-sm">
              {iconName && (
                <Icon name={iconName} size={12} className="text-[#B89B7A]" strokeWidth={1.8} />
              )}
              {post.category_name}
            </div>
          )}
        </div>

        <div className="p-5 space-y-3">
          <h3 className="font-medium text-lg leading-snug text-[#3F2E1E] group-hover:text-[#A0825F] transition-colors line-clamp-2 font-[Montserrat]">
            {post.title}
          </h3>

          {variant === 'default' && (
            <p className="text-sm text-[#6B5340] line-clamp-3 leading-relaxed">
              {post.excerpt}
            </p>
          )}

          <div className="flex items-center justify-between pt-2 text-xs text-[#9C8467]">
            <span className="flex items-center gap-1.5">
              <Icon name="Calendar" size={13} strokeWidth={1.6} />
              {formatBlogDate(post.published_at)}
            </span>
            <span className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Icon name="Clock" size={13} strokeWidth={1.6} />
                {post.reading_time_min} мин
              </span>
              {post.views_count > 0 && (
                <span className="flex items-center gap-1">
                  <Icon name="Eye" size={13} strokeWidth={1.6} />
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
