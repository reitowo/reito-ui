import type { ComponentProps } from 'react';
import { textControl, booleanControl, rangeControl, numberControl } from '../feature-controls.js';
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { FileUpload, type QueuedFile } from '../../../../packages/ui/src/complex/index.js';
import { FileUploadDemo } from '../../../../packages/ui/src/complex/catalog.js';
const meta = { title: '复杂/FileUpload 本地文件队列', component: FileUploadDemo, parameters: { docs: { description: { component: '本地文件队列，不读取文件内容，不上传。支持 accept、单文件大小、数量、重复校验；调用方可用 value/onValueChange 接管队列。' } } } } satisfies Meta<typeof FileUploadDemo>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Interactive: Story = { name: '交互场景：添加、拖放与移除' };
export const Validation: Story = {
  name: '类型、大小、重复与数量校验',
  render: () => <FileUpload accept=".txt" maxSize={1024} maxFiles={2} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement); const input = canvas.getByLabelText('添加文件', { selector: 'input' });
    const user = userEvent.setup({ applyAccept: false });
    const file = new File(['本地示例'], 'notes.txt', { type: 'text/plain', lastModified: 1 });
    await user.upload(input, file);
    expect(canvas.getByRole('status')).toHaveTextContent('已选择 1 个文件');
    await user.upload(input, file);
    expect(canvas.getByRole('alert')).toHaveTextContent('已在队列中');
    await user.upload(input, [new File(['x'], 'image.png', { type: 'image/png' }), new File(['x'.repeat(1025)], 'large.txt', { type: 'text/plain' })]);
    expect(canvas.getByRole('alert')).toHaveTextContent('文件类型不支持');
    expect(canvas.getByRole('alert')).toHaveTextContent('超过 1.0 KB 上限');
    await user.upload(input, [new File(['a'], 'second.txt', { type: 'text/plain' }), new File(['b'], 'third.txt', { type: 'text/plain' })]);
    expect(canvas.getByRole('status')).toHaveTextContent('已选择 2 个文件');
    expect(canvas.getByRole('alert')).toHaveTextContent('最多添加 2 个文件');
    await user.click(canvas.getByRole('button', { name: '移除 notes.txt' }));
    expect(canvas.queryByText('notes.txt', { exact: true })).not.toBeInTheDocument();
    expect(canvas.getByRole('status')).toHaveTextContent('已选择 1 个文件');
  },
};
export const Disabled: Story = { name: '禁用', render: () => <FileUpload disabled /> };

export const Default: Story = { name: '默认空文件队列', render: () => <FileUpload accept=".txt,.md,.json" /> };
export const WithFile: Story = { name: '已选择文件', render: function SelectedFile() { const [files, setFiles] = useState<QueuedFile[]>([{ id: 'notes', file: new File(['本地文件示例'], 'notes.md', { type: 'text/markdown' }) }]); return <FileUpload value={files} onValueChange={setFiles} />; } };

type PlaygroundArgs = Pick<ComponentProps<typeof FileUpload>, 'accept' | 'maxSize' | 'maxFiles' | 'disabled' | 'label'>;
export const Playground: StoryObj<PlaygroundArgs> = {
 name: '参数调试', args: { accept: '.txt,.md,.json', maxSize: 10485760, maxFiles: 5, disabled: false, label: '添加文件' },
 argTypes: { accept: textControl, maxSize: { ...numberControl, description: '每个文件最大字节数。' }, maxFiles: rangeControl(1, 10), disabled: booleanControl, label: textControl },
 parameters: { controls: { include: ['accept', 'maxSize', 'maxFiles', 'disabled', 'label'] } }, render: args => <FileUpload {...args} />,
};
