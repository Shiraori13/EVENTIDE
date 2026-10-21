# EVENTIDE — Prompt nâng cấp bản sắc hình ảnh, UI và chuyển động vũ trụ

Bạn là người phụ trách art direction, UI/UX, chuyển động và rendering cho web game 2D EVENTIDE. Hãy thực hiện trực tiếp trên project hiện có một đợt nâng cấp hình ảnh hoàn chỉnh, có thể kiểm tra trong bản chạy local.

## 1. Mục tiêu và giới hạn

UI hiện tại đã dùng được, nhưng còn giống một giao diện công cụ đặt trên nền game. Cần tạo cảm giác đây là một trò chơi có ngôn ngữ hình ảnh riêng: một phi thuyền nhỏ bảo vệ nguồn sáng cuối cùng giữa không gian đang bị hư không xâm thực.

Kết quả phải thể hiện rõ:
- Không gian có chiều sâu và chuyển động; người chơi cảm nhận được mình đang bay.
- Beacon là trung tâm thị giác và cảm xúc của trận đấu.
- HUD, menu, Balo, nâng cấp và VFX cùng thuộc một thế giới.
- Thông tin chiến đấu vẫn đọc nhanh; hiệu ứng không che quái, đạn hoặc cảnh báo.
- Code có tổ chức, dễ đổi màu, giảm hiệu ứng, thay asset và mở rộng.

Đây là nâng cấp hình ảnh và cảm giác phản hồi. Giữ nguyên luật chơi, chỉ số, drop rate, số slot, thuật toán draft, tiến hóa, điều kiện mastery, boss và dữ liệu lưu. Không thêm cơ chế chiến đấu, tiền tệ hoặc meta progression mới.

Không chỉ viết kế hoạch, mockup hoặc đổi vài màu. Hãy đọc code, sửa, chạy và kiểm tra sản phẩm thực tế. Không tự push hoặc deploy trong tác vụ này.

## 2. Khảo sát trước khi triển khai

Đọc AGENTS.md, concept/core và tài liệu kiến trúc thực sự có trong project. Xác định framework/rendering, các scene, HUD dùng DOM hay canvas, asset loader và cơ chế pause hiện tại. Không giả định tên file hoặc ép đổi stack.

Ghi nhận bản trước khi sửa:
- Menu chính, gameplay đầu trận, gameplay đông quái, Balo, màn chọn nâng cấp và màn Beacon nếu đã có.
- Những thành phần đang tốt cần giữ.
- Vấn đề phân cấp thông tin, font, khoảng cách, độ tương phản và hiệu ứng hiện tại.
- Số object/VFX, thời gian frame và tình trạng bộ nhớ ở cùng một kịch bản kiểm tra.

Tìm và sửa theo hệ thống thành phần hiện có. Không chồng một lớp particle mới lên hệ thống cũ mà không dọn vòng đời. Nếu tài liệu và code khác nhau, ưu tiên giữ hành vi đang hoạt động, ghi rõ khác biệt thay vì âm thầm đổi gameplay.

## 3. Art direction: “Nguồn sáng giữa thủy triều hư không”

Lấy sự tương phản giữa ánh sáng có trật tự và hư không đang cuộn chảy làm bản sắc EVENTIDE.

Ba dấu hiệu nhận diện phải được dùng nhất quán:
1. Vòng đồng tâm đứt đoạn: xuất hiện ở Beacon, chỉ báo nạp và tiêu điểm quan trọng.
2. Đường cong thủy triều: dùng cho chuyển động tinh vân, vệt năng lượng và chuyển cảnh.
3. Điểm sáng ấm giữa nền lạnh: ánh vàng Beacon dẫn mắt, cyan thuộc phi thuyền/công nghệ, tím sâu thuộc hư không.

Phong cách: khoa học viễn tưởng tinh tế, cô độc, rõ hình khối. Có khoảng thở, lớp nền sâu, nét viền có chủ đích. Không phủ neon, glass blur hoặc glow lên tất cả thành phần. Không biến giao diện thành bảng điều khiển giả có nhiều chữ và con số trang trí.

Bảng màu xuất phát, có thể chỉnh theo kiểm tra thực tế:
- Nền sâu: #050914, #0B1426.
- Surface UI: #101D30, #17283D.
- Chữ chính: #E8F0F4; chữ phụ: #A8B9CC.
- Công nghệ/phi thuyền: #7DDCEB.
- Beacon/tiêu điểm: #EFCB83.
- Hư không: #8063B5.
- Nguy hiểm: #F47F86.

Đưa màu, độ mờ, độ dày nét, khoảng cách và timing vào token/config chung. Màu trên chỉ là định hướng; chữ, nền và trạng thái phải được kiểm tra tương phản. Không dùng màu làm dấu hiệu duy nhất.

## 4. Không gian sống: có chiều sâu và chịu tác động của trận đấu

Tổ chức các lớp theo chi phí và vai trò:

### 4.1. Lớp xa

- Nền gradient gần đen; tinh vân lớn có hình khối, vùng sáng/tối và khoảng trống.
- Một dải ngân hà hoặc cấu trúc bụi xa, lệch tâm để tránh che khu vực chơi.
- Dùng texture đã tạo sẵn hoặc cache; không vẽ lại nền lớn mỗi frame.
- Chuyển động cực chậm, không xoay cả bầu trời hoặc dịch chuyển như màn hình chờ.
- Nét riêng đến từ đường cong thủy triều và bố cục, không từ lượng particle.

### 4.2. Lớp trung

- Sao nhỏ, mật độ có kiểm soát, độ sáng không đồng đều.
- Một phần nhỏ nhấp nháy chậm, lệch pha; không cùng sáng/tắt.
- Parallax tương đối nhẹ theo chuyển động camera hoặc vị trí cảm nhận của phi thuyền.
- Nếu camera hiện cố định, tạo parallax thị giác giới hạn; không thay camera gameplay chỉ để có hiệu ứng.

### 4.3. Lớp gần

- Bụi không gian hoặc mảnh vụn thưa giúp cảm nhận vận tốc.
- Cường độ thay đổi nhẹ theo tốc độ, không thành vệt hyperspace liên tục.
- Vật thể trang trí không có hitbox, không chặn di chuyển hoặc che đòn đánh.

### 4.4. Phân biệt vật trang trí với vật thu thập

- Sao nền: rất nhỏ, mờ, không có viền pickup, không bay hút vào tàu.
- Orb EXP: nằm rõ ở lớp gameplay, có silhouette/halo và chuyển động thu thập riêng.
- Drop trang bị: biểu tượng hoặc hình dạng khác EXP, trạng thái có thể nhặt rõ ràng.
- Thứ tự vẽ phải giữ cảnh báo, mục tiêu và pickup quan trọng đọc được.

Hạn chế mật độ ở vùng giao tranh. Sự kiện thiên văn và boss có thể đổi sắc/nhịp nền qua state đang có, không tạo thêm sự kiện gameplay. Chuyển sắc từ từ, tránh đổi sáng toàn màn hình đột ngột.

## 5. Beacon: “trái tim” hình ảnh của trận đấu

Tạo hình Beacon có lõi sáng, cấu trúc vòng và dòng năng lượng đi vào lõi. Tránh chỉ làm một vòng tròn glow lớn.

Ánh xạ trực tiếp vào trạng thái thật:
- Bình thường: lõi thở nhẹ, vài vòng chuyển động chậm với hướng/nhịp khác nhau.
- Đang nạp: dòng năng lượng chạy vào lõi, một đoạn vòng biểu thị tiến độ thật; ánh sáng tăng có giới hạn.
- Bị đánh: chớp đỏ cục bộ và phản hồi ngắn, đọc được cả khi tắt screen shake.
- Nguy cấp: thêm dấu hiệu hình dạng/nhịp và trạng thái chữ, không chỉ đổi màu.
- Hoàn tất hoặc hỏng: chuyển động kết thúc ngắn, không khóa điều khiển ngoài luồng game hiện có.

Phần trăm nạp và HP phải lấy từ state thật. Không tween thanh HP làm người chơi tưởng còn máu sau khi đã chết. Không để hiệu ứng bị đánh che quái đang tiếp cận.

Màn nâng cấp Beacon nếu hiện có:
- Preview model dùng cùng ngôn ngữ tạo hình với Beacon trong trận.
- Bố cục rõ: model, trạng thái hiện tại, trước/sau nâng cấp, chi phí và nút xác nhận.
- Stardust tinh khiết hiển thị rõ, dùng đúng dữ liệu hiện có.
- Animation preview nhẹ và có thể tắt.
- Không tạo chỉ số mới hoặc tự thay đổi công thức nâng cấp.

## 6. Phi thuyền: cảm giác bay mượt nhưng điều khiển tức thì

Giữ tốc độ, gia tốc gameplay nếu đang có, vị trí thực, hitbox, hướng ngắm và cách bắn.

Cải thiện lớp trình bày:
- Hướng xoay hiển thị mượt, chọn đường xoay ngắn hợp lý.
- Thân tàu nghiêng nhẹ khi đổi hướng; có giới hạn để silhouette và hướng súng vẫn rõ.
- Động cơ thay đổi chiều dài/độ sáng theo vận tốc hoặc input có sẵn.
- Trail ngắn, có fade và giới hạn số điểm; không kéo dài che đạn.
- Khi dừng, động cơ giảm và pose ổn định mềm, không làm tàu trôi nếu luật hiện tại không có quán tính.
- Phản hồi khi trúng đòn ngắn, ưu tiên viền/silhouette và dấu hiệu HP.
- Bật/tắt shake không được ảnh hưởng mô phỏng hoặc việc xác định mục tiêu.

Nếu smoothing làm sprite lệch vị trí thật, giới hạn độ lệch chặt hoặc bỏ dịch vị trí, chỉ smooth xoay/nghiêng. Thử đổi hướng nhanh và đi chéo để chắc chắn không thêm độ trễ input hoặc sai cảm nhận va chạm.

## 7. VFX: nhận diện qua chuyển động và hình dạng

Đọc danh sách vũ khí, kỹ năng, quái và boss thật trong project. Chỉ áp dụng cho những thứ đang tồn tại; không thêm vũ khí mới trong tác vụ này.

Mỗi nhóm cần khác rõ về hình dạng, nhịp và hướng chuyển động:
- Plasma/Supernova nếu có: lõi sáng gọn, viền nổ ngắn, vòng shockwave có giới hạn.
- Pulsar/beam nếu có: đường lõi chính xác với bề rộng sát vùng gây sát thương, kết thúc nhanh.
- Ion/chain lightning nếu có: nhánh điện nối đúng mục tiêu, không tạo sét trang trí dễ hiểu nhầm là hit.
- Drone nếu có: model dễ nhận ra, quỹ đạo rõ, trail nhỏ và tín hiệu khai hỏa.
- Gravity Well/hố đen nếu có: hướng hút phải nhìn thấy bằng đường cong, bụi và vòng xoắn đi vào lõi. Tách rõ vùng ảnh hưởng với phần trang trí; giảm thành phần trang trí khi đông quái.
- Vũ khí tiến hóa: giữ dấu hiệu nguồn gốc, có silhouette/nhịp mới để cảm nhận tiến hóa. VFX phải đọc đúng state đã tiến hóa, không chỉ đổi tên thẻ.

Telegraph boss:
- Tương phản tốt trên nền và hiệu ứng vũ khí.
- Rõ bước chuẩn bị → khóa mục tiêu nếu có → thực thi → tan.
- Vị trí, hướng, thời điểm và vùng nguy hiểm phải theo logic thật; không dùng animation để che lỗi kỹ năng đứng sai chỗ.
- Khi hạn chế hiệu ứng, giữ cảnh báo và vùng sát thương, giảm bụi/ánh sáng trang trí trước.

Thứ tự ưu tiên: cảnh báo nguy hiểm và mục tiêu > silhouette tàu/quái/Beacon > pickup cần nhìn > thông tin hit thiết yếu > hiệu ứng trang trí > nền. Dùng vùng tô mờ/viền khi cần, tránh hàng loạt chữ sát thương che màn hình.

Không thay sức mạnh boss, tần suất kỹ năng, sát thương hay thời gian telegraph trong lần nâng cấp hình ảnh này.

## 8. UI: đồng bộ với thế giới game, có phân cấp rõ

### 8.1. Menu chính

- Key visual là Beacon giữa không gian, với chuyển động nền chậm.
- Logo/tên EVENTIDE có motif thủy triều/vòng đứt đoạn riêng.
- Nút Chơi là tiêu điểm rõ. Những mục khác theo cấu trúc đang có.
- Hover/focus: ánh sáng chạy ngắn theo viền hoặc chuyển nhẹ một chi tiết, không làm cả nút bay/nhảy.
- Không thêm intro bắt buộc, màn tải giả hay menu phụ không cần thiết.

### 8.2. HUD trong trận

- Nhìn nhanh được HP tàu, HP/nạp Beacon, thời gian, cấp/EXP và Corruption nếu có.
- Nhóm thông tin theo vai trò, không rải panel có cùng trọng lượng thị giác quanh bốn góc.
- Trạng thái bình thường gọn; cảnh báo tăng mức nhấn khi thật sự cần.
- Chỉ dùng transition cho giá trị/trạng thái thay đổi; không cho mọi ô liên tục pulse.
- Hiển thị số quan trọng ổn định, tránh layout nhảy khi số dài hơn.
- Banner sự kiện không che đường đạn hay Beacon; dùng một vùng thông báo có thứ tự, không xếp toast tràn màn hình.

### 8.3. Balo, build và màn nâng cấp

- Giữ đúng danh sách đã pick, cấp, loại, điều kiện tiến hóa và dữ liệu hiện có.
- Phân biệt vũ khí chính/phụ/hỗ trợ bằng nhãn và icon theo taxonomy thật.
- Thẻ có thứ bậc: icon → tên → cấp/trạng thái → hiệu ứng chính → chi tiết.
- Chỉ số trước/sau căn rõ, phần tăng được nhấn vừa đủ.
- “Đã tối đa”, “Thiếu điều kiện”, “Có thể tiến hóa” có hình dạng/nhãn riêng.
- Nút tiến hóa phản ánh kết quả giao dịch thật; chỉ chạy animation thành công sau khi model/state đã commit.
- Không che lỗi tiến hóa hoặc draft bằng thay đổi UI; nếu phát hiện lỗi logic ngoài phạm vi, ghi nhận rõ.
- Không đổi điều kiện đủ slot/max level/mastery. Không tự mang trở lại nút thay vũ khí gây mất tiến trình.
- Scroll giữ header/nút trở về dễ tìm, không để footer đè nội dung.

### 8.4. Các màn còn lại

Áp dụng cùng token và component cho chọn nhân vật, thông số, thành tựu, cài đặt và kết quả trận nếu có. Không tạo thêm chức năng chỉ vì thiết kế cần một màn mới.

## 9. Typography, spacing và khả năng sử dụng

- Dùng font có đầy đủ dấu tiếng Việt, đóng gói local; kiểm tra giấy phép và ghi nguồn.
- Tối đa hai họ font. Không dùng font trang trí khó đọc cho mô tả/chỉ số.
- Kiểm tra các chuỗi thực tế: “Tiến hóa”, “Nâng cấp”, “Stardust tinh khiết”, “Tỷ lệ chí mạng”, “Đã tối đa”.
- Không xử lý dấu bằng ký tự chèn thủ công; loại bỏ letter-spacing bất hợp lý ở body text.
- Dùng thang spacing và kích thước chữ nhất quán; có đủ chiều cao dòng cho dấu tiếng Việt.
- Tooltip/focus không bị cắt bởi scroll container, cạnh viewport hoặc canvas.
- Khi UI dùng DOM, có focus-visible, điều hướng bàn phím và trạng thái disabled rõ. Khi dùng canvas, giữ phím tắt và cách chọn hiện có, không tạo đường tương tác chỉ dùng hover.
- Không ép chữ chạy marquee, typewriter hoặc nhấp nháy cho nội dung người chơi cần đọc.
- Kiểm tra 1280×720, 1366×768, 1920×1080 và viewport hẹp khoảng 390×844 cho menu/HUD. Không cam kết chơi cảm ứng nếu game chưa có điều khiển cảm ứng; ít nhất không vỡ bố cục hay mất nút.

## 10. Chuyển động có ngữ pháp và cài đặt giảm chuyển động

Mốc khởi đầu để tinh chỉnh:
- Hover/focus: 100–160 ms.
- Mở/đóng panel: 160–240 ms, opacity và dịch chuyển nhỏ.
- Thẻ nâng cấp xuất hiện: 180–260 ms, stagger nhẹ, không chặn chọn sau khi đã sẵn sàng.
- Phản hồi hit: ngắn khoảng 80–150 ms, giới hạn khi nhận nhiều hit.
- Nhịp nền/Beacon: chậm, vài giây đến hàng chục giây; lệch pha.

Timing trên là cấu hình trình bày, không thay timer gameplay. Không dùng blur toàn màn hình mỗi lần mở panel. Không để tween chạy chồng khi hover nhanh, đóng/mở liên tục hay chuyển scene.

Thêm tùy chọn:
- Chất lượng hiệu ứng: Thấp / Vừa / Cao.
- Giảm chuyển động: giảm parallax, nghiêng tàu, rung, pulse và flash trang trí.
- Rung màn hình: có thể tắt riêng nếu project đã hỗ trợ hoặc bổ sung gọn.

Ưu tiên lựa chọn đã lưu của người chơi; nếu chưa chọn, có thể lấy prefers-reduced-motion làm mặc định. Chất lượng Vừa phải thể hiện đầy đủ art direction. Cảnh báo gameplay vẫn rõ ở mọi cấu hình.

Khi pause/level-up/Balo:
- Mô phỏng, projectile, hút, cooldown và event timer dừng theo cơ chế hiện tại.
- UI có thể tiếp tục chuyển động nhẹ bằng clock trình bày riêng.
- Hiệu ứng trang trí được phép tiếp tục nếu không gây hiểu nhầm game đang chạy và không phá pause.
- Không dùng một animation loop mới để vô tình tick gameplay khi scene đã pause.
- Tab ẩn/hiện lại không gây bước nhảy mô phỏng hoặc bão particle tích lũy.

## 11. Hiệu năng và vòng đời

Game từng khựng khi đông quái. Hình ảnh mới chỉ được coi là đạt khi chi phí có giới hạn và đã đo.

- Pool particle/đối tượng dùng nhiều; tái sử dụng texture, gradient và sprite.
- Có trần cho trail, particle, ring và VFX. Trần tính cả object đang tồn tại, không chỉ số spawn mỗi frame.
- Culling, giảm nhịp nền và giảm decoration ngoài màn hình khi thích hợp.
- Không tạo texture, canvas, filter hoặc chuỗi DOM lớn liên tục trong update.
- Không thêm shader/blur/distortion toàn màn hình nếu chưa đo chi phí và có fallback.
- Không khởi tạo lại DOM HUD mỗi frame; cập nhật khi dữ liệu hoặc nhịp hiển thị cần đổi.
- Cleanup tween, timer, event listener, emitter và texture tạm khi đổi scene/restart.
- Hệ thống quality chỉ giảm trình bày. Không làm projectile logic, hitbox hay pickup biến mất chỉ để giảm draw.
- Không thêm thư viện lớn hoặc engine thứ hai chỉ để tạo animation.

Đặt ngân sách minh bạch theo máy và bản baseline thực tế:
- Mục tiêu khoảng 60 FPS trên cấu hình kiểm tra được ghi lại; đây là mục tiêu cần đo, không phải lời cam kết cho mọi máy.
- Báo p50/p95 frame time và các lần khựng đáng kể ở cùng scene/mật độ.
- Mốc tham chiếu: tránh tăng p95 quá 10% ở chất lượng Vừa so với baseline cùng điều kiện; nếu baseline vốn chậm thì tối ưu đến mức chơi ổn và báo số thực.
- Chạy nhiều lượt restart/open-close menu để phát hiện số object/listener tăng không giới hạn.
- Trạng thái đông quái phải giảm hiệu ứng nền/trang trí trước; tránh bật/tắt quality liên tục.
- Có thể thêm overlay đo trong chế độ dev, tắt mặc định ở bản người chơi.

## 12. Tổ chức code, asset và tài liệu

Tận dụng module/component hiện có. Chỉ tách mới khi giúp cấu hình và vòng đời rõ hơn. Các vai trò nên tách biệt:
- Design tokens và cấu hình chuyển động.
- Background/parallax.
- VFX và quality budget.
- Phần trình bày tàu/Beacon.
- UI component dùng chung.
- Liên kết trạng thái gameplay sang presentation.

Dùng tên theo convention project, không bắt buộc tạo đúng các tên minh họa trên. Không làm “God class” quản lý toàn bộ animation.

Asset:
- Tách nền, UI, tàu, Beacon, vũ khí, quái và VFX theo cấu trúc hợp lý.
- Chọn SVG cho icon/hình học, texture raster cho tinh vân nếu phù hợp.
- Tái sử dụng/cải tiến asset tốt đang có. Không download asset không rõ giấy phép.
- Không dùng emoji làm bộ icon chính.
- Chuẩn bị asset thật; không để ô placeholder trong bản bàn giao.
- Ghi nguồn, giấy phép, kích thước, mục đích và điểm chỉnh trong tài liệu asset.
- Nếu chưa có công cụ tạo bitmap, tạo hình học/procedural có chất lượng và cache khi load; không để việc thiếu công cụ chặn các phần khác.

Giữ đường dẫn tương thích build local và base /EVENTIDE/ nếu project đang cấu hình GitHub Pages. Không hardcode đường dẫn gốc làm font/texture mất khi deploy.

Bổ sung/cập nhật tài liệu design system trong docs theo tên phù hợp: palette, typography, spacing, motif, bảng trạng thái, timing và quality. Cập nhật asset manifest/CHANGELOG nếu project đã có.

Comment tại các điểm cần hiểu lý do: clock pause, giới hạn particle, cleanup, layer order và smoothing không tác động hitbox. Không comment lặp từng dòng.

## 13. Quy trình thực hiện và kiểm chứng

Thực hiện theo các bước ngắn nhưng hoàn thành toàn bộ:
1. Chụp/ghi baseline và xác định token, vùng thông tin chính.
2. Hoàn thiện một lát cắt: gameplay bình thường có nền, tàu, Beacon và HUD.
3. Áp dụng cùng art direction cho menu, Balo, draft và các màn hiện có.
4. Bổ sung VFX theo state, quality và reduced motion.
5. Kiểm tra trực quan, tương tác và hiệu năng; sửa các điểm chưa đạt.

Không dừng sau bước 2 để hỏi có tiếp tục hay không. Không viết kế hoạch quá dài rồi bỏ phần triển khai.

Chạy kiểm tra đã có phù hợp, build production và mở bản preview. Kiểm tra ít nhất:
- Vừa vào game: thấy rõ chiều sâu mà không cần quái/đạn lấp màn hình.
- Di chuyển chéo, đổi hướng liên tục và dừng: tàu mượt, điều khiển không trễ.
- Nhiều quái/vũ khí: vẫn nhận ra nguy hiểm, Beacon và EXP.
- Hố đen nếu có: hướng hút rõ, vùng ảnh hưởng không bị phóng đại.
- Beacon nạp/bị đánh/nguy cấp: mỗi trạng thái phân biệt được.
- Mở/đóng Balo và chọn nâng cấp: không lặp animation/timer, không làm mô phỏng chạy tiếp.
- Tiến hóa nếu có: UI hiển thị đúng state thật sau hành động.
- Chuyển phase boss/sự kiện: đọc được telegraph và banner không che tâm giao tranh.
- Chất lượng Thấp và reduced motion: vẫn đọc đủ thông tin để chơi.
- Restart tối thiểu 3 lần: không tích lũy object/listener/VFX bất thường.
- Font tiếng Việt ở các viewport mục tiêu không bị lỗi dấu, chữ dính hoặc nội dung bị cắt.
- Production preview ở base triển khai không có asset 404 hay lỗi console chặn game.

Không thêm các cơ chế vốn chưa có chỉ để chạy danh sách kiểm tra. Nếu thiếu khả năng đo/trình duyệt, ghi rõ phần chưa xác minh, không tự đánh dấu PASS.

Bàn giao:
- Bản chạy local và hướng dẫn lệnh đúng với project.
- Tóm tắt art direction đã hiện thực, thay đổi ở từng vùng UI chính.
- Ảnh trước/sau ở cùng viewport cho menu và gameplay; nếu có thể, clip ngắn để đánh giá chuyển động. Không dùng mockup làm bằng chứng bản chạy.
- Danh sách file/asset quan trọng và nơi chỉnh màu, timing, mật độ, quality.
- Kết quả build, kiểm tra chức năng và số đo hiệu năng thực tế.
- Những hạn chế hoặc phần chưa kiểm chứng.

Tiêu chí cuối: nhận ra EVENTIDE nhờ ánh sáng Beacon, vòng đứt đoạn và thủy triều hư không; cảm thấy không gian đang sống; vẫn đọc trận đấu dễ và điều khiển ngay lập tức. Không đánh giá thành công chỉ bằng số hiệu ứng hoặc số file đã sửa.

