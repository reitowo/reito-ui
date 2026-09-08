import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';
import { Button } from '../../../../packages/ui/src/primitives/button.js';
import { VirtualConversation } from '../../../../packages/ui/src/ai/virtual-conversation.js';
import { StructuredMessage } from '../../../../packages/ui/src/ai/message-parts.js';
import { Message } from '../../../../packages/ui/src/ai/conversation.js';

const meta = { title: 'AI/VirtualConversation', component: VirtualConversation } satisfies Meta<typeof VirtualConversation>;
export default meta;
export const Playground: StoryObj<{ follow: boolean; overscan: number; failHistory: boolean }> = {
  args: { follow: true, overscan: 4, failHistory: false },
  argTypes: { follow: { control: 'boolean' }, overscan: { control: { type: 'number', min: 0 } }, failHistory: { control: 'boolean' } },
  parameters: { controls: { include: ['follow','overscan','failHistory'] } },
  render: function Demo(args) {
    const [items, setItems] = useState(() => Array.from({length:1000}, (_,index) => ({id:index,text:`本地消息 ${index}：${'检查工作区。'.repeat(index % 4 + 1)}`})));
    return <><VirtualConversation items={items} getKey={item => item.id} renderMessage={item => <Message from="assistant" local>{item.text}</Message>} follow={args.follow} overscan={args.overscan} hasEarlier onLoadEarlier={() => { if(args.failHistory) throw new Error('本地历史加载失败'); setItems(current => [...Array.from({length:20},(_,index)=>({id:current[0].id-20+index,text:`更早消息 ${current[0].id-20+index}`})),...current]); }} />
      <Button type="button" onClick={() => setItems(current => [...current,{id:current.at(-1)!.id+1,text:'追加的本地消息'}])}>追加消息</Button>
      <Button type="button" onClick={() => setItems(current => current.map((item,index)=>index===current.length-1?{...item,text:item.text+'继续输出。'.repeat(20)}:item))}>增长末条消息</Button>
    </>;
  },
};

export const StreamingParts: StoryObj = {
  render: function StreamingPartsDemo() {
    const [text,setText]=useState('本地流式示例。');
    const [streaming,setStreaming]=useState(false);
    useEffect(()=>{
      if(!streaming) return;
      let steps=0;
      const timer=setInterval(()=>{setText(current=>current+'追加一段实际的本地文本。');if(++steps===20)setStreaming(false);},100);
      return ()=>clearInterval(timer);
    },[streaming]);
    const items=Array.from({length:500},(_,id)=>({id,text:id===499?text:`历史消息 ${id}`}));
    return <><VirtualConversation items={items} getKey={item=>item.id} renderMessage={item=><StructuredMessage from="assistant" parts={[{id:`text-${item.id}`,type:'text',text:item.text,status:streaming&&item.id===499?'streaming':'complete'}]} />} />
      <Button type="button" disabled={streaming} onClick={()=>setStreaming(true)}>开始本地流式追加</Button>
    </>;
  },
};

export const Empty: StoryObj = {
  render: () => <VirtualConversation items={[]} getKey={(item: {id: number}) => item.id} renderMessage={() => null} />,
};

export const LoadingHistory: StoryObj = {
  render: () => <VirtualConversation items={[{id: 1, text: '加载历史时保留当前消息。'}]} getKey={item => item.id} renderMessage={item => <Message from="assistant" local>{item.text}</Message>} hasEarlier loadingEarlier />,
};

export const HistoryFailure: typeof Playground = {
  ...Playground,
  args: { follow: true, overscan: 4, failHistory: true },
};

export const FollowDisabled: typeof Playground = {
  ...Playground,
  args: { follow: false, overscan: 4, failHistory: false },
};
