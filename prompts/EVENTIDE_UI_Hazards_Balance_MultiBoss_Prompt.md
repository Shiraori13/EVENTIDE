# EVENTIDE — Prompt sửa UI, làm rõ hiểm họa, cân bằng và bổ sung boss

## Ghi chú đánh giá trước khi dùng prompt

Đánh giá này dựa trên hai ảnh người dùng gửi, phản hồi chơi của người dùng và một số file trên nhánh main của Shiraori13/EVENTIDE tại thời điểm soạn. Chưa trực tiếp chơi hoặc đo FPS bản local mới nhất. Bản main được đọc có thể chưa chứa các thay đổi giao diện trong ảnh.

- Giao diện sảnh đã có hướng nghệ thuật rõ: tiêu đề lớn, nền lạnh, Beacon vàng và bố cục lệch tâm. Nên giữ cấu trúc này và sửa các điểm thiếu mục đích, thay vì làm lại toàn bộ.
- Stardust tinh khiết đang bị trình bày như thông tin chân trang. Đây là tài nguyên phát triển lâu dài, cần có trọng lượng thị giác rõ hơn.
- Cung tròn vàng nhỏ trong ảnh không gắn nhãn, giá trị hoặc đối tượng nên người chơi khó hiểu. Chưa thể kết luận nó là lỗi CSS, cursor, loading hay animation chỉ bằng ảnh. Cần truy nguồn trong bản chạy.
- Phản hồi hiện tại cho thấy sức mạnh người chơi tăng nhanh hơn áp lực môi trường. Cần kiểm tra đồng thời tầm đánh, khả năng tiếp cận vùng nguy hiểm, scaling và nhịp boss; tăng HP quái đơn thuần dễ làm trận dài và đông hơn.
- Code main được đọc dùng scaling tuyến tính theo phút; tide/radiation ở các vị trí định sẵn; BossSystem chỉ tìm boss đầu tiên và dùng một số timer/beam cấp run. Đây là các điểm phải kiểm tra lại trong local trước khi sửa.
- Nên ưu tiên tính chính xác của trạng thái, vùng ảnh hưởng và khả năng đọc trận đấu. Hình ảnh đẹp không tự chứng minh cân bằng hay hiệu năng tốt.

Các thông số dưới đây là cấu hình khởi đầu cần được triển khai, đo và tinh chỉnh; không phải số liệu playtest đã xác nhận.

---

# PROMPT ĐỂ GỬI CODING AGENT

Bạn là gameplay engineer, UI/UX engineer và game designer phụ trách EVENTIDE. Hãy thực hiện trực tiếp một bản cập nhật trên base game hiện có: sửa UI sai/ngữ nghĩa khó hiểu, đưa tiền tệ về đúng phân cấp, làm nguy hiểm môi trường rõ và có tác động thực, tăng scaling quái, giảm tầm vũ khí tiến hóa và thêm ba boss có hai phase.

## 1. Phạm vi và thứ tự ưu tiên

Đọc AGENTS.md, GAME_SPEC.md, tài liệu core/balance và code local mới nhất. User yêu cầu bản cập nhật này nên các luật trong tài liệu cũ được thay thế đúng ở những phần nêu rõ bên dưới. Cập nhật lại tài liệu sau khi triển khai.

Giữ art direction hiện tại, hệ nâng cấp, tiến hóa, mastery, giới hạn slot, reroll, trang bị, lưu game và kinh tế. Không mở rộng thêm cơ chế ngoài yêu cầu. Không viết lại engine, không nâng dependency hàng loạt, không tự push/deploy.

Ưu tiên:
1. Truy và sửa cung tròn bất thường, làm rõ Stardust.
2. Chuẩn hóa state và VFX hazard, đo tác động lên người chơi.
3. Nerf tầm vũ khí và tăng scaling theo phút.
4. Hỗ trợ nhiều boss đúng kiến trúc, thêm ba boss, kiểm tra hai boss đồng thời.
5. Playtest tổng hợp và điều chỉnh các cấu hình khởi đầu theo bằng chứng.

Các đường dẫn từng có trên main, dùng để định hướng, không coi là chắc chắn giống local:
- src/styles/ui.css; src/game/ui/GameUI.ts.
- src/game/config/balance.ts, events.ts, content.ts.
- src/game/systems/AstronomySystem.ts, MovementSystem.ts, SpawnSystem.ts.
- src/game/systems/BossSystem.ts, BossLifecycle.ts, CombatSystem.ts.
- src/game/presentation/WorldRenderer.ts; src/game/core/GameSession.ts.

Đối chiếu thực tế trước khi sửa. Không áp bản main cũ đè các thay đổi local đang có.

## 2. Điều tra và sửa cung tròn vàng nhỏ

### Triệu chứng

Một cung tròn mảnh màu vàng xuất hiện tự do cạnh khu vực tiêu đề sảnh; người dùng còn gặp nó ở thành tựu và Balo. Ảnh crop chỉ cho thấy cung tròn trên nền tối, không có nhãn tiến trình.

### Yêu cầu điều tra

Tái hiện ở menu, thành tựu, Balo trong trận, màn nâng cấp và khi chuyển giữa chúng. Thử:
- Chuột di chuyển, đứng yên, rời khỏi viewport; dùng bàn phím thay chuột.
- Mở/đóng màn nhiều lần, resize, pause/resume, giảm chuyển động.
- Hover/focus nút, đang tải và sau khi tải xong.

Kiểm tra DOM/computed style, pseudo-element, SVG, CSS mask/border, loading indicator, custom cursor và object canvas. Truy chính xác class/component/owner sinh cung; kiểm tra transform, anchor, clipping, z-index, scope selector và cleanup khi chuyển scene.

Không khẳng định nguyên nhân chỉ từ hình dạng. Không dùng CSS toàn cục để ẩn mọi circle/progress hoặc vô hiệu hóa toàn bộ ::before/::after.

### Quyết định theo nguyên nhân thực

- Nếu là custom cursor/trang trí không có chức năng: bỏ khỏi bản người chơi hoặc gắn vào đúng đối tượng trang trí; giữ cursor hệ thống dùng được.
- Nếu là loader: chỉ xuất hiện khi thực sự loading và biến mất khi hoàn tất/lỗi; có nhãn trạng thái phù hợp.
- Nếu là tiến trình nhiệm vụ: đặt trong đúng card nhiệm vụ, có nhãn, giá trị hiện tại/tổng và cập nhật theo state.
- Nếu là chi tiết của Beacon/viền nút bị tách anchor: sửa tọa độ/scope/clip; không xóa các vòng Beacon có chủ đích.
- Nếu là object renderer còn sót: sửa lifecycle/ownership, không chỉ che bằng overlay.

Nghiệm thu: không còn cung tròn không rõ nguồn hoặc ý nghĩa ở menu/thành tựu/Balo. Báo rõ nguyên nhân, file sửa và ảnh tái hiện trước/sau. Chi tiết vòng trang trí có chủ đích phải nằm đúng bố cục và không giả dạng progress.

## 3. Stardust tinh khiết ở sảnh

Di chuyển số dư khỏi chính giữa chân trang. Mặc định chọn góc trên bên phải trong cùng header với thương hiệu, có khoảng an toàn khỏi mép viewport và không đè Beacon/key art.

Thiết kế một khối tài nguyên gọn:
- Icon Stardust tinh khiết riêng, nhãn “Stardust tinh khiết”, số dư là điểm nhấn.
- Khởi đầu desktop: icon 28–32 px, số 24–28 px, nhãn 12–14 px; điều chỉnh theo viewport.
- Nền tối vừa đủ tương phản, viền vàng mảnh, độ sáng thấp hơn nút Khởi hành.
- Chữ số tabular để không nhảy bố cục; xử lý số lớn như 1.234.567.
- Không làm animation đếm số khiến giá trị hiển thị khác số dư thật sau giao dịch.
- Khi số dư đổi, có phản hồi ngắn; không pulse liên tục.
- Giữ một nguồn dữ liệu số dư. Không tạo bản sao cache riêng gây lệch với màn Beacon Core.
- Nếu khối này là nút mở Beacon Core, phải thể hiện là nút, có focus/label và kích hoạt bằng bàn phím. Nếu chỉ hiển thị, không thêm affordance bấm giả.

Ở màn hẹp, đưa khối vào hàng header kế tiếp hoặc đặt ngay trên khu vực Khởi hành, không chèn vào giữa mô tả và che menu. Kiểm tra 1280×720, 1366×768, 1920×1080 và viewport hẹp.

Màn Beacon Core vẫn cần số dư rõ gần chi phí. Kiểm tra nhận thưởng/mua nâng cấp/quay lại sảnh: số dư luôn đồng nhất, save cũ không mất.

## 4. Làm rõ hố đen, hút/đẩy và phóng xạ

### 4.1. Phân biệt hệ thống

Tìm đúng mapping trong code:
- Corruption là trạng thái của tàu.
- Hố đen môi trường là vùng nguy hiểm.
- Thủy triều trọng lực là sự kiện hút/đẩy.
- Hố đen/Gravity Well do người chơi tạo là vũ khí thân thiện.

Không gộp chúng chỉ vì đều có vòng xoắn. Không tự thêm liên hệ “Corruption tạo hố đen” nếu core không có. Giữ công thức Corruption ngoài phạm vi cân bằng được yêu cầu.

Mỗi hazard phải có đủ: warning → active → ending/cleanup. State mô phỏng là nguồn duy nhất cho vùng, hướng, thời gian và damage; renderer không tự sinh lực hoặc damage.

### 4.2. Ngôn ngữ VFX

| Loại | Dấu hiệu chủ đạo | Thông tin phải đọc được |
| --- | --- | --- |
| Hố đen môi trường | Lõi tối, vành tím/hồng, vệt xoắn đi vào | Biên tác động, tâm hút, đang cảnh báo hay đang hoạt động |
| Thủy triều trọng lực | Vành có mũi tên và dòng bụi hướng tâm/ly tâm | “ĐANG HÚT” hoặc “ĐANG ĐẨY”, thời gian đổi nhịp |
| Phóng xạ | Vùng vàng hổ phách kẻ sọc, biểu tượng nguy hiểm | Phần mặt đất nguy hiểm, thời điểm kích hoạt, khi tàu đang bên trong |
| Hố đen thân thiện | Cyan/ngọc, motif vũ khí | Không nhầm với vùng gây hại cho tàu |

- Biên nguy hiểm hiển thị đúng bán kính world unit, không nới bằng bloom.
- Vệt đi vào/đi ra thật sự đổi hướng theo dấu lực, không chỉ đổi màu.
- Khi đổi hút↔đẩy, có tín hiệu trước khoảng 0,6–0,8 giây và cảnh báo ngắn.
- Tàu trong vùng có chỉ báo trạng thái nhỏ và hướng lực; không phủ toàn màn hình làm mất đạn.
- Chế độ Thấp/giảm chuyển động vẫn giữ biên, hướng, nhãn và warning.
- Hazard ngoài camera có chỉ hướng khi liên quan, không dùng banner che nhân vật.

### 4.3. Tác động hút/đẩy phải cảm nhận được

Code main từng có tideForce=90, tideRadius=420, tideCycle=6; lực giảm về mép và tâm cố định x=950. Kiểm tra local trước khi đổi.

Cấu hình khởi đầu:
- Chu kỳ hút/đẩy giữ khoảng 6 giây, thông báo rõ từng nửa chu kỳ.
- Force đỉnh mục tiêu khoảng 130–150 world unit/giây nếu tốc độ cơ sở tàu vẫn khoảng 200; ưu tiên cấu hình theo tỉ lệ tốc độ cơ sở để dễ cân bằng.
- Bán kính khoảng 420–460 u, không tự phóng đại toàn bản đồ.
- Falloff phải đủ thấy tác động ở vùng giữa; có thể dùng đường cong thay tuyến tính nhưng phải liên tục tại mép.
- Giới hạn lực tổng trên tàu khoảng 75–80% tốc độ di chuyển hiện tại; không tạo tình trạng giữ phím thoát mà hoàn toàn bất động.
- Có xử lý an toàn tại tâm, không NaN/teleport.
- Tăng sức ép bằng vị trí và nhịp, không bằng khóa điều khiển.

Chọn tâm khi bước vào warning, dựa trên vị trí thật và vùng chơi đang hoạt động. Không để event thường nằm ngoài đường di chuyển và không có tác động cả trận. Không bám tâm theo tàu trong active. Chừa lối thoát khỏi vùng và tránh đặt hazard chặn kín đường về Beacon.

Lực phải tương tác với tàu và quái theo luật đã định; boss dùng kháng lực rõ ràng nếu cần. Không hút/đẩy EXP hoặc trang bị trừ khi luật hiện có yêu cầu. Giữ tất cả trạng thái qua pause đúng cách; hết sự kiện phải trả về bình thường ngay.

Đo bằng cùng input/seed bật/tắt event: khác biệt quỹ đạo và tốc độ thoát phải thấy được bằng số; chỉ VFX mạnh hơn mà vị trí không đổi là chưa đạt.

### 4.4. Phóng xạ phải buộc đổi vị trí

Code main từng có hai vùng cố định x=±900, y=±300, radius=180, damage tàu=4 HP/s. Nếu local còn tương tự, kiểm tra người chơi có thực sự đi vào vùng không trước khi chỉ tăng damage.

Cấu hình khởi đầu:
- Tối đa hai vùng cùng lúc, radius khoảng 180–220 u.
- Có vùng ảnh hưởng đến lối di chuyển đang dùng, không chỉ rìa bản đồ.
- Warning tối thiểu khoảng 3 giây, vùng được khóa vị trí từ warning; không spawn damage ngay dưới tàu.
- Damage tàu bắt đầu thử ở 7 HP/s trước các giảm trừ hợp lệ, thay vì 4 nếu đúng baseline.
- Đứng 5–8 giây trong vùng phải gây hao hụt HP có ý nghĩa với build thông thường.
- Có đường tránh rõ, không phủ toàn bộ vùng an toàn/Beacon.
- Không tăng số vùng liên tục trong active chỉ để đuổi theo người chơi.

Kiểm tra armor, hồi máu và cửa bảo vệ trúng đòn: damage môi trường không được mất ngẫu nhiên chỉ vì dùng chung timer contact. Xử lý nhịp theo nguồn khi phù hợp, vẫn tôn trọng miễn nhiễm thực sự. Không cộng damage hai lần ở vùng chồng nhau; mặc định lấy một nguồn môi trường mạnh nhất cùng loại.

Giữ tương tác gây hại cho quái theo core nhưng kiểm tra không biến event thành công cụ farm miễn phí. Không cho damage %HP lên boss nếu thiết kế không quy định. Nêu rõ trước/sau giảm trừ và kết quả playtest của build thủ/nhanh/công.

## 5. Tăng scaling quái mỗi phút

Code main từng dùng cộng tuyến tính từ base, không lãi kép:
- Wisp: HP +5%, damage +5% mỗi phút.
- Drifter: HP +8%, damage +7%.
- Leech: HP +10%, damage +8%.

Dùng bảng khởi đầu mới nếu baseline local tương đương:

| Quái | HP mỗi phút hoàn tất | Damage mỗi phút hoàn tất |
| --- | ---: | ---: |
| Static Wisp | +10% | +7% |
| Hollow Drifter | +14% | +9% |
| Void Leech | +16% | +10% |

Công thức:
- m = floor(simulationTime / 60), chặn theo thời lượng trận hiện tại.
- maxHP = baseHP × (1 + hpRate × m) × eventHPFactor.
- damage = baseDamage × (1 + damageRate × m) × eventDamageFactor.
- Tại 00:00 chưa có bonus phút; tại 01:00 có một lần bonus.
- Không nhân 1,16 lặp theo phút, không nhân thêm mỗi frame.
- Nếu local đã cao hơn bảng này, không vô tình nerf; so sánh rồi tăng có kiểm soát và báo bảng cuối.

Ví dụ ở m=11, HP lần lượt là 2,10 / 2,54 / 2,76 lần base; đây chưa gồm sự kiện.

Quái đang sống:
- Cập nhật đúng một lần mỗi mốc, giữ tỉ lệ HP còn lại.
- Không hồi sinh quái đã chết, không reset target/cooldown.
- Quái mới spawn dùng cùng công thức.
- Modifier sự kiện áp đúng một lần, gỡ đúng khi kết thúc.
- Boss có bảng riêng, không ăn thêm scaling quái thường.
- Giữ tốc độ và tần suất contact ban đầu trong đợt này để cô lập tác động cân bằng.

Không đồng thời tăng spawn rate/cap quái nếu chưa có bằng chứng cần thiết. Quái trâu hơn có thể tăng số lượng tồn tại và gây tụt FPS; phải đo cả enemy cap và tốc độ dọn đàn.

Playtest ở phút 3/6/9/11 với build yếu, trung bình và tiến hóa. Nếu thành “bao cát”, giảm HP rate thay vì tiếp tục tăng damage/số lượng. Không điều chỉnh vượt xa bảng chỉ để đạt tỷ lệ thắng tùy ý.

## 6. Nerf 20–25% tầm vũ khí tiến hóa mới

Xác định vũ khí người dùng đang nói đến qua hệ tiến hóa thực tế. Trên main hiện đọc có Quasar Cannon hợp nhất Pulsar + Ion, range=510. Nếu local vẫn như vậy, mặc định giảm 22%:
- 510 × 0,78 = 397,8 u, có thể làm tròn cấu hình thành 398 u.
- Đây là giảm chiều dài/tầm hoạt động, không giảm damage 22%, không thu góc quét hoặc tăng cooldown ngoài phạm vi.

Đưa hệ số vào một nơi duy nhất, không nhân hai lần trong config và runtime. Nếu tầm local khác, áp 0,78 vào baseline thật và báo trước/sau.

Kiểm tra toàn bộ phạm vi gây sát thương:
- Chọn mục tiêu, beam/sweep geometry, chain phụ và vòng xem trước phải đồng bộ.
- Không chỉ thu hình vẽ trong khi hitbox giữ nguyên.
- Nếu chain của Quasar cho phép hit vượt biên tầm mới từ nguồn bắn, giới hạn mục tiêu chain trong envelope hoạt động mới, đồng thời không vượt jumpRange hiện có.
- Không nerf Ion độc lập hoặc vũ khí nguồn chưa hợp nhất.
- Không đổi count/level, recipe, damage, số mục tiêu chain hay mastery.
- Tooltip/Balo/catalog hiển thị số thực sau bonus, không hardcode số cũ.

Thử mục tiêu ngay trong/ngoài biên và khi tàu di chuyển; đòn đã phát phải dùng quy tắc origin nhất quán giữa renderer và combat. Đo TTK và diện tích khống chế trước/sau; việc nerf này cộng với quái mạnh hơn có thể cần giảm nhẹ HP boss dự kiến, không âm thầm hoàn lại tầm.

## 7. Hệ nhiều boss: bắt buộc đúng trước khi thêm nội dung

Lịch boss mới:
- 09:00 = 540 giây mô phỏng: spawn một boss random.
- 11:00 = 660 giây mô phỏng: spawn boss tiếp theo, kể cả boss trước còn sống.
- Hai mốc này thay thế lịch spawn một boss cũ tại cùng mốc, không cộng thêm một Elder thứ hai ở 09:00.
- Mỗi mốc đúng một lần; không mất mốc khi timestep vượt qua thời điểm.
- Pause/Balo/level-up không chạy lịch.
- Dùng seeded RNG của run, không random lại khi render hoặc mở UI.
- Pool gồm boss cũ phù hợp và ba boss mới; bốc không lặp trong hai mốc của cùng lượt nếu pool đủ.
- Spawn an toàn khỏi vị trí tàu/Beacon, có cảnh báo trước. Boss không có damage tức thì trong lúc xuất hiện.

Trên main cũ, BossSystem tìm một boss đầu tiên; timer ring/beam/fan và beam dùng chung trong RunState. Phải thay mô hình này ở mức cần thiết:
- Mỗi boss có ID, loại, phase, HP, timer, đòn chờ, target/aim và cooldown riêng.
- Chạy update cho mọi boss đang sống/transition.
- Đòn/zone/projectile có ownerId. Clear một boss chỉ xóa đúng đòn của boss đó.
- Không chia sẻ biến phase2At, beam hoặc fan giữa hai boss.
- Không ghi đè beam boss A khi boss B dùng beam.
- Mọi kiểm tra kind==='elder' từng có ý nghĩa “là boss” cần chuyển sang phân loại boss chung: radiation, scaling, movement, CC, loot, HUD, cap và outcome.
- Boss có slot riêng khỏi cap quái thường, nhưng tổng projectile/VFX vẫn có budget.
- HUD hiển thị tối đa hai hàng boss rõ tên và phase; không ghi đè một thanh duy nhất.
- Không dùng cờ “bossDefeated=true” toàn run làm boss còn lại ngừng hoạt động.

Hai boss cùng sống là tình huống hợp lệ và cố ý khó. Giữ spawn 11:00, không trì hoãn đến khi boss đầu chết. Có thể lệch pha mở đòn 0,3–0,5 giây để đọc cảnh báo nhưng không vô hiệu hóa AI một boss.

## 8. Ba boss mới, mỗi boss hai phase

Tạo ba silhouette và màu nhận diện khác nhau, cùng ngôn ngữ Hollowborn. Tận dụng engine/attack primitive đang có để tránh phức tạp quá mức. Mỗi boss chỉ cần hai nhóm đòn chính; phase 2 thay pattern/nhịp thay vì tạo thêm một hệ thống lớn.

### 8.1. Gravemaw — Hàm Hố Đen

Vai trò: kiểm soát vị trí, buộc rời chỗ đứng.

Model: lõi đen lệch tâm, hai cung hàm mở/khép, viền tím.

Phase 1:
- Gravity Maw: boss tạo vùng hút giới hạn trước mặt hoặc tại vị trí tàu đã chụp lúc warning; báo trước ít nhất 1 giây, active ngắn, có biên rõ.
- Broken Orbit: bắn vòng đạn thưa có khoảng trống đủ tàu đi qua, hướng khe thay đổi có quy luật.
- Nhịp khởi tạo một skill: khoảng 2,8 giây, luân phiên có trọng số.

Phase 2:
- Hút chuyển sang một nhịp đẩy đã báo trước; không giật hướng không có tín hiệu.
- Vòng đạn có thêm một loạt lệch góc, không lấp khe an toàn bằng loạt thứ hai.
- Nhịp khoảng 1,9 giây.
- Không cộng lực với tide thành softlock. Dùng force cap chung, không cho boss hút toàn map.

Counterplay: đọc đổi chiều, né chéo ra biên, tận dụng khe đạn. Không bắt tàu đứng yên chịu damage.

### 8.2. Helion Remnant — Tàn Dư Nhật Miện

Vai trò: áp lực vùng, tạo bài toán chọn đường.

Model: sao vỡ với vành nhật miện méo, vàng đỏ riêng biệt với Beacon.

Phase 1:
- Solar Scar: đánh dấu vùng nhỏ ở vị trí được chụp, nổ sau warning khoảng 1–1,2 giây và để vùng bức xạ ngắn.
- Corona Fan: chùm đạn hình quạt hướng tàu, khóa hướng ở đoạn cuối warning.
- Nhịp skill khoảng 2,5 giây.

Phase 2:
- Solar Scar tạo hai vùng so le, tối đa hai vùng còn sống của boss; không phủ kín Beacon.
- Corona Fan thêm một lần bắn lệch có khe, không biến thành vòng tròn kín.
- Nhịp khoảng 1,7 giây.

Counterplay: rời vùng đánh dấu, không quay về đường vừa đi ngay. Vùng bức xạ của boss có owner/lifetime riêng, cleanup khi boss chết và không sửa lịch phóng xạ thiên văn.

### 8.3. Void Harrier — Kẻ Săn Hư Không

Vai trò: ép di chuyển, trừng phạt chạy thẳng hoặc đứng một chỗ.

Model: thân dài/mũi nhọn, cánh rách, cyan tím tối; silhouette phân biệt với tàu người chơi.

Phase 1:
- Rift Dash: báo đường lao ít nhất khoảng 0,9 giây; khóa hướng trước lao, di chuyển theo đường đã chốt.
- Hunting Fan: chùm đạn có dự đoán nhẹ, chặn mức dự đoán để người chơi đổi hướng né được.
- Nhịp skill khoảng 2,4 giây.

Phase 2:
- Một lượt dash có thể gồm hai chặng; chặng thứ hai phải có cue/đường báo riêng và một nhịp ngắt.
- Chùm đạn rộng hơn hoặc chia hai loạt; không chỉ tăng vận tốc đến mức không thể đọc.
- Nhịp khoảng 1,6 giây.

Counterplay: đổi hướng sau khóa mục tiêu, né ngang tuyến lao. Kiểm tra swept collision cho dash để không xuyên tàu mà mất hit hoặc teleport trúng không có cảnh báo.

### 8.4. Luật phase và nhịp dùng skill chung

Tái sử dụng quy ước hai thanh HP/phase hiện tại nếu core đang dùng:
- Khi HP phase 1 hết, transition ngắn khoảng 1–1,25 giây; boss tạm miễn damage, dọn đúng đòn của mình.
- Phase 2 có pool HP riêng khởi đầu khoảng 60–70% HP phase 1, sau đó chỉnh theo TTK.
- Overkill không xuyên từ phase 1 sang phase 2.
- Phase 1 không thưởng boss/loot hai lần. Chỉ phase 2 chết mới hoàn tất và roll reward đúng một lần.
- Không hồi đầy HP vì resize, mở Balo, đổi phase state hoặc render.
- Phase 2 phải khác về cách né, không chỉ khác màu.

Khoảng 1,5–3 giây là thời gian giữa các lần KHỞI TẠO skill của từng boss khi ở trạng thái sẵn sàng. Telegraph, active và recovery vẫn rõ; không buộc các bước con cùng xuất hiện trong một frame để đuổi kịp lịch.

Nếu skill kéo dài hơn khoảng nhịp, hoàn tất/thu hồi theo state machine rồi khởi tạo đòn kế tiếp; không “catch up” bằng xả nhiều skill. Không rút warning dưới mức đã định để giả đạt tần suất. Combo được tính là một lần khởi tạo, có giới hạn số đòn con.

Đòn beam bám nguồn boss khi boss di chuyển; hướng ngắm chỉ tracking trước lock, sau lock giữ quy tắc cố định đã thông báo. Đạn rời nòng bay độc lập, không tiếp tục kéo theo boss.

Boss cũ nếu vào pool cũng cần nhịp tương thích và per-owner state, nhưng giữ đặc trưng ring/beam hiện có. Không âm thầm biến boss cũ thành bản sao boss mới.

## 9. Cân bằng cuối trận và tương tác hai boss

- Mục tiêu ban đầu: build trung bình chơi chủ động có thể hạ cả hai phase boss 09:00 trong khoảng 45–80 giây.
- Boss 11:00 chỉ có khoảng 60 giây trước mốc 12 phút: hướng đến khoảng 35–50 giây cho build cuối trận trung bình nếu tập trung đánh, không bê nguyên HP boss đầu rồi buff vô hạn.
- Đây là mục tiêu playtest, không phải bảo đảm mọi build đều hạ đúng thời gian.
- Giữ luật kết thúc 12 phút hiện có. Không tự thêm yêu cầu bắt buộc giết hết boss để thắng; áp lực buộc ưu tiên boss đến từ đòn đánh và khả năng hai boss chồng nhau.
- Không cho boss đứng ngoài tầm mọi vũ khí suốt trận, đặc biệt sau nerf Quasar. Boss cần có cửa sổ tiếp cận phù hợp.
- Không cho boss xuyên Beacon gây contact lặp vượt luật khi lao.
- Hai boss + quái + môi trường vẫn cần lối thoát: mỗi đòn có khe/đường né và thời gian báo đủ.
- Khi boss dùng zone, đặt giới hạn lifetime, count và mức phủ; không lấy RNG phủ toàn vùng an toàn.
- Không tự dời lịch hố đen cuối hoặc sự kiện cũ. Nếu cần thay đổi để tránh tổ hợp không thể né, ghi rõ thay đổi nhỏ cùng bằng chứng.

Giữ damage, HP, cadence, zone size và telegraph trong data config. Chỉ thay một nhóm biến mỗi lượt thử; ghi trước/sau. Tránh đồng thời tăng HP, damage, speed, spawn, skill count rồi không xác định được nguyên nhân thua.

## 10. Kiến trúc, vòng đời và hiệu năng

- Tách boss definition/data khỏi state mỗi instance và logic attack dùng chung.
- Không thêm một bản sao BossSystem cho từng boss; tái sử dụng primitive ring/fan/beam/zone/dash.
- VFX đọc state, không tự tick gameplay.
- Pool các object xuất hiện nhiều, trần projectile/hazard/VFX rõ ràng.
- Budget ưu tiên telegraph và đòn đang active; giảm bụi/ánh sáng trước.
- Không cắt đạn phía renderer trong khi damage vẫn tồn tại, hoặc tạo vùng vô hình khi chạm cap.
- Có quyết định admission trước khi tạo đòn: thiếu budget thì hoãn/giảm pattern theo config và giữ telegraph đúng pattern thật.
- Clear boss A không xóa đòn B; cleanup cuối trận/restart xóa toàn bộ owner.
- Pause và tab ẩn không tích timer/đòn đến khi quay lại xả đồng loạt.
- Giữ save hiện có; thay đổi boss trong run không buộc xóa tiến trình người chơi.
- Giữ build/asset tương thích base GitHub Pages đang dùng.
- Comment các điểm quan trọng: linear scaling, force cap, owner cleanup, phase transaction, scheduler idempotent. Không comment từng dòng.

Cập nhật GAME_SPEC/tài liệu balance, boss catalog, acceptance và CHANGELOG theo cấu trúc project. Phân biệt số đề xuất với số đã đo.

## 11. Kiểm chứng bắt buộc

Dùng kiểm tra tự động có ý nghĩa cho các luật mới; dùng kiểm tra trực quan cho UI/VFX.

### UI và kinh tế
- Cung tròn: tái hiện trước, xác định owner, kiểm tra menu/thành tựu/Balo sau sửa.
- Không mất progress ring có nhãn, focus hoặc loader hợp lệ.
- Stardust nhìn rõ ở các viewport, số lớn không tràn.
- Nhận thưởng/mua/quay lại sảnh hiển thị đúng và save không đổi sai.

### Hazard
- Ngoài/trong/đúng mép vùng; warning không gây damage/lực.
- Hút và đẩy cho vector đúng chiều, có hiệu ứng vị trí đo được.
- Tại tâm không NaN, force tổng không khóa tàu.
- Radiation damage theo thời gian mô phỏng; pause không tick.
- Quái tương tác đúng; boss không vô tình nhận damage %HP.
- Hết/restart không còn lực, damage hoặc VFX mồ côi.
- Chất lượng Thấp vẫn thấy biên và cue.

### Scaling và vũ khí
- Kiểm tra 59,99/60/60,01 giây và mốc 540/660; đúng một lần mỗi phút.
- Quái mới/cũ cùng factor, giữ HP ratio, không hồi sinh.
- Chaos bắt đầu/kết thúc không lũy thừa factor.
- Quasar range giảm 20–25%, damage và tốc độ bắn không bị giảm ngoài yêu cầu.
- Target/chain ngoài envelope mới không nhận damage, VFX khớp hit geometry.
- Hệ tiến hóa và điều kiện đủ năm slot/max trước mastery không hồi quy.

### Boss
- Seed cố định cho cùng kết quả chọn; hai mốc bốc khác boss khi pool cho phép.
- Mỗi mốc chỉ spawn một lần; boss thứ hai xuất hiện khi boss đầu còn sống.
- Cả hai boss đều di chuyển, đánh, chuyển phase và nhận damage độc lập.
- Dọn/giết boss A không xóa đòn/timer boss B.
- Overkill phase 1, transition invulnerability, reward phase 2 chỉ một lần.
- Boss chết trong lúc chuẩn bị beam/dash: không còn đòn ma.
- Không spawn/damage mới sau kết quả trận.
- Kiểm tra lối né, không chỉ xác nhận timer chạy đúng.

### Playtest tổng hợp
- So sánh cùng seed/build trước và sau; tối thiểu ba build (công/thủ/cơ động), có/không tiến hóa.
- Thử đầy đủ từng boss, từng phase và ít nhất ba cặp boss khác nhau.
- Đo TTK, damage tàu/Beacon, thời gian trong hazard, boss sống tại 11:00, thời gian dọn quái và số object.
- Có một lượt tay hoặc clip tương tác thực để đánh giá đọc cảnh báo và cảm giác lực, nếu môi trường cho phép.
- Đo p50/p95 frame time ở đông quái + hai boss + hazard trên cùng môi trường; không suy FPS từ bot chạy logic.
- Chạy typecheck/test/build có sẵn phù hợp. Báo rõ kiểm tra nào chưa chạy; không tự ghi PASS.

## 12. Bàn giao

Hoàn thành bản chạy local có thể review, không dừng ở kế hoạch. Báo bằng tiếng Việt:
1. Nguyên nhân cung tròn và sửa ở đâu.
2. Ảnh sảnh sau sửa, vị trí/kích thước Stardust.
3. Clip/ảnh hazard và state đi kèm; ảnh tĩnh không đủ chứng minh hướng hút/đẩy.
4. Bảng scaling và tầm vũ khí trước/sau.
5. Ba boss, hai phase, nhịp skill và các cửa sổ né.
6. Minh chứng hai boss đồng thời và không dùng chung timer/beam.
7. Kết quả test, playtest và hiệu năng thực tế.
8. File cấu hình cần chỉnh khi muốn cân bằng tiếp, phần chưa kiểm chứng và hạn chế.

Không tuyên bố “fix triệt để” hoặc “đã cân bằng” chỉ dựa trên build thành công. Chứng minh bằng đúng các kịch bản ở trên, giữ phạm vi thay đổi có thể hiểu và chỉnh tiếp được.

