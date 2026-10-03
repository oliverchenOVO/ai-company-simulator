import { Component, Suspense, lazy, useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Building2, RotateCcw, Search, ArrowUpRight, Users, Info } from 'lucide-react';
import type { CompanyView } from '../../../../../packages/simulation/src/projection';
import { PageHeading, roles } from '../../../../../packages/ui/src/components';
import { useUi } from '../../ui-state';
import { projectOffice, seatPoint, type OfficeFloor, type OfficeSeat, type OfficeCue, type Overlay } from './projection';
import { Desk, Person, RoomProps } from './assets';
import { projectOfficeScene } from './scene-projection';
import './office.css';
const overlays = { normal: '日常', management: '匯報', concerns: '關切' } as const;
const activityLabels = { Working: '桌邊工作', Reading: '閱讀文件', Concerned: '已有關切', Celebrating: '近期晉升', Arriving: '近期到職', Departing: '已離開', Discussing: '近期組織討論', Moving: '近期異動' };
const activate = (e: KeyboardEvent<SVGGElement>, action: () => void) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); action(); } };
const Scene = lazy(() => import('./LivingOfficeScene'));
class GraphicsBoundary extends Component<{ children: ReactNode; failed: () => void }, { broken: boolean }> {
  state = { broken: false };
  static getDerivedStateFromError() { return { broken: true }; }
  componentDidCatch(error: Error) { console.warn('Office graphics fallback:',error.message); this.props.failed(); }
  render() { return this.state.broken ? null : this.props.children; }
}
function useMedia(query: string) {
  const [matches, set] = useState(() => window.matchMedia(query).matches);
  useEffect(() => { const media = window.matchMedia(query); const update = () => set(media.matches); media.addEventListener('change', update); return () => media.removeEventListener('change', update); }, [query]);
  return matches;
}

export default function LivingOffice({ view }: { view: CompanyView }) {
  const layout = useMemo(() => projectOffice(view), [view]);
  const history=useRef(useUi.getState().officeHistory);
  const previousScene=history.current?.name===view.name && history.current.tick<=view.tick && history.current.revision<view.revision ? history.current.scene : undefined;
  useEffect(()=>{useUi.getState().setOfficeHistory(layout.headcount<=100 ? {name:view.name,tick:view.tick,revision:view.revision,scene:projectOfficeScene(layout)} : null);},[layout,view.name,view.tick,view.revision]);
  const mobile = useMedia('(max-width: 700px)'), reduced = useMedia('(prefers-reduced-motion: reduce)');
  const [graphicsFailed, failGraphics] = useState(false), [simple, setSimple] = useState(false), [zoom, setZoom] = useState(1);
  const use3d = !mobile && layout.headcount <= 100 && !graphicsFailed && !simple;
  const [selectedId, select] = useState<string | null>(null), [floorId, focusFloor] = useState<string | null>(null), [teamId, focusTeam] = useState<string | null>(null), [overlay, setOverlay] = useState<Overlay>('normal'), [query, setQuery] = useState('');
  const navigate = useUi(s => s.setPage), selectEmployee = useUi(s => s.selectEmployee), selectEvent = useUi(s => s.selectEvent);
  const seatsById = useMemo(() => new Map(layout.seats.map(s => [s.employeeId, s])), [layout]);
  const cuesById = useMemo(() => new Map(layout.cues.map(c => [c.employeeId, c])), [layout]);
  const selected = selectedId ? seatsById.get(selectedId) : undefined;
  const employee = selected ? view.employees.find(e => e.id === selected.employeeId) : undefined;
  const team = view.teams.find(t => t.id === (teamId ?? selected?.teamId));
  const effectiveFloor = selected?.floorId ?? (floorId && layout.floors.some(f => f.id === floorId) ? floorId : layout.fidelity !== 'individual' ? layout.floors[0].id : null);
  const mobileFloor = effectiveFloor ?? selected?.floorId ?? layout.floors.at(-1)!.id;
  const matching = query.trim() ? layout.seats.filter(s => !s.vacant && s.name.toLowerCase().includes(query.trim().toLowerCase())) : [];
  function choose(id: string) { select(id); focusTeam(null); const seat = seatsById.get(id); if (seat) focusFloor(seat.floorId); }
  function details(id: string) { navigate('People'); selectEmployee(id); }
  function reset() { select(null); focusFloor(null); focusTeam(null); setQuery(''); setZoom(1); }
  return <section className="living-office" data-renderer={use3d ? '3d' : 'svg'} data-fidelity={layout.fidelity} data-small={layout.headcount <= 8} data-focus={effectiveFloor ?? 'all'}>
    <PageHeading title="辦公室" subline="看見組織如何一起工作。" action={<button className="button secondary" onClick={reset}><RotateCcw size={16}/>重置視角</button>}/>
    <div className="office-toolbar"><div className="office-overlay" role="group" aria-label="辦公室資訊圖層">{Object.entries(overlays).map(([id, text]) => <button key={id} aria-pressed={overlay === id} onClick={() => setOverlay(id as Overlay)}>{text}</button>)}</div><label className="office-search"><Search size={16}/><input aria-label="在辦公室尋找員工" placeholder="尋找同事" value={query} onChange={e => setQuery(e.target.value)}/></label><span className="office-count"><Users size={16}/>{layout.headcount} 位同事 · {layout.floors.length} 層</span></div>
    {query.trim() ? <div className="office-search-results" aria-label="辦公室搜尋結果">{matching.length ? matching.slice(0, 25).map(s => <button key={s.id} onClick={() => choose(s.employeeId)}>{s.name}</button>) : <p>找不到符合的同事。</p>}{matching.length > 25 ? <p>共 {matching.length} 位，請縮小搜尋範圍。</p> : null}</div> : null}
    <div className="office-content"><div className="office-building-panel">
      <div className="office-floor-picker" role="group" aria-label="選擇樓層">{layout.floors.map(f => <button key={f.id} aria-pressed={effectiveFloor === f.id || mobileFloor === f.id} onClick={() => { select(null); focusFloor(f.id); }}>{f.label}<small>{f.seats.filter(s => !s.vacant).length} 人</small></button>)}</div>
      <div className="office-render-controls"><button className="text-button" onClick={() => setSimple(!simple)} aria-pressed={simple}>{simple ? '開啟 3D' : '精簡視圖'}</button>{use3d ? <><button aria-label="縮小辦公室" onClick={() => setZoom(z => Math.max(.8,z-.1))}>−</button><button aria-label="放大辦公室" onClick={() => setZoom(z => Math.min(1.35,z+.1))}>＋</button></> : <span>{graphicsFailed ? '圖形無法使用，已切換備援。' : mobile ? '手機樓層視圖' : layout.headcount>100 ? '大型公司樓層視圖' : '精簡樓層視圖'}</span>}</div>
      {use3d ? <><GraphicsBoundary failed={() => failGraphics(true)}><Suspense fallback={<div className="office-3d-loading">正在準備 3D 辦公室…</div>}><Scene layout={layout} previousScene={previousScene} selected={selected} floorId={floorId} overlay={overlay} reduced={reduced} zoom={zoom} choose={choose} failed={() => failGraphics(true)}/></Suspense></GraphicsBoundary>
        <div className="office-accessible-people" aria-label="辦公室同事">{layout.seats.map(s => <button key={s.id} data-office-employee={s.employeeId} data-office-role={s.role} data-office-vacant={s.vacant} data-office-appearance={JSON.stringify(s.appearance)} aria-label={`${s.name}，${layout.floors.find(f=>f.id===s.floorId)?.label}${s.vacant ? '，空席' : ''}`} aria-pressed={selectedId===s.employeeId} onClick={()=>choose(s.employeeId)}>{s.name}<small>{s.vacant ? '空席' : s.concerns[0] ?? ''}</small></button>)}</div>
      </> : <div className="office-building" aria-label="公司建築剖面">{layout.floors.map((floor, index) => <div key={floor.id} className={`office-floor ${effectiveFloor && effectiveFloor !== floor.id ? 'is-compressed' : ''} ${mobileFloor === floor.id ? 'mobile-focused' : ''}`} data-floor={floor.id}>
        <button className="office-floor-label" onClick={() => { select(null); focusFloor(floor.id); }} aria-label={`聚焦${floor.label}`}><span>{layout.floors.length - index}F</span><strong>{floor.label}</strong><small>{floor.seats.filter(s => !s.vacant).length} 人{floor.seats.some(s => s.overloaded) ? ' · 管理負荷偏高' : ''}</small></button>
        {layout.fidelity === 'individual' || effectiveFloor === floor.id ? <div className="office-floor-art"><FloorScene floor={floor} view={view} selected={selected} overlay={overlay} cues={cuesById} animate={layout.fidelity === 'individual'} choose={choose} focusTeam={id => { focusTeam(id); select(null); }} /></div> : null}
      </div>)}</div>}
      <div className="office-mobile-people" aria-label="目前樓層同事">{layout.floors.find(f => f.id === mobileFloor)?.seats.map(s => <button key={s.id} onClick={() => choose(s.employeeId)}>{s.name}<small>{s.vacant ? '空席 · 已離職' : s.concerns[0] ?? '桌邊工作'}</small></button>)}</div>
      <p className="office-footnote"><Info size={15}/>空間與活動呈現既有組織，不增加租金或改變公司結果。{layout.fidelity !== 'individual' ? '大型組織減少動畫；樓層清單與搜尋保留所有同事。' : ''}</p>
    </div>
    <aside className="office-context" aria-label="辦公室選取資訊">{selected && employee ? <>
      <div className="office-portrait" style={{ background: `${selected.appearance.clothing}15` }}><svg viewBox="-35 -60 70 105" aria-hidden="true"><Person appearance={selected.appearance} executive={selected.role === 'executive'}/></svg></div>
      <p className="office-eyebrow">{selected.vacant ? '近期空席' : layout.floors.find(f => f.id === selected.floorId)?.label}</p><h2>{selected.name}</h2><p>{roles[employee.role]} · {employee.organization?.level ?? '歷史公司'}</p>
      <dl><dt>工作位置</dt><dd>{layout.floors.find(f=>f.id===selected.floorId)?.label} · {selected.vacant ? '近期空席' : '指定工作站'}</dd><dt>所屬團隊</dt><dd><button className="text-button" onClick={() => { focusTeam(selected.teamId); select(null); }}>{employee.teamName}</button></dd><dt>直屬主管</dt><dd>{selected.managerId && seatsById.has(selected.managerId) ? <button className="text-button" onClick={() => choose(selected.managerId!)}>{employee.managerName}</button> : employee.managerName}</dd><dt>直接部屬</dt><dd>{selected.reportIds.length} 人 · {employee.organization?.managementLoad ?? '依現有匯報安排'}</dd></dl>
      {selected.reportIds.length ? <div className="office-reports">{selected.reportIds.map(id => <button className="text-button" key={id} onClick={() => choose(id)}>{seatsById.get(id)?.name}</button>)}</div> : null}
      <div className="office-status"><strong>目前可觀察近況</strong>{selected.vacant ? <p>同事已離職，保留近期空席。</p> : selected.concerns.length ? selected.concerns.map(c => <p key={c} className="office-warning">! {c}</p>) : <p>{employee.condition}</p>}</div>
      {cuesById.get(selected.employeeId) ? <button className="office-event-link" onClick={() => { navigate('Timeline'); selectEvent(cuesById.get(selected.employeeId)!.id); }}>{cuesById.get(selected.employeeId)!.title}<ArrowUpRight size={16}/></button> : null}
      <button className="button primary" onClick={() => details(selected.employeeId)}>查看人員詳情<ArrowUpRight size={16}/></button>
    </> : team ? <><p className="office-eyebrow">團隊空間</p><h2>{team.name}</h2><p>{team.memberCount} 人 · {team.condition}</p><dl><dt>團隊主管</dt><dd>{team.managerName}</dd><dt>組織觀察</dt><dd>{team.organization?.stability ?? '歷史團隊'}<br/>{team.organization?.managementLoad}</dd></dl><div className="office-reports">{layout.seats.filter(s => s.teamId === team.id && !s.vacant).map(s => <button key={s.id} className="text-button" onClick={() => choose(s.employeeId)}>{s.name}</button>)}</div><button className="button secondary" onClick={() => navigate('Teams')}>查看團隊安排<ArrowUpRight size={16}/></button></> : <><Building2 size={30}/><p className="office-eyebrow">LIVING OFFICE</p><h2>這是你的公司。</h2><p>點選同事，查看工作位置、主管與近期回饋。</p><div className="office-guide"><p><strong>執行層</strong>方向與策略</p><p><strong>管理層</strong>匯報與支持</p><p><strong>工作層</strong>團隊與日常工作</p></div><p>切換「匯報」查看直接部屬；「關切」標示已可觀察的需要。</p><button className="text-button" onClick={() => navigate('Teams')}>文字組織與團隊<ArrowUpRight size={16}/></button></>}
    </aside></div>
    {layout.cues.length ? <details className="office-recent"><summary>近期組織活動 · {layout.cues.length} 筆</summary><p>短暫動作對應這些既有事件；會議區與走動是事件呈現，不代表另一次決策。</p>{layout.cues.map(c => <button key={c.id} className="text-button" onClick={() => { navigate('Timeline'); selectEvent(c.id); }}>{c.title}<ArrowUpRight size={14}/></button>)}</details> : null}
  </section>;
}

function FloorScene({ floor, view, selected, overlay, cues, animate, choose, focusTeam }: { floor: OfficeFloor; view: CompanyView; selected?: OfficeSeat; overlay: Overlay; cues: Map<string, OfficeCue>; animate: boolean; choose: (id: string) => void; focusTeam: (id: string) => void }) {
  const relevant = floor.seats.filter(s => !s.vacant && (overlay === 'management' || s.employeeId === selected?.employeeId || s.managerId === selected?.employeeId));
  const meeting = floor.seats.some(s => ['Discussing', 'Celebrating'].includes(cues.get(s.employeeId)?.type ?? ''));
  return <svg className="office-floor-svg" viewBox="0 0 960 295" aria-label={`${floor.label}空間`}>
    <path d="M56 247l38-30h818l-38 30Z" fill="#e5eae7"/><path d="M56 247H874v17H56Z" fill="#b8c5c9"/><path d="M874 247l38-30v17l-38 30Z" fill="#8e9fa7"/>
    <path d="M94 35H912v182H94Z" fill="#f3f3ed"/><path d="M56 64l38-29v182l-38 30Z" fill="#d7e0df"/>
    <path d="M94 35H912M56 64l38-29" stroke="#b4c3c7" strokeWidth="5"/>
    <path d="M446 25h83v218h-83Z" fill="#c6dfdd"/><path d="M446 25l22-12h82l-21 12Z" fill="#9bbfbe"/><path d="M529 25l21-12v219l-21 11Z" fill="#8bb6b7"/>
    <rect x="457" y="95" width="62" height="121" rx="2" fill="#a4ccca" stroke="#5f989a" strokeWidth="2"/><path d="M488 96v120" stroke="#669da0" strokeWidth="2"/><text x="488" y="72" textAnchor="middle" fill="#346e77" fontSize="15">電梯</text><path d="M468 223h41" stroke="#6f9a9c" strokeWidth="3"/>
    <RoomProps kind={floor.kind} meeting={meeting}/>
    {floor.teams.map((id, i) => <g key={id} role="button" tabIndex={0} aria-label={`${floor.label} ${view.teams.find(t => t.id === id)?.name} 團隊空間`} onClick={() => focusTeam(id)} onKeyDown={e => activate(e, () => focusTeam(id))} className="office-team-target"><rect x={i % 2 ? 630 : 205} y={94 + Math.floor(i / 2) * 22} width="190" height="21" rx="3" fill="#e8eeee"/><text x={i % 2 ? 725 : 300} y={109 + Math.floor(i / 2) * 22} textAnchor="middle" fontSize="13" fill="#56757d">{view.teams.find(t => t.id === id)?.name.slice(0, 18)}</text></g>)}
    {relevant.filter(s => s.managerId).map(s => {
      const p = seatPoint(s), m = floor.seats.find(m => m.employeeId === s.managerId);
      const end = m ? seatPoint(m) : { x: 488, y: 225 };
      return <path key={`line-${s.id}`} d={`M${p.x} ${p.y + 25}L${end.x} ${end.y + (m ? 25 : 0)}`} className="office-report-line"/>;
    })}
    {floor.seats.length === 0 ? <text x="280" y="175" textAnchor="middle" fill="#738891" fontSize="16">尚無此層工作位置</text> : null}
    {floor.seats.map(s => {
      const p = seatPoint(s), cue = cues.get(s.employeeId), activity = s.vacant ? 'Departing' : cue?.type ?? (s.concerns.length ? 'Concerned' : s.appearance.phase % 3 === 0 ? 'Reading' : 'Working');
      const highlight = s.employeeId === selected?.employeeId;
      return <g key={s.id} data-office-employee={s.employeeId} data-office-role={s.role} data-office-vacant={s.vacant} data-office-appearance={JSON.stringify(s.appearance)} className={`office-seat ${highlight ? 'is-selected' : ''}`} role="button" tabIndex={0} aria-label={`${s.name}，${floor.label}${s.vacant ? '，空席' : ''}`} aria-pressed={highlight} onClick={() => choose(s.employeeId)} onKeyDown={e => activate(e, () => choose(s.employeeId))}>
        <title>{s.name} · {s.vacant ? '已離職空席' : activityLabels[activity]}{s.concerns.length ? ` · ${s.concerns.join('、')}` : ''}</title>
        <rect x={p.x - 74} y={p.y - 56} width="138" height="111" rx="12" className="office-seat-hit"/>
        {highlight ? <ellipse cx={p.x - 5} cy={p.y + 35} rx="66" ry="21" fill="#71c6c1" opacity=".3"/> : null}
        <g transform={`translate(${p.x - 23} ${p.y - 11})`}>
          {!s.vacant ? <g key={`${cue?.id ?? s.id}:${activity}`} className={`office-figure ${animate && s.slot < 2 ? 'ambient' : ''} activity-${activity}`} style={{ animationDelay: `${s.appearance.phase * -.4}s` }}><Person appearance={s.appearance} executive={s.role === 'executive'} document={activity === 'Discussing' || activity === 'Moving'}/></g> : <text y="-26" fill="#71838b" fontSize="15">空席</text>}
        </g>
        <Desk x={p.x} y={p.y + 13} premium={s.role !== 'staff'} vacant={s.vacant} clutter={s.overloaded}/>
        {s.overloaded || (overlay === 'concerns' && s.concerns.length) ? <g><circle cx={p.x + 41} cy={p.y - 52} r="12" fill="#fff0d3" stroke="#bb873c"/><text x={p.x + 41} y={p.y - 47} textAnchor="middle" fontSize="16" fill="#925300">!</text></g> : null}
        {cue?.type === 'Celebrating' ? <path d={`M${p.x - 37} ${p.y - 67}l5-7 5 7m-5-7v18`} stroke="#087f83" strokeWidth="3" fill="none"/> : null}
        <text x={p.x - 5} y={p.y + 61} textAnchor="middle" className="office-name">{s.name.length > 17 ? `${s.name.slice(0, 16)}…` : s.name}</text>
        {overlay === 'management' && s.reportIds.length ? <text x={p.x - 5} y={p.y + 77} textAnchor="middle" className="office-caption">{s.reportIds.length} 位部屬{s.overloaded ? ' · 負荷偏高' : ''}</text> : null}
        {overlay === 'concerns' && s.concerns.length ? <text x={p.x - 5} y={p.y + 77} textAnchor="middle" className="office-caption warning">{s.concerns[0]}</text> : null}
      </g>;
    })}
  </svg>;
}
