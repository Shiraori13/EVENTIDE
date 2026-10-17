# EVENTIDE VNext 1.1 — báo cáo hiệu năng

Ngày kiểm tra theo Việt Nam: 2026-10-16. Không coi cảm giác khựng hoặc XP tồn đọng là nguyên nhân đã biết trước khi đo. Raw JSON và ảnh được giữ tại `artifacts/vnext/`; nguồn/build cũ được giữ, không dựng lại MVP.

## Máy và phương pháp

Windows kernel10.0.26200, Intel Core i5-12450HX/12 logical CPU, RAM OS báo21,168,513,024 bytes; Node24.21.0/npm11.19.0, Phaser3.90.0, Vite7.3.7, Playwright1.64.1/Chromium156.0.8078.4. Browser headless, WebGL qua ANGLE Vulkan **SwiftShader (software renderer)**, không có số đo GPU vật lý/refresh rate màn hình. DPR1, CSS1280×720, backing1280×720; không đổi render scale giữa build. Đây không phải input-to-photon hoặc bằng chứng60FPS desktop.

Đối chứng là hai build tối ưu production qua Vite preview với probe **mode benchmark** rõ ràng; không HMR/dev bundle. Normal production không có probe. Entry JS hash nằm trong mỗi raw report. Instrumentation có buffer50,000 mẫu/series, không log/text mỗi frame; overlay tùy chọn cập nhật mỗi60 frame. CPU phase dùng performance.now (độ phân giải thực thấy nhiều giá trị0.1ms); số0 không có nghĩa không dùng CPU. Frame interval bao gồm thời gian ngoài Scene.update, không chỉ render preparation.

Scenario seed20261016, hàm input theo simulation time giống nhau. HP fixture lớn/max modules (trừ light chỉ Plasma1), giữ8/110/80/110 quái và tối thiểu12/120/80/160 đạn để ổn định workload; không dùng các fixture này đánh giá cân bằng. Pinned ground XP90/500/12000/700 được đặt cùng catalog địa phương xa đường tàu, không tự thu; mới có thể gộp số cluster nhưng tổng giá trị phải giữ đúng. Cả hai mute, shakeoff, reducedEffectsfalse, High (MVP là mặc định tương đương). Không giảm spawn/damage/AI/loot ở game thật.

Mỗi scenario warm10s/sample60s,3 lượt mỗi build, browser context mới, không hai browser benchmark cùng lúc. Ban đầu chạy AB tuần tự; sau sửa hồi quy footprint nền, giữ ba đối chứng BEFORE đã hoàn tất và đo lại toàn bộ AFTER trong điều kiện idle, không ngẫu nhiên hóa thứ tự. Bảng dùng median của các thống kê theo từng lượt, không giả là percentile gộp toàn bộ raw frame. Số >50ms là median count trên60s; raw có cả >33.3ms, max, số mẫu, CPU từng phase, counters đầu/cuối/trung bình, heap và CDP metrics. Clock clamp0.1s được giữ: build chậm có thể đi ít giây simulation hơn trong60s wall, nên cùng seed/path function/initial time chứ không phải replay từng frame giống bit. Thời gian simulation thực có trong JSON; không suy số CPU/frame thành tốc độ thuật toán nếu số step/frame khác.

Visual counter là số Image active tại lớp game, không đồng nghĩa mọi Image đó đã raster ra màn (baseline chưa cull ở lớp này). Các số body/tween/timer giữ đúng thực tế bằng0, không tuyên bố đã loại bỏ physics mà MVP chưa từng dùng.

## Audit và nguyên nhân

| Vấn đề | Bằng chứng | Kết luận/cách sửa |
|---|---|---|
| Chữ Việt | Source UTF-8/NFC/langvi đúng; ảnh pause build cũ tái hiện tách dấu; dùng Georgia/Segoe máy | Xác nhận lỗi render typography ở baseline, không phải mojibake source. Bundle Noto local đủ glyph/weight, bỏ tracking câu Việt, chừa dấu, load/fallback có timeout; xem ảnh thật. Không đoán font renderer từ ảnh đính kèm không truy cập được. |
| Work render | WorldRenderer cũ có1700 circle star commands, vẽ lại static light/orbits và setTexture mọi sprite/frame; GraphicsWebGLRenderer3.90 chạy commandBuffer mỗi render | Bake starfield/light/atlas, cull presentation, poolImage640 và freeze draw preparation khi time không đổi. Cùng density sao High gần baseline; art được nâng nên không tuyên bố pixel-identical. |
| Footprint nền ở bản thử | Heap tăng khoảng100MB; source TileSprite3.90 cấp backing canvas5200×5200 kể cả WebGL | Sửa TileSprite theo viewport/cuộn UV, chỉ resize khi viewport đổi. Mẫu trung gian giữ tại after-pre-viewport-fix-{1,2,3}; bảng cuối chỉ dùng build đã sửa. E2E kiểm tra backing dimensions và resize. |
| Tàu khựng | Frame interval lớn, fixed-step positions/camera chưa nội suy; clock không bị nhân delta hai lần, input không throttle | Previous/current/alpha đồng nhất tàu và camera, không smoothing mạnh, giữ authoritative float. Reset khi pause/resume/chọn upgrade. Không đo input-to-photon hoặc khẳng định hết jitter trên mọi máy. |
| XP tồn đọng | Trước đã cap220,0 body/0 tween/0 emitter mỗi pickup; không có chứng cứ số orb tăng vô hạn | Không gọi XP là nguyên nhân chính FPS. Sửa locality khi cap, merge hash theo age và ledger3249 cell hữu hạn, visuals220, bảo toàn giá trị/biên/homing. CPU pickup đo riêng. |
| CPU/GC | Projectile×enemy tạo vector đoạn tạm, array filter và copy metadata dư; HUD query/serialize loadout nhiều | Giảm allocation/compact tại chỗ, squared query, cache HUD/fingerprint. Không thêm grid combat khi CPU đã thấp. Heap dao động/GC không chứng minh leak; dùng thêm lifecycle dài/counter. |
| Audio lifecycle | DOM event counter tăng khi SFX dừng ở context suspended, voice/onended còn đợi | Stop/disconnect voice/bỏ callback khi pause/menu và khi kết thúc; giữ context/ambient hữu hạn. Năm vòng tương đương sau warm-up giữ117 DOM listeners,48 scene listeners,24 textures,pool300,0 timer/tween, voice0 ở menu. |

Exploratory v1 (3×60s/scenario) được giữ tại `before/results.json`, p95 theo cảnh khoảng107–131ms, Scene CPU p95 khoảng0.6–4.8ms. Không dùng nó làm so sánh XP cố định vì auto-pickup/locality khác. Controlled v2 bên dưới giữ ground XP bằng nhau. Các lượt nhiễu bởi build được lưu riêng rồi lấy lại trong điều kiện idle; không âm thầm dùng build khác trong một nhóm sau.

## Kết quả controlled trước/sau

<!-- CONTROLLED_RESULTS_START -->
| Scenario | Build/seed | Quality/DPR/viewport | Quái/đạn/pickup logic/visual (mean mỗi lượt, median3) | p50/p95/p99 frame ms | Frames >50ms/60s | Heap đầu→cuối (bao gồm probe) | Ghi chú |
|---|---|---|---|---|---|---|---|
| light | MVP →1.1 /20261016 | High/DPR1/1280×720/WebGL SwiftShader | 8/12.3/18.0/18.0 → 8/12.3/18.0/0.0 | 99.4 / 105.8 / 109.9 → 29.5 / 34.2 / 36.4 | 603 → 3 | 20.9→29.7MiB → 23.7→25.9MiB | XP map=90 cả hai |
| dense | MVP →1.1 /20261016 | High/DPR1/1280×720/WebGL SwiftShader | 110/120.2/100.0/100.0 → 110/120.2/62.0/0.0 | 113.6 / 123.6 / 129.1 → 38.5 / 45.5 / 49.3 | 528 → 13 | 25.4→37.4MiB → 25.2→39.1MiB | XP map=500 cả hai |
| xp | MVP →1.1 /20261016 | High/DPR1/1280×720/WebGL SwiftShader | 80/80.2/220.0/220.0 → 80/80.3/65.0/0.0 | 112.3 / 127.1 / 132.6 → 34.8 / 40.9 / 43.1 | 527 → 2 | 31.4→39.9MiB → 27.7→28.2MiB | XP map=12000 cả hai |
| endgame | MVP →1.1 /20261016 | High/DPR1/1280×720/WebGL SwiftShader | 110/160.0/140.0/140.0 → 110/160.0/65.0/0.0 | 107.9 / 116.5 / 127.4 → 28.6 / 35.0 / 38.1 | 555 → 1 | 29.4→22.0MiB → 27.3→39.3MiB | XP map=700 cả hai |

| CPU p95 (ms) | Scene/frame | Pickup/step | Combat/step |
|---|---|---|---|
| light | 0.5 → 0.3 | 0.0 → 0.1 | 0.1 → 0.1 |
| dense | 4.2 → 1.2 | 0.1 → 0.1 | 0.6 → 0.3 |
| xp | 2.9 → 0.9 | 0.1 → 0.1 | 0.4 → 0.2 |
| endgame | 5.7 → 1.4 | 0.1 → 0.1 | 0.8 → 0.5 |

Scene/frame có số fixed step khác nhau giữa build chậm/nhanh; không gọi tỷ lệ đó là speedup thuật toán độc lập. Heap bao gồm buffers/cache/GC, không dùng riêng bảng này kết luận hết leak.

Low riêng (1×60s, khác budget presentation):

| Scenario | p50/p95/p99 ms | >50ms | Quái/đạn |
|---|---|---|---|
| dense | 32.3/36.7/38.3 | 0 | 110/120.2 |
| endgame | 26.2/30.6/33.6 | 0 | 110/160 |

CDP duration delta trong cửa sổ60s (giây, median3), bao gồm đường script của Phaser sau Scene.update:

| Scenario | ScriptDuration trước→sau | LayoutDuration trước→sau | TaskDuration trước→sau |
|---|---|---|---|
| light | 28.3 → 1.3 | 0.1 → 0.1 | 60.0 → 59.9 |
| dense | 28.0 → 4.4 | 0.1 → 0.1 | 60.0 → 60.0 |
| xp | 27.6 → 4.1 | 0.1 → 0.1 | 60.0 → 60.0 |
| endgame | 30.3 → 5.9 | 0.1 → 0.2 | 60.0 → 59.9 |

TaskDuration không phải GPU time; phần ngoài Script/Layout còn engine native, render/driver và công việc khác. Độ chính xác hiển thị0.1s, không coi0.0 là không có layout.

<!-- CONTROLLED_RESULTS_END -->

Low được đo riêng, không trộn vào lợi ích thuật toán High. Low đổi star/debris/FX/healthbar/trail budget, không đổi NPC/đạn/logic XP. High là art mới so với MVP; so tổng frame là kết quả của cả tổ chức render và thay presentation, không phải chỉ một tối ưu thuật toán được cô lập.

## XP nằm trong camera — chẩn đoán bổ sung

Bộ chính v2 đặt XP ngoài camera để giữ total cố định và tránh nhặt. Counter visual cũ là Image active trước culling của Phaser, không phải số đã raster; VNext cull ở lớp presentation nên counter bằng0 ở các catalog xa này. Vì vậy đo thêm protocol v3: 220 orb/12.000 XP trong vùng x=−360..−439,y=60..159, nhìn thấy trong một phần đường camera, ngoài tầm nhặt. Cùng seed/input,80 quái, khoảng80 đạn, High/DPR1/WebGL; mỗi build warm10s/sample30s, chỉ1 lượt, không trộn vào median3 ở bảng chính.

| Build | p50/p95/p99 ms | Frames>50ms | Pickup logic | Visual counter mean | Ground XP đầu/cuối |
|---|---|---|---|---|---|
| MVP DxU0u7fM |77.3/82.5/86.9|388|220|220 trước engine cull|12000/12000|
| VNext DMkLancT |28.3/32.5/35.1|0|3 cluster|2.41 sau presentation cull|12000/12000|

Raw/ảnh tại before-visible-xp/after-visible-xp,0 pageerror ở cả hai. Đây là kết quả của cả bản nâng cấp, không phải phép cô lập riêng tốc độ merge XP; pickup CPU ở bộ chính vẫn rất nhỏ trước/sau. Không gọi XP là nguyên nhân chính lag của MVP. Cluster giữ địa phương/giá trị, không xóa XP để có số đẹp.

## Đối chứng backend và mục tiêu

Để phân biệt Scene CPU với backend, chạy chẩn đoán ngắn10s sau warm3s bằng cờ Chromium `--disable-webgl` ở cả build, Phaser AUTO chọn Canvas. Trước: light p95=18.1ms/p99=18.7ms, dense30.7/33.3ms. Sau (build cuối DMkLancT): light19/21.7ms, dense27.6/30.3ms. Renderer ghi thật là Canvas; đây là diagnostic ngắn, không thay thế các lượt WebGL60s và không đổi renderer mặc định của game. Raw ở before-canvas-diagnostic/after-canvas-diagnostic.

Đối chứng này cùng scene CPU thấp và frame WebGL SwiftShader cao cho thấy backend phần mềm là bottleneck lớn trong môi trường kiểm thử, không thể quy toàn bộ vào pickup/JS update. Chưa có GPU hardware trace để kết luận hiệu năng GPU desktop. Mục tiêu tham chiếu vẫn p95≈20ms/p99≈33.3ms trên màn60Hz, không hạ ngưỡng sau đo. **High controlled cuối chưa đạt mục tiêu**: p95 median3 ở bốn cảnh34.2–45.5ms, giảm63.2–70.0% so với MVP nhưng vẫn có spike>50ms. Không tuyên bố hết giật hoặc60FPS mọi máy.

Scene CPU không bao gồm toàn bộ Phaser renderer sau update. Đối chứng backend chỉ cô lập đường render/WebGL software; chưa tách được riêng thời gian engine render, driver và raster/GPU, nên không gọi toàn bộ phần còn lại là GPU time.

## Luật, vòng đời và lượt dài

SHA256 balance.ts/content.ts không đổi (`gameplay-config-parity.json`). Test paired simulation720s cùng seed/input và XP inputs cho combat/kết quả giống baseline (`combat-parity.json`). Bot stats chuẩn thắng720s, level34,1000kills, reward17; đây là fast-forward unit test, không phải bằng chứng frame pacing12 phút.

`lifecycle.json`: hai vòng warm-up audio/quality rồi năm vòng tương đương; counters và DOM CDP sau GC có cap/plateau. Không có physics/tween/timer per pickup trước hoặc sau. Pool giữ capacity hữu hạn là có chủ đích, không yêu cầu heap về đúng byte ban đầu. `visual-qa.md` ghi các hình đã xem và loại zoom.

<!-- LONG_RUN_START -->
Đã render đủ **720s simulation**, 722.6s wall (gồm boot/checkpoint), bot seed42/stats chuẩn, phase=victory, reward=17, level34, kills1000. Không fast-forward, không tăng HP/XP; input đi qua GameClock bình thường. Boss/final gravity flags=true/true.

Frame toàn lượt: p50=24.6ms/p95=28.2ms/p99=30ms, >50ms=14/29339 mẫu. Errors=0. XP created=3767, collected=3556, ground=211; invariant đúng tại mọi checkpoint10s. Dữ liệu/ảnh kết quả ở artifacts/vnext/long-run. Đây là autoplay headless có render/audio, không phải người chơi tay hoặc input-to-photon. Không có soak20–30 phút liên tục trong cùng run.

<!-- LONG_RUN_END -->

## Tái hiện và giới hạn

Lệnh preview/perf đầy đủ ở README. `npm run perf:compare` tạo `before-controlled-{1,2,3}`/`after-controlled-{1,2,3}`; script kiểm tra ground XP cố định, lưu quality/DPR/renderer/build entry. `perf:long-run` dùng bot seed42 đi qua clock thật, không tăng HP/XP hoặc nhảy time; có checkpoint10s và invariant XP. Probe/fixture dùng save test riêng. Mở dev với `?perf=1&overlay=1` để xem counter, không có cheat UI production.

Chưa chơi tay đủ12 phút/nghe audio/đo input-to-photon, chưa benchmark GPU desktop headed hoặc Firefox/Safari, chưa soak20–30 phút nếu không có report riêng. Zoom125% là emulation viewport/DPR, không phải thao tác zoom native. Source/build/JSON/ảnh cho phép đo lại trên máy người dùng; không có telemetry online hoặc hosting.

Tài liệu API đã đối chiếu: [Phaser3.90 Text](https://docs.phaser.io/api-documentation/3.90.0/class/gameobjects-text), [Phaser Groups](https://docs.phaser.io/phaser/concepts/gameobjects/group), [Font Loading API](https://developer.mozilla.org/en-US/docs/Web/API/FontFaceSet/load), [Chrome memory](https://developer.chrome.com/docs/devtools/memory-problems). Có đọc source GraphicsWebGLRenderer của dependency3.90 trong workspace; không áp API major mới.
