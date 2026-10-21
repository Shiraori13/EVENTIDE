import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
const args = Object.fromEntries(process.argv.slice(2).map(x => x.replace(/^--/, '').split('=')));
const repeats = Number(args.repeats ?? 3);
const run = (argv) => new Promise((resolve, reject) => { const child = spawn(process.execPath, ['scripts/performance/benchmark.mjs', ...argv], { stdio: 'inherit', windowsHide: true }); child.on('exit', code => code === 0 ? resolve() : reject(new Error(`benchmark exit ${code}`))); });
for (let i = 1; i <= repeats; i++) {
  const beforeFile = `artifacts/vnext/before-controlled-${i}/results.json`;
  const completeBefore = args.resume === '1' && existsSync(beforeFile) && JSON.parse(readFileSync(beforeFile, 'utf8')).length === 4;
  if (!completeBefore) await run([`--label=before-controlled-${i}`, '--url=http://localhost:4175', '--repeats=1', '--warmup=10', '--seconds=60', '--pinned=1']);
  await run([`--label=after-controlled-${i}`, '--url=http://127.0.0.1:4176', '--repeats=1', '--warmup=10', '--seconds=60', '--pinned=1']);
}
