import { useCallback, useEffect, useState } from 'react';
import type { SessionRequest, SessionResponse } from '../../../packages/application/src/session';
import type { CompanyView } from '../../../packages/simulation/src/projection';
import { request } from './client';
export type Action = (request: SessionRequest) => Promise<SessionResponse | null>;
export function useCompany() {
  const [view, setView] = useState<CompanyView | null>(null), [busy, setBusy] = useState(true), [error, setError] = useState(''), [notice, setNotice] = useState(''), [initialized, setInitialized] = useState(false);
  const act: Action = useCallback(async input => {
    setBusy(true); setError(''); setNotice('');
    try { const response = await request(input); setView(response.view); setNotice(response.notice ?? ''); return response; }
    catch (error) { setError(error instanceof Error ? error.message : String(error)); return null; }
    finally { setBusy(false); }
  }, []);
  useEffect(() => { void act({ action: 'status' }).finally(() => setInitialized(true)); }, [act]);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 6500); return () => window.clearTimeout(timer);
  }, [notice]);
  return { view, busy, initialized, error, notice, act, clearError: () => setError('') };
}
