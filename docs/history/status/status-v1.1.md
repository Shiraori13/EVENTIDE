# Trạng thái EVENTIDE · VNext 1.1.0 · 2026-10-16 (Việt Nam)

Đã sửa trực tiếp MVP hiện có theo prompts/EVENTIDE_VNext_UI_UX_Performance_Prompt.md. Giữ key eventide.save.v1/saveVersion1, tiến triển tiền/Core/Echo và các luật gameplay. Không hosting. Nguồn/build/báo cáo MVP cũ còn tại artifacts/vnext/baseline-source, baseline-dist và baseline-benchmark; BUILD_MVP gốc và snapshot không sửa, SHA256 vẫn trùng nhau.

## Thay đổi đã có mã thực

- Font Noto Sans/Serif local đầy đủ glyph/weight, giấy phép OFL/nguồn/hash; NFC tại ranh giới trình bày, factory Canvas Text, load/timeout/fallback/late swap. Không đổi stable ID.
- Tokens/layout/focus/button/modal/HUD thống nhất, body14px, dialog cuộn được ở viewport thấp; menu/help/Core/Echo/settings/pause/upgrade/result có ảnh matrix.
- 19 SVG nguyên bản CC0, source hình học riêng, atlas1024×384; Nova/ba quái/Elder và các đạn có silhouette riêng. Giữ hitbox.
- Well cyan và vùng môi trường amber/magenta có radius thật, warning/active/end và streak xoắn vào tâm; High/Low chỉ đổi budget hình ảnh, settings mới tương thích save cũ.
- Baked nền/light, Image pool640/culling presentation, HUD cache/fingerprint, nội suy previous/current/alpha tàu/camera/quái/đạn; pause/resume/chọn upgrade reset previous. Không giảm spawn hoặc dừng quái ngoài camera.
- TileSprite nền theo viewport/cuộn UV; sửa hồi quy backing canvas5200×5200 ở bản thử, e2e chặn tái diễn khi resize.
- PickupSystem có merge cục bộ theo simulation age, active220/visual220, ledger3249 cell hữu hạn, sổ created/collected độc lập XP tiến độ. Không expiry/tự thưởng từ xa. Sửa locality của cap cũ và hai ca nhường slot cùng cell/ngoài tầm nhặt.
- Combat giảm allocation, giữ thứ tự/công thức/cooldown; không thêm broad phase framework khi chưa cần. Audio hủy/disconnect voice và callback còn chờ ở pause/menu.
- Probe/scenario/overlay có buffer hữu hạn chỉ DEV hoặc mode benchmark; production thường loại hook, mọi QA dùng save test riêng.

## Kiểm tra thực tế

Windows/PowerShell, Node24.21.0/npm11.19.0, Phaser3.90.0, Vite7.3.7, TypeScript5.9.3, Vitest4.1.12, Playwright1.64.1/Chromium156.0.8078.4. Browser tại .playwright trong workspace; lệnh browser đặt PLAYWRIGHT_BROWSERS_PATH tương ứng. Kiểm tra chạy tuần tự, không chạy build/e2e đồng thời với benchmark.

| Lệnh/kiểm tra | Kết quả thực tế |
|---|---|
| Baseline trước sửa: typecheck/test/build | Pass, 24 test MVP; build gốc được lưu. |
| npx playwright test --config config/playwright/playwright.baseline.config.ts | Pass7/7 trên build MVP đã đóng băng, giữ các test gốc. |
| npm run typecheck | Pass strict TypeScript với mã cuối. |
| npm run test | Pass40/40 test,4 file; gồm fixed30/60/144FPS, combat paired720s, conservation/cap/homing/biên/cell/20,000drop/return/restart, save migration và nội suy. |
| npm run build | Pass; app54.12KB, Phaser1.208MB (~332KB gzip), cảnh báo chunk>500KB còn do Phaser. Hai font tổng3.94MB chưa nén/subset, tradeoff cold load được ghi rõ. |
| npm run build:benchmark | Pass, tối ưu Vite qua preview, có probe test-only. |
| npm run test:e2e | Pass17/17,2.8phút trên mã cuối; gồm font failure/late/Canvas glyph, sáu tổ hợp viewport/zoom/DPR, save cũ, ledger atomic, FX/cap/restart và backing canvas resize. |
| npm run test:production | Pass1/1,3.4s; không hook kể cả query e2e/perf, chỉ request origin local và tiếp tục chơi khi offline sau tải. |
| node scripts/performance/record-config-parity.mjs | Pass, SHA256 balance.ts/content.ts giống baseline, không đổi số gameplay. |
| node --check scripts/performance/long-run.mjs / scripts/performance/summarize-performance.mjs | Pass syntax sau bổ sung metadata lượt autoplay và validation report. |
| node --check scripts/performance/benchmark.mjs | Pass syntax của catalog XP nhìn thấy trong chẩn đoán bổ sung; bộ controlled chính giữ protocol v2. |
| Lifecycle browser | Hai vòng warm-up rồi năm vòng tương đương; DOM listeners117/scene listeners48/textures24/pool300 có plateau, timer/tween/body0, AudioContext1/ambient3/voice0 khi menu. Raw lifecycle.json. |
| node scripts/performance/benchmark-pair.mjs --resume=1 --repeats=3 (phần còn lại chạy trực tiếp benchmark.mjs sau phiên công cụ dừng) | Đủ24 mẫu controlled: mỗi build4 cảnh ×3 lượt, warm10s/sample60s, High/DPR1/1280×720/WebGL SwiftShader; cùng ground XP. Sau dùng duy nhất entry index-DMkLancT.js. p95 giảm63.2–70.0%, còn34.2–45.5ms, chưa đạt mục tiêu20ms. |
| benchmark.mjs --quality=low --scenarios=dense,endgame --repeats=1 --warmup=10 --seconds=60 --pinned=1 | Hai mẫu Low riêng: p95 dense36.7ms/endgame30.6ms, không frame>50ms trong từng mẫu60s; không gọi đây là lợi ích thuật toán High. |
| node scripts/performance/long-run.mjs | Pass: render720s simulation/722.6s wall, seed42/stats chuẩn, victory/cấp34/kills1000/reward17. Beacon300HP/tàu106.62HP, boss/final flags đúng;0 lỗi, XP3767=3556+211 tại cuối và invariant đúng mọi checkpoint10s. Frame toàn lượt p50/p95/p99=24.6/28.2/30ms,14 mẫu>50ms/29339. |
| benchmark.mjs --renderer=canvas --scenarios=light,dense --warmup=3 --seconds=10 --repeats=1 --pinned=1 | Diagnostic ngắn riêng cả hai build, không đổi renderer mặc định. Số liệu thật trong performance-report, không thay các mẫu WebGL60s. |
| node scripts/performance/summarize-performance.mjs | Pass validation24 mẫu, cùng seed/quality/DPR/backing/groundXP/build entry,0 pageerror; sinh summary.json và bảng báo cáo. Lượt720s cũng được kiểm tra victory/time/errors. |
| benchmark.mjs --scenarios=xp --visible=1 --pinned=1 --repeats=1 --warmup=10 --seconds=30 (cả hai URL preview) | Bổ sung XP nhìn thấy trong camera:12.000 XP giữ nguyên,220 orb→3 cluster; p95 82.5→32.5ms,0 pageerror. Đây là diagnostic1×30s, không thay bộ3×60s. |
| Rà bàn giao: HTTP5173 / quét dist / hash prompt | Local server trả200; dist không có chuỗi __eventide hoặc eventide.e2e; không còn đoạn báo cáo đang chờ số liệu. Hai snapshot BUILD_MVP và prompt VNext vẫn trùng hash bản gốc. Last-run e2e/production đều passed/failedTests rỗng. |

Một lần chạy browser lại thiếu biến PLAYWRIGHT_BROWSERS_PATH nên không khởi động được Chromium; đã đặt đúng đường dẫn và chạy lại toàn bộ17+1 pass, không tính lần đó là kiểm tra game thất bại. Sandbox cần quyền spawn esbuild/browser; đã chạy với quyền phù hợp. Các lỗi phát hiện trong triển khai (ledger cùng cell, audio callback, footprint TileSprite) đã sửa rồi kiểm tra lại; không chuyển chúng sang backlog.

## Bằng chứng dài hạn và hiệu năng

Combat paired simulation cùng seed/input/đầu vào XP đủ720s cho kết quả giống baseline: artifacts/vnext/combat-parity.json. Bot fast-forward stats chuẩn seed42 thắng720s, level34/kills1000, Beacon300HP/tàu106.62HP, reward17; artifacts/strategies.json. Đứng Beacon thua394.7s, đi rìa thua42.917s. Kết quả đứng Beacon khác MVP cũ vì sửa cap XP từng dời loot gần tàu ra xa; không đổi lượng XP hoặc công thức level. Fast-forward không là bằng chứng frame pacing.

Báo cáo số đo trước/sau và lượt render đủ720s được chốt tại [performance-report.md](../../performance-report.md); raw artifacts/vnext giữ build entry, môi trường, frame p50/p95/p99/>33.3/>50ms, phase CPU, object/heap/CDP và checkpoint. Chỉ dùng các nhóm controlled cuối, không trộn mẫu trung gian hoặc exploratory có XP khác. Máy hiện tại render WebGL qua SwiftShader phần mềm; không suy thành FPS GPU desktop.

## Giao diện, cách chạy và giới hạn

Ảnh trước menu/pause tại artifacts/vnext/before-ui; ảnh sau tại artifacts/vnext/visual, xem [visual-qa.md](../../visual-qa.md). Đã xem ảnh thực các mẫu menu/pause/HUD/upgrade/settings/result và toàn bộ glyph Sans/Serif; e2e kiểm tra bounds ở cả sáu tổ hợp. Zoom125% là mô phỏng viewport/DPR, chưa phải native browser zoom. Hai ảnh tham chiếu có tên trong prompt không có trong workspace/Downloads; đã tiếp tục bằng build baseline thật.

Chạy local: npm run dev, mở URL Vite in ra (mặc định http://127.0.0.1:5173). Đã khởi động thành công mã cuối bằng npm run dev -- --port 5173 --strictPort. Bản tối ưu: npm run build rồi npm run preview (mặc định4173). Giữ cùng origin/cổng từng dùng để thấy save cũ. Không mở index.html bằng file://. README có lệnh tái hiện benchmark và Chromium local.

Chưa chơi tay đủ12 phút, chưa nghe đánh giá audio, chưa đo input-to-photon/GPU vật lý/refresh rate, chưa kiểm tra Firefox/Safari hoặc native zoom/headed, chưa soak20–30phút. Không tuyên bố đạt60FPS mọi máy hoặc hết mọi leak. Giới hạn đo và bottleneck còn lại ghi trong báo cáo hiệu năng; không giấu thành feature backlog.
