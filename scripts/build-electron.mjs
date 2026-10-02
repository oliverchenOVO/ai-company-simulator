import { build } from 'esbuild';
import { copyFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
mkdirSync('dist-electron', { recursive: true });
await build({ entryPoints: ['apps/desktop/electron/main.ts'], outfile: 'dist-electron/main.cjs', bundle: true, platform: 'node', format: 'cjs', target: 'node22', external: ['electron', 'sql.js'], define: { 'import.meta.url': '"file:///unused-in-packaged-runtime"' } });
await build({ entryPoints: ['apps/desktop/electron/preload.ts'], outfile: 'dist-electron/preload.cjs', bundle: true, platform: 'node', format: 'cjs', external: ['electron'] });
copyFileSync(require.resolve('sql.js/dist/sql-wasm.wasm'), 'dist-electron/sql-wasm.wasm');
