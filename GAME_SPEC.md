# EVENTIDE Thủy Triều Hư Không

## Cập nhật UX/stability local · 2026-10-21

Bản beta1.0.0 bổ sung các hành vi dưới đây, giữ luật nền/cân bằng của bản UI/hazards/multi-boss. Không phát hành lại Pages. [Báo cáo thay đổi](docs/next-beta-ux-report.md), [kiểm tra thực tế](docs/status.md).

- **UX-WARNING** HUD có normal/warning/critical theo HP: critical vào≤25%/thoát≥32%, warning vào≤50%/thoát≥58%; Beacon bị đánh có nhãn2s. Corruption cảnh báo từ40/thoát<35, còn buff luôn đúng ngưỡng50. Có chữ/icon và hướng quay về khi Beacon nguy cấp ngoài màn hình. Cảnh báo/timer dùng simulation clock; cue Beacon tối đa1lần/s âm thanh. Không đọc HP/timer liên tục bằng aria-live.
- **UX-BUILD/DRAFT** Balo theo thứ tự tổng quan3+2ô → recipe/hành động → chỉ số hiệu lực → bảng nguồn mở rộng có scroll. Progress và điều kiện thiếu tính theo build thật. Thẻ draft có loại/cấp/2–3giá trị trước-sau/câu tác dụng, details kỹ thuật riêng; calculator dùng cùng content/stats/attackInterval với gameplay, không ghi DPS suy đoán. Reroll có lý do đọc được; focus trap bao gồm summary, phím tắt không chạy trong input/select, đóng khôi phục focus và đúng draft/pause.
- **UX-TUTORIAL** Ba gợi ý một lần theo profile: rời sáng, Beacon thực sự bị đánh, đủ Pulsar5+Ion5. Queue hoãn khi nguy hiểm/telegraph/modal/draft; trigger chưa hiển thị không mất. Gợi ý không pause, tối đa10s simulation/lần và cách3s; có Bỏ qua. Cài đặt tắt hoặc xem lại chỉ đổi tutorial, giữ mọi meta. Seen chỉ ghi khi nội dung thật sự hiển thị. Notification thành tựu tối đa4nhóm/gộp trùng, nhường dialog/nguy hiểm.
- **UX-REPORT** Snapshot build và thống kê trước cleanup, deep-freeze sau settlement. Incoming là HP thực mất sau giáp/invuln, clamp overkill; tách tàu/Beacon, loại/owner boss và contact/projectile/beam/radiation/Solar. Fatal ở đòn thật làm HP dương về≤0; cả hai chết cùng tick nói rõ cả hai, vẫn defeat ưu tiên tại720s. Outgoing theo vũ khí/môi trường là tổng HP, không phải DPS; phase1 không cộng overkill sang phase2. Details có giây chịu hazard/lực, Corruption≥50 và ngoài sáng. Final weapons/hình thái/hỗ trợ, một achievement thực hoặc mục tiêu gần nhất. Tối đa một nhận xét nếu >50% damage Beacon xảy ra khi tàu ngoài sáng, không suy “build yếu”. Reward/kinh tế giữ.
- **SAVE-TUTORIAL** Schema3/key cũ giữ; thêm optional-default `tutorialSeen: []`, `settings.tutorial: true`; save1/2/3 giữ progress/settings cũ, false tutorial đã lưu được tôn trọng. Report chỉ thuộc lượt, không checkpoint hoặc ghi storage mỗi hit.

## 1 Thông tin và cách dùng

- Phiên bản đặc tả: beta 1.0.0 (kế thừa progression/save hotfix1.4.1 và visual, thay luật đúng phạm vi cập nhật), cập nhật UX/stability local ngày 2026-10-21, kế thừa UI/hazards/multi-boss 2026-10-18 theo múi giờ Việt Nam; chưa push/deploy. Giữ thành quả1.1; thay đổi cân bằng có chủ đích được ghi trong [balance](docs/balance.md). Bằng chứng và giới hạn kiểm chứng ở [status](docs/status.md).
- Mục tiêu hiện tại: Game chơi đơn trên trình duyệt máy tính, chạy local hoặc GitHub Pages dưới /EVENTIDE/.
- Nguồn: concept `EVENTIDE_Concept_Web.docx` đã thống nhất; các chi tiết triển khai bổ sung từ prompt MVP được phân biệt trong [quyết định thiết kế](docs/design-decisions.md).
- Đây là core thiết kế dài hạn. Nó định nghĩa game phải hoạt động thế nào, không khẳng định đã có mã nguồn hoặc đã kiểm chứng cân bằng. Trạng thái thực tế ở [status.md](docs/status.md).
- Nếu chỉ nhận riêng file này, có thể dùng nó như bản đặc tả tự chứa. Các file liên quan là tài liệu bổ trợ cần tạo/cập nhật khi triển khai, không phải dependency để hiểu gameplay cốt lõi.

## 2 Bản sắc và câu chuyện

EVENTIDE là game sinh tồn hành động 2D nhìn từ trên xuống, lấy cảm hứng từ vòng lặp di chuyển, tự tấn công, thu thập XP và chọn nâng cấp của Vampire Survivors. Người chơi điều khiển một tàu nhỏ bảo vệ Beacon trước các đợt Hollowborn. Trải nghiệm chính là quyết định khi nào ra ngoài lấy sức mạnh và khi nào quay về giữ nguồn sáng.

Hàng tỷ năm trước, vũ trụ có nhiều nền văn minh. Hư Vô, The Hollow, xuất hiện như làn sóng entropy: sao tắt, hành tinh vỡ và thời gian méo mó. Mọi thứ bị nuốt biến thành Bóng Rỗng, Hollowborn, giữ hình hài méo mó của những gì đã mất.

Các nền văn minh còn lại chế tạo Beacon, Hải đăng có thể tái lập một vùng không gian. Beacon cần thời gian sạc và một Lightkeeper bảo vệ. Nova là Lightkeeper mở đầu, lái tàu cứu hộ cũ được gắn công nghệ thu hồi. Mỗi chiến thắng khôi phục một vùng nhỏ và bảo tồn một ký ức Echo; không khởi động lại toàn vũ trụ chỉ bằng một màn.

Khẩu hiệu: “Khi mọi ngôi sao đã tắt, hãy là ánh sáng cuối cùng.” Tông cảm xúc cô đơn nhưng hy vọng. MVP kể chuyện bằng một dẫn nhập ngắn và một Echo sau chiến thắng đầu.

Bốn trụ cột cần giữ khi mở rộng:

1. Di chuyển và tự chiến đấu dễ hiểu, nâng cấp có tác dụng nhìn thấy được.
2. Beacon là đối tượng cần bảo vệ, có HP riêng và có thể khiến người chơi thua.
3. Ngoài vùng sáng có cơ hội phát triển, Corruption mang cả lợi ích lẫn nguy cơ.
4. Trọng lực và tiến hóa thiên văn tạo bản sắc vũ trụ nhưng không đòi mô phỏng khoa học chính xác.

## 3 Phạm vi hiện tại

| Hạng mục | Bắt buộc ở MVP |
|---|---|
| Nhân vật | Nova, Plasma Orb cấp 1 khi khởi đầu, chưa có nội tại riêng |
| Màn chơi | Tàn Tích Ngân Hà, đấu trường tròn hữu hạn |
| Module | Plasma Orb, Orbital Drones, Gravity Well, Pulsar Beam, Ion Storm và Quasar hợp nhất; ba ô |
| Trang bị | Pickup run-only, năm stat, tổng ngân sách 20% |
| Hỗ trợ | Sáu loại: damage, rate, HP, tốc độ bay, nhặt và giáp; chọn tối đa hai loại/run |
| Quái thường | Static Wisps, Hollow Drifters, Void Leeches |
| Boss | Pool Elder Star, Gravemaw, Helion Remnant, Void Harrier; hai mốc 09:00/11:00 |
| Cơ chế | Beacon, vùng sáng, Corruption, trọng lực môi trường, mastery, tiến hóa/hợp nhất và ba sự kiện thiên văn |
| Tiến triển | Stardust tinh khiết, ba cấp HP Beacon Core, một Echo |
| Trải nghiệm | Menu, hướng dẫn, HUD, nâng cấp, pause, kết quả, âm thanh, lưu trình duyệt |

Các nhân vật/màn/module khác trong concept thuộc [backlog](docs/backlog.md). Giữ các ý tưởng này trong thiết kế tương lai không có nghĩa phải làm mọi thứ trước khi bàn giao MVP.

## 4 RUN Luật lượt chơi

**RUN-01** Mỗi lượt dài 720 giây mô phỏng. Beacon tự sạc tuyến tính từ 0 lên 100%, kể cả khi tàu ở xa. Charge không yêu cầu tiêu diệt quái, giao tài nguyên hoặc đứng cạnh Beacon.

**RUN-02** Thắng khi charge đủ 100% và cả tàu lẫn Beacon còn HP. Thua nếu một trong hai hết HP. Khi cùng tick có sát thương chí mạng và đủ sạc, xử lý sát thương rồi xét thua trước thắng. Giết Elder Star không tự kết thúc màn; không giết boss vẫn có thể thắng.

**RUN-03** WASD/phím mũi tên để bay, chuẩn hóa đường chéo, thả phím thì dừng; không có quán tính ở MVP. Tự ngắm/bắn theo behavior module. Click hoặc 1/2/3 chọn nâng cấp; Esc pause, không bỏ qua nâng cấp.

**RUN-04** Các trạng thái là menu, playing, choosingUpgrade, paused, victory, defeat. Chỉ playing làm tiến triển mô phỏng. Modal nâng cấp và pause đóng băng sạc, movement, physics, AI, damage, weapon cooldown, pickup, Corruption, hồi máu, spawn, boss và gravity.

**RUN-05** Mất focus/ẩn tab tự pause và xóa phím đang giữ; trở lại phải chủ động tiếp tục. Nếu trước đó đang chọn nâng cấp thì phải trở lại lựa chọn đó. Không bù thời gian rời tab, không tự thắng hoặc chết khi tab ẩn.

**RUN-06** Chơi lại tạo state mới và cleanup state cũ. Rời lượt về menu là bỏ lượt, không nhận thưởng; UI phải nói rõ. Victory/defeat kết thúc và thưởng đúng một lần.

## 5 MAP Bản đồ và vùng sáng

**MAP-01** Tàn Tích Ngân Hà là bãi phế tích không gian, Beacon ở tâm. Đấu trường hữu hạn; tàu không ra ngoài rìa. Vùng sáng khoảng một phần ba bán kính; từ tâm ra rìa khoảng 8–10 giây ở tốc độ cơ bản. Bán kính thực thi và tốc độ ban đầu được ghi ở [balance](docs/balance.md), có nhãn là đề xuất kỹ thuật.

**MAP-02** Camera theo tàu; có hướng và khoảng cách tới Beacon khi nó ngoài màn hình, có cảnh báo Beacon bị đánh. Chưa cần minimap. Xác tàu và đá là trang trí ở MVP, không làm mê cung hoặc yêu cầu tìm đường.

**MAP-03** Stardust rơi tại nơi quái chết, chỉ hút gần tàu. Một ít cụm Stardust hữu hạn ngoài vùng sáng khuyến khích chuyến đi đầu màn; không tái sinh vô hạn hoặc thu XP từ toàn map.

**MAP-04** Spawn ngoài lõi Beacon và cách tàu một khoảng an toàn. Có giới hạn số lần tìm điểm; nếu không có vị trí hợp lệ thì hoãn spawn. Giữ đường quay về Beacon.

## 6 BEACON HP và vùng hỗ trợ

**BEACON-01** Tàu cơ bản 100 HP; Beacon cơ bản 300 HP, cộng nâng cấp lâu dài từ META-03 khi bắt đầu lượt.

**BEACON-02** Trong vùng sáng, tàu hồi 1 HP/giây, không vượt HP tối đa. Quái thường giảm 20% tốc độ. Beacon không tự hồi HP. Tàu và Beacon vẫn nhận sát thương trong vùng sáng; nó không là vùng bất tử.

**BEACON-03** Điểm nằm đúng trên biên vòng sáng được xem là trong vùng. Dùng cùng phép kiểm tra cho hồi máu, Corruption và giảm tốc; không cộng dồn slow vào tốc độ đã giảm mỗi frame.

**BEACON-04 (1.3)** Beacon Core có model riêng cấp0–3 từ appearance registry dùng chung menu/world. Menu tách model hiện tại và Sau nâng cấp, ví tinh khiết, bảng HP/bonus/light/charge/heal/slow/no-self-heal, giá và thiếu tiền cạnh nút mua. Preview thuần; purchase guard expectedLevel/currency/max và cập nhật snapshot một lần; lỗi storage giữ fallback RAM. Run chốt coreLevel lúc bắt đầu, không đổi khi preview/mua ở menu.

## 7 COR Corruption

**COR-01** Thanh 0–100, bắt đầu bằng 0; ngoài vùng sáng +4/giây, trong vùng sáng −8/giây. Clamp ở hai đầu.

**COR-02** Dưới 50 không có hiệu ứng. Từ 50 trở lên, sát thương tàu gây ra ×1,2 và sát thương tàu nhận ×1,2. Rơi dưới 50 mất cả hai hiệu ứng. Đạt 100 không chết tức thì, không mất quyền điều khiển, không sinh thêm hệ thống quái.

**COR-03** Bonus áp dụng đúng một lần với mọi module, đánh giá tại lúc gây damage; không sửa nhân lặp vào base stat. Corruption không tăng damage Beacon nhận. HUD nêu rõ cả lợi lẫn hại và có hào quang nhận biết.

Ví dụ: từ 0 ở ngoài 15 giây đạt 60; trở lại trong vùng hơn 1,25 giây sẽ xuống dưới 50. Giá trị 50 vẫn có hiệu ứng.

## 8 XP và UPG Nâng cấp

**XP-01** Stardust là XP của lượt hiện tại, reset khi chơi lại. Giữ XP dư; pickup có thể gây nhiều lần lên cấp. Xếp hàng lựa chọn và chỉ tiếp tục playing khi giải quyết hết các level đang chờ.

**XP-02 (VNext)** Orb cũ được gộp cục bộ theo tuổi mô phỏng và khoảng cách, không expiry hoặc tự thưởng từ xa. Orb đang hút và vùng sát phạm vi nhặt không bị merge; cluster giữ anchor làm vị trí đại diện. Giữ tối đa220 orb active; khi đầy dùng ledger theo cell hữu hạn trên map, bảo toàn XP và marker. Chỉ chuyển cell sang orb khi toàn bounds các vị trí đại diện đã nhận trong cell thuộc phạm vi nhặt. Sửa hành vi cap MVP từng chuyển loot mới tới orb xa có sẵn; đây là sửa vị trí/representation, không giảm hoặc tăng lượng loot.

**UPG-01** Tàu có tối đa ba ô module và hai ô hỗ trợ. Mỗi loại tối đa cấp5. Sáu loại hỗ trợ cùng pool nhưng chỉ chọn tối đa hai loại/run; khi đầy ô chỉ tăng loại đã có. Nova bắt đầu với Plasma cấp1; hỗ trợ bắt đầu0 và reset mỗi lượt.

**UPG-02** Mỗi draft có ID tăng dần, tối đa ba ID hợp lệ và một reroll miễn phí, ưu tiên thẻ chưa hiện. Normal pool chỉ nhận module khi còn ô hoặc tăng module đã có; không chứa replacement. Supports chọn tối đa hai loại, tăng loại chưa max. Draft/reroll dùng cùng eligibility năm ô; không có lựa chọn khác thì disable reroll có lý do và không tiêu lượt. Guard ID chặn stale/double action; thẻ hết hợp lệ sau mutation chỉ refresh cùng ID/pending/reroll với feedback, không tiêu pick. Pool cơ sở rỗng khi chưa đủ build là lỗi cần dev report và fallback an toàn, không giả mastery. XP dư/multi-level giữ nguyên. Cạn pool có thẻ hồi tối đa 10 HP hoặc Tiếp tục khi đầy HP; một action/pending, không auto-heal lúc mở hoặc reroll vô hạn.

**UPG-03** Bonus cộng trên base, clamp từng nguồn, không lãi kép: power/rate mỗi cấp+8%, trần40%; Hull/nhặt+10%, trần50%; bay+5%, trần25%; giáp+4 điểm%, trần20%. Rate chia cooldown Plasma/Well/Pulsar/Ion và cooldown hit drone, không rút duration Well hoặc telegraph. Tăng maxHP cộng đúng phần tăng vào currentHP, không hồi đầy và không tính là light heal.

**STAT-01** Runtime/menu/catalog/build dùng calculator chung. Damage=moduleAtLevelAndEvolution×(1+supportDamage+salvageDamage+masteryDamage)×Corruption×eventOutgoing. Rate=1+supportRate+salvageRate+masteryRate; interval gốc chia rate (min0,12s). HP/move/pickup=base×(1+ba nguồn tương ứng), nguồn clamp riêng. Tăng maxHP cộng current đúng delta, không hồi đầy/light heal. Incoming=source×(1−giáp)×Corruption, không áp outgoing/event tàu vào enemy damage hoặc radiation phần trăm. Beacon không nhận buff tàu. Base đạn/Well snapshot lúc tạo; các multiplier tại hit, cadence đã đặt không rescale ngược.

**UX-BUILD** Menu Phi thuyền đọc character registry, chỉ Nova đã triển khai. Danh mục đọc cùng registry draft, có mọi cấp/tiến hóa/cap; trong trận thêm trạng thái sở hữu/trần/không còn ô và chỉ đọc. Build hiện tại qua HUD/phímB hiển thị ba module, hai hỗ trợ, level, current/maxHP, số pick, bảng base/bonus/Corruption/hiệu lực. Mở từ playing pause rồi đóng quay lại; nếu blur/ẩn tab trong lúc xem phải chủ động resume. Mở từ draft đóng về đúng ID/reroll hoặc bước swap đang chờ. Pause Esc không có nút Build; B/HUD/draft vẫn xem được. Thành tựu có lọc Tất cả/Đã đạt/Chưa đạt và nhóm; số/đơn vị dùng formatter vi-VN, header/footer ngoài vùng cuộn. Esc đóng panel trên cùng trước; không bỏ draft hoặc click xuyên. New run/menu không giữ build cũ.

**LOOT-01 (1.3)** Mảnh trang bị thu hồi khác EXP, tự lắp khi nhặt; run-only, không chiếm ô, không inventory/shop. Mỗi mảnh một stat damage/rate/HP/pickup/speed, rolled50 hoặc100bp (0,5%/1%) xác suất50/50. Trần riêng2000bp, speed1000bp; tổng cả năm stat≤2000bp. Không giáp. Collect validate lại pool/cap/budget, clamp phần thực nhận; maxHP cộng current đúng delta. Không lãi kép hoặc ghi thành profile buff.

**LOOT-02** Chỉ final death roll một lần, XP giữ nguyên: Wisp5%; Drifter min(14%,8%+0,5 điểm%×phút); Leech min(12%,7%+0,4 điểm%×phút); Mọi boss phase2 final bảo đảm nếu còn stat/budget. Phase1/despawn/recycle/restart không roll. Item TTL30s simulation,5s cuối nhấp; pause dừng TTL. Active/visual cap32; nếu đầy bỏ drop mới và đếm capHits, không queue/đổi XP; playtest phải báo có chạm cap. Hết budget dừng drop và thu hồi pending, không giữ item vô dụng. EXP không có TTL này.

**UPG-04 Mastery (beta1.4.1, thay thế luật beta1.4)** Chỉ đủ ba module hợp lệ đạt max registry VÀ đủ hai hỗ trợ đã chọn đạt max SUPPORTS mới có mastery. Không yêu cầu cả sáu loại hỗ trợ. Ô thiếu/null/ID hoặc level sai không hoàn tất; tên hình thái tiến hóa dùng cùng ID thật. Điều kiện luôn tính từ build hiện hành, không latch theo lịch sử hoặc bonus đã dùng. Ba module5 nhưng hỗ trợ thiếu/chưa max tiếp tục nhận/nâng hỗ trợ cơ sở. Hợp nhất làm trống ô hoặc swap về1 trở lại nâng cơ sở, giữ nguyên Quasar/ô khác, support, salvage và mastery đã kiếm. Hoàn thiện lại tiếp tục ngân sách còn lại. Mỗi pick +200bp (2%), riêng damage/rate/HP/pickup≤2000bp, speed≤1000bp, tổng≤2000bp; không giáp/crit/lifesteal, không compound/persist. Nâng ô cuối lên max chỉ mở mastery ở draft sau, không tự tặng thêm bonus. Cạn budget có phục hồi/Tiếp tục. Build hiện số ô đã lắp/đạt trần và điều kiện còn thiếu.

## 9 WPN Module và tiến hóa

**WPN-01 Plasma Orb** tự bắn mục tiêu gần nhất còn sống trong tầm; đạn có TTL. Cấp 3 là Mini Sun với nổ lan nhỏ; cấp 5 là Supernova với vùng nổ lớn hơn và hiệu ứng mới. Cấp 2/4 tăng chỉ số. Chuỗi này giữ cùng ID module và một ô. Nêu rõ damage nổ/va chạm để không tính hai lần ngoài chủ đích.

**WPN-02 Orbital Drones** quay quanh tàu, contact damage có cooldown từng target. Cấp5 tự thành Orbital Bastion, giữ ID drones/slot/level5, 6 drone/46 damage/quỹ đạo112u/0,35s. Đây là mở rộng beta, không phải tên nguyên bản concept; không shield hoặc hồi HP.

**WPN-03 Gravity Well** chọn quái tạo field ngắn rồi nổ; chỉ hút quái. Cấp5 tự thành Singularity Well, giữ ID well/slot/level5; radius215u/damage154/force135/duration2,4s/cadence4,4s. Mở rộng beta, không hút tàu/Beacon/loot/đạn, không có cấp6–10.

**WPN-04** Không mục tiêu xử lý an toàn, tổng lực lên quái cap155u/s, tâm trả0 chống NaN. Quasar hợp nhất theo WPN-08, không ép ba vai trò mỗi vai trò một ô.

**WPN-05 Pulsar Beam** Cấp1–5, tia cyan gắn nguồn vào tàu hiện tại, quét360° trong duration hữu hạn; xét cả sector giữa hai tick và mỗi enemy ID chỉ nhận một hit/pulse. Damage/range/duration/cadence đọc content.ts, rate chia cadence. Cadence nhanh nhất vẫn dài hơn duration, không chồng pulse vô hạn.

**WPN-06 Ion Storm** Cấp1–5, chọn mục tiêu đầu trong initial range rồi chuyền đến mục tiêu chưa hit trong jump range; số target và falloff theo cấp. Path/damage chốt trong tick, VFX chỉ giữ tọa độ; không retarget object đã chết/tái dùng. Sét violet khác Pulsar cyan/beam boss.

**WPN-07 Swap** Replacement bị loại khỏi draft/reroll thường của1.3. Nút Thay vũ khí trong draft mở danh sách loại mới rồi chọn ô cũ; chỉ xác nhận mới tiêu một lựa chọn. Hiện cũ cấpN→mới cấp1 và cảnh báo mất tiến hóa/mở lại progression nếu mastery. Hủy/Esc giữ draft/XP/reroll/pending. Dọn attack đúng owner, module mới chờ cadence đầu. Giữ thứ tự ô khác, hỗ trợ/salvage/mastery và ngân sách đã dùng. Catalog/Build không đổi miễn phí. Quasar chỉ nhận bằng recipe, không draft/swap vào trực tiếp; không tách lấy lại nguồn.

**WPN-08 Quasar Cannon** Recipe concept Pulsar5+Ion5, nút chủ động trong Build với điều kiện và xác nhận đổi hai module thành một. Balo mở từ playing, pause hoặc draft đều cho quản lý recipe khi mô phỏng dừng; xác nhận phải ở trong vùng nhìn thấy và có focus. UI/action cùng predicate, không phụ thuộc mastery/support. Chuẩn bị definition/behavior/asset local hoặc fallback và output trước consume; lỗi trả lý do/giữ nguồn. Không tick/unpause để commit; state/UI/ảnh nguồn cập nhật ngay bằng revision. Đóng panel trở đúng pause/draft và Quasar hoạt động thật khi resume. Không mất level-up/XP/draft/reroll; consume atomic, Quasar5 ở ô nguồn đầu, giải phóng ô còn lại, không duplicate/doubleclick. Cleanup pulse/chain/cooldown nguồn, giữ damage đã resolve/loot/achievement. Sau fusion luôn tính lại năm ô: ô trống cần được lấp/nâng lại bằng module hợp lệ, chỉ giữ bonus/budget mastery đã kiếm. Đang trang bị Quasar không đề nghị Pulsar/Ion. Hành vi một quạt240°/0,45s, range398u (510×0,78 làm tròn, một lần)/damage220/cadence1,6s; một hit/ID/pulse, từ hit đầu tối đa3tia phụ trong215u, damage×0,45 và falloff×0,8, visited chung với beam để không hit lại. Beam/chain đều giới hạn tâm mục tiêu trong398u từ tàu hiện tại của tick và jump≤215u; origin beam theo tàu giống renderer, trace giữ tọa độ lúc hit. Ion độc lập giữ tầm cũ. Tối đa4 trace, không bật hai behavior cũ cùng lúc. Buff theo STAT-01.

**WPN-09 Vai trò** Chính: Plasma/Pulsar/Ion/Quasar; phụ: Drones/Bastion; bổ sung: Well/Singularity. Badge/nhóm/tooltip, giữ tối đa3module, không ép một ô mỗi vai trò; hai ô hỗ trợ chỉ số riêng.

## 10 ENEMY Quái thường và sát thương

**ENEMY-01** Wisps nhỏ, ít HP, bay thành đàn; Drifters là xác tàu chậm, nhiều HP; Leeches nhanh, tiếp xúc hút XP tiến độ cấp hiện tại. Leech không làm giảm level, mất module hoặc mất Stardust tinh khiết; clamp XP không âm. Hiệu ứng bám ngắn, không có constraint vật lý.

**ENEMY-02** Khoảng 25% tổng lượt sinh quái thường hướng Beacon, phần còn lại hướng tàu. Mục tiêu được chọn lúc sinh và giữ cố định; loại hướng Beacon có marker nhận diện. Chi tiết MVP: Leeches chỉ đuổi tàu; phân bổ phần hướng Beacon qua Wisps/Drifters để giữ tỷ lệ tổng xấp xỉ 25%.

**ENEMY-03** Damage tiếp xúc theo cooldown, độc lập FPS. Tàu có khoảng bảo vệ va chạm ngắn; Beacon có thể bị nhiều quái đánh theo nhịp từng quái. Các cửa sổ cooldown và damage nằm trong config, cần playtest.

**ENEMY-04 (1.3)** minuteIndex=min(floor(time/60),11). HP=baseHP×(1+hpRate×minute)×eventEnemyFactor; damage=baseDamage×(1+damageRate×minute)×eventEnemyFactor. Wisp10%/7%, Drifter14%/9%, Leech16%/10%. Recompute từ base khi phút hoặc event thay đổi, giữ HP ratio và cooldown/target, không hồi sinh dead; spawn mới cùng công thức. Chaos factor1,5 chỉ quái thường. Speed/spawn/XP/cap không thay. Boss dùng bảng phase riêng.

**EVENT-01 Lịch beta** Radiation warning207/active210–255s; chaos327/330–420s; tide462/465–510s. Warning3s riêng duration. Scheduler scheduled→warning→active→completed/cancelled, cleanup ngay khi hết clock, resolve theo time hiện tại, không replay event đã hết khi nhảy giờ. Chỉ một major warning/active, thu hồi/skip gravity thường ở mốc bị chiếm, không queue bù. Gravity cuối630s vẫn warning, active632 tới cuối. Pause/draft/Build/tab đóng băng mọi lực/tick/modifier; result/restart cleanup.

**EVENT-02 Radiation** Chốt tối đa hai vùng radius190u khi vào warning207s, dựa tuyến tàu lúc đó; giữ nguyên trong active210–255s. Chừa lõi Beacon/lối thoát, không bám tàu. Warning không gây damage. Viền/hatch/triangle và nhãn trong vùng giữ ở Low/reducedMotion. Tick1s, tàu7HP trước giáp/Corruption; timer radiation độc lập contact và vẫn tôn trọng invulnerableUntil. Vùng chồng chỉ lấy DPS radiation mạnh nhất, không cộng với Solar Scar cùng loại. Quái thường2%maxHP/tick cap10HP, không multiplier tàu; mọi boss và Beacon miễn phần trăm. Final hit qua dead guard, XP/drop/kill credit một lần.

**EVENT-03 Chaos** Quái thường đang sống/mới HP/damage×1,5, tàu outgoing×1,15 tạm thời. Recompute base×minute×event giữ ratio khi vào/ra/phút; không chia ngược/current×1,5 mỗi frame. Không tăng speed/spawn/contact rate hoặc buff boss. Hết90s gỡ đúng nguồn, HUD/Build trở về modifier còn lại.

**EVENT-04 Tide** Chốt tâm theo tuyến tàu ở warning462s, giữ fixed active465–510s. Radius440u, lực140×sin(2πelapsed/6)u/s, falloff sqrt(1−distance/radius), về0 ở mép và tâm an toàn. Tổng lực môi trường+Maw lên tàu≤78% tốc độ hiện tại; quái cap155u/s, boss nhận35% lực trước cap. Không tác động loot/Beacon/đạn. Hút/đẩy có arrow, vệt chuyển động đổi hướng liên tục, nhãn/đếm đổi nhịp và cue trước0,7s; Low/reduced giữ biên/hướng. Vị trí warning của radiation/tide giữ cách lõi44u ít nhất100u ngoài radius để không phủ Beacon; không đổi Corruption hoặc sinh hố đen từ Corruption.

**BEACON-05 Presentation local** Charge ring theo time/720, pulse0,2Hz theo simulation; pause dừng. HP loss hợp lệ mới set lastHit; flash đỏ0,12s và HUD cảnh báo, đỏ ưu tiên rồi tint trắng trả palette ảnh Core tương ứng. HP≤25% có ba tam giác và chữ Nguy cấp. Vòng đứt đoạn/dòng năng lượng vào lõi là trang trí; không tween HP/hitbox/stat/shield mới. Nền tinh vân/ngân hà/sao gộp vào một tile opaque1024², bake một lần mỗi Cao/Vừa/Thấp256/176/112chấm mờ≤1,3px; không ba lớp ảnh alpha lớn; EXP12–24u và salvage25u giữ khác hình/độ sáng. Low giảm decor, giữ hazard/telegraph/beam. Xem [design system](docs/design-system.md).

## 11 WAVE và BOSS Nhịp màn

| Simulation time | Nội dung |
|---|---|
| 0–180 giây | Chủ yếu Wisps, làm quen và lấy nâng cấp |
| 180–360 | Thêm Drifters |
| 360–540 | Thêm Leeches, tăng áp lực dần |
| 537 / 540 | Cảnh báo / boss thứ nhất từ pool; quái thường tiếp tục sinh |
| 630 | Hố đen môi trường cuối màn bắt đầu cảnh báo |
| 657 / 660 | Cảnh báo / boss thứ hai, không lặp loại và không chờ boss đầu chết |
| 720 | Xét kết quả theo RUN-02 |

**BOSS-01** Mỗi mốc540/660s có đúng một boss từ seeded pool bốn loại, không lặp nếu pool đủ; chọn một lần ở warning3s. Hai boss sống đồng thời hợp lệ. HP phase1 Elder10000/Gravemaw9800/Helion9200/Harrier9000, boss660s nhân0,8; phase2 có pool riêng65% phase1 đã scale. Transition1,25s miễn hit/contact, không xuyên overkill/thưởng; phase2 final mới tính một kill/120XP/roll gear. Không cần hạ boss để thắng720s. Mỗi instance giữ phase/readyAt/attack/aim/beam riêng; cờ tổng bossDefeated không điều khiển boss khác.

**BOSS-02** Đạn/tia boss chỉ đánh tàu; quái thường vẫn đe dọa Beacon. Final death mới tính một kill/120XP, không tiền riêng và không respawn. Tia/projectile có ownerId; chuyển phase/final death dọn đúng owned attack, không xóa XP/đạn tàu. Kết thúc lượt dọn toàn bộ. Event dùng cờ và>=, không bỏ mốc hoặc lặp thưởng.

**BOSS-03** Aim theo tàu trong windup, khóa0.25s cuối trước fire. Origin là vị trí boss hiện tại cộng local muzzle30u theo hướng; active giữ góc khóa nhưng nguồn vẫn đi cùng boss. Collider/VFX dùng cùng world geometry; trình bày nội suy origin cùng boss. Projectile chụp nguồn/hướng lúc bắn rồi bay độc lập. Recover xóa beam, không damage vô hình. Toàn bộ phase/aim/lock/fire/damage dùng simulation clock.

**BOSS-04** Spawn tìm tối đa18 vị trí cách tàu480u, cách tâm≥680u và tách boss sống; fallback quỹ đạo850u phía đối diện. Contact chờ3s, spawnGrace1,2s, skill đầu sau3s; boss sau lệch0,4s. Boss tiếp cận standoff260u, chịu kháng lực35%, không ăn scaling/percent radiation. Boss có slot riêng khỏi110 quái thường. Tổng projectile160, chừa12 cho tàu; reserve đủ pattern trước telegraph, thiếu thì hoãn. Zone toàn run≤6, mỗi owner≤2; không tạo vùng ẩn hoặc cắt đạn đã báo. Dash khóa path, swept collision tương đối, tránh lõi Beacon.

**BOSS-05** Elder giữ ring/beam; Gravemaw luân phiên Maw/ring/Maw (hút phase1, đẩy phase2 đã báo); Helion Scar/fan (hai vùng so le phase2); Harrier dash/fan (hai chặng phase2, mỗi chặng warning riêng/ngắt0,35s). Cadence khởi tạo phase1/2: Elder/Gravemaw2,8/1,9s, Helion2,5/1,7s, Harrier2,4/1,6s; phải hoàn tất attack+recovery trước skill sau, không catch-up. Warning ring/fan1s, zone1,1s, dash0,95s; lock0,25s. Phase2 ring/fan hai loạt cách0,65s, loạt sau lệch0,08rad giữ giao khe an toàn. Mọi telegraph đọc đúng pattern được admit. Chi tiết [catalog boss](docs/boss-catalog.md).

**WAVE-01** Config chứa nhịp sinh và giới hạn quái/đạn/pickup/hạt. Đạt cap thì hoãn spawn, không bỏ damage rules. Dành slot hoặc cơ chế bảo đảm boss không bị mất do cap quái thường. Gộp XP phải giữ tổng giá trị.

## 12 GRAV Trọng lực môi trường

**GRAV-01** Tối đa một trường môi trường tự nhiên đang cảnh báo/hoạt động. Gravity Well của tàu và zone thuộc boss có cap/owner riêng, không tính trong cap này. Vị trí chọn từ vài điểm ngoài vùng sáng; vùng hút không phủ Beacon, không khóa mọi đường về.

**GRAV-02** Cảnh báo 2 giây, sau đó hút nhẹ tàu/quái; không hút đạn, XP hay Beacon. Lực có cap và xử lý tâm vùng an toàn; tàu cơ bản bay thoát được. Chưa có damage riêng khi chạm tâm.

**GRAV-03** Tại giây 630 thu hồi vùng môi trường trước, cảnh báo vùng cuối ở rìa; giây 632 bắt đầu hút và giữ đến hết lượt. Không sinh vùng môi trường khác sau đó. Không thu hẹp map, hút Beacon hoặc thêm luật thua bí mật. Chu kỳ trước cuối là đề xuất config, không phải phần cần mô phỏng thiên văn.

## 13 META Tiến triển và save

**META-01** Stardust tinh khiết tách XP, biểu tượng khác. Chỉ trao sau victory/defeat hợp lệ: `floor(simulationSeconds / 60) + (victory ? 5 : 0)`. Thắng đủ 720 giây nhận 17. Trả thưởng đúng một lần; bỏ lượt không nhận.

**META-02** Mở một Echo khi thắng lần đầu, đọc lại được trong menu. Một đoạn ký ức nguyên bản phù hợp bối cảnh là đủ; chưa có vật phẩm Echo trên map.

**META-03** Beacon Core chỉ nâng HP: ba cấp giá 10, 20, 30. `maxHP = 300 * (1 + 0.1 * coreLevel)`, tương ứng 300/330/360/390. Mua ở menu, áp dụng từ lượt sau. Bán kính sáng và tốc độ sạc cố định ở MVP.

**SAVE-01** Schema saveVersion3 giữ key production eventide.save.v1; migrate1/2→3 giữ tiền/core/Echo/audio/quality/character/career và ID huy hiệu đã mở. Metrics mới mặc định0, không suy win/heal/typed kills từ Echo/tiền. Core/kills có dữ liệu thật được đánh giá lại khi load, không toast hàng loạt. Validate field/type/version/range và metrics. Lỗi storage giữ RAM/retry snapshot, không cộng delta lần nữa. Không cloud/checkpoint run; reload không resume hoặc nhận lại thưởng.

**SAVE-02** Lưu sau kết quả/mua nâng cấp/đổi settings. Có reset tiến triển với xác nhận. Debug và e2e dùng namespace riêng; không làm bẩn save người chơi.

**META-04** Career kills tăng từ death đã xác nhận, mỗi enemy một lần. Phase1 boss/despawn/recycle/restart không tăng; phase2 death tăng một. Có đúng28 thành tựu theo [catalog](docs/achievement-catalog.md); giữ stable ID năm mốc100/500/1000/2500/5000. Tất cả badge-only, không cộng tiền/stat. Tracking typed kills, best-run, survival, victory/HP ratio, evolution, damage nguồn, boss phase/final, Core, salvage, Corruption liên tục và actual light heal qua event/timer simulation. Menu/pause/Build có đường xem progress. Toast nhẹ một vùng hữu hạn, không pause. Commit delta qua ledger theo RunState; flush milestone và mỗi5s simulation/pause/pagehide/end/menu. Crash có thể mất phần chưa flush; không hứa bảo toàn mọi hit khi storage lỗi.

## 14 UX Hình ảnh âm thanh và màn hình

**UX-01** Pixel art hoặc sprite đơn giản nhất quán: nền xanh đen/tím sâu; cyan cho tàu/đạn ta; vàng cho Beacon; tím hồng cho địch. Phải phân biệt silhouette Wisps/Drifters/Leeches, tàu có hướng/động cơ và boss có silhouette Hollowborn riêng: Elder sao chết, Gravemaw hai hàm, Helion sao vỡ, Harrier thân dài. Đạn địch có viền/hình rõ, không chỉ dựa màu.

**UX-02** Có sao nền tiết chế, phế tích, phản hồi damage/pickup/level/evolution, cảnh báo Beacon và hiệu ứng Beacon hồi sinh vùng không gian khi thắng. Không dùng bloom, tối màn hoặc rung che đường né. Có giảm hiệu ứng/rung.

**UX-03** Menu gồm Chơi, Phi thuyền, Danh mục nâng cấp, Thành tựu, Hướng dẫn, Beacon Core, Echo, Cài đặt. HUD có Build hiện tại/B cùng HP hai đối tượng, charge/time, level/XP, Corruption, loadout, pause/mute và cảnh báo. Draft có icon, cấp/trước→sau/cap/reroll và Build. Pause có tiếp tục/Thành tựu/chơi lại/menu; Build vẫn qua B/HUD/draft. Kết quả có lý do/time/kill/level/thưởng và replay/menu.

**UX-04** Tiếng Việt đúng dấu, tên riêng giữ tiếng Anh kèm giải thích. Kiểm tra layout 1280×720 và 1920×1080, giữ tỷ lệ không che HUD. Màn quá nhỏ có hướng dẫn desktop; chưa làm cảm ứng.

**UX-05** Font Noto Sans/Noto Serif có glyph Việt và giấy phép được bundle local. Giảm tracking tiếng Việt, chuẩn hóa NFC tại UI, boot font có timeout/fallback. Các màn dùng chung tokens; kiểm tra1280×720/1366×768/1920×1080 và390×844, cùng emulation zoom125%/DPR2. Quality Cao/Vừa/Thấp và Giảm chuyển động chỉ đổi trình bày, lưu cùng settings; profile mới mặc định Vừa, OS motion chỉ mặc định khi chưa có profile. Save cũ giữ tiền/core/Echo/settings/Low/High, thiếu quality vẫn Cao, thiếu motion fallback từ reducedEffects. Bố cục hẹp cuộn được; cần bàn phím, chưa hỗ trợ touch-play.

**UX-08 Tài nguyên và hazard** Ví Stardust tinh khiết ở header phải sảnh (màn hẹp hàng kế), icon32px/số26px/nhãn12px desktop, số tabular định dạng vi-VN; button mở Core qua click/Enter có focus. Đọc trực tiếp SaveService, không tween số; giao dịch/nhận thưởng có feedback ngắn, Core giữ ví cạnh giá. Bỏ đúng pseudo-element cung vàng không nhãn ở tiêu đề; giữ Beacon/progress/focus thật. HUD có tối đa hai hàng boss và rail trạng thái hazard/vector lực; không phủ tâm tàu.

**UX-07 Visual identity local** Beacon ấm/vòng đứt đoạn/thủy triều cong là motif thống nhất menu/HUD/Build/Core/draft/các panel. HUD gom thời gian/charge/HP Beacon, rail thông báo tránh tâm giao tranh; toast panel/menu ở flow. World FX dùng simulation clock, menu dùng clock hình ảnh riêng clamp100ms/ẩn tab; không tick gameplay trong Balo. Tàu chỉ smooth góc/bank hữu hạn, giữ vị trí nội suy. Boss aim/lock/fire và bề rộng tia theo collider, Low không mất cảnh báo; background decoration tự giảm với hysteresis, không đổi simulation. Bản local này chưa push/deploy.

**UX-06 (VNext)** Tàu/quái/đạn có sprite riêng và atlas local; hiển thị vị trí float nội suy một bước fixed-step cùng camera, không đổi collision. Well cyan và môi trường magenta/amber có viền radius đúng world unit, streak xoắn vào tâm, warning môi trường2s, Well nổ và môi trường fade. Low vẫn giữ viền/hướng hút/đạn địch/cảnh báo quan trọng.

**AUDIO-01** Ambient điện tử pha synthwave, tăng nhịp theo áp lực, có SFX gameplay. Asset local hoặc tổng hợp nguyên bản; audio chỉ khởi động sau thao tác người dùng, mute/volume được lưu. Pause/ẩn tab xử lý audio phù hợp. Audio lỗi không làm game crash.

**ASSET-01** Manifest typed có stable ID, path/generator, loại và metadata. Ảnh chia player/beacon/enemies/weapons/environment/ui; audio chia music/sfx. Texture sinh bằng code tách renderer/gameplay, có thể thay file mà không đổi luật. Không hotlink hoặc nhúng base64 lớn. Có nguồn/giấy phép nếu dùng asset bên thứ ba.

## 15 TECH Kiến trúc và chất lượng mã

- TypeScript strict + Vite + Phaser 3; npm, lockfile và dependency tương thích. Xác minh version/Node khi cài, không khóa số phiên bản chưa kiểm tra trong tài liệu này.
- Local single-player; không backend/API key/CDN/font mạng; sau install/build không cần mạng để chơi qua local server.
- Scene điều phối, entities giữ trạng thái, systems xử lý từng luật, config giữ số, services giữ save/audio và UI tách logic.
- RunState tách SaveData. Một simulation clock; không dùng wall clock cho chiến đấu. Chọn fixed step có giới hạn bù hoặc delta tương đương có giải thích.
- Comment tiếng Việt giải thích lý do/điều kiện biên; identifier tiếng Anh. Tránh comment mọi dòng và tránh một file chứa toàn bộ game.
- Debug/test hooks chỉ dev/test, cleanup đầy đủ, giới hạn thực thể và tái sử dụng khi có ích. Không tuyên bố đo FPS hoặc pass kiểm thử khi chưa đo/chạy.
- Tạo script dev/build/preview/typecheck/test/test:e2e thực sự hoạt động, README khớp code.

## 16 Mở rộng mà không mất bản sắc

Giữ Kael-7, Seraphine, Rogue Comet; module Meteor Rain, Comet Lance, Dark Matter Shield; các recipe khác Quasar; quái Mirror Husks/Event Horizon; boss The Devourer/The Hollow King; bốn bản đồ còn lại; thêm Echo và nâng core khác trong backlog. Pulsar/Ion và28 thành tựu đã triển khai từ1.3. Không hiển thị nút chọn nhân vật/module chưa có.

Khi thêm nội dung, ưu tiên tái sử dụng registry/config. Chỉ thêm cơ chế mới nếu cần cho yêu cầu đã giao. Thay đổi luật bảo vệ Beacon, Corruption, thời lượng hay tiến hóa phải ghi lý do và cập nhật các test chịu ảnh hưởng.

## 17 Nghiệm thu và quản lý thay đổi

MVP hoàn thành khi chơi được từ menu tới kết quả và chơi lại, đủ các yêu cầu trên, không lỗi asset/console, lưu dữ liệu đúng và có bằng chứng kiểm tra. Kiểm tra ít nhất một lượt đủ 720 giây bằng chơi thật hoặc mô phỏng tự động tăng tốc, ghi đúng cách đã dùng. Kiểm tra điều khiển/hình ảnh ở tốc độ thường riêng. Xem [acceptance](docs/acceptance.md).

Một lần sửa hợp lệ cần: yêu cầu cụ thể → đối chiếu core → sửa đúng phạm vi → kiểm tra phù hợp → cập nhật config/docs/status/changelog nếu chịu ảnh hưởng. Không đánh dấu tính năng xong chỉ vì đã viết vào tài liệu. Các giá trị trong concept là mặc định thiết kế để khởi đầu, chưa phải số liệu cân bằng đã được kiểm chứng.

Tra [thuật ngữ](docs/glossary.md) để phân biệt module, hỗ trợ, mastery và nguồn gốc các hình thái tiến hóa.
