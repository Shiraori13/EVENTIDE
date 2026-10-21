# EVENTIDE beta1.0.0 · visual identity local · 2026-10-18

Đã nâng cấp trực tiếp MVP theo [prompt visual](../../../prompts/EVENTIDE_Visual_Identity_Space_Animation_Prompt.md). Giữ phiên bản/gameplay/schema3; **không commit, push hoặc deploy** trong tác vụ này. Trang Pages vẫn là bản phát hành trước; hồ sơ phát hành giữ nguyên tại [status-deployment](status-deployment.md). Không khởi tạo lại repo hoặc sửa prompt MVP.

## Kết quả hiện hành

- Nguồn sáng ấm/vòng đứt đoạn/thủy triều tinh vân thống nhất menu, Beacon, Nova, HUD, Build/draft/Core và các panel. Cải tiến5SVG CC0,32hash asset hợp lệ, font Noto local/OFL giữ nguyên. Background cached opaque, parallax/twinkle/dust có trần; không shader/blur toàn màn hình hoặc dependency mới.
- HUD ưu tiên Beacon, rail thông báo tránh tâm giao tranh, toast trong flow; max/empty/recipe rõ, confirmation tiến hóa vẫn focus/scroll đúng. Responsive1280×720/1366×768/1920×1080/390×844; hẹp không còn overlay che menu, vẫn cần bàn phím.
- Quality Cao/Vừa/Thấp, Giảm chuyển động/OS default và shake riêng. Save cũ giữ Low/High/audio/tiền/Core/Echo/career/huy hiệu; fallback motion từ reducedEffects. Profile mới mặc định Vừa. Key/version/meta không reset, test dùng namespace riêng.
- Tàu chỉ smooth góc/bank/trail, không delay vị trí/hitbox/aim. Beacon dùng charge/HP/lastHit thật, critical tam giác+chữ. Boss hazard chính xác, Low giữ cảnh báo. Sửa dư ảnh tia khi boss chuyển phase sớm; fade chỉ120ms sau kết thúc hợp lệ, không xuất hiện lại theo end cũ.
- Tối ưu ARC100đoạn của Phaser thành polyline sai số≤0.35u/cap128 cho Beacon/Gravity/Pulsar. Probe xác nhận giảm vertex, không xác nhận giả thuyết pipeline. Phế tích về28 khi dense, bỏ shadow HUD và guard tilePosition khi pause/Canvas. Giữ source/raw trước tối ưu.

Đối chiếu26file gameplay/config bằng SHA256 với baseline: byte-identical. Không đổi damage/HP/cadence/drop/slot/scaling/draft/mastery5ô/fusion/XP/reroll/bonus/clock mô phỏng/event/boss. GameScene chỉ thêm clock hình ảnh menu clamp100ms/ẩn tab, không tick gameplay. Chi tiết trách nhiệm/layer/timing/budget: [design system](../../design-system.md), [architecture](../../architecture.md). Không cân bằng lại để ép test thắng.

## Kiểm tra đã chạy

Windows10.0.26200, Node24.21.0/npm11.19.0, Chromium156.0.8078.4 headless WebGL/SwiftShader, Intel i5-12450HX/12logicalCPU/RAM21.17GB. Browser localhost dưới /EVENTIDE/, không dùng bản public để chứng nhận code mới.

| Lệnh / bằng chứng | Kết quả thực tế |
|---|---|
| npm run typecheck; npm run build:visual; npm run build | Strict/build pass. Final benchmark index-DN3l1Vfu.js130.12KB/gzip46.04; production index-CwGwYTTD.js119.09KB/gzip41.90; CSS29.01KB/gzip6.96. Phaser1208.06KB/gzip332.17 giữ warning chunk>500KB; không dependency/lockfile mới |
| npm run test |117/117 cũ,13file,42.94s; toàn bộ simulation/regression/playtest lịch sử |
| npx vitest run tests/unit/visual-identity.test.ts |5/5 mới,257ms: migration/OS/savedfalse, pose/pause/cung ngắn/bank/dừng, contrast token≥4.5:1, sai số và cap cung. Tổng coverage unit hiện hành122 ca, chạy thành hai nhóm |
| npx playwright test --config config/playwright/playwright.visual.config.ts |50/50,8.6phút, trên index-BdNviQOb trước tinh chỉnh geometry; gồm input thật/XP/pause/blur/draft, click fusion paused3viewport/resume damage, max5ô/queue/reroll/bonus/events/boss/fallback/font/zoom/DPR/lifecycle |
| Kiểm tra sau tinh chỉnh |6/6 trung gian;7/7 liên quan geometry/viewport/settings/pause/Low/Gravity/restart,1.8phút trên DKdziTGL. Guard owner cuối: regression mới1/1,2.9s trên DN3l1Vfu, boss chuyển phase hủy cache/dư ảnh, positive fade120ms. Script hiện có51e2e ca; không ghi full51 đã chạy trên một bundle |
| npm run test:production (URL local4173) |Final2/2,28.7s: font/ảnh/version/base/nohooks/refresh/offline, di chuyển/nhặt XP/chọn cấp/B/pause/resume/shot WebAudio/mute/volume/save. HTTP404/pageerror/unexpected origin0 |
| scripts/qa/visual-identity/visual-identity-capture.mjs / motion.mjs |Ảnh runtime trước/sau menu/early/dense/Build/draft/Core1280×720, menu390; QA4viewport; clip phím/click/fusion thật có fixture, errors0. Đã xem ảnh menu/Core/draft/Build/HUD/critical trên desktop/hẹp |
| scripts/qa/visual-identity/visual-identity-batches.mjs |Fixture pause đồng nhất: vertex previsual14355→4107dense,13176→3780endgame; baseline4914/13326. Mỗi frame draw1/program switch0 trong fixture; không suy mọi biến động frame từ drawcount |
| Restart/lifecycle7lượt |Sau warmup: textures38, scene listeners48, DOM listeners167/nodes510/documents35 ổn định; timer/tween0. Pool≤640, hút/XP/backing viewport đúng trần. Không kết luận hết leak từ một heap snapshot |
| Asset/gameplay/Git audit |32SVG SHA256 metadata hợp lệ;26file gameplay byte-identical; fonts/27SVG khác/lockfile giữ. git diff --check không whitespace error (có cảnh báo EOL chuẩn hóa Git); không thao tác Git remote |

Lần đầu Vitest bị sandbox EPERM khi spawn esbuild, đã chạy lại bằng quyền thực thi local và pass. Lượt UI đầu dừng do test mới dùng sai selector back/read-back; sửa và full50pass, giữ initial-ui-test-failure. Sửa thêm URL gốc trong test VNext thành relative cho base. Đây không phải lỗi mất nút trong game. Số đo bản visual đầu cao/dao động nên giữ pre-render-batching/control/post-geometry, tối ưu rồi đo bundle cuối; không thay kết quả cũ bằng số đẹp hơn.

## Hiệu năng và bằng chứng

Đo A/B riêng, warmup5s/sample30s,2lặp dense/endgame,1280×720/DPR1/seed20261016/pinned-local-loot-v2, không browser/test khác đồng thời. Baseline qualityCao cũ, sau qualityVừa mới; ghi rõ khác tier. Raw frame p50/p95/stalls/heap/counters, control, before/after/clip và giới hạn ở [visual report](../../visual-identity-report.md); không dùng SceneCPU thấp làm chứng nhận60FPS. Mục tiêu60FPS là mục tiêu đo, không bảo đảm trên SwiftShader hoặc mọi máy.

Final4/4 lượt hoàn tất trên DN3l1Vfu, pageerror0. Dense p50 34.9/35.0→32.9/32.8ms, p95 43.1/43.1→36.6/36.5ms; endgame p50 30.5/30.1→26.8/26.7ms, p95 38.0/35.2→30.7/30.3ms. Trung bình p95 mỗi lượt giảm15.2%/16.7%; vẫn còn spike>50ms và chưa60FPS. Heap mẫu32.0–44.9→36.2–47.0MB, thêm một tile4MiB thô, lifecycle/counters hữu hạn. Không quy toàn bộ chênh lệch vào geometry hoặc dùng tier khác như đối chứng cùng mức hình ảnh.

## Chạy local và giới hạn

Bản production preview được giữ chạy **http://127.0.0.1:4173/EVENTIDE/**. Dev **http://127.0.0.1:5173/EVENTIDE/** qua npm run dev. Muốn tự khởi động production: npm run build rồi npm run preview. Không mở index bằng file://. Save theo origin/cổng: dùng đúng cổng từng chơi để thấy tiến triển cũ; đổi5173→4173 tạo vùng lưu khác. Reload về menu, chưa có resume-run.

Chưa chơi tay đủ12phút/nghe audio trực tiếp, chưa đo GPU vật lý/nativezoom/60–120Hz hoặc thiết bị mobile/touch. Full simulation/end conditions nằm trong117regression; không chạy lại lượt render720s vì luật/clock mô phỏng giữ byte. Ảnh/automation/clip có patch fixture không phải playtest cân bằng người thật. Không có bug gameplay mới được biết còn bỏ dở; giới hạn QA và mục tiêu frame trên software renderer được báo riêng, không giấu vào backlog.
