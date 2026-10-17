# Trạng thái EVENTIDE 1.3 · 2026-10-17

Nâng trực tiếp bản 1.2 theo `prompts/EVENTIDE_V1_3_Beacon_Loot_Weapons_Prompt.md`, không tạo lại dự án hoặc nâng dependency. Nguồn/tài liệu/build 1.2 được giữ tại `artifacts/v13/baseline-source`, `baseline-dist`, `baseline-benchmark`; lịch sử tại [status-v1.2](status-v1.2.md) và [performance-v1.2](performance-v1.2.md). Prompt MVP và các prompt cũ giữ nguyên.

## Đã triển khai

- Bỏ đúng nút Build trong pause Esc, giữ B/HUD/draft và overlay stack. Thành tựu có 28 mục, filter trạng thái/nhóm, formatter vi-VN, vùng nội dung cuộn với header/footer riêng. UI không còn giải thích flush/crash kỹ thuật.
- Beacon Core có model cấp 0–3, preview hiện tại/sau nâng cấp dùng cùng appearance registry với world. Ví, bảng chỉ số và lý do thiếu tiền cạnh nút mua. Guard expectedLevel/currency/max cùng debounce UI; preview không sửa profile/run, Core chỉ áp từ run mới.
- Schema 3 cùng key `eventide.save.v1`, giữ tiền/Core/Echo/settings/character/career và ID huy hiệu cũ. Metrics mới không suy từ lịch sử chưa có; Core/career được đánh giá từ dữ liệu thật. Typed kills, best-run, survival, victory/HP ratio, evolution, weapon hit, boss phase/final, salvage, Corruption và actual light heal đều có credit thật; badge-only.
- Minute scaling tuyến tính từ base: Wisp HP/damage +5%/+5%, Drifter +8%/+7%, Leech +10%/+8%, max 11 phút. Cập nhật quái sống một lần khi đổi phút, giữ HP ratio/target/cooldown; spawn mới cùng curve. Bỏ curve progress/speed growth 1.2, không tăng spawn/cap/hit frequency hoặc scale boss.
- Salvage run-only, 50/100 bp mỗi mảnh, tổng ngân sách 2.000 bp; từng stat tối đa 2.000 bp, speed tối đa 1.000 bp, không giáp. Drop/collect có ownership, TTL 30 giây simulation, cap 32 và counter. Bonus cộng với hỗ trợ trên base; maxHP tăng current đúng delta, không tính là hồi trong sáng. EXP giữ ledger/conservation và không có TTL mới.
- Pulsar quét cả sector giữa tick, một hit/enemy/pulse và nguồn theo tàu. Ion chốt chain visited/path/damage tại tick, VFX không giữ enemy reference. Cấp 1–5 có catalog/Build/HUD/tooltip. Swap theo ô/draft, chỉ ô thay về cấp 1, hủy giữ draft/reroll/XP; dọn attack cũ và chờ cadence đầu.
- Ship presentation damp góc cung ngắn/thrust theo simulation render time; giữ vị trí float, collision, tốc độ/dừng và camera cùng interpolation alpha. Sáu SVG CC0 mới; atlas 29 entry, 1024×512. Giữ font local, pool/culling, XP merge/ledger và cleanup audio.

## Kiểm tra đã chạy

Windows/PowerShell, Node 24.21.0, npm 11.19.0, TypeScript 5.9.3, Phaser 3.90.0, Vite 7.3.7, Vitest 4.1.12, Playwright 1.64.1/Chromium 156.0.8078.4. Browser ở `.playwright`, headless dùng ANGLE Vulkan SwiftShader software. Không coi số đo này là GPU desktop.

| Lệnh / kiểm tra | Kết quả thực tế |
|---|---|
| Baseline 1.2: typecheck/test/build/test:e2e | Pass strict, 59/59 unit, build và 22/22 e2e (3,4 phút) trước thay đổi runtime. Lần đầu Vitest bị sandbox chặn spawn esbuild (EPERM); chạy lại bằng quyền thực thi local đã pass. |
| `npm run typecheck` | Pass trên source cuối. |
| `npm run test` | Pass 83/83, 9 file, 28,36 giây; sau sửa formatter HP lẻ chạy lại22/22 ca liên quan (464ms). Gồm 18 lượt tự nhiên, TTK, luật 1.3 và hồi quy; test TTK/playtest 1.2 dùng source snapshot riêng. |
| `npm run build` | Pass. App 92,34 KB / gzip 32,64 KB; CSS 14,59 KB / gzip 4,03 KB. Phaser 1.208,06 KB / gzip 332,17 KB; warning chunk >500 KB còn, không phải lỗi build. |
| `npm run build:benchmark` | Pass, entry `index-BpMrDiaJ.js`, outDir `artifacts/v13/after-benchmark`. Nguồn tương ứng tại `final-measured-source/src`; không sửa/rebuild trong lúc đo cuối. |
| `npm run test:e2e` | Pass 33/33, 5,3 phút: 22 regression và 11 ca 1.3. Có sáu tổ hợp viewport/zoom, filter/28 card, footer/card cuối, Core thiếu tiền/double action, swap/cancel, loot/hit thật, fallback font mới, input thật và storm lifecycle. |
| `npm run test:v13` | Pass33/33,5,4 phút trên bundle BYyrjFVB sau sửa HUD HP lẻ; sau sửa DOM toast chạy lại3/3 luồng Core/swap/kill-achievement (22,9s) trên bundle cuối BpMrDiaJ và production smoke; đầy đủ cả regression và11 ca1.3. |
| `npm run test:production` | Pass 1/1, 2,9 giây: không hook dù query test/perf, không request ngoài origin, tiếp tục chơi offline sau load. |
| `node scripts/generate-assets.mjs` | Tạo 29 SVG thật, sáu asset mới CC0. Font/giấy phép local giữ; không asset/audio rỗng. |
| `node --check` các helper benchmark/compare-v13/long-run/summarize-v13 | Pass syntax. Không thay kiểm tra gameplay/UI. |
| Đối chiếu file/asset/bản build |46 file src khớp snapshot đo;23 SVG cũ và2 font giữ SHA-256;29 SVG local. Dist không có __eventide/eventide.e2e; prompt1.3 khớp file Downloads, hai BUILD_MVP khớp; dev5173 HTTP200. |
| A/B cuối và storm | Cùng protocol/seed/High/DPR1/1280×720, warm10s/sample60s, một lượt/cảnh. Before1.2 từ perf:compare giữ nguyên; node benchmark lấy lại after1.3 sau fix DOM. Dense39,8→38,0ms/endgame37,8→35,1ms p95; storm33,3ms. Các mẫu pre-fix/audit giữ riêng. |
| npm run perf:long-run / perf:report | Pass trên đúng hash BpMrDiaJ.720s thường/victory/thưởng17, XP/profile/achievement/hash và lifecycle đều được script validate rồi cập nhật bảng từ JSON. |
| QA VFX High/Low trên build cuối | Pass sau khi hoàn tất đo: capture Pulsar+Ion+gravity active, UI ẩn để xem vùng game; mỗi chain6target và pulse hiện. Lần đầu capture bị modal XP của fixture làm pause trước mốc; đã clear XP trong fixture QA, không sửa code hoặc số đo. Raw weapon-visual-check.json và ảnh weapons-gravity-{high,low}.png. |
| Kiểm tra toast cuối bằng MutationObserver | Pass:0 hidden mutation/1s khi ổn định,1 mutation khi hết hạn; toast menu tự hết hạn. Raw toast-mutation-check.json khớp bundle cuối. |
| Stress 1.2 lịch sử từ source frozen | Đã chạy lại đúng fixture cũ: 172 shot / peak 56 đạn / Well 1; giữ artifact 1.2, không gán kết quả 1.3 vào đó. |

Trong triển khai có test cũ thất bại vì kỳ vọng pool/scaling/schema 1.2; đã cập nhật đúng thay đổi có chủ đích và giữ nguồn lịch sử. Fixture stress cần baseHP tương ứng để minute event không làm mất immortality. Fixture boss TTK đầu đặt trong lõi, bị đẩy ra ngoài tầm: đã sửa vị trí đo, không dùng ca không hit đó làm bằng chứng cân bằng. Ảnh Core đầu cho thấy lý do thiếu tiền bị khuất dưới vùng cuộn: đã chuyển ra footer và chạy lại kiểm tra visible. Ảnh weapon sau đó phát hiện ceil HP lẻ thành101/100,5; đã sửa formatter hiển thị, thêm unit/browser regression, build lại. Nguồn/build/mẫu trước sửa giữ tại pre-hud-fix-source/pre-hud-fix-benchmark và các folder *-pre-hud-fix, không gán số cũ cho bundle cuối. Chỉ lượt đo đúng hash cuối được dùng bàn giao.

## Playtest và số đo

[Playtest 1.3](balance-v1.3.md) có 18 lượt fast-forward 60 Hz qua draft/reroll/swap/drop thật, seed 7/42/104, ba cặp hỗ trợ và hai ưu tiên loadout. 13 ca thắng; cả ba nhóm có ca thắng, nhóm tốc độ/nhặt vẫn có nhiều ca thua cuối màn. Đây không phải win-rate người thật. Tất cả đạt trần gear ở khoảng 400–572 giây, không chạm cap pickup; raw có XP/level/HP/gear/drop/checkpoint/boss.

Ion cấp cao được chỉnh sau fixture đàn ban đầu: clear 20 quái từ 19,82 xuống 14,42 giây. Pulsar nhanh hơn với quái bao quanh (2,47 giây); Plasma 3,60 giây. Với 5 mục tiêu cách 200u, Ion gây 2.492 damage/10 giây tới cả 5, Plasma 1.722 tới 1, Pulsar 1.584 tới 2. Fixture boss tĩnh, không hỗ trợ/gear/wave: Plasma5 59,78 giây, Pulsar5 142,65, Ion5 158,42 qua hai phase. Không lấy các fixture này làm bằng chứng thắng với HP chuẩn; giữ HP boss 6000/3900.

Sau phát hiện thao tác hidden lặp của toast từ số liệu CDP, đã thêm guard và tick menu80ms; MutationObserver xác nhận0 thay đổi thừa/1s ổn định,1 lần khi hết hạn. Source/build/mẫu trước sửa ở pre-dom-fix-*. Không thay gameplay hoặc clock.

A/B cuối đã có: dense p95 39,8→38,0ms, endgame37,8→35,1ms; storm riêng33,3ms, mục tiêu20ms chưa đạt. Baseline lấy từ build1.2 không đổi, after lấy lại sau fix DOM cùng protocol; các mẫu audit/pre-fix giữ riêng. Lượt render cuối đã thắng720s simulation/722,77s wall: cấp33/kills1002/+17Stardust, HP tàu139,76/Beacon300. Boss phase2 tại621,37s/final death656,47s, gravity cuối có hoạt động. XP3910=thu3396+map514 ở mọi checkpoint, pageerrors0; save schema3 có1victory,17tiền,Echo và22huy hiệu đúng, không duplicate. Frame p50/p95/p99=26,6/32,2/34,6ms;25/27040 frame>50ms, không tuyên bố hết stall. Chi tiết ở [performance-report](performance-report.md).

## Cách dùng và giới hạn

`npm run dev` → http://127.0.0.1:5173. Giữ đúng host/cổng từng chơi để thấy localStorage cũ. Menu có Phi thuyền/Danh mục/Thành tựu/Beacon Core; B/HUD/draft xem Build. Thẻ vũ khí chưa sở hữu khi đầy ô mở bước thay về cấp 1; Hủy/Esc giữ nguyên lựa chọn. Mảnh thu hồi tự lắp khi nhặt, xem từng nguồn/ngân sách trong Build. Reload về menu, không resume run hoặc giữ gear.

Ảnh mới ở `artifacts/v13/visual/new`, regression ở `visual/regression`, video input tự động theo clock thường ở `artifacts/v13/video`. Bốn ảnh tham chiếu có tên trong prompt không có ở workspace/Downloads; đã đối chiếu runtime, không bịa nhận xét ảnh. Đã xem ảnh render Core/thành tựu/card cuối/storm. Zoom 125% là emulation. Chưa chơi tay đủ 12 phút, nghe đánh giá audio, native zoom, input-to-photon, GPU/refresh vật lý, Firefox/Safari hoặc soak 20–30 phút. Không tuyên bố đã cân bằng người thật, hết mọi lỗi font/leak/stall hoặc 60 FPS mọi máy.
