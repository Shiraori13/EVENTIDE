# UI / hazards / multi-boss — hồ sơ local 2026-10-18

Thực hiện [prompt được giao](../prompts/EVENTIDE_UI_Hazards_Balance_MultiBoss_Prompt.md) trên MVP đang sửa local, không thay concept/framework. Giữ Beacon12phút, defeat ưu tiên, Corruption, ba module/hai support, tiến hóa/mastery/XP/reroll/gear, save schema3/key cũ và các cải tiến visual/performance. Không commit/push/deploy.

## Baseline và cung vàng

Trước sửa đã chụp menu với chuột đứng/di chuyển/rời viewport/bàn phím, achievements/Balo/draft, lưu computed style tại [owners trước](../artifacts/multiboss/before/ui/owners.json). Hai owner thực tế: `.menu h1::after` (40×40px absolute) và `.panel h2::before` (20px), đều trang trí không nhãn. Chúng không theo mouse hoặc trạng thái loading. Đã bỏ đúng hai selector trong identity.css; giữ focus, progress thành tựu và Beacon/charge thật. Không ẩn toàn cục pseudo/circle.

Nguồn/build trước sửa được giữ ở artifacts/multiboss/before-source và before-build; bản thuần dùng cho A/B logic ở tests/fixtures/history/ui-hazards-before có SHA256 manifest. Entry baseline `index-DN3l1Vfu.js`. Nguồn fixture cũ vnext/v12/v13/v14/v141 không sửa.

## Ví và giao diện

Wallet ở header phải desktop; icon32px/số26px/nhãn12px, tabular vi-VN, nền tối/viền vàng dưới độ sáng Khởi hành. Màn390px xuống hàng header kế, không che menu. Button mở Core bằng click/Enter có focus; đọc trực tiếp SaveService, không tween số. Core vẫn hiện ví/giá, purchase guard giữ. Feedback ngắn sau mua/thưởng, không pulse vô hạn.

Save giữ trần tiền cũ1.000.000; test seed1.234.567 được validator clamp về1.000.000, mua10 về999.990, reload/quay lại/sang run vẫn999.990. Không đổi kinh tế chỉ để chụp số mẫu. Ảnh [sảnh1280](../artifacts/multiboss/after/ui/menu-1280.png), [1366](../artifacts/multiboss/after/ui/menu-1366.png), [1920](../artifacts/multiboss/after/ui/menu-1920.png), [390](../artifacts/multiboss/after/ui/menu-390.png). Test giữ vòng tiến trình và keyboard focus; không mất save cũ.

## Hazard: luật và số đo

Corruption thuộc tàu, không tạo gravity. Hố đen môi trường giữ màu tím/lõi tối/biên thật; Tide có arrow/hút-đẩy/đếm đổi nhịp/cue0,7s và arrow lực sát tàu. Radiation kẻ sọc/triangle/nhãn trong vùng. Friendly Well cyan chỉ hút quái. Low/reduced giữ các tín hiệu bắt buộc, chỉ tắt bụi/motion trang trí.

Tide chốt tâm warning theo tuyến tàu, radius440/force140×sin/cycle6/falloff sqrt; active không bám tàu. Tổng force môi trường+Maw cap78% tốc thật, tâm/mép an toàn, boss nhận35% lực, quái cap155. Radiation chốt hai vùng190u ở warning3s,7HP/s trước giáp/Corruption. Contact không vô tình miễn radiation; miễn nhiễm thật vẫn chặn, overlap cùng loại lấy DPS mạnh nhất. Boss không nhận2%HP radiation. Core có khoảng trống tối thiểu100u ngoài hazard radius; giữ lịch210/330/465/final630–632.

Fixture cùng inputD, bắt đầu x1050/tâm950, đo tới biên440; baseline Tide radius420, current440 như luật thực. Tắt lực thoát1,717s; trước1,95s; sau2,183s. Sau1s x lần lượt1250 /1204,776 /1154,974u. Giữ phím vẫn thoát, không khóa input. Đây là mô phỏng60Hz, không suy thành cảm giác người thật. Sau5s tất cả chạm rìa map nên không dùng endpoint đó để kết luận lực.

Đứng7s radiation, không heal/contact, Corruption50 cố định: công/cơ động mất33,6→58,8HP; giáp20% mất26,88→47,04HP. Chưa có Corruption: tương ứng4→7HP/s; giáp20%3,2→5,6HP/s. Natural run sau sửa có occupancy radiation/Tide0,73–22,85s; baseline occupancy chưa instrument nên ghi null, không bịa số so sánh. Raw [hazard-clearance](../artifacts/multiboss/playtest/hazard-clearance.json), [natural](../artifacts/multiboss/playtest/natural.json).

## Scaling và Quasar

| Thông số | Trước | Sau |
|---|---|---|
|Wisp HP/damage mỗi phút|5%/5%|10%/7%|
|Drifter|8%/7%|14%/9%|
|Leech|10%/8%|16%/10%|
|Quasar range|510u|398u (−21,96% sau làm tròn)|
|Quasar damage/cadence/sweep/chain/jump|220/1,6s/240°/3/215u|Giữ nguyên|

Linear base×(1+rate×min(floor(time/60),11))×event, không compound. Quái sống giữ ratio/target/cooldown; dead không hồi sinh; Chaos áp/gỡ một lần, boss riêng. Quasar beam/chain đều trong envelope mới từ tàu hiện tại của tick; trace chụp points khi hit. Ion/Pulsar độc lập giữ nguyên. Sector lý thuyết giảm khoảng39,1%, không phải bằng chứng DPS giảm tương ứng.

Clearance20Drifter tĩnh r160, không wave/events/gear/support; giây dọn trước→sau:

| Phút | Build yếu module1 | Trung bình module3 | Plasma5+Quasar5 |
|---|---|---|---|
|3|13,18→13,45|4,62→5,80|1,88→2,18|
|6|13,45→19,58|5,80→5,80|2,18→3,15|
|9|16,65→22,78|5,80→8,47|2,18→3,38|
|11|19,58→26,25|5,80→9,22|3,15→4,12|

Đây là lab tốc độ dọn, không chứng minh né. Natural A/B cùng seed7/42, ba build công/thủ/cơ động, ±fusion, draft/drop thật, không cấp HP/XP/time: trước thắng8/12, sau7/12. Peak enemy42→45 (cap thường110 không bị tăng); projectile61→73. Mọi lượt settle, có đủ720s thật theo simulation tăng tốc; không gọi là12phút chơi tay/render. Trong8lượt sau sửa tới11:00,2lượt Hull/Armor+fusion còn boss đầu sống khi boss sau xuất hiện (cả seed7 và42), chứng minh overlap cả trong run tự nhiên. Snapshot3/6/9/11 và HP/Beacon/gear/level trong natural.json. Seed/build mong muốn giống nhau nhưng draft/RNG diễn biến có thể khác khi số kill thay đổi; đây không phải replay ép cùng từng input frame.

## Boss và tinh chỉnh có kiểm soát

Ba boss mới có asset/màu/shape riêng, hai nhóm đòn/hai phase; Elder giữ ring/beam. Harrier nhìn theo locked path, Gravemaw có hàm mở/khép theo warning/active; reducedMotion dừng trang trí, không đổi collider. [Catalog](boss-catalog.md) ghi HP/damage/cadence/warning/counterplay. Hai mốc540/660 seeded/no-repeat/độc lập, boss sau không đợi boss đầu chết. Timer/phase/beam/zone/reservation per-owner, không còn globals run điều khiển AI. Hai beam được unit kiểm tra độc lập dù pool không bốc hai Elder. HUD tối đa hai hàng, boss có slot ngoài110quái.

Reservation đủ pattern trước telegraph, chừa12 projectile cho tàu; không drop viên/vùng ẩn. Ring/fan phase2 có hai loạt0,65s lệch0,08rad, preview cả hai và vẫn giữ giao khe. Dash khóa path và origin, swept relative contact/không xuyên Beacon; chặng hai warning riêng/ngắt0,35s. Transition1,25s thu hồi đúng owner, overkill không xuyên, final mới thưởng một lần. Zone≤6/run,≤2/owner, lifetime cố định; result/restart không đòn ma.

Vòng đầu HP6900/5600/5200/4800, boss660×0,72 cho TTK thiên thủ≈24–34s, thấp hơn mục tiêu. Đã lưu raw tại artifacts/multiboss/playtest-starting, rồi chỉ điều chỉnh nhóm HP10000/9800/9200/9000 và660×0,8. Sau đó hoàn thiện offset pattern và đo lại cùng harness. Phase2 vẫn65%, không đổi damage/speed/warning trong vòng HP.

TTK cuối của fixture Hull5/Armor5, ba module5 hoặc Plasma5+Quasar5, không gear/mastery/wave, spawn350u, HP thật:

| Boss | Mốc540 ±fusion | Mốc660 ±fusion |
|---|---|---|
|Elder|48,27–48,37s|38,82–39,33s|
|Gravemaw|47,08–47,62s|37,38–38,13s|
|Helion|44,17–44,42s|36,23s|
|Harrier|43,43–44,28s|35,43–36,02s|

Hai boss mới còn thấp hơn sàn45s khoảng0,6–1,6s, không tuyên bố tất cả đạt mục tiêu. Build công max thường nhanh hơn; bot cơ động chết trước khi hạ Elder; Gravemaw có ca56,1s ở mốc660 vượt mục tiêu35–50s. Không đổi HP tiếp chỉ để ép tỷ lệ thắng. Raw [60fixture TTK](../artifacts/multiboss/playtest/boss-ttk.json).

Ba cặp + final gravity, build thiên thủ Plasma5/Quasar5/Drones5, HP thật, bot, không wave,60s:

| Cặp | Kết quả | Skill mỗi boss | Peak projectile/zone |
|---|---|---|---|
|Elder + Gravemaw|Thắng720s, cả hai còn phase2, tàu12,74HP|23 /19|113 /1|
|Helion + Harrier|Thua sau44,1s, cả hai phase2|14 /16|64 /2|
|Gravemaw + Helion|Thắng, cả hai final death, tàu92,14HP|10 /11|41 /3|

Fixture cặp cố ý giữ HP boss mốc540 để ép overlap, không áp×0,8; khó hơn lịch boss thứ hai thực. Các trường hpDamage/shipDamage trong raw là tổng HP giảm quan sát giữa tick, có thể bị heal/HP tăng cùng tick bù một phần; không gọi là tổng damage gốc trước giảm trừ. Chứng minh AI/phase cùng hoạt động và outcome không yêu cầu kill, không chứng minh mọi tổ hợp đều né được với người thật. Raw [pairs](../artifacts/multiboss/playtest/pairs.json). Ảnh/clip/frame từ lượt browser riêng được ghi bên dưới.

## Cấu trúc và bảo toàn dữ liệu

Gom hệ boss/hazard/enemy theo responsibility, giữ façade SpawnSystem cho import cũ. Scripts assets/performance/qa tách rõ; Playwright configs ở config/playwright đã sửa cwd/testDir/package commands. Docs phiên bản cũ vào docs/history, liên kết cập nhật; canonical prompt MVP giữ byte, bản root trùng giữ ở prompts/history. Không rewrite framework/dependency/lockfile hoặc xóa tiến triển.

## Kiểm chứng và giới hạn

Unit/integration bản cuối:136pass;4case playtest tách opt-in, đã chạy riêng4pass. Gồm pause toàn state, scaling boundary, Quasar boundary/moving origin, phase/owner/reservation/dash, fusion click regression/save/economy. Lượt E2E sạch58/58pass trên QA index-BcrWYQDt; sau chỉnh trình bày hai boss/reduced motion,13/13 UI/VFX/owner và5/5 unit trình bày pass trên bản cuối index-CtKeK4qU. Typecheck/build:qa/build production pass; production index-BYdXBxam smoke2/2 (base/assets/font/offline sau load/no hooks/input/XP/Build/pause/audio/save). Một lượt full trước đó54/57 có fixture tìm riêng Elder, adapter clear beam cũ thiếu owner và font timeout5s khi chạy unit/build cùng; đã sửa fixture/adapter, kiểm tra riêng4/4 rồi chạy full sạch58. Lần smoke đầu connection-refused vì preview4173 cũ đã dừng, khởi động lại và2/2pass. Không ghi các lượt lỗi thành PASS.

Chưa có người chơi tay đủ12phút, đánh giá audio bằng tai, GPU vật lý/Firefox/Safari/mobile-touch/native zoom hoặc soak20–30phút. Bot không tối ưu né Solar/dash và có thể đánh giá khó sai. Clip phím tự động không thay cảm giác người điều khiển. Đây là cấu hình đã đo trên fixture và bot, còn cần playtest người thật trước khi gọi là cân bằng hoàn tất.

## Ảnh, clip và frame bản cuối

- [Clip keyboard clock thường](../artifacts/multiboss/interaction/keyboard-local.webm), [state45mẫu](../artifacts/multiboss/interaction/state.json): radiation warning/đứng/thoát, Tide hút–đẩy, Helion+Harrier cùng sống, WASD, Balo pause/resume; pageerror0, entry index-CtKeK4qU. Fixture khởi tạo bằng debug, chuyển động bằng keyboard.down/up thật. Không gọi là người chơi tay hoặc run12phút tự nhiên.
- [Hai boss thấy trên camera](../artifacts/multiboss/interaction/duo-visible.png), [radiation warning](../artifacts/multiboss/interaction/radiation-warning.png), [radiation active](../artifacts/multiboss/interaction/radiation-active.png), [Tide đẩy](../artifacts/multiboss/interaction/tide-outward.png), [pause Build](../artifacts/multiboss/interaction/paused-build.png). Ảnh tĩnh không tự chứng minh hướng lực; xem clip/state và phép đo trajectory.
- [Gallery8phase](../artifacts/multiboss/gallery/states.json): [Elder1](../artifacts/multiboss/gallery/elder-phase1.png)/[2](../artifacts/multiboss/gallery/elder-phase2.png), [Gravemaw1](../artifacts/multiboss/gallery/gravemaw-phase1.png)/[2](../artifacts/multiboss/gallery/gravemaw-phase2.png), [Helion1](../artifacts/multiboss/gallery/helion-phase1.png)/[2](../artifacts/multiboss/gallery/helion-phase2.png), [Harrier1](../artifacts/multiboss/gallery/harrier-phase1.png)/[2](../artifacts/multiboss/gallery/harrier-phase2.png). Phase được dựng có chủ đích để review hình/telegraph, không giả là transition tự nhiên; transition/reward thực test riêng.
- [Computed owner sau](../artifacts/multiboss/after/ui/owners.json) và [trước](../artifacts/multiboss/before/ui/owners.json); ảnh trước/sau cùng6màn ở hai thư mục. [Audit](../artifacts/multiboss/audit.json):11file cốt lõi,32SVG trước và192fixture giữ hash;35SVG hiện metadata hợp lệ.
- [Hiệu năng đầy đủ](performance-report.md): hai lượt/side theo thứ tự đảo, Medium/1280×720/DPR1/cùng máy/seed. Dense p50 trước34,4/36,8→sau37,6/33,1ms; p95 trước43,6/54,8→sau48,1/40,3ms. Endgame p50 trước28,1/31,9→sau31,3/26,5; p95 trước36,7/42,7→sau44,0/32,8ms. Lượt đầu tăng, lượt đối chứng đổi chiều; không đủ kết luận tăng/giảm FPS ổn định. Duo110thường+2boss+hazard p50/p95/p99=31,1/37,7/45,8ms,6/960frame>50ms; không chứng nhận60FPS. Probe dense paused cả hai1draw/4107vertex, không phải benchmark GPU. Mọi raw/lượt xấu đều giữ.
- Lifecycle duo7vòng: sau2warmup, texture41/listener48/DOMlistener176/nodes543/pool254 plateau, timer/tween/owner/beam/zone/reservation0 ởmenu. Không gọi là bằng chứng hết mọi leak.
