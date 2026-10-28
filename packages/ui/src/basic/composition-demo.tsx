import { useId, useState } from 'react';
import { Stack, Inline, Grid, Text, Heading, Page, Panel } from './composition.js';
import {
  DashboardGroup,
  DashboardSidebar,
  DashboardSidebarHeader,
  DashboardSidebarContent,
  DashboardSidebarFooter,
  DashboardPanel,
  DashboardNavbar,
  DashboardNavigationMenu,
} from './dashboard.js';
import { Button } from '../primitives/button.js';
import { Input } from '../primitives/input.js';
import { Field, FieldLabel } from '../primitives/field.js';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '../primitives/empty.js';
import { ItemGroup, Item, ItemContent, ItemActions, ItemSeparator } from '../primitives/item.js';
import { SelectInput } from './select-input.js';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../primitives/tabs.js';
import { ReitoThemeProvider, type DensityMode, type ThemeMode } from '../theme.js';

/** Public components only: this recipe also runs against the packed library without application CSS. */
export function CompositionDemo({
  mode,
  density,
  customized = false,
}: { mode?: ThemeMode; density?: DensityMode; customized?: boolean } = {}) {
  const inputId = useId();
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState('');
  const [searched, setSearched] = useState(false);
  return (
    <ReitoThemeProvider
      mode={mode}
      density={density}
      tokens={
        customized
          ? {
              semantic: {
                'content-padding': 'var(--rui-space-5)',
                'radius-surface': 'var(--rui-radius-lg)',
              },
            }
          : undefined
      }
    >
      <Page
        inset
        aria-label="积木组合示例"
        title="消息工作台"
        description="查询消息、查看上下文并跟进处理。"
        actions={<Button>新增规则</Button>}
      >
        <Panel title="筛选消息">
          <Inline align="end">
            <Field>
              <FieldLabel htmlFor={inputId}>消息内容</FieldLabel>
              <Input
                id={inputId}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`${inputId}-scope`}>范围</FieldLabel>
              <SelectInput
                id={`${inputId}-scope`}
                value={scope}
                onValueChange={setScope}
                options={[
                  { value: '', label: '全部会话' },
                  { value: 'mine', label: '我的会话' },
                ]}
              />
            </Field>
            <Button onClick={() => setSearched(true)}>查询</Button>
          </Inline>
          {searched && (
            <Text variant="caption" tone="muted">
              已应用本地查询：{query || '全部内容'}
            </Text>
          )}
        </Panel>
        <Grid>
          <Panel title="消息记录" flush footer={<Button variant="outline">加载更多</Button>}>
            <ItemGroup>
              <Item>
                <ItemContent>
                  <Inline align="baseline">
                    <Heading level={3} size="item">
                      李明
                    </Heading>
                    <Text as="span" variant="caption" tone="muted">
                      14:30
                    </Text>
                  </Inline>
                  <Text>这是一条保留完整上下文的消息。正文跟随统一文字角色。</Text>
                  <ItemActions>
                    <Button variant="link" size="sm">
                      查看上下文
                    </Button>
                    <Button variant="link" size="sm">
                      处理链路
                    </Button>
                  </ItemActions>
                </ItemContent>
              </Item>
              <ItemSeparator />
              <Item>
                <ItemContent>
                  <Inline align="baseline">
                    <Heading level={3} size="item">
                      王静
                    </Heading>
                    <Text as="span" variant="caption" tone="muted">
                      14:35
                    </Text>
                  </Inline>
                  <Text>图片</Text>
                </ItemContent>
              </Item>
            </ItemGroup>
          </Panel>
          <Panel title="最近告警" flush>
            <Empty>
              <EmptyHeader>
                <EmptyTitle>暂无告警</EmptyTitle>
                <EmptyDescription>检查发现异常后，处理状态会显示在这里。</EmptyDescription>
              </EmptyHeader>
            </Empty>
          </Panel>
        </Grid>
      </Page>
    </ReitoThemeProvider>
  );
}

/** Page title, tabs and panel content share library spacing without an application stylesheet. */
export function PageTabsDemo({
  variant = 'line',
  orientation = 'horizontal',
}: { variant?: 'default' | 'line'; orientation?: 'horizontal' | 'vertical' } = {}) {
  const id = useId();
  const [draft, setDraft] = useState('');
  const tierDraftId = useId();
  return (
    <Page inset title="模型权限申请" aria-label="页签页面示例">
      <Tabs defaultValue="requests" orientation={orientation}>
        <TabsList variant={variant} aria-label="模型权限管理">
          <TabsTrigger value="requests">申请记录</TabsTrigger>
          <TabsTrigger value="tiers">权限档位</TabsTrigger>
          <TabsTrigger value="history">包含较长名称与完整审批信息的历史申请记录</TabsTrigger>
          <TabsTrigger value="disabled" disabled>
            停用功能
          </TabsTrigger>
        </TabsList>
        <TabsContent value="requests" keepMounted>
          <Panel title="申请记录">
            <Field>
              <FieldLabel htmlFor={id}>用途草稿</FieldLabel>
              <Input id={id} value={draft} onChange={(event) => setDraft(event.target.value)} />
            </Field>
          </Panel>
        </TabsContent>
        <TabsContent value="tiers">
          <Panel title="权限档位" flush>
            <Empty>
              <EmptyHeader>
                <EmptyTitle>暂无权限档位</EmptyTitle>
              </EmptyHeader>
            </Empty>
          </Panel>
        </TabsContent>
        <TabsContent value="history">
          <Panel title="历史申请" flush>
            <Empty>
              <EmptyHeader>
                <EmptyTitle>暂无历史申请</EmptyTitle>
              </EmptyHeader>
            </Empty>
          </Panel>
        </TabsContent>
      </Tabs>
    </Page>
  );
}

/** Described pages use the same header-to-body spacing as pages with tabs and no subtitle. */
export function KnowledgePageDemo() {
  const id = useId();
  return (
    <Page
      inset
      title="知识库"
      description="检索已发布内容，管理知识来源与审核"
      aria-label="内容页面示例"
    >
      <Panel title="检索知识">
        <Field>
          <FieldLabel htmlFor={id}>检索内容</FieldLabel>
          <Input id={id} />
        </Field>
      </Panel>
      <Grid>
        <Panel title="内容与审核" flush>
          <Empty>
            <EmptyHeader>
              <EmptyTitle>暂无知识内容</EmptyTitle>
            </EmptyHeader>
          </Empty>
        </Panel>
        <Panel title="知识来源" flush>
          <Empty>
            <EmptyHeader>
              <EmptyTitle>暂无知识来源</EmptyTitle>
            </EmptyHeader>
          </Empty>
        </Panel>
      </Grid>
    </Page>
  );
}

/** Region slots use the same defaults as shorthand pages; the demo state is local and sends no commands. */
export function RegionPageDemo({
  page = 'requests',
  state = 'empty',
}: {
  page?: 'requests' | 'admissions';
  state?: 'empty' | 'loading' | 'error' | 'records';
} = {}) {
  const [draft, setDraft] = useState('');
  const tierDraftId = useId();
  const title = page === 'requests' ? '模型权限申请' : '消息接纳';
  const body =
    state === 'loading' ? (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>正在读取记录…</EmptyTitle>
        </EmptyHeader>
      </Empty>
    ) : state === 'error' ? (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>读取失败</EmptyTitle>
          <EmptyDescription>暂时无法取得记录，请稍后重试。</EmptyDescription>
        </EmptyHeader>
      </Empty>
    ) : state === 'records' ? (
      <ItemGroup>
        <Item>
          <ItemContent>
            <Inline align="baseline">
              <Heading level={3} size="item">
                张晓明
              </Heading>
              <Text as="span" variant="caption" tone="muted">
                2026/10/27 17:11
              </Text>
            </Inline>
            <Text>请协助处理这个问题，保留原对话上下文。</Text>
          </ItemContent>
          <ItemActions>
            <Button variant="outline">查看上下文</Button>
          </ItemActions>
        </Item>
      </ItemGroup>
    ) : (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>{page === 'requests' ? '暂无申请' : '暂无待查看消息'}</EmptyTitle>
          <EmptyDescription>收到新记录后，会在这里展示状态和后续处理进度。</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  const records = (
    <Panel flush>
      <Panel.Header
        title={page === 'requests' ? '申请记录' : '接纳记录'}
        actions={<Button variant="outline">刷新记录</Button>}
      />
      <Panel.Content>{body}</Panel.Content>
      <Panel.Footer>
        <Text variant="caption" tone="muted">
          本地展示示例，不执行真实业务操作。
        </Text>
      </Panel.Footer>
    </Panel>
  );
  return (
    <Page inset aria-label="区域页面示例">
      <Page.Header title={title} description="查看归属与处理进度，操作保留在相关记录旁。" />
      <Page.Content>
        {page === 'requests' ? (
          <Tabs defaultValue="requests">
            <TabsList aria-label="模型权限管理">
              <TabsTrigger value="requests">申请记录</TabsTrigger>
              <TabsTrigger value="tiers">权限档位</TabsTrigger>
            </TabsList>
            <TabsContent value="requests" keepMounted>
              {records}
            </TabsContent>
            <TabsContent value="tiers" keepMounted>
              <Panel>
                <Panel.Header title="权限档位" />
                <Panel.Content>
                  <Field>
                    <FieldLabel htmlFor={tierDraftId}>档位名称草稿</FieldLabel>
                    <Input
                      id={tierDraftId}
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                    />
                  </Field>
                </Panel.Content>
              </Panel>
            </TabsContent>
          </Tabs>
        ) : (
          <>
            <Inline>
              <Text variant="caption" tone="muted">
                当前记录 {state === 'records' ? 1 : 0}
              </Text>
              <Text variant="caption" tone="muted">
                可接纳 {state === 'records' ? 1 : 0}
              </Text>
            </Inline>
            {records}
          </>
        )}
      </Page.Content>
    </Page>
  );
}

/** Dashboard owns navigation and scrolling; Page and Panel own their content geometry. */
export function DashboardDemo({ bounded = false }: { bounded?: boolean }) {
  const [page, setPage] = useState<'requests' | 'admissions'>('requests');
  return (
    <DashboardGroup
      persistOpen={false}
      style={
        bounded
          ? { width: 'var(--rui-container-sm)', height: 'var(--rui-container-xl)' }
          : undefined
      }
    >
      <DashboardSidebar>
        <DashboardSidebarHeader>
          <Heading size="item">运营工作台</Heading>
        </DashboardSidebarHeader>
        <DashboardSidebarContent>
          <DashboardNavigationMenu
            groups={[
              {
                label: '工作台',
                items: [
                  { label: '权限申请', href: '#requests', active: page === 'requests' },
                  { label: '消息接纳', href: '#admissions', active: page === 'admissions' },
                ],
              },
            ]}
            onNavigate={(item, event) => {
              event.preventDefault();
              setPage(item.href === '#admissions' ? 'admissions' : 'requests');
            }}
          />
        </DashboardSidebarContent>
        <DashboardSidebarFooter>
          <Text variant="caption">本地示例身份</Text>
        </DashboardSidebarFooter>
      </DashboardSidebar>
      <DashboardPanel
        header={<DashboardNavbar title={page === 'requests' ? '权限申请' : '消息接纳'} />}
      >
        <RegionPageDemo page={page} />
      </DashboardPanel>
    </DashboardGroup>
  );
}
