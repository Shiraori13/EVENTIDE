import { PLASMA,DRONES,WELLS,PULSAR,ION,QUASAR,UPGRADES,type ModuleId,type ChoiceId,type SupportId } from '../config/content';
import { SUPPORTS } from '../config/progression';
import { MASTERY,masteryStat,masteryUsed } from '../config/mastery';
import { SALVAGE } from '../config/salvage';
import { BALANCE as B } from '../config/balance';
import { shipStats,calculateStats,attackInterval,supportBonus,type ShipStats } from './stats';
import type { RunState } from './types';
import { upgradeLevel,isMastery } from '../systems/ExperienceSystem';
export interface PreviewChange { label:string; before:number|undefined; after:number; unit:string }
export interface UpgradePreview { changes:PreviewChange[]; purpose:string }
/** Cùng content/stat/interval calculator với runtime; không dựng DPS giả từ một hit. */
function weaponValues(id:ModuleId,level:number,stats:ShipStats):{label:string;value:number;unit:string}[] {
  const d=id==='plasma'?PLASMA[level-1]:id==='drones'?DRONES[level-1]:id==='well'?WELLS[level-1]:id==='pulsar'?PULSAR[level-1]:id==='ion'?ION[level-1]:QUASAR;
  const rows=[{label:'Sát thương / hit',value:d.damage*stats.outgoing,unit:'HP'},{label:'Nhịp',value:attackInterval(d.cooldown,stats),unit:'giây'}];
  rows.push('count'in d?{label:'Drone',value:d.count,unit:''}:'targets'in d?{label:'Mục tiêu tối đa',value:d.targets,unit:''}:id==='well'?{label:'Vùng',value:WELLS[level-1].radius,unit:'u'}:{label:'Tầm',value:'range'in d?d.range:0,unit:'u'});
  return rows;
}
const PURPOSE:Record<ModuleId|SupportId,string>={plasma:'Tự bắn mục tiêu gần; cấp 3 và 5 mở vụ nổ.',drones:'Drone bảo vệ quanh tàu, đánh theo nhịp từng mục tiêu.',well:'Hút quái vào vùng rồi phát nổ.',pulsar:'Quét quanh tàu, mỗi mục tiêu nhận một hit.',ion:'Sét chuyền giữa các mục tiêu khác nhau.',quasar:'Quét quạt và chuyền tia trong cùng tầm hoạt động.',power:'Tăng sát thương của mọi vũ khí.',haste:'Bắn thường xuyên hơn; nhịp gốc chia cho hệ số tốc độ.',hull:'Tăng HP tối đa và cộng đúng phần HP tăng.',engine:'Bay nhanh hơn để đổi vị trí.',magnet:'Nhặt Stardust ở khoảng cách xa hơn.',armor:'Giảm sát thương tàu nhận trước hệ số Corruption.'};
export function upgradePreview(s:RunState,id:ChoiceId):UpgradePreview {
  const before=shipStats(s),level=upgradeLevel(s,id);
  if(id==='recover')return {purpose:'Tiếp tục tiến trình, giữ XP dư.',changes:[{label:'HP tàu',before:Math.max(0,s.player.hp),after:Math.min(s.player.maxHP,s.player.hp+B.fallbackHeal),unit:'HP'},{label:'Lựa chọn chờ',before:s.pending,after:Math.max(0,s.pending-1),unit:''}]};
  if(!isMastery(id)&&UPGRADES[id].kind==='module') {
    const after=weaponValues(id as ModuleId,Math.min(5,level+1),before),old=level?weaponValues(id as ModuleId,level,before):[];
    const changes:PreviewChange[]=after.map((r,i)=>({label:r.label,before:old[i]?.value,after:r.value,unit:r.unit}));
    if(id==='plasma'&&PLASMA[Math.min(4,level)].blast!==(level?PLASMA[level-1].blast:0))changes[2]={label:'Bán kính nổ',before:level?PLASMA[level-1].blast:undefined,after:PLASMA[Math.min(4,level)].blast,unit:'u'};
    return {purpose:PURPOSE[id],changes};
  }
  const mastery=isMastery(id),stat=mastery?masteryStat(id):undefined;
  const after=calculateStats(s.characterId,mastery?s.supports:{...s.supports,[id]:level+1},s.corruption,s.salvage.bonuses,stat?{...s.masteryBonus,[stat]:s.masteryBonus[stat]+MASTERY.stepBP}:s.masteryBonus,before.eventOutgoing);
  const key=mastery?({damage:'outgoing',rate:'attackRate',hp:'maxHP',pickup:'pickupRadius',speed:'moveSpeed'} as const)[stat!]:({power:'outgoing',haste:'attackRate',hull:'maxHP',engine:'moveSpeed',magnet:'pickupRadius',armor:'incoming'} as const)[id as SupportId];
  const label=key==='outgoing'?'Hệ số sát thương':key==='attackRate'?'Hệ số tốc độ bắn':key==='maxHP'?'HP tối đa':key==='moveSpeed'?'Tốc độ bay':key==='pickupRadius'?'Bán kính nhặt':'Hệ số sát thương nhận';
  const changes:PreviewChange[]=[{label,before:before[key],after:after[key],unit:key==='maxHP'?'HP':key==='moveSpeed'?'u/s':key==='pickupRadius'?'u':'×'}];
  if(mastery)changes.push({label:'Bonus mastery '+SALVAGE.stats[stat!].name,before:s.masteryBonus[stat!]/100,after:(s.masteryBonus[stat!]+MASTERY.stepBP)/100,unit:'%'},{label:'Ngân sách đã dùng',before:masteryUsed(s.masteryBonus)/100,after:(masteryUsed(s.masteryBonus)+MASTERY.stepBP)/100,unit:'% / 20%'});
  else changes.push({label:'Bonus '+SUPPORTS[id as SupportId].name,before:supportBonus(s.supports,id as SupportId)*100,after:supportBonus({...s.supports,[id]:level+1},id as SupportId)*100,unit:'%'});
  return {changes,purpose:mastery?'Bonus cộng trên gốc, giữ đến hết lượt.':PURPOSE[id as SupportId]};
}
