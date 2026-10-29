export { Button, type AffectButtonProps } from './button.js';
export { ChangeSummary, type ChangeSummaryProps, type MetricChange } from './change-summary.js';
export {
  CommentThread,
  AssistantMark,
  type CommentThreadProps,
  type ThreadAuthor,
  type ThreadMessage,
} from './comment-thread.js';
export { DecisionInbox, type Decision, type DecisionInboxProps } from './decision-inbox.js';
export {
  EmailDraft,
  type DraftContact,
  type DraftTone,
  type EmailDraftProps,
} from './email-draft.js';
export {
  FilterMenu,
  type FilterGroup,
  type FilterMenuProps,
  type FilterOption,
  type FilterValue,
} from './filter-menu.js';
export {
  MessageActions,
  MessageText,
  type FeedbackKind,
  type MessageActionKey,
  type MessageActionsProps,
} from './message-actions.js';
export {
  NotificationStack,
  type Notice,
  type NoticePattern,
  type NotificationStackProps,
} from './notification-stack.js';
export { OtpInput, type OtpInputProps, type OtpStatus } from './otp-input.js';
export {
  ProfileMenu,
  type ProfileMenuItem,
  type ProfileMenuProps,
  type ProfileSetup,
} from './profile-menu.js';
export {
  ProgressTracker,
  type ProgressStep,
  type ProgressTrackerProps,
} from './progress-tracker.js';
export {
  ReactionBar,
  type ReactionBarProps,
  type ReactionKey,
  type ReactionState,
} from './reaction-bar.js';
export {
  SegmentedControl,
  type SegmentOption,
  type SegmentedControlProps,
} from './segmented-control.js';
export {
  SmartRecommendation,
  type Recommendation,
  type SmartRecommendationProps,
} from './smart-recommendation.js';
export { ThinkingLoader, type ThinkingLoaderProps } from './thinking-loader.js';
export { TipsPanel, type Tip, type TipsPanelProps } from './tips-panel.js';
export {
  ToolCallCard,
  ToolCallGroup,
  type ToolCallCardProps,
  type ToolCallGroupProps,
  type ToolCallStatus,
} from './tool-call-card.js';
export { LogoMarquee, type LogoMarqueeProps, type MarqueeLogo } from './blocks/logo-marquee.js';
export {
  TestimonialWall,
  type Testimonial,
  type TestimonialWallProps,
} from './blocks/testimonial-wall.js';
export { AgentGallery, type AgentGalleryProps, type GalleryItem } from './blocks/agent-gallery.js';
export {
  AiWorkspace,
  type AiWorkspaceProps,
  type WorkspaceConversation,
  type WorkspaceMessage,
  type WorkspaceProject,
} from './blocks/ai-workspace.js';
export {
  AppDirectory,
  type AppCategory,
  type AppDirectoryProps,
  type DirectoryApp,
} from './blocks/app-directory.js';
export {
  ClientContext,
  type ClientContextProps,
  type ContextClient,
  type ContextEntry,
  type ContextFile,
  type ContextKpi,
  type ContextReport,
} from './blocks/client-context.js';
export {
  InvoiceCredit,
  type InvoiceCreditProps,
  type InvoiceLine,
  type InvoiceParty,
} from './blocks/invoice-credit.js';
export {
  KpiBoard,
  type KpiBoardData,
  type KpiBoardProps,
  type KpiFocus,
  type KpiOverview,
  type KpiStat,
} from './blocks/kpi-board.js';
export {
  MetricsDashboard,
  type MetricsDashboardProps,
  type MetricsMetric,
  type MetricsRange,
} from './blocks/metrics-dashboard.js';
export {
  PricingPlans,
  type PricingFeature,
  type PricingPlan,
  type PricingPlansProps,
} from './blocks/pricing-plans.js';
export {
  TaskBoard,
  type BoardSubtask,
  type BoardTask,
  type TaskBoardProps,
  type TaskLabel,
  type TaskPerson,
  type TaskStatus,
} from './blocks/task-board.js';
export {
  GridBackground,
  type GridBackgroundProps,
  type GridDirection,
} from './motion/grid-background.js';
export { NumberTicker, type NumberTickerProps } from './motion/number-ticker.js';
export {
  Skeleton,
  ShimmerText,
  type SkeletonProps,
  type ShimmerTextProps,
} from './motion/shimmer-loader.js';
export { TextReveal, type TextRevealProps } from './motion/text-reveal.js';
export { BlurCrossfade, type BlurCrossfadeProps } from './motion/blur-crossfade.js';
export { GradientFloor, type GradientFloorProps } from './motion/gradient-floor.js';
export { GradientText, type GradientTextProps } from './motion/gradient-text.js';
export { TiltCard, type TiltCardProps } from './motion/tilt-card.js';
export * from './illustrations/index.js';
export {
  ThinkingState,
  type ThinkingSource,
  type ThinkingStateProps,
  type ThinkingStep,
} from './pro/thinking-state.js';
export { ChatComposer, type ChatComposerProps, type ChatModel } from './pro/chat-composer.js';
export {
  AgentPlan,
  type AgentPlanProps,
  type PlanStep,
  type PlanStepStatus,
} from './pro/agent-plan.js';
export { ApprovalCard, type ApprovalCardProps, type ApprovalStatus } from './pro/approval-card.js';
export {
  CommandMenu,
  type CommandGroup,
  type CommandItem,
  type CommandMenuProps,
} from './pro/command-menu.js';
export { ModelPicker, type ModelPickerProps, type PickerModel } from './pro/model-picker.js';
export {
  ReviewCenter,
  type ReviewCenterProps,
  type ReviewDecision,
  type ReviewFilter,
  type ReviewItem,
  type ReviewRisk,
} from './pro/review-center.js';
export {
  AgentInbox,
  type AgentInboxProps,
  type AgentInboxStatus,
  type AgentInboxView,
  type AgentTask,
} from './pro/agent-inbox.js';
export { AIAnswer, type AIAnswerProps, type AnswerSource } from './pro/ai-answer.js';
export {
  CitedAnswer,
  type CitedAnswerProps,
  type CitedSegment,
  type CitedSource,
} from './pro/cited-answer.js';
export { WritingAssistant, type WritingAssistantProps } from './pro/writing-assistant.js';
export {
  PermissionRequest,
  type PermissionDecision as AffectPermissionDecision,
  type PermissionPreview,
  type PermissionRequestProps,
  type PermissionRisk,
  type PermissionScope,
} from './pro/permission-request.js';
export {
  AgentSteering,
  type AgentSteeringProps,
  type SteerNote,
  type SteerStep,
} from './pro/agent-steering.js';
export {
  AgentTree,
  type AgentTreeProps,
  type TreeAgent,
  type TreeAgentStatus,
} from './pro/agent-tree.js';
export {
  AgentLanes,
  type AgentLanesProps,
  type LaneAgent,
  type LaneTask,
} from './pro/agent-lanes.js';
export {
  AutonomyDial,
  asksFirst,
  type AgentAction,
  type AutonomyDialProps,
  type AutonomyLevel,
} from './pro/autonomy-dial.js';
export {
  InlineDiff,
  diffWords,
  type DiffSegment,
  type InlineDiffHandle,
  type InlineDiffProps,
} from './pro/inline-diff.js';
export { MemoryPanel, type Memory, type MemoryPanelProps } from './pro/memory-panel.js';
export {
  ParallelAttempts,
  type Attempt,
  type ParallelAttemptsProps,
} from './pro/parallel-attempts.js';
export {
  TraceWaterfall,
  type TraceKind,
  type TraceSpan,
  type TraceWaterfallProps,
} from './pro/trace-waterfall.js';
export {
  CommentsPanel,
  type CommentAuthor,
  type CommentsPanelProps,
  type PanelComment,
} from './pro/comments-panel.js';
export {
  PromptLibrary,
  type PromptLibraryProps,
  type PromptTemplate,
  type PromptVariable,
} from './pro/prompt-library.js';
export {
  AgentCursors,
  acceptSuggestion,
  type AgentCursor,
  type AgentCursorsProps,
  type CursorAgent,
  type DocBlock,
  type DocComment,
  type DocSuggestion,
} from './pro/agent-cursors.js';
export {
  AgentGraph,
  type AgentGraphProps,
  type GraphCall,
  type GraphKind,
  type GraphNode,
  type GraphStatus,
} from './pro/agent-graph.js';
export { AgentLedger, type AgentLedgerProps, type LedgerEntry } from './pro/agent-ledger.js';
export {
  AgentQueue,
  type AgentQueueProps,
  type QueueJob,
  type QueueWorker,
} from './pro/agent-queue.js';
export {
  ConflictRadar,
  type ConflictRadarProps,
  type RadarAgent,
  type RadarEdit,
  type RadarFile,
} from './pro/conflict-radar.js';
export {
  ContextMap,
  type ContextAgent,
  type ContextBlock,
  type ContextCompaction,
  type ContextKind,
  type ContextMapProps,
} from './pro/context-map.js';
export {
  ContextWindow,
  type ContextItem,
  type ContextPart,
  type ContextWindowProps,
} from './pro/context-window.js';
export {
  DecisionTree,
  type Decision as TreeDecision,
  type DecisionChoice,
  type DecisionFlag,
  type DecisionOption,
  type DecisionText,
  type DecisionTreeProps,
} from './pro/decision-tree.js';
export {
  DelegateBoard,
  type DelegateAgent,
  type DelegateBoardProps,
  type DelegateMode,
  type DelegateTask,
} from './pro/delegate-board.js';
export {
  FanoutGrid,
  type FanoutGridProps,
  type FanoutStatus,
  type FanoutTask,
} from './pro/fan-out-grid.js';
export {
  ProjectCard,
  type ProjectCardProps,
  type ProjectMember,
  type ProjectOption,
  type ProjectTask,
} from './pro/project-card.js';
export {
  IntegrationPicker,
  type Integration,
  type IntegrationPickerProps,
} from './pro/integration-picker.js';
export {
  SetupGuide,
  type SetupGroup,
  type SetupGuideProps,
  type SetupTask,
} from './pro/setup-guide.js';
export {
  BillingSchedule,
  type BillingScheduleProps,
  type BillingScheduleValue,
  type CatalogItem,
  type ScheduleLine,
} from './pro/billing-schedule.js';
export {
  BreakdownChart,
  type BreakdownChartProps,
  type BreakdownRecord,
  type Dimension,
  type Measure,
} from './pro/breakdown-chart.js';
export { Combobox, type AffectComboboxProps, type ComboboxOption } from './pro/combobox.js';
export {
  CompactBreakdown,
  type BreakdownItem,
  type CompactBreakdownProps,
} from './pro/compact-breakdown.js';
export {
  DataTable,
  type AffectDataTableProps,
  type DataColumn,
  type DataRow,
} from './pro/data-table.js';
export {
  DateRangePicker,
  type CompareMode,
  type DatePreset,
  type DateRange,
  type DateRangePickerProps,
} from './pro/date-range-picker.js';
export {
  Dropzone,
  type DropzoneProps,
  type UploadItem,
  type UploadStatus,
} from './pro/dropzone.js';
export {
  ExperimentCard,
  type ExperimentCardProps,
  type ExperimentMetric,
  type ExperimentTone,
  type ExperimentVariant,
} from './pro/experiment-card.js';
export {
  IntegrationSettings,
  type IntegrationSettingsProps,
  type IntegrationSettingsValues,
} from './pro/integration-settings.js';
export { KpiChart, type KpiChartProps, type KpiSeries } from './pro/kpi-chart.js';
export {
  StepperChoices,
  StepperField,
  StepperForm,
  StepperInput,
  StepperReview,
  StepperSuccess,
  StepperTags,
  type Step,
  type StepperChoicesProps,
  type StepperFieldProps,
  type StepperFormProps,
  type StepperInputProps,
  type StepperReviewProps,
  type StepperSuccessProps,
  type StepperTagsProps,
} from './pro/stepper-form.js';
export {
  Toaster,
  toast,
  type ToastId,
  type ToastOptions,
  type ToasterProps,
} from './pro/toaster.js';
export {
  UsageMeter,
  type UsageDay,
  type UsageLimit,
  type UsageMeterProps,
  type UsagePart,
  type UsagePeriod,
  type UsageState,
} from './pro/usage-meter.js';
export {
  AppShell,
  AppShellFlat,
  AppShellWorkspace,
  AppShellWorkspaceFlat,
  type AppShellProps,
  type AppShellWorkspaceProps,
  type ShellGroup,
  type ShellNavItem,
  type ShellUser,
  type ShellWidth,
  type WorkspaceSource,
  type WorkspaceTool,
} from './pro/app-shell.js';
export { AgentChatScreen, type AgentChatScreenProps } from './pro/agent-chat.js';
export {
  AgentRunScreen,
  type AgentRunScreenProps,
  type RunApproval,
  type RunStep,
  type RunToolCall,
} from './pro/agent-run.js';
export { AnalyticsScreen, type AnalyticsScreenProps } from './pro/analytics.js';
export { AssistantHomeScreen, type AssistantHomeScreenProps } from './pro/assistant-home.js';
export { CrmScreen, type CrmScreenProps } from './pro/crm.js';
export { EvalsScreen, type EvalsScreenProps } from './pro/evals.js';
export { FolderScreen, type FolderScreenProps } from './pro/folder.js';
export { FilesScreen, FoldersScreen, type FilesScreenProps } from './pro/folders.js';
export { IntegrationsScreen, type IntegrationsScreenProps } from './pro/integrations.js';
export {
  OnboardingScreen,
  type OnboardingScreenProps,
  type OnboardingValues,
} from './pro/onboarding.js';
export {
  SettingsBillingScreen,
  type SettingsBillingScreenProps,
  type SettingsBillingTab,
} from './pro/settings-billing.js';
export type { AffectAppearance } from './shared.js';
