import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const hash = path => createHash('sha256').update(readFileSync(path)).digest('hex');
const files = ['balance.ts', 'content.ts'].map(file => { const before = hash(`artifacts/vnext/baseline-source/src/game/config/${file}`), after = hash(`src/game/config/${file}`); return { file, before, after, identical: before === after }; });
writeFileSync('artifacts/vnext/gameplay-config-parity.json', JSON.stringify(files, null, 2));
if (files.some(f => !f.identical)) throw new Error('Gameplay config changed');
