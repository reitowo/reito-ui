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
import { AIAnswer } from './pro/ai-answer.js';
import { CitedAnswer } from './pro/cited-answer.js';
import { WritingAssistant } from './pro/writing-assistant.js';
import { PermissionRequest } from './pro/permission-request.js';
import { AgentSteering } from './pro/agent-steering.js';
import { AgentTree } from './pro/agent-tree.js';
import { AgentLanes } from './pro/agent-lanes.js';
import { AutonomyDial } from './pro/autonomy-dial.js';
import { InlineDiff } from './pro/inline-diff.js';
import { MemoryPanel } from './pro/memory-panel.js';
import { ParallelAttempts } from './pro/parallel-attempts.js';
import { TraceWaterfall } from './pro/trace-waterfall.js';
import { CommentsPanel } from './pro/comments-panel.js';
import { PromptLibrary } from './pro/prompt-library.js';
import { AgentCursors } from './pro/agent-cursors.js';
import { AgentGraph } from './pro/agent-graph.js';
import { AgentLedger } from './pro/agent-ledger.js';
import { AgentQueue } from './pro/agent-queue.js';
import { ConflictRadar } from './pro/conflict-radar.js';
import { ContextMap } from './pro/context-map.js';
import { ContextWindow } from './pro/context-window.js';
import { DecisionTree } from './pro/decision-tree.js';
import { DelegateBoard } from './pro/delegate-board.js';
import { FanoutGrid } from './pro/fan-out-grid.js';
import { ProjectCard } from './pro/project-card.js';
import { IntegrationPicker } from './pro/integration-picker.js';
import { SetupGuide } from './pro/setup-guide.js';
import { BillingSchedule } from './pro/billing-schedule.js';
import { BreakdownChart } from './pro/breakdown-chart.js';
import { Combobox } from './pro/combobox.js';
import { CompactBreakdown } from './pro/compact-breakdown.js';
import { DataTable } from './pro/data-table.js';
import { DateRangePicker } from './pro/date-range-picker.js';
import { Dropzone } from './pro/dropzone.js';
import { ExperimentCard } from './pro/experiment-card.js';
import { IntegrationSettings } from './pro/integration-settings.js';
import { KpiChart } from './pro/kpi-chart.js';
import {
  StepperChoices,
  StepperField,
  StepperForm,
  StepperInput,
  StepperReview,
  StepperSuccess,
  StepperTags,
  type Step,
} from './pro/stepper-form.js';
import { Toaster, toast } from './pro/toaster.js';
import { UsageMeter } from './pro/usage-meter.js';
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

export function AIAnswerDemo() {
  return (
    <AIAnswer
      question="工作区该用哪套密度？"
      sources={[
        { title: '设计语言', name: '规范', snippet: '紧凑是默认密度。' },
        { title: '令牌政策', name: '令牌', snippet: '视觉尺寸走共享令牌。' },
      ]}
      answer={'默认使用**紧凑**密度。[1] 检查组件时可以切到舒适，但产品界面不必放开关。[2]'}
      followUps={['圆角怎么定？', '深色主题差在哪？']}
    />
  );
}

export function CitedAnswerDemo() {
  return (
    <CitedAnswer
      pagesRead={8}
      sources={[
        {
          id: 'lang',
          title: '设计语言',
          site: 'docs',
          quote: '紧凑是默认密度，舒适留给长文阅读。',
        },
        { id: 'tokens', title: '令牌政策', site: 'docs', quote: '不要在组件里写死像素。' },
      ]}
      segments={[
        { text: '紧凑是默认密度，', cite: ['lang'] },
        { text: '舒适留给长文阅读。', cite: ['lang'], paragraph: false },
        { text: '尺寸都走共享令牌，不要写死像素。', cite: ['tokens'], paragraph: true },
      ]}
      action={{ label: '追问', onClick: () => undefined }}
    />
  );
}

export function WritingAssistantDemo() {
  return <WritingAssistant name="本地助手" tagline="只改你贴进来的句子。" />;
}

export function PermissionRequestDemo() {
  return (
    <PermissionRequest
      agent={{ name: '示例助手', model: '本地' }}
      action="推送到主分支"
      target="reito-ui"
      risk="risky"
      reason="检查已经通过，接下来会打开拉取请求。"
      preview={[
        { id: 'a', label: 'packages/ui/src/affect/index.ts', meta: '+40' },
        { id: 'b', label: 'docs/affect-surface.md', meta: '+6' },
        { id: 'c', label: '发布预览', meta: '本地' },
      ]}
    />
  );
}

export function AgentSteeringDemo() {
  const started = Date.now() - 126000;
  return (
    <AgentSteering
      title="拆分用户表"
      agent="示例助手"
      startedAt={started}
      steps={[
        { id: '1', title: '读取 schema', status: 'done', duration: 1400 },
        { id: '2', title: '规划拆分', status: 'done', duration: 500 },
        { id: '3', title: '写迁移', status: 'active', startedAt: Date.now() - 20000 },
        { id: '4', title: '预演', status: 'pending' },
      ]}
    />
  );
}

export function AgentTreeDemo() {
  return (
    <AgentTree
      root={{
        id: 'root',
        name: '编排器',
        model: '示例',
        task: '周五前上线定价页',
        status: 'running',
        cost: 0.12,
        started: Date.now() - 180000,
        children: [
          {
            id: 'research',
            name: '调研',
            task: '收集竞品价格',
            status: 'done',
            cost: 0.04,
            started: Date.now() - 170000,
            ended: Date.now() - 90000,
          },
          {
            id: 'writer',
            name: '撰稿',
            task: '起草定价文案',
            status: 'waiting',
            ask: '用年度还是月度作为默认？',
            cost: 0.03,
            started: Date.now() - 80000,
          },
        ],
      }}
    />
  );
}

export function AgentLanesDemo() {
  const now = Date.now();
  return (
    <AgentLanes
      now={now}
      agents={[
        { id: 'research', name: '调研', model: '示例' },
        { id: 'writer', name: '撰稿', model: '轻量' },
        { id: 'ops', name: '运维', model: '示例' },
      ]}
      tasks={[
        {
          id: 't1',
          agentId: 'research',
          title: '竞品价格',
          status: 'done',
          start: now - 20 * 60 * 1000,
          end: now - 12 * 60 * 1000,
          summary: '整理了三家公开套餐',
        },
        {
          id: 't2',
          agentId: 'writer',
          title: '定价页草稿',
          status: 'running',
          start: now - 8 * 60 * 1000,
        },
        {
          id: 't3',
          agentId: 'ops',
          title: '轮换密钥',
          status: 'waiting',
          start: now - 4 * 60 * 1000,
          ask: '是否轮换预览环境密钥？',
        },
      ]}
    />
  );
}

export function AutonomyDialDemo() {
  return (
    <AutonomyDial
      actions={[
        { id: 'read', label: '读取文件', risk: 'safe' },
        { id: 'draft', label: '起草邮件', risk: 'safe' },
        { id: 'crm', label: '更新客户记录', risk: 'risky' },
        { id: 'send', label: '发送邮件', risk: 'risky' },
        { id: 'delete', label: '删除文件', risk: 'destructive' },
        { id: 'spend', label: '支出费用', risk: 'destructive' },
      ]}
    />
  );
}

export function InlineDiffDemo() {
  return (
    <InlineDiff
      label="建议 · 写短一点"
      original="我们非常高兴地宣布，新的仪表盘现在已经对所有用户开放。它比以前快很多，而且你现在可以把任意报表导出为 CSV。"
      suggested="新仪表盘已对所有用户开放。它比以前快一倍，并且可以把任意报表导出为 CSV。"
    />
  );
}

export function MemoryPanelDemo() {
  return (
    <MemoryPanel
      memories={[
        {
          id: '1',
          text: '默认使用紧凑密度。',
          category: '工作',
          source: '对话',
          date: '9 月 28 日',
        },
        {
          id: '2',
          text: '令牌写在 tokens.json。',
          category: '项目',
          source: '对话',
          date: '10 月 3 日',
        },
        { id: '3', text: '周五发发布说明。', category: '工作', source: '对话', date: '10 月 9 日' },
      ]}
    />
  );
}

export function ParallelAttemptsDemo() {
  return (
    <ParallelAttempts
      task="修结账测试"
      attempts={[
        {
          id: 'a',
          name: '示例 A',
          approach: '重试',
          status: 'done',
          progress: 1,
          score: 86,
          took: 14000,
          cost: 0.04,
          note: '加上退避后通过',
        },
        {
          id: 'b',
          name: '示例 B',
          approach: '隔离',
          status: 'done',
          progress: 1,
          score: 71,
          took: 18000,
          cost: 0.03,
        },
        {
          id: 'c',
          name: '示例 C',
          approach: '重写',
          status: 'failed',
          progress: 0.4,
          note: '超时',
        },
      ]}
    />
  );
}

export function TraceWaterfallDemo() {
  return (
    <TraceWaterfall
      startedAt={Date.now() - 7000}
      root={{
        id: 'run',
        name: '编排器',
        kind: 'agent',
        status: 'done',
        start: 0,
        end: 7000,
        cost: 0.1,
        tokensIn: 2100,
        tokensOut: 1900,
        input: '规划上线',
        children: [
          {
            id: 'plan',
            name: '规划',
            kind: 'llm',
            status: 'done',
            start: 200,
            end: 2400,
            detail: '示例模型',
            cost: 0.06,
            tokensIn: 1200,
            tokensOut: 800,
          },
          {
            id: 'read',
            name: 'read_file',
            kind: 'tool',
            status: 'done',
            start: 2500,
            end: 3100,
            detail: 'design-language.md',
            cost: 0.01,
          },
          {
            id: 'write',
            name: '起草',
            kind: 'llm',
            status: 'done',
            start: 3200,
            end: 6900,
            cost: 0.03,
            tokensIn: 900,
            tokensOut: 1100,
          },
        ],
      }}
    />
  );
}

export function CommentsPanelDemo() {
  return (
    <CommentsPanel
      comments={[
        {
          id: '1',
          author: { name: '阿宁' },
          createdAt: Date.now() - 120000,
          text: '/edit 把「客户」都改成「成员」。',
        },
        {
          id: '2',
          author: { name: '林可' },
          createdAt: Date.now() - 300000,
          text: '首屏要不要提折扣？',
        },
        {
          id: '3',
          author: { name: '苏衡' },
          createdAt: Date.now() - 660000,
          text: '移动端插画看起来不错。',
          resolved: true,
        },
      ]}
    />
  );
}

export function PromptLibraryDemo() {
  const [used, setUsed] = useState('');
  return (
    <AffectDemoFrame className="max-w-xl">
      <PromptLibrary
        templates={[
          {
            id: 'summary',
            title: '会议纪要',
            category: '笔记',
            body: '把下面的会议整理给 {audience}，不超过 {length}。先写决定，再列出关于 {topic} 的未决问题。',
            variables: {
              audience: { description: '谁来读' },
              length: { description: '篇幅', default: '150 字' },
              topic: { description: '未决问题的主题' },
            },
          },
          {
            id: 'release',
            title: '发布说明',
            category: '工程',
            body: '用 {tone} 语气写一版 {product} 的发布说明。',
            variables: {
              tone: { description: '语气', default: '克制' },
              product: { description: '产品名' },
            },
          },
        ]}
        onUse={(prompt) => setUsed(prompt)}
      />
      <Text variant="caption" tone="muted">
        {used || '填完变量后可以使用提示。'}
      </Text>
    </AffectDemoFrame>
  );
}

export function AgentCursorsDemo() {
  return (
    <AgentCursors
      title="上线说明"
      agents={[
        { id: 'writer', name: '撰稿', cost: 0.04 },
        { id: 'reviewer', name: '校对', cost: 0.02 },
      ]}
      blocks={[
        { id: 'h', kind: 'heading', text: '本周上线' },
        { id: 'p', kind: 'paragraph', text: '把共享令牌收进本地示例，不再连接外部模型。' },
      ]}
      cursors={{ writer: { block: 'p', at: 4, doing: '改写' } }}
      suggestions={[
        {
          id: 's1',
          agent: 'reviewer',
          block: 'p',
          at: 2,
          remove: '共享令牌',
          insert: '演示数据',
          note: '避免读者以为这是真实密钥',
        },
      ]}
      comments={[{ id: 'c1', agent: 'writer', block: 'p', text: '标题要不要更短？' }]}
    />
  );
}

export function AgentGraphDemo() {
  const now = Date.now();
  return (
    <AgentGraph
      nodes={[
        {
          id: 'lead',
          name: '编排',
          kind: 'agent',
          lead: true,
          status: 'working',
          doing: '分派',
          cost: 0.08,
        },
        { id: 'writer', name: '撰稿', kind: 'agent', status: 'waiting', doing: '等你看草稿' },
        { id: 'search', name: '检索', kind: 'tool', status: 'done' },
        { id: 'you', name: '你', kind: 'user' },
      ]}
      edges={[
        ['lead', 'writer'],
        ['lead', 'search'],
        ['writer', 'you'],
      ]}
      calls={[
        { id: '1', from: 'lead', to: 'search', at: now - 4000, status: 'ok', label: '检索文档' },
        { id: '2', from: 'lead', to: 'writer', at: now - 1000, status: 'pending' },
      ]}
      now={now}
    />
  );
}

export function AgentLedgerDemo() {
  const now = Date.now();
  return (
    <AgentLedger
      agent="计费代理"
      entries={[
        {
          id: 'plan',
          action: '改套餐',
          target: 'acme',
          system: '计费',
          at: now - 120000,
          change: ['试用', '团队版'],
          reversible: true,
        },
        {
          id: 'mail',
          action: '发确认信',
          target: 'ops@local',
          system: '邮件',
          at: now - 60000,
          dependsOn: ['plan'],
          reversible: true,
        },
        {
          id: 'charge',
          action: '扣款',
          target: '$49',
          system: '支付',
          at: now - 30000,
          reversible: false,
          dependsOn: ['plan'],
        },
      ]}
      now={now}
    />
  );
}

export function AgentQueueDemo() {
  const now = Date.now();
  return (
    <AgentQueue
      name="夜间批"
      workers={[
        { id: 'a', name: '工作者 A' },
        { id: 'b', name: '工作者 B' },
      ]}
      jobs={[
        {
          id: '1',
          name: '摘要 12 封邮件',
          kind: 'llm',
          status: 'running',
          enqueuedAt: now - 20000,
          worker: 'a',
          progress: 0.4,
        },
        {
          id: '2',
          name: '同步议题',
          kind: 'tool',
          status: 'queued',
          enqueuedAt: now - 8000,
          priority: 'high',
        },
        { id: '3', name: '写发布说明', kind: 'agent', status: 'queued', enqueuedAt: now - 4000 },
      ]}
      now={now}
      onPromote={() => undefined}
      onCancel={() => undefined}
      onPausedChange={() => undefined}
      onConcurrencyChange={() => undefined}
    />
  );
}

export function ConflictRadarDemo() {
  return (
    <ConflictRadar
      agents={[
        { id: 'alpha', name: 'Alpha', model: '主分支', status: 'done' },
        { id: 'beta', name: 'Beta', model: '修复分支', status: 'done' },
      ]}
      files={[
        {
          path: 'packages/ui/src/affect/shared.tsx',
          edits: [
            { agentId: 'alpha', lines: [12, 24], summary: '抽出 formatAgo' },
            { agentId: 'beta', lines: [20, 28], summary: '改成相对日期' },
          ],
        },
        {
          path: 'docs/affect-surface.md',
          edits: [{ agentId: 'alpha', lines: [10, 16], summary: '补许可说明' }],
        },
      ]}
    />
  );
}

export function ContextMapDemo() {
  return (
    <ContextMap
      model="示例模型"
      limit={200000}
      blocks={[
        { id: 'system', label: '系统提示', kind: 'system', tokens: 6200 },
        { id: 'tools', label: '工具定义', kind: 'tools', tokens: 14800 },
        {
          id: 'spec',
          label: 'design-language.md',
          kind: 'file',
          tokens: 8200,
          detail: '0:09 读入',
        },
        { id: 'chat', label: '对话', kind: 'chat', tokens: 41000 },
        { id: 'run', label: '检查结果', kind: 'result', tokens: 22400 },
      ]}
      compaction={null}
    />
  );
}

export function ContextWindowDemo() {
  return (
    <ContextWindow
      limit={200000}
      model="示例模型"
      parts={[
        { id: 'system', label: '系统提示', tokens: 4200, locked: true },
        { id: 'tools', label: '工具', tokens: 12800 },
        {
          id: 'files',
          label: '文件',
          items: [
            { id: 'tokens', label: 'tokens.json', tokens: 9400 },
            { id: 'surface', label: 'affect-surface.md', tokens: 4300 },
          ],
        },
        { id: 'chat', label: '对话', tokens: 108600, compact: true },
      ]}
    />
  );
}

export function DecisionTreeDemo() {
  return (
    <DecisionTree
      decisions={[
        {
          id: 'dupes',
          question: '三位成员有两份有效订阅，怎么处理？',
          context: '结账中断时重复下单。',
          agent: '计费代理',
          risk: 'high',
          options: [
            {
              label: '取消较新的一份',
              pick: true,
              effects: ['取消 3 份订阅 · 可恢复', '发送 3 封邮件'],
            },
            { label: '退较新的一份', effects: ['退款 $147 · 不可恢复'] },
            { label: '先问成员', effects: ['发送 3 封邮件 · 等待回复'] },
          ],
        },
      ]}
    />
  );
}

export function DelegateBoardDemo() {
  return (
    <DelegateBoard
      agents={[
        { id: 'writer', name: '撰稿', model: '快模型', current: 12, rate: 0.02 },
        { id: 'reviewer', name: '校对', model: '稳模型', current: 4, rate: 0.03 },
      ]}
      tasks={[
        { id: 'notes', title: '写发布说明', estimate: 18 },
        { id: 'review', title: '校对上线清单', estimate: 10, agentId: 'reviewer' },
        { id: 'mail', title: '通知内部', estimate: 8 },
      ]}
    />
  );
}

export function FanoutGridDemo() {
  return (
    <FanoutGrid
      job="整理 12 条线索"
      workers={4}
      now={40000}
      tasks={[
        { id: '1', label: 'a.local', status: 'done', start: 0, end: 8000, cost: 0.01 },
        { id: '2', label: 'b.local', status: 'done', start: 2000, end: 11000, cost: 0.01 },
        { id: '3', label: 'c.local', status: 'running', worker: 'W2', start: 12000 },
        { id: '4', label: 'd.local', status: 'retrying', attempts: 2, start: 15000 },
        { id: '5', label: 'e.local', status: 'failed', error: '超时', attempts: 3 },
        { id: '6', label: 'f.local', status: 'queued' },
        { id: '7', label: 'g.local', status: 'queued' },
        { id: '8', label: 'h.local', status: 'queued' },
      ]}
      onRetry={() => undefined}
    />
  );
}

export function ProjectCardDemo() {
  return (
    <ProjectCard
      title="入职流程"
      status="progress"
      due="10 月 24 日"
      trigger="click"
      defaultOpen
      members={[{ name: '阿宁' }, { name: '林可' }]}
      tasks={[
        { id: 'welcome', label: '欢迎页', done: true, assignee: '阿宁' },
        { id: 'workspace', label: '工作区', done: true, assignee: '林可' },
        { id: 'invite', label: '邀请同事', assignee: '阿宁' },
      ]}
      action={{ label: '打开', onClick: () => undefined }}
    />
  );
}

export function IntegrationPickerDemo() {
  return <IntegrationPicker appName="Reito" />;
}

export function SetupGuideDemo() {
  return (
    <SetupGuide
      groups={[
        {
          id: 'workspace',
          title: '建立工作区',
          tasks: [
            { id: 'name', label: '填写工作区名称' },
            { id: 'invite', label: '邀请同事' },
          ],
        },
        {
          id: 'verify',
          title: '验证账户',
          tasks: [{ id: 'email', label: '确认邮箱', done: true }],
        },
      ]}
    />
  );
}

export function BillingScheduleDemo() {
  return <BillingSchedule />;
}

export function BreakdownChartDemo() {
  return (
    <BreakdownChart
      title="工作量"
      records={[
        { team: '设计', week: '本周', hours: 18 },
        { team: '工程', week: '本周', hours: 26 },
        { team: '设计', week: '上周', hours: 12 },
        { team: '工程', week: '上周', hours: 22 },
      ]}
      dimensions={[
        { key: 'team', label: '团队', values: ['设计', '工程'] },
        { key: 'week', label: '周期', values: ['本周', '上周'] },
      ]}
      measures={[{ key: 'hours', label: '小时', field: 'hours' }]}
    />
  );
}

export function AffectComboboxDemo() {
  return (
    <Combobox
      label="成员"
      defaultOpen
      defaultValue={['ning']}
      creatable
      options={[
        { value: 'ning', label: '阿宁', hint: '设计', group: '内部' },
        { value: 'lin', label: '林可', hint: '工程', group: '内部' },
        { value: 'guest', label: '访客', group: '外部' },
      ]}
    />
  );
}

export function CompactBreakdownDemo() {
  return (
    <CompactBreakdown
      title="渠道"
      delta={0.12}
      periods={[
        { id: 'week', label: '本周' },
        { id: 'month', label: '本月' },
      ]}
      items={[
        { label: '自然搜索', value: 46 },
        { label: '付费', value: 28 },
        { label: '推荐', value: 16 },
      ]}
    />
  );
}

export function AffectDataTableDemo() {
  return (
    <DataTable
      title="项目"
      columns={[
        { key: 'name', label: '名称', type: 'title', editable: true },
        { key: 'status', label: '状态', type: 'tag', options: ['进行中', '完成'] },
        { key: 'hours', label: '小时', type: 'number' },
      ]}
      rows={[
        { id: 'onboard', name: '入职流程', status: '进行中', hours: 12 },
        { id: 'billing', name: '账单页', status: '完成', hours: 8 },
      ]}
    />
  );
}

export function AffectDateRangePickerDemo() {
  return <DateRangePicker defaultOpen today={new Date('2026-10-17')} />;
}

export function AffectDropzoneDemo() {
  return <Dropzone accept={['.png', '.pdf']} hint="示例：不会实际上传" />;
}

export function ExperimentCardDemo() {
  return (
    <ExperimentCard
      title="结账页标题"
      status={{ label: '进行中', tone: 'green' }}
      defaultOpen
      metrics={[
        { id: 'cvr', label: '转化率', format: (value) => `${value.toFixed(1)}%` },
        { id: 'rev', label: '收入', format: (value) => `$${value}` },
      ]}
      variants={[
        {
          id: 'a',
          key: 'A',
          name: '原标题',
          control: true,
          values: { cvr: 3.1, rev: 920 },
          visitors: 1200,
        },
        { id: 'b', key: 'B', name: '短标题', values: { cvr: 3.8, rev: 1100 }, visitors: 1180 },
      ]}
      action={{ label: '采用', onClick: () => undefined }}
    />
  );
}

export function IntegrationSettingsDemo() {
  return (
    <IntegrationSettings
      name="站点分析"
      count={2}
      meta="已连接"
      defaultValues={{ enabled: true, siteUrl: 'example.com', apiKey: 'rk_demo' }}
    />
  );
}

export function KpiChartDemo() {
  return (
    <KpiChart
      title="收入"
      value="$96.4k"
      delta={7900}
      footer="主要渠道"
      labels={['3/3', '3/4', '3/5', '3/6']}
      series={[
        { label: '自然', values: [4600, 4900, 5200, 5400] },
        { label: '付费', values: [3100, 3400, 3200, 3600] },
      ]}
    />
  );
}

type OnboardingValues = { name: string; slug: string; invites: string[]; plan: string };

const onboardingSteps: Step<OnboardingValues>[] = [
  {
    id: 'workspace',
    title: '工作区',
    heading: '命名工作区',
    render: ({ values, setValues }) => (
      <>
        <StepperField name="name" label="工作区名称">
          <StepperInput
            value={values.name}
            onChange={(event) =>
              setValues({
                name: event.target.value,
                slug: event.target.value.toLowerCase().replace(/\s+/g, '-'),
              })
            }
          />
        </StepperField>
        <StepperField name="slug" label="工作区地址">
          <StepperInput
            prefix="reito.app/"
            value={values.slug}
            onChange={(event) => setValues({ slug: event.target.value })}
          />
        </StepperField>
      </>
    ),
    validate: (values) => ({ name: values.name.trim() ? undefined : '请填写名称' }),
  },
  {
    id: 'team',
    title: '团队',
    render: ({ values, setValues }) => (
      <StepperField name="invites" label="邀请邮箱" optional>
        <StepperTags value={values.invites} onChange={(invites) => setValues({ invites })} />
      </StepperField>
    ),
  },
  {
    id: 'plan',
    title: '方案',
    render: ({ values, setValues }) => (
      <StepperChoices
        label="方案"
        value={values.plan}
        onChange={(plan) => setValues({ plan })}
        options={[
          { value: 'pro', title: '专业版', aside: '$29', description: '适合小团队' },
          {
            value: 'team',
            title: '团队版',
            aside: '$79',
            badge: '常用',
            description: '含更多席位',
          },
        ]}
      />
    ),
  },
  {
    id: 'review',
    title: '核对',
    render: ({ values, goTo }) => (
      <StepperReview
        onEdit={goTo}
        rows={[
          { label: '工作区', value: values.name || '未填写', step: 'workspace' },
          { label: '方案', value: values.plan, step: 'plan' },
        ]}
      />
    ),
  },
];

export function StepperFormDemo() {
  return (
    <StepperForm<OnboardingValues>
      steps={onboardingSteps}
      initialValues={{ name: '本地演示', slug: 'local-demo', invites: [], plan: 'pro' }}
      submitLabel="创建工作区"
      success={(values, reset) => (
        <StepperSuccess title="已创建" description={`${values.name} · ${values.plan}`}>
          <Button variant="ghost" onClick={reset}>
            再走一遍
          </Button>
        </StepperSuccess>
      )}
    />
  );
}

export function AffectToasterDemo() {
  return (
    <div className="relative min-h-[var(--rui-container-3xs)]">
      <Inline>
        <Button onClick={() => toast.success('草稿已保存', { description: '本地示例，没有发送' })}>
          成功
        </Button>
        <Button
          variant="secondary"
          onClick={() => toast.error('同步失败', { description: '可稍后重试' })}
        >
          失败
        </Button>
        <Button
          variant="ghost"
          onClick={() =>
            toast('已移到回收站', {
              description: '示例文件',
              action: { label: '撤销', onClick: () => undefined },
            })
          }
        >
          带操作
        </Button>
      </Inline>
      <Toaster position="bottom-right" inline />
    </div>
  );
}

export function UsageMeterDemo() {
  return (
    <UsageMeter
      title="Reito AI"
      plan="专业版"
      total={10000}
      used={[
        { label: '对话', value: 3980 },
        { label: '搜索', value: 1640 },
        { label: '图片', value: 820 },
      ]}
      limits={[
        { label: '席位', used: 8, total: 10 },
        { label: '存储', used: 3.2, total: 5, unit: 'GB', decimals: 1 },
        { label: '项目', used: 12, total: null },
      ]}
      daily={[
        { label: '1 日', value: 210 },
        { label: '2 日', value: 280 },
        { label: '3 日', value: 190 },
        { label: '4 日', value: 320 },
        { label: '5 日', value: null },
      ]}
      periods={[
        { id: 'month', label: '本月' },
        { id: 'last', label: '上月' },
      ]}
      resetAt="2026-11-17"
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
  {
    id: 'ai-answer',
    name: 'AIAnswer 带出处回答',
    description: '公开文档重建：来源卡、引用与追问',
    component: AIAnswerDemo,
  },
  {
    id: 'cited-answer',
    name: 'CitedAnswer 引用对照',
    description: '公开文档重建：句子与来源互亮',
    component: CitedAnswerDemo,
  },
  {
    id: 'writing-assistant',
    name: 'WritingAssistant 写作助手',
    description: '公开文档重建：建议、流式回复与口述',
    component: WritingAssistantDemo,
  },
  {
    id: 'affect-permission-request',
    name: 'PermissionRequest 权限请求',
    description: '公开文档重建：一次、限时或始终授权',
    component: PermissionRequestDemo,
  },
  {
    id: 'agent-steering',
    name: 'AgentSteering 运行中引导',
    description: '公开文档重建：排队便条或立即打断',
    component: AgentSteeringDemo,
  },
  {
    id: 'agent-tree',
    name: 'AgentTree 代理树',
    description: '公开文档重建：编排与子代理成本',
    component: AgentTreeDemo,
  },
  {
    id: 'agent-lanes',
    name: 'AgentLanes 代理泳道',
    description: '公开文档重建：并行时间线与交接',
    component: AgentLanesDemo,
  },
  {
    id: 'autonomy-dial',
    name: 'AutonomyDial 自主程度',
    description: '公开文档重建：三级权限与锁定',
    component: AutonomyDialDemo,
  },
  {
    id: 'inline-diff',
    name: 'InlineDiff 行内改写',
    description: '公开文档重建：逐处接受或拒绝',
    component: InlineDiffDemo,
  },
  {
    id: 'memory-panel',
    name: 'MemoryPanel 记忆面板',
    description: '公开文档重建：分组编辑、暂停与忘记',
    component: MemoryPanelDemo,
  },
  {
    id: 'parallel-attempts',
    name: 'ParallelAttempts 并行尝试',
    description: '公开文档重建：多路竞赛与择优',
    component: ParallelAttemptsDemo,
  },
  {
    id: 'trace-waterfall',
    name: 'TraceWaterfall 轨迹瀑布',
    description: '公开文档重建：耗时、费用与最慢调用',
    component: TraceWaterfallDemo,
  },
  {
    id: 'comments-panel',
    name: 'CommentsPanel 评论面板',
    description: '公开文档重建：筛选、/edit 与解决',
    component: CommentsPanelDemo,
  },
  {
    id: 'prompt-library',
    name: 'PromptLibrary 提示库',
    description: '公开文档重建：模板变量与预览',
    component: PromptLibraryDemo,
  },
  {
    id: 'agent-cursors',
    name: 'AgentCursors 代理光标',
    description: '公开文档重建：文档内指针、建议与评论',
    component: AgentCursorsDemo,
  },
  {
    id: 'agent-graph',
    name: 'AgentGraph 代理图',
    description: '公开文档重建：代理、工具与调用热度',
    component: AgentGraphDemo,
  },
  {
    id: 'agent-ledger',
    name: 'AgentLedger 代理账本',
    description: '公开文档重建：改动、依赖与撤销链',
    component: AgentLedgerDemo,
  },
  {
    id: 'agent-queue',
    name: 'AgentQueue 代理队列',
    description: '公开文档重建：等待、工作者与限流',
    component: AgentQueueDemo,
  },
  {
    id: 'conflict-radar',
    name: 'ConflictRadar 冲突雷达',
    description: '公开文档重建：并行改动与合并选择',
    component: ConflictRadarDemo,
  },
  {
    id: 'context-map',
    name: 'ContextMap 上下文地图',
    description: '公开文档重建：窗口占用与压缩前后',
    component: ContextMapDemo,
  },
  {
    id: 'context-window',
    name: 'ContextWindow 上下文窗口',
    description: '公开文档重建：单元格子、移除与压缩',
    component: ContextWindowDemo,
  },
  {
    id: 'decision-tree',
    name: 'DecisionTree 决策树',
    description: '公开文档重建：分支后果与自写指示',
    component: DecisionTreeDemo,
  },
  {
    id: 'delegate-board',
    name: 'DelegateBoard 委派看板',
    description: '公开文档重建：把任务交给空闲代理',
    component: DelegateBoardDemo,
  },
  {
    id: 'fan-out-grid',
    name: 'FanoutGrid 分发网格',
    description: '公开文档重建：批量任务格子与重试',
    component: FanoutGridDemo,
  },
  {
    id: 'project-card',
    name: 'ProjectCard 项目卡',
    description: '公开文档重建：展开子任务、状态与成员',
    component: ProjectCardDemo,
  },
  {
    id: 'integration-picker',
    name: 'IntegrationPicker 集成选择',
    description: '公开文档重建：搜索服务并开关连接',
    component: IntegrationPickerDemo,
  },
  {
    id: 'setup-guide',
    name: 'SetupGuide 设置指南',
    description: '公开文档重建：分组清单与顺序解锁',
    component: SetupGuideDemo,
  },
  {
    id: 'billing-schedule',
    name: 'BillingSchedule 账单计划',
    description: '公开文档重建：阶段、产品行与合计',
    component: BillingScheduleDemo,
  },
  {
    id: 'breakdown-chart',
    name: 'BreakdownChart 分解图',
    description: '公开文档重建：切片、分段与堆叠条',
    component: BreakdownChartDemo,
  },
  {
    id: 'affect-combobox',
    name: 'Combobox 组合框',
    description: '公开文档重建：多选、分组与可创建。模式层兄弟。',
    component: AffectComboboxDemo,
  },
  {
    id: 'compact-breakdown',
    name: 'CompactBreakdown 紧凑构成',
    description: '公开文档重建：周期与排名条',
    component: CompactBreakdownDemo,
  },
  {
    id: 'affect-data-table',
    name: 'DataTable 数据表',
    description: '公开文档重建：勾选、排序与格内编辑。模式层兄弟。',
    component: AffectDataTableDemo,
  },
  {
    id: 'affect-date-range-picker',
    name: 'DateRangePicker 日期范围',
    description: '公开文档重建：预设与对比周期。模式层兄弟。',
    component: AffectDateRangePickerDemo,
  },
  {
    id: 'affect-dropzone',
    name: 'Dropzone 拖放上传',
    description: '公开文档重建：拖入、进度与重试。模式层兄弟。',
    component: AffectDropzoneDemo,
  },
  {
    id: 'experiment-card',
    name: 'ExperimentCard 实验卡',
    description: '公开文档重建：方案对比与选赢家',
    component: ExperimentCardDemo,
  },
  {
    id: 'integration-settings',
    name: 'IntegrationSettings 集成设置',
    description: '公开文档重建：开关、密钥与脏保存条',
    component: IntegrationSettingsDemo,
  },
  {
    id: 'kpi-chart',
    name: 'KpiChart 指标图',
    description: '公开文档重建：折线、键盘与礼貌提示',
    component: KpiChartDemo,
  },
  {
    id: 'stepper-form',
    name: 'StepperForm 分步表单',
    description: '公开文档重建：步骤、校验与核对',
    component: StepperFormDemo,
  },
  {
    id: 'affect-toaster',
    name: 'Toaster 轻提示',
    description: '公开文档重建：模块级 toast。模式层兄弟。',
    component: AffectToasterDemo,
  },
  {
    id: 'usage-meter',
    name: 'UsageMeter 用量条',
    description: '公开文档重建：堆叠额度、日线和限额',
    component: UsageMeterDemo,
  },
];
