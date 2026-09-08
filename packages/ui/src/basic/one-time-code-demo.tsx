import { useRef, useState } from 'react';
import { Button } from '../primitives/button.js';
import { Checkbox } from '../primitives/checkbox.js';
import { OneTimeCode } from './one-time-code.js';

export function OneTimeCodeDemo() {
  const [locked, setLocked] = useState(false);
  const [code, setCode] = useState('123456');
  const [seconds, setSeconds] = useState(24);
  const [failure, setFailure] = useState(false);
  const [delayed, setDelayed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [empty, setEmpty] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [copies, setCopies] = useState(0);
  const [pending, setPending] = useState(false);
  const finish = useRef<(() => void) | null>(null);
  return <div className="grid max-w-lg gap-[var(--rui-content-gap)] text-sm">
    <p className="text-xs text-muted-foreground">公开示例码。复制回调只更新本地状态，不写剪贴板、不连接认证服务。</p>
    <OneTimeCode label="JumpServer 验证码" code={empty ? undefined : code} remainingSeconds={seconds} locked={locked} loading={loading} disabled={disabled} onCopy={async () => {
      setCopies(value => value + 1);
      if (delayed) { setPending(true); await new Promise<void>(resolve => { finish.current = resolve; }); setPending(false); }
      if (failure) throw new Error('local demo');
    }} />
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={() => setLocked(value => !value)}>{locked ? '解锁示例码' : '锁定示例码'}</Button>
      <Button variant="outline" size="sm" onClick={() => { setCode(value => value === '123456' ? '654321' : '123456'); setSeconds(24); }}>轮换示例码</Button>
      <Button variant="outline" size="sm" onClick={() => setSeconds(0)}>使示例码过期</Button>
      {pending && <Button variant="outline" size="sm" onClick={() => { finish.current?.(); finish.current = null; }}>完成复制回调</Button>}
    </div>
    <label className="flex items-center gap-2"><Checkbox checked={failure} onCheckedChange={setFailure} />模拟复制失败</label>
    <label className="flex items-center gap-2"><Checkbox checked={delayed} onCheckedChange={setDelayed} />延迟完成复制</label>
    <label className="flex items-center gap-2"><Checkbox checked={loading} onCheckedChange={setLoading} />正在刷新</label>
    <label className="flex items-center gap-2"><Checkbox checked={empty} onCheckedChange={setEmpty} />空验证码</label>
    <label className="flex items-center gap-2"><Checkbox checked={disabled} onCheckedChange={setDisabled} />禁用复制</label>
    <output>已请求复制 {copies} 次</output>
  </div>;
}
