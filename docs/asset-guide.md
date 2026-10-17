# Asset local

Phiên bản1.3 có29 SVG hình học nguyên bản, viewBox64×64/tâm32×32, dữ liệu duy nhất ở `scripts/asset-shapes.json`, generator `scripts/generate-assets.mjs`, cấp phép CC0-1.0. Manifest typed `src/assets/manifest.ts` có ID/path/type/size/origin/hitbox-reference/source/license. `node scripts/generate-assets.mjs` ghi đè SVG cùng tên, chỉ chạy khi muốn tái tạo từ nguồn JSON. Font Noto là asset bên thứ ba có SIL OFL, không gán CC0 cho font.

| ID | File dưới public/assets/images/ | Vai trò |
|---|---|---|
| nova | player/nova.svg | Tàu và động cơ, mũi sang phải |
| beacon | beacon/beacon.svg | Hải đăng, favicon |
| wisp / drifter / leech / elder | enemies/{id}.svg | Silhouette riêng |
| plasma / drones / well | weapons/{id}.svg | Icon module/drone/well |
| hull / magnet | ui/{id}.svg | Icon hỗ trợ |
| stardust / pure | ui/{id}.svg | XP / tiền meta khác hình |
| ruin | environment/ruin.svg | Phế tích |
| shotPlasma / shotSun / shotSupernova | weapons/shot-plasma.svg, shot-sun.svg, shot-supernova.svg | Đạn từng hình thái, giữ collision từ config |
| enemyBolt | weapons/enemy-bolt.svg | Đạn địch có hình/viền riêng |
| stardustCluster | ui/stardust-cluster.svg | Tier XP lớn / marker gộp |
| power / haste / engine / armor | ui/{id}.svg | Bốn icon hỗ trợ mới nguyên bản: lõi sét/nhịp kép/động cơ/khiên |

Thay Nova: thay file player/nova.svg, giữ64×64/mũi phải rồi refresh. Đổi path thì sửa entry nova. Dùng PNG cần đổi type/manifest và `BootScene.load.image` tương ứng. Display size ở renderer, hitbox ở config; thay ảnh không tự đổi collision. Nguồn mới phải bổ sung tác giả/URL/license.

Boot có loading; file thiếu dùng `proceduralTextures.ts` tạo fallback khung gạch chéo, game tiếp tục chạy. Playwright cố tình chặn Nova để thử đường này. Production có đủ file, không fetch ngoài local origin.

Nova, Wisp, Drifter, Leech và Elder đã có hình mới (thân/cánh/lõi/giáp gãy/đuôi/cong/rạn sao). Art không đổi HP/radius. SVG vẫn source64; Elder raster128×128 khi boot để hiển thị143u không bị phóng64 quá mức. Atlas1024×512 gồm cell128, frame thực64/128 theo manifest. Atlas/starfield512×512/light1024×1024 bake một lần, không sinh lại khi đổi quality. SpritePool≤640 và pickup visuals≤220; Graphics còn dùng cho thông tin động như telegraph/streak/range/blast. High/Low budget ở presentation.ts, không đổi luật.

Font: `public/assets/fonts/NotoSans-Variable.ttf` và `NotoSerif-Variable.ttf`, weights100–900; nguồn chính thức Google Fonts, copyright Noto Project Authors, SIL Open Font License1.1. Bản license đầy đủ nằm cùng thư mục, URL/hash/byte size/ngày lấy ở `SOURCES.json`. Không sửa/subset file font, không gọi CDN runtime. Tổng font khoảng3.94MB nên cold load có chi phí; FontService timeout2.5s rồi fallback an toàn, CSS swap nếu font đến muộn. Body/HUD dùng Sans400/600, title dùng Serif400/500. Gameplay hiện không có Phaser Text; Canvas style factory và bảng glyph QA dùng cùng face sau bước load, không monkey-patch engine.

Thay font phải cập nhật CSS @font-face, FontService, manifest/font metadata và license. Kiểm tra lại toàn bộ chữ Việt/dấu kép bằng ảnh, cold/failure/late load, DPR/zoom; load thành công hoặc textContent đúng chưa đủ. Không dùng font hệ thống riêng của máy phát triển làm dependency bắt buộc.

Audio tổng hợp Web Audio nguyên bản trong AudioService; không file audio rỗng/thư mục giả. Ambient ba oscillator sine đổi nhịp theo áp lực; SFX bắn/hit/XP/upgrade/evolution/Beacon/boss/kết quả. Context bắt đầu sau thao tác khởi hành; pause/tab ẩn suspend, menu tắt audio, upgrade tắt ambient nhưng có SFX. Mute/volume lưu meta; thiết bị lỗi không crash game. Muốn dùng file, thêm manifest music/sfx và load tập trung AudioService, giữ suspend/dispose. Chưa nghe đánh giá audio trực tiếp trong phiên headless.

VNext dừng/disconnect one-shot và bỏ callback onended khi pause/menu; ambient/context giữ hữu hạn để tiếp tục. Kiểm tra lifecycle đếm context/oscillator/voice thật; không để voice bị suspend rồi phát lại âm cũ khi resume.

Thành tựu dùng icon đã có theo từng mốc trong progression.ACHIEVEMENTS: beacon/nova/drones/well/elder, không phát sinh asset/network request mới hoặc ngụ ý thưởng module. Phase2 dùng cùng sprite elder với tint amber, vòng chuyển pha và thanh HP riêng; beam aim hồng/lock amber/fire sáng cùng geometry thế giới. Không đổi hitbox55u, không shader/texture sinh mới theo phase. Atlas29 entry1024×512, stars/light/pool giữ budget1.1.

## Asset mới 1.3

Sáu SVG nguyên bản CC0-1.0 từ cùng asset-shapes.json/generate-assets.mjs: beacon/beacon-1, beacon-2, beacon-3 thêm cánh/vòng/lõi theo cấp; weapons/pulsar, weapons/ion và ui/salvage. Beacon cấp0 dùng file cũ, appearanceForCoreLevel dùng chung menu/world. Không chỉ phóng to cùng ảnh; không đổi coreRadius44u hoặc ship radius15u. Hash của 23 SVG cũ và hai font giữ nguyên.

28 huy hiệu tái dùng icon trong definitions, không tạo28 texture lớn. Pulsar cyan có lõi tia/đầu-cuối/vòng tầm, Ion violet zigzag theo path thật, boss vẫn hồng/amber. Geometry động dùng Graphics hiện có, cap pulse/trace/trail trong code; không tạo gradient/canvas mỗi frame. Low giữ beam/hit area/sét/thruster/gravity. Atlas29 entry raster64 (Elder128) thành1024×512: thêm tĩnh một hàng, không phải leak qua run. Không font mạng hoặc asset chưa có quyền.


## Beta1.4

Ba SVG CC0 nguyên bản mới: weapons/quasar (quạt lõi xanh ngọc), bastion (vệ tinh lục giác), singularity (vòng kép/tâm tối), cùng asset-shapes/generator/manifest.32entry vẫn atlas1024×512; cũ29SVG và2font giữ nguyên bytes. Build/HUD dùng model evolved tương ứng, không đổi hitbox. SOURCES.json dưới images ghi nguồn/local/license/hash thật.

Nền cuối được bake trong bakeTextures: một tile opaque1024² cho mỗi quality, gộp tinh vân/galaxy/sao để tránh alpha overdraw. High/Low256/112chấm mờ≤1,3px,8/3cloud,300/80điểm galaxy; gradient wrap biên chỉ lúc boot. Hai texture RGBA khoảng8MiB thô, một TileSprite có backing theo viewport. Không ring/physics/magnet ở sao; EXP12–24u và salvage25u giữ sáng/hình riêng. Không texture mạng hoặc gradient/Tween mỗi frame. Low giảm decor, giữ hazard.

Radiation viền/hatch/triangle; Tide arrows lực thật; Quasar quạt xanh ngọc+lõi trắng/tia phụ tím, bosspink/amber. Low/reduced giữ collider cue. Beacon pulse0,9Hz, damage đỏ0,2s đọc HP loss thật, sau đó trả tint nguyên bản từngCore. VFX cùngGraphics/pool, không emitter/listener/timer mới.

### Sửa hồi quy nền sau lượt render đầu

Bản D1VFNgyB dùng texture nebula768² và ba Image1700u: lượt720s có frame p95=51ms dù SceneCPU p95=0,6ms; dense sau đó p95=75,8ms so baseline42,1ms. Giữ nguồn/build/lượt dài tại pre-background-fix-*. Thay bằng một TileSprite có texture opaque1024² gộp tinh vân, galaxy và sao khi boot; High/Low256/112sao và8/3cloud, seam được wrap khi bake. Không thêm gradient/object mỗi frame; không đổi simulation, spawn, loot hoặc hitbox. Hai texture1024² khoảng8MiB thô, backing TileSprite vẫn theo viewport. Loại texture nebula riêng/3Image, texturecount37 thay38. Đo audit và A/B/lượt render lại trước bàn giao; không dùng số bản trước sửa để chứng nhận bản cuối.

## Đường dẫn khi phát hành Pages

Vite base /EVENTIDE/ áp cả dev/preview/production. HTMLfavicon dùng %BASE_URL%, manifest assetURL và BootScene loader dùng import.meta.env.BASE_URL đúng một lần. CSS publicfont /assets/fonts do Vite transform thành /EVENTIDE/assets/fonts khi build; giữ một bản font public, không copy thêm filehash. Không hardcode prefix vào manifest hoặc loader. WebAudio tổng hợp không có file audio ngoài; vẫn unlock từ thao tác Khởi hành. Network smoke kiểm tra HTTP assets cùngorigin/dướiprefix, phân biệt blob SVG nội bộ Phaser với request mạng.
