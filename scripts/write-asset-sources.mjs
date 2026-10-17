import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const fonts = [
  ['NotoSans', 'notosans', 'NotoSans%5Bwdth,wght%5D.ttf'], ['NotoSerif', 'notoserif', 'NotoSerif%5Bwdth,wght%5D.ttf'],
].map(([name, folder, original]) => {
  const file = `${name}-Variable.ttf`, bytes = readFileSync(`public/assets/fonts/${file}`);
  return { file, source: `https://raw.githubusercontent.com/google/fonts/main/ofl/${folder}/${original}`, project: `https://github.com/google/fonts/tree/main/ofl/${folder}`, retrieved: '2026-10-16', license: 'SIL Open Font License 1.1', licenseFile: `${name}-OFL.txt`, sha256: createHash('sha256').update(bytes).digest('hex'), bytes: bytes.length, modified: false };
});
writeFileSync('public/assets/fonts/SOURCES.json', JSON.stringify(fonts, null, 2));
