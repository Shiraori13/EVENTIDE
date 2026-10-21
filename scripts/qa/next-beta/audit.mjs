import { readFileSync,readdirSync,writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { relative,join } from 'node:path';
import assert from 'node:assert/strict';
const hash=path=>createHash('sha256').update(readFileSync(path)).digest('hex');
function walk(path){return readdirSync(path,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(path,e.name)):[join(path,e.name)]);}
const baseline='artifacts/next-beta/before-source',changes=[],assets=[];
for(const path of walk(`${baseline}/src`)){const target=relative(baseline,path).replaceAll('\\','/');if(hash(path)!==hash(target))changes.push(target);}
for(const path of walk(`${baseline}/public`)){const target=relative(baseline,path).replaceAll('\\','/');assert.equal(hash(path),hash(target),target);assets.push(target);}
const fixtures=JSON.parse(readFileSync('tests/fixtures/history/SOURCES.json','utf8')).files;for(const file of fixtures)assert.equal(hash(file.path),file.sha256,file.path);
const extra=JSON.parse(readFileSync('tests/fixtures/history/ui-hazards-before/manifest.json','utf8')).hashes;for(const[path,digest]of Object.entries(extra))assert.equal(hash(`tests/fixtures/history/ui-hazards-before/src/${path}`),digest,path);
const stable=['src/game/core/GameClock.ts','src/game/core/stats.ts','src/game/systems/ExperienceSystem.ts','src/game/systems/MovementSystem.ts','src/game/systems/WeaponSystem.ts','src/game/systems/AdvancedWeapons.ts','src/game/systems/PickupSystem.ts','src/game/services/ProfileService.ts',...walk('src/game/config'),...walk('src/game/systems/bosses'),...walk('src/game/systems/enemies'),'src/game/presentation/WorldRenderer.ts','src/game/presentation/SpritePool.ts','src/game/presentation/geometry.ts','src/assets/manifest.ts','package-lock.json'];
for(const path of stable)assert.equal(hash(path),hash(`${baseline}/${path}`),path);
const added=walk('src').map(p=>p.replaceAll('\\','/')).filter(p=>!walk(`${baseline}/src`).map(p=>relative(baseline,p).replaceAll('\\','/')).includes(p));
writeFileSync('artifacts/next-beta/audit.json',JSON.stringify({changes,added,assetsUnchanged:assets.length,historicalFixtures:fixtures.length,additionalHistoricalFixtures:Object.keys(extra).length,stable:stable.map(path=>({path,sha256:hash(path)})),lockfileUnchanged:true},null,2));
process.stdout.write(JSON.stringify({changes,added,assetsUnchanged:assets.length,fixtures:fixtures.length+Object.keys(extra).length,stable:stable.length})+'\n');
