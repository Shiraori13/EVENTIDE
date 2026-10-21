import type { RunState, TutorialId } from '../core/types';
import type { SaveService } from './SaveService';
import { BALANCE as B } from '../config/balance';
import { hasQuasarRecipe } from '../systems/EvolutionSystem';
import { urgentSituation } from '../presentation/HudWarnings';
export const TUTORIALS:Record<TutorialId,string>={
  outside:'Ngoài vùng sáng, Corruption tăng. Trở về ánh sáng để giảm.',
  'beacon-hit':'Quái có dấu tam giác vàng nhắm Beacon. Quay về bảo vệ nguồn sáng.',
  evolution:'Pulsar 5 + Ion 5 đã đủ. Mở Balo (B), chọn Tiến hóa rồi xác nhận.',
};
/** Queue tối đa ba tình huống, theo owner lượt; seen chỉ commit sau khi DOM thực sự hiện. */
export class TutorialService {
  private owner?:RunState; private queue:TutorialId[]=[];
  private current?:TutorialId; private until=0; private nextAt=0;
  constructor(private save:SaveService){}
  reset():void {this.owner=undefined;this.queue=[];this.current=undefined;this.nextAt=0;}
  observe(s:RunState):void {
    if(this.owner!==s){this.reset();this.owner=s;}
    if(!this.save.data.settings.tutorial)return;
    const triggers: [TutorialId,boolean][]=[['outside',s.telemetry.farSeconds>0||Math.hypot(s.player.x,s.player.y)>B.lightRadius],['beacon-hit',s.beacon.lastHit>=0],['evolution',hasQuasarRecipe(s)]];
    for(const[id,trigger]of triggers)if(trigger&&!this.save.data.tutorialSeen.includes(id)&&!this.queue.includes(id)&&this.current!==id)this.queue.push(id);
  }
  candidate(s:RunState,obscured:boolean):TutorialId|undefined {
    this.observe(s);
    if(!this.save.data.settings.tutorial||s.phase!=='playing'||obscured||urgentSituation(s))return;
    if(this.current&&s.time>=this.until){this.current=undefined;this.nextAt=s.time+3;}
    const id=this.current??(s.time>=this.nextAt?this.queue[0]:undefined);
    // Có thể người chơi đã hợp nhất/thay nguồn trong lúc hint đang hoãn; không chỉ một CTA hết điều kiện.
    if(id==='evolution'&&!hasQuasarRecipe(s))return;
    return id;
  }
  displayed(id:TutorialId,s:RunState):void {
    if(this.current===id)return;
    this.current=id;this.until=s.time+10;this.queue=this.queue.filter(x=>x!==id);
    if(!this.save.data.tutorialSeen.includes(id)){this.save.data.tutorialSeen.push(id);this.save.write();}
  }
  skip(s?:RunState):void {this.current=undefined;this.nextAt=(s?.time??0)+3;}
}
