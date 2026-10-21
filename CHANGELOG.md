# Chuẩn bị phát hành beta1.0.0 · 2026-10-21

- Gom các đợt visual identity, UI/hazards/multi-boss và UX/stability đã hoàn thành local vào lần cập nhật GitHub theo yêu cầu người dùng. Giữ version/base/save; không thêm thay đổi gameplay trong tác vụ push.
- Kiểm tra lại remote main5fbac8a; typecheck/build pass, unit149pass/4opt-in skip và production smoke local2/2pass. Trạng thái CI/deployment công khai được ghi tại [triển khai](docs/DEPLOYMENT.md).

# Next beta UX/UI/stability · hoàn thành local trước phát hành · 2026-10-21

- HUD ba mức có hysteresis, chữ/icon HP thấp, Corruption cảnh báo trước ngưỡng và đúng cả lợi/hại; Beacon nhãn bị đánh2s/cue rate-limit1s/hướng nguy cấp. Không đọc lại HP/timer mỗi frame.
- Balo tổng quan năm ô, recipe/CTA trong phần đầu, chỉ số gọn và nguồn mở rộng. Draft2–3so sánh từ calculator thật, chi tiết riêng, giữ slot/mastery/XP/reroll/atomic fusion. Focus trap/restore và scope phím tắt cho input/select.
- Ba tutorial tình huống có queue, hoãn danger/modal, seen sau hiển thị, skip/tắt/xem lại riêng. Save schema3/key/meta cũ giữ, thêm hai trường default; không reset tiến triển.
- Kết quả giữ build cuối, goal/achievement thật, incoming/outgoing HP thực sau giảm trừ/clamp overkill, fatal theo nguồn/owner/channel, cùng chết ghi cả hai. Snapshot/deep-freeze trước cleanup, reward một lần; tối đa một nhận xét từ damage Beacon ở xa.
- Giữ hazard/scaling/Quasar/boss/pool/render/XP ledger/asset và balance đã tune. Không đổi dependency/concept hoặc thêm cứu hộ. Số đo >100ms và telemetry CPU riêng; playtest12cặp cùng seed trước/sau có kết quả giống nhau. Bằng chứng cuối/giới hạn ở [báo cáo](docs/next-beta-ux-report.md) và [status](docs/status.md).
- Kiểm tra:153unit gồm opt-in pass,66ca E2E xác minh (63lượt đầu +3chạy lại sau đổi assertion layout), production2/2pass. Bot render720s thắng/không lỗi JS, vẫn còn boss cuối sống; chưa gọi là chơi tay.
- Frame SwiftShader: dense p95 trước33,7–33,8ms → sau34,5–35,4ms; chưa đạt20ms/60FPS và chưa chứng minh tăng FPS. Giữ toàn bộ14lượt đo/AB–BA/Low/reduced cùng source hash, không dùng số lịch sử để chứng nhận build mới.

# UI / hazards / multi-boss · local, chưa phát hành · 2026-10-18

- Truy cung vàng tới hai pseudo tiêu đề và bỏ đúng phần trang trí không nhãn; giữ vòng Beacon/progress/focus. Ví Stardust lên header, nút Core có keyboard/focus, số thật và feedback giao dịch; responsive390px.
- Radiation190u/7HP/s khóa warning theo tuyến tàu, timer nguồn độc lập contact; Tide440u/140u/s/falloff sqrt/cap78% tốc thật, hướng/cue/arrow từ simulation, Low/reduced giữ cảnh báo. Corruption và lịch thiên văn/final giữ.
- Scaling tuyến tính HP/damage theo phút: Wisp10/7%, Drifter14/9%, Leech16/10%; giữ ratio/target/cooldown và Chaos một lần. Quasar510→398u đồng bộ beam/chain, damage/cadence/Ion độc lập giữ.
- Lịch boss540/660 seeded không lặp; mọi phase/timer/beam/zone/reservation theo owner, slot ngoài cap thường, HUD hai hàng. Thêm Gravemaw/Helion/Harrier hai phase và ba SVG CC0. Dash swept/lock/từng chặng, solar zone hữu hạn, budget trước telegraph, transition/reward/cleanup độc lập.
- Playtest vòng đầu cho TTK quá ngắn; chỉnh riêng nhóm HP boss10000/9800/9200/9000, boss660×0,8; giữ phase2ratio0,65. Raw khởi đầu/final, các build thất bại và giới hạn trong docs/ui-hazards-multiboss-report.md, không tuyên bố đã cân bằng người thật.
- Gom source systems/bosses–hazards–enemies; scripts assets/performance/qa, config/playwright và docs/history; sửa đường dẫn. Canonical prompt/192fixture cũ/32SVG nền/save/clock/XP/evolution/lockfile giữ byte theo audit. Giữ beta1.0.0 và /EVENTIDE/, không push/deploy.

# Visual identity · local, chưa phát hành · 2026-10-18

- Thủy triều tinh vân bake/cache liền mạch, parallax/twinkle/dust hữu hạn; một tile opaque giữ tối ưu overdraw. Beacon lõi vàng/vòng đứt đoạn/tiến độ thật, critical shape và hit120ms; năm SVG Nova/Core cải tiến nguyên bản CC0, Beacon raster128 không đổi hitbox.
- Đồng bộ menu/HUD/Balo/draft/Core/catalog/achievement/settings/results; gom thông báo tránh tâm giao tranh, toast trong flow, card/max/empty/recipe rõ, responsive390px và giữ keyboard/focus/scroll.
- Tàu bank/engine/trail ngắn không trễ vị trí; hazards boss riêng layer, hai biên theo collider; Pulsar đúng halfWidth, Ion path thật, Quasar/Bastion/Singularity theo state. Không đổi số cân bằng/thuật toán gameplay.
- Ba quality Cao/Vừa/Thấp, Giảm chuyển động/OS default và shake riêng; giữ profile cũ/schema3, chất lượng đã chọn/XP/bonus/queue/reroll/mastery. Adaptive chỉ giảm decoration với hysteresis và cleanup hữu hạn.
- Baseline/ảnh/clip/benchmark local, regression/production và giới hạn thực tại docs/visual-identity-report.md, docs/status.md; design tokens/budget tại docs/design-system.md. Không commit/push/deploy theo yêu cầu.
- Đo phát hiện cung đứt đoạn tạo nhiều vertex: thay ARC100đoạn bằng polyline sai số≤0,35u/cap128, giữ endpoint/radius; probe xác nhận vertex giảm, không phải tăng draw/program switch. Giảm phế tích khi dense, bỏ shadow HUD và guard tilePosition khi pause; số đo trước tinh chỉnh được giữ riêng, không ghi đè bằng chứng.
- Dư ảnh boss hủy ngay nếu tia bị dọn sớm khi chết/chuyển phase; chỉ fade120ms sau kết thúc hợp lệ, không hiện lại theo end cũ. Regression chuyển phase thật và positive fade trong pause.

# beta1.0.0 · bản phát hành GitHub Pages · 2026-10-17

- Đổi nhãn public từ hotfix1.4.1 thành beta1.0.0 (package1.0.0-beta.1), không quay lại gameplay cũ hoặc đổi save schema.
- Base /EVENTIDE/, favicon theo BASE_URL, CSS/font/Phaser asset kiểm tra dưới subpath; giữ WebAudio sau tương tác.
- Thêm workflow Pages pin SHA: npmci/typecheck/unit/build/productionbrowser, uploaddist và deploy sau build.
- Đưa snapshot nguồn regression vào tests/fixtures/history để checkout sạch chạy CI; ignore mọi output/cache/.env và giữ lockfile. Tài liệu triển khai tại docs/DEPLOYMENT.md.

# Beta1.4.1 · hotfix Evolution/Progression · 2026-10-17

- Sửa xác nhận tiến hóa bị giấu cuối Build: đưa vào đầu vùng cuộn/focus, kết quả rõ và cập nhật Quasar5 ngay trong pause. UI/action dùng cùng recipe; prepare trước commit, lỗi giữ nguyên liệu, dọn source cũ và invalidate frozen renderer bằng revision.
- Thay luật mastery ba module/latch bằng đủ3module max và đủ2support max. Fusion trốngô/swap về1 trở lại cơ sở; giữ bonus/budget đã kiếm. XP dư/queue/draft/reroll giữ; stale card refresh không tiêu pick, không reroll khi pool không có alternate.
- Thêm regression P01–P12/E01–E10, click thực3viewport/resume damage, playtest tự nhiên và hồ sơ phiên bản riêng. Không đổi damage/TTK config, event/boss/asset/save schema/dependency. Kết quả kiểm tra thực tế ở docs/status.md.

# Changelog

## 1.4.0-beta.1 · 2026-10-17

- Sửa pool buộc đổi vũ khí khi cả ba cấp5: replacement thành action chủ động; mastery200bp/pick, tổng2000bp, source riêng và fallback phục hồi/skip có guard queue. Không reset hỗ trợ/gear/save.
- Vai trò module, Bastion/Singularity cấp5 cùngID; Pulsar5+Ion5 hợp nhất atomic thành Quasar5, giữ latch/draft/achievement, cleanup nguồn và hit-visited chung.
- Radiation210/chaos330/tide465 có warning/lifecycle/arbitration, minute×event giữHP ratio, môi trường credit/loot đúng một lần, pause/result/reset gỡ nguồn.
- Nền composite opaque1024² bake lúcboot choHigh/Low, sao khácXP,32SVG CC0/atlas1024×512; Beacon pulse0,9Hz/flashđỏ0,2s từdamage thật. Toast tránh che event; Low giữ telegraph.
- BossHP6000/3900→6900/4485, damage+10%, rate+5% sau thử+10%; telegraph/speed/two-phase/win720 giữ. TTK/playtest/limits trong balance-v1.4/status/performance-report. Dependency/schema3/key/28achievement/Core không đổi.


## 1.3.0 · 2026-10-17

- Chỉ bỏ Build khỏi pause Esc, giữ B/HUD/draft; chỉnh bảng/formatter tiếng Việt,28 thành tựu tổng cộng với filter/nhóm, header/footer không che card cuối. UI không còn mô tả flush/crash kỹ thuật.
- Beacon Core có bốn model SVG dùng chung menu/world, so hiện tại/sau nâng cấp, bảng chỉ số và ví/thiếu tiền cạnh nút. Purchase guard expectedLevel/currency/max, giữ snapshot RAM khi storage lỗi; core vẫn giá10/20/30 và HP300/330/360/390, áp từ run mới.
- Schema3 cùng key production; giữ tiền/Core/Echo/settings/character/career và năm ID cũ. Metrics achievement theo credit thật, best-run/timer/result idempotent; không bịa lịch sử mới từ Echo/tiền hoặc trao stat/tiền huy hiệu.
- Thay curve quái1.2 bằng minute scaling tuyến tính HP/damage theo base, max11phút; giữ HP ratio của quái sống, không tăng speed/cooldown/spawn/cap hoặc buff boss theo phút.
- Salvage pickup thật50/100bp, tổng run≤2000bp, speed≤1000bp; năm stat không giáp, additive với support, không chiếm slot/lưu profile. Drop rate/TTL30s/cap32/collect và counter rõ; giữ nguyên XP ledger.
- Ship turning shortest-angle/thruster presentation, giữ camera/position/collision/input không quán tính. Thêm Pulsar quét sector một hit/pulse và Ion chain visited/falloff/path snapshot, cấp1–5/catalog/Build/HUD/tooltip; có đổi từng ô về cấp1 và owner cleanup, cancel giữ draft/reroll.
- Ion cấp cao tăng damage/falloff sau TTK fixture; không đổi HP boss. Sáu asset CC0 mới, atlas29entry1024×512; giữ fonts/audio/pool/culling, không dependency/hosting mới. Playtest/perf/giới hạn ở docs, không suy cân bằng người thật hoặc60FPS từ headless.

## 1.2.0 · 2026-10-16

- Phi thuyền, Danh mục nâng cấp, Build hiện tại/phímB và Thành tựu dùng registry/selector chung. Nested panel giữ draft, reroll và lý do pause khi ẩn tab; UI Việt, focus/scroll theo1.1.
- Sáu hỗ trợ/cấp5, tối đa hai loại: power/rate8% mỗi cấp (trần40% sau playtest), Hull/nhặt10% (50%), bay5% (25%), giáp4 điểm% (20%). Bonus cộng base; rate chia interval Plasma/Well/drone; support/Corruption tại hit, không cap nhầm tiến hóa.
- Mỗi draft một reroll, ID chặn click cũ/double action; nhiều level giữ XP dư và ngân sách độc lập. Pool rỗng hồi10HP một lần/pending.
- Career kills và năm huy hiệu badge-only, commit delta death đã xác nhận, snapshot5s/lifecycle/milestone. Schema2 cùng key cũ, migrate tiền/Core/Echo/audio/quality, không suy kill lịch sử từ tiền.
- Tăng HP/speed/damage quái qua snapshot spawn có giới hạn, giữ XP/radius/spawn/cap. Elder phase1=6000HP→transition1.25s→phase2=3900HP; phase1 không kill/drop, phase2 có fan và nhịp nhanh hơn. Tia aim→khóa0.25s→fire, nguồn/collider theo boss hiện tại, ownership cleanup.
- Giữ font/cache nền/pool/culling/nội suy/XP ledger/audio cleanup1.1; thêm bốn icon CC0, không dependency/framework mới. Playtest seeded và báo cáo TTK/hiệu năng tại docs; chưa gọi là cân bằng đã xác nhận bằng người thật.
- Bảo đảm boss không sinh chồng tàu đứng tại điểm xuất hiện mặc định, có contact grace3s trước đợt đầu. Reset có xác nhận nêu rõ cả career kills/thành tựu.

## 1.1.0 · 2026-10-16

- Sửa typography Việt bằng Noto Sans/Serif local OFL, tokens/layout/focus thống nhất, kiểm tra font lỗi/đến muộn, Canvas glyph và viewport/zoom/DPR.
- Vẽ lại Nova/Hollowborn/Elder, thêm đạn riêng cho Plasma/Mini Sun/Supernova/địch và tier XP; atlas/cache nền, sprite pool/culling, nội suy tàu/camera không đổi collision.
- Well/môi trường có streak xoắn vào tâm, radius thật và phase warning/active/end; quality Cao/Thấp có budget, tương thích saveVersion1.
- Tách PickupSystem: merge cục bộ theo age, ledger hữu hạn, conservation counters, bảo vệ homing/biên nhặt. Sửa cap MVP từng chuyển loot mới tới orb xa có sẵn; giữ lượng XP và luật nhặt.
- Giảm cấp phát combat và DOM/HUD; sửa voice/onended treo khi audio suspend, reset interpolation khi pause/resume.
- Giới hạn backing canvas nền theo viewport/cuộn UV, sửa footprint lớn ở bản thử và thêm hồi quy resize.
- Giữ nguyên mọi số gameplay trong balance/content; đối chiếu combat đủ720s, lưu baseline, thêm scenario/perf sampler chỉ DEV/test, báo cáo trước/sau và lifecycle/visual QA. Không hosting.

## 1.0.0 · 2026-10-16

- Tạo MVP local TypeScript strict/Vite/Phaser3 từ baseline tài liệu.
- Vòng chơi720s, Beacon, Corruption, XP/upgrades, ba module/tiến hóa, quái/boss, gravity, UI Việt, save/core/Echo, SVG/audio nguyên bản.
- Tạo Vitest/Playwright, mô phỏng đủ720s với stats chuẩn và chiến thuật có thể thắng; bổ sung cấu trúc tài liệu yêu cầu.
- Sửa guard HP0 trước hồi máu sau browser check; giữ defeat ưu tiên victory cùng tick.
- Giữ BUILD_MVP gốc, sao prompts/BUILD_MVP.md; không hosting.
