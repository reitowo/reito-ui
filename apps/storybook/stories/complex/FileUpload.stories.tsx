import { useRef, useState, type ComponentProps } from 'react';
import { booleanControl, choiceControl, numberControl, rangeControl, textControl } from '../feature-controls.js';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { FileUpload, type FileUploadStatus, type FileUploadTransport, type QueuedFile } from '../../../../packages/ui/src/complex/index.js';
import { FileUploadDemo } from '../../../../packages/ui/src/complex/catalog.js';

const sampleFile = (name = 'workspace-notes.md') => new File(['本地文件示例'], name, { type: 'text/markdown', lastModified: 1 });
const queued = (status: FileUploadStatus = 'queued', progress?: number, error?: string): QueuedFile[] => [{ id: 'notes', file: sampleFile(), status, progress, error }];

const simulatedTransport: FileUploadTransport = async (_item, { signal, onProgress }) => {
  for (const progress of [28, 64, 100]) {
    await new Promise<void>((resolve, reject) => {
      const timer = window.setTimeout(resolve, 30);
      signal.addEventListener('abort', () => { window.clearTimeout(timer); reject(new DOMException('已取消', 'AbortError')); }, { once: true });
    });
    onProgress(progress);
  }
};

const meta = { title: '复杂/FileUpload 文件上传', component: FileUploadDemo, parameters: { docs: { description: { component: '保留本地类型、大小、数量与重复校验，并通过宿主 transport 执行上传。队列明确 queued/uploading/success/error/canceled、进度、开始、取消、重试与逐文件错误；组件自身不实现网络协议。' } } } } satisfies Meta<typeof FileUploadDemo>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Interactive: Story = {
  name: '交互场景：添加、上传与完成',
  render: () => <FileUpload accept=".md" transport={simulatedTransport} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement); const user = userEvent.setup();
    await user.upload(canvas.getByLabelText('添加文件', { selector: 'input' }), sampleFile());
    expect(canvasElement.querySelector('[data-status="queued"]')).toBeInTheDocument();
    await user.click(canvas.getByRole('button', { name: '开始' }));
    expect(canvasElement.querySelector('[data-status="uploading"]')).toBeInTheDocument();
    await canvas.findByText(/上传完成/);
    expect(canvas.getByRole('status')).toHaveTextContent('已完成 1');
  },
};

export const Validation: Story = {
  name: '类型、大小、重复与数量校验',
  render: () => <FileUpload accept=".txt" maxSize={1024} maxFiles={2} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement); const input = canvas.getByLabelText('添加文件', { selector: 'input' });
    const user = userEvent.setup({ applyAccept: false });
    const file = new File(['本地示例'], 'notes.txt', { type: 'text/plain', lastModified: 1 });
    await user.upload(input, file);
    expect(canvas.getByRole('status')).toHaveTextContent('共 1 个文件');
    await user.upload(input, file);
    expect(canvas.getByRole('alert')).toHaveTextContent('已在队列中');
    await user.upload(input, [new File(['x'], 'image.png', { type: 'image/png' }), new File(['x'.repeat(1025)], 'large.txt', { type: 'text/plain' })]);
    expect(canvas.getByRole('alert')).toHaveTextContent('文件类型不支持');
    expect(canvas.getByRole('alert')).toHaveTextContent('超过 1.0 KB 上限');
    await user.upload(input, [new File(['a'], 'second.txt', { type: 'text/plain' }), new File(['b'], 'third.txt', { type: 'text/plain' })]);
    expect(canvas.getByRole('status')).toHaveTextContent('共 2 个文件');
    expect(canvas.getByRole('alert')).toHaveTextContent('最多添加 2 个文件');
    await user.click(canvas.getByRole('button', { name: '移除 notes.txt' }));
    expect(canvas.queryByText('notes.txt', { exact: true })).not.toBeInTheDocument();
  },
};

function CancelDemo() {
  const [files, setFiles] = useState(queued('uploading', 42));
  const transport: FileUploadTransport = (_item, { signal, onProgress }) => new Promise((_resolve, reject) => {
    onProgress(42);
    signal.addEventListener('abort', () => reject(new DOMException('已取消', 'AbortError')), { once: true });
  });
  return <FileUpload value={files} onValueChange={setFiles} transport={transport} />;
}

function RetryDemo() {
  const attempt = useRef(0);
  const [files, setFiles] = useState(queued('error', 36, '本地模拟连接中断'));
  const transport: FileUploadTransport = async (_item, context) => {
    attempt.current++;
    context.onProgress(72);
    if (attempt.current === 1) throw new Error('本地模拟连接中断');
  };
  return <FileUpload value={files} onValueChange={setFiles} transport={transport} />;
}

export const Queued: Story = { name: '等待开始', render: () => <FileUpload value={queued()} onValueChange={() => undefined} transport={simulatedTransport} /> };
export const ControlledProgress: Story = { name: '受控上传进度', render: () => <FileUpload value={queued('uploading', 64)} onValueChange={() => undefined} /> };
export const Success: Story = { name: '上传成功', render: () => <FileUpload value={queued('success', 100)} onValueChange={() => undefined} /> };
export const UploadError: Story = { name: '单文件上传错误', render: () => <FileUpload value={queued('error', 48, '服务拒绝了这个文件')} onValueChange={() => undefined} transport={simulatedTransport} /> };
export const Canceled: Story = { name: '已取消', render: () => <FileUpload value={queued('canceled')} onValueChange={() => undefined} transport={simulatedTransport} /> };
export const CancelAction: Story = { name: '取消上传', render: () => <CancelDemo /> };
export const RetryAction: Story = { name: '失败后重试', render: () => <RetryDemo /> };
export const Empty: Story = { name: '空队列', render: () => <FileUpload accept=".txt,.md,.json" /> };
export const Disabled: Story = { name: '禁用', render: () => <FileUpload value={queued()} disabled transport={simulatedTransport} /> };
export const Narrow: Story = { name: '窄宽度', render: () => <div className="max-w-80"><FileUpload value={[...queued('uploading', 64), { id: 'error', file: sampleFile('long-workspace-export-name.json'), status: 'error', error: '上传失败，请重试' }]} onValueChange={() => undefined} transport={simulatedTransport} /></div> };

type PlaygroundArgs = Pick<ComponentProps<typeof FileUpload>, 'accept' | 'maxSize' | 'maxFiles' | 'disabled' | 'label'> & { status: FileUploadStatus; progress: number; withFile: boolean; simulateTransport: boolean; fileError: string };
export const Playground: StoryObj<PlaygroundArgs> = {
  name: '参数调试',
  args: { accept: '.txt,.md,.json', maxSize: 10485760, maxFiles: 5, disabled: false, label: '添加文件', status: 'queued', progress: 0, withFile: true, simulateTransport: true, fileError: '' },
  argTypes: {
    accept: textControl, maxSize: { ...numberControl, description: '每个文件最大字节数。' }, maxFiles: rangeControl(1, 10), disabled: booleanControl, label: textControl,
    status: choiceControl(['queued', 'uploading', 'success', 'error', 'canceled']), progress: rangeControl(0, 100), withFile: booleanControl, simulateTransport: booleanControl, fileError: textControl,
  },
  parameters: { controls: { include: ['accept', 'maxSize', 'maxFiles', 'disabled', 'label', 'status', 'progress', 'withFile', 'simulateTransport', 'fileError'] } },
  render: args => <FileUpload accept={args.accept} maxSize={args.maxSize} maxFiles={args.maxFiles} disabled={args.disabled} label={args.label}
    value={args.withFile ? queued(args.status, args.progress, args.fileError || undefined) : []} onValueChange={() => undefined} transport={args.simulateTransport ? simulatedTransport : undefined} />,
};
