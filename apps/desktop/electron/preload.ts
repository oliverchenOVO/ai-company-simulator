import { contextBridge, ipcRenderer } from 'electron';
import type { SessionRequest } from '../../../packages/application/src/session';
contextBridge.exposeInMainWorld('foundry', { request: (request: SessionRequest) => ipcRenderer.invoke('foundry:request', request) });
