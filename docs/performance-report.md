# Hiệu năng UX/stability local · 2026-10-21

Nguồn hiện hành: [báo cáo thay đổi](next-beta-ux-report.md), [status](status.md). Giữ [số đo multi-boss trước](history/performance/performance-ui-hazards-multiboss.md); không dùng chúng để chứng nhận bản mới.

## Protocol và nguồn đo

win32 10.0.26200; 12th Gen Intel(R) Core(TM) i5-12450HX; Nodev24.21.0; Chromium156.0.8078.4. ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver). Đây là **software rendering**, không GPU vật lý. Viewport1280×720/DPR1, seed20261016, pinned-local-loot-v2, shake=false. Mỗi case context mới/warm5s/sample30s; chạy tuần tự sau khi đóng browser test/full-run/clip. Một lượt AB và đối chứng BA cho dense/duo. Low/reduced là stress riêng, không đổi gameplay.

Baseline **index-CtKeK4qU.js**, bản sau **index-D3jAI-Sl.js**, production riêng **index-sBaUOfj7.js**, CSS **index-C3KVvyY1.css**. Source hash xác minh từ final-provenance.json trước xuất báo cáo. Fixture stress có HP/level cố định và refill entity; không dùng nó làm kết quả cân bằng. Các natural run ở phần riêng.

Profile benchmark quiet=1: tutorial tắt/các badge test đã đánh dấu, để queue onboarding/thành tựu không khác nhau giữa A/B; chỉ trong save test của fixture. Gameplay/hit geometry/damage/dt giữ nguyên. p50/p95 bên dưới là interval thực giữa beginFrame của Phaser (performance.now), **không** là sceneCPU hoặc bot FPS. >50 dùng cùng samples này. Cột >100 là rAF probe độc lập, cùng probe cho cả bundle baseline chưa có trường over100; mẫu/số đếm rAF và Phaser có thể khác. Raw còn p99/max/over100 mới/long tasks/heap/CDP.

| Lượt / cảnh | p50 ms | p95 ms | >50 ms / N Phaser | >100 ms / N rAF |
|---|---:|---:|---:|---:|
|before-final / light|23.8|26.8|0/1253|0/1254|
|before-final / dense|30.3|33.8|0/1003|0/1004|
|before-final / endgame|25.1|29.0|0/1193|0/1194|
|before-final / duo|25.8|29.1|0/1169|0/1170|
|after-final / light|23.8|26.1|0/1259|0/1260|
|after-final / dense|30.6|35.4|0/984|0/985|
|after-final / endgame|25.2|28.8|0/1191|0/1192|
|after-final / duo|26.0|30.0|0/1158|0/1159|
|after-reverse / dense|30.5|34.5|0/991|0/992|
|after-reverse / duo|25.8|29.2|0/1174|0/1175|
|before-reverse / dense|30.5|33.7|0/996|0/997|
|before-reverse / duo|25.8|30.2|0/1165|0/1166|
|duo-low / duo|25.9|29.4|0/1164|0/1165|
|duo-reduced / duo|25.9|29.7|0/1163|0/1164|

## Chi phí CPU và object

| Cảnh sau / mode | Simulation p95 ms | Render prep p95 ms | DOM p95 ms | Telemetry p95 ms | Enemy / boss / projectile cuối | Sprite pool / textures |
|---|---:|---:|---:|---:|---|---|
|light / medium|0.2|0.2|0.2|0.0|8 / 0 / 12|29 / 41|
|dense / medium|0.8|0.4|0.3|0.0|110 / 0 / 121|256 / 41|
|endgame / medium|0.8|0.4|0.3|0.1|110 / 1 / 135|260 / 41|
|duo / medium|0.8|0.4|0.3|0.1|112 / 2 / 134|262 / 41|
|duo / low|0.8|0.4|0.3|0.1|112 / 2 / 135|262 / 41|
|duo / medium reduced|0.8|0.4|0.3|0.1|112 / 2 / 141|262 / 41|

Giữ pool/culling/cache/ledger/polyline/adaptive decoration. Baseline chưa chứng minh collision/lookup là bottleneck, nên không thêm spatial index hoặc sửa dt/wave/damage. Simulation/render preparation/DOM được đo riêng; phần còn lại của interval còn có GPU/driver/raster/scheduling, không tự coi hiệu số là GPU time chính xác. SwiftShader và độ phân giải làm giới hạn phép đo này. Không cam kết60FPS/input latency/GPU thật từ số headless.

**Chưa đạt mục tiêu p95≤20ms ở tất cả cảnh Vừa.** Dense p95 tăng1,6ms ở AB và0,8ms ở BA; giữ số thật, không gọi nâng cấp UX là tăng FPS đã chứng minh. Chưa cô lập nguyên nhân riêng phần tăng tail; CPU nhỏ không cho phép tự quy toàn bộ phần còn lại cho GPU. AB/BA cho thấy độ biến thiên giữa lượt, không suy quan hệ nhân quả từ một mẫu đẹp.

QA app 142.49→158.73kB minified; production 146.33kB. Phaser chunk1208,06kB vẫn cảnh báo>500kB; dependency/lockfile giữ nguyên. Không dùng bundle QA để phát hành.

## Chạy dài, lifecycle và gameplay

Bot42/defense/fusion chạy **720s render thật** bằng clock thường: victory, wall725.1s, HP72.6, Beacon289.8, level31, kills1001, pageerror0. Có chạy song song hồi quy UI nên **không dùng lượt này đo FPS**. Không patch HP/XP/time trong natural run. Source/bundle và mẫu xấp xỉ1s ở rendered-run/result.json. Đây không phải chơi tay.

Audit: 31file luật/render/lockfile,42file public,249fixture lịch sử giữ hash. Lifecycle mở/đóng28panel và7vòng lượt/menu có GC/CDP được E2E xác minh; raw tại regression/lifecycle.json, không suy từ một snapshot rằng mọi leak đã hết. E2E lượt đầy đủ63/66pass;3case chờ chuỗi layout Quasar cũ, sau cập nhật assertion chạy lại3/3pass trên cùng app bundle. Tổng66case được xác minh, không gọi lần đầu là66pass. Unit153 gồm4opt-in, production2smoke (kiểm tra API audio, chưa nghe).

Same-seed UX baseline/sau:12cặp (seed7/42 ×3build ±fusion) bằng nhau, mỗi phía7thắng/5thua; bot tăng tốc, không đo FPS. TTK/force/radiation/pairs hiện hành chạy lại trong unit opt-in, raw balance-regression; nguồn before của các bài lịch sử là baseline multi-boss cũ, không phải baseline UX. Không retune luật để ép thắng.

Raw frame: artifacts/next-beta/{before-final,after-final,after-reverse,before-reverse,duo-low,duo-reduced}/results.json. Script: scripts/qa/next-beta/performance.mjs; cần preview4300 baseline/4301 current. Ảnh cuối mỗi workload đi kèm raw; UI trước/sau và WebM riêng. Chưa kiểm chứng GPU vật lý, native zoom/input-to-photon, Firefox/Safari, soak20–30phút hoặc người chơi/nghe âm thanh thực tế.
