# EVENTIDE 1.4.1-beta.1 · trạng thái triển khai

Nâng trực tiếp beta1.4 theo prompts/EVENTIDE_Beta_1_4_1_Hotfix_Evolution_Progression.md (sao nguyên văn từ Downloads). Đã đọc AGENTS/spec/status/architecture/balance/assets/source. Không khởi tạo lại repo, không thay gameplay config/dependency/assets/save schema. Snapshot trước sửa artifacts/v141/baseline-source; nguồn cuối52file/fingerprint/build entry ở artifacts/v141/final-source và verification.json. Hồ sơ cũ [status1.4](status-v1.4.md)/[performance1.4](performance-v1.4.md) giữ lịch sử; luật mastery/latch cũ đã bị hotfix thay thế.

## Hai lỗi được tái hiện trước khi sửa

1. Plasma/Pulsar/Ion5, Hull1 + ô hỗ trợ trống, masteryDamage1800bp, pending2: draft thật đưa mastery-damage/mastery-speed/mastery-hp. ExperienceSystem.refreshMastery chỉ kiểm tra ba giá trị module5 rồi latch, bỏ qua support/ô trống và không reset sau fusion. Đây là luật cũ được yêu cầu thay thế, không đổi spec để hợp thức hóa lỗi.
2. Esc pause → B → click Tiến hóa sẵn sàng: GameUI.renderRead đặt fusion-confirm SAU toàn bộ Build/stat table. Trên1280×720, confirm y1995–2044 ngoài clip138–599, scrollTop0 và focusread-back; người dùng không thấy bước xác nhận. Sau khi Playwright auto-scroll rồi click confirm thật, commit Quasar5 thành công và time không đổi. Bằng chứng không ủng hộ giả thuyết queue/guard playing chặn commit trong fixture này. Test cũ locator.click tự cuộn đã bỏ sót lỗi khám phá action.

Bằng chứng trước sửa: artifacts/v141/reproduction/{baseline.json,early-mastery.png,hidden-confirmation.png}. scripts/reproduce-v141.mjs mặc định dùng preview beta1.4 frozen4194; không chạy vào hotfix rồi ghi đè baseline. Hai test mới được chạy đỏ trước sửa: vitest v141.test P02/P10 (mastery vẫn xuất hiện), Playwright E01 (confirm ngoài clip). Hai ảnh085054/085104 không có ở Downloads/workspace, dùng fixture tương đương từ mô tả, không nhận đã xem ảnh gốc.

## Luật và đường xử lý đã sửa

- core/buildProgress là nguồn duy nhất: đủ3module hợp lệ/max UPGRADES và đủ2support đã chọn/max SUPPORTS. Validate missing/null/sparse/ID/level/max; không lấy mastery budget làm completion. UI hiện occupied/maxed cùng3/3vũkhí và2/2hỗtrợ. weaponMasteryReached còn là snapshot derived tương thích debug cũ, không quyết định pool.
- Thiếu ô/level tiếp tục nhận/nâng cơ sở. Fusion giải phóng ô trở lại cơ sở, không đề nghị Pulsar/Ion khi đang có Quasar. Swap chủ động về1 cũng tính lại. Giữ bonus/budget đã kiếm; đủ lại chỉ nhận phần ngân sách còn lại. Ô cuối đạtmax không tự tặng mastery; draft kế mới chuyển. Capped/fullHP có thẻ Tiếp tục, không ép thay/reset vũ khí.
- Reroll dùng cùng eligibility, không alternate thì disable có lý do/không tiêu lượt. Stale commit/reroll refresh thẻ cùng draftId/pending/reroll và feedback, không apply +2% sai hoặc tiêu level. Pool cơ sở rỗng bất thường có dev report/fallback an toàn.
- Evolution: UI → GameScene đọc session hiện hành → GameSession.evolve → quasarEligibility/tryFuseQuasar. Recipe độc lập support/mastery, chấp nhận paused/choosingUpgrade, từ chối settled/swap/missing ingredient/output với lý do. Chuẩn bị output/cooldown/owner arrays/draft trước commit; prepare/registry/RNG lỗi giữ nguồn. Không framework factory mới vì behavior advancedWeaponStep/manifest/Boot fallback đã có. WeakSet/recipe guard chống action trùng.
- Confirm ở đầu read-content, focus vào nút thật; xử lý đồng bộ khi pause, không chạy simulation. Quasar5 cùng ô nguồn đầu, một ô trống; dọn Pulsar pulse/Ion trace, không hoàn damage/XP. UI lấy currentState ngay, thông báo thành công sau commit; buildRevision invalidate frozen WorldRenderer để dọn ảnh owner mà không tick time. Đóng B về đúng context; resume mới tạo Quasar pulse theo cadence.

Chín file source đổi/thêm ghi trong verification.json. SaveService/ProfileService/stats và toàn bộ config chiến đấu/32SVG/font/public đều khớp SHA256 baseline:48kiểm tra giữ nguyên. Schema3/keyeventide.save.v1, testkey riêng eventide.e2e.v1; legacy1/2→3 giữ tiền/Core/Echo/achievement/settings/career. Không có resume-run hoặc migration run mới.

## Kiểm tra thực tế

Windows/PowerShell, Node24.21.0/npm11.19.0, TS5.9.3/Vite7.3.7/Phaser3.90.0/Vitest4.1.12/Playwright1.64.1/Chromium156. Chromium headless ANGLE Vulkan SwiftShader software, không phải GPU vật lý. Sandbox chặn spawn EPERM lần đầu; đã chạy lại local tests với quyền phù hợp, không ghi pass cho lần bị chặn.

| Lệnh/ca | Kết quả thực chạy |
|---|---|
| Baseline hai test trước sửa |1unit +1browser fail đúng lỗi; state/ảnh/bounds được giữ ở reproduction |
| npm run typecheck; npm run build:benchmark |Pass strict; benchmark cuối index-BA-ds7lV.js, app121,75KB/gzip43,09; CSS14,95KB |
| npm run test -- --maxWorkers=2 |Pass117/117,13file,71,70s trên nguồn cuối. Gồm15ca v141, sáu natural runs và toàn bộ unit/integration/historical fixtures |
| npm run test:v141 |44/44,8,1phút trong đợt hồi quy hotfix C6k5wOGj→BA-ds7lV. Có rebuild guard definition-null ở cuối đợt, không coi cả44là một lần kiểm chứng cùnghash. Sau đó chạy lại toàn bộ ca hotfix trên bundle cuối như dòng dưới |
| npm run test:v141 -- tests/e2e/hotfix-v141.spec.ts |Pass6/6,1,1phút trên bundle cuối BA-ds7lV: click pause/resume3viewport, draft/stale/reroll, mutation/recipefail, bảy vòng fusionthật |
| npm run build |Pass strict/production index-C7wE2SBI.js, app110,72KB/gzip38,95. Phaser1208,06KB/gzip332,17 còn warning chunk>500KB |
| npm run test:production |Pass1/1,10,6s trên entry cuối: không __eventide/__eventidePerf kể cả query, chỉ local request, offline vẫn chơi |
| node scripts/report-v14.mjs |Pass xác minh nguồn frozen51file/31assetcũ/18ca/lượt render720s lịch sử; chỉ ghi performance-v1.4, không dùng để chứng nhận hotfix |

Các lần fail trong quá trình sửa được phân biệt: kỳ vọng mastery/support/latch và cancel giữ thẻ stale cũ được cập nhật theo luật mới; bot adaptive seed42 không còn mặc định thắng. Unit mặc định nhiều worker cạnh tranh với Chromium làm parity lịch sử timeout20s; không tăng timeout/đổi luật, chạy nguồn cố định với2worker đã pass. Một lần browser dev mất execution context vì HMR lúc đang sửa; kiểm tra lại trên static preview. Không có lỗi test cuối được bỏ qua.

## Click thật và playtest

Ảnh/state/bounds ở artifacts/v141/visual. Tại1024×576/1280×720/1920×1080: click B từ pause, confirm nằm trong clip và có focus TRƯỚC click, doubleclick tạo đúng một output. Time/player/enemies/charge/event/Corruption/support/salvage/XP/pending/draft/reroll không đổi qua pause/commit. Quasar5 hiện ngay, ready cũ mất; đóng về pause rồi bấm Tiếp tục thật. Không dùng debug.advance để chứng minh weapon sau resume. Quasar gây510,048HP với power5/haste1/gearDamage10%/masteryDamage18%/Corruption/chaos, đúng220×1,68×1,2×1,15; Pulsar/Ion metrics không tăng. Reopen không recipe duplicate. Bảy vòng fusion thật (2warm+5mẫu) giữ textures37,sceneListeners48,DOMlisteners167,pool8; menu không pulse/trace/timer/tween. Raw fusion-lifecycle.json.

Sáu lượt tự nhiên fixed60Hz tăng tốc (seed7/42/104, Hull/Armor, fusion có/không) đều thắng720s/+17, HP/XP/time không cấp thêm; Hull5/Armor5 đúng, fusion lấp ô bằng Well5. Mọi draft mastery đủ/max5ô, XPconservation vàbudget≤2000bp. Mastery mở khôngfusion~519–527s, fusion~622–650s thay vì272–296s của luật cũ. Đây không phải win-rate người thật. Chiến thuật riêng Plasma/Drones/Well seed42: đứngBeacon thua570,75s/rìa38,817s/adaptive718,733s; giữ thất bại thật, không retune để ép thắng. Xem [playtest1.4.1](balance-v1.4.1.md), natural-playtest.json và strategies.json.

## Cách chạy và giới hạn

npm run dev → http://127.0.0.1:5173; hoặc npm run build rồi npm run preview →4173. Giữ cùng host/cổng đã chơi để đọc profile cũ. Esc pause → B → Tiến hóa sẵn sàng → Xác nhận ở đầu panel → B về pause → Tiếp tục. Mở từ draft trở về đúng draft/reroll. Mastery chỉ khi đủ/max cả3vũkhí+2hỗtrợ.

Áp patch bằng reload sau khi kết thúc/bỏ lượt. Reload về menu vì game không lưu run dang dở; profile giữ, không sửa/xóa localStorage. Trong session mới, mutation giữ XP/bonus/reroll như đã test; không tuyên bố khôi phục run trước reload.

Chưa chơi tay đủ12phút/audio, native zoom/GPU thật/input-to-photon/Firefox/Safari/soak20–30phút. Không benchmark FPS hoặc lượt render720s mới cho hotfix; sáu lượt dài là tăng tốc, kiểm tra sau resume chỉ vài giây clock thường. FPS cũ ở performance-v1.4 chưa đạt p95~20ms, vẫn cóstall; không gán cho build mới. Toast thành tựu5s có thể chạm/che phần mô tả panel/kết quả như giới hạn cũ, nút confirm/resume không bị che trong ca đã kiểm tra. Bounded lifecycle không chứng minh hết mọi leak. Không có lỗi chức năng bắt buộc đã biết còn tái hiện sau bộ kiểm tra này; các giới hạn trên chưa được chứng nhận.

Server dev5173 đã có sẵn: thử mở instance thứ hai với strictPort báo port đang dùng; không dừng server đó. Kiểm tra HTTP200 ở /src/game/ui/GameUI.ts xác nhận footerbeta1.4.1/currentState hiện hành. Có thể mở ngay http://127.0.0.1:5173.
