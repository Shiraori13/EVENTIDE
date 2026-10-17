# EVENTIDE1.2 — hiệu năng và lượt dài · 2026-10-16

Đã giữ font/cache nền/atlas/pool/culling/nội suy/HUD cache/XP ledger/audio cleanup1.1. Nâng progression và hai phase có thêm workload, không tuyên bố zero overhead. Báo cáo lịch sử1.1 nằm ở [performance-v1.1.md](performance-v1.1.md); phương pháp chi tiết, cấu hình/môi trường và giới hạn đối chứng ở [performance-1.2-method.md](performance-1.2-method.md).

Các số cuối dùng đúng bundle DW48mbSI đã pass59 unit/22 e2e/production smoke, gồm spawn an toàn/grace3s và nhãn reset profile. Nguồn tương ứng ở artifacts/v12/final-measured-source, build ở after-benchmark. Mẫu trước sửa nhỏ (jXlw4oxB) giữ tại after-pre-spawn-fix/long-run-pre-spawn-fix và measured-source/measured-benchmark, không trộn vào bảng cuối.

## Preview trước/sau

Build1.1 frozen và1.2 tối ưu mode benchmark, seed20261016, High/DPR1/CSS+backing1280×720/WebGL SwiftShader software; mỗi cảnh một mẫu60s sau warm10s, browser tuần tự. Normal production không có probe. Đây không phải input-to-photon/GPU desktop hoặc replay bit-identical. Không hạ mục tiêu sau đo: p95≈20ms/p99≈33.3ms trên60Hz vẫn là tham chiếu.

Dense cả hai giữ110quái/120đạn nền, XP500 pinned. Endgame1.1 có phase1/160đạn nền,1.2 có phase2/fan/120đạn nền để không bóp Plasma bằng cap fixture, XP700 pinned.1.2 dùng power/haste40%,1.1 Hull/Magnet; không gọi đây là cùng toàn bộ gameplay/quality. Actual mean/counter ghi dưới; art/NPC sprite và render scale giữ, pattern phase2 mới có chủ đích.

<!-- PERF12_START -->
| Cảnh | Build / seed | p50/p95/p99 ms trước→sau | >33.3 / >50ms trước→sau | Quái/đạn mean trước→sau | Pickup logic/visual mean trước→sau | Heap đầu→cuối MiB trước→sau |
|---|---|---|---|---|---|---|
|dense #1|./assets/index-DMkLancT.js→./assets/index-DW48mbSI.js/20261016|34.5/45/53.1→34.4/38.6/40.2|1068/29→1112/0|110/120.19→110/120.25|62/0→62/0|31.01→31.61 / 24.28→39.33|
|endgame #1|./assets/index-DMkLancT.js→./assets/index-DW48mbSI.js/20261016|26.4/30.7/32.3→28.7/32.6/34.7|8/0→60/0|110/160→110/122.83|65/0→65/0|26.85→41.93 / 27.97→37.75|

CPU p95 (ms; Scene/render/UI theo frame, system theo fixed step):

| Cảnh | Scene | Combat | Pickup | Spawn | Move/Gravity | Weapons/Boss | Render prep | UI |
|---|---|---|---|---|---|---|---|---|
|dense|1.1→0.8|0.3→0.2|0.1→0.1|0.1→0.1|0.1→0.1|0.1→0.1|0.3→0.2|0.2→0.2|
|endgame|1.1→0.9|0.4→0.2|0.1→0.1|0.1→0.1|0.1→0.1|0.1→0.1|0.3→0.3|0.2→0.2|

dense: p95 45→38.6ms, >50ms 29→0; endgame: p95 30.7→32.6ms, >50ms 0→0. Mẫu một lượt/workload phase2 khác, không suy tỷ lệ regression ổn định hoặc60FPS; mục tiêu p95≈20ms chưa đạt. Số0.0 ở độ phân giải0.1ms không có nghĩa zero work.

<!-- PERF12_END -->

Mẫu ban đầu trước fix nhỏ cũng được giữ: dense33.6→37.0ms/endgame26.5→29.8ms, không >50ms. Cặp cuối dense45.0→38.6ms/endgame30.7→32.6ms; chiều biến động dense đảo, nên không chọn một cặp thuận lợi để kết luận tối ưu hoặc “giữ nguyên FPS”. Workload phase2 khác và một lượt/cặp chưa đủ kết luận tỷ lệ regression ổn định. Full Phaser renderer/driver/raster ngoài Scene chưa tách riêng, không gọi phần còn lại toàn bộ là GPU time. P95 cảnh đông1.2 vẫn chưa đạt20ms.

Các cap thật vẫn110 thường+boss/160projectile/220activeXP/3249ledger/640sprite. Stress simulation60s cho172shot Plasma, peak56projectile và1Well, không cap-starve rate40%; không tăng số vô hạn/expiry XP. Đây là fixture HP1e8 để giữ workload, không balance run. Hash/count font không đổi;23SVG bake vào atlas1024×384 (vẫn3 hàng), backing sao theo viewport, không canvas5200×5200.

## Vòng đời

<!-- LIFECYCLE12_START -->
Hai lượt warm-up + 5 lượt tương đương: scene listeners=48/48/48/48/48, textures=28/28/28/28/28, pool capacity=274/274/274/274/274, DOM listeners sauGC=130/130/130/130/130. Timer/tween/body0; backing sao1280×720. Raw lifecycle.json; đây là plateau ở workload này, không bằng chứng mọi leak không tồn tại.
<!-- LIFECYCLE12_END -->

Giữ ownership UI/audio/scene. Profile delta dùng WeakMap, không giữ mọi run/death event; toast một vùng, tối đa5 tên. Snapshot5s simulation/paused/end/menu/milestone, không localStorage mỗi hit/frame. Không runtime setInterval hoặc independent damage clock.

## Render đủ thời lượng

<!-- LONG12_START -->
Đã render đủ720s simulation/723.1s wall, seed42/core0, draft thật ưu tiên Hull+Armor, không grant HP/module/XP. Victory/cấp33/kills1004/reward17; HP tàu150, Beacon293.1. Boss chuyển phase2 ở625.57s, final death ở668.32s, final gravity=true. Career total=1004, không cộng lại tại result.

Frame p50/p95/p99=24.4/28.9/32.2ms; >50ms=0/29520. Pageerrors=0. XP tạo3859=đã thu3479+map380, đúng ở mọi checkpoint10s. Pool cuối93, textures28, scene listeners48. Raw/ảnh trong artifacts/v12/long-run. Đây là autoplay headless có render/audio ở clock thường, không chơi tay hoặc fast-forward.
<!-- LONG12_END -->

Playtest draft tự nhiên và preset TTK được phân biệt ở [balance-v1.2](balance-v1.2.md). Source/build/JSON/ảnh tại artifacts/v12; các lượt UI đặt gần cuối không là bằng chứng chơi đủ12phút. Autosave Career bắt đầu từ1.2, schema2 cùng key cũ; tests/perf dùng key riêng.

## Giới hạn

Headless SwiftShader không đại diện GPU vật lý. Chưa có trace tách render/native/driver/GPU hoặc đo input-to-photon/refresh vật lý; chưa native zoom/Firefox/Safari/chơi tay/nghe audio/soak20–30phút. Bot phản ứng mỗi tick không chứng minh cân bằng người mới. Target p95 chưa đạt ở cảnh đông; kết quả không được gọi là hết giật hoặc60FPS mọi máy.

Tái hiện bằng npm run build:benchmark, hai preview4181/4182 rồi npm run perf:compare, perf:long-run, perf:report; README ghi lệnh đầy đủ. Không chạy thêm browser/tests/build trong lúc lấy mẫu.
