# Trạng thái EVENTIDE1.2 · 2026-10-16 (Việt Nam)

Nâng trực tiếp1.1 theo prompts/EVENTIDE_V1_2_Progression_Stats_Boss_Prompt.md. Snapshot nguồn/docs/package/build1.1 tại artifacts/v12/baseline-source/baseline-dist/baseline-benchmark. Giữ hệ font/UI/cache nền/pool/culling/nội suy/XP ledger/audio1.1, không tạo project/dependency mới hoặc hosting. [Trạng thái1.1 lịch sử](status-v1.1.md), [hiệu năng1.1](performance-v1.1.md).

## Tính năng đã có code và UI

- Menu Phi thuyền đọc character registry (Nova), chỉ số base/bonus/tạm thời/hiệu lực; Core không cộng HP tàu. Danh mục9 upgrade với mọi cấp/cap/tiến hóa, trong trận có trạng thái sở hữu/trần/không còn ô và chỉ đọc.
- Sáu hỗ trợ, chọn tối đa hai loại, cấp5: power/rate8%→40%; HP/nhặt10%→50%; bay5%→25%; giáp4điểm%→20%. Stats source chung, rate chia interval, damage support/Corruption tại hit, không lãi kép hoặc nhân hai lần.
- Mỗi draft một reroll, draftId chặn stale click, fresh candidates và đại diện nhóm, pending nhiều level/XP dư/heal fallback không lặp. Mở Build/B hoặc ẩn tab không làm mới reroll.
- Build hiện tại trên HUD/B, đủ ba module/hai hỗ trợ, current/maxHP/level/số pick/chỉ số; nested catalog/achievement. Pause stack giữ draft; đóng Build không tự resume sau blur/ẩn tab. Focus nút đóng và panel scroll theo viewport.
- Career kills từ death thật, năm mốc100/500/1000/2500/5000, badge-only/không tiền/stat, toast hữu hạn. Boss phase1/despawn/pool không kill. Commit delta per run, save5s simulation/milestone/lifecycle, retry không cộng lại.
- Save schema2 cùng production key eventide.save.v1, test key riêng. Migrate1→2 giữ tiền/Core/Echo/audio/quality; career0 vì1.1 không lưu lịch sử. Không invent refund/kill hoặc checkpoint run.
- Enemy HP/speed/damage snapshot spawn scale giới hạn; giữ XP/radius/spawn/cap/target25%. Boss6000HP→transition1.25s→3900HP, phase2 có fan và speed/rate×1.18/damage×1.08; overkill/phase1 không reward. Aim theo tàu→lock0.25s→fire, origin/collider đi cùng boss; owner cleanup đúng,720s vẫn thắng dù boss chưa chết.
- Bốn icon hỗ trợ CC0, tổng23 SVG/atlas1024×384, huy hiệu tái dùng art có sẵn. Không đổi font mạng/hitbox hoặc tăng pool cap.

## Kiểm tra thực tế

Windows/PowerShell; Node24.21.0/npm11.19.0, Phaser3.90.0, Vite7.3.7, TS5.9.3, Vitest4.1.12, Playwright1.64.1/Chromium156.0.8078.4. Browser ở .playwright trong workspace, PLAYWRIGHT_BROWSERS_PATH đặt tương ứng. Browser headless dùng SwiftShader software; chưa là GPU desktop.

| Lệnh/kiểm tra | Kết quả |
|---|---|
| Baseline1.1 npm run typecheck / test | Pass40/40 trước sửa, nguồn/build giữ riêng. |
| npm run typecheck | Pass strict với mã gameplay cuối. |
| npm run test | Pass59/59,7 file trên cấu hình6000/3900; gồm stat/draft/profile/boss/TTK/stress, ba module tại hit, spawn boss trùng điểm tàu, regression1.1 và paired combat1.1 lịch sử. |
| npm run build | Pass; app70.60KB/25.55KB gzip, Phaser1.208MB/332KB gzip. Warning chunk>500KB do Phaser còn, không phải lỗi build. |
| npm run build:benchmark | Pass; entry index-DW48mbSI.js, outDir artifacts/v12/after-benchmark, mode benchmark tối ưu. Không rebuild trong lấy mẫu cuối. |
| npm run test:e2e | Pass22/22,3.1phút trên mã cuối; năm luồng1.2 và toàn bộ17 regression1.1, gồm font/cold/failure/late/Canvas/zoom/DPR, ledger, lifecycle, resize. |
| npm run test:production | Pass1/1,4.0s; không hook e2e/perf dù query, không request ngoài origin, tiếp tục chơi offline sau load. |
| node scripts/generate-assets.mjs | Tạo23 SVG thật từ nguồn JSON, bốn icon mới CC0, không asset/audio rỗng. |
| node --check scripts/compare-v12.mjs / long-run.mjs / benchmark.mjs / summarize-v12.mjs | Pass syntax helper đo trên phiên bản cuối; không thay kiểm tra UI hoặc gameplay. |
| npm run perf:compare | Đã lấy lại đúng bundle cuối: hai preview1.1/1.2, dense/endgame, mỗi cảnh warm10s/sample60s, một lượt. Dense p95 45.0→38.6ms (>50ms29→0), endgame30.7→32.6ms (>50ms0→0). Cặp đầu33.6→37.0/26.5→29.8 giữ riêng; không chọn số thuận lợi hoặc suy kết luận ổn định từ một cặp. |
| npm run perf:long-run | Pass trên bundle cuối DW48mbSI: 720s simulation/723.1s wall, seed42/core0/Hull+Armor qua draft thật, victory/cấp33/kills1004/+17 Stardust; không grant HP/module/XP. |
| npm run perf:report | Pass validation artifact: hash lượt dài khớp bundle đo sau, XP đúng ở mọi checkpoint, career khớp kill, phase2/final death/victory/thưởng đúng; cập nhật các bảng từ JSON thật. |
| Kiểm tra bàn giao bằng Node/fs/fetch | SHA-256 của38 file src khớp final-measured-source; prompt1.2 khớp file Downloads và hai BUILD_MVP khớp nhau. Package/lock cùng1.2.0; dist không chứa __eventide/eventide.e2e; last-run hai bộ browser đều passed/không failedTests; dev127.0.0.1:5173 trả HTTP200. |

Lần giữa triển khai: bot cũ không chọn được pool mới gây loop; đã sửa bot chọn draft/reroll hợp lệ. Từng có lỗi identifier khi dịch nhãn, đã sửa/typecheck lại. Một lượt e2e bị HMR navigation reset và hai simulation test timeout5s khi chạy tranh CPU với browser; không tính pass. Đã đóng băng mã, đặt timeout20s riêng cho loop simulation dài (không đổi ngưỡng frame-time), chạy tuần tự lại59+22+1 pass. Không dùng max HP fixture làm bằng chứng thắng với stats chuẩn. Sau rà biên đã thêm spawn dự phòng/grace3s và nhãn reset nêu career/thành tựu, kiểm tra và build lại; mẫu đo đầu giữ riêng và lấy lại bằng hash cuối.

## Playtest và hiệu năng

[balance-v1.2.md](balance-v1.2.md) có ma trận seed7/42/104, power+haste/Hull+armor/engine+magnet qua draft thật, các checkpoint180/360/540/720, hit đầu/HP cuối và boss TTK. Các lượt này tăng tốc, không chứng minh cảm giác FPS. Cả ba nhóm có ca thắng; không suy tỷ lệ thắng dân số. Boss preset giữa màn (fixture đo TTK, không wave, HP lớn)61–80s; full burst tự nhiên có thể38–50s, defense128–148s hoặc boss chưa chết khi charge đủ. Khoảng60–110 là mục tiêu tham chiếu, không bảo đảm mọi build/RNG.

Stress60s simulation với110 thường+boss phase2/haste40% cho172 phát Plasma/peak56đạn/Well1, dưới cap160, invariant XP đúng. Enemy TTK so1.1: Wisp đầu0.65→1.40s, Drifter giữa2.00→2.65s, cuối1.08→1.57s; không tăng HP theo frame hoặc giảm loot. Raw artifacts/v12/ttk.json, stress.json, balance-playtest.json và từng balance-attempts.

Lượt render720s ở clock thường đã hoàn thành trên đúng bundle cuối: tàu150HP, Beacon293.1HP, boss phase2 tại625.57s/chết tại668.32s, career1004. XP tạo3859=đã thu3479+map380, đúng ở mọi checkpoint10s; không pageerror. Frame p50/p95/p99=24.4/28.9/32.2ms, không frame>50ms trong29520 mẫu. Kết quả/counters/heap/CDP ở [performance-report](performance-report.md). Đây là autoplay headless có render, không chơi tay hoặc fast-forward; không tính hook đặt time719.99 trong e2e thành chơi đủ lượt. Mẫu1.2 p95 còn trên mục tiêu20ms trên SwiftShader, không tuyên bố60FPS hoặc hết mọi stall.

## Dùng và giới hạn

Mở Phi thuyền/Danh mục/Thành tựu ở menu. Trong lượt dùng Build hiện tại hoặc B; ở draft bấm Đổi lựa chọn1/1 một lần. Esc đóng panel trên cùng; sau ẩn tab phải chủ động tiếp tục. Xem README để chạy local và đo lại. Giữ origin/cổng cũ để thấy tiến triển; đổi host/cổng tạo localStorage khác, không phải migration reset.

Ảnh mới artifacts/v12/visual/{1280,1366,1920} và regression cho sáu tổ hợp viewport/zoom/DPR. Đã xem ảnh thật Phi thuyền/Build/reroll và các mẫu cũ; glyph/font giữ1.1. Zoom125% là emulation, không native. Chưa chơi tay đủ12phút/nghe audio, chưa đo input-to-photon/GPU vật lý/refresh màn hình, chưa Firefox/Safari hoặc soak20–30phút. Các giới hạn cân bằng/cảm giác được ghi rõ, không giấu vào backlog như tính năng tùy chọn.
