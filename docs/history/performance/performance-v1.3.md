# EVENTIDE 1.3 — hiệu năng và lượt dài · 2026-10-17

Giữ cache nền theo viewport, font, atlas, pool/culling, XP ledger, nội suy và audio cleanup của 1.1–1.2. Progression, loot và vũ khí mới có chi phí; không tuyên bố zero overhead. Lịch sử tại [performance-v1.2](performance-v1.2.md), [status-v1.2](../status/status-v1.2.md) và `artifacts/v12`. Production thường loại probe; benchmark mode tối ưu có instrumentation và dùng save test riêng.

## Phương pháp

Build 1.2 đóng băng tại `artifacts/v13/baseline-benchmark`, nguồn ở `baseline-source`. Build 1.3 ở `after-benchmark`, nguồn cuối ở `final-measured-source`. Bundle cuối BpMrDiaJ gồm sửa HUD HP lẻ; nguồn/build/mẫu trước sửa ở pre-hud-fix-* và không trộn vào bảng cuối. Baseline1.2 của cặp cuối giữ nguyên từ lượt trước sửa DOM; after lấy lại sau fix cùng protocol, không chạy test/browser khác khi lấy mẫu. Không sửa nguồn/rebuild trong lúc đo. Hai preview local 4191/4192; Chromium 156, Playwright 1.64.1, Windows, Node 24.21/npm 11.19. Máy đo i5-12450HX, 12 logical CPUs, RAM khoảng 19,7 GiB; renderer ANGLE Vulkan SwiftShader software. Đây không phải GPU vật lý, màn hình 60 Hz hoặc input-to-photon.

Dense/endgame dùng cùng seed 20261016, High, DPR 1, CSS/backing canvas 1280×720. Mỗi cảnh warm-up 10 giây rồi lấy mẫu 60 giây, một lượt; browser chạy tuần tự. Cả hai build dùng Plasma/Drones/Well cấp 5, power/haste 40%, 110 quái và 120 đạn nền, XP 500/700 pinned xa camera, cùng hàm input. Endgame cả hai có phase 2/fan/gravity. Luật minute/stat của 1.3 khác có chủ đích; fixture HP 1e8 giữ workload. BaseHP của fixture được chốt tương ứng với phút để minute event không làm mất immortality. Pickup logic và visual báo riêng; XP pinned ngoài camera không được coi là cảnh nhiều pickup nhìn thấy. Không phải replay bit-identical hoặc playtest cân bằng.

Storm riêng 1.3 dùng Plasma/Pulsar/Ion cấp 5, power/haste 40% và gear rate 20% (đúng tổng ngân sách 2.000 bp), 110 quái/120 đạn nền/XP 700/phase 2/gravity, HP fixture 1e8. Mục đích là kiểm tra workload và rate cao có giới hạn; không có before 1.2 tương đương. Pending salvage/TTL/cap 32 được kiểm tra riêng bằng simulation; EXP không expiry. Cap gameplay vẫn 110 quái thường cộng boss, 160 projectile, 220 XP active và ledger 3.249 cell, 640 sprite. Config hiện tại giữ tối đa một pulse, tám Ion trace, trail High/Low 4/2.

Atlas tăng từ 23 lên 29 entry, 1024×384 lên 1024×512; texture count từ 28 lên 34 là tăng tĩnh do sáu asset mới. Font và SVG cũ giữ nguyên. Beam/Ion dùng geometry hiện có, không tạo canvas/gradient mỗi frame. Ship chỉ damp rotation/thrust, không tween body hoặc thêm camera smoothing.

## A/B và stress

<!-- PERF13_START -->
| Cảnh | p50/p95/p99 ms 1.2→1.3 | >33,3ms / >50ms 1.2→1.3 | Quái / đạn mean 1.2→1.3 | Pickup logic / visual 1.2→1.3 | Heap đầu→cuối MiB 1.2 / 1.3 |
|---|---|---|---|---|---|
|dense #1|34,8/39,8/42,7→33,1/38/40,9|1125/2→880/2|110/120,24→110/120,23|62/0→62/0|25,2→40,68 / 29,41→42,6|
|endgame #1|31,3/37,8/41,9→28,8/35,1/39,3|600/0→212/1|110/122,86→110/123|65/0→65/0|26,72→40,82 / 28→34,51|

CPU p95 ms, Scene/render/UI theo frame, systems theo fixed step:

| Cảnh | Scene | Combat | Pickup | Spawn | Move/Gravity | Weapons/Boss | Render prep | UI |
|---|---|---|---|---|---|---|---|---|
|dense|1,1→0,9|0,3→0,2|0,1→0,1|0,1→0,1|0,1→0,1|0,1→0,1|0,3→0,3|0,2→0,2|
|endgame|1→0,9|0,2→0,2|0,1→0,1|0,1→0,1|0,1→0,1|0,1→0,1|0,3→0,3|0,2→0,2|

Build 1.2 ./assets/index-DW48mbSI.js, build 1.3 ./assets/index-BpMrDiaJ.js. Một lượt/cảnh, không suy regression ổn định hoặc 60FPS từ A/B này.

Storm 1.3: p50/p95/p99=28,5/33,3/36,2ms, >50=2/2094; mean quái/đạn=110/123,05, pulse=0,51, Ion trace=0,22. Workload mới, không có before1.2 tương đương.

<!-- PERF13_END -->

Mẫu pre-dom-fix riêng: dense1.3 p95 46,8ms so baseline39,8ms, endgame38,1ms so37,8ms. CDP ghi RecalcStyleCount1447 so584 ở dense/60s; đã bỏ hidden write thừa và tick toast menu theo budget80ms, kiểm tra MutationObserver riêng. Sau guard, dense cuối có RecalcStyleCount609/LayoutCount609 so1447/612 trước sửa; p95 giảm46,8→38,0ms trong các mẫu này. MutationObserver xác nhận không ghi hidden khi trạng thái không đổi. Không quy toàn bộ chênh frame-time cho DOM hoặc suy mức cải thiện ổn định từ một mẫu.

Mẫu audit trước triển khai được giữ riêng tại before-audit: baseline1.2 dense p95 38,7ms/endgame33,4ms; mẫu trước sửa HUD tại before-pre-hud-fix có38,8/33,9ms. Không chọn số thuận lợi hoặc gộp percentile với cặp cuối. Dao động giữa các lần đo là giới hạn thực tế của môi trường này.

Tham chiếu p95 khoảng 20 ms/p99 khoảng 33,3 ms giữ nguyên, không hạ mục tiêu theo kết quả. Một lượt/cảnh chưa đủ kết luận tỷ lệ regression ổn định. Renderer/driver/raster ngoài Scene chưa tách riêng, không gọi toàn bộ phần chênh lệch là GPU time.

## Vòng đời

<!-- LIFE13_START -->
Hai warm-up +5 lượt tương đương: textures=34/34/34/34/34, scene listeners=48/48/48/48/48, pool=274/274/274/274/274, DOM listeners sau GC=145/145/145/145/145. Timer/tween/body=0, backing sao1280×720; resize1366×768 pass. Storm riêng 5 lượt: pool=254/254/254/254/254, textures=34/34/34/34/34, pulses≤1/Ion traces≤8. Plateau tại workload này, không chứng minh mọi leak đều hết.
<!-- LIFE13_END -->

## Render đủ lượt

<!-- LONG13_START -->
Render đủ 720s simulation / 722,77 giây wall, seed42/core0, draft thật ưu tiên Hull+Armor và Plasma/Pulsar/Ion. Victory / cấp 33 / kills 1002/+17 Stardust; HP tàu 139,76, Beacon 300. Boss phase2 tại 621,37s, final death 656,47s, final gravity=true. Career 1002, không cộng lại result.

Trang bị 20%/20%, drops 33, nhặt 27, cap lúc 430,25s, capHits 0. XP tạo 3910=thu3396+map514, đúng ở mọi checkpoint10s. Frame p50/p95/p99=26,6/32,2/34,6ms, >33,3=686, >50=25/27040. Errors=0, textures 34, scene listeners 48, pool 85. Build ./assets/index-BpMrDiaJ.js khớp A/B sau; đây là headless autoplay có render clock thường, không fast-forward hoặc chơi tay.
<!-- LONG13_END -->

JSON/ảnh tại `artifacts/v13`; checkpoint mỗi 10 giây có XP ledger, gear, profile, seed và hash bundle. 18 lượt fast-forward tách riêng tại [balance-v1.3](../balance/balance-v1.3.md). UI hook đặt thời gian 719,99 giây không là bằng chứng chơi đủ lượt. README ghi cách đo tuần tự; `perf:report` validate artifact thật rồi điền bảng có marker.

## Giới hạn

Headless SwiftShader không đại diện GPU desktop. Chưa đo native zoom, refresh vật lý, input-to-photon; chưa Firefox/Safari, chơi tay đủ 12 phút, nghe đánh giá audio hoặc soak 20–30 phút. Video input là điều khiển tự động theo tốc độ thật, không thay cảm giác người chơi. Không tuyên bố hết mọi leak, lỗi font, stall hoặc 60 FPS trên mọi máy.
