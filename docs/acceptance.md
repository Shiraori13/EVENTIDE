# Nghiệm thu hiện hành — Next beta UX/UI/stability local

Checklist bổ sung2026-10-21, giữ mọi tiêu chí gameplay bên dưới. Kết quả thực và bundle ở [status](status.md), không coi bảng này là log pass tự động.

| Nhóm | Điều kiện |
|---|---|
| HUD | HP normal/warning/critical hysteresis25/32–50/58; Corruption warning40/35/buff thật50; chữ/icon khi tắt rung; Beacon hit2s/hướng nguy cấp; ARIA không đọc số mỗi frame |
| Balo/draft | 5slot/progress thật; recipe thiếu/rõ/CTA đủ trong viewport đầu; confirm/cancel/stale/double/resume hoạt động; details nguồn và preview2–3giá trị khớp calculator, rate không giả CDR; giữ XP/reroll/pause/focus |
| Tutorial | Ba trigger thật, deferred danger/boss/modal, seen sau display, skip/tắt/reload/replay không mất meta; ≤3dòng ở viewport mục tiêu |
| Kết quả | Actual incoming sau giáp/invuln/clamp, outgoing đúng nguồn, fatal/owner/channel/cùng chết; snapshot trước cleanup/freeze/reward một lần; final build/goal thật/details không phải DPS; tối đa một nhận xét có bằng chứng |
| Stability | ≥5restart/≥20panel, listener/texture/timer/owner không tăng vô hạn; viewport1280/1366/1920/1024×576/menu390; productionprefix/font/ảnh/nohooks |
| Chạy thực | Full720s render bằng clock thường nếu môi trường cho phép, nhãn bot; same-seed3build±fusion; dense+duo+hazard Low/Medium/reduced; đo frame riêng, >50/100ms và không dùng bot để chứng nhận FPS |

Các mục lịch sử bên dưới được giữ để tra regression, không ghi đè luật mới. Kết quả chạy cụ thể, môi trường và giới hạn ở [status](status.md), số đo ở [báo cáo](ui-hazards-multiboss-report.md).

- UI: menu/achievements/Balo/draft không còn hai cung pseudo không nhãn; focus và vòng Beacon/charge còn. Wallet click/Enter, mua/reload/quay lại khớp save, desktop720/768/1080 và390px không tràn.
- Hazard: warning khóa vùng, không lực/damage; biên/tâm, hút/đẩy/quỹ đạo/thoát, overlap cap, timer radiation độc lập contact, miễn nhiễm thật, boss miễn %HP, pause/reset. Low/reduced giữ cue.
- Scaling:59,99/60/60,01/540/660; linear, ratio/cooldown/target/dead, Chaos vào/ra, spawn cùng factor.
- Quasar398u cùng envelope beam+chain, moving origin thống nhất, Ion không đổi; fusion click pause/mastery đủ năm ô giữ.
- Boss: seeded hai mốc/no-repeat/overlap/cap; per-owner beam/zone/timer; admission trước warning, hai loạt và khe, dash swept/lock/second warning; transition/reward một lần, cleanup/resume/result.
- Playtest: A/B ba build ±fusion, bốn boss/hai phase, ba cặp, phút3/6/9/11, đủ720s tăng tốc; clip keyboard thật trong fixture riêng, không gọi là chơi tay. Hiệu năng frame đo browser riêng.

# Nghiệm thu local và Pages

## Visual identity local · 2026-10-18

Scope: hình ảnh/UI/motion/settings, giữ gameplay beta1.0.0 và profile schema3. Không push/deploy. Bảng bằng chứng, kết quả và giới hạn mới ở [visual report](visual-identity-report.md) / [status](status.md), art contract tại [design system](design-system.md). Các mục phát hành và phiên bản dưới đây là lịch sử.

- Menu/gameplay đầu/đông/Balo/draft/Core: ảnh trước/sau cùng1280×720; thêm390×844. Không mockup, fixture chịu tải dùng HP lớn và save test riêng.
- Menu/Core/Balo/HUD kiểm tra1280×720/1366×768/1920×1080/390×844; keyboard/focus/scroll và font Việt local; hẹp không thêm touch controls. Giữ regression zoom125%/DPR2/fallback font/ảnh.
- Di chuyển thật/đảo hướng/dừng/chéo, vị trí camera/actor cùng alpha; không smoothing vị trí. Pause/Balo/draft/blur đóng băng state. Tiến hóa click thật từ pause, resume xác nhận damage Quasar/cleanup nguồn; XP/reroll/bonus/mastery5ô không đổi.
- Low/reduced motion giữ hazard, state Nguy cấp và giới hạn hút thật; OS default và saved explicit false; quality/audio/profile qua reload. Token contrast≥4.5:1 cho chữ trên surface; không coi đây là audit toàn bộ ảnh.
- Restart7lượt, kiểm tra pool/listener/texture/timer/tween/audio/DOM sau warmup. Build/production smoke không debug hooks, đúngbase/không404/offline; đo trước/sau bundle benchmark riêng, không lấy runtime dev/HMR hoặc mô phỏng tăng tốc làm FPS.

Số đo headless không cam kết60FPS/GPU thật. Chưa chơi tay12phút/nghe audio trực tiếp hoặc nghiệm thu cảm ứng. Các giới hạn này là giới hạn kiểm chứng, không phải feature backlog.

## Phát hành beta1.0.0

Giữ luật hotfix1.4.1. Smoke production hiện hành dùng baseURL /EVENTIDE/ hoặc EVENTIDE_SMOKE_URL để chạy lại trên URL công khai: reload/menu/version/font/ảnh, không debughook, offline, phím thật/XP thật/chọnlevel/B/pause, shot WebAudio/mute/save qua refresh. Các kết quả trước/saupush và hash/run thật ở DEPLOYMENT/status; không coi URL dự kiến hoặc push thành công là deployment thành công.


## Hotfix beta1.4.1

P01–P12: tests/unit/v141.test.ts kiểm tra đủ/max5ô, invalid shape/definition, XP queue qua ranh giới, reroll không alternate,18% thiếuô/hoàn thiện lại2%/capfullHP, stale refresh cùng draft. E01–E09: hotfix-v141 browser click B từ pause tại3viewport, xác nhận trong clip/focus trước click, doubleclick/commit/pause frozen/resume damage Quasar, ready biến mất/reopen; draft reroll0, stale UI và recipe fail. E06 unit inject prepare/definition/RNG failure giữ toàn bộ state. E10 unit damage/radius thật của Plasma5/Drones5/Well5 và các test beta modifier/visited/FPS hiện hành.

Profile migration/lifecycle/event/boss/XP/asset/font/offline production dùng bộ hồi quy hiện hành. Lệnh thực chạy, số pass, build hash, playtest và phần chưa xác minh ở status; hồ sơ1.4 bên dưới chỉ là lịch sử, không chứng nhận hotfix.


## Hồ sơ beta1.4 (luật mastery/latch đã bị hotfix1.4.1 thay thế)

| Nhóm | Bằng chứng |
|---|---|
| Forced replacement/mastery | Baseline browser choices[drones,well] với build31/3module5; v14.test: chỉstat/recovery, reroll/pause/cap2000/speed1000/HPdelta/XPqueue/stale guard; browser B/blur/cancel/explicit swap giữ budget. |
| Fusion/role | Recipe5+5, cancel/doubleguard/atomic Quasar5, cleanup nguồn, latch sau trốngô, không đề nghịnguyênliệu khi cònQuasar; visited beam/chain và30/60/144FPS. Catalog nhómvai trò, Bastion/Singularity cùngID5. |
| Events | Biên warning/start/end, fastforward, arbitration/skipregular/630; chaosminute/ratio/spawn/bossimmune, radiationarmor/envkill/drop1lần, tideforce/tâm/escape/lootfreeze, result/newrun cleanup. |
| Visual/Beacon | Runtime screenshot High/Low, radiationhatch/tidearrows, beta panels1024×576 (viewport tương đươngzoom125)/1280×720/1920×1080; pulse/flashunit từdamage thật, khôngraw overlap. |
| Balance/perf | 18botnatural/configiteration/TTK hai nguồn vsQuasar vàboss trong balance-v1.4; raw artifact và fullrender/perf ở status/performance-report. Không suy cảm giác người thật từbot. |
| Save/regression | Giữschema3/key/meta/28achievement/Core/font/pool/ledger/offline production. Lệnh và kết quả cuối ở status. |


Beta đã có lượt render720s thắng trên BC9WlYb0, A/B/stress vàhash/XP/profile/lifecycleđược report-v14 validate; p95 mục tiêu20ms chưa đạt trênSwiftShader. Full39browser C8,7liênquanD1 và3presentation cuốiBC9+production;không coi cả39là đã chạytrênhashcuối.

## Hồ sơ phiên bản 1.3 (luật swap được thay ở beta1.4)

| Nhóm | Triển khai / bằng chứng |
|---|---|
| Điều hướng/typography | Pause4nút không Build; B/HUD/draft và overlay stack giữ. New33 browser cases gồm22 regression và11 ca1.3; Core/thành tựu/Build tại sáu tổ hợp viewport/zoom100/125, fallback mới, ảnh footer/last card. |
|28 thành tựu/save | v13.test có stable ID/migration2→3, typed death/run-best/evolution/valid hit/phase/final/core/collect/heal/timer/victory thật; idempotent/retry, không suy metric mới. achievement-catalog từ definitions. |
| Core model/purchase | Registry4model, preview thuần,21/30 thiếu9 và360→390; expectedLevel/double action/max/storage fallback, run cũ không mutate. |
| Minute | Biên59.999/60/119.999/120/660/720, HP ratio/target/cooldown/dead guard/skip mốc/pause; Drifter phút5=1.40HP/1.35damage, boss riêng. |
| Gear | Seed/boundary probability,50/100bp, hai cap, speed/noarmor, clamp/counter/lifecycle/TTL/distance/deltaHP/noheal, phase1 không drop/final1drop/XP conservation.18naturalruns qua draft thật và capped drop stats. |
| Pulsar/Ion | Sector tick lớn và30/60/144FPS, hit once/source theo tàu, chain visited/falloff/range/immutable path, effective support+gear+Corruption, maxrate không chồng pulse. |
| Swap | Fullslot pool vẫn đề nghị; cancel/Esc không tiêu pick/reroll; Plasma5→Ion1→Plasma1; giữ slotkhác/XP/support/gear, dọn old attack, cadence đầu/guard stale/double. |
| Ship/runtime | Shortest-angle/input thực/dừng/chéo/gravity/video clock thường; old sprite/camera interpolation giữ. Lifecycle5vòng sau warm-up, storm/newVFX bounded, production không hooks/offline. Lượt render đủ720s và A/B chốt riêng trong performance-report, không lấy hook cuối màn làm proof. |

Số test/lệnh/hash cuối ghi tại status. Playtest13/18 ca bot thắng ở cấu hình cuối không là win-rate người thật. Zoom125 là emulation; chưa native/GPU vật lý/chơi tay/audio.

## Hồ sơ phiên bản1.2

| Nhóm | Bằng chứng nghiệm thu |
|---|---|
| Stat/slot/cap | progression.test/rules.test: additive từ base, rate division, Corruption riêng, delta HP, giáp không giảm Beacon/XP Leech, hai support và ba module, cache/reset. Tooltip/catalog/build cùng registry/calculator. |
| Draft/reroll | Seeded/group representation, cap/full/empty pool, một reroll/draft, stale ID guard, nhiều level/XP dư/fallback một lần. Browser B→catalog→Esc trở đúng draft/reroll0, draft kế có1. |
| Phi thuyền/build/catalog | Nova từ character registry, Core không tăng tàu, chỉ đọc và không shop; current build có đủ5slot/level/HP/effective stats. B từ playing pause; blur trong panel buộc manual resume; restart reset. |
| Profile/migration | Save schema1→2 cùng key, tiền/Core/Echo/settings giữ; career bắt đầu0, milestones validate theo total. Death một lần, milestone nhiều mốc, save retry/result không cộng lại; reload thấy101kill/huy hiệu từ browser case. |
| Boss | Phase1→transition→phase2→finalDeath mỗi bước một lần; pause, overkill, owned cleanup, XP/kill một lần; beam origin di chuyển/aim-lock/fire/recover đồng nhất collider.720s vẫn thắng khi boss sống; cùng tick chết vẫn defeat. |
| Enemy/balance | Snapshot scale không nhân frame/hồi HP; TTK đầu/giữa/cuối so1.1, ba cặp support qua draft thật và preset boss riêng trong balance-v1.2. Không suy win rate hoặc cảm giác người thật. |
| Runtime/UX | Giữ các regression1.1 (font/quality/layout/XP conservation/ledger/pool/audio). New panel1280/1366/1920; regression emulation zoom/DPR. Stress phase2+110 thường+haste40% bắn172phát, peak56đạn, cap160. |

Lệnh/kết quả cuối và giới hạn thật ở status/performance-report; không coi test tăng tốc là frame pacing12phút. Người thật, GPU desktop, native zoom và cảm giác âm thanh chưa được xác nhận.

## Bổ sung VNext 1.1

- UTF-8/NFC, font local đủ glyph/weight/license; bộ chuỗi Việt trên DOM/Phaser Canvas, cold/failure/late font và sáu tổ hợp viewport/zoom/DPR. Ảnh thật tại artifacts/vnext/visual, đối chứng cũ menu/pause tại before-ui. Xem visual-qa.md cho loại zoom emulation và giới hạn headed.
- Sprite/atlas mới giữ hitbox; Well cyan và môi trường amber/magenta có warning/range/hướng hút/phase riêng. Low giữ tín hiệu bắt buộc, không đổi physics. Pause/resume giữ phase và không lùi ảnh nội suy.
- XP conservation, old/homing/boundary/cap đầy/20,000drop/ledger vùng hữu hạn/return/restart; mỗi giá trị chỉ thu một lần. Regression tái hiện lỗi cap cũ chuyển loot ra xa. Sổ loot tách Leech/XP tiến độ.
- saveVersion1 trước cập nhật còn tiền/core/Echo/settings; quality thiếu mặc địnhHigh. Không migrate bằng reset. Browser test dùng namespace riêng.
- Năm vòng tương đương sau warm-up giữ pool/listener/texture/timer/tween/audio hữu hạn. Snapshot đơn không phải bằng chứng hết leak; bộ counter, report dài và giới hạn ở performance-report.
- Typecheck/build,40 unit/integration (gồm đối chiếu combat720s với baseline và hai ca nhường slot ledger), e2e và smoke production không hook/offline được ghi theo lần chạy cuối trong status. Kết quả đo hiệu năng và lượt render dài chốt riêng trong performance-report, không lấy fast-forward làm bằng chứng FPS.

## Đối chiếu các luật nền

Đối chiếu GAME_SPEC v1.3, giữ luật nền v1.0 với thay đổi UPG/STAT/BOSS/META đã ghi trong nhóm1.2 phía trên. Kiểm tra bằng Vitest, Playwright Chromium và xem ảnh; chi tiết lệnh/môi trường tại [status](status.md). “Đã kiểm tra” không có nghĩa đã đánh giá bằng người chơi12 phút thực.

| Nhóm yêu cầu | Triển khai và bằng chứng |
|---|---|
| RUN-01/02 | Session 720s, damage trước kết quả, defeat ưu tiên, không cần giết boss. Unit sát thương cùng tick cuối; bot stats chuẩn thắng đủ720s nhận17. |
| RUN-03 | WASD/mũi tên chuẩn hóa, không quán tính; browser giữ phím thật, chọn module Gravity Well bằng click, unit tốc chéo. |
| RUN-04/05 | Fixed clock chỉ playing; unit pause đóng băng toàn state, giữ upgrade; e2e Esc/blur/resume. Không catch-up wall time. |
| RUN-06 | New session reset state, không thưởng bỏ lượt; e2e chơi lại/menu và currency. |
| MAP-01/02 | Map1800/light600/tốc200, camera, hướng/khoảng cách Beacon, cảnh báo; HUD và ảnh hai viewport. |
| MAP-03/04 | Stardust hữu hạn/loot tại quái chết/hút gần, spawn safe và thử hữu hạn; test XP/cap và mô phỏng. |
| BEACON-01..03 | HP riêng, hồi tàu1/s, slow20%, biên≤; unit biên/HP/slow/core. |
| COR-01..03 | Clamp, +4/−8, ngưỡng50, nhân một lần, Beacon không nhân; unit49.9/50 và15s. HUD ghi cả hai mặt. |
| XP-01 / UPG-01..03 | Giữ dư, pending nhiều cấp, lựa chọn không trùng/trần/ô, pool ít/rỗng, HP tăng cùng lượng; unit và modal e2e. |
| WPN-01..04 | Ba module, Plasma3/5 cùng ID/slot, hit/nổ không trùng, drone cooldown/FPS, well hút/nổ, tâm0 an toàn; unit và bot. |
| ENEMY-01..03 | Ba silhouette, fixed target marker, Leech trừ XP hiện tại, cooldown per-enemy/player; unit và chiến thuật. |
| WAVE/BOSS lịch sử | Wave theo mốc, boss một lần có slot riêng, vòng đạn/khe và tia khóa hướng, death không tự thắng; unit events/beam và full-run. |
| GRAV-01..03 | Một môi trường optional, báo2s, không phủ Beacon, cap lực/tâm, final630 thay vùng cũ; unit sự kiện/tâm và bot đủ lượt. |
| META-01..03 | Reward một lần, core10/20/30 và300/330/360/390, Echo đầu thắng; unit và e2e reload/mua. |
| SAVE-01/02 | Validate version/type/range, JSON hỏng/storage chặn vẫn chơi, reset có xác nhận, key test riêng; unit và e2e. |
| UX-01..04 | Sprite SVG riêng, màu/shape, menu đủ nội dung, HUD/modal/result Việt, giảm effects/shake, cảnh báo desktop nhỏ; ảnh1280×720/1920×1080 đã xem. |
| AUDIO/ASSET | Local manifest/fallback, CC0 nguyên bản, audio synth sau gesture/suspend/mute, không asset mạng. Browser lỗi ảnh có fallback; chưa nghe audio bằng tai. |
| TECH | TS strict, Phaser3/Vite, systems thuần, config/services tách, scripts thực, lockfile, DEV hooks riêng. Typecheck/unit/build/e2e và smoke production. |

Không có tính năng MVP cố ý để TODO/nút giả. Giới hạn kiểm chứng: chưa chơi tay đủ12 phút, chưa đo60FPS trên desktop, chưa nghe đánh giá chất lượng âm thanh. Các kiểm tra tự động/ảnh không thay thế những việc này. Nội dung bản sau nằm riêng trong backlog.
