# Hiệu năng và runtime hotfix beta1.4.1

Hotfix không thêm benchmark FPS toàn phiên bản. Số đo A/B1.3→1.4 và lượt render720s thuộc [hồ sơ beta1.4](performance-v1.4.md), entry BC9WlYb0; không gán percentile đó cho1.4.1. Bundle/nguồn/raw v14 giữ nguyên. Hotfix giữ nền composite opaque1024², atlas32entry, pool/XPledger/culling/caps và cadence UI cũ.

Thay đổi trên đường draw chỉ là so sánh buildRevision khi frozen để commit lúc pause dọn ảnh owner cũ; khi playing nhánh frozen short-circuit. Selector năm ô chỉ dùng ở action/draft/panel, không thêm simulation step, per-enemy scan, timer hoặc listener. Chưa có số frame-time mới để khẳng định hiệu năng tương đương hay cải thiện.

| Kiểm tra runtime trước → sau | Bằng chứng thực tế |
|---|---|
| Xác nhận tiến hóa1280×720 | Trước top1995px ngoài clip138–599/focusTrởvề → sau top271px trong clip138–599/focusXácnhận; click thật, không auto-scroll trước assert |
| Pause/commit | Time/charge/player/enemy/boss/event/Corruption/XP/pending/reroll không tiến; owner Pulsar/Ion dọn, Quasar5/revision/UI đổi ngay |
| Resume |3viewport: Quasar hit510,048HP đúng nguồn, Pulsar/Ion metrics không tăng; dùng nút thật và clock thường, không debug.advance |
| Tài nguyên | Bộ hồi quy kiểm tra texture/pool/listener/FX/event/timer/tween qua vòng lặp; bảy vòng fusion thật (2warm+5mẫu) textures37/listeners48/DOMlisteners167/pool8 giữ, pulse/trace/timer/tween0 ởmenu. Raw fusion-lifecycle.json; kết quả lệnh cuối ở status |
| Bundle | Production1.4 app106,96KB/gzip37,66KB; hotfix110,72KB/gzip38,95KB. CSS14,95KB và Phaser1208,06KB/gzip332,17KB giữ; warning chunk>500KB còn |

Môi trường Windows/Node24.21/Chromium156 headless, ANGLE Vulkan SwiftShader software. Các test có seed/save riêng; không đo GPU thật, input-to-photon hoặc soak20–30phút. Chưa chạy lại lượt render đủ720s trên hotfix vì clock/wave/win-loss không đổi; sáu lượt720s ở balance-v1.4.1 là mô phỏng tăng tốc. Số cũ p95 dense48,1ms/endgame40,8ms đã vượt mục tiêu20ms và vẫn có stall; hotfix không tuyên bố khắc phục hạn chế đó.
