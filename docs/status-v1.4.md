# EVENTIDE 1.4.0-beta.1 · trạng thái triển khai

Nâng trực tiếp 1.3 theo prompts/EVENTIDE_Beta_1_4_Mastery_Evolution_Events_Prompt.md. Đã đọc spec/kiến trúc/cân bằng/assets/services và giữ snapshot1.3 tại artifacts/v14/baseline-source, baseline-benchmark, baseline-dist. Không thay framework/dependency, không sửa prompt MVP hoặc reset dữ liệu người chơi. Lịch sử1.3 tại status-v1.3.md/performance-v1.3.md.

## Kết quả gameplay và UI

- Tái hiện trên browser1.3: cấp31, Plasma/Pulsar/Ion đều5, draft chỉ có drones/well. Nguyên nhân availableUpgrades coi mọi module chưa max là hợp lệ dù đầy ô. Eligibility mới loại replacement khỏi draft/reroll; action acquire/level/support/mastery/recover được tách type, đổi vũ khí là nút chủ động riêng.
- Ba module5 mở mastery; mỗi lần200bp(+2%), tổng2000bp(20%/10pick). Damage/rate/HP/pickup trần riêng2000bp, speed1000bp. Cộng trên base cùng support/salvage, Corruption/event riêng; HP cộng current đúng delta. Hỗ trợ giữ cấp hiện tại, không giả max hoặc tiếp tục vào draft mastery. Hết budget có hồi tối đa10HP hoặc Tiếp tục, không penalty, giữ XP dư/queue và guard một action/draft. Swap chủ động mới mở lại progression, giữ bonus/budget; hủy/B/reroll/blur không reset.
- Catalog phân vai chính/phụ/bổ sung, không ép mỗi vai trò một ô. Plasma3/5 giữ chuỗi concept. Drones5→Orbital Bastion, Well5→Singularity Well là mở rộng beta, giữ ID/cấp/slot. Pulsar5+Ion5→Quasar5 qua Build/xác nhận, không tiêu level-up, atomic/cleanup owner/double guard; giữ mastery sau giải phóng ô và không đề nghị nguyên liệu khi còn Quasar. Quasar một behavior quạt240°/0,45s, tia phụ giới hạn/visited chung, không bật hai nguồn cũ.
- Radiation210–255s, chaos330–420s, tide465–510s; warning3s riêng. Một major owner, skip gravity thường khi bị chiếm, không queue bù; final630/632 giữ. Chaos recompute base×minute×event giữ HP ratio, boss miễn buff. Radiation chỉ tàu/quái thường, environmental final hit cùng dead guard/XP/loot/credit một lần. Tide lực sin hút/đẩy có cap, tâm an toàn, không kéo loot/đạn. Pause/draft/tab/result/restart dừng hoặc gỡ nguồn đúng lifecycle.
- Nền composite opaque1024² bake một lần cho mỗi quality, một TileSprite/256–112chấm mờ khác EXP/salvage;32SVG/atlas1024×512. Beacon pulse0,9Hz/charge thực và flash đỏ0,2s từ damage thật, trả đúng palette Core; không timer/tween mới. Low giữ hazard/telegraph/beam. QA phát hiện toast che indicator và tooltip support bỏ nguồn mastery/event ở next: đã sửa và kiểm tra lại.
- BossHP6000/3900→6900/4485(+15%), damage+10%, rate chọn+5% sau thử+10%; speed/telegraph/two-phase/aim-lock/ownership/thắng720 và ưu tiên defeat giữ. Profile vẫn schema3/keyeventide.save.v1, legacy1/2→3 validator giữ tiền/Core/Echo/settings/career/28ID; run/mastery/event không persist, không cần schema mới.

## Kiểm tra thực tế

Windows/PowerShell, Node24.21.0/npm11.19.0, TS5.9.3/Vite7.3.7/Phaser3.90.0/Vitest4.1.12/Playwright1.64.1/Chromium156. Browser ở .playwright, renderer headless ANGLE Vulkan SwiftShader software, không phải GPU vật lý. Các test dùng keyeventide.e2e.v1 riêng.

| Lệnh/ca kiểm tra | Kết quả |
|---|---|
| Baseline npm run typecheck; npm run test | Pass strict và83/83 trước sửa runtime. Dùng build1.3 đã đóng băng, browser tái hiện bug và lấy A/B baseline mới. |
| npm run test | Pass101/101,11file,40,10s trước sửa nền thuần presentation; gameplay không đổi. Bao gồm16ca beta +2playtest/TTK, hồi quy và các fixture lịch sử đóng băng. Có lần fail kỳ vọng replacement/autoheal/damage25 cũ; cập nhật theo thay đổi có chủ đích, không bỏ kiểm tra. |
| npm run build:benchmark | Pass strict/build, entryindex-BC9WlYb0.js,117,83KB/gzip41,69KB. Source51file tại final-measured-source có hash khớp. |
| npm run build | Pass strict/build. App106,96KB/gzip37,66KB; CSS14,95KB/gzip4,12KB. Phaser1208,06KB/gzip332,17KB còn warning chunk>500KB. |
| npm run test:v14 | Pass39/39,8,8phút trên C8ndbcxk; gồm33hồi quy và6beta (panels, fusion/mastery, capped queue/blur, events/lifecycle). |
| Browser các ca beta và draft swap | Dùng grep chọn7ca:7/7,1,9phút trên D1VFNgyB sau QA toast/tooltip/fast-forward. Full39 trước đó chạy trên C8ndbcxk. |
| npm run test:production | Pass1/1: D1=3,8s, BC9 cuối=3,1s; không hooks test/perf dù query, chỉ local request và chơi tiếp offline. |
| node scripts/generate-assets.mjs | Tạo32SVG thật/metadata CC0 local; fonts Noto/OFL cũ giữ. Không ảnh/audio rỗng hoặc network asset. |
| node scripts/capture-beta14.mjs | Đã xác nhận toast không chồng indicator bằng bounds và ảnh; Beacon mất6HP qua combat thật, flash rồi trả palette. Ảnh cuối/entry/error ở visual-qa-final.json. |
| Natural playtest/TTK |18ca fast-forward60Hz,12thắng, khôngfusion4/9 vàfusion8/9; không tăng HP/time/XP. Tất cả XP conservation và mastery≤2000bp, salvage không capHit. Chi tiết balance-v1.4.md. |
| Browser sau sửa nền |3/3 event/Quasar/High-Low lifecycle,49s trên BC9WlYb0; production1/1,3,1s; capture Beacon/toast khớp hash. |
| A/B cuối vàstress |Cùng1280×720/High/DPR1/seed20261016, warm10s/sample60s/một lượt: densep95 50,6→48,1ms/p99 60,4→57,4; endgame45,1→40,8ms/p99 54,9→47,6. Maxdense227,6ms: vẫn cóstall. Stresswarm5/sample30s: Quasar35,4/radiation35/chaos32,9/tide39,8ms p95. |
| Lượt render cuối | BC9WlYb0 thắng720s/725,44s wall, cấp34/kills1002/+17, HP128/Beacon300, XP3944=3648+296; profile17tiền/1win/1002career, errors0. Frame26,8/34,7/41,7ms median/p95/p99,89/26421frame>50ms; A/B60s vàstress có kết quả riêng ở performance-report. |

Sau các lỗi QA, nguồn/build trước sửa giữ ở pre-qa-source/pre-qa-benchmark; không trộn số đo khác hash. Kiểm thử fast-forward bổ sung cả trường cũ hết hạn trước nhánh skip/return. Source/gameplay giữ nguyên khi chạy đo cuối. node scripts/report-v14.mjs xác thựcpass:51sourcehash,31assetcũ,18naturalcase/XP/mastery, A/B+stress/caps/error/lifecycle và720swin/profile; measurement-validation.json partial=false. Cả SaveService vàProfileService khớp hash1.3, productionkhông __eventide.

## Sửa hồi quy nền

Lượt720s đầu D1VFNgyB thắng nhưng framep95=51ms; densep95=75,8ms trong khi SceneCPU thấp. Giữ raw/source/build trước sửa ở pre-background-fix-*. Gộp nền alpha ba Image thành tile opaque bake lúc boot. Audit30s cùng thời điểm: baseline1.3 densep95=48,5/p99=63,4ms, composite46,1/50,3ms. Đây là audit ngắn, A/B60s và lượt render cuối đo riêng. Không gán số lượt dài cũ cho nguồn mới.

## Giới hạn đã biết về hiệu năng

Trên SwiftShader vẫn cóframe spike (densemax227,6ms, endgame106,3ms; lượt720s89/26421frame>50ms). p95 chưa đạt mục tiêu20ms; không tuyên bố60FPS ổn định hoặc hếtgiật. Mỗi cảnh A/B mới cómộtmẫu60s, trước/sau khác gameplay theo beta nên không là replaybit-identical. Heap stress dao động theoGC;5vòngrestart giữtextures37/listeners48/DOM167/pool256, chưa đủ chứng minh khôngleak mọi đường hoặc soakdài. Đây là giới hạn hiện tại, không giấu như featurebacklog.

## Cách dùng và giới hạn

npm run dev → http://127.0.0.1:5173, hoặc npm run build rồi npm run preview →4173. Giữ host/cổng đã chơi để đọc đúng localStorage cũ. WASD/mũi tên bay,1/2/3 chọn, Esc pause, B/HUD xem Build; pause Esc vẫn không có nút Build. Sau ba module5 nhận mastery; Build có recipe/nút tiến hóa; Thay vũ khí trong draft có bước xác nhận mất cấp. Reload về menu, không resume run.

Hai ảnh tham chiếu063723/063728 không có ở Downloads/workspace: dùng state/ảnh tái hiện thật, không bịa đã xem. Đã xem ảnh mastery/fusion/radiation/tide/Beacon/toast và panel1024×576; zoom cũ là emulation. Chưa chơi tay đủ12phút, nghe đánh giá audio, native zoom, input-to-photon, GPU desktop, Firefox/Safari hoặc soak20–30phút. Bot/fixture không chứng minh cảm giác né hoặc tỷ lệ thắng người thật; không tuyên bố60FPS ổn định hay không leak mọi đường.

Đã mở ảnh kết quả lượt BC9:12:00/cấp34/1002kills/+17/Echo và nút chơi lại/menu đọc được. Toast thành tựu5s vẫn có thể che một phần mô tả kết quả như1.3 (không che nút); chưa chỉnh hành vi này. Dev5173 đã chạy vàHTTP200.
Smoke dev cuối tại5173 không query test: menu beta1.4/HUD hiển thị, debug=false/perf=false, pageerrors0; raw dev-local-smoke.json và ảnh dev-local-final.png.
