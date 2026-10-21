import { build } from 'esbuild';
import { mkdirSync,writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
const folder='artifacts/next-beta/playtest';mkdirSync(folder,{recursive:true});
const rows=[];
for(const[label,root]of [['before','artifacts/next-beta/before-source/src'],['after','src']]){
 const output=resolve(folder,`${label}-simulation.mjs`),path=resolve(root).replaceAll('\\','/');
 const contents=`import {GameSession} from ${JSON.stringify(path+'/game/core/GameSession.ts')};
 import {seededRandom} from ${JSON.stringify(path+'/game/core/math.ts')};
 import {botInput,chooseBotUpgrade} from ${JSON.stringify(path+'/game/debug/Autoplay.ts')};
 import {canFuseQuasar} from ${JSON.stringify(path+'/game/systems/EvolutionSystem.ts')};
 export function run(seed,pair,fusion){const game=new GameSession(0,seededRandom(seed));let peakEnemies=0,peakProjectiles=0,fusionAt,simTicks=0;
 while(!game.state.settled&&simTicks<43210){const s=game.state;if(s.phase==='choosingUpgrade'){if(fusion&&canFuseQuasar(s)){game.fuse();fusionAt=s.time;}chooseBotUpgrade(game,pair,['plasma','pulsar','ion']);continue;}
 game.step(1/60,botInput(s));simTicks++;peakEnemies=Math.max(peakEnemies,s.enemies.length);peakProjectiles=Math.max(peakProjectiles,s.projectiles.length);}
 const s=game.state;return{seed,pair,fusion,fusionAt,phase:s.phase,time:s.time,kills:s.kills,hp:s.player.hp,beacon:s.beacon.hp,modules:s.modules,supports:s.supports,gear:s.salvage.bonuses,mastery:s.masteryBonus,peakEnemies,peakProjectiles,simTicks};}`;
 await build({stdin:{contents,loader:'ts',resolveDir:process.cwd()},bundle:true,platform:'node',format:'esm',outfile:output,define:{'import.meta.env.DEV':'false','import.meta.env.MODE':'"benchmark"','import.meta.env.BASE_URL':'"/EVENTIDE/"'}});
 const {run}=await import(pathToFileURL(output));
 for(const seed of [7,42])for(const [name,pair]of [['attack',['power','haste']],['defense',['hull','armor']],['mobility',['engine','magnet']]])for(const fusion of [false,true]){const row={...run(seed,pair,fusion),build:name};rows.push({label,...row});process.stdout.write(`${label} ${seed} ${name} fusion=${fusion}: ${row.phase} ${row.time.toFixed(2)}s\n`);}
}
const before=rows.filter(r=>r.label==='before'),after=rows.filter(r=>r.label==='after');
for(let i=0;i<before.length;i++){const{label:a,...x}=before[i],{label:b,...y}=after[i];assert.deepEqual(y,x);}
writeFileSync(`${folder}/natural.json`,JSON.stringify({method:'Fixed60Hz tăng tốc, cùng seed/bot/draft thật; không đo FPS hoặc cảm giác chơi. Mọi kết quả trước/sau phải bằng nhau.',rows,identical:true},null,2));
