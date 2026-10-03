import { useRef, useState } from 'react';
import { Download, FolderOpen, RotateCcw, Upload } from 'lucide-react';
import type { CompanyView } from '../../../../packages/simulation/src/projection';
import type { Strategy } from '../../../../packages/domain/src/model';
import { PageHeading, Panel, strategies } from '../../../../packages/ui/src/components';
import type { Action } from '../use-company';
export function Settings({ view, act, busy, newCompany }: { view: CompanyView; act: Action; busy: boolean; newCompany: () => void }) {
  const [strategy, setStrategy] = useState<Strategy>(view.strategy), [replayHash, setReplayHash] = useState(''), [fileError, setFileError] = useState('');
  const input = useRef<HTMLInputElement>(null);
  async function exportSave() {
    const response = await act({ action: 'export' }); if (!response?.exported) return;
    const url = URL.createObjectURL(new Blob([JSON.stringify(response.exported)], { type: 'application/json' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = `foundry-day-${view.tick}.json`; anchor.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <><PageHeading title="設定" subline="公司方向與存檔管理，都在你的掌握之中。"/><div className="settings-grid"><Panel title="公司策略"><p className="muted-copy">成長策略會提高工作強度；穩健策略降低負荷，成果需要更長時間累積。</p><form className="form-grid" onSubmit={event => { event.preventDefault(); void act({ action: 'execute', command: { type: 'ChangeCompanyStrategy', strategy } }); }}><label>營運方向<select value={strategy} onChange={event => setStrategy(event.target.value as Strategy)}>{Object.entries(strategies).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><div><button className="button primary" disabled={busy || view.bankrupt}>儲存公司策略</button></div></form><p className="current-setting">目前：{strategies[view.strategy]}</p></Panel>
    <Panel title="存檔與還原"><p className="muted-copy">每次決策後自動儲存。手動存檔保留檢查點，後續自動存檔不會覆寫它。</p><div className="settings-actions"><button className="button secondary" disabled={busy} onClick={() => { void act({ action: 'load', slot: 'manual' }); }}><FolderOpen size={17}/>載入手動存檔</button><button className="button secondary" disabled={busy} onClick={() => { void exportSave(); }}><Download size={17}/>匯出存檔</button><button className="button secondary" disabled={busy} onClick={() => input.current?.click()}><Upload size={17}/>匯入存檔</button></div><input className="sr-only" type="file" accept=".json,application/json" ref={input} aria-label="匯入存檔檔案" onChange={async event => {
      const file = event.target.files?.[0]; if (!file) return; setFileError('');
      try { if (file.size > 50 * 1024 * 1024) throw new Error('存檔超過 50 MB 上限'); await act({ action: 'import', data: JSON.parse(await file.text()) }); }
      catch (error) { setFileError(error instanceof Error ? error.message : '無法讀取存檔'); }
      finally { event.target.value = ''; }
    }}/>{fileError ? <p role="alert" className="error-text">{fileError}</p> : null}<p className="storage-note">{window.foundry ? '桌面進度存於此電腦的 SQLite。' : '瀏覽器進度存於這個瀏覽器的本機資料；清除網站資料會刪除進度。'}匯出存檔可作備份或移轉裝置。</p></Panel>
    <Panel title="重播驗證"><p className="muted-copy">使用原始 seed 與完整指令歷史重新模擬，確認結果與目前進度完全一致。</p><button className="button secondary" disabled={busy} onClick={() => { void act({ action: 'replay' }).then(response => { if (response?.replay) setReplayHash(response.replay.hash); }); }}><RotateCcw size={17}/>驗證 Replay</button>{replayHash ? <div className="replay-result"><strong>一致性驗證通過</strong><code>{replayHash}</code></div> : null}</Panel>
    <Panel title="開始另一段故事"><p className="muted-copy">建立新公司會替換目前的自動存檔。請先手動儲存或匯出目前進度。</p><button className="button secondary" disabled={busy} onClick={newCompany}>建立新公司</button><p className="storage-note">FOUNDRY 0.2.1 · Phase 2.5 · 離線可玩</p></Panel></div></>;
}
