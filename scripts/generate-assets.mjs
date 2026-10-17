import { mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import shapes from './asset-shapes.json' with { type: 'json' };
// Nguồn hình học CC0 ở JSON, mỗi ID chỉ có một định nghĩa; runtime dùng SVG local đã bake.
const svg = body => `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="-32 -32 64 64">${body}</svg>`;
const sources = [];
for (const [id, body] of Object.entries(shapes)) {
  const path = `public/assets/images/${id}.svg`;
  mkdirSync(path.substring(0, path.lastIndexOf('/')), { recursive: true });
  const bytes = svg(body); writeFileSync(path, bytes);
  sources.push({ file: `${id}.svg`, source: 'scripts/asset-shapes.json → scripts/generate-assets.mjs', author: 'EVENTIDE original geometry', license: 'CC0-1.0', sha256: createHash('sha256').update(bytes).digest('hex') });
}
writeFileSync('public/assets/images/SOURCES.json', JSON.stringify(sources, null, 2) + '\n');
