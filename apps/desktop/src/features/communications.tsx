import { useState } from 'react';
import { ArrowRight, Mail } from 'lucide-react';
import type { CompanyView, EventView } from '../../../../packages/simulation/src/projection';
import { Empty, PageHeading, Pager, Panel } from '../../../../packages/ui/src/components';
import { useUi } from '../ui-state';
export function Inbox({ view }: { view: CompanyView }) {
  const [channel, setChannel] = useState('全部'), [page, setPage] = useState(0);
  const navigate = useUi(s => s.setPage), selectEvent = useUi(s => s.selectEvent);
  const messages = view.messages.filter(m => channel === '全部' || m.channel === channel).slice().reverse();
  return <><PageHeading title="收件匣" subline="來自人事、產品、客戶與財務的實際觀察。"/><Panel><div className="table-toolbar"><div className="tabs" aria-label="訊息來源">{['全部', '人事', '產品', '客戶', '財務'].map(c => <button key={c} className={channel === c ? 'active' : ''} onClick={() => { setChannel(c); setPage(0); }}>{c}</button>)}</div><span>{messages.length} 則訊息</span></div>
    {messages.length ? <ul className="inbox-list">{messages.slice(page * 25, page * 25 + 25).map(m => <li key={m.id}><Mail size={20} aria-hidden="true"/><div><div className="message-meta"><span>{m.channel}</span><time>{m.date}</time></div><h3>{m.title}</h3><p>{m.body}</p><button className="text-button" onClick={() => { navigate('Timeline'); selectEvent(m.id); }}>查看事件與原因<ArrowRight size={16}/></button></div></li>)}</ul> : <Empty title="還沒有新訊息" body="推進時間後，同事與客戶的反應會出現在這裡。"/>}<Pager page={page} total={messages.length} onChange={setPage}/></Panel></>;
}
const factors: Record<string, string> = { compensation: '薪資與期待落差', burnout: '長期疲勞與工作負荷', management: '管理安排與工作滿意度', loyalty: '對公司的信任與歸屬', workload: '工作節奏', 'team-work': '團隊累積工作', 'product-experience': '產品使用體驗', 'customer-budget': '客戶預算變化', 'cash-exhausted': '現金不足以支持支出' };
export function Timeline({ view }: { view: CompanyView }) {
  const [page, setPage] = useState(0), [channel, setChannel] = useState('全部');
  const selected = useUi(s => s.selectedEvent), select = useUi(s => s.selectEvent);
  const events = view.events.filter(e => channel === '全部' || e.channel === channel).slice().reverse();
  const event = view.events.find(e => e.id === selected) ?? events[0];
  return <><PageHeading title="時間軸" subline="回頭看每一次決策，以及它帶來的結果。"/><div className="timeline-columns"><Panel title="公司歷史" action={<label className="compact-label"><span className="sr-only">事件類型</span><select aria-label="事件類型" value={channel} onChange={e => { setChannel(e.target.value); setPage(0); }}>{['全部', '公司', '人事', '產品', '客戶', '財務'].map(c => <option key={c}>{c}</option>)}</select></label>}>
    <ol className="timeline-list">{events.slice(page * 25, page * 25 + 25).map(e => <li key={e.id}><button className={event?.id === e.id ? 'selected' : ''} onClick={() => select(e.id)}><time>{e.date}</time><strong>{e.title}</strong><small>{e.channel}</small></button></li>)}</ol><Pager page={page} total={events.length} onChange={setPage}/>
    {!events.length ? <Empty title="沒有符合條件的事件" body="試試其他類型。"/> : null}</Panel>{event ? <EventDetail event={event} view={view} select={select}/> : null}</div></>;
}
function EventDetail({ event, view, select }: { event: EventView; view: CompanyView; select: (id: string) => void }) {
  const parent = view.events.find(e => e.id === event.causedBy);
  const consequences = view.events.filter(e => e.causedBy === event.id || e.causes.some(c => c.eventId === event.id));
  return <Panel title="事件詳情"><time className="event-date">{event.date} · 第 {event.tick} 天</time><h2 className="event-title">{event.title}</h2><p className="event-body">{event.body}</p><h3 className="section-title">為什麼發生？</h3>{event.causes.length ? <ul className="cause-list">{event.causes.map((c, i) => <li key={i}><strong>{factors[c.factor] ?? c.factor}</strong>{c.eventId && view.events.some(e => e.id === c.eventId) ? <button className="text-button" onClick={() => select(c.eventId!)}>查看相關決策<ArrowRight size={15}/></button> : null}</li>)}</ul> : <p className="muted-copy">這筆事件沒有額外的原因分類。</p>}
    {parent ? <div className="causal-link"><small>前置事件</small><button className="text-button" onClick={() => select(parent.id)}>{parent.title}<ArrowRight size={16}/></button></div> : event.causedBy?.startsWith('command-') ? <p className="muted-copy">來源：玩家決策或時間推進。</p> : event.causedBy ? <p className="muted-copy">部分前置紀錄屬於未公開的內部觀察。</p> : null}
    <h3 className="section-title">後續相關事件</h3>{consequences.length ? <ul className="simple-events">{consequences.slice(0, 12).map(e => <li key={e.id}><time>{e.date}</time><button className="text-button" onClick={() => select(e.id)}>{e.title}</button></li>)}</ul> : <p className="muted-copy">目前沒有直接相連的後續事件。</p>}
  </Panel>;
}
