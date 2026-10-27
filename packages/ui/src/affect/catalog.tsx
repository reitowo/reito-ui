import { useState, type ComponentType } from 'react';
import { Button } from './button.js';
import { ChangeSummary } from './change-summary.js';
import { CommentThread } from './comment-thread.js';
import { DecisionInbox } from './decision-inbox.js';
import { EmailDraft } from './email-draft.js';
import { FilterMenu } from './filter-menu.js';
import { MessageActions } from './message-actions.js';
import { NotificationStack } from './notification-stack.js';
import { OtpInput } from './otp-input.js';
import { ProfileMenu } from './profile-menu.js';
import { ProgressTracker } from './progress-tracker.js';
import { ReactionBar } from './reaction-bar.js';
import { SegmentedControl } from './segmented-control.js';
import { SmartRecommendation } from './smart-recommendation.js';
import { ThinkingLoader } from './thinking-loader.js';
import { TipsPanel } from './tips-panel.js';
import { ToolCallCard, ToolCallGroup } from './tool-call-card.js';
import { LogoMarquee } from './blocks/logo-marquee.js';
import { TestimonialWall } from './blocks/testimonial-wall.js';
import { GridBackground } from './motion/grid-background.js';
import { NumberTicker } from './motion/number-ticker.js';
import { ShimmerText, Skeleton } from './motion/shimmer-loader.js';
import { TextReveal } from './motion/text-reveal.js';
import {
  AgentTeam,
  CoverFlow,
  EmptyCalendar,
  EnrichmentOrbit,
  FrostCloud,
  GhostedChat,
  GlowCloud,
  IntegrationBeam,
  IntegrationGrid,
  LayerStack,
  LeadSourcing,
  LogoCluster,
  ModelWheel,
  RegionDach,
  SideFolder,
  TabOverload,
  TeamInvite,
} from './illustrations/index.js';
import { ThinkingState } from './pro/thinking-state.js';
import { ChatComposer } from './pro/chat-composer.js';
import { AgentPlan } from './pro/agent-plan.js';
import { ApprovalCard } from './pro/approval-card.js';
import { CommandMenu } from './pro/command-menu.js';
import { ModelPicker } from './pro/model-picker.js';
import { ReviewCenter } from './pro/review-center.js';
import { AgentInbox } from './pro/agent-inbox.js';
import { AffectDemoFrame } from './shared.js';
import { Inline, Stack, Text } from '../basic/composition.js';

export function ButtonDemo() {
  const [loading, setLoading] = useState(false);
  return (
    <AffectDemoFrame>
      <Inline>
        <Button
          onClick={() => {
            setLoading(true);
            window.setTimeout(() => setLoading(false), 800);
          }}
          loading={loading}
        >
          保存
        </Button>
        <Button variant="secondary">次要</Button>
        <Button variant="ghost">轻量</Button>
        <Button variant="destructive">删除</Button>
        <Button appearance="clean" variant="secondary">
          干净
        </Button>
      </Inline>
    </AffectDemoFrame>
  );
}

export function ChangeSummaryDemo() {
  return (
    <ChangeSummary
      title="本周变化"
      period="本地示例"
      changes={[
        { label: '通过率', change: '升至 96%', tone: 'good' },
        { label: '等待审查', change: '增加 3 项', tone: 'bad' },
        { label: '模型延迟', change: '持平', tone: 'neutral' },
      ]}
    />
  );
}

export function CommentThreadDemo() {
  return (
    <CommentThread
      currentUser={{ name: '你' }}
      assistant={{ name: '本地助手', assistant: true }}
      messages={[
        {
          id: '1',
          author: { name: '本地助手', assistant: true },
          createdAt: Date.now() - 120000,
          text: '已检查共享令牌，没有连接外部模型。',
          status: '查看步骤',
          details: ['读取 design-language.md', '对照密度与圆角'],
        },
      ]}
      onReply={(text) => ({
        id: `a-${text.length}`,
        author: { name: '本地助手', assistant: true },
        createdAt: Date.now(),
        text: '这是本地回复示例。',
      })}
    />
  );
}

export function DecisionInboxDemo() {
  return (
    <DecisionInbox
      decisions={[
        {
          id: 'merge',
          title: '合并示例分支',
          detail: '只更新本地状态',
          primary: '合并',
          secondary: '稍后',
        },
        { id: 'deploy', title: '发布预览', primary: '发布', secondary: '取消', collapsed: true },
      ]}
    />
  );
}

export function EmailDraftDemo() {
  return <EmailDraft />;
}

export function FilterMenuDemo() {
  return (
    <FilterMenu
      groups={[
        {
          id: 'risk',
          label: '风险',
          options: [
            { id: 'high', label: '高' },
            { id: 'low', label: '低' },
          ],
        },
        {
          id: 'type',
          label: '类型',
          chipPrefix: '类型：',
          options: [
            { id: 'code', label: '代码' },
            { id: 'docs', label: '文档' },
          ],
        },
      ]}
      defaultValue={{ risk: ['high'] }}
    />
  );
}

export function MessageActionsDemo() {
  return (
    <AffectDemoFrame>
      <Text>把共享令牌应用到消息和工作区控件。</Text>
      <MessageActions text="把共享令牌应用到消息和工作区控件。" versions={3} />
    </AffectDemoFrame>
  );
}

export function NotificationStackDemo() {
  return (
    <NotificationStack
      notices={[
        {
          id: '1',
          badge: '通知',
          title: '审查已就绪',
          text: '本地示例，没有外部推送。',
          action: { label: '打开' },
        },
        { id: '2', title: '用量接近上限', text: '这是下一张卡片。' },
      ]}
    />
  );
}

export function OtpInputDemo() {
  const [status, setStatus] = useState<'idle' | 'verifying' | 'error' | 'success'>('idle');
  return (
    <OtpInput
      status={status}
      errorMessage="验证码不正确"
      onComplete={() => {
        setStatus('verifying');
        window.setTimeout(() => setStatus('success'), 600);
      }}
      onResend={() => setStatus('idle')}
      resendIn={12}
    />
  );
}

export function ProfileMenuDemo() {
  return (
    <ProfileMenu
      name="示例用户"
      email="you@example.com"
      setup={{ done: 2, total: 5, next: '添加头像', onContinue: () => undefined }}
    />
  );
}

export function ProgressTrackerDemo() {
  return (
    <ProgressTracker
      steps={[
        { id: 'theme', label: '选择主题', done: true },
        { id: 'density', label: '检查密度' },
        { id: 'story', label: '打开 Storybook' },
      ]}
    />
  );
}

export function ReactionBarDemo() {
  return <ReactionBar reactions={{ like: { count: 12 }, comment: { count: 3 } }} />;
}

export function SegmentedControlDemo() {
  const [value, setValue] = useState('all');
  return (
    <SegmentedControl
      aria-label="范围"
      value={value}
      onChange={setValue}
      options={[
        { value: 'all', label: '全部', count: 12 },
        { value: 'open', label: '待处理', badge: '新' },
        { value: 'done', label: '完成' },
      ]}
    />
  );
}

export function SmartRecommendationDemo() {
  return (
    <SmartRecommendation
      options={[
        { id: 'compact', label: '紧凑密度', reason: '当前预览更适合桌面工作面。', signal: 3 },
        { id: 'comfortable', label: '舒适密度', reason: '阅读长文时更宽松。', signal: 2 },
      ]}
    />
  );
}

export function ThinkingLoaderDemo() {
  const [done, setDone] = useState(false);
  return (
    <AffectDemoFrame>
      <ThinkingLoader done={done} />
      <Button size="sm" variant="secondary" onClick={() => setDone((value) => !value)}>
        {done ? '重新开始' : '标记完成'}
      </Button>
    </AffectDemoFrame>
  );
}

export function TipsPanelDemo() {
  return (
    <TipsPanel
      tips={[
        {
          id: 'theme',
          title: '切换主题',
          description: 'Lab 顶栏可检查深浅色。',
          action: '打开主题',
          primary: true,
        },
        {
          id: 'density',
          title: '检查密度',
          description: '紧凑是默认值。',
          action: '知道了',
          doneLabel: '已了解',
        },
      ]}
    />
  );
}

export function ToolCallCardDemo() {
  const [status, setStatus] = useState<'running' | 'success' | 'error'>('error');
  return (
    <ToolCallGroup>
      <ToolCallCard
        name="read_file"
        summary="读取设计规范"
        status="success"
        duration={240}
        args={{ path: 'docs/design-language.md' }}
        result={{ ok: true }}
      />
      <ToolCallCard
        name="check_preview"
        summary="检查预览"
        status={status}
        error="本地错误示例"
        onRetry={() => {
          setStatus('running');
          window.setTimeout(() => setStatus('success'), 700);
        }}
      />
    </ToolCallGroup>
  );
}

export function LogoMarqueeDemo() {
  return (
    <LogoMarquee
      logos={['Reito', 'Graphite', 'Base UI', 'Storybook', 'Vite'].map((name) => ({ name }))}
      labels="beside"
    />
  );
}

export function TestimonialWallDemo() {
  return (
    <TestimonialWall
      items={[
        {
          name: '阿宁',
          role: '设计',
          company: '本地工作室',
          quote: '密度和主题是同一套令牌。',
          rating: 5,
          verified: true,
        },
        { name: '林可', role: '工程', quote: '组件不必再复制一份 CSS。', rating: 4 },
        { name: '苏衡', role: '研究', quote: '插画只保留交互意图。', rating: 5 },
        { name: '周晚', quote: '审查队列终于能放进工作面。' },
      ]}
    />
  );
}

export function GridBackgroundDemo() {
  return (
    <GridBackground className="grid min-h-40 place-items-center">
      <Text>网格在内容后面缓慢移动。</Text>
    </GridBackground>
  );
}

export function NumberTickerDemo() {
  const [value, setValue] = useState(1280);
  return (
    <AffectDemoFrame>
      <NumberTicker value={value} format={{ notation: 'compact' }} />
      <Button size="sm" variant="secondary" onClick={() => setValue((current) => current + 240)}>
        增加示例值
      </Button>
    </AffectDemoFrame>
  );
}

export function ShimmerLoaderDemo() {
  return (
    <AffectDemoFrame>
      <Skeleton width="100%" height="var(--rui-space-8)" />
      <ShimmerText>思考中…</ShimmerText>
    </AffectDemoFrame>
  );
}

export function TextRevealDemo() {
  return <TextReveal text="文字进入视口后逐词显现。" />;
}

const portraits = [
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect fill="%23999" width="64" height="64"/></svg>',
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect fill="%23777" width="64" height="64"/></svg>',
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect fill="%23555" width="64" height="64"/></svg>',
] as const;

export function AgentTeamDemo() {
  return <AgentTeam />;
}
export function CoverFlowDemo() {
  return (
    <CoverFlow
      items={[
        { id: 1, title: '封面 A' },
        { id: 2, title: '封面 B' },
        { id: 3, title: '封面 C' },
      ]}
    />
  );
}
export function EmptyCalendarDemo() {
  return <EmptyCalendar />;
}
export function EnrichmentOrbitDemo() {
  return <EnrichmentOrbit />;
}
export function FrostCloudDemo() {
  return <FrostCloud />;
}
export function GhostedChatDemo() {
  return <GhostedChat />;
}
export function GlowCloudDemo() {
  return <GlowCloud />;
}
export function IntegrationBeamDemo() {
  return <IntegrationBeam />;
}
export function IntegrationGridDemo() {
  return <IntegrationGrid />;
}
export function LayerStackDemo() {
  return <LayerStack />;
}
export function LeadSourcingDemo() {
  return <LeadSourcing />;
}
export function LogoClusterDemo() {
  return <LogoCluster />;
}
export function ModelWheelDemo() {
  return <ModelWheel />;
}
export function RegionDachDemo() {
  return <RegionDach />;
}
export function SideFolderDemo() {
  return <SideFolder />;
}
export function TabOverloadDemo() {
  return <TabOverload />;
}
export function TeamInviteDemo() {
  return (
    <TeamInvite avatars={[{ src: portraits[0] }, { src: portraits[1] }, { src: portraits[2] }]} />
  );
}

export function ThinkingStateDemo() {
  return (
    <ThinkingState
      steps={[
        {
          title: '检索规范',
          sources: [{ label: 'design-language.md' }, { label: 'tokens.json' }],
          moreSources: [{ label: 'composition.md' }],
        },
        { title: '整理差异' },
        { title: '起草说明' },
      ]}
    />
  );
}

export function ChatComposerDemo() {
  const [sent, setSent] = useState('');
  return (
    <AffectDemoFrame>
      <ChatComposer onSend={(message, details) => setSent(`${details.model}: ${message}`)} />
      <Text variant="caption" tone="muted">
        {sent || '本地输入，没有模型连接。'}
      </Text>
    </AffectDemoFrame>
  );
}

export function AgentPlanDemo() {
  return (
    <AgentPlan
      title="准备季度更新"
      estimate="约 2 分钟"
      defaultSteps={[
        { id: 'pull', title: '汇总指标', detail: '本地数字', tool: 'metrics.read' },
        { id: 'write', title: '起草备忘' },
      ]}
    />
  );
}

export function ApprovalCardDemo() {
  return (
    <ApprovalCard
      title="发送示例邮件"
      description="本地预览，不会真正发送"
      risk="medium"
      details={[
        { label: '主题', value: '十月更新' },
        { label: '发送时间', value: '今天 9:00' },
      ]}
      expiresIn={42}
    />
  );
}

export function CommandMenuDemo() {
  return <CommandMenu />;
}

export function ModelPickerDemo() {
  return (
    <ModelPicker
      models={[
        {
          id: 'opus',
          name: '示例 Opus',
          description: '难题',
          speed: 2,
          quality: 5,
          cost: 5,
          latencyMs: 800,
          pricePerM: 15,
        },
        { id: 'auto', name: '自动' },
      ]}
    />
  );
}

export function ReviewCenterDemo() {
  return (
    <ReviewCenter
      items={[
        {
          id: '1',
          title: '合并示例重试',
          agent: '本地助手',
          type: '代码',
          risk: 'high',
          confidence: 0.62,
          createdAt: Date.now() - 40000,
          reasoning: '超时后增加退避。',
          body: '+ retries',
        },
        {
          id: '2',
          title: '更新文案',
          agent: '本地助手',
          type: '文档',
          risk: 'low',
          confidence: 0.9,
          createdAt: Date.now() - 10000,
          body: '仅本地示例',
        },
      ]}
    />
  );
}

export function AgentInboxDemo() {
  return (
    <AgentInbox
      tasks={[
        {
          id: '1',
          title: '拆分用户表',
          description: '预演已通过，等待你确认。',
          agent: '示例助手',
          status: 'waiting',
          startedAt: Date.now() - 360000,
          steps: [{ label: '读取 schema' }, { label: '预演通过' }],
        },
        {
          id: '2',
          title: '整理联系人',
          description: '命中频率限制。',
          agent: '轻量助手',
          status: 'failed',
          steps: [{ label: '加载联系人' }],
        },
        {
          id: '3',
          title: '撰写说明',
          agent: '示例助手',
          status: 'running',
          startedAt: Date.now() - 80000,
        },
        { id: '4', title: '周报', agent: '轻量助手', status: 'done', elapsed: 252000 },
      ]}
    />
  );
}

export interface AffectCatalogEntry {
  id: string;
  name: string;
  description: string;
  component: ComponentType;
}

export const affectCatalog: AffectCatalogEntry[] = [
  {
    id: 'affect-button',
    name: 'Button 按钮适配',
    description: 'Affect API 覆盖 Reito Button，含加载与干净外观',
    component: ButtonDemo,
  },
  {
    id: 'change-summary',
    name: 'ChangeSummary 变化摘要',
    description: '一行一个指标与语义趋势',
    component: ChangeSummaryDemo,
  },
  {
    id: 'comment-thread',
    name: 'CommentThread 评论串',
    description: '评论、折叠详情与本地回复',
    component: CommentThreadDemo,
  },
  {
    id: 'decision-inbox',
    name: 'DecisionInbox 决策收件箱',
    description: '两项快速回答，完成后离开列表',
    component: DecisionInboxDemo,
  },
  {
    id: 'email-draft',
    name: 'EmailDraft 邮件草稿',
    description: '语气、收件人、附件与发送回执',
    component: EmailDraftDemo,
  },
  {
    id: 'filter-menu',
    name: 'FilterMenu 筛选菜单',
    description: '分组筛选与可移除芯片',
    component: FilterMenuDemo,
  },
  {
    id: 'affect-message-actions',
    name: 'MessageActions 消息操作条',
    description: '复制、重试、反馈、朗读与版本',
    component: MessageActionsDemo,
  },
  {
    id: 'notification-stack',
    name: 'NotificationStack 通知叠卡',
    description: '关闭前卡后露出下一张',
    component: NotificationStackDemo,
  },
  {
    id: 'otp-input',
    name: 'OtpInput 验证码输入',
    description: '复用 InputOTP，带状态与重发',
    component: OtpInputDemo,
  },
  {
    id: 'profile-menu',
    name: 'ProfileMenu 账户菜单',
    description: '用户、动作与资料进度',
    component: ProfileMenuDemo,
  },
  {
    id: 'progress-tracker',
    name: 'ProgressTracker 进度清单',
    description: '清单与进度条',
    component: ProgressTrackerDemo,
  },
  {
    id: 'reaction-bar',
    name: 'ReactionBar 反应条',
    description: '点赞等动作与翻滚计数',
    component: ReactionBarDemo,
  },
  {
    id: 'segmented-control',
    name: 'SegmentedControl 分段控件',
    description: '托盘或下划线分段',
    component: SegmentedControlDemo,
  },
  {
    id: 'smart-recommendation',
    name: 'SmartRecommendation 智能建议',
    description: '信号、备选、采用与撤销',
    component: SmartRecommendationDemo,
  },
  {
    id: 'thinking-loader',
    name: 'ThinkingLoader 思考加载',
    description: '阶段标签与完成态',
    component: ThinkingLoaderDemo,
  },
  {
    id: 'tips-panel',
    name: 'TipsPanel 提示面板',
    description: '短提示与完成状态',
    component: TipsPanelDemo,
  },
  {
    id: 'tool-call-card',
    name: 'ToolCallCard 工具调用卡',
    description: '参数、结果、重试与分组',
    component: ToolCallCardDemo,
  },
  {
    id: 'logo-marquee',
    name: 'LogoMarquee 标志滚动',
    description: '信任条循环，减少动效时静止',
    component: LogoMarqueeDemo,
  },
  {
    id: 'testimonial-wall',
    name: 'TestimonialWall 评价墙',
    description: '多列评价循环',
    component: TestimonialWallDemo,
  },
  {
    id: 'grid-background',
    name: 'GridBackground 网格背景',
    description: '内容后的细线网格',
    component: GridBackgroundDemo,
  },
  {
    id: 'number-ticker',
    name: 'NumberTicker 数字翻滚',
    description: '格式化数字滚入',
    component: NumberTickerDemo,
  },
  {
    id: 'shimmer-loader',
    name: 'ShimmerLoader 微光加载',
    description: '骨架与微光文字',
    component: ShimmerLoaderDemo,
  },
  {
    id: 'text-reveal',
    name: 'TextReveal 文字显现',
    description: '进入视口后逐词显现',
    component: TextRevealDemo,
  },
  {
    id: 'agent-team',
    name: 'AgentTeam 代理团队',
    description: '提示分出三个角色',
    component: AgentTeamDemo,
  },
  { id: 'cover-flow', name: 'CoverFlow 封面流', description: '封面浏览', component: CoverFlowDemo },
  {
    id: 'empty-calendar',
    name: 'EmptyCalendar 空日历',
    description: '空闲日历卡片',
    component: EmptyCalendarDemo,
  },
  {
    id: 'enrichment-orbit',
    name: 'EnrichmentOrbit 富集轨道',
    description: '中心节点与环绕标记',
    component: EnrichmentOrbitDemo,
  },
  {
    id: 'frost-cloud',
    name: 'FrostCloud 霜云',
    description: '可点击的霜云示意',
    component: FrostCloudDemo,
  },
  {
    id: 'ghosted-chat',
    name: 'GhostedChat 已读未回',
    description: '已读未回的对话示意',
    component: GhostedChatDemo,
  },
  { id: 'glow-cloud', name: 'GlowCloud 光云', description: '发光云示意', component: GlowCloudDemo },
  {
    id: 'integration-beam',
    name: 'IntegrationBeam 集成光束',
    description: '工具与产品之间的连接',
    component: IntegrationBeamDemo,
  },
  {
    id: 'integration-grid',
    name: 'IntegrationGrid 集成蜂窝',
    description: '中心产品与周围工具',
    component: IntegrationGridDemo,
  },
  {
    id: 'layer-stack',
    name: 'LayerStack 层叠',
    description: '选中层抬起',
    component: LayerStackDemo,
  },
  {
    id: 'lead-sourcing',
    name: 'LeadSourcing 线索来源',
    description: '来源与助手连接',
    component: LeadSourcingDemo,
  },
  {
    id: 'logo-cluster',
    name: 'LogoCluster 标志簇',
    description: '中心标志与周围标记',
    component: LogoClusterDemo,
  },
  {
    id: 'model-wheel',
    name: 'ModelWheel 模型轮',
    description: '模型名单',
    component: ModelWheelDemo,
  },
  {
    id: 'region-dach',
    name: 'RegionDach 区域地图',
    description: '可切换区域的示意地图',
    component: RegionDachDemo,
  },
  {
    id: 'side-folder',
    name: 'SideFolder 侧向文件夹',
    description: '悬停滑出的文件夹',
    component: SideFolderDemo,
  },
  {
    id: 'tab-overload',
    name: 'TabOverload 标签过载',
    description: '重叠标签跟随悬停',
    component: TabOverloadDemo,
  },
  {
    id: 'team-invite',
    name: 'TeamInvite 邀请队友',
    description: '把新成员拖进空位',
    component: TeamInviteDemo,
  },
  {
    id: 'thinking-state',
    name: 'ThinkingState 思考状态',
    description: '公开文档重建：计时、来源与步骤',
    component: ThinkingStateDemo,
  },
  {
    id: 'chat-composer',
    name: 'ChatComposer 对话输入',
    description: '公开文档重建：模型、语音与批准',
    component: ChatComposerDemo,
  },
  {
    id: 'agent-plan',
    name: 'AgentPlan 代理计划',
    description: '公开文档重建：可编辑步骤与运行',
    component: AgentPlanDemo,
  },
  {
    id: 'approval-card',
    name: 'ApprovalCard 审批卡',
    description: '公开文档重建：风险、倒计时与批准',
    component: ApprovalCardDemo,
  },
  {
    id: 'command-menu',
    name: 'CommandMenu 命令菜单',
    description: '公开文档重建：搜索并运行命令',
    component: CommandMenuDemo,
  },
  {
    id: 'model-picker',
    name: 'ModelPicker 模型选择',
    description: '公开文档重建：速度质量成本与思考',
    component: ModelPickerDemo,
  },
  {
    id: 'review-center',
    name: 'ReviewCenter 审查中心',
    description: '公开文档重建：按风险审查队列',
    component: ReviewCenterDemo,
  },
  {
    id: 'agent-inbox',
    name: 'AgentInbox 代理收件箱',
    description: '公开文档重建：后台任务看板',
    component: AgentInboxDemo,
  },
];
