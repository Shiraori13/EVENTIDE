# Kiến trúc thực thi

## UX/stability local · 2026-10-21

Giữ Phaser/TS/framework, dependency và hệ thống gameplay/render hiện hành. `core/runReport.ts` sở hữu counters run-only, actual HP loss/fatal và deep-frozen snapshot; `GameSession` gọi sample bằng clock mô phỏng và snapshot trước cleanup. `CombatSystem`/`AstronomySystem` truyền nguồn/owner đúng chỗ trừ HP, UI chỉ định dạng. Không ghi report vào profile/localStorage mỗi hit. Bảng nguồn incoming tối đa32key+other, outgoing là tập ID hữu hạn.

`core/upgradePreview.ts` đọc cùng content/stats/attackInterval với luật; không giả lập pick hoặc thay RNG để preview. `ui/BuildView.ts`, `DraftView.ts`, `ResultView.ts` tách template khỏi GameUI. `presentation/HudWarnings.ts` giữ hysteresis trình bày theo owner run; không đổi buff threshold. GameUI vẫn diff HUD80ms, time/charge có độ phân giải1s/1%, mở rộng source bằng details/scroll. Không thêm pipeline DOM mỗi frame hoặc spatial index khi CPU baseline chưa là bottleneck.

`services/TutorialService.ts` queue tối đa3trigger/run, simulation TTL/spacing, profile seen chỉ commit sau hiển thị; `ui/NotificationQueue.ts` tối đa4nhóm toast/gộp trùng, wall time chỉ UI. Các owner reset khi đổi run/menu/dispose; không timer/listener/tween cho mỗi hint/toast. Modal trap tính summary đang hiển thị, input/select không chạy phím tắt phía sau; focus phục hồi cả khi fusion làm thẻ draft cũ không còn hợp lệ. ARIA vùng trạng thái chỉ thông báo đổi mức nguy hiểm, không đọc số liên tục.

Save schema3/key giữ, thêm optional-default tutorialSeen/settings.tutorial. Đường kiểm tra mới: `config/playwright/playwright.next-beta.config.ts`, `scripts/qa/next-beta`, artifact `artifacts/next-beta`. Các build/số đo lịch sử giữ riêng, không dùng số cũ chứng nhận bundle mới. Báo cáo hiện hành ở [next beta](next-beta-ux-report.md).

Phaser3 hiển thị thế giới; HTML/CSS đảm nhiệm menu/HUD/dialog. Không React hoặc physics timer riêng. Hai scene: `BootScene` load/fallback và `GameScene` sở hữu phiên chơi/input/services/UI/renderer. Menu/kết quả theo phase trong GameUI, thay vì tạo scene chỉ để hiển thị DOM.

`RunState` trong `core/types.ts` chứa trạng thái một lượt, `SaveData` là meta độc lập. `GameSession` nhận RNG và vector input, điều phối systems thuần không import Phaser/DOM. Vitest dùng đúng simulation code chạy trên browser.

Luồng frame: input → `GameClock.advance(delta/1000)` → bước1/60s → time/event/spawn → movement/environment/XP → weapons/boss/combat → defeat trước victory → chuẩn bị upgrade. Scene sau đó trả thưởng meta một lần, xử lý cue audio, renderer đọc state, HUD cập nhật khoảng12.5 lần/s. Hiệu ứng UI/audio không thay đổi luật game.

Clock clamp frame0.1s, tối đa6 bước bù. Máy quá chậm làm mô phỏng chậm hơn thời gian thực, không bù toàn khoảng rời tab. Chỉ `playing` chạy bước. Pause xóa accumulator/phím; blur/visibility tự pause, giữ `beforePause` để không mất upgrade. Không Date.now/setInterval cho combat.

Event boss/final gravity dùng cờ và `>=`. Boss có slot ngoài cap110 thường. Một trường optional giữ gravity môi trường; final thay vùng cũ. Cooldown: bảo vệ toàn tàu, contact từng quái, drone từng mục tiêu. Plasma kiểm tra đoạn đường chống xuyên hitbox; nổ thay hit trực tiếp, mỗi mục tiêu một damage/viên. Buff Corruption tính tại damage, không sửa base stat.

`finishRun` có `settled` chống lặp kết quả; scene có `paid` chống ghi tiền lặp. UI kết quả xuất hiện sau khi ghi meta. Về menu/chơi lại giữa lượt không gọi finish, không thưởng. Reload không resume. Run mới không tái dùng array/cooldown.

BootScene beta1.4 bake32 SVG vào atlas1024×512, nền composite1024×1024 và light texture1024×1024 một lần. WorldRenderer dùng SpritePool tối đa640 Image, reset frame/position/alpha/scale/tint/depth/name/active/visible khi tái sử dụng. Image không có body/timer/listener/owner gameplay. Culling chỉ ảnh/FX; mọi quái và đạn ngoài camera vẫn được simulation xử lý. Không destroy/recreate texture theo lịch sử spawn. Stars/ruins đổi chất lượng bằng texture đã có/visibility, không tạo lại canvas mỗi frame.

TileSprite sao chỉ có kích thước viewport, scrollFactor0 và tilePosition theo camera; chỉ resize khi viewport đổi. Phaser3.90 vẫn tạo backing canvas theo width/height của TileSprite ở WebGL, nên không dùng một TileSprite5200×5200 phủ cả map. Probe ghi riêng starCanvasWidth/Height và e2e kiểm tra resize1366×768, tránh hồi quy footprint hàng trăm MB.

`GameSession` lưu previousX/Y trước mỗi tick. `GameClock.alpha` đưa tỷ lệ accumulator cho renderer, tàu/camera/quái/đạn cùng thời điểm; không ghi vị trí render ngược vào collision và không thêm camera smoothing. Pause/resume reset previous về current để không lùi ảnh một bước. Khi menu/pause/upgrade/time/viewport không đổi, renderer giữ draw commands đã có; warning/particle/detonation dùng simulation time và đóng băng đúng.

PickupSystem tách khỏi environment/combat: sổ created/collected, array active≤220, lưới ledger57×57 (3249 cell) theo map1800/cell64. Drop mới tăng created một lần. Merge hash theo cell96/radius72 mỗi2s, age≥4s, tránh homing và vùng nhặt+padding. Cap đầy giữ giá trị trong cell địa phương, không mảng overflow vô hạn. Khi toàn bounding box của cell vào pickup radius, materialize vào active; có thể đẩy orb xa available sang ledger để nhường chỗ. Query cell gần tàu, không scan mọi cell mỗi tick. Không có body/emitter/tween cho mỗi orb. Renderer query vùng camera, tier/marker và budget220 visual, không quyết định việc thu XP.

Cluster local giữ anchor làm vị trí đại diện, không lưu mọi vị trí lịch sử. Ledger bounds bao các vị trí đại diện được nhận; nếu có drop/cell ngoài tầm, không đẩy nó vào radius để thu ngay. Materialize detach cell đã kiểm tra trước khi evict, rollback nếu chưa có chỗ; tránh gộp thêm vào cùng cell giữa kiểm tra và chuyển giao. Regression bao cả slot đầy với orb sát ngoài tầm và orb evict thuộc chính cell đang chuyển.

UI cache element theo ID sau mỗi lần dựng màn; text/bar/hidden chỉ đổi khi giá trị đổi, loadout chỉ dựng khi fingerprint cấp thay đổi. FontService tải face400/600 body và400/500 title, timeout2.5s; DOM swap khi font đến muộn. Không có Phaser Text trong gameplay hiện tại; factory Canvas Text và mẫu glyph nằm trong QA, không monkey-patch engine.

Combat giữ thứ tự enemy/projectile và cooldown; segment squared query tránh tạo vector cho mỗi projectile×enemy, arrays compact tại chỗ. Chưa thêm grid combat vì CPU đo thấp.1.2 thay HP/damage/speed và support/boss qua config có chủ đích; cap/spawn/thời lượng/radius module giữ. Đối chứng SHA256 không đổi chỉ thuộc đợt1.1.

Cleanup: UI sở hữu AbortController cho click/change/keyboard; scene sở hữu blur/visibility/movement listeners. SHUTDOWN tháo listeners, DOM, renderer, AudioContext và debug; Phaser dọn display list. Thay lượt không tạo thêm listener/AudioContext. HMR `game.destroy(true)` đi qua shutdown.

Mở rộng quái: config và SpawnSystem; behavior ở movement/combat. Module dùng bảng cấp và nhánh rõ trong WeaponSystem; hiện sáu loại gồm Quasar hợp nhất; AdvancedWeapons tách sweep/chain, chưa cần framework behavior registry. Thêm ID/bảng/behavior, UI đọc metadata upgrade. Cân bằng chung ở balance.ts; asset ở manifest; audio tập trung AudioService.

Debug chỉ DEV hoặc build mode `benchmark` rõ ràng, với `?e2e=1`/`?perf=1`, seeded RNG và save `eventide.e2e.v1` riêng. Production thường loại cả hai hook. PerfSampler có buffer tối đa50,000 mẫu/series, counters và overlay cập nhật thưa, không telemetry mạng. Benchmark build dùng tối ưu production qua preview nhưng có probe test-only; không dùng dev/HMR để kết luận hiệu năng. Xem performance-report để tái hiện và giới hạn.

AudioService giữ một context và ba ambient oscillator hữu hạn. SFX voice được bỏ onended/disconnect sau phát; pause/menu hủy voice đang chờ trước suspend, tránh callback/nốt cũ treo tới resume. Cleanup SHUTDOWN vẫn đóng context và mọi owner. Năm vòng sau warm-up kiểm tra DOM listeners/scene listeners/textures/timer/tween/pool/audio thực tế, không chỉ dựa vào một heap snapshot.

## Pipeline1.2

`config/progression.ts` giữ character/support/achievement definitions; content.UPGRADES tham chiếu support data. `core/stats.ts` tính base+bonus+Corruption, cache WeakMap theo character/level từng support/ngưỡng Corruption. Damage/player move/pickup và cadence vũ khí đọc selector chung; UI dùng cùng calculator/formatter moduleDescription/upgradeDescription. Không lưu effective stats trong save hoặc nhân lãi kép.

ExperienceSystem giữ draftId/rerollsRemaining/pending/picks trong RunState. Lọc ID hợp lệ trước khi draft, shuffle RNG, đại diện nhóm, reroll ưu tiên fresh. Actions mang draftId để chặn stale click; Session reset interpolation sau pick. Reroll không đổi stats hoặc pending. UI readStack nhỏ tách khỏi gameplay phase; mở Build từ playing gọi pause, đóng chỉ tự resume nếu không có blur/visibility xen vào. Nested catalog/achievement trở về panel/draft cũ. ProgressionView chỉ tạo markup khi mở, không chạy bảng tooltip mỗi frame.

`ProfileService` commit delta kills từ RunState qua WeakMap seen; CombatSystem là nơi duy nhất tăng kills sau death thật. Không cộng lại result. SaveService migrate1→2 cùng key, career total là nguồn để validate mốc. Service dirty/retry snapshot; flush5s simulation hoặc lifecycle/milestone. Không Date.now/setInterval cho luật. Toast một vùng5s wall UI, không timer/queue per kill. Pagehide/scene shutdown flush; restart/menu bỏ reference run, WeakMap không giữ run cũ.

SpawnSystem snapshot HP/speed/damage thường theo time. BossLifecycle tách cleanup/transition khỏi Combat để tránh vòng import. BossSystem có phase1→transition→phase2→dead, ownerId trên projectile/beam, aim/lock/fire/recover cùng simulation clock. Beam origin world=enemy hiện tại+offset theo góc; render cộng cùng delta nội suy của owner, collider authoritative dùng cùng beam world geometry. Projectile tách khỏi boss ngay lúc fire. Transition/final death đánh TTL0 để không sửa array đang iterate, compact cuối combat; không overkill sang phase2 hoặc thưởng phase1.

Thêm support/mốc: progression.ts và calculator/formatter nếu thêm stat mới; đổi module content.ts; thêm icon qua asset-shapes.json/manifest. Tuning enemy/BOSS_PHASES ở balance.ts, pattern tại BossSystem.ts. Không thêm dependency/framework. Snapshot1.1 ở artifacts/v12/baseline-source; fixtures/test-only dùng key riêng, production loại hook như1.1.

## Pipeline 1.3

- config/achievements.ts giữ 28 definitions và metric selector; progression re-export để giữ API. Run.metrics ghi credit thật. ProfileService dùng WeakMap để commit delta cho counter, max cho best-run và guard result. Cache revision/giây/phase tránh scan 28 điều kiện mỗi frame. Schema 3 cùng key; metrics mới không suy lịch sử. Core purchase refresh huy hiệu trong cùng snapshot, load không toast.
- config/beacon.ts giữ registry appearance/HP dùng chung preview và world. Menu chỉ dựng view model; purchase guard expectedLevel/currency và debounce UI. Run chốt coreLevel từ createRun. Một vùng read-content cuộn, header/footer bên ngoài; affordability luôn ở cạnh nút mua.
- minuteScalingStep chạy trước spawn/movement, chỉ khi minuteIndex đổi, tối đa 11. Tính từ baseHP/baseDamage và giữ HP ratio, không đổi target/nextHit/nextDroneHit/speed. Spawn mới dùng cùng minuteAt; Elder dùng lifecycle riêng.
- config/salvage.ts và SalvageSystem quản lý integer bp, drop, collect, TTL và counter. Mảng tối đa 32, validate hai cap khi collect, guard released; không queue hoặc đổi EXP. shipStats cache thêm năm nguồn bp. Support và salvage cộng trên base, armor riêng, Corruption tại hit. Gear thuộc run, không save derived stats.
- AdvancedWeapons giữ Pulse.hitIds theo monotonic enemy ID và xét sector đã quét. Ion chốt visited/path/damage trong tick, VFX chỉ giữ Vec copy. Config hiện tại có tối đa một pulse, tám Ion trace. ModuleLifecycle dọn attack cũ; swapCandidate nằm trong choosingUpgrade, confirm theo draftId, giữ thứ tự ô qua Object.entries.
- ShipPresentation chỉ damp góc cung ngắn và thrust theo simulation render time. Vị trí/camera giữ cùng alpha nội suy 1.1; không physics inertia hoặc tween body. Trail geometry bounded 4/2, không giữ history từ warp/run cũ. Atlas 29 entry,1024×512, pool tối đa 640; không bake texture mỗi frame.
- Test/perf hooks chỉ DEV/benchmark, save key riêng. Dense/endgame giữ fixture 1.2 cho A/B; storm thêm Plasma/Pulsar/Ion5, support rate40% và gear rate20%, phase2/gravity. Lượt dài chọn qua draft thật, không fixture HP. Helpers/artifacts 1.3 riêng, không ghi số 1.3 vào báo cáo 1.2.


## Pipeline beta1.4

ExperienceSystem tách ChoiceId (normal/mastery/recover), DraftAction(acquire/level/support/mastery/recover), replacement transaction riêng, derived completion và refreshDraftAfterFusion (hotfix1.4.1 thay latch). EvolutionSystem commit recipe atomic, cùng source lifecycle; không thêm inventory/framework. RunState có masteryBonus integerbp/weaponMasteryReached (snapshot derived tương thích debug, không quyết định eligibility), nextQuasar, AstronomyEvent instances/derived enemyEventFactor. SaveData vẫn schema3 vì không resume run và không lưu modifier; giữ1/2→3 validator và production key.

AstronomySystem resolve lịch theo current simulation time trước minuteScalingStep/spawn. Lifecycle scheduled/warning/active/ending/completed/cancelled, một major owner; gravity thường skip mốc, tide sở hữu optional Gravity.source. Chaos là nguồn riêng: shipStats đọc active event, enemy recompute từ base×minute×factor giữratio. Radiation gọi hitEnemy(source=radiation) bypass outgoing tàu nhưng giữ deadguard/credit/loot; tàu qua hitPlayer. Cancel đồng bộ khi result/newRun, không timer/listener event.

AdvancedWeapons dùng Pulse.source quasar và cùng hitIds cho beam/chain, một cadence/sweep, source cũ được ModuleLifecycle dọn. Tia phụ resolved cùng tick, Vec copy VFX, cap4trace; không để nguồn Pulsar/Ion tiếp tục. Supports/gear/mastery cộng từ base, Corruption/event tại hit; damage môi trường phân biệt source.

BakeTextures gộp tinh vân/galaxy/sao vào ba texture opaque1024² Cao/Vừa/Thấp, dùng một TileSprite;256/176/112sao,8/5/3cloud, không RNG/frame/Tween star. Atlas32entry vẫn1024×512. BeaconFeedback thuần đọc lastHit/simtime; tint đỏ0,12s ưu tiên rồi trả palette Core, không timer/tween. UI eventindicator cadence80ms, toast trong trận cùng rail thông báo, menu/panel ở flow.

## Visual identity local · 2026-10-18

`config/design.ts` cấp palette/timing và budget accent; `SpaceBackdrop` sở hữu tile+Graphics, `BeaconPresentation` vẽ vòng/nạp thật, `ShipPresentation` thêm bank hữu hạn không offset vị trí. `WorldRenderer` điều phối culling/quality, hazards Graphics depth5 và một record dư ảnh beam; không đụng systems. Nền opaque wrap cả hai trục khi bake; ba tile tĩnh tăng4MiB RGBA thô. Beacon raster128 trong cell128 sẵn có, không tăng kích thước atlas/hitbox.

GameScene có presentationSeconds clamp100ms/ẩn tab chỉ cho menu, tách khỏi GameClock mô phỏng; world/Balo/draft vẫn simulation time. Không loop/timer mới. Renderer reset pose/hysteresis/hit/dư ảnh khi state identity đổi, dispose cả light/ruins/background/hazards/pool. Adaptive chỉ giảm decoration, phục hồi sau2s và ngưỡng thấp hơn. GameUI vẫn listener AbortController/cache ID/cadence; root data-motion/data-quality có guard, không gán DOM attribute mỗi frame. Motion CSS trong identity.css, override OS theo lựa chọn đã lưu. Chi tiết và layer/budgets ở [design system](design-system.md).

`presentation/geometry.ts` tính số đoạn theo sai số dây cung0.35u/cap128; thay các ARC ngắn Beacon/Gravity/Pulsar vốn bị GraphicsWebGLRenderer Phaser3.90 chia100đoạn mỗi cung. Hình học được trình bày bằng moveTo/lineTo, giữ endpoints/radius. Probe automation WebGL ghi vertex/draw/program, không đưa instrumentation vào production. Bằng chứng bác bỏ giả thuyết đổi pipeline và xác nhận giảm vertex ở visual report. Phế tích dense về28, tilePosition guard tránh dirty khi pause/Canvas; không thay batch size/engine hoặc simulation.

Snapshot1.3 ở artifacts/v14/baseline-source/baseline-benchmark. Tests TTK/playtest1.3 import snapshot đó để không ghi sốbeta vào báo cáo1.3. New fixtures và raw ở artifacts/v14, previews4193/4194, config playwright.v14. Không thay dependency.

### Sửa hồi quy nền sau lượt render đầu

Bản D1VFNgyB dùng texture nebula768² và ba Image1700u: lượt720s có frame p95=51ms dù SceneCPU p95=0,6ms; dense sau đó p95=75,8ms so baseline42,1ms. Giữ nguồn/build/lượt dài tại pre-background-fix-*. Thay bằng một TileSprite có texture opaque1024² gộp tinh vân, galaxy và sao khi boot; High/Low256/112sao và8/3cloud, seam được wrap khi bake. Không thêm gradient/object mỗi frame; không đổi simulation, spawn, loot hoặc hitbox. Hai texture1024² khoảng8MiB thô, backing TileSprite vẫn theo viewport. Loại texture nebula riêng/3Image, texturecount37 thay38. Đo audit và A/B/lượt render lại trước bàn giao; không dùng số bản trước sửa để chứng nhận bản cuối.

## Hotfix beta1.4.1

core/buildProgress là selector duy nhất đếm ba module qua UPGRADES và hai support qua SUPPORTS: validate object/ID/level/max, occupied/maxed/complete; không cache. ExperienceSystem, Build và draft UI đọc cùng selector. prepare sau mỗi pick đọc state vừa commit; refresh do fusion/stale giữ draftId/pending/reroll. Reroll chỉ tiêu khi có alternate; stale action refresh có feedback. Bonus/budget không là completion credit.

EvolutionSystem.quasarEligibility dùng chung UI/action, độc lập supports/mastery, chấp nhận paused/choosingUpgrade của run chưa settled và không swap. GameUI → GameScene đọc session hiện hành → GameSession.evolve → tryFuseQuasar. Prepare kiểm tra definition/content, behavior advancedWeaponStep và manifest (BootScene đã bake SVG/fallback); chuẩn bị output/modules/filtered owner arrays/draft trong staged state trước commit. Không có resource engine cần tạo khi fusion; advancedWeaponStep tạo Quasar pulse ở cadence sau resume. Throw trong prepare/RNG không consume. WeakSet khóa đồng bộ, recipe guard chặn commit lần hai, structured result trả lý do tiếng Việt.

UI currentState lấy source of truth khi render panel; confirmation ở đầu read-content và focus confirm, feedback sau commit không cần đóng panel. Đường quản lý chạy đồng bộ khi pause, không qua simulation queue. buildRevision tăng ở pick/swap/fusion để WorldRenderer invalidate frozen cache đúng một lần; không tick time/physics. Draft UI fingerprint thêm choices/revision/notice để stale refresh hiển thị ngay. Không thêm listener/timer/dependency/save schema.

Snapshot trước hotfix: artifacts/v141/baseline-source. Build hiện hành ở artifacts/v141/after-benchmark/4195; tests lịch sử balance-v14 import snapshot này để không viết số hotfix vào v14. Các số đo1.4 ở performance-v1.4; script report-v14 xác minh nguồn frozen và ghi tài liệu lịch sử, không đè báo cáo hiện hành.

## Phát hành beta1.0.0 trên GitHub Pages

Giữ Phaser/TS/Vite và gameplay hotfix1.4.1; chỉ đổi nhãn, base /EVENTIDE/, favicon %BASE_URL%. CSS publicfont được Vite rewrite base, JS/Phaser loader dùng BASE_URL một lần. Không router/service worker/backend. Workflow deploy.yml pushmain/dispatch: checkoutSHA, Node24.21.0/npmci, strict/unit/build/productionbrowser, uploaddist, deploy needsbuild với environment github-pages/quyền pageswrite/idtokenwrite.

Test lịch sử trước phụ thuộc artifacts local; bản checkout dùng tests/fixtures/history có SOURCES.json/hash/giữ byte qua gitattributes. tsconfig exclude enumeration snapshot để không nhập global debug ambient của nhiều bản, các file được tests import vẫn typecheck. Vitest2worker và setup tạo outputroots để checkout sạch tự chạy. Các artifacts/build/screenshots/cache/browser, .env và VSCode không công khai; nguồn/asset/lock/docs/workflow/fixture nguồn cần thiết được track. Xem DEPLOYMENT.md.

## UI / hazards / multi-boss local

- systems/bosses: BossScheduler chọn pool seeded/no-repeat hai mốc độc lập; BossSystem duyệt mọi instance, state.ts giữ ready/attack/beam/phase/owned reservation; attacks.ts primitive ring/fan/beam/Maw/Scar/dash; BossLifecycle thu hồi đúng owner. RunState không còn beam/ring/fan/phase timer dùng chung. DebugController có adapter alias QA cũ trong snapshot, production không có adapter.
- systems/enemies: EnemyFactory và ScalingSystem tách spawn, linear base×minute×event giữ HP ratio. SpawnSystem vẫn façade tương thích các import cũ; eventStep gọi scheduler, không gate theo bossDefeated.
- systems/hazards: AstronomySystem chốt vùng/tâm ở warning, placement bảo vệ lõi, forces tính vector/cap duy nhất. Radiation/solar dùng environmentHits theo nguồn thay vì contactProtection; invulnerableUntil là miễn nhiễm thật. BossZone có owner/lifetime, tối đa6.
- presentation/HazardPresentation và BossPresentation chỉ đọc state, exact radius/path/angles; beam tail Map theo owner, không sinh timer/damage. Tide flow dùng tích phân sin để đảo hướng liên tục, không đảo time gây nhảy.
- UI wallet đọc SaveService trực tiếp, chỉ flag feedback ngắn sau giao dịch/award; hai hàng HUD boss đọc danh sách sống/transition. Save schema/key không đổi vì nội dung mới chỉ thuộc run.
- Scripts gom assets/performance/qa; Playwright configs ở config/playwright với cwd root/testDir đã chỉnh. docs/history giữ số đo cũ, prompts giữ snapshot. Root BUILD_MVP bản trùng được giữ tại prompts/history, canonical prompts/BUILD_MVP.md không sửa. Tests/fixtures/history byte cũ giữ nguyên; thêm frozen ui-hazards-before kèm SHA256 để A/B tái lập.
