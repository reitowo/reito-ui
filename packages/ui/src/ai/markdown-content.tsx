import { Children, isValidElement, useMemo, type HTMLAttributes, type Key, type MouseEventHandler, type ReactNode } from 'react';
import ReactMarkdown, { type AllowElement, type Components, type Options as ReactMarkdownOptions, type UrlTransform } from 'react-markdown';
import remend, { type RemendOptions } from 'remend';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from './code-block.js';
import { Message, type MessageProps } from './conversation.js';
import { classes } from './shared.js';

export type MarkdownContentComponents = Components;
export type MarkdownContentUrlTransform = UrlTransform;
export type MarkdownContentElementFilter = AllowElement;
export type MarkdownStreamingOptions = RemendOptions;

export interface MarkdownCodeBlock {
  code: string;
  language: string;
}

export interface MarkdownContentProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  value: string;
  empty?: ReactNode;
  htmlPolicy?: 'escape' | 'remove';
  streaming?: boolean;
  streamKey?: Key;
  completeIncompleteMarkdown?: boolean;
  streamingOptions?: MarkdownStreamingOptions;
  externalLinkTarget?: '_blank' | '_self';
  onLinkClick?: MouseEventHandler<HTMLAnchorElement>;
  codeCopyable?: boolean;
  onCodeCopy?: (code: string, language: string) => void | Promise<void>;
  renderCodeBlock?: (block: MarkdownCodeBlock) => ReactNode;
  components?: MarkdownContentComponents;
  allowedElements?: ReactMarkdownOptions['allowedElements'];
  disallowedElements?: ReactMarkdownOptions['disallowedElements'];
  allowElement?: MarkdownContentElementFilter;
  unwrapDisallowed?: boolean;
  urlTransform?: MarkdownContentUrlTransform;
  remarkPlugins?: ReactMarkdownOptions['remarkPlugins'];
  rehypePlugins?: ReactMarkdownOptions['rehypePlugins'];
}

function fencedCode(children: ReactNode): MarkdownCodeBlock | undefined {
  const items = Children.toArray(children);
  if (items.length !== 1 || !isValidElement(items[0])) return undefined;
  const props = items[0].props as { children?: ReactNode; className?: string };
  const source = typeof props.children === 'string' ? props.children : undefined;
  if (source === undefined) return undefined;
  const language = /(?:^|\s)language-([^\s]+)/.exec(props.className ?? '')?.[1] ?? 'text';
  return { code: source.endsWith('\n') ? source.slice(0, -1) : source, language };
}

function isExternalHref(href: string | undefined) {
  return href ? /^(?:https?:|mailto:)/i.test(href) : false;
}

/** Safe-by-default CommonMark and GFM rendering for desktop content surfaces. */
export function MarkdownContent({
  value,
  empty,
  htmlPolicy = 'escape',
  streaming = false,
  streamKey,
  completeIncompleteMarkdown = true,
  streamingOptions,
  externalLinkTarget = '_blank',
  onLinkClick,
  codeCopyable = true,
  onCodeCopy,
  renderCodeBlock,
  components,
  allowedElements,
  disallowedElements,
  allowElement,
  unwrapDisallowed = false,
  urlTransform,
  remarkPlugins,
  rehypePlugins,
  className,
  'aria-busy': ariaBusy,
  ...props
}: MarkdownContentProps) {
  const renderer = useMemo<MarkdownContentComponents>(() => ({
    a: ({ node: _node, href, children, ...anchorProps }) => {
      const external = isExternalHref(href);
      const target = external ? externalLinkTarget : undefined;
      return <a {...anchorProps} href={href} target={target} rel={target === '_blank' ? 'noopener noreferrer' : undefined} onClick={onLinkClick}>{children}</a>;
    },
    img: ({ node: _node, alt = '', ...imageProps }) => <img {...imageProps} alt={alt} loading="lazy" />,
    input: ({ node: _node, ...inputProps }) => <input {...inputProps} aria-label={inputProps['aria-label'] ?? (inputProps.checked ? '已完成任务' : '未完成任务')} />,
    code: ({ node: _node, className: codeClassName, ...codeProps }) => <code data-slot={codeClassName ? 'markdown-code-source' : 'markdown-inline-code'} className={codeClassName} {...codeProps} />,
    table: ({ node: _node, children, ...tableProps }) => <div data-slot="markdown-table-scroll" tabIndex={0} aria-label="Markdown 表格" className="my-[var(--rui-space-3)] min-w-0 overflow-x-auto rounded-md border border-border focus-visible:outline-[length:var(--rui-outline-width)] focus-visible:outline-ring"><table {...tableProps}>{children}</table></div>,
    pre: ({ node: _node, children, ...preProps }) => {
      const block = fencedCode(children);
      if (!block) return <pre data-slot="markdown-plain-pre" {...preProps}>{children}</pre>;
      if (renderCodeBlock) return renderCodeBlock(block);
      return <CodeBlock code={block.code} language={block.language} copyable={codeCopyable} onCopy={onCodeCopy ? code => onCodeCopy(code, block.language) : undefined} className="my-[var(--rui-space-3)]" />;
    },
    ...components,
  }), [codeCopyable, components, externalLinkTarget, onCodeCopy, onLinkClick, renderCodeBlock]);
  const plugins = useMemo(() => [remarkGfm, ...(remarkPlugins ?? [])], [remarkPlugins]);
  const isEmpty = value.trim().length === 0;
  const renderedValue = useMemo(() => streaming && completeIncompleteMarkdown
    ? remend(value, { linkMode: 'text-only', ...streamingOptions })
    : value, [completeIncompleteMarkdown, streaming, streamingOptions, value]);

  return <div
    data-slot="markdown-content"
    data-empty={isEmpty ? 'true' : undefined}
    data-streaming={streaming ? 'true' : undefined}
    data-stream-completed-syntax={renderedValue !== value ? 'true' : undefined}
    aria-busy={(ariaBusy ?? streaming) || undefined}
    className={classes(
      'min-w-0 whitespace-normal break-words text-[length:var(--rui-font-interface)] leading-6 text-foreground [overflow-wrap:anywhere]',
      '[&>:first-child]:mt-0 [&>:last-child]:mb-0',
      '[&_p]:my-[var(--rui-space-2)]',
      '[&_h1]:my-[var(--rui-space-3)] [&_h1]:text-lg [&_h1]:font-semibold [&_h1]:tracking-tight',
      '[&_h2]:my-[var(--rui-space-3)] [&_h2]:text-base [&_h2]:font-semibold [&_h2]:tracking-tight',
      '[&_h3]:my-[var(--rui-space-2)] [&_h3]:text-sm [&_h3]:font-semibold',
      '[&_h4]:my-[var(--rui-space-2)] [&_h4]:text-sm [&_h4]:font-medium',
      '[&_ul]:my-[var(--rui-space-2)] [&_ul]:list-disc [&_ul]:pl-[var(--rui-space-5)]',
      '[&_ol]:my-[var(--rui-space-2)] [&_ol]:list-decimal [&_ol]:pl-[var(--rui-space-5)]',
      '[&_li]:my-[var(--rui-space-1)] [&_li>p]:my-0 [&_li>ul]:my-[var(--rui-space-1)] [&_li>ol]:my-[var(--rui-space-1)]',
      '[&_ul.contains-task-list]:list-none [&_ul.contains-task-list]:pl-0',
      '[&_li.task-list-item]:grid [&_li.task-list-item]:grid-cols-[auto_minmax(0,1fr)] [&_li.task-list-item]:items-start [&_li.task-list-item]:gap-[var(--rui-space-2)]',
      '[&_li.task-list-item>input]:mt-[var(--rui-space-1)] [&_li.task-list-item>input]:size-[var(--rui-space-4)] [&_li.task-list-item>input]:accent-primary',
      '[&_blockquote]:my-[var(--rui-space-3)] [&_blockquote]:border-l-[length:var(--rui-outline-width)] [&_blockquote]:border-border [&_blockquote]:pl-[var(--rui-space-3)] [&_blockquote]:text-muted-foreground',
      '[&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4',
      '[&_[data-slot=markdown-inline-code]]:rounded-sm [&_[data-slot=markdown-inline-code]]:bg-muted [&_[data-slot=markdown-inline-code]]:px-[var(--rui-space-1)] [&_[data-slot=markdown-inline-code]]:font-mono [&_[data-slot=markdown-inline-code]]:text-xs',
      '[&_[data-slot=markdown-plain-pre]]:my-[var(--rui-space-3)] [&_[data-slot=markdown-plain-pre]]:overflow-auto [&_[data-slot=markdown-plain-pre]]:rounded-md [&_[data-slot=markdown-plain-pre]]:border [&_[data-slot=markdown-plain-pre]]:border-border [&_[data-slot=markdown-plain-pre]]:bg-muted [&_[data-slot=markdown-plain-pre]]:p-[var(--rui-content-padding)] [&_[data-slot=markdown-plain-pre]]:font-mono [&_[data-slot=markdown-plain-pre]]:text-xs',
      '[&_table]:w-full [&_table]:border-collapse [&_table]:text-left [&_table]:text-sm',
      '[&_th]:bg-muted/60 [&_th]:px-[var(--rui-cell-padding-x)] [&_th]:py-[var(--rui-cell-padding-y)] [&_th]:font-medium',
      '[&_td]:border-t [&_td]:border-border [&_td]:px-[var(--rui-cell-padding-x)] [&_td]:py-[var(--rui-cell-padding-y)] [&_td]:align-top',
      '[&_hr]:my-[var(--rui-space-4)] [&_hr]:border-border',
      '[&_img]:my-[var(--rui-space-3)] [&_img]:max-w-full [&_img]:rounded-md [&_img]:border [&_img]:border-border [&_img]:bg-muted/30',
      '[&_del]:text-muted-foreground',
      '[&_section[data-footnotes]]:mt-[var(--rui-space-4)] [&_section[data-footnotes]]:border-t [&_section[data-footnotes]]:border-border [&_section[data-footnotes]]:pt-[var(--rui-space-3)] [&_section[data-footnotes]]:text-xs [&_section[data-footnotes]]:text-muted-foreground',
      className,
    )}
    {...props}
  >
    {isEmpty ? empty : <ReactMarkdown
      key={streamKey}
      components={renderer}
      remarkPlugins={plugins}
      rehypePlugins={rehypePlugins}
      skipHtml={htmlPolicy === 'remove'}
      allowedElements={allowedElements}
      disallowedElements={disallowedElements}
      allowElement={allowElement}
      unwrapDisallowed={unwrapDisallowed}
      urlTransform={urlTransform}
    >{renderedValue}</ReactMarkdown>}
  </div>;
}

export interface RichMessageProps extends Omit<MessageProps, 'children'> {
  content: string;
  markdownProps?: Omit<MarkdownContentProps, 'value'>;
  children?: ReactNode;
}

/** Message role, streaming state and actions composed with MarkdownContent. */
export function RichMessage({ content, markdownProps, children, ...messageProps }: RichMessageProps) {
  return <Message {...messageProps}><MarkdownContent streaming={messageProps.streaming} {...markdownProps} value={content} />{children}</Message>;
}
