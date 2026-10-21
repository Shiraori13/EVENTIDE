import { afterEach, describe, expect, it, vi } from 'vitest';
import { SaveService, defaultSave, validateSave } from '../../src/game/services/SaveService';
import { ShipPresentation, dampAngle } from '../../src/game/presentation/ShipPresentation';
import { COLORS } from '../../src/game/config/design';
import { arcSegments } from '../../src/game/presentation/geometry';

afterEach(()=>vi.unstubAllGlobals());
describe('Presentation preferences và dữ liệu cũ',()=>{
  it('giữ meta, quality và audio; bổ sung motion từ lựa chọn giảm hiệu ứng cũ',()=>{
    const old={...defaultSave(),currency:654,coreLevel:2,echo:true,careerKills:500,settings:{muted:true,volume:.72,reducedEffects:true,shake:false,quality:'low'}};
    const migrated=validateSave(old);expect(migrated.currency).toBe(654);expect(migrated.coreLevel).toBe(2);expect(migrated.echo).toBe(true);expect(migrated.careerKills).toBe(500);
    expect(migrated.settings).toEqual({...old.settings,reducedMotion:true,tutorial:true});
    expect(validateSave({...old,settings:{...old.settings,reducedMotion:false,quality:'high'}}).settings).toEqual({...old.settings,reducedMotion:false,quality:'high',tutorial:true});
  });
  it('OS chỉ áp dụng khi chưa có profile, explicit false còn nguyên sau ghi/đọc',()=>{
    vi.stubGlobal('matchMedia',()=>({matches:true}));let raw:string|null=null;const storage={getItem:()=>raw,setItem:(_key:string,value:string)=>{raw=value;}};
    const fresh=new SaveService(storage);expect(fresh.data.settings.reducedMotion).toBe(true);expect(fresh.data.settings.quality).toBe('medium');
    fresh.data.settings.reducedMotion=false;fresh.data.settings.quality='medium';fresh.data.currency=123;fresh.write();
    const restored=new SaveService(storage);expect(restored.data.settings.reducedMotion).toBe(false);expect(restored.data.currency).toBe(123);expect(restored.data.settings.quality).toBe('medium');
  });
});
describe('Pose chỉ dùng clock trình bày mô phỏng',()=>{
  it('cung ngắn giữ sai số dưới pixel, không chia100đoạn mỗi vòng đứt',()=>{
    expect(arcSegments(200,Math.PI/12)).toBeLessThan(5);expect(arcSegments(63,0)).toBe(0);
    for(const radius of[10,63,91,146,205,240,510])for(const angle of[Math.PI/12,Math.PI/2,Math.PI*2]){
      const count=arcSegments(radius,angle),error=radius*(1-Math.cos(angle/count/2));expect(error).toBeLessThanOrEqual(.35000001);expect(count).toBeLessThanOrEqual(128);
    }
    expect(arcSegments(1e9,Math.PI*2)).toBe(128);
  });
  it('đổi hướng qua ±π đi cung ngắn; pause không đổi pose; bank hữu hạn và dừng hết thrust',()=>{
    expect(dampAngle(Math.PI-.01,-Math.PI+.01,.05)).toBeGreaterThan(Math.PI-.01);
    const ship=new ShipPresentation();ship.reset(0,0);
    for(let i=1;i<=60;i++){ship.update(i%2?Math.PI:-Math.PI,true,i/60);expect(Math.abs(ship.bank)).toBeLessThanOrEqual(.12);}
    const paused={angle:ship.angle,bank:ship.bank,thrust:ship.thrust};ship.update(1,false,1);expect({angle:ship.angle,bank:ship.bank,thrust:ship.thrust}).toEqual(paused);
    for(let i=61;i<=180;i++)ship.update(0,false,i/60);expect(ship.thrust).toBeLessThan(.001);expect(Math.abs(ship.bank)).toBeLessThan(.001);
    ship.update(-2,true,3.1,true);expect(ship.angle).toBe(-2);expect(ship.bank).toBe(0);
  });
  it('chữ chính/phụ và trạng thái có tương phản WCAG AA trên các surface',()=>{
    const luminance=(color:number)=>{const rgb=[color>>16&255,color>>8&255,color&255].map(v=>{const c=v/255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4;});return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;};
    for(const foreground of[COLORS.ink,COLORS.muted,COLORS.gold,COLORS.cyan,COLORS.danger])for(const background of[COLORS.bg,COLORS.deep,COLORS.panel,COLORS.raised])expect((luminance(foreground)+.05)/(luminance(background)+.05)).toBeGreaterThanOrEqual(4.5);
  });
});
