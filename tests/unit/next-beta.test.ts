import { describe,it,expect } from 'vitest';
import { createRun,finishRun,GameSession } from '../../src/game/core/GameSession';
import { hitPlayer,hitEnvironment,hitEnemy,combatStep } from '../../src/game/systems/CombatSystem';
import { makeEnemy } from '../../src/game/systems/SpawnSystem';
import { sampleRunTelemetry } from '../../src/game/core/runReport';
import { upgradePreview } from '../../src/game/core/upgradePreview';
import { chooseUpgrade } from '../../src/game/systems/ExperienceSystem';
import { shipStats,attackInterval } from '../../src/game/core/stats';
import { PLASMA } from '../../src/game/config/content';
import { SaveService,defaultSave,validateSave } from '../../src/game/services/SaveService';
import { TutorialService } from '../../src/game/services/TutorialService';
import { HudWarnings } from '../../src/game/presentation/HudWarnings';
import { NotificationQueue } from '../../src/game/ui/NotificationQueue';

describe('Báo cáo HP thực nhận và settlement',()=>{
 it('sau giáp + Corruption, miễn nhiễm và cooldown không double count, clamp fatal',()=>{
  const s=createRun(0);s.supports={armor:5};s.corruption=50;s.player.hp=10;
  expect(hitPlayer(s,5,{kind:'wisp',channel:'contact'})).toBe(true);expect(s.player.hp).toBeCloseTo(5.2);
  hitPlayer(s,100,{kind:'elder',channel:'beam',ownerId:7});expect(s.telemetry.fatal.ship).toBeUndefined();
  s.invulnerableUntil=1;expect(hitEnvironment(s,100,'radiation',1)).toBe(false);
  s.invulnerableUntil=0;hitEnvironment(s,100,'radiation',1);hitEnvironment(s,100,'radiation',1);
  const entries=Object.values(s.telemetry.incoming.ship);expect(entries.reduce((sum,e)=>sum+e.hp,0)).toBeCloseTo(10);expect(s.telemetry.fatal.ship).toEqual({kind:'radiation',channel:'radiation',ownerId:undefined});
  s.time=2;hitPlayer(s,100,{kind:'harrier',channel:'projectile',ownerId:9});expect(s.telemetry.fatal.ship?.kind).toBe('radiation');
 });
 it('hai mục tiêu chết cùng tick, giữ cả fatal và ưu tiên defeat ở720',()=>{
  const game=new GameSession(),s=game.state;s.time=720;s.player.x=900;s.player.y=0;s.player.hp=1;s.beacon.hp=2;s.nextSpawn=Infinity;
  makeEnemy(s,'wisp',{x:900,y:0},'player');makeEnemy(s,'drifter',{x:0,y:0},'beacon');combatStep(s,0);game.step(1/60);
  expect(s.report?.cause).toBe('both');expect(s.phase).toBe('defeat');expect(s.report?.telemetry.fatal.ship?.kind).toBe('wisp');expect(s.report?.telemetry.fatal.beacon?.kind).toBe('drifter');expect(s.report?.telemetry.beaconDamageFar).toBe(2);
 });
 it('boss owner projectile và beam được phân biệt, Solar không giả môi trường',()=>{
  const s=createRun(0),boss=makeEnemy(s,'elder',{x:600,y:0},'player');s.player.hp=100;
  s.projectiles.push({id:99,x:0,y:110,vx:0,vy:0,ttl:1,damage:5,blast:0,hostile:true,radius:7,ownerId:boss.id});combatStep(s,0);
  expect(Object.values(s.telemetry.incoming.ship)[0].source).toEqual({kind:'elder',channel:'projectile',ownerId:boss.id});
  s.time=2;hitEnvironment(s,5,'radiation',1,77);expect(Object.values(s.telemetry.incoming.ship).at(-1)?.source).toEqual({kind:'helion',channel:'radiation',ownerId:77});
  boss.boss!.beam={ownerId:boss.id,x:0,y:110,angle:0,fire:2,end:4,damage:7};combatStep(s,0);
  expect(Object.values(s.telemetry.incoming.ship).at(-1)?.source).toEqual({kind:'elder',channel:'beam',ownerId:boss.id});
 });
 it('snapshot trước cleanup, đóng băng build/counters, thưởng một lần',()=>{
  const s=createRun(0);s.time=125;s.modules={quasar:5,plasma:5};s.supports={hull:4,armor:5};const e=makeEnemy(s,'wisp',{x:200,y:0},'player');hitEnemy(s,e,1000,'quasar');
  finishRun(s,'defeat','fixture');const report=s.report!;expect(s.enemies).toHaveLength(0);expect(report.modules).toEqual({quasar:5,plasma:5});expect(report.telemetry.outgoing.quasar).toBe(e.maxHP);expect(Object.isFrozen(report.telemetry.outgoing)).toBe(true);
  s.modules.plasma=1;s.telemetry.outgoing.quasar=9999;finishRun(s,'victory','late');expect(s.report).toBe(report);expect(report.modules.plasma).toBe(5);expect(report.reward).toBe(2);expect(report.telemetry.outgoing.quasar).toBe(e.maxHP);
 });
 it('phase1 overkill chỉ đếm pool đầu, damage transition không đếm; pause không tăng timer',()=>{
  const g=new GameSession(),s=g.state,b=makeEnemy(s,'elder',{x:900,y:0},'player');const hp=b.hp;hitEnemy(s,b,1e8,'ion');hitEnemy(s,b,1e8,'ion');expect(s.telemetry.outgoing.ion).toBe(hp);
  s.player.x=900;s.corruption=60;sampleRunTelemetry(s,.5);const before=structuredClone(s.telemetry);g.pause();g.step(20);expect(s.telemetry).toEqual(before);
 });
});
describe('Preview dùng calculator gameplay',()=>{
 it('haste có gear/mastery/Chaos, rate khác phần trăm giảm interval',()=>{
  const s=createRun(0);s.modules={plasma:3};s.supports={haste:2};s.salvage.bonuses.rate=700;s.masteryBonus.rate=400;s.corruption=60;s.astronomy[1].phase='active';
  const preview=upgradePreview(s,'haste'),before=shipStats(s);s.phase='choosingUpgrade';s.pending=1;s.choices=['haste'];chooseUpgrade(s,'haste',()=>.5);
  expect(preview.changes[0].before).toBeCloseTo(before.attackRate);expect(preview.changes[0].after).toBeCloseTo(shipStats(s).attackRate);expect(attackInterval(PLASMA[2].cooldown,shipStats(s))).toBeCloseTo(PLASMA[2].cooldown/preview.changes[0].after);
 });
 it('Plasma level3 blast/damage preview khớp hit đã armor/Corruption/gear/mastery/event',()=>{
  const s=createRun(0);s.modules={plasma:2};s.supports={power:3};s.corruption=50;s.salvage.bonuses.damage=1000;s.masteryBonus.damage=200;
  const p=upgradePreview(s,'plasma');s.phase='choosingUpgrade';s.choices=['plasma'];s.pending=1;chooseUpgrade(s,'plasma',()=>.2);
  const e=makeEnemy(s,'drifter',{x:200,y:0},'player'),before=e.hp;hitEnemy(s,e,PLASMA[2].damage,'plasma');expect(before-e.hp).toBeCloseTo(p.changes[0].after);
 });
});
describe('Hướng dẫn có queue và migration không mất meta',()=>{
 const service=()=>new SaveService({getItem:()=>null,setItem:()=>{}});
 it('save1/2/3 default cờ, settings tắt được giữ; malformed IDs không chui vào',()=>{
  for(const v of [1,2,3]){const old={...defaultSave(),saveVersion:v,currency:99,coreLevel:2,echo:true,tutorialSeen:['outside','outside','bad',{},null],settings:{...defaultSave().settings,tutorial:false}};const saved=validateSave(old);expect(saved.currency).toBe(99);expect(saved.coreLevel).toBe(2);expect(saved.echo).toBe(true);expect(saved.tutorialSeen).toEqual(['outside']);expect(saved.settings.tutorial).toBe(false);}
  expect(validateSave({saveVersion:3,currency:8,settings:{quality:'low'}}).settings.tutorial).toBe(true);
 });
 it('trigger ngoài sáng hoãn qua danger/draft, seen chỉ khi hiện; skip không hiện lại',()=>{
  const save=service(),tips=new TutorialService(save),s=createRun(0);s.player.x=900;s.player.hp=20;expect(tips.candidate(s,false)).toBeUndefined();expect(save.data.tutorialSeen).toEqual([]);
  s.player.x=0;s.player.hp=100;s.phase='choosingUpgrade';expect(tips.candidate(s,false)).toBeUndefined();s.phase='playing';expect(tips.candidate(s,false)).toBe('outside');expect(save.data.tutorialSeen).toEqual([]);tips.displayed('outside',s);tips.skip(s);s.time=20;expect(tips.candidate(s,false)).toBeUndefined();expect(save.data.tutorialSeen).toEqual(['outside']);
 });
 it('Beacon actual và evolution xếp hàng, disabled/replay chỉ đổi tutorial',()=>{
  const save=service(),tips=new TutorialService(save),s=createRun(0);save.data.currency=20;s.beacon.lastHit=0;s.modules={pulsar:5,ion:5};expect(tips.candidate(s,false)).toBeUndefined();s.time=3;expect(tips.candidate(s,false)).toBe('beacon-hit');tips.displayed('beacon-hit',s);tips.skip(s);s.time=7;expect(tips.candidate(s,false)).toBe('evolution');save.data.settings.tutorial=false;expect(tips.candidate(s,false)).toBeUndefined();save.data.tutorialSeen=[];save.data.settings.tutorial=true;tips.reset();expect(save.data.currency).toBe(20);expect(tips.candidate(s,false)).toBe('beacon-hit');
 });
 it('recipe mất điều kiện hoặc đã hợp nhất khi đang hoãn không hiện CTA cũ',()=>{
  const save=service(),tips=new TutorialService(save),s=createRun(0);s.modules={pulsar:5,ion:5};expect(tips.candidate(s,true)).toBeUndefined();s.modules={quasar:5};expect(tips.candidate(s,false)).toBeUndefined();expect(save.data.tutorialSeen).toEqual([]);s.modules={pulsar:5,ion:5};expect(tips.candidate(s,false)).toBe('evolution');
 });
});
it('HUD hysteresis không nhấp nháy quanh25/50 và không sửa buff thật',()=>{
 const s=createRun(0),w=new HudWarnings();s.player.hp=25;w.update(s);expect(w.ship).toBe('critical');s.player.hp=26;w.update(s);expect(w.ship).toBe('critical');s.player.hp=32;w.update(s);expect(w.ship).toBe('warning');s.player.hp=51;w.update(s);expect(w.ship).toBe('warning');s.player.hp=58;w.update(s);expect(w.ship).toBe('normal');s.corruption=40;w.update(s);s.corruption=39;w.update(s);expect(w.corruption).toBe(true);expect(shipStats(s).corruption).toBe(1);s.corruption=34;w.update(s);expect(w.corruption).toBe(false);
});
it('notification queue bounded, gộp trùng, không tiêu khi đang blocked',()=>{
 const q=new NotificationQueue();q.add(['Một','Một']);expect(q.text(1,true)).toBe('');expect(q.text(2,false)).toContain('Một');q.add(['Một','Hai']);expect(q.text(5003,false)).toContain('Hai');expect(q.text(10004,false)).toBe('');
 q.add(['Ba']);expect(q.text(10005,false)).toContain('Ba');
});
