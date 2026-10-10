import {
  Children,
  isValidElement,
  useMemo,
  type HTMLAttributes,
  type Key,
  type MouseEventHandler,
  type ReactNode,
} from 'react';
import ReactMarkdown, {
  type AllowElement,
  type Components,
  type Options as ReactMarkdownOptions,
  type UrlTransform,
} from 'react-markdown';
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
  const renderer = useMemo<MarkdownContentComponents>(
    () => ({
      a: ({ node: _node, href, children, ...anchorProps }) => {
        const external = isExternalHref(href);
        const target = external ? externalLinkTarget : undefined;
        return (
          <a
            {...anchorProps}
            href={href}
            target={target}
            rel={target === '_blank' ? 'noopener noreferrer' : undefined}
            onClick={onLinkClick}
          >
            {children}
          </a>
        );
      },
      img: ({ node: _node, alt = '', ...imageProps }) => (
        <img {...imageProps} alt={alt} loading="lazy" />
      ),
      input: ({ node: _node, ...inputProps }) => (
        <input
          {...inputProps}
          aria-label={
            inputProps['aria-label'] ?? (inputProps.checked ? '已完成任务' : '未完成任务')
          }
        />
      ),
      code: ({ node: _node, className: codeClassName, ...codeProps }) => (
        <code
          data-slot={codeClassName ? 'markdown-code-source' : 'markdown-inline-code'}
          className={codeClassName}
          {...codeProps}
        />
      ),
      table: ({ node: _node, children, ...tableProps }) => (
        <div
          data-slot="markdown-table-scroll"
          className="rui-markdown-table-scroll"
          tabIndex={0}
          aria-label="Markdown 表格"
        >
          <table {...tableProps}>{children}</table>
        </div>
      ),
      pre: ({ node: _node, children, ...preProps }) => {
        const block = fencedCode(children);
        if (!block)
          return (
            <pre data-slot="markdown-plain-pre" {...preProps}>
              {children}
            </pre>
          );
        if (renderCodeBlock) return renderCodeBlock(block);
        return (
          <CodeBlock
            code={block.code}
            language={block.language}
            copyable={codeCopyable}
            onCopy={onCodeCopy ? (code) => onCodeCopy(code, block.language) : undefined}
            className="rui-markdown-code-block"
          />
        );
      },
      ...components,
    }),
    [codeCopyable, components, externalLinkTarget, onCodeCopy, onLinkClick, renderCodeBlock],
  );
  const plugins = useMemo(() => [remarkGfm, ...(remarkPlugins ?? [])], [remarkPlugins]);
  const isEmpty = value.trim().length === 0;
  const renderedValue = useMemo(
    () =>
      streaming && completeIncompleteMarkdown
        ? remend(value, { linkMode: 'text-only', ...streamingOptions })
        : value,
    [completeIncompleteMarkdown, streaming, streamingOptions, value],
  );

  return (
    <div
      data-slot="markdown-content"
      data-empty={isEmpty ? 'true' : undefined}
      data-streaming={streaming ? 'true' : undefined}
      data-stream-completed-syntax={renderedValue !== value ? 'true' : undefined}
      aria-busy={(ariaBusy ?? streaming) || undefined}
      className={classes('rui-markdown-content', className)}
      {...props}
    >
      {isEmpty ? (
        empty
      ) : (
        <ReactMarkdown
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
        >
          {renderedValue}
        </ReactMarkdown>
      )}
    </div>
  );
}

export interface RichMessageProps extends Omit<MessageProps, 'children'> {
  content: string;
  markdownProps?: Omit<MarkdownContentProps, 'value'>;
  children?: ReactNode;
}

/** Message role, streaming state and actions composed with MarkdownContent. */
export function RichMessage({
  content,
  markdownProps,
  children,
  ...messageProps
}: RichMessageProps) {
  return (
    <Message {...messageProps}>
      <MarkdownContent streaming={messageProps.streaming} {...markdownProps} value={content} />
      {children}
    </Message>
  );
}
