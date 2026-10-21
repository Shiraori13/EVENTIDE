# Asset local

Phiên bản1.3 có29 SVG hình học nguyên bản, viewBox64×64/tâm32×32, dữ liệu duy nhất ở `scripts/assets/asset-shapes.json`, generator `scripts/assets/generate-assets.mjs`, cấp phép CC0-1.0. Manifest typed `src/assets/manifest.ts` có ID/path/type/size/origin/hitbox-reference/source/license. `node scripts/assets/generate-assets.mjs` ghi đè SVG cùng tên, chỉ chạy khi muốn tái tạo từ nguồn JSON. Font Noto là asset bên thứ ba có SIL OFL, không gán CC0 cho font.

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

Nova, Wisp, Drifter, Leech và Elder có hình riêng (thân/cánh/lõi/giáp gãy/đuôi/cong/rạn sao). Art không đổi HP/radius. SVG source64; Elder và Beacon raster128×128 khi boot để preview rõ. Atlas1024×512 gồm cell128, frame thực64/128 theo manifest. Starfield1024×1024/light1024×1024 bake một lần, không sinh lại khi đổi quality. SpritePool≤640 và pickup visuals≤220; Graphics còn dùng cho telegraph/streak/range/blast. Cao/Vừa/Thấp budget ở presentation.ts, không đổi luật.

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

## Visual identity local · 2026-10-18

Sửa năm SVG từ nguồn hình học CC0 của dự án: player/nova và beacon/beacon, beacon-1/2/3. Nova có silhouette cyan/lõi/động cơ vàng; Beacon có lõi radial/vòng đứt đoạn/cánh theo cấp. Nguồn chỉnh `scripts/assets/asset-shapes.json`, tái sinh `node scripts/assets/generate-assets.mjs`; SOURCES.json ghi SHA256 thật. Không tải asset mới; 27SVG khác và hai font giữ bytes. SVG nguồn64/viewBox±32; Beacon/Elder được raster128 qua manifest để preview rõ, frame vẫn cell128/atlas1024×512. Display size/hitbox giữ tách riêng.

Nền thủy triều code-native ở bakeTextures.ts: radial ellipse nối đường cong, cloud wrap9bản ở biên bake, galaxy lệch tâm, base opaque liền mạch. Không ảnh rỗng/placeholder/gradient mỗi frame. Ba tile Cao/Vừa/Thấp1024² (12MiB RGBA thô, thêm4MiB từ baseline), một TileSprite backing theo viewport; SpaceBackdrop accent hữu hạn và không texture tạm. Bảng mật độ/layer/timing tại design system. Metadata nguồn procedural là mã dự án trong file này; không có giấy phép bên ngoài mới. Beacon nhịp0,2Hz/hit120ms hiện thay giá trị beta1.4 lịch sử ở trên.

## Boss local bổ sung

Thêm enemies/gravemaw.svg, helion.svg, harrier.svg từ hình học nguyên bản CC0 trong scripts/assets/asset-shapes.json. Tái sinh bằng npm run assets:generate, metadata SHA256 trong images/SOURCES.json. Manifest35 entry, atlas1024×640 (thêm một hàng128px≈0,5MiB RGBA); Beacon và cả bốn boss raster128, còn lại64. Hitbox riêng trong config, không suy collision từ SVG. Không file mạng/audio giả hoặc dependency mới. Những số32frame/1024×512 phía trên là lịch sử trước đợt này.

Harrier SVG mũi hướng trục+x, renderer quay theo locked dash path; Gravemaw có thêm nét hàm mở/khép theo state Maw bằng Graphics dùng geometry tối ưu. Đây là trình bày, không scale collider.
