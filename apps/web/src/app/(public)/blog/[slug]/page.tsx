import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { ArticleRenderer } from '@/components/blog/article-renderer';
import { PageWrapper } from '@/components/shared/page-wrapper';
import { marketingTheme } from '@/config/marketing';
import { getBlogPosts, getPostBySlug } from '@/lib/blog';
import { useMDXComponents } from '@/mdx-components';

export function generateStaticParams() {
  const posts = getBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const params = await props.params;
  const post = getPostBySlug(params.slug);
  if (!post) {
    return {};
  }

  return {
    title: `${post.metadata.title} - Lima Limpia`,
    description: post.metadata.summary || 'Un artículo del blog de Lima Limpia.',
  };
}

export default async function BlogPostPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const post = getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const components = useMDXComponents({});

  return (
    <PageWrapper>
      <div
        className={`mx-auto ${marketingTheme.spacing.pageSide} ${marketingTheme.spacing.pageTop} ${marketingTheme.spacing.pageBottom}`}
        style={{ maxWidth: marketingTheme.layout.headerMaxWidth }}
      >
        <ArticleRenderer metadata={post.metadata}>
          <MDXRemote source={post.content} components={components} />
        </ArticleRenderer>
      </div>
    </PageWrapper>
  );
}
