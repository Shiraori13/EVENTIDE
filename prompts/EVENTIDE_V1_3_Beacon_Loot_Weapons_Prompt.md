# Prompt nâng cấp EVENTIDE từ phiên bản 1.2 lên 1.3

Dùng với **repo game 1.2 hiện có**, kèm các tài liệu hiện hành và bốn ảnh tham chiếu nếu có. Đây là prompt thay đổi trên sản phẩm đã có, không phải prompt tạo lại MVP. Các số mới là mặc định thiết kế đề xuất, cần kiểm thử và playtest trước khi kết luận cân bằng.

---

Bạn là lập trình viên game web 2D phụ trách nâng cấp **EVENTIDE – Thủy Triều Hư Không** lên **phiên bản 1.3**. Hãy trực tiếp sửa mã nguồn, UI, asset, config, save và test trên repo hiện tại, hoàn thành toàn bộ yêu cầu dưới đây. Không chỉ viết kế hoạch hoặc dựng lại project.

## 1. Đọc dự án và giữ phạm vi

Đọc `AGENTS.md`, `GAME_SPEC.md`, README, package/lockfile và tài liệu balance/architecture/assets/status/performance đang có. Kiểm tra hành vi thật của bản 1.2 trước khi sửa. Không ghi đè tài liệu mới bằng bộ baseline cũ.

Bản 1.3 cần:

1. Bỏ nút Build hiện tại khỏi menu Esc.
2. Sửa các chỗ chữ Việt còn lỗi khoảng cách; mở rộng thành tựu lên 28 mục tổng cộng.
3. Làm Beacon Core có model 2D xem trước/sau, ví Stardust rõ ràng và bảng chỉ số chi tiết.
4. Quái tăng sức mạnh từng phút khoảng5–10% tùy loại; thêm mảnh trang bị rơi tăng0,5–1% một chỉ số, có trần20% như quy tắc cụ thể bên dưới.
5. Animation phi thuyền mượt, có cảm giác lực đẩy và bay trong không gian nhưng điều khiển vẫn phản hồi tốt.
6. Thêm Pulsar Beam và Ion Storm từ core game; có quy trình đổi vũ khí đưa ô bị thay về cấp 1 và hiệu ứng khác biệt.

Giữ các cải tiến 1.1/1.2: font đã sửa, gravity VFX, frame pacing, pooling, gộp EXP, chỉ số hỗ trợ/reroll, hai phase boss, save và panel thông số. Không thêm map, nhân vật, crafting, inventory nhiều ô hoặc hệ online.

Những nơi prompt dùng tên class/path là gợi ý; tìm cấu trúc thật thay vì tạo hệ mới song song. Không nâng major dependency hoặc thay framework chỉ để làm phiên bản này.

## 2. Các quyết định làm rõ

Dùng các mặc định sau và ghi trong design-decisions:

- Chỉ bỏ **nút Build trong pause menu Esc**, không xóa hệ build. Vẫn xem qua phím B/nút HUD và chỗ xem build trong draft nếu đang có.
- 28 là **tổng số thành tựu** của 1.3, gồm năm mốc kill cũ; không cộng thêm 28 vào số cũ. Giữ unlocked/progress/ID cũ.
- Quái thường tăng HP/damage từ base theo số phút hoàn tất, dùng công thức tuyến tính. Không nhân lặp theo frame hoặc áp thêm một curve cũ cùng nghĩa.
- Mảnh trang bị là pickup tạm thời của run, tự lắp khi nhặt, mỗi mảnh tăng một stat. Chưa làm shop/equip inventory/độ hiếm nhiều tầng.
- **Trần trang bị20% được hiểu là tổng ngân sách20 điểm phần trăm trên tất cả stat trong một run**, không phải+20% cho mỗi stat cùng lúc. Mỗi stat cũng không vượt trần riêng. Đây là mặc định thận trọng để hạn chế sức mạnh tăng quá lớn.
- Bonus trang bị là nguồn riêng với hỗ trợ đã chọn ở 1.2; không chiếm hai ô hỗ trợ, không vĩnh viễn và không ảnh hưởng Beacon Core.
- Đổi vũ khí theo từng ô module: ô bị thay trở về level 1, mất tiến hóa của vũ khí cũ; các ô khác, level nhân vật, XP và hỗ trợ giữ nguyên.
- Không kéo dài lượt hoặc đổi luật thắng: Beacon đủ sạc và hai đối tượng còn sống vẫn thắng; boss chỉ có hai phase, phase 1 không trao kill/loot.

Nếu chủ dự án có đặc tả mới hơn khác các mặc định trên, nêu rõ khác biệt và áp dụng đúng phạm vi. Không tự phát sinh thay đổi luật khác để thuận tiện code.

## 3. Đối chiếu ảnh và điều hướng Esc

Ảnh1: `image(20261017-005525).png` là pause menu có “Build hiện tại · B”. Bỏ nút này và bố trí lại các nút còn lại, tránh một nút “Về menu” bị rớt hàng thiếu cân đối.

- Esc từ playing mở pause; Esc/Tiếp tục đóng pause theo state đúng.
- Pause vẫn có Thành tựu, Chơi lại và Về menu nếu đang có, cùng các nút hệ hiện hành thật sự cần.
- B từ playing mở build và pause; đóng quay lại đúng trạng thái trước.
- B/build khi đang draft vẫn đọc được nhưng không bỏ qua lựa chọn, không reset lượt reroll.
- Esc luôn đóng overlay trên cùng trước, không resume nếu còn lý do pause/tab-hidden. Không dùng cùng một phím để vừa chọn vũ khí vừa đóng menu.
- Đừng xóa handler B chỉ vì bỏ nút Esc; cũng đừng để handler bám vào DOM element đã bị xóa gây lỗi.

Ảnh2/3: `image(20261017-005549).png`, `image(20261017-005554).png` là bảng thành tựu. Kiểm tra trực tiếp chữ/spacing, các card, scroll và footer. Ảnh còn hiển thị đoạn mô tả kỹ thuật về autosave/flush/crash; chuyển chi tiết đó vào docs, giao diện chỉ cần trạng thái thân thiện như “Tiến trình được lưu trên trình duyệt này”. Không thay thành cam kết không mất dữ liệu trong mọi trường hợp.

Ảnh4: `image(20261017-005704).png` là Beacon Core hiện tại. Dùng mục6 để thay các ô số rời rạc bằng một giao diện có model và so sánh rõ.

Nếu không mở được ảnh, kiểm tra repo/runtime theo yêu cầu, ghi phần chưa đối chiếu; không bịa nhận xét ảnh hoặc dùng việc thiếu ảnh để bỏ toàn bộ tác vụ.

## 4. Sửa typography và layout còn sót

- Audit tất cả title, card, progress label, number/unit, caption, button, tooltip và nội dung ghép chuỗi ở Thành tựu/Beacon/Build/Catalog.
- Phân biệt source text thiếu khoảng cách như “từ 1.2”, ghép số/đơn vị, letter-spacing, dấu tổ hợp, fallback font, glyph và clipping. Không kết luận mọi lỗi đều do một font.
- UTF-8, text tiếng Việt chuẩn; NFC ở ranh giới hiển thị/localization khi hợp lý. Không strip dấu hoặc thay đổi ID/save key.
- Không tách chữ Việt bằng code unit để bọc span/animation. Font đủ glyph, đúng weight, local; Canvas text phải có font sẵn trước tạo hoặc được redraw đúng sau load.
- Chuẩn hóa text style giữa DOM và Phaser nếu có. Không sửa chỉ menu rồi bỏ HUD/tooltip mới.
- Giãn dòng/padding đủ cho dấu, tracking có chủ đích. Dùng formatter số/đơn vị tập trung, ví dụ “1.046 / 5.000 quái”, “5%”, “+0,5%”, “120 giây”.
- Card thành tựu gọn hơn, có filter Tất cả/Đã đạt/Chưa đạt và nhóm nội dung; progress label không phải đọc một đoạn dài mới hiểu.
- Scroll trong vùng nội dung, header/footer rõ; footer sticky không che hàng card cuối, padding-bottom tính đúng. Không tạo scrollbar trang và modal lồng nhau vô ích.
- Giữ tông xanh đen/vàng/cyan và style 1.2. Không thêm disclaimer kỹ thuật vào UI người chơi.
- Test 1280×720,1366×768,1920×1080, zoom100%/125%, cold font/fallback khi có điều kiện. Xem hình render thực, test textContent không chứng minh glyph/spacing đúng.

## 5. Mở rộng thành tựu lên 28 mục

### 5.1 Danh sách và định nghĩa

Bảng dưới là danh sách chính xác để triển khai. Mã A01…A28 là mã yêu cầu trong tài liệu, không phải lệnh đổi ID save hiện có. Năm mục cũ giữ ID thật và tên hiện hành tương ứng. Các mục mới dùng stable ID riêng.

| Mã | Tên gợi ý | Điều kiện | Cách tính |
|---|---|---|---|
| A01 | Tia sáng đầu tiên | Diệt100 Hollowborn | Tổng hồ sơ, giữ mốc cũ |
| A02 | Người giữ quỹ đạo | Diệt500 Hollowborn | Tổng hồ sơ, giữ mốc cũ |
| A03 | Lá chắn ngân hà | Diệt1.000 Hollowborn | Tổng hồ sơ, giữ mốc cũ |
| A04 | Bình minh xa | Diệt2.500 Hollowborn | Tổng hồ sơ, giữ mốc cũ |
| A05 | Ánh sáng bất diệt | Diệt5.000 Hollowborn | Tổng hồ sơ, giữ mốc cũ |
| A06 | Dọn đường phế tích | Diệt50 Hollow Drifters | Tổng theo loại quái |
| A07 | Cắt đuôi ký sinh | Diệt50 Void Leeches | Tổng theo loại quái |
| A08 | Một mình chống bầy | Diệt250 quái trong một run | Best-run kills, không cộng nhiều run |
| A09 | Qua vùng tối | Sống3 phút trong một run | Max survival180 giây mô phỏng |
| A10 | Giữ vững tín hiệu | Sống6 phút trong một run | Max survival360 giây mô phỏng |
| A11 | Trước giờ bình minh | Sống10 phút trong một run | Max survival600 giây mô phỏng |
| A12 | Thắp lại vì sao | Thắng lần đầu | Victory hợp lệ |
| A13 | Người giữ năm ngọn sáng | Thắng5 lần | Cộng dồn victory, không trùng result |
| A14 | Hải đăng nguyên vẹn | Thắng với Beacon còn ít nhất75%HP tối đa | Kiểm tra tỷ lệ tại kết quả |
| A15 | Trở về bình an | Thắng với tàu còn ít nhất50%HP tối đa | Kiểm tra tỷ lệ tại kết quả |
| A16 | Mặt trời bỏ túi | Đạt Mini Sun lần đầu | Plasma cấp 3/chuyển hình thái thật |
| A17 | Bùng nổ siêu tân tinh | Đạt Supernova lần đầu | Plasma cấp 5/chuyển hình thái thật |
| A18 | Nhịp đập Pulsar | Gây damage bằng Pulsar Beam lần đầu | Hit hợp lệ, không chỉ xem catalog |
| A19 | Sấm giữa hư không | Gây damage bằng Ion Storm lần đầu | Hit hợp lệ |
| A20 | Kẻ hạ sao chết | Hạ Elder Star hoàn toàn một lần | FinalDeath sau phase 2 |
| A21 | Đối mặt cơn thịnh nộ | Đưa Elder Star vào phase 2 lần đầu | Transition thật, chưa tính boss kill |
| A22 | Gia cố nguồn sáng | Beacon Core đạt cấp 1 | Level hồ sơ hợp lệ |
| A23 | Lõi sáng hoàn thiện | Beacon Core đạt cấp tối đa hiện hành | Baseline cấp 3; đọc config |
| A24 | Công nghệ nhặt lại | Nhặt một mảnh trang bị chỉ số | Thu pickup thật, bonus được áp |
| A25 | Phi thuyền cải tiến | Tích lũy10 điểm phần trăm bonus trang bị trong một run | Tổng budget đã dùng>=10%, không cộng nhiều run |
| A26 | Tận dụng từng mảnh | Đạt tổng trần20% bonus trang bị trong một run | Budget đã dùng>=cap20% |
| A27 | Bước cùng Hư Vô | Giữ Corruption>=50 liên tục30 giây | Chỉ simulation time, xuống<50 reset chuỗi |
| A28 | Hồi sinh trong ánh sáng | Hồi thực tế50 HP từ vùng sáng cộng dồn | Không tính overheal hoặc HP từ tăng maxHP |

Giữ huy hiệu cosmetic-only, chưa trao stat/tiền. Không thêm điều kiện yêu cầu cơ chế chưa triển khai. Nếu tên cần chỉnh để hợp phong cách, giữ điều kiện/mã yêu cầu và tránh trùng tên.

### 5.2 Theo dõi và migration

- Reuse achievement service/event/profile 1.2. Không scan28 điều kiện mỗi frame; cập nhật theo death, damage dealt, evolution, phase change, purchase, loot collection, actual heal, result và timer quan trọng.
- Theo dõi kill từng loại, wins, best-run kills/survival và heal thực tế bằng metric rõ; mỗi enemy/result chỉ ghi một lần.
- Phase1 boss không kill/loot, finalDeath là một kill; destroy do cleanup/restart không tính.
- Corruption30 giây dùng simulation duration, pause không tăng; chuỗi dưới ngưỡng reset đúng. Không dùng wall-clock để tính sống sót.
- Save cũ có total kill hợp lệ thì giữ năm mốc kill cũ, có thể đánh giá lại từ dữ liệu thật. Không bịa lịch sử heal/kill từng loại/win nếu trước đó không lưu.
- Các mục cần metric mới bắt đầu theo dõi từ 1.3 nếu không có dữ liệu đáng tin. UI ghi một chú thích ngắn về tiến độ mới khi cần; không đưa giải thích flush/internal schema.
- Save version/migration giữ tiền, core, Echo, settings và achievement đã mở. Không unlock lần nữa hoặc phát hàng chục toast ngay khi load save đã có mốc.
- Toast có queue giới hạn, gộp khi cần, không một emitter/DOM/timer riêng cho mọi kill. Có thể xem lại trạng thái đầy đủ trong bảng.

## 6. Thiết kế lại Beacon Core

### 6.1 Bố cục và model 2D

Tạo giao diện tương đương ba vùng:

- Header: Beacon Core, cấp hiện tại/cấp tối đa, ví Stardust tinh khiết có icon và số dễ đọc.
- Vùng model: model 2D Beacon hiện tại và preview cấp kế tiếp cạnh nhau hoặc một model có nút Hiện tại/Xem trước rõ ràng.
- Vùng thông số/giao dịch: bảng so sánh và nút nâng cấp kèm giá, trạng thái đủ/thiếu tiền.

Không cần3D/WebGL scene mới. Dùng sprite/texture/generator2D nhất quán với model trong trận. Các cấp 0–3 có thay đổi hình nhìn được: thêm vòng/cánh/lõi, độ sáng hoặc nhịp phát sáng tiết chế. Không chỉ phóng to cùng một ảnh rồi gọi là model nâng cấp.

Preview phải được gắn nhãn “Sau nâng cấp”, không sửa save hoặc model thật trước khi mua. Sau mua thành công, model hiện tại chuyển sang cấp mới với feedback ngắn; preview tiến tới cấp kế. Ở max-level hiển thị model hoàn thiện, không chỉ số/giá giả.

Dùng một hàm/registry `appearanceForCoreLevel` hoặc tương đương cho menu và Beacon trong trận. Model trong run dùng core level đã chốt lúc bắt đầu run; mua/navigate menu không mutate run cũ.

### 6.2 Bảng chỉ số Beacon

Hiển thị theo source of truth, có đơn vị và chú thích nguồn giống panel nhân vật:

- Cấp core và bonus HP từ base.
- HP cơ bản, HP tối đa hiện tại, HP sau nâng cấp và delta.
- Bán kính vùng sáng.
- Tốc độ sạc/thời gian đầy.
- Hồi HP cho tàu trong vùng sáng.
- Slow quái thường trong vùng sáng.
- Khả năng tự hồi Beacon: không có nếu luật hiện hành vẫn vậy.
- Thời điểm áp dụng: lượt chơi mới.

Chỉ số không đổi ở cấp kế hiển thị dấu “Không đổi” hoặc một giá trị, không tô xanh tất cả như đều được tăng. Không hiển thị “công/tốc độ tàu” như stat của Beacon.

Giữ hệ nâng cấp thật 1.2, baseline300 HP,+10%base/cấp, tối đa 3 cấp, giá10/20/30. Không tự thêm nhánh core tăng damage hoặc rút thời gian sạc trong lần cải tiến UI này.

Ví dụ theo ảnh4: đang cấp 2/3, HP 360, tiền 21, giá cấp 3 là30. UI cần thể hiện **360→390 HP (+30)**, **21/30 tinh khiết, còn thiếu 9**, nút chưa mua được có lý do rõ. Đừng chỉ làm nút màu xám rồi để người chơi đoán. Sau cấp 3, hiển thị đã tối đa. Giá trị ví dụ chỉ dùng minh họa, runtime đọc config/profile thật.

### 6.3 Giao dịch và trải nghiệm

- Dùng icon/tên Stardust tinh khiết riêng với EXP trong trận, số ví ở header không bị lẫn với giá.
- Kiểm tra đủ tiền/level khi thực hiện action, không chỉ dựa disabled CSS. Double click/keypress không trừ hai lần.
- Một giao dịch thành công cùng snapshot cập nhật tiền, cấp và state cần thiết. Ghi thất bại không làm mua hai lần hoặc mất dữ liệu; giữ fallback save hiện có và báo nhẹ phù hợp.
- Preview không tốn tiền; mua mới tốn tiền. Không yêu cầu thêm một modal xác nhận cho giao dịch đơn giản nếu UI đã có giá rõ, tránh nhiều bước không cần thiết.
- Model/panel resize phù hợp viewport thấp, nút Trở về luôn tới được, focus không nhảy mất sau purchase.

## 7. Quái tăng sức mạnh theo từng phút

### 7.1 Công thức khởi đầu

Dùng **simulation time đang chơi**, không dùng wall clock/tab time. Đặt:

```text
minuteIndex = min(floor(simulationSeconds / 60), 11)
scaledHP(type) = baseHP(type) × (1 + hpRate(type) × minuteIndex)
scaledDamage(type) = baseDamage(type) × (1 + damageRate(type) × minuteIndex)
```

| Quái thường | HP tăng mỗi phút từ base | Damage tăng mỗi phút từ base |
|---|---|---|
| Static Wisps | +5% | +5% |
| Hollow Drifters | +8% | +7% |
| Void Leeches | +10% | +8% |

Phút đầu minuteIndex0, chưa tăng. Bước qua60 giây áp lần1. Ở giây 660, minuteIndex11; tại720 xét kết quả, không thêm một lượt buff phút12 rồi gây bất ngờ.

Ví dụ ở phút5, Drifter HP=base×1,40 và damage=base×1,35; không phải nhân1,08^5, không nhân lại mỗi update. 5–10% là mức tăng tuyến tính trên chỉ số gốc theo loại. Các rate này là đề xuất để thử sau khi đọc baseline 1.2.

### 7.2 Tích hợp scaling đang có

- Audit các hệ wave/difficulty 1.2. Curve phút mới phải là nguồn rõ ràng cho stat quái thường, không chồng thêm một curve cũ cùng mục đích làm tăng sức mạnh hai lần.
- Giữ composition, lịch spawn và role của quái. Không đồng thời tăng spawn/cap vô hạn khi đã tăng HP/damage.
- BaseHP/baseDamage là thông số archetype/variant chưa bị scale theo phút; giữ reference gốc rõ, không lấy giá trị hiện tại làm base của lần tới.
- Không tự tăng speed/contact hit frequency trong cùng công thức. Giữ đường né/miễn damage va chạm và marker quái hướng Beacon.
- Boss vẫn dùng hai phase đã cân bằng riêng, không nhận thêm buff phút này mặc định. Có thể chỉnh baseline boss nếu build mới quá mạnh, phải ghi riêng.

### 7.3 Quái đang sống và quái mới

Buff áp cho cả quái thường đang sống và quái sinh mới, bằng một sự kiện chuyển phút, không loop buff lặp mỗi frame.

Khi tăng maxHP của quái còn sống, giữ tỷ lệ HP còn lại, không hồi đầy. Ví dụ30/100 thành31,5/105, cùng30%HP. Không làm quái đã chết sống lại; không reset cooldown, target hoặc loot roll. Quái mới sinh dùng minuteIndex hiện tại.

Nếu bước simulation vượt nhiều mốc khi test tăng tốc, cập nhật trực tiếp từ base ở minute cuối hoặc catch-up idempotent, không áp lãi kép. Pause/tab-hidden không thay phút.

HUD chỉ cần thông báo ngắn “Phút 6 — Hollowborn mạnh hơn” hoặc indicator nhỏ; không spam toast mỗi enemy. Dev overlay có thể xem multiplier thật, UI người chơi không cần dump config.

## 8. Mảnh trang bị tăng chỉ số rơi từ quái

### 8.1 Vai trò và vòng đời

Gọi là **mảnh trang bị thu hồi** hoặc tên hợp bối cảnh. Đây là pickup khác hình với EXP/Stardust tinh khiết; nhặt vào tự áp một bonus nhỏ, không mở modal cho mỗi mảnh.

- Chỉ có hiệu lực trong run hiện tại, reset khi chơi lại. Không lưu bonus thành tăng trưởng vĩnh viễn.
- Không chiếm ô module hoặc hai ô hỗ trợ; build panel có mục “Trang bị thu hồi”.
- Chỉ nhặt mới tăng stat; drop/chạy qua xa không cộng miễn phí. Dùng pipeline pickup có khoảng cách/ownership rõ.
- Mỗi mảnh ghi stat ID, rolled bonus, nguồn drop và nhận diện đã collect/release để chống hai hit/sự kiện cộng hai lần.
- Tồn tại đề xuất30 giây mô phỏng, cuối5 giây nhấp nhẹ/có báo sắp mất; pause không làm hết hạn. Đây là loại loot mới, không áp TTL này lên EXP cũ.

### 8.2 Chỉ số và trần

Chọn ngẫu nhiên một trong các stat hợp lệ sau:

| Stat từ trang bị | Bonus một mảnh | Trần riêng của nguồn trang bị |
|---|---|---|
| Damage chung | +0,5% hoặc+1%, tỉ lệ50/50 khởi đầu | +20% |
| Tốc độ tấn công | +0,5% hoặc+1% rate | +20% |
| HP tối đa | +0,5% hoặc+1% từ base | +20% |
| Bán kính nhặt | +0,5% hoặc+1% từ base | +20% |
| Tốc độ di chuyển | +0,5% hoặc+1% từ base | +10% để hạn chế né quá dễ |

**Ngoài trần riêng, tổng bonus từ tất cả mảnh đã áp trong run không vượt20 điểm phần trăm.** Ví dụ damage8%+HP6%+rate4%+speed2%=20%, đã đầy. Không phải mỗi stat đều được nhận20% cùng lúc.

Không cho drop giáp/giảm damage trong 1.3 để tránh cộng với hỗ trợ giáp tạo tank quá mạnh. Chưa làm crit/lifesteal/luck/đồ nhiều dòng.

Lưu bonus dạng integer basis points hoặc đơn vị tương đương:0,5%=50bp,1%=100bp, tổng cap20%=2.000bp. UI format đúng, không lẫn+0,5% với+50% hoặc cộng số thực lệch trần.

Nếu bonus rolled lớn hơn phần còn lại của stat/budget, chỉ áp phần còn lại và hiển thị số thực nhận. Không âm thầm cộng vượt cap. Drop đã tồn tại khi budget sau đó đầy phải được xử lý/thu hồi rõ, không giữ một pickup không bao giờ nhặt được.

### 8.3 Công thức kết hợp

```text
statBonus = supportBonus + salvageBonus
maxHP = baseMaxHP × (1 + hpSupportBonus + hpSalvageBonus)
moveSpeed = baseMoveSpeed × (1 + moveSupportBonus + moveSalvageBonus)
pickupRadius = basePickupRadius × (1 + pickupSupportBonus + pickupSalvageBonus)
attackInterval = moduleIntervalAtLevel / (1 + rateSupportBonus + rateSalvageBonus)
outgoingDamage = moduleDamageAtLevel
                 × (1 + damageSupportBonus + damageSalvageBonus)
                 × corruptionMultiplier
```

Trang bị là nguồn mới, không ghi đè/nhân lãi kép trên stat đã buff. Cap50% của nguồn hỗ trợ 1.2 vẫn giữ, cap20% của nguồn trang bị giữ riêng; một stat có thể đạt support50%+salvage20%=70% theo thiết kế này, nhưng tổng salvage cả build chỉ20%. Speed tối đa từ hai nguồn hiện tại là25%+10%=35%. Native modifier thật của nhân vật được xử lý theo pipeline đã có, không bỏ mất.

Tăng maxHP qua mảnh thì tăng currentHP đúng phần cộng thêm, không hồi đầy. Damage buff áp đúng một lần cho cả vũ khí cũ/mới; attack speed là tăng rate, không phải giảm cooldown cùng tỷ lệ.

### 8.4 Tỉ lệ rơi

Giá trị khởi đầu, cần đo tác động:

| Nguồn | Xác suất một drop mỗi final death |
|---|---|
| Static Wisps | 5% |
| Hollow Drifters | 8% +0,5 điểm phần trăm×minuteIndex, cap14% |
| Void Leeches | 7% +0,4 điểm phần trăm×minuteIndex, cap12% |
| Elder Star chết thật sau phase 2 | Một drop bảo đảm nếu còn budget/stat hợp lệ |

Chỉ roll một lần cho enemy death thật. Phase1 boss, despawn/pool recycle hoặc restart không roll. Drop này thêm vào XP hiện hành, không thay/xóa XP. Không nhân tỉ lệ rơi theo từng hit hoặc số projectile cuối cùng trúng.

Chọn stat từ pool còn hợp lệ, không chọn giáp hoặc stat đã cap. Các drop pending có thể khiến cap thay đổi trước lúc nhặt, nên validate lại lúc collect. Khi tổng budget đầy, dừng tạo thêm item stat; không thay bằng tiền vĩnh viễn hoặc XP miễn phí ngoài thiết kế.

### 8.5 Hiệu năng và thông tin

- Reuse pool/pickup manager hiện có, giới hạn visual/body/pending state, TTL theo simulation. Không một emitter/DOM/tween độc lập lâu dài cho mỗi item.
- Config có drop rate, bonus amount, TTL, item budget và visual cap. Đặt cap đủ cho gameplay thường; báo số lần chạm cap khi stress test. Không giữ queue overflow vô hạn.
- Nếu cap buộc hoãn drop, dùng cơ chế hữu hạn và chính sách được ghi rõ; không biến giới hạn kỹ thuật thành mất loot thường xuyên mà không biết. Compact representation nếu phù hợp nhưng không nhân giá trị khi gom/nhặt.
- Không áp cleanup/trần bonus trang bị sang tổng EXP trên map; invariant EXP 1.1 vẫn giữ.
- Toast gọn, ví dụ “Lõi thu hồi: +0,5% damage”. Nhiều pickup cùng tick có thể gộp thông báo.
- Build panel phân biệt base/hỗ trợ/trang bị/Corruption, có thanh ngân sách “Trang bị: 12,5% / 20%” và bonus mỗi stat.

## 9. Phi thuyền bay mượt và có cảm giác lực đẩy

Mục tiêu là animation bay thuyết phục hơn, đồng thời input phản hồi tốt. Đừng sửa “mượt” bằng cách làm nhân vật trễ thao tác hoặc thêm quán tính dài khiến không né boss được.

- Audit simulation step, render interpolation, camera follow, rounding và việc cập nhật position/velocity lặp trước khi thêm animation.
- Giữ world position float và collision authoritative. Nội suy presentation nếu cần; không tween rigid body/logic position đồng thời với physics.
- Tàu có hướng mũi, thân/cánh, engine core và thruster rõ. Nose hướng theo vector di chuyển mong muốn hoặc quy tắc đã chọn, giữ hướng cuối khi dừng.
- Chuyển góc theo cung ngắn nhất, có damping theo delta để xoay mượt ở 60/120 Hz; không quay cả vòng do góc179→−179độ. Visual rotation không lắc theo mục tiêu auto-aim đổi liên tục.
- Gimbal/đạn auto-aim có thể độc lập hướng thân tàu; projectile origin/local offset phải chuyển sang world đúng, không bắn từ tọa độ cũ khi tàu xoay.
- Thêm nghiêng/roll2D nhỏ, engine flame thay cường độ theo lực di chuyển và trail ngắn có cap. Khi đổi hướng, có secondary motion nhẹ nhưng không làm sprite/hitbox lệch khó hiểu.
- Khi thả phím, engine tắt/giảm dần, thân ổn định rồi idle nhẹ; không bob lớn khiến người chơi tưởng đang trôi khỏi vị trí.
- Giữ tốc độ, stop behavior và khả năng né 1.2 mặc định. Nếu muốn thay gia tốc/phanh gameplay, phải ghi đó là thay đổi physics riêng và test thời gian dừng, không lén đổi trong một hiệu ứng hình.
- Camera bám vị trí render cùng thời điểm với tàu, tránh double smoothing hoặc sprite/camera nội suy khác nhịp. Không thêm shake/zoom khi đi lại thông thường.
- VFX theo world/viewport đúng; pooled trail không nối một đường từ run cũ hoặc tọa độ warp.
- Low quality giảm trail/particle nhưng giữ turning/thruster cues. Animation không phụ thuộc FPS hoặc một bộ setInterval ngoài simulation.
- Kiểm tra đi thẳng, đi chéo, đảo hướng nhanh, thả phím, quanh Beacon, trong gravity, cạnh rìa và khi có nhiều quái. Xem ở tốc độ thật; video tăng tốc không chứng minh input mượt.

## 10. Hai vũ khí mới từ core game

Triển khai **Pulsar Beam** và **Ion Storm**, mỗi loại cấp 1–5 và có icon/catalog/build/tooltip đúng. Nếu một loại đã có code từ 1.2 thì hoàn thiện/tái sử dụng nó, không tạo ID trùng.

Giữ ba module cũ và tối đa ba ô module. Không làm thêm Quasar Cannon/crafting trong 1.3. Không đặt tiến hóa mới cho hai loại nếu chưa cần; cấp cao có thay đổi hình và chỉ số rõ.

### 10.1 Pulsar Beam

Bản sắc: laser năng lượng quét360độ theo nhịp, damage theo vùng quét quanh tàu. Không phải đạn tròn Plasma đổi màu.

- Mỗi pulse phát từ tàu hiện tại, beam quay quét vòng trong khoảng ngắn và có tầm giới hạn.
- Có lõi tia sáng, viền năng lượng, dấu bắt đầu/kết thúc và va chạm nhỏ; màu/shape phân biệt với beam nguy hiểm của boss.
- Nguồn beam theo tàu, góc sweep theo elapsed; không nằm yên tại vị trí tàu lúc cast nếu luật là gắn tàu.
- Mỗi enemy chỉ nhận một hit cho mỗi pulse hoặc damage tick có cooldown được định nghĩa rõ. Mặc định chọn một hit/enemy/pulse để dễ cân bằng và tránh damage theo FPS.
- Khi angle thay đổi qua nhiều góc trong một simulation step, kiểm tra vùng sweep/đường quét phù hợp để không bỏ hit chỉ vì frame thấp. Không test ray một góc duy nhất rồi phụ thuộc render FPS.
- Stats config gồm damage, range, sweep duration và pulse interval, cùng bảng cấp 1–5.
- Attack rate từ hỗ trợ/trang bị tác động pulse interval; chọn base interval/duration/cap để build nhanh nhất không tạo beam đồng thời vô hạn hoặc bị bỏ pulse âm thầm. Tooltip và DPS thực phải thống nhất.
- Các cấp tăng range/damage hoặc nhịp có giới hạn; active1–5 có hiệu ứng mạnh dần nhưng không tăng opacity che đạn địch.
- Damage source gắn weapon ID để achievements/kills đúng, boss và quái đều nhận đúng công thức.

### 10.2 Ion Storm

Bản sắc: một tia sét đánh mục tiêu trong tầm rồi chuyền qua các quái gần nhau. Không phải beam360độ hoặc mưa đạn tự tìm vô hạn.

- Chọn mục tiêu đầu hợp lệ trong tầm; sau đó tìm mục tiêu khác chưa bị hit trong jump radius.
- Mỗi chain có visited targets, không bật qua lại giữa hai quái hoặc đánh boss nhiều lần cùng chain.
- Có giới hạn jump count/chain duration, không có mục tiêu tiếp thì dừng. Không sort toàn map mỗi jump nếu broad phase đã có.
- Damage per jump/falloff định nghĩa trong config, ví dụ falloff0,8 là gợi ý cần cân bằng. Không mặc định damage full cho mọi jump nếu làm clear đàn quá mạnh.
- VFX zigzag nối đúng world position các hit, flash ngắn có cap. Không tạo physics projectile cho từng khúc zigzag nếu không cần.
- Chốt damage path tại tick tấn công hoặc cơ chế rõ khác, tránh animation đang chạy đổi target để hit lại vô hạn. Target chết/được pool reuse không làm tia gắn nhầm enemy mới cùng object.
- Stats config gồm damage, initial range, jump range, max targets/falloff và interval cho cấp 1–5. Attack rate thay interval, không tự tăng số jump ngoài bảng cấp.
- Level cao tăng số mục tiêu/damage/range có kiểm soát; sét vẫn ngắn, rõ, không phát một full-screen flash cho mọi chain.

### 10.3 Khác biệt gameplay và kiểm tra

| Module | Chuyển động/hit | Tình huống mạnh | Giới hạn cần rõ |
|---|---|---|---|
| Plasma | Đạn bay, nổ lan khi tiến hóa | Mục tiêu ưu tiên, damage tập trung | TTL, va chạm/nổ không đếm trùng |
| Pulsar | Tia quét quanh tàu | Quái bao quanh trong range | Pulse interval và hit một lần mỗi pulse |
| Ion Storm | Sét nối các mục tiêu gần nhau | Bầy tụ cụm | Số mục tiêu, jump radius và falloff |

Đừng làm một vũ khí vượt trội mọi tình huống. So damage thực/clear đàn/boss và áp lực frame-time ở cùng level/build. Không chỉ so con số damage trên tooltip.

## 11. Đổi vũ khí và reset level đúng phạm vi

### 11.1 Đường chọn

Tích hợp với draft nâng cấp hiện tại. Khi một vũ khí chưa sở hữu được chọn:

- Nếu còn ô trống: có thể lắp vào ô trống ở cấp 1.
- Nếu hết ô: hiển thị bước chọn ô muốn thay, có bảng “Vũ khí cũ cấpN → Vũ khí mới cấp 1”.
- Người chơi xác nhận ô thay thì mới áp một lựa chọn level-up. Nút Hủy quay lại cùng draft, không đổi thẻ, không trừ reroll hoặc nhận level miễn phí.
- Nếu có chỗ cho chọn thay thay vì lấp trống, vẫn dùng cùng giao dịch và cảnh báo mất level; không bắt buộc thêm bước đó nếu làm UI rườm rà.
- Module đã sở hữu hiện thẻ tăng cấp theo luật, không lắp bản sao hoặc dùng “đổi sang chính nó” để reset/bypass.
- Catalog chỉ tra cứu, không đổi vũ khí miễn phí. Menu chọn nhân vật/module khởi đầu hiện hành không được thành cửa hậu chuyển build giữa trận.

Vũ khí mới vẫn có cơ hội xuất hiện khi ba ô đã đầy, dưới dạng thẻ thay thế hợp lệ. Cập nhật pool filter hiện đang chặn toàn bộ module chưa có khi full. Thẻ thay thế cần label để người chơi biết đây không phải tăng cấp miễn phí.

### 11.2 Giao dịch thay module

- Chỉ ô được chọn reset về level 1 với ID vũ khí mới; ô khác giữ level, XP nhân vật và hai hỗ trợ/salvage không đổi.
- Không hoàn XP hoặc giữ tiến hóa cũ. Plasma cấp 5 đổi sang Ion level 1 thì mất Supernova trong ô đó; đổi lại Plasma về sau bắt đầu cấp 1.
- Cleanup old module state: drone, field, beam, timer, cooldown, target reference và owned persistent VFX. Mặc định kết thúc các attack còn tồn tại của ô cũ để không khai thác vừa đổi vừa giữ damage hai loại.
- Không xóa enemy, loot/XP đã rơi hoặc effect độc lập không thuộc ô đó. Những damage event đã resolve không bị hoàn tác.
- Khởi tạo cooldown hợp lý cho vũ khí mới; không tạo instant burst nhiều lần bằng hủy/xác nhận lặp.
- Single action guard: double click không thay hai ô hoặc tiêu hai level. Swap chỉ commit khi còn valid theo session/draft thật.
- Nếu cả loot/salvage và module swap cùng thay derived stats, stat pipeline tính lại từ nguồn, không cộng damage lặp.
- Cập nhật HUD/build/catalog/achievements sau commit. Achievement đã mở không bị thu hồi vì đổi mất tiến hóa.

### 11.3 Pause và reroll

Màn chọn ô là bước trong cùng draft đang pause. Esc/Hủy đóng màn chọn ô về draft, không resume đang còn level chờ. Reroll một lần/draft của 1.2 giữ nguyên; mở bước swap không phục hồi lượt reroll hoặc lấy bộ thẻ mới. XP đủ nhiều level vẫn xử lý đúng queue.

## 12. Cân bằng toàn hệ thống 1.3

Ba nguồn sức mạnh phải được đánh giá cùng nhau: module level/evolution, hỗ trợ 1.2 và salvage 1.3. Quái phút tăng theo base; không suy rằng5–10% và20% tự động cân bằng nhau.

Test tối thiểu:

- Đầu run chưa có salvage/hỗ trợ, module đầu còn yếu.
- Giữa run có salvage tự nhiên, không debug max mọi thứ.
- Build damage+rate với salvage thiên damage/rate.
- Build HP+giáp với salvage thiên HP.
- Build speed+pickup, có mục tiêu vẫn cần bảo vệ Beacon.
- Plasma tiến hóa so Pulsar và Ion ở cùng mức đầu tư; case đổi module mạnh sang cấp 1 muộn có rủi ro đúng UI.
- Elder Star hai phase cùng gravity cuối màn khi quái phút đã tăng.

Ghi lại stats quái trước/sau, HP/TTK theo phút, số drop, tổng salvage nhận, thời điểm đạt cap, lượng XP/cấp, thời gian đánh boss, HP tàu/Beacon và frame-time khi có thể. Nếu đạt cap salvage quá sớm hoặc luôn không thể đạt, chỉnh rate/budget bằng config có lý do, không tự thay luật vĩnh viễn.

Giữ slot/cap hỗ trợ và0,5–1% drop rõ. Chưa tự buff boss thêm 10%/phút theo quái thường hoặc thêm phase 3. Nếu cần điều chỉnh HP/attack boss để phù hợp vũ khí mới, ghi một thay đổi riêng, có telegraph và bằng chứng playtest.

## 13. Save dữ liệu và tracking

- Migrate save 1.2 sang schema 1.3 theo cấu trúc thực tế, giữ tiền/core/Echo/settings/achievement đã có.
- Thêm metric achievements có default hợp lệ; không reset total kills hoặc bịa lại progress chưa có dữ liệu.
- Salvage, minute scaling state, weapon level và draft thuộc run, không biến thành profile buff sau reload. Giữ chính sách không resume run nếu game hiện chưa hỗ trợ.
- Có stable ID content và nguồn damage/loot. Không dùng tên hiển thị tiếng Việt làm key.
- Achievement/kills/drop/purchase/result đều idempotent theo event thật. Dead enemy/pool reuse không tạo item mới hoặc metric lặp.
- Save/profile autosave có budget, không ghi localStorage liên tục trong update. Lỗi storage vẫn giữ fallback đã có.
- Reset tiến triển chỉ qua chức năng có xác nhận của người chơi; không reset để migration “dễ hơn”.

## 14. Kiến trúc comment và asset

Tận dụng systems/services hiện có. Chỉ tách component mới có trách nhiệm rõ, ví dụ:

- Achievement definitions/metric reducers thay 28 nhánh UI hardcode.
- Beacon view model và appearance registry dùng chung menu/world.
- Difficulty scaling theo minute event và base stats.
- Salvage drop/collect state, stat pipeline có source/cap/budget.
- Weapon behaviors Pulsar/Ion và swap action theo slot/draft.
- Ship presentation chứa rotate/thruster/trail, tách collision logic.

Các con số trong config. Catalog, card draft, build và combat đọc chung definitions/selector; không copy bảng cứng rồi lệch behavior.

Comment tiếng Việt giải thích lý do/điều kiện biên ở:

- Minute scaling tuyến tính, base stats, update HP ratio, event một lần.
- Basis points, hai loại cap, validate pickup tại collect và nguồn bonus additive.
- Beacon preview khác purchase, appearance theo core level và áp từ run mới.
- Achievement migration, event credits, Corruption timer và actual heal.
- Render interpolation/shortest-angle và world/local transform.
- Pulsar sweep hit tracking, Ion visited set, pooled object generation/reference.
- Swap transaction, cleanup owners, cancel/confirm và reroll budget.

Tạo asset mới nguyên bản hoặc có quyền dùng: icon 28achievement có thể reuse base symbol với biến thể, salvage/icon stat, Beacon level0–3, beam/sét. Không tạo28 texture lớn nếu atlas/vector nhẹ đủ. Runtime dùng file/generator thật, không để đường dẫn giả. Ghi nguồn/license vào asset guide; không tải font hoặc media mạng lúc chơi.

## 15. Giữ hiệu năng của 1.1/1.2

- Scaling chỉ chạy khi đổi phút và lúc spawn, không buff loop tạo object mỗi frame.
- Achievement theo event, có bounded queue/toast, không28 timers độc lập cho mọi entity.
- Beam/sét/trail dùng pool/reuse/budget; geometry/texture tĩnh bake khi load, không canvas gradient mới mỗi frame.
- Salavage là loại pickup riêng, có lifecycle/cap. EXP vẫn gộp bảo toàn tổng giá trị theo 1.1.
- Culling chỉ giảm presentation, không làm quái ngoài camera ngừng đánh Beacon hoặc drop tồn tại miễn phí.
- UI model Beacon chỉ update/animate tiết chế khi panel mở, cleanup scene/listener/audio khi đóng, không chạy preview render loop ở nền vô hạn.
- Low quality vẫn thấy beam/hit area, sét, phạm vi gravity và lực đẩy; không đổi stats/drop rate/độ khó.
- Đo cùng scenario/seed/viewport/quality với bản 1.2 để kiểm tra regression. Frame p95/p99 và spike quan trọng hơn chỉ FPS trung bình. Không tự tuyên bố mượt mọi máy.

## 16. Kiểm thử bắt buộc

Dùng tool/script thật trong repo. Chạy typecheck, unit/integration liên quan, build và browser tests phù hợp; ghi rõ phần bị chặn thay vì báo pass.

### UI và navigation

1. Pause Esc không còn nút Build; B/nút HUD và build trong draft vẫn hoạt động. Esc đóng đúng lớp, không mất draft/reroll.
2. Chữ Việt đúng trên bảng thành tựu, Beacon, tooltip, số/đơn vị và các UI mới; kiểm tra ảnh render, scroll/footer không che card cuối.
3. Beacon preview đúng cấp hiện tại/kế tiếp; level2/HP 360/tiền 21/giá 30 cho trạng thái thiếu 9 và không mua được; đủ tiền mua một lần lên390 HP, trừ30; max-level không mua tiếp.
4. Model khi mua thành công đổi đúng cấp, preview không mutate profile/run. Stats chỉ đổi những gì config cho phép.

### Achievement

5. Có đúng 28definitions, ID không trùng; giữ năm mốc kill cũ và unlocked sau migrate.
6. Mỗi nhóm có test event thật; run metric không cộng dồn sai thành career. Pause không tăng survival/Corruption timer.
7. Heal không tính overheal hoặc maxHP upgrade; phase 1 không kill/loot nhưng có thể mở A21; finalDeath đúng một kill.
8. Load save không bịa metric hoặc spam toast đã đạt; purchase/result/retry không mở/trả thưởng lặp.

### Minute scaling

9. Kiểm tra t=59,999/60/119,999/120/660/720. Pause/tab-hidden không tăng phút, step vượt mốc không nhân buff nhiều lần.
10. Wisps/Drifters/Leeches có rate đúng; ví dụ minute5 DrifterHP1,40base và damage1,35base.
11. Quái đang sống giữ HP ratio, target và cooldown; quái mới dùng minute hiện tại; dead enemy không sống lại. Boss không bị curve quái thường nhân thêm.

### Salvage

12. RNG seed kiểm tra loại drop, xác suất config và loại stat hợp lệ; không dùng một test ngẫu nhiên ít mẫu để khẳng định5% chính xác.
13. Mỗi mảnh chỉ apply một lần,0,5%=50bp và1%=100bp; total budget<=2.000bp, stat caps đúng, phần dư được clamp.
14. Công thức additive đúng, không lãi kép; speed gear<=10%, armor không có trong loot pool; maxHP tăng currentHP đúng delta.
15. Phase1/despawn/restart không roll; XP cũ vẫn đủ; full budget không tiếp tục sinh item vô ích.
16. TTL/pause/collect/cap/cleanup không leak và không làm EXP biến mất. Reload/new run không giữ buff salvage.

### Ship và weapon

17. Ship turning qua biên góc, đi chéo/dừng/gravity/camera không rung/teleport; hitbox/velocity không đổi theo animation.
18. Pulsar quét trúng không phụ thuộc frame rate, hit mỗi pulse không trùng, nguồn theo tàu và ảnh khớp phạm vi.
19. Ion chain không hit một target nhiều lần trong chain, sốjump/range/falloff đúng, target chết/pool reuse không trỏ nhầm.
20. Swap đầyô vẫn được đề nghị; xác nhận chỉ reset ô chọn, hủy giữ nguyên draft/reroll/XP, same-weapon không tạo duplicate.
21. Đổi Plasma cấp 5 → Ion cấp 1 mất Supernova trong ôđó, các ô khác giữ; đổi lại Plasma bắt đầu1, không giữ drone/field/beam cũ gây damage.
22. Stat supports/salvage/Corruption áp đúng một lần cho cả vũ khí mới, cấp và cooldown thực khớp tooltip.

### Hồi quy và lượt dài

23. Boss vẫn hai phase, targeting/telegraph 1.2 đúng, thắng ở720không bắt buộc giết boss; tàu/Beacon chết vẫn thua đúng ưu tiên.
24. Save migration giữ tiền/core/Echo/settings, không nhận thưởng trùng; chơi lại nhiều lần không tăng listener/texture/particle.
25. Test cảnh đông, nhiều pickup, Pulsar + Ion + gravity và build rate cao; so frame-time với 1.2. Chơi/render ít nhất một lượt đủ720 giây nếu môi trường cho phép, ghi rõ tốc độ thường hay fast-forward.

## 17. Tài liệu và bằng chứng bàn giao

Cập nhật GAME_SPEC, balance, architecture, asset guide, acceptance/status/changelog, achievement catalog và báo cáo performance/balance khi có. Đưa Pulsar/Ion từ backlog sang implemented chỉ sau khi behavior/UI/test thật có kết quả.

- Đặc tả phải ghi rõ các thay đổi luật 1.3: scaling tuyến tính, gear run-only/global20%, weapon swap,28 achievements.
- Balance có bảng quái trước/sau theo phút, drop rates/caps, module levels và cách các nguồn stat kết hợp.
- Status phân biệt đã làm, đã test và chưa kiểm chứng; không coi mô tả tính năng là code đã có.
- Giữ prompt tạo MVP và lịch sử 1.1/1.2, không dùng chúng ghi đè spec hiện hành.
- Nếu lưu ảnh QA, chụp vùng game cần thiết, không đưa desktop/nội dung cá nhân không liên quan vào tài liệu.

Báo cáo bằng tiếng Việt: thay đổi nào hoạt động, mở UI bằng cách nào, các mặc định đã chọn, save cũ, lệnh/test đã chạy, dữ liệu playtest và hạn chế. Không ghi “đã cân bằng/đã hết lỗi font/không lag” nếu chưa có kiểm tra tương ứng.

## 18. Thứ tự thực hiện và tiêu chuẩn hoàn thành

1. Audit 1.2, chạy baseline và lập bản đồ config/save/UI/ownership hiện tại.
2. Sửa pause/typography, mở rộng achievement/migration.
3. Làm Beacon Core model/preview/stats/purchase.
4. Tích hợp minute scaling và salvage stat pipeline/drop/collect.
5. Làm ship presentation, Pulsar/Ion và swap transaction.
6. Hồi quy, visual QA, playtest balance, đo hiệu năng và cập nhật docs.

Có thể điều chỉnh thứ tự cho hợp code nhưng hoàn thành toàn bộ phạm vi; không dừng ở menu đẹp trong khi loot/weapon chưa có logic. Không dựng lại dự án hoặc thêm nội dung ngoài yêu cầu để thay việc sửa các mục khó.

**Hoàn thành 1.3 nghĩa là:** điều hướng gọn, chữ dễ đọc,28thành tựu có tracking thật, Beacon có preview và chỉ số rõ, quái tăng theo phút đúng công thức, trang bị có drop/cap thật, tàu bay mượt, hai vũ khí khác biệt và đổi vũ khí đúng luật; tất cả giữ save và chất lượng runtime của base 1.2.
