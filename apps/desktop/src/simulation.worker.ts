import { ApplicationSession, type SessionRequest, type RpcResult } from '../../../packages/application/src/session';
import { BrowserRepository } from '../../../packages/persistence/src/browser';
const session = new ApplicationSession(new BrowserRepository(), import.meta.env.DEV);
let queue = Promise.resolve();
self.onmessage = (event: MessageEvent<{ id: number; request: SessionRequest }>) => {
  queue = queue.then(async () => {
    const { id, request } = event.data;
    try { self.postMessage({ id, result: await session.handle(request) } satisfies RpcResult); }
    catch (error) { self.postMessage({ id, error: error instanceof Error ? error.message : String(error) } satisfies RpcResult); }
  });
};
