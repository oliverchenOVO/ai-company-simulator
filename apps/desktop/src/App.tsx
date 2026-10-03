import { useState, type FormEvent } from 'react';
import { Building2, CalendarDays, ChartNoAxesColumnIncreasing, CircleHelp, Clock3, Mail, House, Network, Play, Save, Settings as SettingsIcon, SkipForward, Users, X, Box } from 'lucide-react';
import { Modal } from '../../../packages/ui/src/components';
import { useCompany, type Action } from './use-company';
import { useUi, type Page } from './ui-state';
import { Dashboard } from './features/dashboard';
import { People } from './features/people';
import { Customers, Finance, Product, Teams } from './features/operations';
import { Inbox, Timeline } from './features/communications';
import { Settings } from './features/settings';
import { AdvanceSummary } from './features/advance-summary';
const navigation = [
  ['Dashboard', '總覽', House], ['People', '人員', Users], ['Teams', '團隊', Network], ['Product', '產品', Box], ['Customers', '客戶', Users], ['Finance', '財務', ChartNoAxesColumnIncreasing], ['Inbox', '收件匣', Mail], ['Timeline', '時間軸', Clock3], ['Settings', '設定', SettingsIcon]
] as const;
export function App() {
  const { view, initialized, busy, error, notice,summary,dismissSummary, act, clearError } = useCompany();
  const page = useUi(s => s.page), setPage = useUi(s => s.setPage);
  const [creating, setCreating] = useState(false);
  function screen() {
    if (!view) return null;
    const props = { view, act, busy };
    switch (page) {
      case 'Dashboard': return <Dashboard view={view}/>;
      case 'People': return <People {...props}/>;
      case 'Teams': return <Teams {...props}/>;
      case 'Product': return <Product key={view.product.priority} {...props}/>;
      case 'Customers': return <Customers view={view}/>;
      case 'Finance': return <Finance view={view}/>;
      case 'Inbox': return <Inbox view={view}/>;
      case 'Timeline': return <Timeline view={view}/>;
      case 'Settings': return <Settings key={`${view.name}-${view.revision}`} {...props} newCompany={() => setCreating(true)}/>;
    }
  }
  return <div className="app-shell"><aside className="sidebar"><div className="brand"><strong>FOUNDRY</strong><span>AI Company Simulator</span></div><nav aria-label="主要導覽">{navigation.map(([id, label, Icon]) => <button key={id} className={page === id ? 'active' : ''} aria-current={page === id ? 'page' : undefined} disabled={!view} onClick={() => setPage(id as Page)}><Icon size={21} strokeWidth={1.8}/><span>{label}</span></button>)}</nav><div className="sidebar-company"><Building2 size={22}/><strong>{view?.name ?? 'Garage Startup'}</strong><small>Phase 2 · Organization Alive</small></div></aside>
    <div className="workspace"><header className="company-header"><strong>{view?.name ?? 'Garage Startup'}</strong><span className="header-subline">小團隊，也能創造大未來。</span><div className="header-actions"><span className="header-date"><CalendarDays size={19}/>{view?.date ?? '2026-01-01'}</span><button className="button primary" disabled={!view || busy} onClick={() => { void act({ action: 'save' }); }}><Save size={18}/>存檔</button></div></header>
    <main id="main-content" aria-busy={busy}><div className="notices">{error ? <div className="error-banner" role="alert"><span>{error}</span><button className="icon-button" aria-label="關閉錯誤訊息" onClick={clearError}><X size={17}/></button></div> : null}{notice ? <div className="success-banner" role="status">{notice}</div> : null}</div>
      {summary?<AdvanceSummary summary={summary} dismiss={dismissSummary}/>:null}
      {!initialized ? <div className="loading-state" role="status">正在載入公司進度…</div> : !view ? <Welcome act={act} busy={busy}/> : screen()}
    </main><footer className="time-bar"><div className="time-date"><CalendarDays size={23}/><strong>第 {view?.tick ?? 0} 天</strong><time>{view?.date ?? '2026-01-01'}</time></div><div className="time-hint"><strong>{busy ? '處理中…' : view?.bankrupt ? '營運已停止' : '時間控制'}</strong><span>讓你的決策，隨時間產生結果。</span></div><div className="time-actions"><button className="button secondary" disabled={!view || busy || view.bankrupt} onClick={() => { void act({ action: 'execute', command: { type: 'AdvanceTime', days: 1 } }); }}><Play size={17}/>推進一天</button><button className="button primary" disabled={!view || busy || view.bankrupt} onClick={() => { void act({ action: 'execute', command: { type: 'AdvanceTime', days: 7 } }); }}><SkipForward size={18}/>推進一週</button></div></footer></div>
    {creating ? <Modal title="建立新公司" onClose={() => setCreating(false)}><NewCompanyForm act={act} busy={busy} afterCreate={() => { setCreating(false); setPage('Dashboard'); }}/></Modal> : null}
  </div>;
}
function Welcome({ act, busy }: { act: Action; busy: boolean }) {
  return <section className="welcome"><div className="welcome-icon"><Building2 size={35}/></div><h1>從三個人，開始你的公司。</h1><p>你是創辦人。決定方向、照顧團隊，觀察每個決策如何改變公司的故事。</p><div className="scenario-facts"><span>NT$500,000 資金</span><span>3 位創始成員</span><span>1 個產品原型</span></div><NewCompanyForm act={act} busy={busy}/><p className="welcome-note"><CircleHelp size={16}/>離線可玩。每次決策後自動保存，重新整理即可接續進度。</p></section>;
}
function NewCompanyForm({ act, busy, afterCreate }: { act: Action; busy: boolean; afterCreate?: () => void }) {
  const [name, setName] = useState('Garage Startup'), [seed, setSeed] = useState('garage-001');
  async function submit(event: FormEvent) {
    event.preventDefault(); const response = await act({ action: 'create', config: { name, seed, scenario: 'garage' } }); if (response) afterCreate?.();
  }
  return <form className="form-grid new-company-form" onSubmit={submit}><label>公司名稱<input required maxLength={80} value={name} onChange={e => setName(e.target.value)}/></label><label>世界種子（Seed）<input required maxLength={120} value={seed} onChange={e => setSeed(e.target.value)}/><small>相同種子與決策，會得到相同的世界結果。</small></label><button className="button primary" disabled={busy || !name.trim() || !seed.trim()}>創立公司</button></form>;
}
