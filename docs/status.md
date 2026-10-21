# EVENTIDE beta1.0.0 · UX/UI/stability · 2026-10-21

Thực hiện [prompt Next beta](../prompts/EVENTIDE_Next_Beta_UX_UI_Stability_Prompt.md) trên source hiện có. Chuẩn bị phát hành theo yêu cầu push của người dùng ngày2026-10-21; đã fetch và đối chiếu origin/main tại5fbac8a, không có lịch sử remote mới cần gộp. Kết quả push/deployment sẽ ghi tại [triển khai](DEPLOYMENT.md). Giữ mọi thay đổi trước và tiến triển người chơi. [Báo cáo thay đổi lớn](next-beta-ux-report.md), [CHANGELOG](../CHANGELOG.md), [status đợt trước](history/status/status-ui-hazards-multiboss.md).

## Đã triển khai

- HUD normal/warning/critical có hysteresis, chữ/icon HP thấp và Corruption, hướng Beacon nguy cấp; cue Beacon rate-limit. Toast có queue/gộp trùng/nhường nguy hiểm, ARIA không đọc số mỗi frame.
- Balo tổng quan5ô → recipe/CTA → chỉ số gọn → nguồn chi tiết có scroll. Draft2–3so sánh từ calculator thật/details, giữ XP/reroll/mastery/fusion cùng slot; focus trap/restore và Esc đúng khi select có focus.
- Ba tutorial theo tình huống có deferred queue/skip/tắt/xem lại riêng, seen sau display; không chỉ CTA recipe cũ. Save schema3/key/meta cũ giữ, thêm optional-default tutorialSeen/settings.tutorial.
- Kết quả snapshot/freeze trước cleanup: final build, achievement/goal thật, damage actual sau giảm trừ/clamp, owner/channel/fatal/cùng chết, thời gian nguy hiểm và tối đa một nhận xét có bằng chứng. Reward một lần và luật720s giữ.
- Giữ cấu hình hazard/scaling/Quasar/boss và các tối ưu có sẵn. Audit31file luật/render/lockfile,42file public,249fixture lịch sử giữ hash; không thêm asset/dependency hoặc triển khai cứu hộ.

## Kiểm tra thực tế

Windows/Node24.21.0/npm11.19.0; Chromium156.0.8078.4, WebGL SwiftShader. QA cuối **index-D3jAI-Sl.js**, production **index-sBaUOfj7.js**, CSS **index-C3KVvyY1.css**, base /EVENTIDE/.

Kiểm tra lại trước push2026-10-21: `npm run typecheck` pass; `npm run test` **149pass/4opt-in skip** trong63,38s; `npm run build` pass, đúng bundle production trên; `npm run test:production` **2/2pass** trong26,7s. Smoke kiểm tra asset/font/offline/nohooks và input/XP/draft/Balo/pause/WebAudio/save qua refresh; raw riêng ở `artifacts/deployment/2026-10-21-local/`. Audit/report chạy lại xác nhận31file luật/render/lockfile,42asset public và249fixture giữ hash như bằng chứng UX; không chạy lại lượt720s vì không đổi source gameplay. Cảnh báo chunk Phaser>500kB vẫn còn.

| Lệnh / luồng | Kết quả |
|---|---|
| npm run typecheck | Pass, kể cả sau cập nhật assertion/config QA cuối |
| EVENTIDE_BALANCE=1 npm run test | 153/153pass trong17file, gồm4bài opt-in |
| npm run build:next-beta; npm run build | Pass; cảnh báo chunk Phaser>500kB còn |
| npm run test:next-beta | Lượt66case:63pass,3assertion chờ text layout Quasar cũ; cập nhật assertion theo slot/cấp mới rồi --last-failed:3/3pass. Tổng66case đã xác minh, cùng app bundle; không gọi lần đầu là66pass sạch |
| npm run test:production | 2/2pass trên4173: prefix/font/ảnh/nohooks/offline, input/XP/Build/pause/save và WebAudio API |
| rendered-run.mjs | **720s render clock thường, victory**,725,061s wall, seed42/defense/fusion, HP72,6172/Beacon289,8/level31/1001kills/reward17; pageerror0 |
| playtest.mjs | 24natural fixed60Hz tăng tốc:12cặp trước/sau bằng nhau ở hai seed/3build±fusion; mỗi phía7thắng/5thua |
| Lifecycle | 28panel,7vòng start/menu; sau warmup texture/listener ổn định, timer/tween/boss owner0 ởmenu; raw GC/CDP |

Lượt720s còn Harrier phase2/827,73HP sát cuối vẫn thắng theo luật, snapshot rồi cleanup owner/attack0. Có chạy cùng hồi quy UI; **không dùng lượt này để chứng nhận FPS hoặc chơi tay**. TTK lab thiên thủ cấp5 mới chạy lại: boss540 khoảng43,43–48,37s;660 khoảng35,43–39,33s, giữ các giới hạn của đợt trước.

Ba test lỗi trung gian là text assertion theo layout cũ, không lỗi consume/fusion. Một lỗi bàn phím thực sự (Esc trên select bị chặn) đã sửa và hồi quy qua filter/settings. Reporter ban đầu lưu theo configDir nên JSON lượt đầy đủ bị rerun ghi đè; kết quả63/3 ghi đúng từ output terminal, giữ trace3ca và JSON3rerun. Đã sửa reporter sang absolute workspace path, một ca HUD pass xác minh writer; không dựng JSON reporter giả cho log mất.

## Hiệu năng và bằng chứng

Baseline trước sửa unit136pass/4opt-in skip/typecheck/build pass; bundle index-CtKeK4qU.js. Đã đo AB/BA tuần tự cùng seed/viewport/build, kèm Low/reduced và >50/100ms. Dense p95 trước33,7–33,8ms → sau34,5–35,4ms (cao hơn0,8–1,6ms trong hai cặp); duo sau29,2–30,0ms, Low29,4/reduced29,7ms. Tất cả14lượt đo30s không có frame>50ms hoặc rAF>100ms. CPU sau p95 simulation≤0,8/render prep≤0,4/DOM≤0,3ms. **Chưa đạt p95≤20ms/60FPS**; chưa định lượng nguyên nhân phần tăng tail của dense riêng GPU/driver/DOM. [Performance report](performance-report.md) giữ mọi raw và provenance; không dùng số lịch sử chứng nhận bản mới.

Artifact hiện hành: `artifacts/next-beta/`, gồm before-source/before-build/after-build, before/after UI, regression, rendered-run, playtest, balance-regression, audit, provenance, e2e-verification. Clip cuối `interaction/keyboard-local.webm` cùng34mẫu/0pageerror: đoạn đầu tự nhiên, đoạn hai boss+gravity là fixture đã dọn pending draft, input/render/clock bình thường. Không gọi clip là người chơi điều khiển.

## Chạy local và giới hạn

Game production hiện chạy **http://127.0.0.1:4173/EVENTIDE/**. Tự chạy: `npm run dev` →5173/EVENTIDE/; hoặc `npm run build` rồi `npm run preview` →4173/EVENTIDE/. Giữ origin/cổng cũ để thấy save; không file://. QA4301/keyeventide.e2e.v1 riêng, không dùng bundle QA để phát hành.

Cân bằng người thật, GPU vật lý, input-to-photon/native zoom, nghe âm thanh bằng tai, Firefox/Safari và soak20–30phút chưa kiểm chứng. Viewport/DPR/clip/logic tự động không thay thế các việc đó. Bot cơ động có ca thua; không đổi luật để ép thắng. Không có bug sản phẩm đã biết bị chuyển thành ý tưởng backlog.
