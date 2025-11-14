import type { Metadata } from 'next';
import Link from 'next/link';
import { PageWrapper } from '@/components/shared/page-wrapper';
import { marketingTheme } from '@/config/marketing';
import { generateExcerpt, getBlogPosts } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'Blog - Lima Limpia',
  description: 'Artículos y análisis sobre la gestión de residuos en Lima.',
};

export default function BlogIndexPage() {
  const posts = getBlogPosts();

  return (
    <PageWrapper>
      <div
        className={`mx-auto ${marketingTheme.spacing.pageSide} ${marketingTheme.spacing.pageTop} ${marketingTheme.spacing.pageBottom}`}
        style={{ maxWidth: marketingTheme.layout.contentMaxWidth }}
      >
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tighter text-gray-900">Blog</h1>
          <p className="mt-4 text-lg text-gray-600">
            Análisis sobre la transparencia de datos en la gestión de residuos.
          </p>
        </div>

        <div className="space-y-12">
          {posts.map((post) => (
            <article key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="block group p-6 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors bg-white"
              >
                <div className="flex items-center gap-x-3 text-sm text-gray-500 mb-2">
                  <time dateTime={post.metadata.date}>
                    {new Date(post.metadata.date).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                  <span>·</span>
                  <span>{post.metadata.category}</span>
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                  {post.metadata.title}
                </h2>
                <p className="mt-3 text-gray-600 leading-relaxed">
                  {post.metadata.summary || generateExcerpt(post.content)}
                </p>
                <div className="mt-4 text-sm font-medium text-gray-900 group-hover:underline">Leer más →</div>
              </Link>
            </article>
          ))}

          {posts.length === 0 && (
            <div className="text-center py-12 text-gray-500">No hay artículos publicados todavía.</div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
