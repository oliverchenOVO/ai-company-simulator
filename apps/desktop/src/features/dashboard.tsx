import { Activity, TriangleAlert } from 'lucide-react';
import type { CompanyView } from '../../../../packages/simulation/src/projection';
import { Avatar, Condition, LinkButton, PageHeading, Panel, Progress, money, roles } from '../../../../packages/ui/src/components';
import { useUi } from '../ui-state';
export function Dashboard({ view }: { view: CompanyView }) {
  const setPage = useUi(s => s.setPage), selectEmployee = useUi(s => s.selectEmployee);
  const employees = view.employees.filter(e => e.status === 'active').slice(0, 5);
  return <><PageHeading title="公司總覽" subline="下一個篇章，從你的團隊開始。" />
    <div className="metric-band"><div><span>現金</span><strong className="teal">{money(view.finance.cash)}</strong><small>跑道 {view.finance.runway === null ? '現金流已自給' : `${view.finance.runway.toFixed(1)} 個月（估計）`}</small></div><div><span>月合約收入</span><strong>{money(view.finance.revenue)}</strong><small>{view.customerCount} 位訂閱客戶</small></div><div><span>每月淨支出</span><strong>{money(view.finance.burn)}</strong><small>薪資、營運成本減去合約收入</small></div><div><span>團隊</span><strong>{view.headcount} 人</strong><small>一起打造下一步</small></div></div>
    <div className="dashboard-columns"><Panel title="產品開發" action={<LinkButton onClick={() => setPage('Product')}>查看產品</LinkButton>}>
      <div className="product-summary"><h3>Atlas</h3><p>為團隊打造的 AI 工作空間。</p><Progress value={view.product.progress} label="產品開發進度"/><small>{view.product.launchedAt === null ? '原型開發中' : '已上市 · 持續改善產品'}</small></div>
      <div className="panel-heading inner"><h2>團隊（{view.headcount}）</h2><LinkButton onClick={() => setPage('People')}>管理人員</LinkButton></div>
      <div className="table-wrap"><table><thead><tr><th>姓名</th><th>職務</th><th>近況</th></tr></thead><tbody>{employees.map(e => <tr key={e.id}><td><button className="person-button" onClick={() => { setPage('People'); selectEmployee(e.id); }}><Avatar name={e.name}/>{e.name}</button></td><td>{roles[e.role]}<small className="cell-note">{e.teamName}</small></td><td><Condition text={e.condition}/></td></tr>)}</tbody></table></div>
    </Panel><Panel title="公司脈動" action={<Activity size={20} aria-hidden="true"/>}>
      {view.alerts.map(a => <div className={`alert-card ${a.severity}`} key={a.title}><TriangleAlert size={20} aria-hidden="true"/><div><h3>{a.title}</h3><p>{a.body}</p>{a.severity!=='info'?<LinkButton onClick={()=>setPage(a.title.includes('團隊')?'People':a.title.includes('客戶')?'Customers':a.title.includes('營收')?'Product':'Finance')}>檢視與處理</LinkButton>:null}</div></div>)}
      <div className="panel-heading inner"><h2>近期動態</h2><LinkButton onClick={() => setPage('Timeline')}>時間軸</LinkButton></div>
      <ol className="activity-list">{view.events.slice(-4).reverse().map(e => <li key={e.id}><div><strong>{e.title}</strong><time>{e.date}</time></div><p>{e.body}</p></li>)}</ol>
    </Panel></div></>;
}
