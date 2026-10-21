# Quyết định triển khai · 2026-10-16

## Visual identity local · 2026-10-18

- Giữ Phaser/DOM và beta1.0.0, không commit/push/deploy theo lệnh người dùng. Snapshot prompt riêng trong prompts, không sửa prompt MVP. Baseline nguồn/build/ảnh/đo trước nằm artifacts/visual-identity, hồ sơ phát hành trước chuyển status-deployment.md.
- Chọn SVG/hình học procedural nguyên bản CC0 thay asset tải mạng; cải tiến năm ảnh hiện có. Nền vẫn một tile opaque vì bằng chứng hồi quy alpha-overdraw trước đó; thêm tier Vừa bake tĩnh, không thêm engine/dependency/filter. Lát cắt đầu lộ seam gradient và dải Bézier quá cứng; thay bằng base đều và cloud/ellipse wrap khi bake, đã chụp lại.
- Menu clock hình ảnh riêng chỉ cho render, clamp khi ẩn/hiện; world FX vẫn simulation time. Tàu không smooth vị trí; bank/rotation/engine không tác động hitbox hoặc targeting. Hazard depth riêng với hai biên theo collision, cảnh báo giữ ở Low.
- Tier Vừa là mặc định profile mới; giữ Low/High của người cũ. Không bump schema3 hoặc reset meta. Motion fallback từ reducedEffects cũ; OS chỉ mặc định profile mới, explicit saved false vẫn thắng OS. Một rail HUD và toast trong flow giải quyết chồng thông báo, không dựng DOM/timer cho từng kill.
- Adaptive chỉ giảm decoration với hysteresis >75quái/>110đạn, hold2s và phục hồi dưới50/80; không sửa chất lượng mô phỏng hoặc dữ liệu projectiles/pickup. Thiết kế/budget và giới hạn đo ở design-system/visual-identity-report, không tự đặt mốc60FPS là pass khi headless còn chậm.
- Số đo đầu dao động p95dense43.2/48.2ms, endgame40.2/39.7ms; giữ source/build/raw trong pre-render-batching và chạy control baseline. Giả thuyết đổi pipeline không được probe xác nhận (draw1, program switch0 ở fixture pause). Đọc đúng Phaser3.90 thấy ARC dùng iterStep.01 bất kể độ dài cung. Chọn polyline sai số dây cung0.35u/cap128 thay vì sửa engine/shader; unit chứng minh sai số/giới hạn, WebGL probe xác nhận vertex14355→4107 dense và13176→3780 endgame. Không quy mọi biến động frame-time vào một nguyên nhân; báo raw trước/sau và control riêng.

## 1.2 — Progression/Stats/Boss

- Giữ repo/dependency1.1, snapshot nguồn/build tại artifacts/v12/baseline-source/baseline-benchmark/baseline-dist; prompt1.2 sao nguyên văn vào prompts, không sửa BUILD_MVP hoặc prompt1.1. Không hosting, account, nhân vật/map/module mới.
- Giữ stable ID hull/magnet, thay bảng cấp có chủ đích từ ba cấp flat sang năm cấp percent base. Sáu support chung pool, chỉ hai loại/run; không thêm ô inventory. Power/rate chốt8%×5=40% sau thử combo, không tăng vượt trần đề xuất. HP/pickup50%, speed25%, armor20% giữ đề xuất. Công thức và phép thử ở stats.ts/progression.test.ts; min interval0.12s nằm config, không chạm ở cấp hiện hành.
- Calculator dùng chung runtime/menu/catalog/build; cache theo nguồn, không save derived stats. Core chỉ Beacon, không invent permanent bonus Nova. Damage support/Corruption tại hit; base module projectile/Well snapshot tại spawn. Deadline cooldown hiện hành không rescale; chu kỳ mới dùng rate. Drone hit cooldown chia rate theo từng mục tiêu; duration/telegraph không chia.
- Mỗi pending cấp là draft riêng với draftId và một reroll. Thay toàn bộ nếu đủ fresh candidates; nếu thiếu, thay tối đa, điền hợp lệ và đại diện hai nhóm khi có thể. UI action gửi draftId; source guard chặn stale click. Pool rỗng heal một lần/pending. Không banish/khóa thẻ.
- Read stack trong GameUI, gameplay phase vẫn playing/choosingUpgrade/paused. Open Build từ playing tự pause, close tự resume chỉ khi không có blur/ẩn tab; external pause hủy quyền auto-resume. Từ draft mở nested catalog/achievement chỉ đọc, trở về đúng choices/reroll. Không build DOM/tooltip mỗi frame.
- Profile theo tổng confirmed kills, không theo hit/sprite recycle. Ledger WeakMap RunState→lastCommittedKills, snapshot RAM rồi save có budget; result không cộng lại. Milestone badge-only stable IDs100/500/1000/2500/5000, một toast hữu hạn. Autosave5s simulation và flush pause/pagehide/menu/end/milestone. Crash có thể mất đoạn chưa flush; retry không cộng delta lần nữa.
- Save schema2 giữ production key eventide.save.v1 và test key riêng. V1 giữ currency/Core/Echo/settings, career0 vì chưa có nguồn lịch sử; không hoàn tiền các support run cũ vì1.1 không checkpoint run. Mốc validate từ career, unknown character về Nova đang có. Không reset tiến triển hợp lệ.
- Enemy stats snapshot theo progress giới hạn, không nhân HP/speed đang sống. Tăng Wisp vừa đủ không còn chết một phát Plasma1, Drifter chịu đòn cuối tốt hơn, Leech giữ áp lực tốc độ; XP/radius/spawn/cap/target share không đổi. So TTK và ba cặp support ở balance-v1.2.
- Boss giữ cùng entity/id qua hai phase. Phase1 HP0 miễn damage trong transition1.25s, không overkill/kill/loot. Phase2 riêng65%HP, speed/rate×1.18 và damage×1.08; pattern fan hữu hạn. HP1 được thử4200→4500→6000; preset giữa màn cuối61–80s, full burst/defense có thể ngoài mục tiêu60–110 theo uptime, không hardcode boss chết hoặc buộc hạ để thắng.
- BossLifecycle tách cleanup để tránh circular import; mark owned bullet TTL0 rồi compact, beam/fan dọn tại transition/final death. Aim cập nhật đến lock0.25s cuối, active giữ hướng, origin theo boss+muzzle30u. VFX nội suy origin cùng owner, collider dùng world authoritative; không camera-space hoặc parent đạn bay vào boss.
- Giữ1.1 pool/culling/font/ledger/audio budget. Fixture endgame1.2 dùng120 đạn nền thay160 để vũ khí tốc cao thực sự có slot bắn; báo cáo khác biệt workload với1.1, dùng dense cùng120 để đối chứng gần hơn. Stress gameplay riêng có172 phát/peak56<160 chứng minh cap thật không bóp tooltip. Không lấy một số FPS suy thành input-to-photon hoặc GPU desktop.

## VNext 1.1 — UI/UX và hiệu năng

- Giữ repo, Phaser3.90.0/Vite7/TypeScript5, không nâng dependency major. Trước sửa lưu nguồn và build tại artifacts/vnext/baseline-source và baseline-dist; build baseline có probe riêng tại baseline-benchmark. Prompt VNext sao nguyên văn vào prompts; BUILD_MVP không sửa.
- Source UTF-8/NFC/langvi đã đúng, không có bọc chữ theo code unit. Ảnh pause build cũ thật tái hiện dấu tách. Thay phụ thuộc Georgia/Segoe hệ thống bằng Noto Sans/Serif local, weights thật, license OFL; chỉnh tracking/line-height/padding và tokens. Không kết luận mọi lỗi dấu là mojibake. Không có Canvas Text trong gameplay; thêm factory và mẫu QA thực qua Phaser.
- Baseline đã cap pickup220 và không có pickup physics/tween/emitter; không phải mảng XP tăng vô hạn. Phát hiện lỗi khác: cap cộng loot mới vào orb bất kỳ gần nhất nên chuyển XP xa điểm quái chết. Thay bằng merge cục bộ+ledger hữu hạn, không expiry/auto-award; bảo vệ biên nhặt và orb homing. Đây là sửa representation/locality theo prompt, có thể đổi kết quả chiến thuật mà không đổi lượng XP hoặc công thức level.
- Ground XP có sổ created/collected riêng, không suy từ XP tiến độ/Leech. Ledger57×57 cell64, active220, không overflow theo lịch sử. Materialize khi mọi bounds đã vào tầm hút; marker ngoài camera/near-player độc lập cap visual. Không thêm physics engine cho orb.
- Ca biên nhường slot cùng cell: phải detach cell đã kiểm tra trước khi evict orb available, nếu không giá trị/bounds có thể bị gộp thêm sau kiểm tra và thưởng XP ngoài radius. Đã sửa chuyển giao theo hai bước, có rollback nếu chưa có slot; orb available ngoài radius có thể nhường chỗ cho XP thật sự ở gần. Có unit và browser regression, không chỉ test tổng XP.
- Render: bake starfield/light/atlas, Image pool640, cull presentation nhưng giữ AI/damage ngoài camera, HUD cache ID/fingerprint. Nội suy previous/current tàu/camera/quái/đạn cùng alpha, float authoritative giữ nguyên; reset previous khi pause/resume. Không camera smoothing mạnh, không throttle input hoặc giảm spawn.
- Đo heap tìm thấy hồi quy ở bản thử cache nền: TileSprite5200×5200 vẫn cấp backing canvas lớn ngay cả WebGL (source Phaser3.90 xác nhận), làm heap tăng khoảng100MB. Sửa thành TileSprite theo viewport/cuộn UV; lưu các mẫu trung gian ở after-pre-viewport-fix-{1,2,3}, đo lại toàn bộ AFTER bằng build cuối. Không dùng các mẫu trung gian làm kết quả bàn giao.
- Mọi gameplay value trong balance/content giữ SHA256 giống baseline. Combat full720s cùng input/seed/đầu vào XP cho kết quả giống trước. Chỉ tránh vector/copy/array allocation không cần thiết; chưa thêm combat grid vì CPU chưa là bottleneck chính.
- High/Low chỉ budget hình ảnh; không đổi range/force/loot/hitbox/AI/cooldown hoặc elapsed time. Thiếu quality trong saveVersion1 mặc định High, giữ mọi field cũ hợp lệ. Key save thường không đổi, tất cả benchmark/e2e dùng key riêng.
- Lifecycle test tìm thấy SFX/callback còn đợi khi suspend. Dừng voice và tháo onended tại pause/menu, giữ context/ambient có cap; sau warm-up năm vòng giữ117 DOM listeners,48 scene listeners,24 textures,pool300 ở workload đã thử. Không suy ra hết mọi leak từ một snapshot.
- Đo: bản build tối ưu qua preview, instrumentation chỉ mode benchmark/DEV rõ ràng, không HMR; metrics có cap. Exploratory3 lượt cho thấy GPU backend SwiftShader với Scene CPU thấp hơn nhiều frame interval. Đối chứng Canvas bằng cờ Chromium phân biệt backend; không thay renderer mặc định để làm đẹp số. Báo cáo riêng thay đổi art/quality và giới hạn môi trường.
- Fixture controlled giữ tổng XP bằng nhau, cùng seed/hàm input/cap quái/đạn; HP lớn/max module chỉ để giữ workload, không dùng làm bằng chứng game dễ/thắng. Bot stats chuẩn và lượt render720s được ghi riêng. Mỗi benchmark warm10s/sample60s, chạy browser tuần tự để tránh nhiễu lẫn nhau.

## Lịch sử baseline MVP

- Ban đầu chỉ có AGENTS/GAME_SPEC/README/BUILD_MVP root và concept. Không docs/prompts/code. Giữ AGENTS/concept/prompt gốc; tạo docs và sao nguyên văn prompts/BUILD_MVP.md để khôi phục đường dẫn. Không xóa file người dùng. GAME_SPEC giữ các luật, chỉ bổ sung hiện trạng.
- Chọn Phaser3.90.0 đúng yêu cầu major3 dù npm đã có major mới. Cài Vite7.3.7/TS5.9.3/Vitest4.1.12/Playwright1.64.1 và lockfile. Đọc metadata engines thực tế: Node22.12 nhánh22 hoặc >=24; môi trường này24.21.0/npm11.19.0. Không framework UI phụ.
- Fixed1/60s, tối đa6 bước/frame, clamp0.1s. Máy chậm làm mô phỏng chậm, ưu tiên không burst damage/không bù lúc rời tab. Reset clock khi pause/chuyển lượt.
- Gộp menu/result vào GameUI trong GameScene, BootScene riêng. Không tạo scene/system rỗng để khớp cây dự kiến. XP/upgrade chung system, Corruption/pickup cùng environment, event gravity/boss cùng spawn. GameScene điều phối, luật thuần kiểm thử riêng.
- Số thiếu chọn ở config: map1800/light600/tốc200; hỗ trợHP+25/pickup+35; XP10+6/cấp; module/enemy/wave/boss/gravity/cap có bảng balance. Là baseline kỹ thuật, chưa coi cân bằng qua người thật.
- Plasma3/5 cùng ID/slot, nổ thay damage trực tiếp. Drone cooldown theo từng mục tiêu của module. Pull tuyến tính có cap, tại tâm vector0.
- Hướng Beacon25% theo kỳ vọng, Leech chỉ săn tàu. Marker tam giác vàng. Boss thêm slot ngoài110 thường. Cap đạn160 giới hạn viên, không phá cooldown.
- SVG nguyên bản thay raster/tải ngoài: nhỏ, dễ sửa, silhouette rõ, CC0. Audio tổng hợp nguyên bản không placeholder file.
- Save validate version/type/range; bộ nhớ nếu storage chặn. Không resume/reward khi reload. settled bảo vệ kết quả, paid bảo vệ side effect. Debug chỉ DEV+e2e/save key riêng.
- Browser phát hiện HP0 đầu tick được hồi trước resolve: thêm guard đầu step, vẫn xử lý damage rồi defeat trước victory cuối step. Thêm regression test; không sửa spec để chấp nhận hồi sinh.
- Chưa pool logic/spatial index vì cap vừa phải; renderer tái dùng spriteID. Chưa đo FPS desktop/nghe audio bằng tai, không công bố tối ưu60FPS.

## Beacon/Loot/Weapons 1.3 · 2026-10-17

- Giữ repo và dependency; source/build 1.2 tại artifacts/v13/baseline-source/baseline-benchmark. Sao nguyên văn prompt 1.3, giữ BUILD_MVP và lịch sử. Bốn ảnh có tên trong prompt không có ở workspace/Downloads: đối chiếu runtime và ảnh game thật, không bịa đã xem ảnh tham chiếu.
- Chỉ bỏ nút Build trong Esc, giữ B/HUD/draft. Header/footer nằm ngoài một vùng cuộn. Ảnh QA đầu cho thấy lý do thiếu tiền nằm khuất, đã đưa cạnh nút mua. UI chỉ nói lưu trên trình duyệt; flush/crash giải thích trong docs.
- Đúng 28 thành tựu tổng cộng, giữ năm ID cũ. Schema3 cùng key, giữ unlocked/career/meta/settings; metrics mới mặc định0. Đánh giá Core/career từ dữ liệu thật, không toast khi load. Các systems ghi credit death/source/evolution/phase/collect/heal; ProfileService commit delta/best/result có guard và budget ghi5s/lifecycle. Cosmetic-only.
- Minute scaling tuyến tính từ base, clamp11, cập nhật quái sống giữ HP ratio. Bỏ curve progress và speed growth cũ; không chồng curve. Spawn/cap/role/contact frequency và boss6000/3900/two-phase/win720/defeat priority giữ nguyên.
- Salvage50/100bp, tổng2000bp và speedcap1000bp, riêng nguồn hỗ trợ. Drop chọn stat còn hợp lệ, collect validate lại/clamp phần thực nhận; maxHP tăng current đúng delta, không light heal. TTL30s chỉ salvage, active/visual cap32; đầy bỏ drop mới và đếm capHits, không queue vô hạn hoặc đổi tiền/XP. Lượt tự nhiên không chạm cap32. Gear không qua reload.
- Pulsar xét swept sector, một hit/ID/pulse; cadence nhanh nhất vẫn lớn hơn duration, nguồn theo tàu. Ion visited và path Vec snapshot trong tick, falloff theo cấp, không giữ enemy reference cho VFX. Tuning Ion cấp2–5 sau fixture đàn:19,82→14,42s. Case năm mục tiêu cách200u cho2492damage/10s, so Plasma1722 và Pulsar1584; giữ vai trò chuyền xa. Boss không buff thêm để che vấn đề. Cần người thật đánh giá tiếp.
- Swap là bước trong cùng draft, chỉ tiêu pick khi confirm. Cancel giữ choices/reroll/pending. Guard draft/slot, không module trùng; thay key cùng vị trí để giữ thứ tự ô khác. Dọn attack cũ, mới chờ cadence đầu. XP nhân vật, hỗ trợ và gear giữ nguyên.
- ShipPresentation damp rotation theo cung ngắn14/s, thrust20/s, dùng simulation render time. Tàu/camera cùng alpha, không thêm quán tính physics. Trail hiện thời không giữ lịch sử warp; Low/reduced vẫn có engine cue.
- Baseline59+22 pass. TTK/playtest 1.2 dùng source snapshot để giữ lịch sử đúng; đã tái chạy stress gốc172shot/56projectile/Well1. Fixture stress cần baseHP tương ứng vì minute event tính đúng từ base. Fixture boss tĩnh ban đầu đặt trong lõi bị đẩy ngoài tầm; đã sửa, không dùng ca không hit làm TTK. Lượt tự nhiên/render stats chuẩn tách riêng.
- QA phát hiện HUD ceil HP lẻ thành101/100,5 khi nhận gear: sửa formatter hiển thị hai số lẻ và clamp theo max, không đổi simulation damage/HP. Thêm unit và browser regression, rebuild/đo lại đúng hash cuối; nguồn/build/mẫu trước sửa giữ riêng ở pre-hud-fix-*.


- Đo pre-dom-fix cho dense p95 46,8ms so baseline39,8ms; CDP RecalcStyleCount1447 so584/60s, SceneCPU1,2 so1,1ms. Phát hiện toast gán hidden dù không đổi mỗi frame: thêm guard và chỉ tick toast menu80ms, playing dùng cadence UI sẵn có. MutationObserver trên build cuối xác nhận0 hidden mutation trong1s ổn định,1 mutation khi hết hạn;3 browser liên quan và production smoke pass. Không suy toàn bộ chênh frame-time là do DOM; đo lại sau, giữ các artifact trước sửa.

## Beta1.4 · 2026-10-17 (lịch sử; latch/mastery được thay ở1.4.1)

- Browser1.3 tái hiện build31 Plasma/Pulsar/Ion5: choices chỉ drones/well. Lỗi nằm ở availableUpgrades cho mọi module dưới max bất kể slot. Sửa eligibility/transaction thật, không CSS; replacement là nút chủ động, recovery không auto-heal lúc mở.
- Mastery200bp/pick, tổng2000bp, perstat2000/speed1000 giữ đề xuất. Latch trước fusion, reset duy nhất khi confirm swap; hỗ trợ chưa max giữ nguyên. Không migration profile mới vì không lưu run; schema3/meta không đổi.
- Quasar ban đầu90° clear đàn20Drifter8,18s so hai nguồn5=2,47s; mở240° còn3,43s, durable10s damage22810,92 so18498,37, boss cùngHP6000 ban đầu72,15 so76,15s. Giữ damage220/cadence1,6, secondary3×0,45/falloff0,8/visited chung, không bật hai nguồn. Freetargetcircle là fixture; chưa suy cảm giác người thật.
- Boss thửHP+15/damage+10/rate+10;18bot13win, fusion9/9. Rate+5 giữHP/damage:12/18, fusion8/9; pattern alignment khiến một case+5 thua dù+10thắng. Không diễn giải winrate đơn điệu; chọn+5 bảo thủ về nhịp, giữtelegraph1,8s/speed32 và có ca né/thắng. Dữ liệu pre-boss/rate10/final riêng.
- Radiation hai vùng tĩnh ngoài lõi, tick1s và cap10HP quái; chia sẻ protection tàu để không thêm một hệ incoming. Environkill cùng credit/roll một lần, không nhận outgoing tàu. Chaos recompute base/minute, tide lực sin để đổi dấu qua0. Lịch kết thúc510 trướcboss540, skip gravity thường không queue, giữ630.
- Nebula code-native768² và3worldimages cùng style SVG gốc; không cần bitmap từ mạng.32SVG CC0/atlas1024×512, fontsOFL cũ. QA runtime phát hiện toast che eventindicator: chuyển toast xuống trong HUD; giữ tick/hidden guards80ms.

- Đã đọc XML concept/EVENTIDE_Concept_Web.docx: có chuỗi Plasma và recipe Pulsar+Ion→Quasar, không có tên Bastion/Singularity; ghi nguồn khác nhau trong catalog/spec/glossary. Không sửa tài liệu concept gốc.

### Sửa hồi quy nền sau lượt render đầu

Bản D1VFNgyB dùng texture nebula768² và ba Image1700u: lượt720s có frame p95=51ms dù SceneCPU p95=0,6ms; dense sau đó p95=75,8ms so baseline42,1ms. Giữ nguồn/build/lượt dài tại pre-background-fix-*. Thay bằng một TileSprite có texture opaque1024² gộp tinh vân, galaxy và sao khi boot; High/Low256/112sao và8/3cloud, seam được wrap khi bake. Không thêm gradient/object mỗi frame; không đổi simulation, spawn, loot hoặc hitbox. Hai texture1024² khoảng8MiB thô, backing TileSprite vẫn theo viewport. Loại texture nebula riêng/3Image, texturecount37 thay38. Đo audit và A/B/lượt render lại trước bàn giao; không dùng số bản trước sửa để chứng nhận bản cuối.

## Hotfix beta1.4.1 · 2026-10-17

- Yêu cầu hotfix thay có chủ đích luật mastery cũ: đủ/max cả3module+2support hiện hành; không completion credit sau fusion, không dựa budget đã dùng. Giữ200bp/pick/caps/budget, toàn bộ thông số chiến đấu và nguồn bonus. Không có migration run vì game chưa resume-run.
- Tái hiện trước sửa: Hull1+ôtrống vẫn draft mastery; confirm tiến hóa ở y1995 ngoài clip138–599px, focus ở Trở về. Auto-scroll rồi click thật commit thành công khi paused, nên không quy lỗi cho guard yêu cầu playing/queue. Test cũ locator.click tự cuộn đã bỏ sót khả năng tìm thấy xác nhận. Hotfix đặt/focus xác nhận đầu vùng cuộn; test geometry trước click, rồi resume bằng nút thật và kiểm tra damage nguồn Quasar.
- Atomic phù hợp mô hình thuần: không thêm factory framework/scene riêng. Chuẩn bị record/cooldown/cleanup arrays/draft trước assign, fail giữ nguồn. Existing advancedWeaponStep là behavior output; manifest/Boot fallback sẵn. UI nhận kết quả có lý do, đọc session hiện hành, revision invalidate ảnh pause; không tick mô phỏng để cập nhật.
- Kỳ vọng test cũ được đổi đúng phạm vi: fixture mastery phải max cả hai support; cancel sau stale commit giữ draft đã refresh; bot seed42 không còn mặc định phải thắng khi luật draft/RNG mới thay đổi. Test chiến thuật kiểm tra settled/reward/end rule, và playtest ghi thắng/thua thật thay vì retune boss/module để ép thắng. Kiểm tra720s thắng/thua ưu tiên vẫn ở rules; không thay clock/wave/win-loss.

## UI / hazards / multi-boss local — 2026-10-18

Các ngoại lệ spec cũ trong prompt mới chỉ thay scaling/range/hazard/boss và phân cấp ví; giữ12phút/Beacon/Corruption/slots/progression/save/economy/base /EVENTIDE/. Cung vàng được tái hiện và truy computed style tới menu h1::after và panel h2::before, bỏ đúng hai pseudo trang trí không nhãn.

Chọn radiation190u, tide440u/140u/s/falloff sqrt/cap78%, khóa tâm warning theo đường tàu và cách lõi100u để chừa đường né. Environment timer riêng contact, overlap DPS mạnh nhất; không miễn damage ngẫu nhiên do vừa va chạm. Boss kháng lực35%; dash lock cả origin/path, swept relative collision.

Boss state theo owner; admission trước telegraph và reserve đủ loạt thứ hai; delay khi thiếu budget, không cắt damage ở renderer. Phase2 hai burst cách0,65s lệch0,08rad, preview cùng dữ liệu và giữ giao khe. HP vòng đầu hạ quá nhanh24–34s ở fixture thiên thủ cấp5: chỉ tăng nhóm HP10000/9800/9200/9000, boss660×0,8. Số khởi đầu/final lưu riêng; báo cáo không suy bot thành thắng người thật.

Gom file theo responsibility, không đổi framework. Prompt MVP canonical và snapshot nguồn lịch sử giữ bytes; root prompt trùng được chuyển vào prompts/history. Không xóa save hoặc push/deploy.

## UX/stability2026-10-21

Không retune hazard/range/scaling/boss lần nữa vì local đã có mức được yêu cầu. Baseline CPU p95≤0,8ms simulation/≤0,4ms render prep/≤0,3ms DOM trên SwiftShader chưa chứng minh lookup bottleneck; không thêm spatial index/dependency. Giữ pool/culling/cache/adaptive decoration/XP ledger, đo frame thật riêng. Ngưỡng HUD25/32–50/58 và40/35 là hysteresis presentation, buff Corruption50 không đổi.

Tutorial mặc định bật để save cũ có thể học tính năng; profile có setting tắt và reset riêng seen. Schema3 chấp nhận trường tùy chọn, không bump/schema rewrite nếu chỉ thêm cờ. Recipe predicate thuần tách khỏi context commit, để hint thấy khi đang bay nhưng giao dịch vẫn pause/draft. Queue có trần, không mất trigger chưa hiện khi danger/modal.

Damage report chỉ tổng HP thực mất sau giảm trừ và clamp overkill, môi trường tách outgoing vũ khí. Snapshot/deep-freeze trước cleanup; fatal ở đúng hit gây chết, không suy từ lastHit hoặc mục tiêu gần. Cả hai HP≤0 cùng tick là both/defeat, giữ reward guard. Một nhận xét chỉ khi phần lớn damage Beacon ở ngoài sáng; không suy build yếu hoặc tặng buff/reward mới.
