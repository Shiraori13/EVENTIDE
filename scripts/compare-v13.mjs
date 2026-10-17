import { spawn } from 'node:child_process';
const args = Object.fromEntries(process.argv.slice(2).map(x => x.replace(/^--/, '').split('=')));
const run = argv => new Promise((resolve, reject) => {
  const child = spawn(process.execPath, ['scripts/benchmark.mjs', ...argv], { stdio: 'inherit', windowsHide: true });
  child.on('error', reject); child.on('exit', code => code === 0 ? resolve() : reject(Error(`benchmark exit ${code}`)));
});
for (const [label, url] of [['before', 'http://127.0.0.1:4191'], ['after', 'http://127.0.0.1:4192']]) {
  await run(['--root=artifacts/v13', `--label=${label}`, `--url=${url}`, '--scenarios=dense,endgame', `--repeats=${args.repeats ?? 1}`, '--warmup=10', `--seconds=${args.seconds ?? 60}`, '--pinned=1']);
}
