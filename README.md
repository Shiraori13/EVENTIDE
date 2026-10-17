# EVENTIDE · Thủy Triều Hư Không

**beta 1.0.0** (package1.0.0-beta.1, đổi nhãn phát hành từ hotfix1.4.1, giữ gameplay) sửa xác nhận tiến hóa bị khuất khi pause và thay điều kiện mastery bằng đủ/max ba vũ khí cùng hai hỗ trợ. Giữ nội dung beta1.4: Quasar Cannon, Orbital Bastion/Singularity Well, ba sự kiện thiên văn, nebula/Beacon feedback và boss tuning. Giữ dữ liệu schema3, 28 huy hiệu, Core, salvage, font/pool/ledger. Xem [trạng thái](docs/status.md), [playtest hotfix](docs/balance-v1.4.1.md), [hiệu năng](docs/performance-report.md).

MVP local sinh tồn hành động 2D bằng Phaser 3 + TypeScript. Điều khiển Nova bảo vệ Beacon trong 12 phút, thu Stardust, chọn module và đánh đổi sức mạnh với Corruption. Không backend, tài khoản hoặc tài nguyên mạng khi chơi.

## Chơi trên web

Repository: [Shiraori13/EVENTIDE](https://github.com/Shiraori13/EVENTIDE). URL Pages dự kiến: https://shiraori13.github.io/EVENTIDE/ — trạng thái xác minh thực tế ở [triển khai](docs/DEPLOYMENT.md). Push main tự kiểm tra/build/deploy qua Actions.

## Chạy trên Windows

Cài Node.js **22.12 trở lên trong nhánh 22, hoặc Node 24 trở lên**. Đã triển khai/kiểm thử bằng Node 24.21.0 và npm 11.19.0 trên Windows. Mở PowerShell trong thư mục dự án:

```powershell
npm ci
npm run dev
```

Mở URL Vite in ra, mặc định **http://127.0.0.1:5173/EVENTIDE/**. Chọn **Hướng dẫn** rồi **Khởi hành**. Nếu cổng đã dùng, Vite báo cổng thay thế. Dependency đã cài trong workspace hiện tại, có thể chạy ngay `npm run dev`. `npm install` cũng dùng được; giữ `package-lock.json` để cài tái lập.

Để chơi bản build local:

```powershell
npm run build
npm run preview
```

Mở URL preview in ra, mặc định http://127.0.0.1:4173/EVENTIDE/. Không mở `index.html` bằng `file://`. Sau cài đặt/build, chơi qua local server không cần Internet. Chưa triển khai hosting.

## Điều khiển và mục tiêu

| Thao tác | Phím |
|---|---|
| Bay, thả để dừng | WASD hoặc mũi tên |
| Chiến đấu | Module tự ngắm/bắn |
| Chọn nâng cấp | Click hoặc 1 / 2 / 3 |
| Pause / tiếp tục | Esc hoặc nút HUD |
| Xem/đóng Build hiện tại | B hoặc nút HUD; mở từ draft giữ nguyên lựa chọn/reroll |
| Đổi lựa chọn | Nút Đổi lựa chọn 1/1, một lần miễn phí mỗi draft |
| Tắt âm | Nút âm HUD; âm lượng ở Cài đặt |

Beacon tự sạc sau 720 giây mô phỏng. Tàu hoặc Beacon hết HP là thua; giết boss không tự kết thúc màn. Vùng sáng hồi 1 HP/s, giảm tốc quái thường 20%; rời sáng tăng Corruption. Từ 50 trở lên, sát thương gây **và nhận** đều tăng 20%. Tam giác vàng đánh dấu quái nhắm Beacon. Đừng bỏ hải đăng quá lâu.

Pause, chọn nâng cấp và chuyển tab dừng mô phỏng; trở lại tab phải chủ động tiếp tục. Bỏ lượt/chơi lại giữa trận không nhận thưởng. Reload về menu, không tiếp tục lượt cũ. Tiến triển lưu bằng localStorage của origin hiện tại; đổi cổng là vùng lưu khác. Xóa tiến triển trong Cài đặt yêu cầu xác nhận.

Có Nova, một map, Plasma → Mini Sun → Supernova, Orbital Drones, Gravity Well, Pulsar Beam và Ion Storm, sáu hỗ trợ (chọn hai loại/run), ba Hollowborn, Elder Star hai phase, gravity môi trường, menu/hướng dẫn/pause/kết quả, âm thanh tổng hợp, Beacon Core ba cấp và Echo. Phi thuyền/Danh mục/Thành tựu nằm ở menu; Build/B cho xem chỉ số và loadout, không nhận nâng cấp miễn phí. Sau blur/ẩn tab, đóng Build vẫn cần chủ động tiếp tục.

Bonus support cộng trên base, cấp5: damage/rate40%, HP/nhặt50%, tốc25%, giáp20%. Rate chia interval, không phải trừ cùng phần trăm cooldown; Core chỉ tăng HP Beacon. Career giữ từ1.2;28 huy hiệu không cộng tiền/stat, metrics mới bắt đầu theo dõi từ1.3; autosave5s simulation và tại lifecycle/milestone. Crash có thể mất đoạn chưa flush. Không lưu run dang dở hoặc bịa kill lịch sử từ tiền.

## Kiểm thử

```powershell
npm run typecheck
npm run test
npm run build
npx playwright install chromium
npm run test:e2e
npm run test:production
```

Chromium chỉ cần cho kiểm thử tự động. Trong môi trường hạn chế ghi profile, cài browser vào workspace:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH="$PWD\.playwright"
npx playwright install chromium
npm run test:e2e
```

E2E chạy Vite 5173 với `?e2e=1`, save key `eventide.e2e.v1` riêng. Hook chỉ có ở DEV/benchmark + query này; production loại hook. `test:production` dùng bản build gần nhất qua preview 4173; chạy build trước lệnh này. Unit gồm fixed-step 30/60/144 FPS, luật biên, kinh tế và mô phỏng đủ 720s. Các snapshot nguồn regression cần cho checkout sạch ở tests/fixtures/history; output/ảnh/build trong artifacts chỉ local, không push. Kết quả chiến thuật hiện hành: `artifacts/v141/strategies.json`; ảnh/trace: `test-results/` (smoke riêng ở `test-results-production/`); ảnh bàn giao tại `artifacts/screenshots/`. Xem [trạng thái kiểm tra](docs/status.md) cho kết quả và giới hạn thực tế.

## Cấu trúc và nơi chỉnh

```text
src/assets/             Manifest typed, fallback
src/game/config/        balance.ts: luật số; content.ts: module/quái/wave
src/game/core/          RunState, GameSession, fixed clock, math
src/game/systems/       Movement, XP/upgrades, combat, spawn/events, weapons, boss
src/game/scenes/        Boot và GameScene điều phối
src/game/presentation/  WorldRenderer: sprite, camera, hiệu ứng
src/game/services/      SaveService, AudioService
src/game/ui/            GameUI: menu/HUD/modal/focus
src/game/debug/         Hook chỉ DEV + e2e
src/styles/             Tokens và UI CSS
public/assets/images/  SVG local theo vai trò
scripts/                Nguồn sinh SVG
tests/                  Vitest, Playwright
docs/                   Tài liệu theo mã nguồn thực tế
prompts/                Snapshot khởi tạo và mẫu sửa
```

VNext thêm `PickupSystem` (merge/ledger/sổ loot), `presentation.ts` (budget FX/quality/compaction), `SpritePool`/`interpolation`, `FontService`, `bakeTextures`, `PerfSampler`; hình học gốc ở `scripts/asset-shapes.json`. Font Noto local có OFL và metadata/hash ở `public/assets/fonts/`. Giảm hiệu ứng/rung và quality trong Cài đặt không thay spawn/damage/hitbox/loot. Save cũ không có quality mặc định Cao.

1.2 thêm `config/progression.ts` (character/support/achievement), `core/stats.ts` (selector chung), `ProfileService`, `BossLifecycle`, `ui/ProgressionView`; giữ ID hull/magnet, schema2 cùng key eventide.save.v1. Thêm mốc ở ACHIEVEMENTS, đổi cấp/cap ở SUPPORTS; stat mới cần thêm calculator/formatter có typecheck. Enemy scaling/BOSS_PHASES ở balance.ts, pattern/transform ở BossSystem. Không nâng dependency/framework.

## Tái hiện hiệu năng và QA

Mở http://127.0.0.1:5173/EVENTIDE/?perf=1&overlay=1 ở dev để xem counter, hoặc chọn window.__eventidePerf.scenario('dense') / 'endgame' trong console. Fixture có HP lớn/module tối đa để giữ workload, không là playtest cân bằng. Hook dùng save test riêng; production thường không hook kể cả query. longRun(seed, fusion) dùng stats chuẩn/draft thật, bot Hull+Armor/Plasma+Pulsar+Ion; helper beta chọn seed7 và hợp nhất chủ động. Không tăng time/HP/XP.

Kiểm thử hotfix trên build cố định, lưu riêng với số đo lịch sử:

```powershell
npm run build:benchmark
npm run test:v141
```

Benchmark hotfix ở artifacts/v141/after-benchmark, preview4195 do Playwright quản lý. test:e2e chạy cùng bộ trên dev5173; không sửa source trong lúc chạy để tránh HMR. Ảnh/click/commit/resume ở artifacts/v141/visual. Chưa chạy benchmark FPS toàn phiên bản hotfix; [hiệu năng](docs/performance-report.md) ghi rõ bằng chứng cũ và kiểm tra mới.

Các lệnh perf:compare/perf:long-run/perf:report là công cụ lịch sử **beta1.4**, dùng bundle đóng băng4193/4194 và nguồn final-measured-source. Không build hotfix đè artifacts/v14 hoặc gán các số đó cho1.4.1. perf:report xác minh và ghi performance-v1.4.md. Test:vnext/v12/v13/v14 là alias tương thích chạy build hiện hành4195 như test:v141.

Hồ sơ1.3 ở artifacts/v13; bundle cuối BpMrDiaJ và source final-measured-source có formatter HP lẻ đã sửa. Build/source/mẫu trước sửa giữ ở pre-hud-fix-*; không trộn percentile giữa các bundle. Lịch sử1.2 được giữ tại status-v1.2.md/performance-v1.2.md và artifacts/v12; prompt cũ/BUILD_MVP không đổi. Dense/endgame so1.2 giữ ba module cũ/cùng fixture, storm riêng có Plasma/Pulsar/Ion5 và max rate60%; không coi workload mới là cùng before.

Chỉnh module: sửa dòng cấp trong `PLASMA`, `DRONES`, `WELLS` ở [content.ts](src/game/config/content.ts); tooltip đọc cùng bảng. Thêm quái: thêm `EnemyId`, stats `ENEMIES`, sprite/manifest và trọng số chọn trong `SpawnSystem`; thêm behavior nếu cần trong system tương ứng. Thay Nova: thay `public/assets/images/player/nova.svg` hoặc entry `nova` trong manifest, giữ64×64; không sửa radius nếu chỉ đổi hình. Chi tiết: [kiến trúc](docs/architecture.md), [cân bằng](docs/balance.md), [asset](docs/asset-guide.md).

[GAME_SPEC.md](GAME_SPEC.md) là luật hiện hành; [AGENTS.md](AGENTS.md) hướng dẫn làm việc. `BUILD_MVP.md` root được giữ nguyên; [prompts/BUILD_MVP.md](prompts/BUILD_MVP.md) sao nguyên văn để khôi phục cấu trúc thiếu ban đầu. Khi sửa game dùng [prompts/MODIFY_GAME.md](prompts/MODIFY_GAME.md). Concept gốc ở `concept/EVENTIDE_Concept_Web.docx`.

Dependency thực tế: Phaser3.90.0, Vite7.3.7, TS5.9.3, Vitest4.1.12, Playwright1.64.1. [Phaser3.90](https://phaser.io/download/release/v3.90.0) và [yêu cầu Node của Vite](https://vite.dev/guide/) là nguồn chính thức; lockfile ghi chính xác bản đã cài.

## Luật 1.3 được giữ và thay đổi beta

- Esc không có nút Build; B/HUD/draft vẫn xem được và giữ reroll. Nút Thay vũ khí chủ động trong draft cho xem “cũ cấpN→mới cấp1”; chọn ô để xác nhận hoặc Hủy/Esc về cùng draft. Chỉ ô đó mất level/evolution, các nguồn khác giữ.
- Mảnh lục giác thu hồi tự lắp:0,5%/1%, run-only, tổng tối đa20% cả năm stat; speed riêng≤10%, không giáp. Build có nguồn trang bị/ngân sách riêng. Support và gear cộng trên base; rate chia interval. Mảnh mất sau30s simulation, EXP không expiry.
- Minute scaling trong balance.ENEMY_SCALING: Wisp5%/5%, Drifter8%/7%, Leech10%/8% HP/damage mỗi phút từ base, max11phút. Quái đang sống giữ HP ratio; boss riêng6900→4485. Không tăng speed/spawn/cap.
- Chỉnh mức/nhịp/chain ở content.PULSAR/ION; drop/TTL/caps ở config/salvage.ts,28 achievement ở config/achievements.ts, model/HP Core ở config/beacon.ts và asset-shapes.json. RunStats không lưu qua reload.
- Beacon menu có model Hiện tại/Sau nâng cấp, ví và lý do thiếu tiền cạnh nút. Chỉ HP thay theo Core; level2 với21tinh khiết báo thiếu9 để mua cấp3 giá30,360→390HP. Preview không tốn tiền, chỉ lượt mới nhận Core đã mua.
- Test:vnext/test:v12/test:v13 là alias tương thích của config hiện hành; dùng test:v141 khi chạy bản benchmark mới. Kết quả/giới hạn thật ở status; số và glyph phải kiểm tra ảnh, không chỉ textContent.

## Mastery, tiến hóa và sự kiện beta

Đủ ba module cấp5 và đủ hai hỗ trợ đã chọn đạt max (hiện cấp5) mới mở mastery: mỗi thẻ+2%, tổng10lựa chọn/20%, riêng speed10%. Thiếu ô hoặc còn level thì tiếp tục nhận/nâng cơ sở. Luật này thay thế mastery ba vũ khí của beta1.4. Budget hết thì hồi tối đa10HP hoặc Tiếp tục. Nút Thay vũ khí trong draft là hành động mất cấp: chọn loại/ô/xác nhận, mở lại progression nhưng giữ mastery đã kiếm. Hủy giữ draft/reroll/XP.

Esc pause → B → Tiến hóa sẵn sàng → Xác nhận tiến hóa ngay đầu vùng cuộn → Quasar5 xuất hiện → B trở về pause → Tiếp tục. B/HUD/Build trong draft → Tiến hóa khi Pulsar5+Ion5 → xác nhận Quasar5, giải phóng một ô; không tiêu level-up và không tách lại. Fusion mở lại nâng cơ sở vì thiếu một ô; bonus/budget mastery đã kiếm giữ nguyên, hoàn thiện lại mới dùng phần ngân sách còn lại. Ba vai trò chính/phụ/bổ sung chỉ phân loại, không ép mỗi nhóm một ô. Drones5 tự thành Bastion, Well5 tự thành Singularity; các hình thái giữ ID/cấp/slot.

Radiation210–255s có vùng gạch ngang ngoài lõi, tránh hoặc dụ quái vào; chaos330–420s quái thườngHP/damage+50%, tàu damage+15%; tide465–510s hút/đẩy nhịp6s. Warning3s riêng, chỉ một event lớn, pause đóng băng, gravity cuối630 vẫn giữ. Xem Build để tách nguồn mastery/event. BossHP+15%, damage+10%, rate+5%, telegraph và tốc giữ.

Số thực thi: config/mastery.ts, events.ts, content.ts và balance.ts; systems/EvolutionSystem/AstronomySystem; BeaconFeedback và bakeTextures lo trình bày. Baseline1.3 ở artifacts/v14/baseline-source; lịch sửdocs/status-v1.3 và performance-v1.3 giữ nguyên. Prompt beta được sao nguyên văn vào prompts, các prompt MVP không sửa.

Tra [thuật ngữ](docs/glossary.md) để phân biệt module, hỗ trợ, mastery và nguồn gốc các hình thái tiến hóa.

Áp dụng hotfix bằng reload sau khi kết thúc/bỏ lượt hiện tại. Game không lưu run dang dở: reload về menu, giữ profile trên cùng host/cổng; không xóa/sửa localStorage. Bonus run cũ được giữ khi mutation trong session hiện hành, không thể khôi phục một run đã reload.
