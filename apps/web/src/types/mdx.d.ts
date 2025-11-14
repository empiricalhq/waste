declare module '*.mdx' {
  import type { MDXProps } from 'mdx/types';

  export const metadata: {
    title: string;
    author: string;
    date: string;
    category: string;
    thumbnail?: {
      src?: string;
      alt?: string;
    };
  };

  export default function MDXContent(props: MDXProps): JSX.Element;
}
