# Cân bằng đang thực thi

Nguồn số beta1.0.0 (đổi nhãn từ hotfix1.4.1, giữ con số beta1.4): `src/game/config/balance.ts`, `content.ts`, `progression.ts`; calculator tại `core/stats.ts`. Thời gian là giây mô phỏng, khoảng cách là world unit. [Playtest1.2](balance-v1.2.md) phân biệt draft tự nhiên, preset TTK và giới hạn người thật.

| Luật từ đặc tả | Giá trị |
|---|---|
| Lượt / boss / gravity cuối | 720 / 540 / 630s |
| HP Nova / Beacon gốc | 100 / 300 |
| Hồi trong sáng / slow quái thường | 1 HP/s / tốc base×0.8 |
| Corruption ngoài / trong | +4/s / −8/s, clamp0–100 |
| Ngưỡng Corruption | ≥50, gây/nhận×1.2, không tăng damage Beacon |
| Slot/trần module | 3/cấp5 |
| Slot/trần hỗ trợ | Chọn2 trong6 loại/cấp5 |
| Core | Giá10/20/30, HP300/330/360/390 |
| Thưởng | floor(time/60)+5 nếu thắng, đủ720s=17 |

## Tham số chung hiện hành

| Tham số | Giá trị |
|---|---|
| Map / light / tốc tàu | 1800 / 600 / 200u/s, tâm→rìa~9s |
| Radius tàu / Beacon | 15 / 44 |
| Bảo vệ tàu / contact từng quái | 0.6s / 1s |
| Hút XP / hỗ trợ mỗi cấp | 85u / +10% base (8.5u), trần127.5u; tốc hút450u/s |
| HP hỗ trợ mỗi cấp | +10% base (10HP), trần150; current tăng đúng phần maxHP thêm |
| XP lên cấp | 10+6×(cấp hiện tại−1), giữ dư |
| Leech | −4 XP tiến độ mỗi hit thành công; hiển thị bám0.5s |
| Pool cạn | Thẻ hồi tối đa10HP hoặc Tiếp tục khi đầy; một action/pending |
| Stardust đặt sẵn | 12 cụm×3 điểm×5XP ở radius760–810, hữu hạn |
| Spawn | cách tàu≥400u, cách tâm≥680u, tối đa18 lần thử |
| Cap thường / đạn / pickup / effect | 110 / 160 / 220 / 64, boss thêm1 slot |
| Gravity môi trường | từ120s mỗi90s, cảnh báo2s+hút15s |
| Gravity radius / lực | 310u / tối đa70u/s, không damage |
| Tổng pull quái | cap155u/s, tâm trả lực0 |
| Boss | Phase1=6900HP, transition1.25s, phase2=4485HP; radius55; tốc32→37.76; final death mới rơi120XP |
| Vòng đạn | mỗi4.5/1.05s, 15 vị trí bỏ3 tạo khe; tốc110, TTL10s, damage13.2 |
| Tia | chu kỳ8/1.05s→8/(1.05×1.18)s, aim1.8s/khóa0.25s cuối, active0.5s, nửa rộng25u, damage27.5→29.7; origin theo boss+muzzle30u |

Quái gốc1.1→1.2 theo HP/tốc/damage: Wisp22/64/5→28/70/6; Drifter105/38/9→140/40/11; Leech36/105/6→44/112/7. XP/radius giữ2/13,7/24,4/16. Từ1.3 bỏ snapshot progress: minute=min(floor(time/60),11); Wisp HP/damage+5%/5% mỗi phút từ base, Drifter8%/7%, Leech10%/8%. Cập nhật quái sống một lần/phút, giữ HP ratio; spawn mới cùng curve. Tốc base không tăng, hit frequency không đổi. Khoảng25% tổng spawn hướng Beacon; xác suất loại không phải Leech là `0.25/(1−tỷ lệ Leech)`. Mục tiêu cố định lúc sinh.

Wave: 0–180s:3 mỗi2.8s toàn Wisp; 180–360:3 mỗi2.6s với30% Drifter; 360–540:4 mỗi2.4s với30% Drifter+18% Leech; sau540:4 mỗi2.2s với35% Drifter+20% Leech. Cap hoãn spawn thường; boss vẫn sinh.

Plasma cấp1→5: damage23/34/42/58/82; cooldown0.85/0.72/0.68/0.56/0.48s; range470/500/520/550/590; tốc470/490/500/520/540; TTL1.4/1.4/1.5/1.5/1.5s; nổ0/0/75/90/140u. Nổ không cộng hit trực tiếp. Cấp3 Mini Sun, cấp5 Supernova.

Drones: số2/3/4/4/6; damage14/19/24/33/46; radius78/84/90/96/112; cooldown0.5/0.5/0.45/0.4/0.35s theo mục tiêu; quay2rad/s. Nhiều drone không stack damage cùng tick.

Well: damage40/58/80/105/154; radius120/140/160/180/215; lực95/105/115/125/135u/s; duration2/2/2.2/2.2/2.4s; cooldown6/5.6/5.2/4.8/4.4s; range500/520/540/560/590. Chỉ hút quái, mỗi vùng nổ một lần.

## Đổi và kiểm chứng

Đổi duration cần xem lại mốc boss/final/waves. HP/damage/XP/cooldown nằm trong config; chạy unit và chiến thuật sau khi chỉnh. Clock/wave/win-loss phải kiểm tra đủ lượt. Tooltip đọc cùng bảng chỉ số.

Lịch sử1.1: đứng Beacon thua394.7s, đi rìa42.917s; bot cũ adaptive thắng720s/cấp34/1000kills/Beacon300HP/tàu106.62HP. Baseline1.1 được lưu tại artifacts/v12/baseline-source/baseline-benchmark. Bản1.2 thay HP/damage/support/boss có chủ đích; không còn khẳng định mọi config giống1.1. Bot mới biết đọc telegraph, được chạy cả trên1.1 khi so trực tiếp; không suy thắng người thật từ bot. Kết quả mới: artifacts/strategies.json và artifacts/v12/balance-playtest.json.

## VNext: tách budget trình bày khỏi gameplay

Đợt1.1 từng giữ SHA256 balance/content giống MVP (`artifacts/vnext/gameplay-config-parity.json`); đây là bằng chứng lịch sử, không áp vào thay đổi cân bằng1.2. `PICKUP_CONFIG.maxActive` vẫn tham chiếu `BALANCE.pickupCap=220`, không có hai nơi đặt cap logic cạnh tranh.

`presentation.ts`: High/Low lần lượt stars256/112 trên mỗi tile1024 (beta1.4); ruins70/28; suction particles tổng96/32, mỗi nguồn32/12; trail4/2; healthbars28/12. SpritePool640, pickup visual220, cull padding100u. Đây là budget hình ảnh, không đổi lực hút, phạm vi, damage, quái, loot, AI hoặc clock. Không adaptive quality/timeScale.

Compaction: merge cell96/radius72u, lịch2s, age tối thiểu4s, safety padding48u; ledger cell64u,57×57 hữu hạn. Orb homing và vùng gần tàu không merge. Fallback giữ XP theo vùng; không expiry, không tự cộng XP xa. Bounds toàn cell phải đã vào radius nhặt trước materialize để tránh free pickup. Sổ created/collected/ground tách XP tiến độ và Leech.

## Chỉ số và boss1.2

| Support stable ID | Mỗi cấp | Bonus cấp1/2/3/4/5 | Trần |
|---|---|---|---|
|power|+8% damage|8/16/24/32/40%|40%|
|haste|+8% tốc độ tấn công|8/16/24/32/40%|40%|
|hull|+10% HP base|10/20/30/40/50%|50%|
|engine|+5% tốc base|5/10/15/20/25%|25%|
|magnet|+10% pickup base|10/20/30/40/50%|50%|
|armor|+4 điểm% giảm damage tàu|4/8/12/16/20%|20%|

Damage/rate giảm từ đề xuất50% xuống40% theo playtest; DPS lý thuyết khi ghép hai nguồn tối đa1.96 trước Corruption, không phải cap tổng damage module. HP/move/pickup=base×(1+bonus). Attack interval=base interval/(1+haste), safety min0.12s (không chạm ở các cấp hiện hành). +50% rate về mặt công thức vẫn là interval/1.5, không ×0.5. Giáp nhân(1−armor) vào damage tàu trước Corruption; Beacon/Leech XP không giảm.

Support và Corruption đánh giá tại hit cho Plasma/drone/Well; module base đạn/Well snapshot lúc tạo. Cooldown đã đặt giữ deadline; lần đặt mới dùng rate hiện hành. Well không rút duration. Hull tăng currentHP đúng delta maxHP, không heal đầy. Tiến hóa giữ slot, ba module/hai hỗ trợ, không cap nhầm module/Corruption vào cap support.

Phase2: rate×1.18, damage×1.08, ring18 bỏ4, fan5 viên lệch góc trong0.75rad sau0.65s. Không mở ring mới trong beam; fan hoàn tất trước beam mới. Telegraph1.8s không rút, khóa0.25s cuối, active0.5s. Boss chừa12 slot projectile cho tàu; actual stress60s cho172 phát/peak56 projectile/1Well, không chạm cap160. Khi chuyển phase, owned bullet TTL0 và compact cuối combat, beam/fan dọn; không invalid iterator hoặc xóa loot/đạn tàu.

28 thành tựu badge-only, gồm năm mốc career kills100/500/1000/2500/5000; không là nguồn tăng stats hoặc tiền. Save schema3 giữ key cũ; hỗ trợ không lưu qua run. Career tự lưu mỗi5s simulation và ở milestone/pause/pagehide/end/menu; crash có thể mất phần chưa flush.

## Tổ hợp nguồn 1.3

Salvage run-only,50/100bp mỗi mảnh50/50;1%=100bp. Tổng damage+rate+HP+pickup+speed≤2000bp, từng stat≤2000bp trừ speed≤1000bp. Không giáp, không chiếm ô. HP/move/pickup/damage=base×(1+support+gear), damage tiếp tục×Corruption; rate=1+haste+gearRate. Hai nguồn clamp riêng, không lãi kép. +HP tăng current cùng delta, không light heal.

Drop final death: Wisp5%; Drifter min14%,8%+0,5điểm%×minute; Leech min12%,7%+0,4điểm%×minute; Elder final100% nếu còn budget/stat. TTL30s simulation,5s cuối blink; cap32 logic/visual, đầy bỏ drop mới và đếm capHits, không queue/đổi XP. Hết budget thu hồi pending/dừng roll. EXP không TTL và giữ ledger.

Pulsar damage42/58/78/104/132; range230/255/280/310/340u; sweep0,7/0,7/0,65/0,65/0,6s; interval3,2/2,9/2,6/2,25/1,9s. Một hit/enemy/pulse, source theo tàu, max rate60% vẫn interval>duration.

Ion damage28/42/60/84/112; range400/420/440/460/480u; jump155/170/185/200/215u; targets3/3/4/5/6; falloff0,8/0,8/0,82/0,84/0,85; interval2,8/2,55/2,3/2,05/1,8s. Visited từng chain, damage/path chốt trong tick; rate không tăng target. Điều chỉnh từ damage28/39/52/67/84, falloff0,8 đều sau đo đàn20quái: Ion19,82→14,42s; case line giúp giữ vai trò chuyền xa thay vì buff vượt Plasma mọi tình huống.

Swap: một lựa chọn level-up, chỉ ô thay về1/mất evolution, không hoàn XP. Dọn attack cũ, chu kỳ đầu chờ base interval/rate mới. CharacterXP/support/salvage giữ. Core vẫn300/330/360/390HP, giá10/20/30, không đổi radius/charge/heal. Boss6000+3900 không tăng theo phút, không thêm phase. Bảng phút, TTK và18 lượt draft/drop tự nhiên ở [balance1.3](balance-v1.3.md).

## Beta1.4 · nguồn bổ sung và thay luật1.3

- Draft chỉ acquire khi còn ô hoặc tăng module sở hữu, không replacement. Hotfix1.4.1: đủ3module max + đủ2support max mới mastery; thiếu ô/level tiếp tục pool cơ sở. Thay thế latch ba module của1.4. Mỗi stat +200bp, riêng damage/rate/HP/pickup≤2000bp, speed≤1000bp; tổng≤2000bp. Tổng support+salvage+mastery cộng trên base, rồi damage×Corruption×event; rate chia interval. Cap hai nguồn cũ giữ riêng. Mastery không persist hoặc buff Beacon.
- Nút đổi chủ động mới reset đúng một ô về1 và mở lại progression; không reset budget/bonus. Cạn stat có phục hồi/skip, giữ XP dư/queue/guard draft. Fusion Pulsar5+Ion5→Quasar5 không mất pick; ô trống sau fusion mở lại pool cơ sở; bonus/budget đã kiếm giữ.
- Quasar: damage220/range510/sweep240°/duration0,45s/cooldown1,6s. Một hit/target/pulse, visited chung với tối đa3tia phụ từ hit đầu, jump215u/damage×0,45/falloff0,8. So tổng hai nguồn5 ở [balance-v1.4](balance-v1.4.md).
- Bastion cấp5:6drone/46damage/radius112u (1.3:5/42/105). Singularity cấp5:154damage/radius215u (1.3:140/205); cadence/force không tăng. Giữ ID/slot/level. Tên hai hình thái là mở rộng beta; Plasma và Quasar từ concept.
- Radiation210–255s, warning207:2vùng radius180u tại(900,300)/(−900,−300); tick1s, tàu4HP trước armor/Corruption/protection chung; quái2%maxHP cap10HP, không buff outgoing. Boss/Beacon miễn.
- Chaos330–420s, warning327: enemy HP/damage×1,5 (không speed/rate/boss), tàu outgoing×1,15. Recompute base×minute×event giữ ratio khi bắt đầu/kết thúc/qua phút; Drifter phút6 HP140×1,48×1,5=310,8; damage11×1,42×1,5=23,43.
- Tide465–510s, warning462: tâm950,0/radius420u, lực90×sin(2πelapsed/6)u/s;0tại tâm và cap155 tổng. Tàu base200u/s thoát; không kéo loot/đạn. Một field môi trường, skip regular gravity trong major warning/active, không bù queue. Final630/632 giữ.
- Boss từ6000/3900 lên6900/4485(+15%); bullet12→13,2/contact14→15,4/beam25→27,5(+10%). Rate thử+10%, sau thử chọn+5%, interval chia1,05 một nơi; phase2 rate×1,18 riêng. Speed/telegraph giữ. Đây là cấu hình beta, chưa chốt cân bằng người thật.

Phần Tổ hợp nguồn1.3 ở trên là lịch sử nguồn trước mastery; luật hiện hành áp cả nguồn beta ở mục này và GAME_SPEC. Không dùng ghi chú swap/boss lịch sử như yêu cầu hiện tại.

Hotfix chỉ thay eligibility/flow, không chỉnh các số trong config. Sáu lượt tự nhiên/đối chiếu1.4 cùng cặp Hull/Armor và fixture sát thương sau resume ở [balance-v1.4.1](balance-v1.4.1.md); không suy kết quả bot thành cân bằng người thật.
