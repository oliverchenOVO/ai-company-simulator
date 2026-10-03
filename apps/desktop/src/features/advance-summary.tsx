import type { AdvanceSummary as Summary } from '../../../../packages/simulation/src/decision-support';
import { money,Panel } from '../../../../packages/ui/src/components';
import { useUi } from '../ui-state';
export function AdvanceSummary({summary:s,dismiss}:{summary:Summary;dismiss:()=>void}){
  const navigate=useUi(state=>state.setPage),select=useUi(state=>state.selectEvent);
  const signed=(n:number)=>`${n>0?'+':''}${money(n)}`;
  return <div className="advance-summary" aria-label="時間推進摘要" role="region"><Panel title={`這 ${s.days} 天發生了什麼？`} action={<button className="text-button" onClick={dismiss}>收起摘要</button>}>
    <p className="muted-copy">{s.from} → {s.to}</p><p className="summary-values">現金 {signed(s.cashChange)} · 月合約收入 {signed(s.mrrChange)} · 新客戶 {s.acquired} / 流失 {s.churned} · 人數 {s.headcountChange>0?'+':''}{s.headcountChange} · 開發進度 +{s.productChange}%</p>
    {s.events.length?<ul className="simple-events">{s.events.map(e=><li key={e.id}><time>{e.date}</time><button className="text-button" onClick={()=>{navigate('Timeline');select(e.id);}}>{e.title} · 查看原因</button></li>)}</ul>:<p className="muted-copy">這段期間沒有重大事件；日常工作仍在累積。現金通常在月結時才變動。</p>}
    {s.warnings.length?<p className="summary-warning">目前需注意：{s.warnings.map(w=>w.title).join('；')}</p>:null}
  </Panel></div>;
}
