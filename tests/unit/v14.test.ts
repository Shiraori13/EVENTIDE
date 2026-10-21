import { describe, it, expect } from 'vitest';
import { GameSession, createRun, finishRun } from '../../src/game/core/GameSession';
import { GameClock } from '../../src/game/core/GameClock';
import { prepareChoices, availableChoices, availableUpgrades, availableReplacements, addXP, choiceDescription, upgradeDescription } from '../../src/game/systems/ExperienceSystem';
import { fuseQuasar } from '../../src/game/systems/EvolutionSystem';
import { astronomyStep, radiationStep, tideStrength } from '../../src/game/systems/hazards/AstronomySystem';
import { makeEnemy, eventStep } from '../../src/game/systems/SpawnSystem';
import { shipStats, attackInterval } from '../../src/game/core/stats';
import { weaponStep } from '../../src/game/systems/WeaponSystem';
import { combatStep } from '../../src/game/systems/CombatSystem';
import { movementStep } from '../../src/game/systems/MovementSystem';
import { clearModuleAttacks } from '../../src/game/systems/ModuleLifecycle';
import { clearGroundXP, totalGroundXP } from '../../src/game/systems/PickupSystem';
import { seededRandom } from '../../src/game/core/math';
import { MASTERY, masteryUsed } from '../../src/game/config/mastery';
import { ASTRONOMY as A } from '../../src/game/config/events';
import { BALANCE as B } from '../../src/game/config/balance';
import { QUASAR, moduleName } from '../../src/game/config/content';
import { beaconFeedback } from '../../src/game/presentation/BeaconFeedback';
function mastered(): GameSession { const g = new GameSession(0,seededRandom(7)); g.state.modules = {plasma:5,pulsar:5,ion:5}; g.state.supports={hull:5,armor:5}; g.state.level=31; g.state.pending=1; g.state.player.hp=g.state.player.maxHP=shipStats(g.state).maxHP; prepareChoices(g.state,g.rng); return g; }
describe('Beta 1.4 draft transaction và mastery',()=>{
  it('tái hiện build ảnh: chỉ stat +2%, reroll/pause không trả replacement hoặc hoàn budget',()=>{
    const g=mastered(),s=g.state,modules={...s.modules}; expect(s.weaponMasteryReached).toBe(true); expect(s.choices).toHaveLength(3); expect(s.choices.every(id=>id.startsWith('mastery-'))).toBe(true);
    const draft=s.draftId; expect(g.reroll()).toBe(true); const choices=[...s.choices]; g.pause(); g.step(90); g.resume(); expect(s.choices).toEqual(choices); expect(s.rerollsRemaining).toBe(0);
    expect(g.choose(s.choices[0],draft)).toBe(true); expect(s.modules).toEqual(modules); expect(s.supports).toEqual({hull:5,armor:5}); expect(masteryUsed(s.masteryBonus)).toBe(200); expect(g.choose('mastery-damage',draft)).toBe(false);
  });
  it('cộng base/additive với support, gear, Corruption, chaos đúng một lần và HP delta',()=>{
    const g=mastered(),s=g.state; s.supports={power:5,haste:5}; s.salvage.bonuses.damage=1000; s.salvage.bonuses.rate=1000; s.masteryBonus.damage=200; s.masteryBonus.rate=200; s.corruption=50; s.time=350; astronomyStep(s);
    expect(shipStats(s).outgoing).toBeCloseTo(1.52*1.2*1.15); s.supports.power=4; expect(upgradeDescription('power',4,s)).toContain('209,76'); s.supports.power=5; expect(attackInterval(1,shipStats(s))).toBeCloseTo(1/1.52); s.player.hp=60; s.pending=2; s.choices=['mastery-hp']; expect(g.choose('mastery-hp')).toBe(true); expect(s.player.maxHP).toBe(102); expect(s.player.hp).toBe(62); s.choices=['mastery-hp']; g.choose('mastery-hp'); expect(s.player.hp).toBe(64); expect(s.player.maxHP).toBe(104); expect(s.metrics.lightHealing).toBe(0);
  });
  it('10 lựa chọn tổng20%, speed10%, queue/XP dư/fallback fullHP không heal lặp',()=>{
    const g=mastered(),s=g.state; s.pending=12; s.xp=17;
    for(let i=0;i<5;i++){s.choices=['mastery-speed']; expect(g.choose('mastery-speed')).toBe(true);} expect(availableChoices(s)).not.toContain('mastery-speed');
    for(let i=0;i<5;i++){s.choices=['mastery-damage'];expect(g.choose('mastery-damage')).toBe(true);} expect(masteryUsed(s.masteryBonus)).toBe(MASTERY.budgetBP); expect(s.choices).toEqual(['recover']); expect(s.pending).toBe(2); expect(s.rerollsRemaining).toBe(0); expect(g.reroll()).toBe(false);
    const hp=s.player.hp; expect(choiceDescription(s,'recover')).toContain('0 HP'); const id=s.draftId; expect(g.choose('recover',id)).toBe(true); expect(g.choose('recover',id)).toBe(false); expect(s.pending).toBe(1); g.choose('recover'); expect(s.phase).toBe('playing');expect(s.xp).toBe(17);expect(s.player.hp).toBe(hp);
  });
  it('chủ động thay mới mở lại progression; cancel giữ mọi thứ và bonus mastery không farm reset',()=>{
    const g=mastered(),s=g.state; s.masteryBonus.damage=1000; const snapshot=structuredClone(s); expect(availableUpgrades(s)).toEqual([]); expect(g.choose('drones')).toBe(false); g.beginSwap('drones'); expect(g.reroll()).toBe(false); g.cancelSwap(); expect(s).toEqual(snapshot);
    const id=s.draftId; g.beginSwap('drones'); expect(g.swap('plasma',id)).toBe(true); expect(g.swap('pulsar',id)).toBe(false); expect(s.modules.drones).toBe(1);expect(s.weaponMasteryReached).toBe(false);expect(s.masteryBonus.damage).toBe(1000);expect(availableUpgrades(s)).not.toContain('well');
    s.modules.drones=5; s.pending=1; prepareChoices(s,g.rng);expect(s.weaponMasteryReached).toBe(true); expect(masteryUsed(s.masteryBonus)).toBe(1000);expect(createRun(0).weaponMasteryReached).toBe(false);
  });
  it('multi-level addXP giữ dư và mỗi fallback tiêu đúng một action',()=>{
    const g=mastered(),s=g.state; s.masteryBonus.damage=2000;s.pending=0;addXP(s,1000);const pending=s.pending,xp=s.xp;prepareChoices(s,g.rng);s.player.hp=50;for(let i=0;i<pending;i++)expect(g.choose('recover')).toBe(true);expect(s.pending).toBe(0);expect(s.xp).toBe(xp);expect(s.player.hp).toBe(Math.min(s.player.maxHP,50+10*pending));
  });
});
describe('Evolution ownership',()=>{
  it('hình thái giữ ID/level, fusion atomic giữ draft/reroll/queue/mastery; double click từ chối',()=>{
    const g=mastered(),s=g.state; s.rerollsRemaining=0;s.pending=3;const before={choices:[...s.choices],xp:s.xp,pending:s.pending,draft:s.draftId};s.pulses.push({id:5,start:0,end:1,startAngle:0,swept:0,hitIds:new Set(),damage:1,range:100,level:5});s.ionTraces.push({id:6,points:[],end:1,level:5});const xp=totalGroundXP(s);
    expect(g.fuse()).toBe(true);expect(g.fuse()).toBe(false);expect(s.modules).toEqual({plasma:5,quasar:5});expect(s.pulses).toHaveLength(0);expect(s.ionTraces).toHaveLength(0);expect(s.weaponMasteryReached).toBe(false);expect(s.choices).not.toEqual(before.choices);expect(s.choices).toEqual(expect.arrayContaining(['drones','well']));expect({xp:s.xp,pending:s.pending,draft:s.draftId}).toEqual({xp:before.xp,pending:before.pending,draft:before.draft});expect(s.rerollsRemaining).toBe(0);expect(totalGroundXP(s)).toBe(xp);expect(s.nextQuasar).toBeGreaterThan(s.time);expect(availableReplacements(s)).not.toContain('pulsar');
    expect(moduleName('drones',5)).toBe('Orbital Bastion');expect(moduleName('well',5)).toBe('Singularity Well');expect(moduleName('plasma',3)).toBe('Mini Sun');
  });
  it('fusion sớm không giả mastery; trống ô vẫn nhận loại hợp lệ, không nguồn cũ',()=>{
    const s=createRun(0);s.modules={plasma:3,pulsar:5,ion:4};s.phase='paused';expect(fuseQuasar(s,Math.random)).toBe(false);s.modules.ion=5;expect(fuseQuasar(s,Math.random)).toBe(true);expect(s.weaponMasteryReached).toBe(false);expect(availableUpgrades(s)).toContain('drones');expect(availableUpgrades(s)).not.toContain('pulsar');expect(s.phase).toBe('paused');
  });
  it('Quasar visited dùng chung beam/chain, modifier một lần, cleanup đúng owner',()=>{
    const s=createRun(0);s.modules={quasar:5};s.supports={power:5,haste:5};s.salvage.bonuses.damage=1000;s.masteryBonus.damage=200;s.corruption=50;s.player.angle=0;
    const es=[100,180,260,340,420].map(x=>{const e=makeEnemy(s,'drifter',{x,y:110},'player');e.hp=e.maxHP=10000;return e;});
    weaponStep(s);s.time=QUASAR.duration;weaponStep(s);const damages=es.map(e=>10000-e.hp),multiplier=1.52*1.2;expect(damages.every(d=>d<=QUASAR.damage*multiplier+1e-7)).toBe(true);expect(damages.filter(d=>d>0)).toHaveLength(4);expect(damages.filter(d=>Math.abs(d-QUASAR.damage*multiplier)<1e-7)).toHaveLength(1);expect(s.metrics.ionHits).toBe(0);expect(s.metrics.pulsarHits).toBe(0);
    clearModuleAttacks(s,'quasar');expect(s.pulses).toHaveLength(0);expect(s.ionTraces).toHaveLength(0);
  });
  it('damage 30/60/144 render FPS bằng nhau qua clock; một boss không bị chain quay lại',()=>{
    const run=(fps:number):number=>{const g=new GameSession(),s=g.state,c=new GameClock();s.modules={quasar:5};s.nextSpawn=Infinity;s.bossSpawned=true;clearGroundXP(s);const e=makeEnemy(s,'drifter',{x:100,y:110},'player');e.hp=e.maxHP=10000;e.speed=0;e.damage=0;for(let i=0;i<5*fps;i++)c.advance(1/fps,()=>s.phase==='playing',dt=>g.step(dt));return 10000-e.hp;};expect(run(30)).toBeCloseTo(run(60));expect(run(144)).toBeCloseTo(run(60));
  });
});
describe('Astronomy clock/source/arbitration',()=>{
  it('warning/active/end chính xác, fast-forward không replay, regular gravity không queue; giữ630',()=>{
    const s=createRun(0);s.bossSpawned=true;for(const [t,id,phase] of [[206,'radiation','scheduled'],[207,'radiation','warning'],[210,'radiation','active'],[255,'radiation','completed'],[330,'chaos','active'],[420,'chaos','completed'],[465,'tide','active'],[510,'tide','completed']] as const){s.time=t;eventStep(s,()=>0);expect(s.astronomy.find(e=>e.id===id)?.phase).toBe(phase);expect(s.astronomy.filter(e=>['warning','active'].includes(e.phase)).length).toBeLessThanOrEqual(1);if(t===210||t===330)expect(s.gravity).toBeUndefined();}
    const jump=createRun(0);jump.bossSpawned=true;jump.gravity={x:1000,y:0,start:122,end:137,final:false};jump.time=600;eventStep(jump,()=>0);expect(jump.astronomy.every(e=>e.phase==='completed')).toBe(true);expect(jump.gravity).toBeUndefined();expect(jump.nextGravity).toBe(660);jump.time=630;eventStep(jump,()=>0);expect(jump.gravity?.final).toBe(true);expect(jump.gravity?.start).toBe(632);
  });
  it('chaos × minute giữ HP ratio trên enemy sống/mới, boss miễn buff và không drift',()=>{
    const s=createRun(0);s.time=329;eventStep(s,()=>0);const e=makeEnemy(s,'drifter',{x:900,y:0},'player');e.hp=e.maxHP/2;const boss=makeEnemy(s,'elder',{x:900,y:0},'player'),baseBoss=boss.hp;
    for(const time of [330,331,359,360,419,420]){s.time=time;eventStep(s,()=>0);const factor=time<420?1.5:1;expect(e.maxHP).toBeCloseTo(140*(1+0.14*Math.floor(time/60))*factor);expect(e.hp/e.maxHP).toBeCloseTo(0.5);expect(e.damage).toBeCloseTo(11*(1+0.09*Math.floor(time/60))*factor);expect(shipStats(s).eventOutgoing).toBe(time<420?1.15:1);expect(boss.hp).toBe(baseBoss);}
    s.time=350;eventStep(s,()=>0);const fresh=makeEnemy(s,'drifter',{x:1000,y:0},'player');expect(fresh.maxHP).toBeCloseTo(140*1.7*1.5);
  });
  it('pause/draft đóng băng event và hết event giữa queue chỉ sau resume',()=>{
    const g=new GameSession(),s=g.state;s.time=419.99;s.nextSpawn=Infinity;eventStep(s,g.rng);g.pause();const before=structuredClone(s);g.step(10);expect(s).toEqual(before);g.resume();g.step(B.step);expect(shipStats(s).eventOutgoing).toBe(1);s.pending=2;prepareChoices(s,g.rng);const t=s.time;g.step(100);expect(s.time).toBe(t);
  });
  it('radiation tick qua armor/Corruption một lần; boss/Beacon miễn, môi trường kill/drop một lần',()=>{
    const s=createRun(0);s.time=210;astronomyStep(s);s.player.x=s.astronomy[0].zones![0].x;s.player.y=s.astronomy[0].zones![0].y;s.supports={power:5,armor:5};s.corruption=50;s.masteryBonus.damage=2000;const e=makeEnemy(s,'wisp',s.player,'player');e.hp=0.1;const boss=makeEnemy(s,'elder',s.player,'player'),hp=boss.hp,xp=totalGroundXP(s);radiationStep(s,()=>0);expect(s.player.hp).toBeCloseTo(100-7*0.8*1.2);expect(s.kills).toBe(1);expect(s.salvage.rolls).toBe(1);expect(totalGroundXP(s)).toBe(xp+2);expect(boss.hp).toBe(hp);expect(s.beacon.hp).toBe(300);radiationStep(s,()=>0);expect(s.kills).toBe(1);expect(s.salvage.rolls).toBe(1);
  });
  it('tide hút/đẩy mượt, tâm hữu hạn, tàu cơ bản thoát, không kéo loot/đạn',()=>{
    const s=createRun(0);s.time=466.5;astronomyStep(s);expect(tideStrength(s)).toBeCloseTo(140);s.player.x=s.astronomy.find(e=>e.id==='tide')!.center!.x+100;s.player.y=s.astronomy.find(e=>e.id==='tide')!.center!.y;const original=s.player.x,loot=structuredClone(s.pickups);movementStep(s,{x:0,y:0},.1);expect(s.player.x).toBeLessThan(original);s.time=469.5;expect(tideStrength(s)).toBeCloseTo(-140);const x=s.player.x;movementStep(s,{x:0,y:0},.1);expect(s.player.x).toBeGreaterThan(x);s.player.x=s.astronomy.find(e=>e.id==='tide')!.center!.x;s.player.y=s.astronomy.find(e=>e.id==='tide')!.center!.y;movementStep(s,{x:0,y:0},.1);expect(Number.isFinite(s.player.x)).toBe(true);expect(s.pickups).toEqual(loot);
    s.time=466.5;s.player.x=s.astronomy.find(e=>e.id==='tide')!.center!.x+10;for(let i=0;i<180;i++){s.time+=B.step;movementStep(s,{x:1,y:0},B.step);}expect(s.player.x-s.astronomy.find(e=>e.id==='tide')!.center!.x).toBeGreaterThan(A.tideRadius);
  });
  it('result cleanup/new run không để modifier, zones/forces hay progression lây',()=>{
    const s=createRun(0);s.time=350;eventStep(s,()=>0);expect(shipStats(s).eventOutgoing).toBe(1.15);finishRun(s,'defeat','test');expect(shipStats(s).eventOutgoing).toBe(1);expect(s.astronomy.some(e=>e.phase==='active')).toBe(false);expect(createRun(0).astronomy.every(e=>e.phase==='scheduled')).toBe(true);
  });
});
it('Beacon flash chỉ từ damage thật, ưu tiên/tự về palette Core và freeze charge lúc pause',()=>{
  const g=new GameSession(3),s=g.state;const e=makeEnemy(s,'wisp',{x:0,y:0},'beacon');combatStep(s,0);expect(beaconFeedback(s,false).damaged).toBe(true);const last=s.beacon.lastHit;s.time=0.1;combatStep(s,0);expect(s.beacon.lastHit).toBe(last);s.time=0.21;expect(beaconFeedback(s,false).tint).toBe(0xffffff);e.nextHit=0;e.damage=0;combatStep(s,0);expect(s.beacon.lastHit).toBe(last);g.pause();const feedback=beaconFeedback(s,false);g.step(20);expect(beaconFeedback(s,false)).toEqual(feedback);expect(s.time).toBe(0.21);
});
