# EVENTIDE beta 1.0.0 — UI / hazards / multi-boss local

Tác vụ hiện hành theo [prompt](../../../prompts/EVENTIDE_UI_Hazards_Balance_MultiBoss_Prompt.md), cập nhật trực tiếp base/visual đang có; **không commit/push/deploy**. Không đổi concept Beacon12phút, progression/mastery/evolution/gear/economy hoặc schema3/key cũ. Bản trước giữ ở [status visual](status-visual-identity.md), phát hành cũ ở [status deployment](status-deployment.md).

## Đã triển khai

- Bỏ đúng pseudo cung vàng menu h1::after/panel h2::before đã truy computed owner; wallet header phải, keyboard Core/số save thật/phản hồi mua/thưởng. Desktop720/768/1080 và390px.
- Hazard warning khóa vị trí theo tuyến tàu, lực/biên/damage chung state; Tide440/140/falloff sqrt/cap78%, arrow cạnh tàu/nhãn/đổi nhịp0,7s. Radiation190/7HP/s, timer riêng contact, overlap strongest, boss miễn %HP; Low/reduced giữ cue, pause/cleanup.
- Scaling10/7–14/9–16/10% mỗi phút, linear/ratio; Quasar398u cả beam và chain, các stats khác và Ion giữ.
- Pool4boss, scheduler540/660 không lặp/không chờ death. State/phase/attack/beam/zone/reservation per owner, hai hàng HUD, slot riêng; Gravemaw/Helion/Harrier hai phase/asset CC0. Admission trước telegraph, dash swept, hai chặng warning, reward/owner cleanup.
- Gom file đúng nhóm, config/test/script/link đã cập nhật; 192fixture lịch sử hash hợp lệ. Audit11file cốt lõi (save/clock/stats/XP/evolution/presentation/lockfile) và32SVG trước giữ byte;35SVG metadata hash hợp lệ, atlas1024×640. Prompt MVP canonical và root copy lưu trong prompts/history khớp hash.

## Kiểm tra thực tế

Windows / Node24.21.0 / npm11.19.0, Chromium156 từ .playwright, WebGL SwiftShader; không dùng FPS của bot. npm run typecheck, build:qa và build production đã pass (QA cuối index-CtKeK4qU.js; production index-BYdXBxam.js, base /EVENTIDE/). npm run test:136pass/4opt-in skip; EVENTIDE_BALANCE=1 npm run test:balance chạy riêng4pass, gồm24natural A/B,60bossTTK,3pairs vàhazard/clearance. Có lượt đủ720s tăng tốc, không gọi là chơi tay.

Lượt E2E sạch58/58pass trên index-BcrWYQDt.js (9,4phút wall). Sau chỉnh trình bày Harrier theo dash/hàm Gravemaw và reduced motion, chạy lại13/13ca UI/VFX/owner trên index-CtKeK4qU.js (1,5phút). Production smoke2/2pass trên4173: prefix/font/ảnh local, không debug/perf hooks, offline sau load, input/XP/Build/pause/audio/save qua refresh. Lượt đầu smoke bị connection-refused vì preview cũ đã dừng; khởi động lại server và pass.

Bảy vòng duo/menu sau2warmup: textures41, scene listeners48, DOM listeners176/nodes543/pool254 ổn định; timer/tween và boss/beam/zone/reservation về0 ởmenu. Đây là plateau workload này, không chứng minh mọi leak đều hết.

## Playtest và bằng chứng

Số HP/scaling/range và đường chỉnh ở [balance](../../balance.md)/[boss catalog](../../boss-catalog.md). [Báo cáo chi tiết](../../ui-hazards-multiboss-report.md) có ảnh/raw trước-sau, TTK, lực/damage,clearance,failed builds và phương pháp. Natural trước8/12thắng, sau7/12, peak enemy42→45; không ép tỷ lệ thắng. TTK thiên thủ cấp5 boss đầu43,43–48,37s, boss sau35,43–39,33s; hai boss còn hơi dưới sàn45s. Bot cơ động có ca chết, không kết luận mất lối né chỉ từ bot.

Production2/2pass, ảnh/capture/gallery8phase và clip keyboard clock thường đã ghi;5/5 unit trình bày sau sửa cuối pass. Clip45mẫu/0pageerror, fixture tách rõ với run tự nhiên. Frame A/B hai thứ tự đã hoàn tất, raw/bundle nhận diện ở performance-report. Bằng chứng local trong artifacts/multiboss, không được push; bản mới chưa phát hành.

## Chạy local / giới hạn

npm run dev → http://127.0.0.1:5173/EVENTIDE/. Bản production đang giữ chạy tại **http://127.0.0.1:4173/EVENTIDE/**; muốn tự khởi động: npm run build rồi npm run preview. Giữ cùng origin/cổng cũ để thấy save. Không mở file://. QA tối ưu build:qa/test:qa dùng4201 và keytest riêng, không đưa hooks vào production.

Chưa chơi tay đủ12phút, chưa nghe đánh giá audio, chưa đo GPU vật lý/Firefox/Safari/native zoom/soak20–30phút/touch. Clip phím tự động trong fixture và bot tăng tốc không thay đánh giá cảm giác người chơi. Cấu hình mới đã đo trong phạm vi báo cáo, chưa gọi là cân bằng hoàn tất.

## Frame trước/sau đã đo

[Protocol/raw/counters](../../performance-report.md), hai thứ tự A/B và B/A, cùng Medium/seed/viewport/máy; không browser/test khác đồng thời. Dense p50 trước34,4/36,8→sau37,6/33,1ms; p95 trước43,6/54,8→sau48,1/40,3. Endgame p50 trước28,1/31,9→sau31,3/26,5; p95 trước36,7/42,7→sau44,0/32,8. Lượt đầu sau cao hơn, đối chứng đổi chiều; chưa chứng minh tăng/giảm FPS ổn định. Duo110quái+2boss+hazard p50/p95/p99=31,1/37,7/45,8ms;6/960frame>50ms. Probe GL dense paused cùng1draw/4107vertex, chỉ loại trừ tăng command/vertex ở snapshot này, không quy nguyên nhân riêng GPU/atlas. Chưa60FPS/không có GPU vật lý.

QA cuối index-CtKeK4qU.js142,49KB, production index-BYdXBxam.js130,12KB; Phaser chunk1208,06KB còn warning>500KB, không lỗi build. Giữ mọi lượt đo đầu/đảo thứ tự, không ghi đè số xấu. Giới hạn render720s: bản này kiểm tra720s bằng mô phỏng tăng tốc và clip clock thường ngắn, chưa có full720s render.

Tổng hợp lệnh/bundle thật trong [verification.json](../../../artifacts/multiboss/verification.json); kiểm tra liên kết Markdown0link hỏng và git diff --check pass (chỉ cảnh báo chuẩn hóaEOL).

Dev5173 sau gom thư mục đã smoke bằng browser: Khởi hành→Balo thật,0pageerror/HTTP lỗi, raw [dev-smoke](../../../artifacts/multiboss/dev-smoke.json). Dev5173 và production4173 đang giữ chạy local.
