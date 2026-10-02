import type { RpcResult, SessionRequest, SessionResponse } from '../../../packages/application/src/session';
declare global { interface Window { foundry?: { request: (request: SessionRequest) => Promise<SessionResponse> }; } }
let sequence = 0;
let worker: Worker | null = null;
const pending = new Map<number, { resolve: (response: SessionResponse) => void; reject: (error: Error) => void }>();
export function request(request: SessionRequest): Promise<SessionResponse> {
  if (window.foundry) return window.foundry.request(request);
  if (!worker) {
    worker = new Worker(new URL('./simulation.worker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (event: MessageEvent<RpcResult>) => {
      const waiter = pending.get(event.data.id); if (!waiter) return;
      pending.delete(event.data.id);
      if (event.data.error) waiter.reject(new Error(event.data.error));
      else if (event.data.result) waiter.resolve(event.data.result);
      else waiter.reject(new Error('模擬引擎回應無效'));
    };
    worker.onerror = () => { for (const waiter of pending.values()) waiter.reject(new Error('模擬引擎無法啟動，請重新整理後再試。')); pending.clear(); worker?.terminate(); worker = null; };
  }
  const id = ++sequence;
  return new Promise((resolve, reject) => { pending.set(id, { resolve, reject }); worker!.postMessage({ id, request }); });
}
