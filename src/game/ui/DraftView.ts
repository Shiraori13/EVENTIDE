import type { RunState } from '../core/types';
import { upgradePreview } from '../core/upgradePreview';
import { choiceIcon,choiceName,choiceDescription,upgradeLevel,actionKind } from '../systems/ExperienceSystem';
import { assetURL,type AssetId } from '../../assets/manifest';
import { numberText as n } from './format';
export function draftCards(s:RunState):string {
  return s.choices.map((id,i)=>{const preview=upgradePreview(s,id),kind=actionKind(s,id),level=upgradeLevel(s,id);
    return `<article class="draft-card"><button class="upgrade-card" data-upgrade="${id}" data-draft="${s.draftId}"><span class="key">${i+1}</span><img src="${assetURL(choiceIcon(id) as AssetId)}" alt=""><span class="level">${({acquire:'Nhận vũ khí mới',level:'Tăng cấp vũ khí',support:'Hỗ trợ',mastery:'Mastery +2%',recover:'Phục hồi / tiếp tục'} as const)[kind]}${['mastery','recover'].includes(kind)?'':` · Cấp ${level} → ${level+1}`}</span><strong>${choiceName(s,id)}</strong><span class="preview-changes">${preview.changes.map(r=>`<span>${r.label}<b>${r.before===undefined?'Chưa lắp':n(r.before)} → ${n(r.after)} ${r.unit}</b></span>`).join('')}</span><span class="draft-purpose">${preview.purpose}</span></button><details class="draft-details"><summary>Chi tiết</summary><p>${choiceDescription(s,id)}</p></details></article>`;
  }).join('');
}
