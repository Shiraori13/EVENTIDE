import { it, expect } from 'vitest';
import { mkdirSync, writeFileSync } from 'node:fs';
import { GameSession } from '../fixtures/history/v141/src/game/core/GameSession';
import { GameSession as OldGame } from '../fixtures/history/v14/src/game/core/GameSession';
import { chooseBotUpgrade, botInput } from '../fixtures/history/v141/src/game/debug/Autoplay';
import { seededRandom } from '../fixtures/history/v141/src/game/core/math';
import { makeEnemy } from '../fixtures/history/v141/src/game/systems/SpawnSystem';
import { makeEnemy as oldEnemy } from '../fixtures/history/v14/src/game/systems/SpawnSystem';
import { clearGroundXP, totalGroundXP } from '../fixtures/history/v141/src/game/systems/PickupSystem';
import { clearGroundXP as oldClear } from '../fixtures/history/v14/src/game/systems/PickupSystem';
import { canFuseQuasar } from '../fixtures/history/v141/src/game/systems/EvolutionSystem';
import { shipStats } from '../fixtures/history/v141/src/game/core/stats';
import { masteryUsed } from '../fixtures/history/v141/src/game/config/mastery';
import { BALANCE, BOSS_PHASES } from '../fixtures/history/v141/src/game/config/balance';
import { QUASAR, type SupportId, type ModuleId } from '../fixtures/history/v141/src/game/config/content';
mkdirSync('artifacts/v14',{recursive:true});
it('1.3/1.4 cùng fixture hai nguồn so Quasar: boss/đàn/10s durable, không gộp hai behavior',()=>{
  const rows=[];
  for(const version of ['1.3','1.4'] as const)for(const loadout of ['sources','mastery','quasar'] as const)for(const kind of ['boss','cluster','durable'] as const){
    if(version==='1.3'&&loadout!=='sources')continue;
    const g=version==='1.3'?new OldGame(0,seededRandom(77)):new GameSession(0,seededRandom(77)),s=g.state;
    s.nextSpawn=Infinity;s.nextGravity=Infinity;s.bossSpawned=true;s.player.protectedUntil=Infinity;s.modules={pulsar:5,ion:5};
    // Cùng hai nguồn, không Plasma để không che phần đóng góp của fusion.
    if(g instanceof GameSession){if(loadout==='quasar')s.modules={quasar:5};if(loadout==='mastery')g.state.masteryBonus.damage=2000;clearGroundXP(g.state);}else oldClear(g.state);
    if(kind==='boss'){s.player.x=500;s.player.y=0;}
    const spawn=(x:number,y:number)=>g instanceof GameSession?makeEnemy(g.state,kind==='boss'?'elder':'drifter',{x,y},'player'):oldEnemy(g.state,kind==='boss'?'elder':'drifter',{x,y},'player');
    const targets=kind==='boss'?[spawn(700,0)]:Array.from({length:20},(_,i)=>spawn(Math.cos(i*2.399)*150,110+Math.sin(i*2.399)*150));
    for(const e of targets){e.speed=0;e.damage=0;if(kind==='durable')e.baseHP=e.hp=e.maxHP=100000;}
    const hp=targets.reduce((a,e)=>a+e.hp,0);
    for(let f=0;f<(kind==='durable'?10:300)*60&&!targets.every(e=>e.kind==='elder'?e.bossPhase==='dead':e.hp<=0);f++){
      s.phase='playing';s.pending=0;for(const e of targets){e.speed=0;e.damage=0;}if(g instanceof GameSession)clearGroundXP(g.state);else oldClear(g.state);g.step(1/60);s.cues.length=0;
    }
    rows.push({version,loadout,kind,seconds:s.time,complete:targets.every(e=>e.kind==='elder'?e.bossPhase==='dead':e.hp<=0),damage:kind==='boss'?undefined:hp-targets.reduce((a,e)=>a+Math.max(0,e.hp),0),bossPhase2At:s.bossPhase2At,bossDeathAt:s.bossDeathAt,kills:s.kills});
  }
  writeFileSync('artifacts/v14/weapon-comparison.json',JSON.stringify({method:'Fixture tĩnh, hai nguồn5 vs fusion5, không wave/support/gear; mastery phân bổ20%damage. Không chứng minh né tự nhiên.',boss: {hp:BALANCE.bossHP,phase2Ratio:BOSS_PHASES.phase2HPRatio},quasar:QUASAR,rows},null,2));expect(rows.every(r=>Number.isFinite(r.seconds))).toBe(true);
},60000);
it('18 natural runs qua events/mastery/fusion, ba support/seed, không tăng HP/time/XP',()=>{
  const rows=[];
  for(const seed of [7,42,104])for(const pair of [['power','haste'],['hull','armor'],['engine','magnet']] as SupportId[][])for(const fusion of [false,true]){
    const g=new GameSession(0,seededRandom(seed)),s=g.state,checkpoints=[];let next=180,masteryAt:number|undefined,fusionAt:number|undefined;const events:unknown[]=[];let last='';
    for(let frame=0;frame<43210&&!s.settled;frame++){
      while(s.phase==='choosingUpgrade'){if(fusion&&canFuseQuasar(s)){g.fuse();fusionAt=s.time;}chooseBotUpgrade(g,pair,['plasma','pulsar','ion'] as ModuleId[]);}
      g.step(1/60,botInput(s));s.cues.length=0;if(s.weaponMasteryReached&&masteryAt===undefined)masteryAt=s.time;
      const active=s.astronomy.map(e=>`${e.id}:${e.phase}`).join(',');if(active!==last){events.push({time:s.time,states:active,hp:s.player.hp,beacon:s.beacon.hp,stats:shipStats(s)});last=active;}
      if(s.time>=next){checkpoints.push({time:s.time,hp:s.player.hp,beacon:s.beacon.hp,kills:s.kills,level:s.level,modules:{...s.modules},supports:{...s.supports},mastery:{...s.masteryBonus},salvage:{...s.salvage.bonuses},stats:shipStats(s)});next+=180;}
    }
    expect(s.settled).toBe(true);expect(masteryUsed(s.masteryBonus)).toBeLessThanOrEqual(2000);expect(s.loot.created).toBe(s.loot.collected+totalGroundXP(s));
    rows.push({seed,pair,fusion,phase:s.phase,seconds:s.time,level:s.level,kills:s.kills,hp:s.player.hp,beacon:s.beacon.hp,bossPhase2At:s.bossPhase2At,bossDeathAt:s.bossDeathAt,masteryAt,fusionAt,mastery:s.masteryBonus,modules:s.modules,supports:s.supports,salvage:s.salvage,stats:shipStats(s),xpCreated:s.loot.created,xpCollected:s.loot.collected,groundXP:totalGroundXP(s),checkpoints,events});
  }
  writeFileSync('artifacts/v14/balance-playtest.json',JSON.stringify({method:'Fast-forward 60Hz, bot qua draft/reroll/drop thật; fusion chủ động khi đủ điều kiện, không sửa HP/time/XP.',rows},null,2));
},120000);
