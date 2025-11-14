import type { MDXComponents } from 'mdx/types';
import { marketingTheme } from '@/config/marketing';

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: This component is inherently verbose
export function useMDXComponents(components: MDXComponents): MDXComponents {
  const theme = marketingTheme;

  return {
    h1: ({ children }) => (
      <h1 className="text-[32px] md:text-[36px] font-semibold mb-6 mt-12 leading-[1.2] tracking-tight text-gray-900">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2
        className={`text-[28px] md:text-[32px] font-semibold mb-5 mt-16 leading-[1.3] tracking-tight ${theme.content.headingColor}`}
      >
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className={`text-[24px] font-semibold mb-4 mt-14 leading-[1.4] ${theme.content.headingColor}`}>{children}</h3>
    ),
    p: ({ children }) => (
      <p
        className={`${theme.content.fontSize} ${theme.content.lineHeight} ${theme.content.paragraphSpacing} ${theme.content.textColor}`}
      >
        {children}
      </p>
    ),
    a: ({ href, children }) => (
      <a
        href={href}
        className={`${theme.content.linkColor} ${theme.content.linkDecoration} ${theme.content.linkHoverDecoration} ${theme.transitions.default}`}
        target={href?.startsWith('http') ? '_blank' : undefined}
        rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
      >
        {children}
      </a>
    ),
    blockquote: ({ children }) => (
      <blockquote
        className={`border-l-[3px] ${theme.content.blockquoteBorder} pl-5 py-1 my-6 ${theme.content.blockquoteText}`}
      >
        {children}
      </blockquote>
    ),
    ul: ({ children }) => (
      <ul className={`${theme.content.paragraphSpacing} space-y-2 ${theme.content.textColor}`}>{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className={`${theme.content.paragraphSpacing} space-y-2 ${theme.content.textColor}`}>{children}</ol>
    ),
    li: ({ children }) => <li className={`${theme.content.fontSize} ${theme.content.lineHeight} ml-6`}>{children}</li>,
    strong: ({ children }) => <strong className={`font-semibold ${theme.content.headingColor}`}>{children}</strong>,
    em: ({ children }) => <em className={`italic ${theme.content.textColor}`}>{children}</em>,
    code: ({ children }) => (
      <code
        className={`${theme.content.codeInlineBg} px-1.5 py-0.5 rounded text-[15px] font-mono ${theme.content.codeInlineText} border ${theme.content.codeInlineBorder}`}
      >
        {children}
      </code>
    ),
    pre: ({ children }) => (
      <pre
        className={`${theme.content.codeBlockBg} p-6 rounded-lg overflow-x-auto mb-6 border ${theme.content.codeBlockBorder}`}
      >
        {children}
      </pre>
    ),
    hr: () => <hr className="border-gray-200 my-12" />,
    ...components,
  };
}
