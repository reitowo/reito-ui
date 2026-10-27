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
export type { AffectAppearance } from './shared.js';
