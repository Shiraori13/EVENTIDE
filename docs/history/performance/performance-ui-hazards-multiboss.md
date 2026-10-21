# Hiệu năng bản local UI / hazards / multi-boss

Nguồn đo cuối: [báo cáo tổng hợp](../../ui-hazards-multiboss-report.md). Trước là /EVENTIDE/assets/index-DN3l1Vfu.js; sau là /EVENTIDE/assets/index-CtKeK4qU.js; production riêng index-BYdXBxam.js đã smoke2/2, không hooks. Không dùng benchmark build để phát hành.

## Protocol và provenance

Windows 10.0.26200, 12th Gen Intel(R) Core(TM) i5-12450HX, Chromium 156.0.8078.4,1280×720/DPR1,WebGL SwiftShader (software), quality **Medium cả hai**, shake=false,seed20261016,pinned-local-loot-v2. Mỗi case warm5s/sample30s, browser context mới, không unit/build/browser khác cùng chạy. Lượt đầu before→after; đối chứng đảo after→before; mỗi cột hai số theo lượt đầu/đảo thứ tự. Không bỏ mẫu xấu hoặc suy FPS từ SceneCPU/bot. Refresh headless rAF không phải màn hình vật lý.

| Cảnh | Bản | p50 ms | p95 ms | p99 ms | >50ms / số frame |
|---|---|---|---|---|---|
|dense|before|34.4 / 36.8|43.6 / 54.8|50 / 70.5|8/856 / 66/774|
|dense|after|37.6 / 33.1|48.1 / 40.3|55.3 / 45.9|20/786 / 6/898|
|endgame|before|28.1 / 31.9|36.7 / 42.7|41.6 / 50.9|1/1041 / 11/910|
|endgame|after|31.3 / 26.5|44 / 32.8|50.2 / 39.1|10/926 / 5/1113|

Lượt đầu cho p95 sau cao hơn; lượt đối chứng đổi chiều. Dense trước43,6–54,8ms, sau40,3–48,1ms; dao động giữa lượt lớn, **chưa đủ chứng minh tăng hoặc giảm FPS ổn định**. Giữ tất cả raw, không lấy riêng lượt đẹp. Endgame còn thay nhịp/AI/beam theo yêu cầu gameplay nên không là workload hoàn toàn đồng nhất. Code giữ các tối ưu nền opaque/tile viewport/polyline/pool/culling/ledger/adaptive decoration, audit hash riêng; đó không phải bằng chứng60FPS.

## Đông quái + hai boss + hazard

Duo mới112enemy (110thường+Elder+Helion phase2),120projectile fixture refill có tôn trọng reservation, final gravity và Solar Scar, cùng Medium/seed/viewport. HP1e8 và build max để giữ workload, **không phải playtest cân bằng**. p50/p95/p99=31.1/37.7/45.8ms, >50ms=6/960, max=76.1ms, pageerror0. Không có baseline hai boss AI tương đương vì code trước chỉ update boss đầu.

Counter trung bình duo: enemy112, projectile127.19, zone1.12, reservation7.52, boss beam0.25. Đây là trung bình, không giả là peak; cap160projectile/6zone và cleanup được kiểm tra riêng bằng unit/E2E. SceneCPU p95=1.6ms, renderPreparationCPU p95=0.5ms; không dùng hai số đó thay GPU/frame time.

## Probe, tài nguyên và giới hạn

Probe GL test-only trên dense paused snapshot, cùng seed/Medium: before: draw1/program0/vertex4107; after: draw1/program0/vertex4107. Probe này chỉ so commands/vertex, không chứng minh bottleneck GPU hoặc nguyên nhân dao động. SceneCPU giữa các case khoảng1–2ms p95; khoảng cách lớn với frame cho thấy phải đo đường render/host tiếp, không có bằng chứng đủ để quy riêng atlas hoặc GPU vật lý.

Textures38→41 do3asset boss; atlas32frame1024×512→35frame1024×640 (+0,5MiB RGBA thô cho atlas, không tính texture SVG nguồn). Ba tile background1024² giữ nguyên. JS heap sampled: before dense35.6–43.3 / 35.6–42.1MiB; after dense35.4–43.4 / 36.9–43.4MiB; duo37.7–45.1MiB. Không gọi heap sample là retained memory hoặc GPU memory.

Lifecycle duo7lượt,2warmup+5mẫu sauGC: texture41/scene listener48/DOM listener176/nodes543/pool254 giữ plateau; timer/tween và boss/beam/zone/reservation về0 ởmenu. Không chứng minh mọi leak đều hết. Root raw [duo lifecycle](../../../artifacts/multiboss/duo-lifecycle.json).

Benchmark app trước130.12KB→sau142.49KB minified; production130,12KB/gzip45,96KB, CSS29,46KB và Phaser1208,06KB/gzip332,17KB. Cảnh báo chunk Phaser>500KB còn, không đổi dependency. Production smoke xác nhận base/asset/font/offline sau load và không hooks.

Raw: artifacts/multiboss/{before-final,after-final,before-control,after-control,duo-final}/results.json, render-probe.json; ảnh cuối mỗi scenario cùng thư mục. Script tái hiện: scripts/qa/multiboss/{performance,control,render-probe}.mjs, xem [scripts](../../../scripts/README.md). Baseline build frozen4200/current4201, chạy tuần tự. Nguồn, script và hash nhận diện bundle được giữ; không xóa lượt đầu.

Chưa đo GPU vật lý/native input latency/native zoom/Firefox/Safari/soak20–30phút hoặc lượt render đủ720s của bản này; đã có nhiều lượt **mô phỏng tăng tốc720s** và clip keyboard clock thường riêng. Không đạt/chưa chứng nhận60FPS trên SwiftShader. Đánh giá người thật/audio còn mở, không giấu như tính năng backlog.

Hồ sơ cũ: [visual identity](../../visual-identity-report.md), [hotfix1.4.1](performance-v1.4.1.md), [beta1.4](performance-v1.4.md).
