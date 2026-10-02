import { app, BrowserWindow, ipcMain } from 'electron';
import { join } from 'node:path';
import { ApplicationSession } from '../../../packages/application/src/session';
import { SqliteRepository } from '../../../packages/persistence/src/sqlite';
if (process.env.FOUNDRY_USER_DATA) app.setPath('userData', process.env.FOUNDRY_USER_DATA);
let mainWindow: BrowserWindow | null = null;
let repository: SqliteRepository | null = null;
let session: ApplicationSession;
let queue: Promise<unknown> = Promise.resolve();
async function createWindow() {
  mainWindow = new BrowserWindow({ width: 1440, height: 960, minWidth: 820, minHeight: 650, title: 'FOUNDRY — AI Company Simulator', backgroundColor: '#f7f8fa', show: false,
    webPreferences: { preload: join(__dirname, 'preload.cjs'), contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  mainWindow.setMenuBarVisibility(false);
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  mainWindow.webContents.on('will-navigate', event => event.preventDefault());
  mainWindow.once('ready-to-show', () => mainWindow?.show());
  await mainWindow.loadFile(join(__dirname, '../dist/index.html'));
  if (process.env.FOUNDRY_SMOKE === '1') {
    const text = await mainWindow.webContents.executeJavaScript('document.body.innerText');
    if (!text.includes('FOUNDRY')) { process.exitCode = 1; console.error('Packaged smoke: blank window'); }
    else console.log('Packaged smoke: renderer loaded successfully');
    app.quit();
  }
}
app.whenReady().then(async () => {
  repository = await SqliteRepository.open(join(app.getPath('userData'), 'companies.sqlite'), join(__dirname, 'sql-wasm.wasm'));
  session = new ApplicationSession(repository, process.argv.includes('--debug-simulation'));
  ipcMain.handle('foundry:request', (event, raw: unknown) => {
    if (event.sender !== mainWindow?.webContents || !event.senderFrame?.url.startsWith('file://')) throw new Error('Untrusted IPC sender');
    const result = queue.then(() => session.handle(raw)); queue = result.catch(() => undefined); return result;
  });
  await createWindow();
  app.on('activate', () => { if (!BrowserWindow.getAllWindows().length) void createWindow(); });
}).catch(error => { console.error('Desktop initialization failed:', error); app.exit(1); });
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('will-quit', () => repository?.close());
