import { Chart, type ChartProps, type ChartRow } from './chart.js';
export const chartDemoData: ChartRow[] = [
  {id:'mon',label:'周一',values:{done:24,pending:8}},
  {id:'tue',label:'周二',values:{done:32,pending:12}},
  {id:'wed',label:'周三',values:{done:18,pending:null}},
  {id:'thu',label:'周四',values:{done:40,pending:6}},
];
export function ChartDemo(props:Partial<ChartProps>) {
  const polar=props.kind==='pie'||props.kind==='donut';
  return <Chart label="本地任务统计" data={chartDemoData} series={polar?[{key:'done',label:'已完成'}]:[{key:'done',label:'已完成'},{key:'pending',label:'待处理',tone:'warning'}]} {...props} />;
}
