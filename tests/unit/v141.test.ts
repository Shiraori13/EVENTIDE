import { it, expect, vi } from 'vitest';
import { GameSession, createRun } from '../../src/game/core/GameSession';
import { prepareChoices, availableChoices, addXP, rerollReason } from '../../src/game/systems/ExperienceSystem';
import { getBasicBuildProgress, isBasicBuildComplete } from '../../src/game/core/buildProgress';
import { tryFuseQuasar, quasarEligibility } from '../../src/game/systems/EvolutionSystem';
import { UPGRADES, DRONES, WELLS, PLASMA } from '../../src/game/config/content';
import { weaponStep } from '../../src/game/systems/WeaponSystem';
import { combatStep } from '../../src/game/systems/CombatSystem';
import { makeEnemy } from '../../src/game/systems/SpawnSystem';
import { shipStats } from '../../src/game/core/stats';
import { masteryUsed } from '../../src/game/config/mastery';
function full() { const g=new GameSession(),s=g.state;s.modules={plasma:5,pulsar:5,ion:5};s.supports={hull:5,armor:5};s.pending=2;prepareChoices(s,g.rng);return g; }
it('P02/P10: ba vũ khí5, Hull1 và ô trống giữ18% nhưng draft cơ sở',()=>{
  const g=new GameSession(),s=g.state;
  s.modules={plasma:5,pulsar:5,ion:5};s.supports={hull:1};s.masteryBonus.damage=1800;s.pending=2;
  prepareChoices(s,g.rng);
  expect(s.choices.some(id=>id.startsWith('mastery-'))).toBe(false);
  expect(availableChoices(s)).toContain('hull');expect(s.masteryBonus.damage).toBe(1800);
});
it.each([{}, {hull:1}, {hull:5,armor:4}])('P01/P02/P03/P08: hỗ trợ %j không mở mastery, pool không thay vũ khí',supports=>{
  const g=full(),s=g.state;s.supports=supports;prepareChoices(s,g.rng);
  expect(isBasicBuildComplete(s)).toBe(false);expect(s.choices.every(id=>UPGRADES[id as keyof typeof UPGRADES]?.kind==='support')).toBe(true);
  const count=s.pending,picks=s.picks,xp=s.xp;g.reroll();expect(s.choices.every(id=>UPGRADES[id as keyof typeof UPGRADES]?.kind==='support')).toBe(true);expect([s.pending,s.picks,s.xp]).toEqual([count,picks,xp]);
});
it('P04/P05: module4 còn base; đúng năm ô max mới mastery, evolved ID vẫn đúng',()=>{
  const g=full(),s=g.state;s.modules.ion=4;prepareChoices(s,g.rng);expect(s.choices).toEqual(['ion']);s.modules={plasma:5,drones:5,well:5};prepareChoices(s,g.rng);expect(isBasicBuildComplete(s)).toBe(true);expect(s.choices.every(id=>id.startsWith('mastery-'))).toBe(true);
});
it('P06: missing/null/hole/unknown ID/invalid level/definition không hoàn tất',()=>{
  const s=full().state;
  for (const value of [undefined,null,[],new Array(3),{plasma:5,pulsar:5},{plasma:5,pulsar:5,unknown:5},{plasma:5,pulsar:5,ion:NaN},{plasma:5,pulsar:5,ion:6}]) expect(isBasicBuildComplete({...s,modules:value as typeof s.modules})).toBe(false);
  for(const value of [null,new Array(2),{hull:5,unknown:5},{hull:5,armor:0}])expect(isBasicBuildComplete({...s,supports:value as typeof s.supports})).toBe(false);
  const max=UPGRADES.ion.max;try{UPGRADES.ion.max=0;expect(isBasicBuildComplete(s)).toBe(false);}finally{UPGRADES.ion.max=max;}
  const definition=UPGRADES.ion;try{Object.assign(UPGRADES,{ion:null});expect(isBasicBuildComplete(s)).toBe(false);}finally{UPGRADES.ion=definition;}
  expect(getBasicBuildProgress({...s,supports:{hull:1}})).toMatchObject({modules:{occupied:3,maxed:3},supports:{occupied:1,maxed:0},complete:false});
});
it('P07/P09: nhiều cấp qua ranh cuối support, không tự tặng mastery, XP/pick đúng',()=>{
  const g=full(),s=g.state;s.pending=0;s.supports.armor=4;addXP(s,50);const pending=s.pending,xp=s.xp;prepareChoices(s,g.rng);expect(s.choices).toEqual(['armor']);expect(g.choose('armor')).toBe(true);expect(masteryUsed(s.masteryBonus)).toBe(0);expect(s.pending).toBe(pending-1);expect(s.choices.every(id=>id.startsWith('mastery-'))).toBe(true);expect(g.choose(s.choices[0])).toBe(true);expect(masteryUsed(s.masteryBonus)).toBe(200);expect(s.xp).toBe(xp);
});
it('P08: không alternate thì disable có lý do, không tiêu reroll',()=>{
  const g=full(),s=g.state;s.supports.armor=4;prepareChoices(s,g.rng);expect(rerollReason(s)).toContain('Không còn');expect(g.reroll()).toBe(false);expect(s.rerollsRemaining).toBe(1);expect(s.choices).toEqual(['armor']);
});
it('reroll thẻ stale chỉ refresh, giữ ngân sách/draft/pending',()=>{
  const g=full(),s=g.state,id=s.draftId;s.supports={hull:1};s.choices=['mastery-hp'];const pending=s.pending;
  expect(g.reroll()).toBe(false);expect(s.draftId).toBe(id);expect(s.rerollsRemaining).toBe(1);expect(s.pending).toBe(pending);expect(s.choices.every(id=>!id.startsWith('mastery-'))).toBe(true);
});
it('P10/P11/P12/E03: fusion18%, stale mastery refresh giữ draft/XP/reroll, hoàn thiện lại chỉ còn2%',()=>{
  const g=full(),s=g.state;s.masteryBonus.damage=1800;s.choices=['mastery-hp'];s.rerollsRemaining=0;s.xp=19;
  const id=s.draftId,pending=s.pending,picks=s.picks;expect(g.fuse()).toBe(true);expect(s.choices).toEqual(expect.arrayContaining(['drones','well']));expect(isBasicBuildComplete(s)).toBe(false);expect(s.draftId).toBe(id);expect(s.pending).toBe(pending);expect(s.rerollsRemaining).toBe(0);
  s.choices=['mastery-hp'];expect(g.choose('mastery-hp',id)).toBe(false);expect(s.notice).toContain('chưa tiêu lượt');expect(s.draftId).toBe(id);expect(s.pending).toBe(pending);expect(s.picks).toBe(picks);expect(s.xp).toBe(19);expect(masteryUsed(s.masteryBonus)).toBe(1800);
  s.modules.drones=5;prepareChoices(s,g.rng);s.choices=['mastery-damage'];expect(g.choose('mastery-damage')).toBe(true);expect(masteryUsed(s.masteryBonus)).toBe(2000);expect(s.choices).toEqual(['recover']);s.player.hp=s.player.maxHP;expect(g.choose('recover')).toBe(true);expect(s.pending).toBe(0);expect(s.xp).toBe(19);
});
it('E02/E04/E05: supports độc lập recipe, double commit từ chối; context có lý do',()=>{
  const g=full(),s=g.state;s.supports={hull:1};g.pause();expect(quasarEligibility(s).ok).toBe(true);const original=structuredClone(s);s.modules.ion=4;expect(tryFuseQuasar(s,g.rng).reason).toContain('cấp 5');s.modules.ion=5;expect(g.fuse()).toBe(true);expect(g.fuse()).toBe(false);expect(s.modules).toEqual({plasma:5,quasar:5});expect(s.masteryBonus).toEqual(original.masteryBonus);s.settled=true;expect(quasarEligibility(s).ok).toBe(false);
});
it('E06: output factory/definition lỗi không consume, RNG draft lỗi cũng rollback',()=>{
  const g=full(),s=g.state;const before=structuredClone(s);const log=vi.spyOn(console,'error').mockImplementation(()=>{});
  try {
    expect(tryFuseQuasar(s,g.rng,()=>{throw new Error('factory fixture');}).ok).toBe(false);expect(s).toEqual(before);
    expect(tryFuseQuasar(s,g.rng,()=>({id:'quasar',level:1,nextAttack:0})).ok).toBe(false);expect(s).toEqual(before);
    expect(tryFuseQuasar(s,()=>{throw new Error('draft fixture');}).ok).toBe(false);expect(s).toEqual(before);
    const max=UPGRADES.quasar.max;try{UPGRADES.quasar.max=0;expect(quasarEligibility(s).ok).toBe(false);}finally{UPGRADES.quasar.max=max;}
  }finally{log.mockRestore();}
});
it('Pause commit không tiến time/enemy/boss/event/charge/Corruption/XP, chỉ dọn nguồn và tăng revision',()=>{
  const g=full(),s=g.state;g.pause();s.time=350;s.corruption=60;const e=makeEnemy(s,'elder',{x:900,y:0},'player');s.beam={ownerId:e.id,x:900,y:0,angle:0,fire:352,end:353,damage:27.5,locked:false};
  const frozen=structuredClone({time:s.time,player:s.player,beacon:s.beacon,enemies:s.enemies,beam:s.beam,astronomy:s.astronomy,corruption:s.corruption,xp:s.xp,salvage:s.salvage,supports:s.supports});expect(g.fuse()).toBe(true);g.step(90);
  expect({time:s.time,player:s.player,beacon:s.beacon,enemies:s.enemies,beam:s.beam,astronomy:s.astronomy,corruption:s.corruption,xp:s.xp,salvage:s.salvage,supports:s.supports}).toEqual(frozen);expect(s.buildRevision).toBe(1);
});
it('E10: auto hình thái đơn có damage/radius thật và modifier một lần',()=>{
  for(const id of ['plasma','drones','well'] as const){
    const s=createRun(0);s.modules={[id]:5};s.supports={power:5,haste:5};s.salvage.bonuses.damage=1000;s.masteryBonus.damage=200;s.corruption=50;
    const e=makeEnemy(s,'drifter',{x:id==='drones'?DRONES[4].radius:180,y:s.player.y},'player');e.hp=e.maxHP=10000;e.speed=0;
    if(id==='drones') {s.time=0; e.x=s.player.x+DRONES[4].radius;e.y=s.player.y;weaponStep(s);expect(10000-e.hp).toBeCloseTo(DRONES[4].damage*shipStats(s).outgoing);}
    if(id==='well'){weaponStep(s);expect(s.wells[0].radius).toBe(WELLS[4].radius);s.time=s.wells[0].end;weaponStep(s);expect(10000-e.hp).toBeCloseTo(WELLS[4].damage*shipStats(s).outgoing);}
    if(id==='plasma'){weaponStep(s);expect(s.projectiles[0].blast).toBe(PLASMA[4].blast);const p=s.projectiles[0];p.previousX=p.x;p.previousY=p.y;p.x=e.x;p.y=e.y;combatStep(s,0);expect(10000-e.hp).toBeCloseTo(PLASMA[4].damage*shipStats(s).outgoing);}
  }
});
it('base chưa đủ mà pool rỗng: safe fallback kèm dev report, không giả mastery',()=>{
  const g=full(),s=g.state;s.modules={plasma:5,pulsar:5,ion:5,quasar:5};const log=vi.spyOn(console,'error').mockImplementation(()=>{});
  try{prepareChoices(s,g.rng);expect(availableChoices(s)).toEqual(['recover']);expect(log).toHaveBeenCalled();expect(s.notice).toContain('Chưa thể');expect(g.choose('recover')).toBe(true);}finally{log.mockRestore();}
});
