import { ArrowRight, Check } from 'lucide-react';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, ReitoThemeProvider, TooltipProvider } from '@reito/ui';
import { sitePath } from '../../routes';
import { exampleDensityTokens, useExamplePrefs } from '../prefs';
import '../../home.css';

const features = [
  { title: '工作台', body: '统计、收件箱和客户表放在同一侧栏里，页面之间不用重新找入口。' },
  { title: '收件箱', body: '列表和正文并排。回复写在这封信下面，发出去只改本地示例。' },
  { title: '客户', body: '搜索、按状态筛选、翻页。席位和方案是写在页面里的数字。' },
  { title: '设置', body: '资料、通知和外观分在页签里。密度和深浅跟着这一台浏览器走。' },
];

const plans = [
  { name: '免费', price: '¥0', points: ['3 个席位', '收件箱', '社区支持'] },
  { name: '专业', price: '¥49', points: ['20 个席位', '客户表筛选', '导出'] },
  { name: '团队', price: '¥129', points: ['不限席位', '通知面板', '优先回复'] },
];

export function Landing() {
  const { theme, density } = useExamplePrefs('岸灯 · 落地页');
  return (
    <ReitoThemeProvider root mode={theme} density={density} tokens={exampleDensityTokens(density)}>
      <TooltipProvider>
        <div className="reito-root home-page min-h-dvh">
          <header className="home-header">
            <a href={sitePath('templates')} className="home-logo">岸灯</a>
            <nav aria-label="落地页" className="order-last w-full justify-center sm:order-none sm:w-auto">
              <a href="#features">功能</a>
              <a href="#pricing">价格</a>
              <a href={sitePath('templates/dashboard/home')}>打开工作台</a>
            </nav>
            <Button nativeButton={false} variant="outline" size="sm" render={<a href={sitePath('templates')} />}>返回示例</Button>
          </header>
          <main>
            <section className="home-hero">
              <h1 className="text-3xl sm:text-[length:calc(var(--rui-font-display)*2)]">把客户和邮件<br /><span className="text-muted-foreground">放在同一张桌子上。</span></h1>
              <p>岸灯是一个虚构的工作台产品，用来展示 Reito UI 在落地页上的排版。没有注册，也没有账单。</p>
              <div className="home-hero-actions">
                <Button size="xl" nativeButton={false} render={<a href="#pricing" />}>查看价格<ArrowRight /></Button>
                <Button size="xl" variant="outline" nativeButton={false} render={<a href={sitePath('templates/dashboard/home')} />}>打开工作台</Button>
              </div>
            </section>
            <section id="features" className="home-section home-container">
              <div className="home-section-heading">
                <h2>四块日常工作。</h2>
                <p>侧栏、表格、页签和通知都来自同一套组件，不另画一套营销控件。</p>
              </div>
              <div className="home-layer-grid">
                {features.map((item) => (
                  <article className="home-layer" key={item.title}>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </article>
                ))}
              </div>
            </section>
            <section id="pricing" className="home-section home-container">
              <div className="home-section-heading">
                <h2>价格写在页面上。</h2>
                <p>三档方案只为排版。按钮不会创建订阅。</p>
              </div>
              <div className="grid gap-[var(--rui-content-gap)] md:grid-cols-3">
                {plans.map((plan) => (
                  <Card key={plan.name}>
                    <CardHeader>
                      <CardDescription>{plan.name}</CardDescription>
                      <CardTitle>{plan.price}<span className="text-sm font-normal text-muted-foreground"> / 月</span></CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3">
                      <ul className="grid gap-2 text-sm">
                        {plan.points.map((point) => <li key={point} className="flex items-center gap-2"><Check className="size-[var(--rui-icon-size)]" />{point}</li>)}
                      </ul>
                      <Button variant={plan.name === '专业' ? 'default' : 'outline'}>选择{plan.name}</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </main>
          <footer className="home-footer home-container">
            <span>岸灯 · 落地页示例</span>
            <a href={sitePath('templates')}>返回示例</a>
          </footer>
        </div>
      </TooltipProvider>
    </ReitoThemeProvider>
  );
}
