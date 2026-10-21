# Visual identity · hồ sơ local 2026-10-18

Nâng cấp trực tiếp beta1.0.0 theo prompt visual identity. Không commit/push/deploy. Main/remote/public vẫn là bản phát hành trước, hồ sơ ở [status-deployment](history/status/status-deployment.md). Màu, typography, trạng thái, layer, timing và budget thực thi xem [design system](design-system.md).

## Khảo sát và thay đổi

Baseline: Phaser3.90/WebGL, DOM HUD/menu/dialog, atlas/pool, một tile opaque, fixed simulation clock và profile schema3. Giữ font Việt local/OFL, safe draft/fusion, ledger XP, culling/cap, lifecycle audio, input và pause đã tốt. Các vấn đề quan sát được: Beacon/menu thiếu tiêu điểm, số HP fixture dài wrap, event/notice/toast tranh nhau gần tâm, UI thiếu phân cấp giữa max/empty/recipe; màn hẹp bị overlay cảnh báo toàn màn che menu.

- Nền có tinh vân thủy triều mờ, galaxy lệch tâm, parallax chậm và accent hữu hạn. Lát cắt đầu có seam gradient và ribbon cạnh cứng; sửa base đều + ellipse/cloud wrap lúc bake, giữ một lớp opaque vì bằng chứng overdraw trước. Không tạo gradient/canvas mỗi frame.
- Beacon lõi vàng, vòng đứt đoạn, flow vào tâm và charge thật, hit120ms/critical tam giác+chữ; menu/Core dùng cùng model. Nova có silhouette/engine mới, bank/rotation cung ngắn/trail bounded, không offset vị trí. Thay5SVG,32hash metadata được xác minh; font và27SVG khác giữ nguyên.
- HUD phân cấp quanh Beacon, rail thông báo bên trái; panel/menu toast ở flow. Menu/Build/draft/Core/catalog/achievement/settings/results dùng cùng token. Max/empty/recipe rõ, confirmation vẫn ở đầu vùng cuộn và focus nút. Màn390 có menu cuộn/panel một cột/footer dễ tìm; không tạo touch controls.
- Pulsar đúng halfWidth collider, Ion theo points thật, các evolved form theo state; boss hazard layer riêng với aim/lock/fire/hai biên chính xác và dư ảnh mảnh hữu hạn. Low giữ hazard, Well giữ viền radius/hướng hút.
- Thêm Vừa và reduced motion/OS default; giữ Low/High/audio/meta người cũ, schema3/key không đổi. Clock menu riêng không tick gameplay; Balo/draft/pause đóng băng thế giới. Adaptive chỉ decoration/hysteresis, reset/dispose có owner.

Đối chiếu SHA256 **26 file** GameClock/GameSession/buildProgress/stats/math, toàn bộ systems và config gameplay với baseline: byte-identical (`artifacts/visual-identity/gameplay-parity.json`). Settings thêm field trình bày; không đổi các số cân bằng, drop, slot, XP, RNG draft, mastery5ô, reroll, fusion, bonus hay boss. Không cần retune gameplay cho đợt visual.

## Điều kiện đo và baseline

Windows10.0.26200, Intel i5-12450HX/12 logical CPU, RAM21.17GB, Node24.21/npm11.19, Chromium156.0.8078.4 headless, WebGL ANGLE Vulkan SwiftShader. Viewport1280×720, DPR1, seeded fixture20261016, pinned-local-loot-v2, warmup5s/sample30s,2lặp mỗi dense/endgame. Không chạy test/browser khác trong khi benchmark. Đây là software renderer/rAF headless, không phải GPU hay tần số màn hình thật.

Baseline entry `index-xfzGVR78.js` (benchmark), quality **Cao** cũ; bản mới đo **Vừa** để đánh giá art direction mặc định mới. Hai tier khác nhau được ghi rõ; không suy chênh lệch hoàn toàn do một tối ưu. Cùng logic/seed/viewport/110quái, refill tối thiểu120đạn và protocol loot; vũ khí vẫn chạy nên số đạn không cố định từng tick (trung bìnhdense120.15–120.17, endgame124.55–124.82). Scene có refill fixture, HP lớn và không phải trải nghiệm cân bằng người chơi.

Baseline dense: p50 34.9/35.0ms, p95 43.1/43.1ms, >50ms 7/853 và5/842frame. Endgame: p50 30.5/30.1ms, p95 38.0/35.2ms, >50ms 0/972 và4/994frame. Baseline đã không đạt mục tiêu60FPS; không lấy SceneCPU thấp để khẳng định frame pacing tốt. Raw/counters/heap/environment trong `artifacts/visual-identity/before/results.json`.

## Điều tra chi phí hình học

Bản visual đầu `index-BdNviQOb.js` có p95dense43.2/48.2ms, endgame40.2/39.7ms, giữ nguyên raw/build/source/ảnh trong `pre-render-batching`. Control baseline sau đó cho dense p50/p9534.5/38.4 vàendgame29.3/32.9ms; môi trường máy có biến động, không bỏ dữ liệu bất lợi hoặc quy mọi chênh lệch vào một layer.

Giả thuyết đổi pipeline từ lớp accent đã bị probe bác bỏ: fixture pause có draw1/program switch0 ở cả ba bundle. Đọc GraphicsWebGLRenderer Phaser3.90 cài local cho thấy ARC dùng iterStep0.01 kể cả cung ngắn, làm vòng đứt đoạn tạo nhiều point/vertex. Thay bằng `presentation/geometry.ts`: số đoạn theo sai số dây cung0.35u, cap128, endpoint/radius thật. Áp cho Beacon/Gravity/vệt Pulsar; không đổi collision. Đồng thời giảm ruins khi dense, bỏ shadow HUD và tránh set tilePosition trùng giá trị lúc pause.

| Fixture pause | Baseline Cao | Visual trước tối ưu | Final Vừa |
|---|---:|---:|---:|
| Dense vertex/frame |4914|14355|4107|
| Endgame vertex/frame |13326|13176|3780|

Raw `batches.json` ghi đúng entry/tier/count; fixture đứng yên không có toàn bộ FX của cảnh động, không dùng vertex count thay FPS. Tăng kiểu hình học là chi phí đã xác nhận; chưa tách riêng đóng góp FPS của mọi thay đổi. Polyline được unit test sai số trong radius10–510 và cap đầu vào lớn. Đợt đo sau geometry trước guard owner dừng sau3case để sửa dư ảnh beam bị hủy sớm; raw giữ `post-geometry-before-owner-cleanup`, không dùng bản thiếu4case làm kết quả cuối.

Guard cuối dọn dư ảnh nếu beam bị boss chết/chuyển phase xóa trước end; chỉ fade120ms sau kết thúc hợp lệ. Regression kích hoạt transition thật, kiểm tra không xuất hiện lại tại end cũ và positive fade đúng hạn. Không đổi logic boss. Build benchmark cuối `index-DN3l1Vfu.js`, production `index-CwGwYTTD.js`, CSS `index-DB5g2rUh.css`; capture/motion/benchmark JSON ghi entry thật. QA viewport có provenance kiểm thử riêng ở status.

## Kết quả cuối trước/sau

Mỗi hàng là một lượt30s sau warmup5s; đơn vị ms. Raw `before/results.json`, `after/results.json`, bảng JSON và ảnh đối chiếu tại `artifacts/visual-identity/comparison.json` / `comparison.html`.

| Cảnh / lượt | Bản / quality | p50 | p95 | p99 | Max | >50ms / frame |
|---|---|---:|---:|---:|---:|---:|
| Dense1 | Trước / Cao |34.9|43.1|48.6|96.6|7 / 853|
| Dense2 | Trước / Cao |35.0|43.1|46.8|100.1|5 / 842|
| Dense1 | Sau / Vừa |32.9|36.6|45.4|94.1|4 / 915|
| Dense2 | Sau / Vừa |32.8|36.5|38.3|77.1|3 / 921|
| Endgame1 | Trước / Cao |30.5|38.0|42.3|46.4|0 / 972|
| Endgame2 | Trước / Cao |30.1|35.2|38.5|67.4|4 / 994|
| Endgame1 | Sau / Vừa |26.8|30.7|35.2|66.5|2 / 1123|
| Endgame2 | Sau / Vừa |26.7|30.3|32.3|55.3|1 / 1129|

Trung bình **p95 của hai lượt**, không phải percentile gộp: dense43.10→36.55ms (−15.2%), endgame36.60→30.50ms (−16.7%). Mốc tham chiếu không tăng p95 quá10% đạt ở cả hai lượt mỗi cảnh; **mục tiêu60FPS chưa đạt trên SwiftShader**. Still có spike>50ms, không gọi hoàn toàn hết khựng. Control baseline38.4/32.9ms thấp hơn baseline đầu, nên mức cải thiện không được diễn giải là tác động nhân quả15–17% của riêng geometry.

SceneCPU p95 trước1.0–1.3ms, sau1.0–1.2ms; renderPreparation trước0.3ms, sau0.3–0.4ms. Graphics triangulation/render xảy ra ngoài cửa sổ SceneCPU, vì vậy SceneCPU không đại diện toàn bộ chi phí frame. JS heap mẫu trước32.0–44.9MB, sau36.2–47.0MB; có GC sawtooth. Ba tile thay hai tile thêm4MiB RGBA thô; không suy heap tăng hoàn toàn do texture hoặc khẳng định không leak từ snapshot.

Pool capacity cuối dense256/endgame260 bằng baseline; children330/334→332/336 do hai Graphics mới, textures37→38 do tierVừa; timers/tweens0, scene listeners48. Background2object, backing1280×720, dense ruins28. GroundXP500/700 giữ đúng; logic pickup/localledger không bị chất lượng bỏ. Bảy lượt lifecycle sau warmup giữ textures38/DOMlistener167/nodes510 ổn định. Raw có counters đầu/cuối/trung bình, không biến giá trị cuối thành peak không đo.

Build/typecheck pass;117unit cũ+5mới, full50browser trước tối ưu geometry rồi7liênquan sau geometry và1regression owner trên bundle cuối đều pass; production cuối2/2,28.7s. Không ghi full51 đã chạy trên một bundle. Bảng lệnh/entry/môi trường và các lỗi test đã khắc phục ở [status](status.md). Không chạy lại render720s hoặc giả lập tăng tốc để kết luận FPS.

## Bằng chứng runtime và cách tái hiện

Tất cả output nằm local, được gitignore:

- `artifacts/visual-identity/baseline-source`, `before-build`, `before/visual`: source/build/ảnh trước sửa.
- `after-build`, `after/visual`: bundle/ảnh menu, early, dense, Balo, draft, Core1280×720 và menu390×844. Ảnh runtime, không mockup. `after/qa`: bốn viewport mục tiêu, critical/Low và beam. Fixture HP100triệu để chịu tải, không phải thông số gameplay mới.
- `after/motion/*.webm`: clip phím/click thật, đảo hướng/đi chéo/dừng, endgame, Balo và xác nhận fusion rồi resume. Có dùng perf fixture và patch max source test-only, không phải lượt chơi tự nhiên.
- `after/production`: network/nohooks/offline và thao tác production. Regression cũ vẫn ghi thư mục artifact lịch sử theo script; bản chụp kết quả hiện tại được gom dưới `after/regression` khi bàn giao.
- `initial-ui-test-failure`: lưu lượt đầu có selector sai trong test mới (`back` thay vì `read-back`), không phải nút game mất. Sửa thêm URL gốc trong test VNext thành relative dưới base.

```powershell
npm run dev
# http://127.0.0.1:5173/EVENTIDE/
npm run build
npm run preview
# http://127.0.0.1:4173/EVENTIDE/

npm run typecheck
npm run test
npm run build:visual
$env:PLAYWRIGHT_BROWSERS_PATH="$PWD\.playwright"
npm run test:visual
npm run test:production
```

Benchmark cần preview4197 từ `after-build` (test:visual có thể khởi động khi chưa có server), rồi chạy độc lập:

```powershell
npx vite preview --outDir artifacts/visual-identity/after-build --host 127.0.0.1 --port 4197 --strictPort
# terminal khác, không chạy browser/test khác đồng thời
node scripts/performance/benchmark.mjs --root=artifacts/visual-identity --label=after --url=http://127.0.0.1:4197/EVENTIDE --scenarios=dense,endgame --repeats=2 --warmup=5 --seconds=30 --pinned=1 --quality=medium
node scripts/qa/visual-identity/visual-identity-report.mjs
```

Save người dùng `eventide.save.v1` giữ nguyên; browser test/perf dùng `eventide.e2e.v1`, context riêng. Dùng đúng origin/cổng từng chơi để thấy dữ liệu cũ; đổi5173→4173 là storage khác, không phải migration xóa profile. Reload vẫn trở về menu, chưa có resume-run.

## Giới hạn

Ảnh/automation/contrast token và clip không thay thế nghiệm thu thẩm mỹ, cảm giác điều khiển hoặc chơi tay12phút. Chưa đo GPU vật lý/60Hz/120Hz/native zoom, mobile device/touch-play hoặc nghe chất lượng audio bằng tai. WebAudio probe chỉ xác nhận context/shot đang chạy. Frame benchmark ngắn/2lặp, heap có GC sawtooth; không suy hết leak từ một snapshot hoặc cam kết60FPS mọi máy. Không thêm gameplay/feature tương lai để vượt danh sách visual QA.
