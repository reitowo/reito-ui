import { useState } from 'react';
import { Heading, Inline, Stack, Text } from '../../basic/composition.js';
import { Badge } from '../../primitives/badge.js';
import { Button } from '../../primitives/button.js';
import { Input } from '../../primitives/input.js';
import { Label } from '../../primitives/label.js';
import { Progress } from '../../primitives/progress.js';
import { Switch } from '../../primitives/switch.js';
import { SegmentedControl } from '../segmented-control.js';
import { AppShell, type AppShellProps } from './app-shell.js';
import { StepperTags } from './stepper-form.js';

export type OnboardingValues = {
  workspace: string;
  slug: string;
  teamSize: string;
  tools: string[];
  invites: string[];
  role: string;
  template: string;
};
export type OnboardingScreenProps = Pick<
  AppShellProps,
  'onNavigate' | 'workspace' | 'user' | 'className'
> & {
  defaultStep?: 1 | 2 | 3 | 4;
  onComplete?: (values: OnboardingValues) => void;
};

const steps = [
  { id: 1, title: '工作区' },
  { id: 2, title: '工具' },
  { id: 3, title: '团队' },
  { id: 4, title: '第一个代理' },
];
const tools = ['日历', '文档', '议题'];
const templates = [
  { value: 'brief', title: '简报助手' },
  { value: 'review', title: '审查助手' },
  { value: 'research', title: '检索助手' },
];

/** Recreated from public Onboarding docs. Not Pro source. */
export function OnboardingScreen({
  defaultStep = 2,
  onComplete,
  onNavigate,
  workspace = 'Acme',
  user = { name: 'Alex Morgan' },
  className,
}: OnboardingScreenProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(defaultStep);
  const [values, setValues] = useState<OnboardingValues>({
    workspace,
    slug: workspace.toLowerCase().replace(/\s+/g, '-'),
    teamSize: '5-20',
    tools: ['文档'],
    invites: [],
    role: '产品',
    template: 'brief',
  });
  const first = user.name.split(/\s+/)[0] ?? user.name;

  function next() {
    if (step === 4) {
      onComplete?.(values);
      onNavigate?.('Chat');
      return;
    }
    setStep((value) => (value + 1) as 1 | 2 | 3 | 4);
  }

  return (
    <AppShell
      active="New chat"
      workspace={workspace}
      user={user}
      onNavigate={onNavigate}
      header={{ title: '开始使用' }}
      className={className}
    >
      <div className="grid gap-[var(--rui-content-gap)] p-[var(--rui-content-padding)] @lg:grid-cols-[minmax(0,1.4fr)_minmax(0,var(--rui-container-3xs))]">
        <form
          className="grid gap-[var(--rui-content-gap)] rounded-[var(--rui-radius-surface)] border border-border p-[var(--rui-content-padding)]"
          onSubmit={(event) => {
            event.preventDefault();
            next();
          }}
        >
          <Stack gap="small">
            <Heading size="item">{step === 1 ? `你好，${first}` : steps[step - 1]?.title}</Heading>
            <Progress
              value={(step / 4) * 100}
              aria-label={`第 ${step} 步，共 4 步：${steps[step - 1]?.title}`}
            />
          </Stack>
          {step === 1 ? (
            <div className="grid gap-[var(--rui-content-gap)]">
              <label className="grid gap-1">
                <Text variant="caption">工作区名称</Text>
                <Input
                  value={values.workspace}
                  onChange={(event) =>
                    setValues({
                      ...values,
                      workspace: event.target.value,
                      slug: event.target.value.toLowerCase().replace(/\s+/g, '-'),
                    })
                  }
                />
              </label>
              <label className="grid gap-1">
                <Text variant="caption">地址</Text>
                <Input
                  value={values.slug}
                  onChange={(event) => setValues({ ...values, slug: event.target.value })}
                />
              </label>
              <fieldset className="grid gap-1">
                <legend>
                  <Text variant="caption">团队规模</Text>
                </legend>
                <SegmentedControl
                  aria-label="团队规模"
                  value={values.teamSize}
                  onChange={(teamSize) => setValues({ ...values, teamSize })}
                  options={[
                    { value: '1-4', label: '1–4' },
                    { value: '5-20', label: '5–20' },
                    { value: '20+', label: '20+' },
                  ]}
                />
              </fieldset>
            </div>
          ) : null}
          {step === 2 ? (
            <ul className="grid gap-2">
              {tools.map((tool) => (
                <li key={tool} className="flex items-center justify-between">
                  <Label htmlFor={`tool-${tool}`}>{tool}</Label>
                  <Switch
                    id={`tool-${tool}`}
                    checked={values.tools.includes(tool)}
                    onCheckedChange={(checked) =>
                      setValues({
                        ...values,
                        tools:
                          checked === true
                            ? [...values.tools, tool]
                            : values.tools.filter((item) => item !== tool),
                      })
                    }
                  />
                </li>
              ))}
            </ul>
          ) : null}
          {step === 3 ? (
            <label className="grid gap-1">
              <Text variant="caption">邀请同事</Text>
              <StepperTags
                value={values.invites}
                onChange={(invites) => setValues({ ...values, invites })}
              />
            </label>
          ) : null}
          {step === 4 ? (
            <div className="grid gap-[var(--rui-content-gap)]">
              <label className="grid gap-1">
                <Text variant="caption">你的角色</Text>
                <Input
                  value={values.role}
                  onChange={(event) => setValues({ ...values, role: event.target.value })}
                />
              </label>
              <div role="radiogroup" aria-label="模板" className="grid gap-1">
                {templates.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    role="radio"
                    aria-checked={values.template === item.value}
                    className="flex items-center justify-between rounded-[var(--rui-radius)] border border-border px-2 py-1"
                    onClick={() => setValues({ ...values, template: item.value })}
                  >
                    {item.title}
                    {values.template === item.value ? (
                      <Badge variant="secondary">已选</Badge>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          <Inline className="justify-between">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => (step === 4 ? onComplete?.(values) : next())}
            >
              跳过
            </Button>
            <Button type="submit" size="sm">
              {step === 4 ? '创建代理' : '继续'}
            </Button>
          </Inline>
        </form>
        <ol className="grid gap-1 self-start">
          {steps.map((item) => (
            <li
              key={item.id}
              aria-current={item.id === step ? 'step' : undefined}
              className="flex items-center justify-between rounded-[var(--rui-radius)] px-2 py-1"
            >
              <Text variant="caption">{item.title}</Text>
              <Text variant="caption" tone="muted">
                {item.id < step ? '完成' : item.id === step ? '进行中' : '未开始'}
              </Text>
            </li>
          ))}
        </ol>
      </div>
    </AppShell>
  );
}
