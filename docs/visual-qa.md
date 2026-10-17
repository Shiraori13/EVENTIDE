# QA hotfix beta1.4.1

Baseline thật tại artifacts/v141/reproduction: nút confirm y1995–2044 ngoài clip138–599, scrollTop0/focusread-back. Không đọc được hai ảnh085054/085104 trong môi trường; dựng fixture tương đương từ mô tả prompt, không nhận là đã xem ảnh gốc.

Ảnh hotfix artifacts/v141/visual/{1024,1280,1920}-confirm/committed.png và paused-click-resume.json: geometry/focus kiểm tra trước click (không để auto-scroll che bug), dùng nút thật khi pause rồi resume clock thường. Đã xem ảnh1280-confirm và1024-committed: nút xác nhận/cancel hiện rõ, body có progress5ô; toast có thể chạm viền vùng xác nhận nhưng không che chữ/nút. Test không dùng debug.advance để chứng minh vũ khí sau resume. Kết quả damage/timer/source ở status.

## Hồ sơ hình ảnh beta1.4 (mastery cũ được thay ở1.4.1)

# Visual QA beta1.4 · 2026-10-17

Hai ảnh tham chiếu image(20261017-063723).png và063728 không có ởDownloads/workspace. Đã tái hiện browser1.3 build31/Plasma+Pulsar+Ion5, pool chỉ[Drones,Well], lưu ảnh/stateforced-replacement-before. Không khẳng định đã xem ảnh đính kèm.

Đã mở ảnh runtime beta:1280-mastery,1280-fusion-build,radiation-211-high,tide-low tại artifacts/v14/visual. Mastery có3stat/current→next/cap/budget; Quasar cấp5 và ôtrống saufusion, supports giữlevel. Catalog nhómvai trò, Build badge/name/ID. Panel cóheader/footer/vùng cuộn, B/Esc/blur giữdraft; browser thêm1024×576 tương đương không gian1280zoom125,1280×720,1920×1080, regression sáu tổ hợp zoom/DPR cũ. Không phải native zoom.

Background cuối có galaxy/tinh vân tối và sao chấm nhỏ trong một tile opaque bake1024², EXP4cánh sáng/salvagehex khác hẳn. Radiation viền+hatch vàglyph cảnh báo nhìn rõ, Tide cóarrow hướng lực; Low giữbiên/arrow. Quasar quạt xanhngọc/lõi trắng, secondaryviolet, boss hồng/amber. Ảnh fixtureQuasar/event cóHP lớn chỉ phục vụVFX/cap, không là cân bằng. HP thật/build tronglượt tự nhiên đo riêng.

Ảnh QA đầu phát hiện toastthành tựu chồng eventindicator145px; đã chuyển toast trongHUD xuống trên vùngloadout, giữtoastmenu/panel vàhidden guards/tick80ms. Tooltip support sau swap cómastery/chaos phải giữ cảnguồn ởcurrent vànext: đã sửa calculator preview, thêm regression. Kiểm tra fast-forwardfield cũ hết hạn trước nhánhskip được bổ sung ởunit.

BeaconFeedback unit xác nhậnactualHP-loss→flash0,2s, cooldown overlap/0damage khôngrefresh,lastHit/simtime freeze khi pause,tint trắng trảpaletteCore. Không tween/timer mới. Đã xem ảnh beacon-damage-core3/beacon-restored-core3 và toast-event-clear: đỏ ưu tiên rồi trở về palette vàng/cánh Core3; indicator không bị toast che. Bounds/state/error và hash ở visual-qa-final.json; lượt dài/số đo ghi riêng ở status/performance-report. Chưachơi tay12phút/ngheaudio/nativezoom/GPUdesktop/FirefoxSafari; screenshot vàtextContent không chứng minh cảm giác né/độtrễinput.

---

# Hồ sơ Visual QA1.3 · 2026-10-17

Bốn ảnh tham chiếu image(20261017-005525/005549/005554/005704).png không có ở workspace/Downloads khi audit. Không khẳng định đã đối chiếu chúng. Đã kiểm tra runtime1.2 trước sửa và ảnh1.3 tại artifacts/v13/visual/new; regression ở visual/regression.

Các panel mới được kiểm tra tại1280×720,1366×768,1920×1080, zoom100%/125% emulation vàDPR1/2. Có ảnh28card/filter/nhóm, progress, card cuối/footer và bounds. Core cấp2/3 khác hình, preview không mutate; ảnh cuối1280 cho360→390HP(+30),21/30 tinh khiết, thiếu9 cạnh nút disabled. Header/footer ngoài vùng cuộn, bảng stats cuộn ở giữa.

Đã xem ảnh Core1280, thành tựu/card cuối ởzoom125, fallback Core/thành tựu, Pulsar, ship reverse/gravity vàstorm. Lần đầu affordability bị khuất dưới bảng, đã đưa ra footer và chụp lại. Ảnh weapon lộ lỗi ceil HP lẻ thành101/100,5; đã sửa formatter/clamp, thêm regression và chụp lại. Đo bounds DOM của HUD thật cũng xác nhận vị trí trong viewport. TextContent chỉ hỗ trợ, không thay xem glyph.

Video WebM và ảnh ship right/reverse/diagonal/gravity tại artifacts/v13/video/visual. Input tự động theo clock thường, không chơi tay hoặc input-to-photon. Unit kiểm tra shortest-angle và damage30/60/144FPS. Vị trí/camera dùng cùng alpha, không đổi physics. Pulse cyan, Ion violet, boss hồng/amber; Low giữ cues trong renderer. Storm có HP fixture lớn, không dùng làm bằng chứng cân bằng hoặc layout HUD với HP thực.

Đã xem ảnh kết quả thực artifacts/v13/long-run/result.png:12:00/cấp33/kills1002/+17Stardust và Echo đúng dấu, không clipping ở1280×720. Đây là lượt render720s thường trên BpMrDiaJ; toast kết quả tạm xuất hiện5s, không chặn nút. Số đo chốt trong performance-report. Chưa native zoom, Firefox/Safari, GPU vật lý, nghe đánh giá audio hoặc chơi tay12phút.

---

# Visual QA1.2 · 2026-10-16

Ảnh1.2 tại artifacts/v12/visual/{1280,1366,1920}: Phi thuyền, Danh mục, Thành tựu, Build và reroll; boss-phase2.png cho HUD/phase. E2E kiểm tra bounds và đường quay về/focus/blur/nested draft tại ba viewport100%. Regression1.1 được chạy lại đủ sáu tổ hợp viewport/zoom/DPR, output mới tại artifacts/v12/visual/regression. Đã xem ảnh thật Phi thuyền/Build/reroll; font Việt không thấy tách dấu. Sau kiểm tra hình đã chỉnh focus nút đóng visible thay vì nút tra cứu nằm dưới vùng cuộn.

HP base100 không cộng Core, module damage/rate cụ thể, hai ô hỗ trợ trống/đã chọn, Corruption riêng và chỉ số hiệu lực đọc được. Huy hiệu không cộng tiền/stat. Catalog/Build chỉ đọc, không nút mua hoặc chọn miễn phí. Những kiểm tra này không thay native zoom, chơi tay hoặc input-to-photon.

Đã xem lại ảnh cuối Phi thuyền/Build ở1280×720: footer Trở về nhận focus và nằm trong viewport; nội dung dài cuộn phía trên. Đã xem artifacts/v12/long-run/result.png từ bundle DW48mbSI:12:00/cấp33/1004kills/+17Stardust, chữ Việt/Echo không clipping. Toast huy hiệu Lá chắn ngân hà hiện tạm ở phần trên; không chặn nút kết quả. Đây là lượt autoplay render đủ720s, tách khỏi ảnh result dùng hook và hồ sơ1.1 bên dưới.

## Hồ sơ VNext1.1

Hai file ảnh tham chiếu nêu trong prompt không có trong workspace hoặc Downloads. Đã tạo ảnh từ build cũ thật tại `artifacts/vnext/before-ui/{1280x720,1920x1080}/menu.png` và `pause.png`; không suy ra gameplay từ ảnh tĩnh. Ảnh pause cũ tái hiện dấu Việt tách/giãn ở “Giữ lấy khoảnh khắc.”; source UTF-8/NFC và lang=vi đã đúng, không có split code-unit.

Ảnh VNext tại `artifacts/vnext/visual/`, mỗi tổ hợp có menu/help/core/echo/settings/hud/pause/upgrade/result:

| Viewport gốc | Zoom mô phỏng | DPR gốc | CSS viewport |
|---|---|---|---|
|1280×720|100%|1|1280×720|
|1280×720|125%|1|1024×576|
|1366×768|100%|1|1366×768|
|1366×768|125%|2|1093×614|
|1920×1080|100%|1|1920×1080|
|1920×1080|125%|2|1536×864|

Zoom được mô phỏng bằng CSS viewport nhỏ lại và deviceScaleFactor tăng tương ứng, không phải thao tác menu zoom native của Chrome. Bounds dialog kiểm tra bằng CSS px, nút cuối cuộn tới được, focus/keyboard còn đúng. Không nhận độ phân giải vật lý là viewport trình duyệt. Cần kiểm tra zoom native/headed trên máy người dùng để xác nhận tuyệt đối cùng cách raster.

Đã xem ảnh render thật: menu/pause trước và sau, glyph Sans/Serif trong Phaser Canvas Text, menu/HUD/upgrade, cài đặt/result ở matrix; nét chữ có dấu đầy đủ, không thấy clipping/giãn dấu như baseline. `font-canvas-sans-serif.png` chứa toàn bộ chuỗi mẫu từ prompt, gồm Ă/Â/Ê/Ô/Ơ/Ư/Đ, toàn nhóm dấu kép và ỳ/ý/ỷ/ỹ/ỵ. TextContent/font load status chỉ hỗ trợ test, không được dùng thay ảnh.

`font-failure-pause.png` kiểm tra fallback vẫn chơi được; `font-late-menu.png` kiểm tra font tải sau timeout swap đúng. Gameplay không có Canvas Text; mẫu QA dùng style factory sau FontService. UI dùng Noto local, tracking nhỏ cho label và0 cho tiêu đề/câu Việt, line-height/padding chừa dấu trên/dưới.

`gravity-high-active.png`, `gravity-low-warning.png`, `gravity-low-active.png`: Well cyan và môi trường magenta/amber khác nhận diện, radius205/310 là world unit thật. Streak có bán kính giảm theo simulation time, không chỉ quay tại chỗ; particle cap High96/Low32. Warning và lực hút/nổ được kiểm tra riêng bằng simulation; ảnh đơn không chứng minh quỹ đạo hút. Low giữ viền/core/hướng hút/đạn địch/marker Beacon. Ba quái có silhouette mới; Elder raster128 trong atlas, không đổi hitbox.

Chưa đo input-to-photon, chưa chơi cảm nhận bằng tay đủ12 phút, chưa nghe đánh giá chất lượng âm thanh. Kiểm tra dài bằng bot/render và thống kê frame được ghi riêng trong performance-report, không thay đánh giá cảm giác thực tế.

Đã xem ảnh kết quả của lượt render đủ720s thật tại artifacts/vnext/long-run/result.png:12:00/cấp34/1000kills/+17Stardust, title và Echo có dấu không clipping ở1280×720. Ảnh này tách khỏi các result UI đặt gần cuối bằng hook.

Sau khi đo xong đã chụp và xem weapons-gravity-high.png/low.png trên đúng BpMrDiaJ: Pulsar cyan có lõi/đầu tia/vòng tầm, Ion có zigzag/path6target, gravity có viền và hướng hút; Low vẫn giữ các cues. Fixture xóa XP để không bị modal nâng cấp chặn trước mốc capture, pause ở geometry active và ẩn UI; đây là ảnh VFX, không natural playtest. Lần capture đầu timeout do modal XP, không tính pass; lượt sau metadata/ảnh đầy đủ tại weapon-visual-check.json.

## QA sau sửa hồi quy nền

Đã mở ảnh background-audit-after/dense-1.png: lớp sao/nebula tối không che đạn, Bastion có silhouette mới. HUDHP rất lớn là fixture stress, không dùng ảnh này để đánh giá HP chuẩn.3browser High/Low/event/Quasar/lifecycle vàproduction smoke pass trênBC9WlYb0; texturecount37 ổn định sau5vòng, không thay simulation. Bộảnh/stateBeacon/toast được chụp lại đúngCore3 HP390→384 bằngdamage thật, không chỉ patchappearance. Lượt dài/A-B cuối ghi riêng trongperformance-report; D1VFNgyB đã lưu lịch sử và không dùngchứngnhậnbảncuối.

Lượt cuối BC9WlYb0 đủ720s, kết quả34level/1002kills/+17 vàEcho; ảnh tạiartifacts/v14/long-run/result.png. Frame26,8/34,7/41,7ms vàA/B/stressđã đượcscriptvalidate, không gán dữ liệuD1choBC9. Chi tiết hiện hành ởperformance-report/status.

Đã xem result.png cuối: font Việt vàEcho đọc được, các nút nằm trongviewport. Toast5s ởmànkếtquả vẫnche mộtphần mô tả (hành vi1.3), khôngche nút; giữrawảnh thật và ghi nhận hạn chế này, không sửaảnh để che vấn đề.

Hotfix cuối BA-ds7lV: sáu ca click/draft/fail/lifecycle pass1,1phút; production C7wE2SBI pass. Quasar5 và thông báo commit hiện cùng panel, ô nguồn còn lại trống; chưa kiểm tra bằng chơi tay hoặc native zoom.
