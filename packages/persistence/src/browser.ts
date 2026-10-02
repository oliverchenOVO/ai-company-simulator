import { validateSave, type SaveEnvelope, type SaveRepository } from './save';
/** Each browser origin/profile owns its storage; no shared server-side world. */
export class BrowserRepository implements SaveRepository {
  private async open(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('foundry-company-saves', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('saves');
      request.onerror = () => reject(request.error ?? new Error('無法開啟瀏覽器存檔'));
      request.onsuccess = () => resolve(request.result);
    });
  }
  async save(slot: string, envelope: SaveEnvelope): Promise<void> {
    const valid = validateSave(envelope), db = await this.open();
    try {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction('saves', 'readwrite');
        tx.objectStore('saves').put(valid, slot);
        tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error ?? new Error('存檔被中止'));
      });
    } finally { db.close(); }
  }
  async load(slot: string): Promise<SaveEnvelope | null> {
    const db = await this.open();
    try {
      const raw = await new Promise<unknown>((resolve, reject) => {
        const request = db.transaction('saves', 'readonly').objectStore('saves').get(slot);
        request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
      });
      return raw === undefined ? null : validateSave(raw);
    } finally { db.close(); }
  }
}
