import {
  Button,
  Panel,
  ReitoThemeProvider,
  SelectInput,
  Stack,
  Text,
  Theme,
  createTheme,
} from '@reito/ui/basic';

const base = createTheme({
  colors: { primary: 'violet', neutral: 'zinc' },
  density: 'dense',
  tokens: { components: { button: { radius: '10px' } } },
  defaults: { Button: { variant: 'outline' } },
});
const product = createTheme(base, {
  density: 'comfortable',
  tokens: { components: { button: { height: '40px' } } },
});

export function ThemeApiDemo() {
  return (
    <ReitoThemeProvider root mode="light" theme={product}>
      <Stack inset>
        <Button data-testid="root-default">全局默认</Button>
        <Button data-testid="root-explicit" variant="default">显式主操作</Button>
        <Theme
          mode="dark"
          colors={{ primary: 'rose' }}
          defaults={{
            Button: { variant: 'secondary', size: 'sm' },
            Panel: { flush: true },
            SelectInput: { placeholder: '选择范围' },
          }}
        >
          <div data-testid="local-scope">
            <Panel title="局部主题">
              <Stack inset>
                <Button data-testid="local-default">局部默认</Button>
                <Button data-testid="local-explicit" variant="ghost">
                  显式 ghost
                </Button>
                <SelectInput
                  aria-label="局部范围"
                  options={[
                    { value: 'all', label: '全部会话' },
                    { value: 'mine', label: '我的会话' },
                  ]}
                />
                <Text>局部作用域只影响子树。</Text>
              </Stack>
            </Panel>
            <Panel title="显式内距" flush={false}>
              <Text>显式 flush 优先于主题默认。</Text>
            </Panel>
          </div>
        </Theme>
      </Stack>
    </ReitoThemeProvider>
  );
}
