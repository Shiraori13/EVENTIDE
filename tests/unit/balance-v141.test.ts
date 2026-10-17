import { it, expect } from 'vitest';
import { mkdirSync, writeFileSync } from 'node:fs';
import { GameSession } from '../../src/game/core/GameSession';
import { seededRandom } from '../../src/game/core/math';
import { isBasicBuildComplete } from '../../src/game/core/buildProgress';
import { botInput, chooseBotUpgrade } from '../../src/game/debug/Autoplay';
import { canFuseQuasar } from '../../src/game/systems/EvolutionSystem';
import { totalGroundXP } from '../../src/game/systems/PickupSystem';
import { masteryUsed } from '../../src/game/config/mastery';
it('hotfix: sáu lượt tự nhiên có/không fusion, mastery chỉ sau đủ5ô; XP/budget giữ',()=>{
  const rows=[];
  for(const seed of [7,42,104])for(const fusion of [false,true]){
    const g=new GameSession(0,seededRandom(seed)),s=g.state;let fusionAt:number|undefined,masteryAt:number|undefined;const drafts=[];
    for(let frame=0;frame<43210&&!s.settled;frame++){
      while(s.phase==='choosingUpgrade'){
        if(fusion&&canFuseQuasar(s)){const xp=s.xp,pending=s.pending,budget=masteryUsed(s.masteryBonus);expect(g.fuse()).toBe(true);fusionAt=s.time;expect([s.xp,s.pending,masteryUsed(s.masteryBonus)]).toEqual([xp,pending,budget]);}
        if(s.choices.some(id=>id.startsWith('mastery-'))){expect(isBasicBuildComplete(s)).toBe(true);masteryAt??=s.time;}
        drafts.push({time:s.time,draft:s.draftId,choices:[...s.choices],modules:{...s.modules},supports:{...s.supports},mastery:masteryUsed(s.masteryBonus)});
        const pending=s.pending;chooseBotUpgrade(g,['hull','armor'],['plasma','pulsar','ion']);expect(s.pending).toBe(pending-1);
      }
      g.step(1/60,botInput(s));s.cues.length=0;
    }
    expect(s.settled).toBe(true);expect(s.loot.created).toBe(s.loot.collected+totalGroundXP(s));expect(masteryUsed(s.masteryBonus)).toBeLessThanOrEqual(2000);
    rows.push({seed,fusion,fusionAt,masteryAt,phase:s.phase,seconds:s.time,level:s.level,kills:s.kills,hp:s.player.hp,beacon:s.beacon.hp,reward:s.reward,modules:s.modules,supports:s.supports,mastery:s.masteryBonus,salvage:s.salvage.bonuses,xpCreated:s.loot.created,xpCollected:s.loot.collected,groundXP:totalGroundXP(s),drafts});
  }
  mkdirSync('artifacts/v141',{recursive:true});writeFileSync('artifacts/v141/natural-playtest.json',JSON.stringify({method:'Fast-forward60Hz; bot Hull/Armor/Plasma/Pulsar/Ion; draft/reroll/drop thật, không cấp HP/XP/time; không là win-rate người thật.',rows},null,2));
},120000);
