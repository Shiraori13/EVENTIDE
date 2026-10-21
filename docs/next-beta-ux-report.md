# Next beta UX/UI/stability · local · 2026-10-21

Thực hiện [prompt](../prompts/EVENTIDE_Next_Beta_UX_UI_Stability_Prompt.md) trên bản local có sẵn. Giữ nhãn beta1.0.0/package1.0.0-beta.1, Pages base `/EVENTIDE/`, dữ liệu meta và concept. Không push/deploy. Bản trước: [status](history/status/status-ui-hazards-multiboss.md), [báo cáo](ui-hazards-multiboss-report.md).

## Checklist từ baseline

| Nhóm | Trước đợt này | Xử lý |
|---|---|---|
| Cung vàng / ví | Đã bỏ đúng pseudo menu/panel; ví header32px/số26px/save chung/Core thật | Giữ; chụp lại menu, Core, Build, chuyển màn và kiểm tra UI |
| Hazard/scaling/range/boss | Đã có Tide440/140/6s/cap78%; radiation190/7HP/s; linear10/7–14/9–16/10; Quasar398; bốn boss540/660/owner/phase/budget | Giữ cấu hình; hồi quy luật, same-seed và stress mới |
| Hiệu năng | Có pool/culling/XP ledger/cache/polyline/adaptive decoration, HUD diff80ms | Baseline CPU p95 simulation≤0,8ms/render prep≤0,4ms/DOM≤0,3ms trên SwiftShader; chưa có bằng chứng cần spatial index. Giữ tối ưu; bổ sung >100ms và phân nhóm telemetry |
| HUD | Beacon critical một ngưỡng, không hysteresis; “bị đánh” chỉ0,12s; chưa có trạng thái HP tàu | Thêm normal/warning/critical có hysteresis, chữ/icon, ưu tiên hướng quay về, cảnh báo Corruption trước ngưỡng; cue Beacon rate-limit1s |
| Balo/draft | Dữ liệu đầy đủ nhưng bảng nguồn dài; thẻ đoạn văn kỹ thuật; focus trap chưa tính summary/input | Tổng quan5ô, tiến hóa, chỉ số gọn, details; card2–3so sánh từ calculator; trap/restore và scope phím tắt |
| Tutorial | Chưa có queue/cờ profile | Ba tình huống, hoãn nguy hiểm/modal, seen sau hiển thị, skip/reset riêng, tôn trọng tắt |
| Kết quả | Chỉ time/kill/level/reward/Echo; chưa có damage/fatal/build snapshot | Actual HP loss sau giảm trừ, owner/channel, clamp overkill, cả hai fatal, snapshot/freeze trước cleanup, final build/goal/details/một nhận xét có chứng cứ |
| Cứu hộ | Chưa có | Chỉ backlog, không triển khai |

## Thay đổi lớn và nơi sửa

- `presentation/HudWarnings.ts`: HP critical≤25%, thoát≥32%; warning≤50%, thoát≥58%. Corruption cảnh báo40, thoát<35; buff gameplay vẫn đúng50, không hysteresis buff. Cảnh báo chữ không phụ thuộc màu/rung. HP/timer không phát aria-live mỗi frame; vùng đọc trạng thái chỉ đổi khi mức nguy hiểm đổi.
- `ui/BuildView.ts`, `DraftView.ts`, `core/upgradePreview.ts`: source stat/config/attackInterval dùng chung runtime. Haste là hệ số chia interval; không suy DPS. Nguồn base/support/gear/mastery/tạm thời còn đầy đủ trong bảng mở rộng có scroll riêng. Fusion/cancel/stale/slot/reroll giữ giao dịch cũ; CTA đủ recipe ở phần đầu panel.
- `services/TutorialService.ts`: tối đa ba trigger/run; queue giữ trigger qua danger/draft, simulation time cho tuổi hint. `EvolutionSystem.hasQuasarRecipe` tách recipe khỏi quyền commit pause/draft, tránh bỏ mất gợi ý khi đang bay. Mỗi hint hiển thị tối đa10s, cách nhau3s; Bỏ qua đóng ngay. Cài đặt bật/tắt và Xem lại chỉ đổi tutorial.
- Nếu recipe đã đổi/hợp nhất trước khi hint được hiện, không chỉ CTA cũ; seen chưa được ghi. Toast mới có thể hiện ngay khi vùng đang trống, không chờ một chu kỳ rỗng5s.
- `core/runReport.ts`: run-only counters, không log từng frame/hit hoặc ghi save mỗi hit. Đo tại CombatSystem sau armor/invuln; nguồn radiation/Solar mạnh nhất do AstronomySystem chọn cùng damage thật. Key nguồn có trần33 (32+other); outgoing theo sáu module/môi trường. Fatal chỉ khi HP dương bị đòn đó đưa về≤0. Phase overkill không tính sang pool mới.
- `GameSession.finishRun`: reward guard giữ nguyên; snapshot build/counters trước clear owner/entity. Report deep-frozen và độc lập telemetry runtime; cùng chết vẫn defeat và ghi cả hai. `ui/ResultView.ts` hiển thị final loadout, một achievement thực hoặc goal gần nhất, incoming/outgoing không gọi là DPS, thời gian nguy hiểm/Corruption/xa Beacon. Chỉ nhận xét nếu >50% damage Beacon xảy ra khi tàu ở ngoài sáng.
- `ui/NotificationQueue.ts`: tối đa bốn nhóm, gộp tên trùng, ẩn khi dialog/nguy hiểm; không tạo timer riêng. `styles/next-beta.css` dùng token cũ; giữ font local, palette và nền. Không thêm asset/dependency.

## Save và luật giữ nguyên

Schema3/key `eventide.save.v1` giữ. Hai trường thêm có default: `tutorialSeen: []` và `settings.tutorial: true`; validator nhận ID ổn định, loại trùng/giá trị sai, giữ false đã lưu. Save1/2/3 vẫn giữ currency/Core/Echo/career/achievement/metrics/settings cũ. Chỉ ghi cờ khi hint thực hiện hiển thị hoặc người chơi đổi setting; báo cáo không persist. Không tạo checkpoint.

Clock720s, pause/blur, defeat trước victory, XP dư, draft/reroll, ba vũ khí/hai hỗ trợ, năm ô max mới mastery, fusion cùng slot/giải phóng ô/giữ bonus, kinh tế/reward một lần không đổi. Không retune con số của đợt multi-boss. So gameplay mới ở `artifacts/next-beta/playtest/natural.json`: hai seed7/42 × ba build × fusion tắt/bật × trước/sau =24run; **12/12cặp bằng nhau toàn bộ outcome/time/HP/kills/build/gear/mastery/peaks/ticks**. Mỗi phía7thắng/5thua; bốn ca cơ động thua596,87–633,07s, thủ42 không fusion thua701,97s. Đây là bot tăng tốc fixed60Hz, không chứng nhận cân bằng chơi tay/FPS.

## Bằng chứng local và kiểm tra

Baseline trước sửa typecheck pass; unit136pass/4opt-in skip; QA bundle `index-CtKeK4qU.js`. Source/public/package snapshot tại `artifacts/next-beta/before-source`, build baseline4300, trạng thái Git trước ở `before-git-status.txt`. Không reset cây làm việc bẩn có sẵn.

Sau sửa cuối: strict/build pass; unit **153/153**, gồm4bài cân bằng opt-in (17file). QA **index-D3jAI-Sl.js**, production **index-sBaUOfj7.js**, CSS **index-C3KVvyY1.css**. Production smoke **2/2pass** trên4173, không hooks/asset404; kiểm tra audio qua WebAudio API, chưa nghe bằng tai. Audit `artifacts/next-beta/audit.json`:31file luật/render/lockfile quan trọng,42file public và249fixture lịch sử giữ hash. Đợt này sửa11file source sẵn có, thêm9file theo trách nhiệm; không di chuyển lại phần cấu trúc đã tốt.

Full unit opt-in đã tạo lại60fixtureTTK,3cặp boss/hazard; bản sao kết quả hiện hành ở `artifacts/next-beta/balance-regression`, phân biệt before của đợt multi-boss cũ với baseline UX hiện hành. Đã chuyển output mặc định bài cân bằng sang `artifacts/balance-regression`, cho phép `EVENTIDE_BALANCE_ROOT` để tái chạy không ghi đè thư mục lịch sử. Natural12cặp UX hiện hành nằm riêng tại `playtest/natural.json`.

Ảnh cùng1280×720: `artifacts/next-beta/{before,after}/ui/{menu,hud,build,draft,evolution-confirm,core,results}.png`; viewport/focus/tutorial/fatal/lifecycle ở `artifacts/next-beta/regression`. Snapshot/nguồn/seed/build/giới hạn đo ở [performance report](performance-report.md) và [status](status.md). Artifact chỉ local, không đưa dữ liệu người chơi vào repo.

Các lượt kiểm tra trung gian phát hiện assertion settings cần thêm default tutorial; text snapshot Quasar cũ cần theo layout mới. Fixture tutorial chạm cụm XP thật và mở draft ngoài mục tiêu bài kiểm tra; đã loại pickup trong fixture, giữ gameplay. Một lượt load bị timeout khi build thay file đang phục vụ; không coi lượt lỗi đó là pass. Hồi quy đầy đủ còn bắt được Esc bị chặn khi select có focus; đã cho phép Esc đóng panel hiện tại, vẫn chặn B/1/2/3 trong input/select. Menu4K do DPR2,5 trên SwiftShader từng vượt timeout60s khi cùng chạy browser khác; QA timeout120s, giữ mọi assertion, frame benchmark chạy riêng. Queue bổ sung hiển thị toast ngay khi vùng đang trống và giữ hint recipe chưa seen khi điều kiện đã thay đổi; không hiện CTA tiến hóa cũ sau hợp nhất.

Giới hạn xuyên suốt: browser tự động/SwiftShader không thay GPU thật, input-to-photon, nghe bằng tai hoặc người chơi điều khiển đủ lượt. Cân bằng bot cơ động còn có ca thua; không nerf để ép pass. Số đo và kết quả cuối được ghi khi lệnh thực sự hoàn tất.

## Kết quả browser và lượt dài đã hoàn tất

Lượt E2E đủ66case:63pass,3case còn chuỗi text Quasar theo layout cũ. Đổi assertion sang đúng slot/cấp, chạy lại đúng3case:3/3pass (28,3s), cùng app bundle; thêm1case HUD pass xác minh đường writer. Không gọi lượt đầu66pass. Trace lỗi vẫn ở `e2e-suite-traces`, JSON3rerun ở `e2e-rerun.json`; JSON full bị reporter tương đối lưu trong configDir rồi ghi đè, nên tổng63/3 lấy từ output terminal thật, được ghi rõ nguồn trong `e2e-suite-observation.json`. Reporter đã đổi sang absolute workspace path; dữ liệu xác minh không dựng thành một JSON Playwright full giả.

Lượt720s render trên **index-D3jAI-Sl.js** đã thắng, wall725,061s, seed42/defense/fusion, level31/1001kills/HP72,6172/Beacon289,8/reward17,0pageerror. Còn Harrier phase2/827,73HP ở mẫu sát cuối vẫn thắng đúng luật; sau settlement boss/zone/beam/reservation0. Các counters report: tàu mất199,3728HP từ đạn Elder/Harrier; Beacon mất10,2HP từ Wisp, không có damage khi tàu ở xa. Ngoài sáng219,65s, Corruption≥50 trong21,9167s, chịu hazard/lực4,6833s. Tổng damage không phải DPS; không suy từ đây rằng mọi build đều cân bằng.

Ảnh/clip cuối lấy đúng bundle, clip `interaction/keyboard-local.webm`/34mẫu/0pageerror có cả playing/paused; scene hai boss khởi tạo fixture riêng và dọn pending draft trước điều khiển thật. Lượt720s dùng bot và có chạy cùng UI regression, không dùng nó chứng nhận frame/input latency. Phép đo frame AB/BA/Low/reduced ở mục hiệu năng là các browser/context riêng, chạy tuần tự khi test/clip/long-run đã đóng.

Lifecycle UI sau warmup:41textures/48scene listeners/163DOM listeners/546nodes ổn định, timer0, pool8 trong workload menu/UI; không gọi đây là stress nhiều boss. Ca duo restart riêng cũng pass và raw sao lưu tại `regression/duo-lifecycle.json`. Hai workload được phân biệt để không dùng plateau nhẹ chứng minh mọi leak dưới tải nặng.

## Đo frame cuối

Cùng1280×720/DPR1/seed20261016/SwiftShader/Medium, mỗi case warm5s/sample30s, AB rồi BA cho dense/duo. BaselineCtKeK4qU và sauD3jAI-Sl đúng source đã ghi. Dense p95 trước33,8/33,7ms, sau35,4/34,5ms: tăng1,6/0,8ms ở hai cặp, không tuyên bố FPS được cải thiện. Duo trước29,1/30,2ms, sau30,0/29,2ms; Low29,4ms/reduced29,7ms. Light26,8→26,1ms, endgame29,0→28,8ms trong lượt chính. Tất cả14lượt đo30s không frame>50ms hoặc rAF>100ms; không suy điều này thành60FPS.

CPU sau p95 simulation≤0,8ms/render prep≤0,4ms/DOM≤0,3ms/telemetry≤0,1ms. Còn chi phí raster/driver/scheduling trên software renderer; chưa cô lập được nguyên nhân riêng phần tăng tail dense. Không tự thêm spatial index khi CPU chưa là bottleneck, không đổi dt/damage để đẹp số. Mục tiêu p95≤20ms chưa đạt. [Bảng/raw chi tiết](performance-report.md) có từng lượt, N và giới hạn; benchmark quiet profile tắt hint/đánh dấu badge test cho cả A/B để queue không làm lệch workload, không đụng save người chơi.
