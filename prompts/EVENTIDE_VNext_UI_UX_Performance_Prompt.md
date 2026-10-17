# Prompt nâng cấp EVENTIDE về UI UX và hiệu năng

Dùng prompt này với **repo MVP hiện có**, không dùng để tạo lại dự án. Đính kèm hai ảnh menu/pause nếu có; AI cần chạy game và xem mã thực để kiểm tra gameplay, không suy ra nguyên nhân giật từ ảnh tĩnh.

---

Bạn là kỹ sư game web 2D phụ trách cải thiện chất lượng hình ảnh, trải nghiệm điều khiển và hiệu năng của **EVENTIDE – Thủy Triều Hư Không**. Hãy sửa trực tiếp MVP hiện tại thành bản tiếp theo, theo yêu cầu chi tiết bên dưới.

Tôi muốn một đợt cải tiến hoàn chỉnh có bằng chứng trước/sau: chữ tiếng Việt đúng, giao diện nhất quán, tàu/quái đẹp hơn, lực hút dễ nhìn, điều khiển mượt và lượng EXP tồn đọng không làm số đối tượng tăng vô hạn. Hãy tìm và sửa nguyên nhân thực tế, kiểm thử, cập nhật tài liệu; không chỉ đưa khuyến nghị hoặc sửa vài màu CSS rồi báo đã tối ưu.

## 1. Hiện trạng và mức độ chắc chắn

Người chơi báo cáo:

1. UI còn lỗi hiển thị font tiếng Việt, element và asset chưa hấp dẫn.
2. Skill hố hút chưa có chuyển động hút dễ quan sát.
3. Tàu có cảm giác khựng; khi đông quái, asset và hiệu ứng thì độ mượt giảm.
4. Nhiều orb EXP chưa nhặt tồn tại lâu; nghi ngờ đây là một nguồn tăng tải.

Hai ảnh tham chiếu là `image(20261016-053908).png` và `image(20261016-053923).png`, tương ứng menu và pause. Có thể thấy chữ có dấu ở các câu tiêu đề/khẩu hiệu bị tách hoặc giãn bất thường, nhất là câu “Giữ lấy khoảnh khắc.” và “Khi mọi ngôi sao đã tắt, hãy là ánh sáng cuối cùng.” Menu hiện dùng nền xanh đen, vàng ấm, thương hiệu EVENTIDE và bố cục không gian rộng.

Ảnh không cho biết chính xác font nào, DOM hay Canvas đang render, không chứng minh lỗi Unicode, không xác định nguyên nhân tụt FPS và không cho thấy đủ gameplay để đánh giá quái/hố hút. Hãy đối chiếu mã nguồn và chạy game. Nếu không truy cập được ảnh, vẫn tiếp tục kiểm tra repo theo báo cáo trên và ghi rõ phần chưa đối chiếu ảnh; không bịa nhận xét về nội dung chưa xem.

Đừng coi giả thuyết “orb không biến mất gây lag” là kết luận trước khi đo. Đồng thời vẫn phải quản lý vòng đời và giới hạn hợp lý cho pickup, quái, đạn, particle và UI.

## 2. Đọc repo và giữ phạm vi

- Đọc `AGENTS.md`, `GAME_SPEC.md`, README, package/lockfile và tài liệu kiến trúc, cân bằng, asset, trạng thái hiện hành. Nếu tên khác, tìm tài liệu tương đương.
- Dùng code và phiên bản dependency thực tế; kiểm tra tài liệu chính thức đúng phiên bản trước khi áp API. Không nâng Phaser/Vite lên major mới chỉ để làm đợt polish.
- Đây là thay đổi trên MVP đã có. Không dựng project mới, viết lại mọi system, reset save hoặc xóa các thay đổi người dùng.
- Xác định các behavior hiện tại đã đúng và giữ chúng; chỉ refactor phần có vấn đề hoặc cần tách để sửa an toàn.
- Chưa thêm nhân vật, map, crafting, multiplayer, tài khoản hoặc hệ thống nội dung mới.
- Không “tối ưu” bằng cách giảm âm thầm số quái, tốc độ sinh, lượng XP, tốc độ tàu hoặc thời lượng màn. Nếu cần thay gameplay, nêu rõ đề xuất và lý do; mặc định giữ gameplay.
- Hoàn thành các giai đoạn bên dưới trong cùng tác vụ. Không dừng ở audit hoặc chờ tôi nhắc sau mỗi bước.

## 3. Những luật phải được bảo toàn

Đối chiếu đặc tả hiện hành trước khi sửa. Baseline đã thống nhất gồm:

- Beacon ở tâm, tự sạc trong 720 giây mô phỏng; tàu và Beacon có HP riêng, một trong hai chết thì thua; thua ưu tiên thắng nếu cùng tick. Không cần giết boss để thắng.
- Vùng sáng hồi HP tàu, làm chậm quái thường và giảm Corruption; không tạo bất tử và Beacon không tự hồi.
- Corruption 0–100; ngoài +4/giây, trong −8/giây; ngưỡng 50 nhân 1,2 sát thương tàu gây/nhận, không tăng damage Beacon nhận.
- Ba module Plasma Orb, Orbital Drones, Gravity Well; Plasma cấp 3 Mini Sun, cấp 5 Supernova, giữ cùng ô.
- Gravity Well của tàu chỉ hút quái; gravity môi trường hút tàu/quái, không hút Beacon, đạn hoặc XP. Không có sát thương bí mật ở tâm gravity nếu thiết kế hiện hành chưa có.
- Quái ngoài camera vẫn có thể đi tới và tấn công Beacon. Ẩn render không được làm ngưng logic này.
- Pause, nâng cấp, ẩn tab không tiến triển gameplay. Độ mượt render không được làm timer, damage hoặc spawn phụ thuộc FPS.
- XP nhặt, Stardust tinh khiết, Beacon Core, Echo và settings phải giữ đúng; không reset tiến triển cũ sau cập nhật.

Nếu repo có yêu cầu mới hợp lệ khác baseline này, mô tả khác biệt và theo đặc tả mới nhất. Không sửa tài liệu để hợp thức hóa bug chưa được xử lý.

## 4. Audit và baseline trước khi tối ưu

### 4.1 Tạo kịch bản tái hiện

Chạy local, đọc script thực tế. Tạo một đường tái hiện bằng seeded RNG/dev scenario hoặc cách tương đương:

- **Nhẹ:** di chuyển gần Beacon với ít quái, ít pickup và không có hiệu ứng lớn.
- **Đông quái:** mật độ cao trong giới hạn gameplay hiện hành; nhiều va chạm và module cùng hoạt động.
- **EXP tồn đọng:** nhiều đợt quái chết khi người chơi không nhặt XP trong một thời gian; kiểm tra cũ/mới và tình huống chạm cap.
- **Hiệu ứng cuối màn:** Elder Star, nhiều đạn, Gravity Well và gravity môi trường; không chỉ kiểm tra menu.
- **Vòng đời:** vào trận, pause/resume, về menu/chơi lại ít nhất 5 lần và một lượt đủ thời lượng.

Đối chiếu cùng seed, số lượng thực thể logic, đường di chuyển, thời điểm, viewport, thiết bị, renderer và quality mode khi so trước/sau. Nếu đổi số sprite EXP do gộp, ghi đây là biến cần đo và giữ tổng giá trị EXP bằng nhau. Tạo scenario không ghi đè save thật.

### 4.2 Đo đúng vấn đề

Thêm instrumentation dev-only gọn, có thể bật/tắt. Không log hoặc cập nhật text mỗi frame, không lưu lịch sử vô hạn.

Thu thập nếu môi trường cho phép:

- Frame interval: median, p95, p99, số lần >33,3 ms và >50 ms; nêu refresh rate màn hình. FPS trung bình không đủ chứng minh hết khựng.
- Thời gian CPU của update và các system nghi ngờ: combat/collision, pickup, spawn, gravity, render preparation và UI.
- Số quái, đạn, pickup logic, pickup hiển thị, particle, physics body active, pool capacity và đối tượng đang dùng.
- Xu hướng heap/GC, listener, timer/tween và texture count; phân biệt pool chủ động giữ để tái sử dụng với leak tăng theo lượt.
- Renderer WebGL/Canvas, canvas backing size, CSS size, DPR/render scale; kích thước texture/hiệu ứng lớn nếu có dấu hiệu GPU fill-rate.

Dùng Performance/Memory của trình duyệt để xác định main-thread stall, GC, DOM/layout hoặc render/GPU khi có dữ liệu. Không xem CPU update thấp là bằng chứng GPU không nghẽn. Không gọi frame interval là số đo input-to-photon thực.

Lấy baseline trước khi thay đổi. Ví dụ mỗi scenario warm-up khoảng 10 giây rồi lấy mẫu ít nhất 60 giây, lặp 3 lần nếu khả thi. Đối chiếu production preview ở build cũ/mới cho kết luận hiệu năng; dev server và headless có thể dùng chẩn đoán nhưng không thay thế báo cáo tương đương. Có thể dùng thư mục/build baseline riêng để tránh sửa đi rồi mất đối chứng.

Nếu thiếu khả năng trace GPU/heap, ghi rõ chỉ số chưa có và dùng số đối tượng + quan sát có kiểm soát; không chế số liệu. Đừng tăng scope thành xây hệ thống telemetry online.

### 4.3 Báo cáo audit ngắn rồi tiếp tục sửa

Với mỗi vấn đề ghi: vị trí code, bằng chứng, nguyên nhân xác nhận hoặc giả thuyết, cách sửa, rủi ro và phép kiểm tra. Không dừng sau báo cáo này.

## 5. Sửa chữ tiếng Việt ở cả DOM và Canvas

Đây là yêu cầu P0 về độ đúng, không chỉ đổi font theo cảm tính.

- Kiểm tra UTF-8 của HTML/TS/JSON/CSS, `<meta charset="UTF-8">`, ngôn ngữ `vi`, chuỗi localization và nguồn dữ liệu.
- Phân biệt lỗi encoding với thiếu glyph, dấu tổ hợp, fallback font, letter-spacing, hiệu ứng tách từng ký tự và clipping. Chuỗi nhìn hỏng không mặc nhiên là mojibake.
- Kiểm tra tiêu đề serif, body, button, tooltip, modal, HUD và các text do Phaser tạo. CSS của DOM không tự sửa được Text style trong Canvas.
- Dùng font có đủ glyph tiếng Việt và weight thực tế cần dùng; bundle local nếu đưa font vào dự án, ghi license. Không phụ thuộc font chỉ có trên máy lập trình hoặc gọi CDN lúc chơi.
- Nếu giữ serif cho thương hiệu/tiêu đề, chọn face render dấu Việt chính xác; body/HUD dùng face dễ đọc. Không ép mọi text sang font pixel thiếu bộ ký tự.
- Kiểm tra source Unicode NFC/NFD. Chuẩn hóa NFC tại ranh giới text hiển thị/localization nếu phù hợp; không strip dấu, không regex phá dấu và không đổi ID/save key.
- Không dùng `split('')` để bọc hoặc giãn từng code unit của tiếng Việt. Nếu hiệu ứng cần tách chữ, xử lý grapheme đúng hoặc bỏ hiệu ứng cho vùng text bị lỗi.
- Giảm/bỏ tracking tùy tiện ở câu tiếng Việt có dấu, điều chỉnh line-height/padding để không cắt dấu trên/dưới. Không coi letter-spacing=0 là thuốc sửa tất cả nếu font thật đang thiếu glyph.
- Preload/load đúng face và weight trước khi tạo text Canvas quan trọng. Dùng Font Loading API phù hợp, có timeout/fallback; hoàn tất load thì redraw/recreate text bị tạo sớm khi cần. Không treo boot vô hạn nếu font tải lỗi.
- `document.fonts.check` hoặc load thành công không thay thế kiểm tra hình ảnh thực của dấu. Không chuyển hết sang BitmapText nếu chưa có atlas đủ glyph và shaping/mark placement phù hợp.
- Có style/token tập trung cho font DOM và style factory Text Phaser để không sót một màn. Không monkey-patch prototype toàn engine nếu không có lý do đã chứng minh.

Bộ chuỗi kiểm tra, giữ đầy đủ chữ và dấu:

```text
EVENTIDE — Thủy Triều Hư Không
Giữ lấy khoảnh khắc.
Khi mọi ngôi sao đã tắt, hãy là ánh sáng cuối cùng.
Tàn Tích Ngân Hà
Hướng dẫn · Cài đặt · Tiếp tục · Chơi lại · Về menu
Máu tối đa · Phạm vi thu thập · Stardust tinh khiết
Ă Â Ê Ô Ơ Ư Đ ă â ê ô ơ ư đ
Ắ Ằ Ẳ Ẵ Ặ ấ ầ ẩ ẫ ậ ế ề ể ễ ệ ố ồ ổ ỗ ộ
ớ ờ ở ỡ ợ ứ ừ ử ữ ự ỳ ý ỷ ỹ ỵ
```

Kiểm tra cold cache, font failure/fallback, browser zoom 100% và 125%, DPR khác nhau nếu có; ảnh trước/sau cả menu và pause. Không chỉ kiểm tra textContent bằng test rồi coi font đã đẹp.

## 6. Cải thiện hệ thống UI mà giữ nhận diện hiện tại

Giữ nền xanh đen, vàng ấm, cyan và không khí thiên văn của menu. Có thể giữ tiêu đề EVENTIDE lớn và bố cục rộng nếu hiển thị tốt; tập trung sửa chữ, tỷ lệ, khoảng cách, phân cấp và độ rõ. Không thay toàn bộ bằng dashboard hoặc các panel neon rối mắt.

- Tạo/chuẩn hóa design tokens: màu nền/panel/text/border/accent, spacing, radius, type scale và z-index.
- Bố cục thống nhất giữa menu, hướng dẫn, Beacon Core, Echo, settings, pause, nâng cấp và kết quả.
- Text mô tả đọc được ở desktop; tránh các dòng quan trọng quá nhỏ/chìm. Gợi ý body khoảng 14–16 CSS px và line-height hợp lý, điều chỉnh theo giao diện thật thay vì khóa cứng mọi chỗ.
- Button có primary/secondary/destructive rõ, hover/focus/pressed/disabled nhất quán, focus nhìn thấy được. Focus ring không cắt glyph hoặc làm nhảy kích thước.
- Modal vừa nội dung, padding thoáng, title rõ, không để menu/pause hiện nhiều mảng trống do scale sai; không che nút ở viewport thấp.
- HUD không che đường né; HP tàu/Beacon, charge, Corruption và XP dễ phân biệt. Icon có ý nghĩa; tooltip ngắn giải thích Corruption và module.
- Modal nâng cấp trình bày icon, tên, cấp và thay đổi thực tế. Không dùng cùng một icon hình tròn cho mọi kỹ năng.
- Hạn chế CSS blur/backdrop-filter, shadow nhiều lớp hoặc animation DOM diện tích lớn trong trận nếu profiler cho thấy đắt. Không tăng hiệu ứng UI làm mất phần tối ưu gameplay.
- Test 1280×720, 1920×1080 và ít nhất một viewport phổ biến thấp hơn như 1366×768. Chú ý chiều cao viewport thực trừ thanh trình duyệt, không lấy độ phân giải màn hình thay cho viewport.
- Không bắt buộc chuyển mọi UI sang framework mới. Sửa layout hiện có có kiểm soát, giữ event/state đúng.

## 7. Nâng asset tàu, quái và đạn

Tạo một bộ hình thống nhất có silhouette, màu, độ tương phản và chuyển động có chủ đích. Chỉ đổi màu các hình placeholder là chưa đủ.

- **Nova:** mũi tàu, cánh/thân, lõi cyan, engine trail ngắn; hướng xoay ổn định, không rung do vector gần 0.
- **Static Wisps:** sinh vật năng lượng nhỏ với lõi rõ và đuôi ngắn, ít lớp glow.
- **Hollow Drifters:** xác tàu nặng, bất đối xứng hoặc mảnh giáp gãy, chuyển động chậm đọc được.
- **Void Leeches:** hình thon/cong có đầu hướng mục tiêu, animation nhẹ gợi bám; không trộn với Wisps chỉ bằng màu khác.
- **Elder Star:** ngôi sao chết có cánh/vành nứt và hai telegraph phân biệt; thanh HP không che đạn.
- **Đạn ta/địch:** khác shape/outline/brightness; đạn địch và cảnh báo nguy hiểm phải đọc được trong cảnh đông.
- Giữ marker quái đánh Beacon, không giấu nó trong texture mới.
- Animation giới hạn frame hoặc texture atlas phù hợp. Damage flash/tiny recoil là hiệu ứng ngắn, có cap; không tạo hàng chục emitter/text object cho mỗi quái.
- Có thể tạo sprite/SVG/atlas nguyên bản đơn giản nếu chưa có artist. Tách source và asset runtime; bake texture một lần ở load/build thay vì vẽ lại hình phức tạp mỗi frame.
- Dùng manifest và thư mục hiện có; ghi ID, path/generator, frame size, origin, scale, hitbox, nguồn và license. Không tải asset ngẫu nhiên hoặc thêm đường dẫn không tồn tại.
- Thay art không tự đổi HP, collision radius hoặc phạm vi vũ khí; nếu sửa hitbox để khớp hình, ghi rõ và kiểm tra lại gameplay.
- Pool sprite hợp lý; không tạo renderer/DOM riêng cho từng quái. Chỉ dùng health bar/damage number theo nhu cầu và có budget.

## 8. Làm hố hút rõ ràng cả về hình ảnh lẫn thông tin

Hai loại cần phân biệt ngay:

| Thuộc tính | Gravity Well của tàu | Gravity môi trường/hố đen cuối |
|---|---|---|
| Nhận diện | Cyan + tím điện, dấu hiệu của người chơi | Magenta/amber hoặc palette nguy hiểm khác, icon môi trường |
| Tác động | Hút quái rồi nổ | Kéo tàu và quái, không tự nổ gây damage nếu luật chưa có |
| Dấu hiệu cần đọc | Phạm vi hút, chuyển động xoáy vào tâm, thời điểm nổ | Cảnh báo, phạm vi lực, hướng hút, thời gian hoạt động |
| Không tác động | Tàu, Beacon, XP, đạn | Beacon, XP, đạn |

### 8.1 Chu kỳ hình ảnh

1. **Telegraph:** vòng nét đứt/segmented và vòng tiến độ hoặc biểu tượng báo hình thành. Vùng môi trường giữ warning 2 giây theo luật; không áp timer này bừa lên module nếu cooldown/telegraph khác.
2. **Active:** lõi tối, accretion ring đơn giản, các đường hoặc hạt đi xoắn ốc **từ ngoài vào trong**, giảm bán kính theo thời gian. Phải thấy hướng vào tâm, không chỉ vòng quay tại chỗ hoặc hạt bay ra.
3. **Tác động thật:** quái trong vùng thay đổi quỹ đạo theo gravity logic. Nếu là môi trường, tàu cũng bị kéo nhưng vẫn điều khiển thoát được. Đừng thay gravity logic bằng animation trang trí hoặc tween teleport.
4. **Kết thúc:** Well của tàu có nhịp co và shockwave nổ ngắn đúng lúc damage; môi trường tan/fade, không phát hình nổ gợi damage sai luật.

### 8.2 Tính nhất quán

- Viền phạm vi lực hiển thị khớp radius physics/world và camera zoom; không lấy displayWidth tự suy phạm vi.
- Có indicator nhỏ để biết loại nguồn hút. Tooltip/hint xuất hiện có tiết chế, không nhãn dài trên mọi particle.
- Vòng nổ khớp blast radius của module; không dùng đỏ “vùng chết” ở lõi môi trường khi chưa có damage tại đó.
- Khi pause, vòng đời telegraph/active/detonate và thời điểm damage đều đóng băng; resume không nổ sớm.
- Giữ z-order: nền → vùng/hazard → pickup/quái → tàu/đạn quan trọng → cảnh báo/UI, điều chỉnh để không giấu nguy hiểm.
- Decor “mảnh bụi bị hút” phải là FX riêng; không kéo XP hoặc thiên thạch gameplay nếu thiết kế không cho phép.

### 8.3 Budget FX

- Chọn texture ring/atlas quay và số hạt hữu hạn; không cần shader lensing nặng hoặc full-screen blur.
- Có cap toàn cục và cap theo effect, không tạo một emitter vô hạn cho mọi Well/quái.
- Đề xuất budget khởi đầu, chưa phải số đã tối ưu: Low khoảng 24–48 hạt hút hiển thị tổng, High khoảng 64–128; kiểm tra và điều chỉnh theo profiler. Logic lực và damage không phụ thuộc số hạt.
- Pool/reuse và thu hồi sau effect, không leak tween/listener/texture. Animation hạt dùng delta/elapsed, không cấp phát vector/array mới hàng loạt mỗi frame.
- Chế độ Low vẫn giữ core, viền phạm vi, hướng hút và telegraph bắt buộc. Tăng vẻ đẹp phải đi kèm kiểm tra cảnh đông, không chỉ chụp effect đứng một mình.

## 9. Sửa độ khựng và frame pacing của tàu

Phân biệt simulation, input, render và camera để tìm đúng nguyên nhân.

- Kiểm tra update/physics đang dùng delta nào, có clamp quá mạnh hoặc bỏ bước không; có cập nhật vị trí hai lần ở Scene và system, vừa setPosition vừa velocity, hoặc vừa tween vừa physics không.
- Kiểm tra camera lerp, follow, rounding và render interpolation. Jitter có thể do tàu và camera dùng hai thời điểm khác nhau hoặc vị trí bị round trong logic.
- Không throttle movement/input để tối ưu. Input và di chuyển phải xử lý mỗi bước simulation theo nhịp đã chọn; giảm tần suất chỉ cho tác vụ phụ không ảnh hưởng cảm giác điều khiển.
- Giữ float trong world simulation. Nếu pixel art cần rounding, thực hiện tại presentation nhất quán với camera, không làm tàu đi giật từng pixel logic.
- Nếu fixed timestep gây render bậc thang, dùng previous/current và alpha nội suy ở lớp trình bày cho tàu và camera khi cần. Tránh nội suy hai lần hoặc thêm smoothing nặng khiến input trễ.
- Nếu dùng variable step, kiểm tra behavior tương đương ở frame rate khác, tránh đường chéo/tốc độ/damage phụ thuộc FPS. Không sửa tất cả bằng cách nhân delta lần thứ hai.
- Không chuyển sang 30 FPS hoặc tự tăng timeScale để che jitter; không bù hàng giây khi frame dài.
- Kiểm tra rotate theo hướng bay không reset khi thả phím; keyboard blur/visibility không để phím kẹt.
- Theo dõi GC/long task cùng lúc nhân vật khựng. Chứng minh đã xử lý bằng cùng kịch bản đi thẳng, chéo, đổi hướng, bật FX và đông quái.
- Render interpolation không được thay vị trí collision authoritative hoặc làm shader/ảnh vũ khí lệch khỏi nguồn damage.

## 10. Tối ưu workload sau khi xác định bottleneck

Ưu tiên phần có bằng chứng. Không áp mọi kỹ thuật phức tạp chỉ để trông như đã tối ưu.

### Combat và truy vấn

- Tìm các vòng lồng projectile×enemy, drone×enemy, gravity×enemy, pickup×pickup và nearest-target sort toàn bộ danh sách mỗi frame.
- Dùng squared distance và broad phase/spatial grid nếu profiler chỉ ra lợi ích. Query đúng cell và khoảng di chuyển của đạn, không bỏ collision ở ranh giới cell.
- Không tạo grid cho mọi loại chỉ vì hình thức; tránh rebuild/tạo Map/array tạm quá nhiều làm GC nặng hơn.
- Không dùng filter/map/sort và cấp phát object/vector hàng loạt trong hot path nếu có thể reuse buffer/cached result.
- Cached target phải vô hiệu khi chết/ra tầm. Nếu giảm tần suất target selection/AI phụ, giữ movement và damage chính xác; stagger các job để không dồn spike vào một frame.

### Render và UI

- Kiểm tra Graphics phức tạp có clear/redraw mỗi frame, gradient/shadow/blur/postFX lớn, blend-mode/texture switch hoặc lượng overdraw.
- Bake/cache nội dung tĩnh, dùng sprite/atlas ở nơi có lợi; không ép toàn bộ game qua RenderTexture toàn màn mỗi frame.
- Chỉ cập nhật text/DOM khi giá trị hiển thị đổi; số đồng hồ không cần setText mỗi frame nếu chỉ hiển thị giây. Throttle số debug, không phải timer simulation.
- Không tạo text object mỗi lần damage vô hạn. Nếu giữ damage numbers, pool, gom/giới hạn số lượng và lifetime.
- Canvas backing resolution có thể cap/DPR setting có giải thích; UI vẫn rõ. Không hạ độ phân giải âm thầm giữa trận hoặc recreate canvas/render target mỗi frame.
- Culling: ẩn/dừng FX presentation ngoài camera khi phù hợp; không dừng quái/đạn/Beacon interaction cần thiết. Visible=false không mặc nhiên dừng physics, update, timer hoặc giữ tham chiếu.

### Pool và vòng đời

- Tận dụng pool hiện có nếu đúng. Pool có cap, reset position/velocity/alpha/scale/tint/TTL/cooldown/owner/listener/reference khi acquire/release.
- Kiểm tra trạng thái active, visible, physics body và membership theo engine đang dùng. Chỉ giấu hình không phải giải phóng workload.
- Không destroy/recreate tài nguyên GPU liên tục để giả giảm count; không giữ pool tăng vô hạn theo tổng lịch sử spawn.
- Cleanup enemy/đạn chết, hết TTL, effect xong, scene shutdown, restart. Collider/timer/tween đăng ký một lần đúng owner, không thêm mỗi update.

## 11. Quản lý EXP tồn đọng mà không mất phần thưởng

Người chơi lo EXP lâu không biến mất gây nặng. Mặc định giải pháp là **gộp/đại diện lại dữ liệu và thu hồi object dư**, không xóa giá trị EXP chưa nhặt hoặc tự cộng XP từ xa.

### 11.1 Chẩn đoán

- Đếm riêng số giá trị/cluster logic, sprite, physics body, tween/emitter đi kèm, chi phí pickup/magnet query và tổng EXP trên mặt đất.
- Xác định orb cũ đang thật sự tốn gì: render, physics, vòng scan, listener, tween hay object allocation. Không coi mỗi orb là một hệ vật lý phức tạp nếu code hiện tại không như vậy.

### 11.2 Chính sách bắt buộc

- EXP mới vẫn rơi gần điểm quái chết theo luật.
- Orb cũ/gần nhau được gộp cục bộ theo spatial cell/bán kính hợp lý thành cluster có giá trị bằng tổng; không gom toàn bản đồ về một chỗ.
- Dùng simulation age và lịch merge theo interval/budget, không pairwise O(n²) mỗi frame. Stagger nếu cần.
- Cluster hiển thị tier/icon/kích thước phân biệt nhưng có giới hạn visual; pulse nhẹ, không một emitter riêng cho mỗi orb.
- Không gộp orb đang được nhặt/homing theo cách làm mất, nhân đôi hoặc teleport mục tiêu. Tách trạng thái available, attracted, collected/released rõ.
- Việc merge không được chuyển XP xa vào pickup radius của tàu để được thu miễn phí. Giữ tính địa phương, kiểm tra biên vùng nhặt; nếu cần giữ nguyên các cluster gần tàu và chỉ compact cluster ngoài vùng đó.
- Không tự cộng XP khi orb cũ hết tuổi; không tạo expiry làm người chơi mất thưởng. Nếu muốn quy tắc XP biến mất thật, đó là thay đổi gameplay riêng, chưa thuộc mặc định lần sửa này.

### 11.3 Giới hạn object cứng và fallback khi đầy

- Có config `maxActivePickupVisuals`, `mergeCellSize`/`mergeRadius`, `mergeInterval`, `minMergeAge`, `visualCullPadding` hoặc tên tương đương theo code.
- Khi gần cap, compact trước. Khi pool/cap đầy, vẫn giữ XP bằng một cấu trúc tổng hợp theo khu vực hữu hạn trên map, hoặc cách khác chứng minh không mất giá trị. Không push từng loot vào một mảng overflow vô hạn rồi gọi là đã giới hạn.
- Phân biệt dữ liệu XP mặt đất và số sprite/body hiển thị. Khu vực ngoài camera có thể giữ tổng hợp nhẹ, khi quay lại tái hiện cluster tại vị trí hợp lệ, thu được đúng giá trị và giữ bán kính nhặt.
- Với cấu trúc cell, giới hạn số cell theo kích thước map và quy tắc chia; không tạo vô hạn subcluster/callback cho mỗi lần drop.
- Không để XP ở gần người chơi vô hình hoặc không nhặt được vì cap: ưu tiên materialize cluster liên quan hoặc query thu thập trên representation logic, đồng thời có marker tương ứng.
- Recycle sprite/body/tween của orb đã gộp hoặc thu xong. Body thụ động không cần physics engine nếu khoảng cách/broad phase đã đủ; chọn theo kiến trúc thực tế và đo trước/sau.
- Nếu một cơ chế đơn giản hơn đã đạt cap, bảo toàn XP và tốt hơn khi đo, dùng nó thay vì dựng ledger phức tạp. Phải mô tả fallback khi tất cả cluster còn lại ở xa nhau; không chỉ xử lý trường hợp dễ.

### 11.4 Bất biến cần test

Tại checkpoint ổn định sau xử lý loot:

```text
XP đã tạo (gồm pickup đặt sẵn)
= XP đã thu gộp từ pickup + XP còn trên map + XP đang chờ chuyển sang representation
```

Dùng sổ đếm loot để test, không lấy XP tiến độ hiện tại làm tổng đã thu vì nó còn được dùng lên cấp và có thể bị Leech hút. Kênh “đang chờ” phải có giới hạn và được xử lý, không dùng để giấu leak.

Test cùng tick spawn→merge→magnet→collect; qua ranh cell; đầy cap; orb đang homing; kill nhiều quái; rời camera rồi quay lại; pause/resume và restart. Một drop không được thưởng hai lần, một cluster không đổi giá trị do sprite được tái sử dụng.

## 12. Quality settings không thay luật chơi

Giữ ít mức, ví dụ Low/High hoặc Low/Medium/High nếu dự án đã có. Các mức chỉ đổi:

- Số particle/debris/starfield, damage numbers, trail length, glow/shadow hoặc render scale có giới hạn.
- Không đổi lượng quái, tốc độ, damage, hitbox, loot, khả năng nhặt, bán kính lực, timer, telegraph quan trọng hoặc logic ngoài camera.
- Low vẫn nhìn rõ nguồn hút, phạm vi và chiều hút, đạn địch, trạng thái Corruption và Beacon bị đánh.
- Ưu tiên chọn thủ công có ghi nhớ. Chưa thêm adaptive quality đổi liên tục theo FPS; nếu giữ hệ adaptive đã có, phải có hysteresis và chỉ tác động presentation, không gây spike do tạo lại texture/canvas.
- Settings mới migrate/merge với save cũ; không xóa tiền/core/Echo khi thiếu field quality.

## 13. Cấu trúc code, config và comment

Tận dụng cấu trúc hiện tại; có thể bổ sung các thành phần tương đương nếu có nhu cầu thật:

```text
src/
  styles/                 # Typography, UI tokens và layout
  assets/                 # Manifest, texture/atlas hoặc generator tách riêng
  game/config/            # FX budget, pickup compaction, render quality
  game/systems/           # Pickup, combat, gravity và các hot path đã sửa
  game/services/          # Font loading, quality và lifecycle theo kiến trúc thật
  game/debug/             # Perf sampler, seeded scenarios; dev/test only
  game/ui/                # HUD/modal trình bày state
  game/vfx/               # Gravity presentation nếu đủ lớn để tách
```

Không tạo toàn bộ các lớp trên nếu chỉ cần vài hàm hiện có. Chỉ thêm abstraction có trách nhiệm rõ.

Comment tiếng Việt tại:

- Lý do font phải sẵn sàng trước Canvas text và xử lý fallback.
- Cách world radius map sang hiệu ứng, visual không tự làm damage.
- Simulation time/render interpolation, camera và pause.
- Acquire/release pool, vô hiệu physics/update/tween.
- Quy tắc merge XP, bảo toàn giá trị, cap/fallback và tránh thu hai lần.
- Broad phase/caching nào được thêm và khi nào invalidate.

JSDoc cho API/thuật toán khó, có đơn vị (ms/giây/world unit). Không comment mọi phép gán hoặc ghi “tối ưu” mà không giải thích cái gì được giảm.

## 14. Kiểm thử hồi quy và nghiệm thu hình ảnh

Chạy các script có thật trong repo: typecheck, unit/integration, build, e2e. Bổ sung test có ý nghĩa cho thay đổi, không chỉ snapshot API tồn tại.

### Typography/UI

- Toàn bộ chuỗi test tiếng Việt render đúng, không tách dấu/clipping ở menu/pause/HUD/upgrade/settings/result.
- Font cold load/fallback không làm treo boot; font đúng sau load, không giữ Canvas text fallback vĩnh viễn.
- Không overflow, nút mất hoặc click xuyên modal tại các viewport/zoom đã nêu; keyboard focus đúng.
- Xem ảnh render thực, test textContent không chứng minh font không lỗi.

### VFX/art

- Người xem phân biệt ngay Well của tàu và vùng môi trường ở trạng thái warning/active/end.
- Cảnh hút có chuyển động hướng vào tâm, phạm vi hình khớp logic, quái thật sự đổi quỹ đạo.
- Hố môi trường không hút XP, Beacon, đạn; không tạo damage tại tâm ngoài spec.
- Ba quái khác silhouette, marker hướng Beacon còn rõ; các cấp Plasma nhìn khác nhưng không đổi slot.
- Low vẫn dễ đọc, High không che đạn hoặc gây tăng giật nghiêm trọng.

### Runtime

- Pool/cap: active count không vượt budget; object reuse reset đúng owner/value/cooldown.
- XP conservation, no double collect, cap fallback, offscreen return, Leech và multi-level XP vẫn đúng.
- Movement/damage/charge/event tương đương khi chạy ở các nhịp frame khác nhau; pause đóng băng.
- Chơi lại ít nhất 5 lần không nhân đôi listener/emitters/timers, không tăng camera/audio callback.
- Save trước cập nhật load được, tiền/core/Echo/settings không mất.
- Thắng/thua, boss mốc540, gravity cuối630/632 và kết thúc720 vẫn đúng.

## 15. Nghiệm thu hiệu năng bằng số liệu và cảm giác chơi

Đo lại cùng baseline và lưu report. Tách hai loại kết luận:

1. **Tối ưu thuật toán/vòng đời:** cùng gameplay và cùng workload, số object/work/GC/spike giảm.
2. **Đánh đổi presentation:** khác quality/DPR/particle budget; ghi rõ chất lượng nào thay đổi, không gọi đây là cùng chất lượng.

Bảng bắt buộc:

| Scenario | Build/seed | Quality/DPR/viewport | Quái/đạn/pickup logic & visual | Median/p95/p99 frame ms | Frames >50ms | Heap/counter trend nếu đo được | Ghi chú |
|---|---|---|---|---|---|---|---|

Chốt máy tham chiếu và điều kiện trước khi so kết quả. Mục tiêu khởi đầu trên màn 60 Hz, quality đã chọn: p95 quanh hoặc dưới 20 ms, p99 khoảng hoặc dưới 33,3 ms; hạn chế rõ spike >50 ms trong cảnh đông chuẩn. Đây là mục tiêu kỹ thuật cần đo, không cam kết đạt trên mọi máy. Nếu baseline đã rất chậm, kỳ vọng cải thiện rõ ở p95/p99 và xác định bottleneck còn lại; không tự đặt ngưỡng dễ hơn sau khi xem kết quả để báo đạt.

Kiểm tra đi thẳng/chéo/đổi hướng ở tốc độ bình thường trong cảnh nhẹ, đông, XP tồn đọng và gravity. Cảm giác khựng không được giải quyết bằng thêm input lag/camera smoothing lớn. Nếu vẫn còn stall, tiếp tục tìm nguyên nhân trong phạm vi công việc và nêu chính xác phần còn lại, không tuyên bố đã sửa triệt để.

Chạy một lượt đủ 720 giây, ưu tiên chơi/render tốc độ thường để đánh giá giật và tích lũy. Có thể bổ sung soak 20–30 phút hoặc hai lượt liên tiếp để theo dõi object/memory nếu thời gian môi trường cho phép. Fast-forward chỉ kiểm tra logic dài hạn, không là bằng chứng FPS 12 phút ở tốc độ thật. Nếu không đủ điều kiện chạy dài, ghi rõ hạn chế.

Heap không cần về chính xác số ban đầu vì pool/cache có thể giữ dung lượng hữu hạn. Điều cần chứng minh là active objects được thu hồi, capacity có cap và không tăng tuyến tính sau các lần restart tương đương. Không gọi một heap snapshot hoặc ảnh FPS đơn lẻ là bằng chứng không leak.

## 16. Tài liệu và file bàn giao

Cập nhật tài liệu hiện có theo thay đổi thật:

- `GAME_SPEC.md`: chỉ thay nếu có hành vi được làm rõ/đổi có chủ đích, ví dụ representation/merge XP; giữ các trụ cột.
- `docs/architecture.md`: pipeline render/update, ownership FX/pool/pickup và nơi thêm content.
- `docs/asset-guide.md`: font, sprite/atlas, FX mới, kích thước, manifest, nguồn/giấy phép.
- `docs/balance.md`: gameplay value thực giữ nguyên hoặc thay có chủ đích; phân biệt FX/quality budget với balance gameplay.
- `docs/design-decisions.md`: nguyên nhân, lựa chọn, tradeoff, phạm vi ảnh hưởng.
- `docs/status.md`, `CHANGELOG.md`: hạng mục thực sự sửa, kiểm tra đã chạy và hạn chế.
- Thêm `docs/performance-report.md`: baseline, cách tái hiện, môi trường, các số trước/sau, hotspot đã xử lý, phần chưa đo.
- Có thể thêm `docs/visual-qa.md` nếu cần theo dõi danh sách màn/chuỗi/viewport đã xem; không tạo tài liệu rỗng cho đủ tên.

Không ghi đè repo bằng bộ tài liệu baseline cũ. Không cập nhật prompt tạo MVP như thể nó là spec mới nhất. Không kết luận nguyên nhân chỉ bằng tên file hoặc ghi “đã tối ưu” không có phép đo.

Asset và code mới phải có đầy đủ đường dẫn thực; không bàn giao ảnh/âm thanh placeholder không tồn tại. Nếu ảnh đối chiếu được lưu để QA, chỉ chụp vùng game cần thiết và đặt theo convention của repo, không dùng nguyên màn desktop có nội dung không liên quan.

## 17. Thứ tự thực hiện và định nghĩa hoàn thành

1. Audit code và chạy baseline; ghi phạm vi đã xác nhận từ ảnh và runtime.
2. Sửa lỗi typography và lỗi vòng đời/state rõ ràng; không tạo thay đổi hình ảnh lớn trước khi giữ được đối chứng.
3. Sửa các hotspot, movement/frame pacing và pickup tồn đọng, kiểm tra bảo toàn XP.
4. Nâng UI, sprite và VFX với budget; đo lại khi tăng chất lượng để tránh regression.
5. Chạy hồi quy, visual QA, benchmark cùng điều kiện và kiểm tra lượt dài; sửa vấn đề còn lại.
6. Bàn giao code, asset, tài liệu và báo cáo trung thực.

Có thể đổi thứ tự cục bộ theo bằng chứng, nhưng không bỏ baseline, kiểm tra cuối hoặc phần UI/art bằng cách chỉ tối ưu code. Đừng dừng ở kế hoạch, scaffold hoặc screenshot menu. Thực hiện thay đổi trong repo hiện tại và tiếp tục cho đến khi đáp ứng phạm vi hoặc xác định chính xác giới hạn không thể xử lý trong môi trường.

Báo cáo cuối bằng tiếng Việt, gồm:

- Nguyên nhân nào đã xác nhận, nguyên nhân nào chưa đủ bằng chứng.
- Những màn/chữ/asset/VFX và hot path đã sửa.
- Cách chạy, tái hiện scenario và bật perf overlay dev-only.
- Bảng trước/sau, quality/máy/viewport và kiểm tra đã chạy.
- Các luật gameplay được kiểm tra hồi quy, tình trạng save cũ.
- Phần chưa đạt hoặc chưa kiểm chứng và bước kiểm tra tiếp theo.

**Chỉ gọi đợt sửa hoàn thành khi các lỗi trong phạm vi có kết quả kiểm tra tương ứng. Không hứa 60 FPS mọi máy, không báo hết leak khi chưa kiểm tra vòng đời, không báo hết lỗi font chỉ vì đã đổi tên font.**

---

## Tài liệu kỹ thuật tham khảo

Các nguồn sau hỗ trợ cách tiếp cận; khi triển khai vẫn phải tra đúng version dependency trong repo:

- Phaser 3 Text: cơ chế Canvas texture, tải font trước và chi phí khi nội dung/style đổi: https://docs.phaser.io/api-documentation/3.90.0/class/gameobjects-text
- Phaser Groups và pooling: https://docs.phaser.io/phaser/concepts/gameobjects/group
- Font Loading API và tải face theo text: https://developer.mozilla.org/en-US/docs/Web/API/FontFaceSet/load
- Chrome DevTools về leak, memory bloat và GC: https://developer.chrome.com/docs/devtools/memory-problems
