import { useState } from 'react';
import type { CompanyView, EmployeeView } from '../../../../packages/simulation/src/projection';
import type { Role } from '../../../../packages/domain/src/model';
import { roles } from '../../../../packages/ui/src/components';
import type { Action } from '../use-company';
export function Career({ employee: e, view, act, busy }: { employee: EmployeeView; view: CompanyView; act: Action; busy: boolean }) {
  const [managerId, setManagerId] = useState(e.managerId ?? ''), [track, setTrack] = useState<'specialist' | 'manager'>(e.organization?.track ?? 'specialist'), [role, setRole] = useState<Role>(e.role);
  const org = e.organization;
  if (!org) return <p className="muted-copy">此公司保留歷史版本規則；新公司的職涯與管理系統使用 v3。</p>;
  const active = e.status === 'active' && !view.bankrupt;
  return <section className="career-section" aria-label="職涯與管理"><h3 className="section-title">職涯與管理</h3>
    <dl className="detail-grid"><div><dt>目前職級</dt><dd>{org.level} · {org.track === 'manager' ? '管理路徑' : '專業路徑'}</dd></div><div><dt>職涯方向</dt><dd>{org.direction}</dd></div><div><dt>近期回饋</dt><dd>{org.careerStatus}</dd></div><div><dt>晉升準備</dt><dd>{org.readiness.status}</dd></div><div><dt>主管支持</dt><dd>{org.managerSupport}</dd></div><div><dt>留任觀察</dt><dd>{org.retention}</dd></div><div><dt>管理負荷</dt><dd>{org.reportCount} 位直接部屬 · {org.managementLoad}</dd></div></dl>
    <p className="muted-copy">{org.readiness.leadership}。{org.readiness.reasons.join('；')}{org.readiness.reasons.length ? '。' : ''}管理需要投入時間，會減少個人專業產出；晉升會提高薪資期待，實際月薪另行調整。</p>
    {active && org.readiness.eligible ? <p className="muted-copy" aria-label="晉升影響說明">{track === 'manager' ? '管理路徑會減少個人專業工作時間，不會自動增加管理能力或安排部屬。若同事希望帶領團隊，還需安排實際匯報責任。' : '專業路徑保留個人專業工作的時間；不會自動安排管理責任。若同事希望帶領團隊，專業晉升未必符合其目標。'}回饋會逐步變化，請對照後續職涯與工作紀錄。</p> : null}
    {active ? <div className="employee-controls">
      <form onSubmit={event=>{event.preventDefault();void act({action:'execute',command:{type:'AssignManager',employeeId:e.id,managerId:managerId||null}});}}><label>直屬主管<select aria-label="直屬主管" value={managerId} onChange={event=>setManagerId(event.target.value)}><option value="">暫不指派</option>{view.employees.filter(p=>p.status==='active'&&p.id!==e.id).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label><button className="button secondary" disabled={busy}>儲存主管</button></form>
      {org.readiness.eligible ? <form onSubmit={event=>{event.preventDefault();void act({action:'execute',command:{type:'PromoteEmployee',employeeId:e.id,track}});}}><label>晉升路徑<select aria-label="晉升路徑" value={track} onChange={event=>setTrack(event.target.value as typeof track)}><option value="specialist">專業路徑</option><option value="manager">管理路徑</option></select></label><button className="button primary" disabled={busy}>晉升一級</button></form> : null}
      {e.role!=='CEO'&&e.role!=='CTO'?<form onSubmit={event=>{event.preventDefault();void act({action:'execute',command:{type:'ChangeEmployeeRole',employeeId:e.id,role:role as Exclude<Role, 'CEO' | 'CTO'>}});}}><label>工作職務<select aria-label="工作職務" value={role} onChange={event=>setRole(event.target.value as Role)}>{Object.entries(roles).filter(([key])=>key!=='CEO'&&key!=='CTO').map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label><button className="button secondary" disabled={busy||role===e.role}>儲存職務</button></form>:null}
    </div>:null}
    <h3 className="section-title">合作關係</h3><ul className="simple-events">{org.relationships.map(r=><li key={r.targetId}><strong>{r.name}</strong><span>{r.status}</span></li>)}</ul>{!org.relationships.length?<p className="muted-copy">尚無可觀察合作紀錄。</p>:null}
  </section>;
}
