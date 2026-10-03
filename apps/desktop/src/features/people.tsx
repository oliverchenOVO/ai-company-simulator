import { useState, type FormEvent } from 'react';
import { Career } from './career';
import { Plus, Search } from 'lucide-react';
import type { CompanyView, EmployeeView } from '../../../../packages/simulation/src/projection';
import type { Role } from '../../../../packages/domain/src/model';
import { Avatar, Condition, Empty, Modal, PageHeading, Pager, Panel, money, roles } from '../../../../packages/ui/src/components';
import type { Action } from '../use-company';
import { useUi } from '../ui-state';
export function People({ view, act, busy }: { view: CompanyView; act: Action; busy: boolean }) {
  const [hiring, setHiring] = useState(false), [query, setQuery] = useState(''), [showFormer, setShowFormer] = useState(false), [page, setPage] = useState(0);
  const selected = useUi(s => s.selectedEmployee), selectEmployee = useUi(s => s.selectEmployee);
  const filtered = view.employees.filter(e => (showFormer || e.status === 'active') && `${e.name} ${roles[e.role]}`.toLowerCase().includes(query.toLowerCase()));
  const employee = view.employees.find(e => e.id === selected);
  return <><PageHeading title="人員" subline="每個人都有自己的期待，從觀察與決策開始。" action={<button className="button primary" disabled={busy || view.bankrupt} onClick={() => setHiring(true)}><Plus size={18}/>招募員工</button>}/>
    <Panel><div className="table-toolbar"><label className="search"><Search size={18}/><input aria-label="搜尋員工" placeholder="搜尋姓名或職務" value={query} onChange={e => { setQuery(e.target.value); setPage(0); }}/></label><label className="checkbox"><input type="checkbox" checked={showFormer} onChange={e => { setShowFormer(e.target.checked); setPage(0); }}/>包含離職員工</label><span>{filtered.length} 位員工</span></div>
    {filtered.length ? <div className="table-wrap"><table><thead><tr><th>姓名</th><th>職務 / 團隊</th><th>月薪</th><th>任職天數</th><th>近況</th></tr></thead><tbody>{filtered.slice(page * 25, page * 25 + 25).map(e => <tr key={e.id}><td><button className="person-button" onClick={() => selectEmployee(e.id)}><Avatar name={e.name}/>{e.name}</button></td><td>{roles[e.role]}<small className="cell-note">{e.teamName}</small></td><td>{money(e.salary)}</td><td>{e.tenureDays} 天</td><td><Condition text={e.condition}/></td></tr>)}</tbody></table></div> : <Empty title="沒有符合條件的員工" body="試試其他姓名，或包含離職員工。"/>}
    <Pager page={page} total={filtered.length} onChange={setPage}/></Panel>
    {hiring ? <HireDialog view={view} act={act} busy={busy} close={() => setHiring(false)}/> : null}
    {employee ? <EmployeeDialog employee={employee} view={view} act={act} busy={busy} close={() => selectEmployee(null)}/> : null}
  </>;
}
function HireDialog({ view, act, busy, close }: { view: CompanyView; act: Action; busy: boolean; close: () => void }) {
  const [name, setName] = useState(''), [role, setRole] = useState<Role>('Engineer'), [salary, setSalary] = useState('35000'), [teamId, setTeamId] = useState(view.teams[0].id), [rejection,setRejection]=useState('');
  const candidate=view.recruitment.find(c=>c.role===role);
  async function submit(event: FormEvent) { event.preventDefault(); const response = await act({ action: 'execute', command: { type: 'HireEmployee', name, role: role as Exclude<Role, 'CEO'>, salary: Math.round(Number(salary) * 100), teamId } }); if (response?.recruitment?.accepted) close(); else if(response) setRejection(response.notice??'候選人婉拒出價'); }
  return <Modal title="招募新夥伴" onClose={close}><p className="form-intro">薪資與團隊安排會影響新夥伴的工作與期待。招聘沒有一次性費用，但到職後即累積薪資；增加人力不保證按比例增加新客戶。</p>{candidate?<p className="muted-copy">{rejection?'下一位候選人':'候選人'}相關技能：{candidate.skill} / 100 · 期待月薪：{money(candidate.expectation)} · 最低接受額：{money(Math.ceil(candidate.minimum/100)*100)}。{Math.round(Number(salary)*100)<candidate.minimum?'出價低於候選人可接受範圍。':'出價符合可接受範圍。'}</p>:<p className="muted-copy">此公司使用舊版 v1 招聘規則；新公司採用獨立候選人薪資期待。</p>}{rejection?<p role="status" className="muted-copy">上一筆出價結果：{rejection}</p>:null}<CostPreview view={view} delta={Math.round(Number(salary)*100)}/><form onSubmit={submit} className="form-grid"><label>姓名<input autoFocus required maxLength={80} value={name} onChange={e => setName(e.target.value)}/></label><label>職務<select value={role} onChange={e => setRole(e.target.value as Role)}>{Object.entries(roles).filter(([key]) => key !== 'CEO').map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><label>月薪（NT$）<input type="number" required min="0" max="1000000" step="1" value={salary} onChange={e => setSalary(e.target.value)}/></label><label>所屬團隊<select aria-label="調動團隊" value={teamId} onChange={e => setTeamId(e.target.value)}>{view.teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></label><div className="form-actions"><button type="button" className="button secondary" onClick={close}>取消</button><button className="button primary" disabled={busy || !name.trim()}>確認招募</button></div></form></Modal>;
}
function EmployeeDialog({ employee: e, view, act, busy, close }: { employee: EmployeeView; view: CompanyView; act: Action; busy: boolean; close: () => void }) {
  const navigate=useUi(s=>s.setPage),selectEvent=useUi(s=>s.selectEvent);
  const [salary, setSalary] = useState(String(e.salary / 100)), [teamId, setTeamId] = useState(e.teamId), [confirmFire, setConfirmFire] = useState(false);
  const active = e.status === 'active' && !view.bankrupt;
  const events = view.events.filter(evt => evt.employeeId === e.id).slice(-6).reverse();
  return <Modal title={e.name} onClose={close}><div className="employee-heading"><Avatar name={e.name}/><div><p>{roles[e.role]} · {e.teamName}</p><Condition text={e.condition}/></div></div><dl className="detail-grid"><div><dt>任職時間</dt><dd>{e.tenureDays} 天</dd></div><div><dt>主管</dt><dd>{e.managerName}</dd></div><div><dt>工作表現</dt><dd>{e.performance >= 70 ? '良好' : e.performance >= 45 ? '符合期待' : '需要支持'}</dd></div><div><dt>月薪</dt><dd>{money(e.salary)}</dd></div><div><dt>薪資期待</dt><dd>{money(e.expectedSalary)}</dd></div></dl>
    {active ? <div className="employee-controls"><form onSubmit={event => { event.preventDefault(); void act({ action: 'execute', command: { type: 'ChangeSalary', employeeId: e.id, salary: Math.round(Number(salary) * 100) } }); }}><label>調整月薪（NT$）<input type="number" min="0" max="1000000" step="1" required value={salary} onChange={event => setSalary(event.target.value)}/></label><button className="button secondary" disabled={busy}>儲存薪資</button></form><form onSubmit={event => { event.preventDefault(); void act({ action: 'execute', command: { type: 'MoveEmployeeToTeam', employeeId: e.id, teamId } }); }}><label>調動團隊<select aria-label="調動團隊" value={teamId} onChange={event => setTeamId(event.target.value)}>{view.teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></label><button className="button secondary" disabled={busy}>確認調動</button></form></div> : null}
    {active?<><CostPreview view={view} delta={Math.round(Number(salary)*100)-e.salary}/><p className="muted-copy">{e.minimumAcceptedSalary!==null?`此員工最低接受月薪 ${money(Math.ceil(e.minimumAcceptedSalary/100)*100)}；更低的降薪提案會被拒絕，原薪資維持。`:'此公司保留舊版薪資規則。'}提高薪資會增加固定支出；可接受範圍內降薪仍可能引起不滿。疲勞需要時間恢復，調薪不能取代降低工作負荷。</p></>:null}
    <Career key={e.id} employee={e} view={view} act={act} busy={busy}/>
    <h3 className="section-title">近期可觀察事件</h3>{events.length ? <ul className="simple-events">{events.map(evt => <li key={evt.id}><time>{evt.date}</time><span>{evt.title} — {evt.body}<button className="text-button" onClick={()=>{close();navigate('Timeline');selectEvent(evt.id);}}>查看這筆事件的原因</button></span></li>)}</ul> : <p className="muted-copy">尚無個人人事事件。推進時間後，留意同事的回饋。</p>}
    {active && e.role !== 'CEO' ? <div className="danger-zone">{confirmFire ? <><p>確定要解僱 {e.name}？決策會立即生效。</p><button className="button danger" disabled={busy} onClick={() => { void act({ action: 'execute', command: { type: 'FireEmployee', employeeId: e.id } }).then(response => { if (response) close(); }); }}>確認解僱</button><button className="button secondary" onClick={() => setConfirmFire(false)}>取消</button></> : <button className="button danger-outline" disabled={busy} onClick={() => setConfirmFire(true)}>解僱員工</button>}</div> : null}
  </Modal>;
}
function CostPreview({view,delta}:{view:CompanyView;delta:number}){
  if(!Number.isFinite(delta))return null;
  const burn=view.finance.burn+delta,runway=burn<=0?'目前合約可覆蓋支出':`${Math.max(0,view.finance.cash/burn).toFixed(1)} 個月`;
  return <p className="cost-preview">調整後每月薪資：{money(view.finance.payroll+delta)} · 估計跑道：{runway}（合約與其他支出不變）</p>;
}
