# Cân bằng đang thực thi — beta 1.0.0 local

Đợt UX/stability2026-10-21 **không đổi bất kỳ config gameplay nào** trong các bảng dưới. Hai seed7/42 × công/thủ/cơ động × fusion tắt/bật đã so source trước/sau bằng24run fixed60Hz;12cặp trùng outcome/time/HP/kills/loadout/gear/mastery/entity peaks. Mỗi phía7/12thắng; đây là hồi quy bot, không kết luận cân bằng người thật. [Báo cáo mới](next-beta-ux-report.md) ghi chi tiết. HUD HP25/32–50/58 và Corruption40/35 là threshold trình bày; buff thật vẫn50. Tutorial10s/spacing3s không pause hoặc đổi luật.

Nguồn: src/game/config/{balance,bosses,events,content,progression}.ts. Các thay đổi dưới đây theo prompt UI/hazards/multi-boss; giữ concept Beacon12phút. Đo thực tế và giới hạn ở [báo cáo](ui-hazards-multiboss-report.md), boss ở [catalog](boss-catalog.md). Bảng trước đợt này giữ tại [balance visual](history/balance/balance-visual-identity.md).

## Luật nền giữ nguyên

| Nhóm | Giá trị |
|---|---|
| Duration / fixed step |720s / 1⁄60s; defeat ưu tiên, không cần giết boss|
| Map / light / tốc tàu |1800 / 600 / 200u/s|
| HP Nova / Beacon / radius |100 / 300 / 15u và44u|
| Trong sáng |Tàu hồi1HP/s; quái thường tốc×0,8; Beacon không hồi|
| Corruption |Ngoài+4/s, trong−8/s; ≥50 outgoing/incoming×1,2 một lần|
| Contact protection / mỗi enemy |0,6s / 1s; radiation timer riêng|
| Slot |3module,2support; mỗi loại cấp5|
| Core / reward |10/20/30 → HP300/330/360/390; floor(time/60)+5 nếu thắng,720s=17|
| XP |10+6×(level−1), giữ dư/queue/reroll; pickup85u, hút450u/s|
| Stardust sẵn / Leech |12×3×5XP tại760–810u; Leech−4XP tiến độ/hit|
| Caps |110 quái thường + tối đa2 boss lịch;160 đạn;220XP active+ledger;64effect;32salvage|
| Spawn thường |Cách tàu≥400u/tâm≥680u, tối đa18 lần thử; target Beacon tổng≈25%|

Wave giữ nguyên: trước180s3/2,8s Wisp;180–360s3/2,6s (30%Drifter);360–540s4/2,4s (30%Drifter,18%Leech);sau540s4/2,2s (35%Drifter,20%Leech). Không tăng spawn/speed/contact/XP/cap để bù scaling.

## Scaling theo phút hoàn tất

m=min(11,floor(simTime/60)); HP=baseHP×(1+hpRate×m)×event; damage tương tự. Recompute từ base, giữ HP ratio/target/cooldown, dead không hồi sinh; spawn mới cùng curve. Chaos×1,5 một lần chỉ lên quái thường.

| Loại | HP/tốc/damage gốc | Rate HP/damage trước | Rate mới | HP ở m11 | Damage ở m11 |
|---|---|---|---|---:|---:|
|Wisp|28/70/6|5%/5%|10%/7%|58,8|10,62|
|Drifter|140/40/11|8%/7%|14%/9%|355,6|21,89|
|Leech|44/112/7|10%/8%|16%/10%|121,44|14,7|

Chaos phút6: Drifter140×1,84×1,5=386,4HP; damage11×1,54×1,5=25,41. Không compound.

## Module và stats nguồn chung

- Plasma1→5: damage23/34/42/58/82; cooldown0,85/0,72/0,68/0,56/0,48s; range470/500/520/550/590u; blast0/0/75/90/140u. Hit/nổ không trùng.
- Drones:2/3/4/4/6; damage14/19/24/33/46; orbit78/84/90/96/112u; hit interval0,5/0,5/0,45/0,4/0,35s. Bastion giữ slot.
- Well:damage40/58/80/105/154; radius120/140/160/180/215; force95/105/115/125/135u/s; duration2/2/2,2/2,2/2,4s; cooldown6/5,6/5,2/4,8/4,4s. Chỉ kéo quái, Singularity giữ slot.
- Pulsar/Ion độc lập không đổi. **Quasar range510→398u** (510×0,78 làm tròn một lần trong config); damage220/cadence1,6s/sweep240°/duration0,45s/chain3/jump215u/fraction0,45/falloff0,8 giữ nguyên. Beam và chain giới hạn tâm mục tiêu trong398u từ tàu hiện tại của tick, visited chung; renderer cùng origin. Sector lý thuyết≈544.752→331.770u² (−39,1%), không phải đo DPS.
- Hỗ trợ mỗi cấp: power/rate+8% (max40%); Hull/pickup+10% (max50%); engine+5% (max25%); armor+4điểm% (max20%). Rate chia interval, min0,12s; không rút duration/warning.
- Support+gear+mastery cộng trên base rồi damage×Corruption×event. Incoming=source×(1−armor)×Corruption. HP bonus cộng current đúng delta maxHP, không hồi đầy hoặc buff Beacon.
- Gear giữ50/100bp, tổng2000bp (speed1000); mastery đủ/max3module+2support, mỗi pick200bp, cùng cap riêng/tổng2000bp. Fusion/swap giữ XP/reroll/bonus đã kiếm; gear/mastery không persist.

## Môi trường

| Loại | Trước | Hiện hành |
|---|---|---|
|Radiation207warn/210–255s|2vùng r180 ở±900,±300;4HP/s, chung protection|2vùng r190 chốt tuyến tàu khi warning;7HP/s trước giáp/Corruption; timer1s độc lập contact|
|Tide462warn/465–510s|Tâm950,0/r420/lực90 tuyến tính|Tâm chốt warning theo tàu, r440, đỉnh140×sin(2πelapsed/6), falloff sqrt(1−d/r)|
|Chaos327warn/330–420s|HP/damage thường×1,5, outgoing tàu×1,15|Giữ nguyên; recompute khi vào/ra/phút|
|Gravity thường/final|R310,force70, warning2s; từ120 mỗi90, final630/632|Giữ nguyên, major chiếm field không queue bù|

Tổng lực môi trường+Maw lên tàu≤0,78×tốc hiện tại, còn ít nhất22% tốc thoát ngược; tại tâm/mép0. Quái cap155u/s, boss chỉ nhận35% lực trước cap. Loot/đạn/Beacon không bị kéo. Warning không lực/damage; tâm active không bám tàu. Radiation/Solar cùng loại chỉ DPS mạnh nhất; Solar burst riêng có cooldown0,6s cùng nguồn. Miễn nhiễm thật chặn contact/environment. Quái thường2%maxHP/s cap10, mọi boss miễn phần trăm. Không đổi Corruption.

## Boss và vòng tinh chỉnh

HP thử đầu Elder6900/Gravemaw5600/Helion5200/Harrier4800, mốc660×0,72. Fixture module5/support thiên thủ5, không gear/mastery/wave: TTK540≈24–34s, thấp hơn mục tiêu45–80s. Chỉ chỉnh **nhóm HP**:10000/9800/9200/9000 và660×0,8; phase2 vẫn65%. Cadence/warning/damage/speed giữ trong vòng HP. Pattern phase2 sau đó hoàn thiện loạt lệch0,08rad vẫn giữ khe và đo lại. Số cuối/outlier ở báo cáo; chưa coi là cân bằng người thật.

Scheduler540/660, warning3s, seeded/no-repeat; boss cũ sống không ngăn mốc mới. Mỗi boss state/owner riêng. Reserve đủ pattern trước telegraph, chừa12 projectile cho tàu. Zone toàn run≤6/owner≤2. Low/reduced chỉ giảm trang trí.

## Hiệu năng và lịch sử

Giữ pool640/XPvisual220, polyline tolerance0,35u, cached background ba tile1024², adaptive decoration có hysteresis; simulation không adaptive timeScale. LedgerXP57×57/cell64, mergecell96/r72/age4s/mỗi2s/safety48 giữ nguyên. Frame đo browser tối ưu/cùng máy, không lấy tốc bot làm FPS.

Các quyết định/số đo cũ ở [history/balance](history/balance/balance-visual-identity.md). Save schema3/key cũ; state run mới không cần reset/migrate tiến trình.
