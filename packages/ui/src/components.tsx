import { useEffect, useRef, type ReactNode } from 'react';
import { ArrowRight, X } from 'lucide-react';
export const money = (cents: number) => `NT$${Math.round(cents / 100).toLocaleString('en-US')}`;
export const roles: Record<string, string> = { CEO: '創辦人 / CEO', CTO: '技術長', Engineer: '工程師', Designer: '產品設計師', Sales: '業務', Operations: '營運' };
export const strategies = { balanced: '均衡發展', growth: '積極成長', sustainable: '穩健經營' };
export const priorities = { features: '新功能', quality: '品質提升', debt: '技術債整理' };
export function PageHeading({ title, subline, action }: { title: string; subline: string; action?: ReactNode }) {
  return <div className="page-heading"><div><h1>{title}</h1><p>{subline}</p></div>{action}</div>;
}
export function Panel({ title, children, action, className = '' }: { title?: string; children: ReactNode; action?: ReactNode; className?: string }) {
  return <section className={`panel ${className}`}>{title ? <div className="panel-heading"><h2>{title}</h2>{action}</div> : null}{children}</section>;
}
export function LinkButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return <button className="text-button" onClick={onClick}>{children}<ArrowRight size={16} /></button>;
}
export function Empty({ title, body }: { title: string; body: string }) { return <div className="empty"><h3>{title}</h3><p>{body}</p></div>; }
export function Condition({ text }: { text: string }) { return <span className={`condition ${text.includes('壓力') || text.includes('顧慮') || text.includes('休息') || text.includes('關注') || text.includes('跟進') || text.includes('轉弱') ? 'caution' : text.includes('離職') || text.includes('流失') ? 'muted' : ''}`}><i aria-hidden="true" />{text}</span>; }
export function Avatar({ name }: { name: string }) { return <span className="avatar" aria-hidden="true">{name.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>; }
export function Progress({ value, label }: { value: number; label: string }) { return <div className="progress-row"><div className="progress" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value)}><span style={{ width: `${value}%` }} /></div><strong>{Math.round(value)}%</strong></div>; }
export function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const dialog = ref.current; dialog?.showModal(); return () => dialog?.close(); }, []);
  return <dialog ref={ref} onCancel={event => { event.preventDefault(); onClose(); }} aria-labelledby="dialog-title"><div className="dialog-heading"><h2 id="dialog-title">{title}</h2><button className="icon-button" aria-label="關閉對話框" onClick={onClose}><X size={20} /></button></div>{children}</dialog>;
}
export function Pager({ page, total, size = 25, onChange }: { page: number; total: number; size?: number; onChange: (page: number) => void }) {
  if (total <= size) return null;
  const pages = Math.ceil(total / size);
  return <div className="pager"><span>第 {page + 1} / {pages} 頁 · 共 {total} 筆</span><button className="button secondary" disabled={page <= 0} onClick={() => onChange(page - 1)}>上一頁</button><button className="button secondary" disabled={page >= pages - 1} onClick={() => onChange(page + 1)}>下一頁</button></div>;
}
