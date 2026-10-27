import { useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Folder, Mail, ThumbsDown } from 'lucide-react';
import { Button } from '../../primitives/button.js';
import { cn } from '../../lib/utils.js';
import { Text } from '../../basic/composition.js';
import { IllustrationFrame, Mark } from './frame.js';

export type AgentTool = 'linkedin' | 'hubspot' | 'slack' | 'gmail' | 'salesforce';
export type AgentTeamMember = { role: string; tools?: AgentTool[] };
export type AgentTeamProps = { prompt?: string; members?: AgentTeamMember[]; className?: string };
export function AgentTeam({
  prompt = '为下周发布整理一份简报',
  members = [
    { role: '检索', tools: ['gmail'] },
    { role: '撰写', tools: ['slack'] },
    { role: '核对', tools: ['linkedin'] },
  ],
  className,
}: AgentTeamProps) {
  return (
    <IllustrationFrame label="代理团队" className={className}>
      <div className="flex h-full flex-col justify-between p-[var(--rui-content-padding)]">
        <p className="rounded-[var(--rui-radius)] border border-border bg-card px-[var(--rui-compact-surface-padding-x)] py-[var(--rui-cell-padding-y)] font-mono text-[length:var(--rui-font-caption)]">
          {prompt}
        </p>
        <div className="flex flex-wrap justify-center gap-[var(--rui-content-gap)]">
          {members.slice(0, 3).map((member) => (
            <div key={member.role} className="grid justify-items-center gap-1">
              <Mark name={member.role} />
              <Text as="span" variant="caption">
                {member.role}
              </Text>
            </div>
          ))}
        </div>
      </div>
    </IllustrationFrame>
  );
}

export type CoverFlowItem = { id: string | number; title?: string; src?: string; color?: string };
export type CoverFlowProps = { items: CoverFlowItem[]; className?: string };
export function CoverFlow({ items, className }: CoverFlowProps) {
  const [index, setIndex] = useState(0);
  const current = items[index];
  return (
    <IllustrationFrame label="封面流" className={className}>
      <div className="flex h-full items-center justify-center gap-[var(--rui-content-gap)] p-[var(--rui-content-padding)]">
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          aria-label="上一张"
          onClick={() => setIndex((value) => (value - 1 + items.length) % items.length)}
        >
          <ChevronLeft />
        </Button>
        <div className="grid w-1/2 place-items-center rounded-[var(--rui-radius)] border border-border bg-card p-[var(--rui-content-padding)]">
          {current?.src ? (
            <img src={current.src} alt="" className="max-h-32 object-cover" />
          ) : (
            <Mark name={current?.title ?? String(current?.id ?? '')} />
          )}
          <Text as="span" variant="caption">
            {current?.title ?? current?.id}
          </Text>
        </div>
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          aria-label="下一张"
          onClick={() => setIndex((value) => (value + 1) % items.length)}
        >
          <ChevronRight />
        </Button>
      </div>
    </IllustrationFrame>
  );
}

export type EmptyCalendarProps = { className?: string };
export function EmptyCalendar({ className }: EmptyCalendarProps) {
  return (
    <IllustrationFrame label="空日历" className={cn('group', className)}>
      <div className="flex h-full items-end justify-center p-[var(--rui-content-padding)]">
        {[0, 1, 2].map((layer) => (
          <div
            key={layer}
            className={cn(
              'absolute rounded-[var(--rui-radius)] border border-border bg-card p-[var(--rui-content-padding)] transition-transform motion-reduce:transition-none group-hover:-translate-y-1',
              layer === 1 && 'translate-x-2 -translate-y-2',
              layer === 2 && 'translate-x-4 -translate-y-4',
            )}
          >
            <div className="mb-2 grid grid-cols-7 gap-1">
              {Array.from({ length: 14 }, (_, day) => (
                <span key={day} className="size-3 rounded-sm bg-muted" />
              ))}
            </div>
            <Text as="span" variant="caption" tone="muted">
              空闲
            </Text>
          </div>
        ))}
      </div>
    </IllustrationFrame>
  );
}

export type EnrichmentOrbitProps = { className?: string };
export function EnrichmentOrbit({ className }: EnrichmentOrbitProps) {
  return (
    <IllustrationFrame label="富集轨道" className={className}>
      <div className="grid h-full place-items-center">
        <div className="relative grid size-32 place-items-center rounded-full border border-dashed border-border">
          <div className="absolute size-44 rounded-full border border-border/60" />
          <Mark name="中" />
          {['A', 'B', 'C', 'D'].map((node, index) => (
            <div
              key={node}
              className="absolute inset-0"
              style={{ transform: `rotate(${index * 90}deg)` }}
            >
              <Mark
                name={node}
                className="absolute top-0 left-1/2 size-6 -translate-x-1/2 -translate-y-1/2"
              />
            </div>
          ))}
        </div>
      </div>
    </IllustrationFrame>
  );
}

export type FrostCloudProps = { background?: boolean; className?: string };
export function FrostCloud({ background = true, className }: FrostCloudProps) {
  return (
    <IllustrationFrame
      label="霜云"
      className={cn(!background && 'bg-transparent border-dashed', className)}
    >
      <button type="button" className="grid h-full w-full place-items-center" aria-label="霜云">
        <span className="rounded-[var(--rui-radius-surface)] bg-card/80 px-8 py-6 text-3xl shadow-sm">
          cloud
        </span>
      </button>
    </IllustrationFrame>
  );
}

export type GlowCloudProps = { background?: boolean; className?: string };
export function GlowCloud({ background = true, className }: GlowCloudProps) {
  return (
    <IllustrationFrame label="光云" className={cn(!background && 'bg-transparent', className)}>
      <button type="button" className="grid h-full w-full place-items-center" aria-label="光云">
        <span className="rounded-[var(--rui-radius-surface)] bg-accent-soft px-8 py-6 text-3xl text-accent">
          glow
        </span>
      </button>
    </IllustrationFrame>
  );
}

export type GhostedChatProps = { className?: string };
export function GhostedChat({ className }: GhostedChatProps) {
  return (
    <IllustrationFrame label="已读未回" className={cn('group', className)}>
      <div className="grid h-full content-end gap-2 p-[var(--rui-content-padding)]">
        <div className="justify-self-start rounded-[var(--rui-radius)] bg-card px-3 py-2 text-[length:var(--rui-font-caption)]">
          你好，方便看一下吗？
        </div>
        <div className="justify-self-end rounded-[var(--rui-radius)] bg-primary px-3 py-2 text-[length:var(--rui-font-caption)] text-primary-foreground">
          已读
        </div>
        <ThumbsDown className="size-4 justify-self-end text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 motion-reduce:opacity-100" />
      </div>
    </IllustrationFrame>
  );
}

export type BeamTool = { name: string; icon?: ReactNode };
export type BeamCenter = { name: string };
export type IntegrationBeamProps = {
  left?: BeamTool[];
  right?: BeamTool[];
  center?: BeamCenter;
  className?: string;
};
export function IntegrationBeam({
  left = [{ name: '邮件' }, { name: '日历' }],
  right = [{ name: '文档' }],
  center = { name: '产品' },
  className,
}: IntegrationBeamProps) {
  const [paused, setPaused] = useState<string | null>(null);
  return (
    <IllustrationFrame label="集成光束" className={className}>
      <div className="flex h-full items-center justify-between p-[var(--rui-content-padding)]">
        <div className="grid gap-2">
          {left.map((tool) => (
            <Button
              key={tool.name}
              type="button"
              size="sm"
              variant="outline"
              aria-pressed={paused === tool.name}
              onClick={() => setPaused((value) => (value === tool.name ? null : tool.name))}
            >
              {tool.icon ?? <Mail className="size-3.5" />}
              {tool.name}
            </Button>
          ))}
        </div>
        <Mark name={center.name} className="size-12" />
        <div className="grid gap-2">
          {right.map((tool) => (
            <Button
              key={tool.name}
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setPaused((value) => (value === tool.name ? null : tool.name))}
            >
              {tool.name}
            </Button>
          ))}
        </div>
      </div>
    </IllustrationFrame>
  );
}

export type IntegrationGridLogo = { name: string; icon?: ReactNode };
export type IntegrationGridProps = {
  logos?: IntegrationGridLogo[];
  product?: string;
  className?: string;
};
export function IntegrationGrid({
  logos = ['邮件', '日历', '文档', '表格', '聊天', '看板'].map((name) => ({ name })),
  product = '产品',
  className,
}: IntegrationGridProps) {
  return (
    <IllustrationFrame label="集成蜂窝" className={className}>
      <div className="grid h-full grid-cols-3 place-items-center p-[var(--rui-content-padding)]">
        {logos
          .slice(0, 8)
          .map((logo, index) =>
            index === 4 ? (
              <Mark
                key="center"
                name={product}
                className="size-12 bg-primary text-primary-foreground"
              />
            ) : (
              <Mark key={logo.name} name={logo.name} />
            ),
          )}
      </div>
    </IllustrationFrame>
  );
}

export type LayerIcon = 'bolt' | 'database' | 'plug' | 'spark' | 'pulse';
export type LayerStackItem = { title: string; icon?: LayerIcon };
export type LayerStackProps = { items?: LayerStackItem[]; className?: string };
export function LayerStack({
  items = [
    { title: '界面' },
    { title: '工作流' },
    { title: '模型' },
    { title: '数据' },
    { title: '基础设施' },
  ],
  className,
}: LayerStackProps) {
  const [active, setActive] = useState(0);
  return (
    <IllustrationFrame label="层叠" className={className}>
      <div className="flex h-full gap-[var(--rui-content-gap)] p-[var(--rui-content-padding)]">
        <ol className="grid content-center gap-1">
          {items.slice(0, 5).map((item, index) => (
            <li key={item.title}>
              <Button
                type="button"
                size="sm"
                variant={index === active ? 'secondary' : 'ghost'}
                onClick={() => setActive(index)}
              >
                {item.title}
              </Button>
            </li>
          ))}
        </ol>
        <div className="relative flex-1">
          {items.slice(0, 5).map((item, index) => (
            <div
              key={item.title}
              className={cn(
                'absolute inset-x-4 rounded-[var(--rui-radius)] border border-border bg-card p-3 transition-transform motion-reduce:transition-none',
                index === active && 'border-accent',
              )}
              style={{ top: `calc(${index} * var(--rui-space-4))` }}
            >
              {item.title}
            </div>
          ))}
        </div>
      </div>
    </IllustrationFrame>
  );
}

export type LeadSourcingProps = { className?: string };
export function LeadSourcing({ className }: LeadSourcingProps) {
  return (
    <IllustrationFrame label="线索来源" className={className}>
      <div className="flex h-full items-center justify-center gap-[var(--rui-content-gap)]">
        <Mark name="邮" />
        <span className="h-px w-12 bg-border" />
        <Mark name="AI" className="bg-accent-soft text-accent" />
        <span className="h-px w-12 bg-border" />
        <Mark name="助" />
      </div>
    </IllustrationFrame>
  );
}

export type ClusterLogo = { color?: string; d?: string; name?: string };
export type LogoClusterProps = { logos?: ClusterLogo[]; className?: string };
export function LogoCluster({
  logos = [{ name: 'A' }, { name: 'B' }, { name: 'C' }, { name: 'D' }],
  className,
}: LogoClusterProps) {
  return (
    <IllustrationFrame label="标志簇" className={className}>
      <div className="grid h-full place-items-center">
        <div className="relative size-32">
          <Mark
            name="中"
            className="absolute top-1/2 left-1/2 size-10 -translate-x-1/2 -translate-y-1/2 bg-card"
          />
          {logos.slice(0, 6).map((logo, index) => (
            <Mark
              key={logo.name ?? index}
              name={logo.name ?? String(index + 1)}
              className="absolute"
              style={{
                top: `${50 + Math.sin((index / 6) * Math.PI * 2) * 38}%`,
                left: `${50 + Math.cos((index / 6) * Math.PI * 2) * 38}%`,
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
        </div>
      </div>
    </IllustrationFrame>
  );
}

export type WheelModel = { name: string; viewBox?: string; color?: string; d?: string };
export type ModelWheelProps = { models?: WheelModel[]; className?: string };
export function ModelWheel({
  models = ['Auto', 'Sonnet', 'Opus', 'Haiku', 'Flash', 'Mini', 'Pro'].map((name) => ({ name })),
  className,
}: ModelWheelProps) {
  const [index, setIndex] = useState(0);
  return (
    <IllustrationFrame label="模型轮" className={className}>
      <div className="grid h-full place-items-center p-[var(--rui-content-padding)]">
        <div className="grid w-40 gap-1 overflow-hidden rounded-[var(--rui-radius)] border border-border bg-card p-2">
          {models.map((model, modelIndex) => (
            <button
              key={model.name}
              type="button"
              onClick={() => setIndex(modelIndex)}
              className={cn(
                'rounded-[var(--rui-radius)] px-2 py-1 text-[length:var(--rui-font-caption)]',
                modelIndex === index ? 'bg-muted' : 'text-muted-foreground',
              )}
            >
              {model.name}
            </button>
          ))}
        </div>
      </div>
    </IllustrationFrame>
  );
}

export type Region = 'dach' | 'us' | 'cn' | 'in' | 'br' | 'jp';
export type RegionDachProps = {
  region?: Region;
  defaultRegion?: Region;
  onRegionChange?: (region: Region) => void;
  className?: string;
};
const regions: Region[] = ['dach', 'us', 'cn', 'in', 'br', 'jp'];
const regionLabel: Record<Region, string> = {
  dach: 'DACH',
  us: '美国',
  cn: '中国',
  in: '印度',
  br: '巴西',
  jp: '日本',
};
export function RegionDach({
  region,
  defaultRegion = 'dach',
  onRegionChange,
  className,
}: RegionDachProps) {
  const [internal, setInternal] = useState(defaultRegion);
  const current = region ?? internal;
  return (
    <IllustrationFrame label="区域地图" className={className}>
      <div className="grid h-full content-between p-[var(--rui-content-padding)]">
        <svg viewBox="0 0 160 90" className="h-28 w-full text-muted-foreground" aria-hidden="true">
          <rect
            x="5%"
            y="13%"
            width="90%"
            height="73%"
            rx="8"
            className="fill-current opacity-20"
          />
          <circle
            cx={
              current === 'us'
                ? 40
                : current === 'cn' || current === 'jp'
                  ? 120
                  : current === 'in'
                    ? 110
                    : 80
            }
            cy="45"
            r="16"
            className="fill-accent opacity-70"
          />
        </svg>
        <div className="flex flex-wrap gap-1">
          {regions.map((item) => (
            <Button
              key={item}
              type="button"
              size="xs"
              variant={item === current ? 'secondary' : 'ghost'}
              onClick={() => {
                if (region === undefined) setInternal(item);
                onRegionChange?.(item);
              }}
            >
              {regionLabel[item]}
            </Button>
          ))}
        </div>
      </div>
    </IllustrationFrame>
  );
}

export type SideFolderProps = { className?: string };
export function SideFolder({ className }: SideFolderProps) {
  return (
    <IllustrationFrame label="侧向文件夹" className={cn('group', className)}>
      <div className="flex h-full items-center justify-center gap-2 p-[var(--rui-content-padding)]">
        <Folder className="size-16 text-accent transition-transform motion-reduce:transition-none group-hover:-rotate-6" />
        <div className="grid gap-1 opacity-0 transition-opacity group-hover:opacity-100 motion-reduce:opacity-100">
          <span className="h-8 w-12 rounded-[var(--rui-radius)] bg-card" />
          <span className="h-8 w-12 rounded-[var(--rui-radius)] bg-card" />
        </div>
      </div>
    </IllustrationFrame>
  );
}

export type TabOverloadProps = { className?: string };
export function TabOverload({ className }: TabOverloadProps) {
  const [active, setActive] = useState(1);
  return (
    <IllustrationFrame label="标签过载" className={className}>
      <div className="flex h-full items-end justify-center p-[var(--rui-content-padding)]">
        {[0, 1, 2, 3].map((index) => (
          <button
            key={index}
            type="button"
            onMouseEnter={() => setActive(index)}
            className={cn(
              'h-24 w-20 -ml-6 rounded-[var(--rui-radius)] border border-border bg-card p-2 text-left text-[length:var(--rui-font-caption)] first:ml-0',
              index === active && 'relative border-accent',
            )}
          >
            标签 {index + 1}
          </button>
        ))}
      </div>
    </IllustrationFrame>
  );
}

export type TeamInviteAvatar = { src: string; name?: string };
export type TeamInviteProps = {
  avatars: [TeamInviteAvatar, TeamInviteAvatar, TeamInviteAvatar];
  className?: string;
};
export function TeamInvite({ avatars, className }: TeamInviteProps) {
  const [joined, setJoined] = useState(false);
  return (
    <IllustrationFrame label="邀请队友" className={className}>
      <div className="flex h-full items-center justify-center gap-6 p-[var(--rui-content-padding)]">
        {avatars.slice(0, 2).map((avatar) => (
          <img
            key={avatar.src}
            src={avatar.src}
            alt={avatar.name ?? ''}
            className="size-12 rounded-full border border-border object-cover"
          />
        ))}
        <button
          type="button"
          onClick={() => setJoined(true)}
          className={cn(
            'size-12 rounded-full border border-dashed border-border text-[length:var(--rui-font-caption)] text-muted-foreground',
            joined && 'border-solid',
          )}
          aria-label={joined ? '已加入' : '邀请加入'}
        >
          {joined ? (
            <img
              src={avatars[2].src}
              alt={avatars[2].name ?? ''}
              className="size-full rounded-full object-cover"
            />
          ) : (
            '+'
          )}
        </button>
      </div>
    </IllustrationFrame>
  );
}
