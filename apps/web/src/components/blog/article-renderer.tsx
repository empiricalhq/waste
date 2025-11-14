import Image from 'next/image';
import Link from 'next/link';
import { marketingTheme } from '@/config/marketing';
import type { PostMetadata } from '@/lib/blog';

interface ArticleRendererProps {
  metadata: PostMetadata;
  children: React.ReactNode;
}

export function ArticleRenderer({ metadata, children }: ArticleRendererProps) {
  const theme = marketingTheme;
  const breadcrumb = [{ label: 'Blog', href: '/blog' }, { label: metadata.category }];

  return (
    <>
      <div className="w-full">
        <div
          className={`flex items-center ${theme.meta.align} ${theme.breadcrumb.gap} ${theme.breadcrumb.fontSize} ${theme.breadcrumb.textColor} ${theme.spacing.breadcrumbBottom}`}
        >
          {breadcrumb.map((item, index) => (
            <span key={index} className={`flex items-center ${theme.breadcrumb.gap}`}>
              {item.href ? (
                <Link href={item.href} className={`${theme.breadcrumb.hoverColor} ${theme.transitions.default}`}>
                  {item.label}
                </Link>
              ) : (
                <span className={theme.breadcrumb.activeColor}>{item.label}</span>
              )}
              {index < breadcrumb.length - 1 && <span>/</span>}
            </span>
          ))}
        </div>

        <h1
          className={`${theme.title.fontSize} ${theme.title.fontWeight} ${theme.title.lineHeight} ${theme.title.tracking} ${theme.title.textColor} ${theme.title.align} ${theme.title.maxWidth} text-balance`}
        >
          {metadata.title}
        </h1>

        <div
          className={`relative w-full ${theme.thumbnail.aspectRatio} ${theme.thumbnail.bgColor} ${theme.thumbnail.borderRadius} ${theme.spacing.thumbnailBottom} flex items-center justify-center overflow-hidden`}
        >
          {metadata.thumbnail ? (
            <Image
              src={metadata.thumbnail}
              alt={metadata.thumbnailAlt || 'Miniatura del artículo'}
              fill={true}
              className="object-cover"
              priority={true}
            />
          ) : (
            <div className={`${theme.thumbnail.placeholderTextColor} ${theme.thumbnail.placeholderTextSize}`}>
              {metadata.thumbnailAlt || 'Miniatura del artículo'}
            </div>
          )}
        </div>

        <div
          className={`flex items-center ${theme.meta.align} ${theme.meta.gap} ${theme.meta.fontSize} ${theme.meta.textColor} ${theme.spacing.metaBottom}`}
        >
          <span>{metadata.author}</span>
          <span>{theme.meta.separator}</span>
          <time dateTime={metadata.date}>
            {new Date(metadata.date).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
        </div>
      </div>

      <div className="mx-auto" style={{ maxWidth: theme.layout.contentMaxWidth }}>
        {children}
      </div>
    </>
  );
}
