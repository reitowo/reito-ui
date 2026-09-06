import { textControl, booleanControl, choiceControl } from '../feature-controls.js';
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { CodeBlock, type CodeBlockProps } from '../../../../packages/ui/src/ai/code-block.js';
import { Button } from '../../../../packages/ui/src/primitives/button.js';
import { StoryFrame } from './story-frame.js';

const meta = {
  title: 'AI/CodeBlock', component: CodeBlock,
  args: { filename: 'workspace.ts', language: 'typescript', code: 'export const density = "compact";', onCopy: fn() },
  decorators: [Story => <StoryFrame><Story /></StoryFrame>],
  parameters: { docs: { description: { component: '按 language 解析源码并应用共享语法颜色，支持深浅主题。默认文本、未知语言或超出高亮长度限制时保留纯文本。显示和复制保持原始源码；onCopy 可由宿主替换，默认调用系统剪贴板。' } } },
} satisfies Meta<typeof CodeBlock>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Guidelines: Story = { name: '交互场景：高亮与复制',
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const code = canvasElement.querySelector('[data-slot="code-content"]');
    await expect(code).toHaveAttribute('data-highlighted', 'true');
    await expect(code?.textContent).toBe(args.code);
    await expect(code?.querySelector('.token.keyword')).toBeVisible();
    await expect(code?.querySelector('.token.string')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: '复制代码' }));
    await expect(args.onCopy).toHaveBeenCalledWith(args.code);
    await expect(canvas.getByRole('button', { name: '代码已复制' })).toBeVisible();
  },
};
export const Clipboard: Story = { name: '系统剪贴板', args: { onCopy: undefined } };
export const CopyError: Story = { name: '复制失败', args: { onCopy: fn(async () => { throw new Error('Denied'); }) }, play: async ({ canvasElement }) => { const canvas = within(canvasElement); await userEvent.click(canvas.getByRole('button', { name: '复制代码' })); await expect(await canvas.findByRole('alert')).toHaveTextContent('复制失败，请选择代码手动复制。'); } };
export const ReadOnly: Story = { name: '隐藏复制操作', args: { copyable: false } };
export const Embedded: Story = { name: '嵌入容器', args: { variant: 'embedded' }, decorators: [Story => <section aria-label="嵌入产物" className="overflow-hidden rounded-lg border"><Story /></section>], parameters: { docs: { description: { story: '嵌入已有产物容器时去掉第二层边框与内距。宿主不再为代码区额外添加 padding。' } } } };
export const Empty: Story = { name: '空代码', args: { code: '' } };
export const LongLines: Story = { name: '长行局部滚动',
  args: { code: 'export const nestedPath = "packages/ui/src/components/workspace/very-long-module-name-with-a-readable-code-scroll-region/settings.tsx";\n'.repeat(10) },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const pre = canvas.getByLabelText('workspace.ts代码');
    await userEvent.click(canvas.getByRole('button', { name: '复制代码' }));
    await userEvent.tab();
    await expect(pre).toHaveFocus();
    await expect(pre.textContent).toBe(args.code);
    await expect(pre.scrollWidth).toBeGreaterThan(pre.clientWidth);
  },
};

const languageSamples = [
  { label: 'TypeScript', language: 'ts', code: 'export const density: string = "compact";\n// 桌面工作区\n' },
  { label: 'JavaScript', language: 'js', code: 'export function describe(name) { return `Hello, ${name}`; }' },
  { label: 'TSX', language: 'tsx', code: 'const Preview = ({ name }: { name: string }) => <div title={name}>工作区</div>;' },
  { label: 'JSX', language: 'jsx', code: 'export const Preview = () => <button disabled={false}>保存</button>;' },
  { label: 'JSON', language: 'json', code: '{\n  "name": "个人工作区",\n  "enabled": true,\n  "count": 3\n}' },
  { label: 'HTML', language: 'html', code: '<section aria-label="工作区"><h1>个人工作区</h1></section>' },
  { label: 'CSS', language: 'css', code: '.workspace { color: var(--rui-text); display: grid; }' },
  { label: 'Bash', language: 'bash', code: '# 本地检查\nname="workspace"\nprintf "%s\\n" "$name"' },
  { label: 'PowerShell', language: 'powershell', code: '$name = "workspace"\nWrite-Output $name' },
  { label: 'Python', language: 'py', code: 'def describe(name: str) -> str:\n    return f"Hello, {name}"\n' },
  { label: 'SQL', language: 'sql', code: "SELECT name, COUNT(*) AS total FROM workspaces WHERE status = 'ready' GROUP BY name;" },
  { label: 'YAML', language: 'yaml', code: 'workspace:\n  name: "个人工作区"\n  enabled: true\n' },
  { label: 'Markdown', language: 'md', code: '# 工作区\n\n**共享组件**与 `compact` 密度。\n' },
  { label: 'Go', language: 'go', code: 'package main\n\nfunc main() { println("workspace") }\n' },
  { label: 'Rust', language: 'rust', code: 'fn main() {\n    let name = "workspace";\n    println!("{}", name);\n}\n' },
];

function LanguageExamples() {
  const [selected, setSelected] = useState(0);
  const sample = languageSamples[selected];
  return <>
    <div aria-label="示例语言" className="flex flex-wrap gap-2">{languageSamples.map((item, index) => <Button key={item.label} type="button" size="sm" variant={selected === index ? 'secondary' : 'ghost'} aria-pressed={selected === index} onClick={() => setSelected(index)}>{item.label}</Button>)}</div>
    <CodeBlock language={sample.language} code={sample.code} copyable={false} />
  </>;
}
export const Languages: Story = { name: '交互场景：切换语言',
  render: () => <LanguageExamples />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const sample of languageSamples) {
      await userEvent.click(canvas.getByRole('button', { name: sample.label }));
      const code = canvasElement.querySelector('[data-slot="code-content"]');
      await expect(code).toHaveAttribute('data-highlighted', 'true');
      await expect(code?.textContent).toBe(sample.code);
      await expect(code?.querySelectorAll('.token').length).toBeGreaterThan(0);
    }
    await userEvent.click(canvas.getByRole('button', { name: 'TypeScript' }));
  },
};

const largeSource = '// 保留超长文件的原始文本，不同步解析。\n'.repeat(3000);
const fallbackSamples = [
  { filename: '未指定语言', code: 'export const density = "compact";' },
  { filename: '未知语言', language: 'workspace-dsl', code: 'workspace { name: "个人工作区" }\n' },
  { filename: '内部方法不是语言', language: 'extend', code: 'export const density = "compact";' },
  { filename: '超长 TypeScript', language: 'typescript', code: largeSource },
];
function FallbackExamples() {
  const [selected, setSelected] = useState(0);
  return <><div aria-label="纯文本回退示例" className="flex flex-wrap gap-2">{fallbackSamples.map((sample, index) => <Button key={sample.filename} type="button" size="sm" variant={selected === index ? 'secondary' : 'ghost'} aria-pressed={selected === index} onClick={() => setSelected(index)}>{sample.filename}</Button>)}</div><CodeBlock {...fallbackSamples[selected]} copyable={false} /></>;
}
export const PlainTextFallbacks: Story = { name: '交互场景：纯文本回退',
  render: () => <FallbackExamples />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const sample of fallbackSamples) {
      await userEvent.click(canvas.getByRole('button', { name: sample.filename }));
      const pre = canvas.getByLabelText(`${sample.filename}代码`);
      const code = pre.querySelector('code');
      await expect(code).toHaveAttribute('data-highlighted', 'false');
      await expect(code?.textContent).toBe(sample.code);
      await expect(code?.querySelectorAll('.token')).toHaveLength(0);
    }
    await userEvent.click(canvas.getByRole('button', { name: '未指定语言' }));
  },
};

const markupSource = '<!-- 源码中的标签只作为文本展示 -->\n<img src="missing.png" onerror="alert(1)">\n<script>throw new Error("must stay text")</script>\n<p title="a & b">&lt;workspace&gt;</p>\n';
export const MarkupEscaping: Story = { name: 'HTML 安全文本',
  args: { filename: 'source.html', language: 'html', code: markupSource },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const pre = canvas.getByLabelText('source.html代码');
    await expect(pre.textContent).toBe(markupSource);
    await expect(pre.querySelector('code')).toHaveAttribute('data-highlighted', 'true');
    await expect(pre.querySelector('.token.tag')).toBeVisible();
    await expect(pre.querySelectorAll('img, script, p')).toHaveLength(0);
    await userEvent.click(canvas.getByRole('button', { name: '复制代码' }));
    await expect(args.onCopy).toHaveBeenCalledWith(markupSource);
  },
};

const updatedSource = 'export const density = "comfortable";\n';
function UpdatingCode({ onCopy }: Pick<CodeBlockProps, 'onCopy'>) {
  const [code, setCode] = useState('export const density = "compact";');
  const [language, setLanguage] = useState('typescript');
  return <>
    <div className="flex flex-wrap gap-2">
      <Button type="button" size="sm" variant="outline" onClick={() => setCode(updatedSource)}>更新源码</Button>
      <Button type="button" size="sm" variant="outline" onClick={() => setLanguage('text')}>切换为纯文本</Button>
      <Button type="button" size="sm" variant="outline" onClick={() => setLanguage('typescript')}>恢复 TypeScript</Button>
    </div>
    <CodeBlock filename="live.ts" code={code} language={language} onCopy={onCopy} />
  </>;
}
export const LiveUpdates: Story = { name: '交互场景：更新源码与语言',
  render: args => <UpdatingCode onCopy={args.onCopy} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const pre = canvas.getByLabelText('live.ts代码');
    await userEvent.click(canvas.getByRole('button', { name: '更新源码' }));
    await expect(pre.textContent).toBe(updatedSource);
    await expect(pre.querySelector('code')).toHaveAttribute('data-highlighted', 'true');
    await userEvent.click(canvas.getByRole('button', { name: '切换为纯文本' }));
    await expect(pre.querySelector('code')).toHaveAttribute('data-highlighted', 'false');
    await expect(pre.querySelectorAll('.token')).toHaveLength(0);
    await expect(pre.textContent).toBe(updatedSource);
    await userEvent.click(canvas.getByRole('button', { name: '恢复 TypeScript' }));
    await expect(pre.querySelector('code')).toHaveAttribute('data-highlighted', 'true');
    await expect(pre.querySelector('.token.keyword')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: '复制代码' }));
    await expect(args.onCopy).toHaveBeenCalledWith(updatedSource);
  },
};

export const Default: Story = { name: '默认 TypeScript' };
export const JavaScript: Story = { name: 'JavaScript', args: { filename: 'JavaScript 示例', language: languageSamples[1].language, code: languageSamples[1].code } };
export const TSX: Story = { name: 'TSX', args: { filename: 'TSX 示例', language: languageSamples[2].language, code: languageSamples[2].code } };
export const JSX: Story = { name: 'JSX', args: { filename: 'JSX 示例', language: languageSamples[3].language, code: languageSamples[3].code } };
export const JSON: Story = { name: 'JSON', args: { filename: 'JSON 示例', language: languageSamples[4].language, code: languageSamples[4].code } };
export const HTML: Story = { name: 'HTML', args: { filename: 'HTML 示例', language: languageSamples[5].language, code: languageSamples[5].code } };
export const CSS: Story = { name: 'CSS', args: { filename: 'CSS 示例', language: languageSamples[6].language, code: languageSamples[6].code } };
export const Bash: Story = { name: 'Bash', args: { filename: 'Bash 示例', language: languageSamples[7].language, code: languageSamples[7].code } };
export const PowerShell: Story = { name: 'PowerShell', args: { filename: 'PowerShell 示例', language: languageSamples[8].language, code: languageSamples[8].code } };
export const Python: Story = { name: 'Python', args: { filename: 'Python 示例', language: languageSamples[9].language, code: languageSamples[9].code } };
export const SQL: Story = { name: 'SQL', args: { filename: 'SQL 示例', language: languageSamples[10].language, code: languageSamples[10].code } };
export const YAML: Story = { name: 'YAML', args: { filename: 'YAML 示例', language: languageSamples[11].language, code: languageSamples[11].code } };
export const Markdown: Story = { name: 'Markdown', args: { filename: 'Markdown 示例', language: languageSamples[12].language, code: languageSamples[12].code } };
export const Go: Story = { name: 'Go', args: { filename: 'Go 示例', language: languageSamples[13].language, code: languageSamples[13].code } };
export const Rust: Story = { name: 'Rust', args: { filename: 'Rust 示例', language: languageSamples[14].language, code: languageSamples[14].code } };
export const PlainText: Story = { name: '纯文本', args: { filename: '纯文本', language: 'text', code: fallbackSamples[0].code } };
export const UnknownLanguage: Story = { name: '未知语言回退', args: { filename: fallbackSamples[1].filename, language: fallbackSamples[1].language, code: fallbackSamples[1].code } };
export const OversizedSource: Story = { name: '超长源码回退', args: { filename: '超长 TypeScript', language: 'typescript', code: largeSource, copyable: false } };

export const Playground: Story = {
  name: '参数调试', args: { variant: 'default', copyable: true, language: 'typescript', filename: 'workspace.ts', code: 'export const density = "compact";', onCopy: undefined },
  argTypes: { variant: choiceControl(['default', 'embedded']), copyable: booleanControl, language: choiceControl(['text', 'typescript', 'javascript', 'tsx', 'jsx', 'json', 'html', 'css', 'bash', 'powershell', 'python', 'sql', 'yaml', 'markdown', 'go', 'rust']), filename: textControl, code: textControl },
  parameters: { controls: { include: ['variant', 'copyable', 'language', 'filename', 'code'] } }, render: args => <CodeBlock {...args} />,
};
