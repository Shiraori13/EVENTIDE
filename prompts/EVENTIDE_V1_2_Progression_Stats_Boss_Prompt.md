# Prompt nâng cấp EVENTIDE từ phiên bản 1.1 lên 1.2

Dùng với repo **MVP 1.1 hiện tại** và tài liệu đang được cập nhật trong repo. Không dùng để dựng lại game. Prompt này bổ sung nhân vật/thống kê, thành tựu, danh mục nâng cấp, nâng cấp chỉ số và reroll, xem build đang chơi, cân bằng quái và boss hai phase.

Các con số mới bên dưới là **giá trị khởi đầu đề xuất để triển khai và playtest**, không phải kết quả cân bằng đã kiểm chứng. Người nhận tác vụ phải đọc code 1.1 thực tế, giữ các sửa lỗi/UI/hiệu năng đã có và cập nhật tài liệu theo thay đổi thật.

---

Bạn là lập trình viên game web 2D phụ trách phiên bản **EVENTIDE 1.2**. Hãy trực tiếp sửa dự án 1.1 hiện có theo đặc tả này, hoàn thành các luồng UI, gameplay, lưu dữ liệu và kiểm thử. Không chỉ trả lời bằng kế hoạch, không tạo repo mới, không dừng sau từng scaffold để chờ tôi nhắc.

## 1. Mục tiêu và phạm vi

Người chơi thấy bản 1.1 đã khá ổn nhưng cần:

1. Menu xem thông số cơ bản của nhân vật/phi thuyền đang chọn.
2. Bảng thành tựu đạt được khi diệt quái qua các mốc; bảng tra các chỉ số nâng cấp có thể nhận.
3. Thêm nâng cấp chỉ số phi thuyền, có trần hợp lý; thẻ xuất hiện ngẫu nhiên và được reroll một lần.
4. Trong trận xem được các nâng cấp đã chọn và chỉ số hiệu lực của build.
5. Quái tạo áp lực rõ hơn; boss có phase 2 sau khi phase 1 bị hạ; skill phát từ vị trí boss và nhắm người chơi đúng cách.

Đọc trước `AGENTS.md`, `GAME_SPEC.md`, README, package/lockfile, các tài liệu kiến trúc, balance, status, asset và performance hiện hành. Kiểm tra code rồi mới sửa. Không dùng bộ tài liệu baseline cũ để ghi đè đặc tả 1.1.

Không thêm nhân vật chơi mới, map mới, hệ trang bị lớn, crafting hoặc online trong phiên bản này. Nhân vật nào chưa triển khai chỉ ghi backlog hoặc khóa rõ ràng, không bịa stats hay làm nút chọn giả.

Giữ thành quả 1.1: font Việt, UI, gravity VFX, frame pacing, pooling, gộp EXP và cleanup. Không tăng độ khó bằng việc sinh quái/particle vô hạn, giảm FPS hoặc che hình.

## 2. Các quyết định làm rõ cho bản 1.2

Để tránh mỗi phần code hiểu khác nhau, dùng mặc định sau và ghi vào quyết định thiết kế:

- **Thành tựu:** theo tổng quái đã tiêu diệt của hồ sơ người chơi, có lưu lâu dài. Mỗi quái được ghi nhận một lần. Thành tựu chỉ trao huy hiệu/thông báo, chưa cộng chỉ số hoặc tiền để tránh thêm một nguồn tăng sức mạnh khó cân bằng.
- **Reroll:** một lần cho **mỗi lượt chọn nâng cấp khi lên cấp**, không phải một lần mỗi lần mở modal. Nhiều level liên tiếp có nhiều lượt draft riêng, mỗi draft có ngân sách riêng.
- **Ô nâng cấp:** giữ ba ô module và hai ô hỗ trợ của thiết kế hiện tại. Mở rộng pool chỉ số để người chơi chọn tối đa hai loại hỗ trợ trong một lượt; không tự thêm sáu ô trang bị. Loại đã chọn có thể nâng tiếp đến trần.
- **Giới hạn chỉ số:** +50% là trần tối đa cho các hỗ trợ phù hợp; tốc độ di chuyển và giảm damage có trần thấp hơn. Trần theo từng nguồn hỗ trợ, không phải xóa tác dụng tiến hóa module, nội tại nhân vật hoặc Corruption.
- **Boss:** HP phase 1 về 0 dẫn tới chuyển phase, chưa tính chết và chưa trao thưởng. Boss chỉ chết thật sau phase 2, đúng một lần. Vẫn giữ điều kiện thắng của màn theo Beacon; không tự bắt buộc giết cả hai phase để thắng.
- **Chỉ số trong menu và trận:** cùng đọc từ hệ tính chỉ số trung tâm; không tính riêng bằng công thức khác trong UI.

Đây là các mặc định của tác vụ 1.2. Nếu code hiện hành có giới hạn tương đương nhưng tên khác, tích hợp với code thật, không tạo hai hệ song song. Nếu có mâu thuẫn nghiêm trọng với yêu cầu mới nhất trong repo, nêu rõ khác biệt thay vì tự xóa behavior đã có.

## 3. Menu thông số nhân vật đang chọn

Thêm mục **Phi thuyền** hoặc **Thông số** ở menu. Hiển thị đúng nhân vật hiện đang được chọn, ngay cả khi hiện tại chỉ có Nova.

Nội dung:

- Tên, ảnh/icon, mô tả ngắn, module khởi đầu và đặc tính đã thực sự có.
- Bảng chỉ số cơ bản: HP tối đa, hệ số damage chung, tốc độ tấn công, tốc độ di chuyển, bán kính nhặt và giảm sát thương nếu nhân vật/hệ hiện tại hỗ trợ.
- Đơn vị rõ: HP, phần trăm, world unit/giây hoặc đơn vị hiển thị thống nhất. Không hiển thị “damage 12” như đại diện cho mọi module nếu chúng có base damage khác nhau.
- Nếu cần cho dễ đọc, damage chung hiển thị “100% cơ bản”, còn damage/cooldown cụ thể nằm trong chi tiết module.
- Các buff lâu dài thực sự áp dụng lên tàu được tách thành cột/tooltip. Beacon Core tăng HP Beacon không được cộng vào HP Nova.
- Chưa vào trận thì không hiển thị nâng cấp tạm thời của lượt trước. Không giữ build cũ sau Chơi lại.
- Khi đổi nhân vật hợp lệ, panel cập nhật theo nhân vật đó; không hardcode Nova trong view.
- Nút mở **Danh mục nâng cấp** để tra thông tin ở mục 4.

Panel không cần nâng cấp/mua nhân vật. Giữ màu và typography 1.1, tiếng Việt đủ dấu, keyboard/focus hoạt động và không thêm font tải mạng.

## 4. Danh mục các nâng cấp có thể nhận

Tạo màn/panel **Danh mục nâng cấp** đọc cùng registry/config với hệ draft.

Chia ít nhất hai nhóm:

1. **Module:** các module đã triển khai, cấp tối đa, mô tả và các mốc tiến hóa.
2. **Hỗ trợ chỉ số:** bảng hỗ trợ trong mục 5, mỗi cấp tăng bao nhiêu, trần và cách áp dụng.

Mỗi mục có icon, tên, loại, tác dụng, cấp tối đa, giá trị các cấp và ghi chú quan trọng. Giữ Plasma → Mini Sun → Supernova và các mô tả 1.1 đúng với code thực tế. Không đưa module tương lai thành thẻ có thể nhận.

Khi mở từ trong trận, hiển thị thêm “đã sở hữu/chưa sở hữu/đã đạt trần/không còn ô” nếu phù hợp; không sửa build từ màn tra cứu. Đây là tài liệu đọc, không phải shop hoặc cơ chế chọn miễn phí.

Dùng data-driven view: sửa registry thì catalog, tooltip draft và build panel cùng cập nhật. Không copy ba bảng thông số tĩnh dễ lệch nhau.

## 5. Nâng cấp chỉ số phi thuyền

### 5.1 Pool hỗ trợ đề xuất

Dùng sáu loại dưới đây, tối đa chọn hai loại trong một run. Có thể tái sử dụng ID HP/pickup hiện hành; không tạo bản sao cùng tác dụng với ID mới.

| Hỗ trợ | Mỗi cấp đề xuất | Số cấp | Tổng tối đa |
|---|---|---|---|
| Lõi hỏa lực | +10% damage chung của tàu | 5 | +50% |
| Bộ tăng nhịp | +10% tốc độ tấn công | 5 | +50% tốc độ, không phải −50% cooldown |
| Gia cố thân tàu | +10% HP tối đa từ base | 5 | +50% |
| Động cơ hiệu chỉnh | +5% tốc độ di chuyển từ base | 5 | +25% |
| Bộ thu bụi sao | +10% bán kính nhặt từ base | 5 | +50% |
| Giáp phân tán | Giảm thêm 4 điểm phần trăm damage tàu nhận | 5 | Giảm 20% damage |

Các giá trị này là khởi điểm cân bằng. Có thể hạ trần/cấp dựa trên playtest có ghi lý do, nhưng không tự tăng vượt +50% hoặc làm vô địch. Tốc độ bay và giảm damage dùng trần thấp hơn là chủ đích.

Không thêm crit, lifesteal, hồi HP ngoài Beacon, né damage ngẫu nhiên hoặc cooldown reduction thứ hai trong lần này. Tránh phát sinh nhiều công thức combat cần cân bằng lại.

Nếu hai hỗ trợ cũ ở 1.1 có số cấp khác, v1.2 thay bảng cấp mới có chủ đích và cập nhật đặc tả/tooltip/test. Lượt mới vẫn bắt đầu level hỗ trợ bằng 0; không sửa ngược save lâu dài hoặc invent bù phần thưởng. Nếu repo đã lưu run dang dở, cần migration cụ thể cho run cũ thay vì clamp âm thầm làm mất giá trị.

### 5.2 Công thức và nguồn chỉ số

Tách base, bonus từ hỗ trợ, modifier tạm thời và module-specific stats. Đọc lại hệ có sẵn rồi chọn cách tích hợp nhẹ nhất.

```text
supportBonus = clamp(sum(incrementsOfThisSupport), 0, supportCap)

maxHP = baseMaxHP × (1 + hpSupportBonus)
moveSpeed = baseMoveSpeed × (1 + moveSupportBonus)
pickupRadius = basePickupRadius × (1 + pickupSupportBonus)

attackRateMultiplier = 1 + attackSpeedSupportBonus
attackInterval = moduleBaseIntervalAtCurrentLevel / attackRateMultiplier

outgoingDamage = moduleDamageAtCurrentLevel
                 × (1 + damageSupportBonus)
                 × corruptionOutgoingMultiplier

incomingDamageToShip = sourceDamage
                       × (1 - damageReductionSupport)
                       × corruptionIncomingMultiplier
```

- Bonus từng cấp cộng trên base, không lấy chỉ số đã buff nhân tiếp mỗi lần. Năm cấp +10% phải bằng +50%, không phải 1,1^5.
- Tăng 50% attack speed tương đương interval /1,5, không phải interval ×0,5. Không cho cả hai chỉ số tăng rate và giảm cooldown áp trùng.
- Damage module, số drone, tiến hóa và Corruption vẫn hoạt động như nguồn riêng. Trần hỗ trợ +50% không phải cap tổng damage của cả build.
- Lõi hỏa lực áp đúng một lần cho Plasma, drone, Gravity Well. Đạn tồn tại trước nâng cấp dùng quy tắc damage nhất quán đã được hệ combat chọn; nêu rõ nếu tính tại hit hoặc snapshot lúc spawn, tránh nửa hệ một cách.
- Bộ tăng nhịp tác động nhịp tấn công thực: cooldown bắn Plasma/chu kỳ kích hoạt Well và cooldown damage của drone hoặc cách tương đương được ghi rõ. Không giảm thời gian telegraph quan trọng hoặc multiplier hai lần lên cùng đòn.
- Các giá trị min interval/safety cap nằm trong config và không làm tooltip hứa tác dụng không được thực thi.
- Giáp chỉ giảm damage vào tàu, không làm Beacon giảm damage. Không áp vào XP bị Leech hút. Cho phép damage dạng số thực trong simulation nếu hợp lý; chỉ làm tròn hiển thị, không round một hit nhỏ về 0 tạo bất tử.
- Khi tăng maxHP, tăng currentHP đúng phần maxHP được cộng thêm và clamp; không hồi đầy tùy tiện. Ví dụ 60/100 lên base +10% thành 70/110 nếu chưa có nguồn khác.
- Với nhiều nguồn base/permanent trong repo thật, giải thích thứ tự và test. Không đổi ID character/save chỉ để tiện tính.

### 5.3 Kiểm tra sức mạnh tổng hợp

+50% damage và +50% attack speed có thể tạo khoảng ×2,25 DPS trước các nguồn khác. Không suy rằng mỗi cap 50% tự động bảo đảm cân bằng. Hai ô hỗ trợ tạo lựa chọn build; kiểm tra cả damage+rate, HP+giáp và speed+pickup.

Ghi rõ buff hỗ trợ reset khi bắt đầu run mới, còn thông số nhân vật/permanent thật giữ đúng. Không tạo nâng cấp vĩnh viễn cho các hỗ trợ này ở menu.

## 6. Draft ngẫu nhiên và reroll một lần

Mở rộng logic nâng cấp đang có; không thay bằng một hệ song song.

- Mỗi level-up tạo `draftId` hoặc nhận diện tương đương, tập thẻ hợp lệ, seed/RNG và `rerollsRemaining = 1`.
- Mỗi draft có tối đa ba thẻ khác ID. Lọc trước: cap level, weapon/support slot, đã sở hữu hoặc có thể nhận mới, các điều kiện hợp lệ thực tế.
- Giữ 3 ô module, 2 ô hỗ trợ. Hết hai ô hỗ trợ thì chỉ nâng hai loại đã chọn; các loại chưa chọn không tiếp tục lọt vào draft.
- Nếu cả nhóm module và hỗ trợ còn ứng viên, ưu tiên có đại diện hai nhóm trong draft khi khả thi. Không bắt buộc sinh thẻ giả để đủ nhóm.
- Thẻ chỉ số hiển thị tên/icon, level hiện tại→level sau, tăng bao nhiêu, giá trị trước→sau và cap. Ví dụ “HP tối đa 110 → 120; hỗ trợ +20%/50%”.
- Chọn thẻ cập nhật source of truth trước rồi HUD/build đọc lại; không chỉ đổi text.
- Reroll miễn phí một lần trong draft. UI ghi “Đổi lựa chọn 1/1” rồi “0/1”, có giải thích ngắn và disabled state.
- Reroll đổi bộ lựa chọn, không cấp level, không đổi stats, không nhận heal hoặc dùng một lượt level-up khác.
- Ưu tiên các thẻ hợp lệ chưa hiện trong draft cũ. Nếu đủ ứng viên khác, thay toàn bộ; nếu ít hơn, đổi nhiều nhất có thể rồi điền hợp lệ không trùng trong bộ mới. Đừng cam kết ba thẻ đều khác khi pool không cho phép.
- Nếu không có bất kỳ bộ nào tạo thay đổi có ý nghĩa, disable reroll và giải thích, không trừ lượt vô ích. Pool chỉ có một thẻ hợp lệ vẫn chọn được.
- Đóng/mở panel, ẩn tab, pause hoặc xem build không làm mới ngân sách reroll. Một draft không được reroll hai lần do double click/keypress race.
- Nếu XP đủ lên nhiều level: từng draft mới có một reroll, không reuse nhầm draftId hoặc cho bấm chọn hai lần vào cùng draft.
- Khi pool hết lựa chọn, giữ fallback heal hợp lệ như luật game, không có thẻ rỗng hoặc vòng reroll vô hạn.
- Toàn bộ thời gian, damage, pickup và boss vẫn đóng băng khi lựa chọn/reroll; animation UI không được làm clock tiến lên.

## 7. Xem build và chỉ số trong trận

Thêm nút **Build hiện tại** ở HUD và phím **B** mở/đóng panel. B không được xung đột với phím điều khiển khác; nếu repo đã dùng B, chọn phím tương đương và ghi UI.

Nội dung panel:

- Nhân vật hiện tại, level, current/maxHP.
- Ba ô module: icon, tên, level, hình thái tiến hóa, mô tả tác dụng và damage/rate có ý nghĩa theo từng module.
- Hai ô hỗ trợ: tên, level, bonus hiện tại, cap; ô chưa chọn hiển thị rõ.
- Bảng chỉ số tổng: base, bonus hỗ trợ, modifier tạm thời và effective value. Corruption đang active phải hiển thị riêng, không nhầm là buff vĩnh viễn.
- Tổng số lựa chọn đã pick hoặc lịch sử chọn gọn nếu có thể thêm nhẹ; tối thiểu phải xem đầy đủ module/hỗ trợ và level đã chọn hiện tại. Không tính reroll như một nâng cấp đã pick.
- Có đường xem danh mục nâng cấp để biết còn có thể nhận gì; danh mục không cho thay build miễn phí.

### Tương tác với pause/modal

- Mở B khi playing thì pause simulation, đóng quay về đúng trạng thái trước, không auto resume khi vẫn có lý do pause khác.
- Khi đang chọn nâng cấp, có thể xem build qua tab/section trong modal hoặc nested read-only panel; đóng xong quay lại đúng draft với ngân sách reroll còn nguyên.
- Esc đóng panel trên cùng, không bỏ draft, không nhận thẻ, không bỏ pause do ẩn tab. Focus trở về nút hợp lý, không click xuyên.
- Panel đọc snapshot/selector của session thật, không giữ reference state cũ sau restart.
- Không dựng DOM hoặc tính lại mọi tooltip mỗi frame. Khi panel mở, game đã pause; dùng cập nhật theo sự kiện/state thay vì scan liên tục.

## 8. Thành tựu diệt quái

### 8.1 Mốc và hiển thị

Mốc cộng dồn đề xuất: **100, 500, 1.000, 2.500 và 5.000 quái**. Đây là config có thể chỉnh; tên/huy hiệu nguyên bản phù hợp EVENTIDE, không cần nhiều hình tốn tải.

Mỗi achievement có stable ID, tên, icon, mô tả, target, progress và unlocked flag/time nếu dự án dùng. Thời gian hiển thị ngày có thể dùng wall clock ở profile, không dùng để quyết định combat.

- Menu **Thành tựu**: tổng kill, từng mốc, progress bar và trạng thái đã đạt/chưa đạt, khóa hiển thị lịch sự.
- Trong trận có thể truy cập bảng từ pause/build; không phủ cả màn bằng toast.
- Qua mốc: toast ngắn một lần và lưu trạng thái, không tự pause hoặc trao stat bonus.
- Một kill có thể hoàn tất nhiều mốc nếu nhập/migrate một tổng hợp lệ; mỗi mốc chỉ mở một lần.
- Không thêm tiền hoặc bonus damage tự động. Nếu repo có reward framework, dùng reward type badge-only cho các mốc mới.

### 8.2 Ghi nhận đúng

- Cộng kill từ sự kiện enemy death đã xác nhận, không từ mỗi lần hit, destroy sprite, recycle pool, despawn do cap hoặc restart.
- Một enemy chỉ ghi nhận một lần dù nhận nhiều damage cùng tick, bị nổ lan và projectile cùng trúng.
- Boss phase 1 hết HP không tính kill/loot/achievement. Chỉ final death sau phase 2 tính một boss kill và một phần thưởng.
- Tổng career kills tăng theo kill thật trong bộ nhớ; lưu snapshot có giới hạn tần suất khi cần, flush ở milestone và các điểm lifecycle rõ (pause/end/về menu).
- Không ghi localStorage mỗi frame hoặc mỗi projectile hit. Nếu autosave định kỳ, dùng cơ chế đã có và budget nhỏ; không thêm save timer làm gameplay khựng.
- Chọn một mô hình cộng tiến độ: cập nhật tăng dần hoặc commit delta có sổ theo run. Không cộng tổng kill trong trận lần nữa ở result nếu đã ghi dần.
- Save snapshot phải giữ career total và state mốc nhất quán. Khi ghi thất bại, giữ dữ liệu trong bộ nhớ để thử lại hợp lý, không nhân đôi do retry.
- Reload có thể mất đoạn kill chưa flush nếu dùng autosave thưa; ghi rõ chính sách. Không hứa bảo toàn mọi kill khi crash nếu chưa có cơ chế đó.
- Nếu 1.1 không có tổng career lưu sẵn, bắt đầu theo dõi từ 1.2 hoặc import dữ liệu hợp lệ có thật; không suy tổng kill cũ từ tiền/giờ chơi và bịa tiến độ.

## 9. Làm quái tạo áp lực thực sự

Trước khi tăng số, kiểm tra quái yếu do config, AI, collision, cooldown hoặc bug damage. Ví dụ damage bị nhân lặp, enemy nhận hit liên tục theo frame, quái kẹt ngoài map hoặc không đánh đúng target không được “sửa” bằng tăng HP hàng chục lần.

### 9.1 Dữ liệu cần lấy từ 1.1

- HP, damage/contact cooldown, tốc độ, spawn rate/cap, XP của từng loại theo wave.
- Time-to-kill khi chỉ có module đầu, build giữa màn và build khá mạnh cuối màn.
- Thời điểm người chơi nhận damage, Beacon mất HP, số quái đồng thời và số nâng cấp đã nhận.
- Khác biệt khi đứng gần Beacon và khi săn ở rìa.

### 9.2 Hướng cân bằng

- **Wisps:** áp lực bằng nhóm/đường tiếp cận, vẫn là quái cơ bản dễ hiểu; không biến tất cả thành tank.
- **Drifters:** chịu đòn tốt hơn, chậm rõ, buộc ưu tiên khi tiến Beacon; silhouette và marker không mất.
- **Leeches:** gây áp lực bằng tốc độ/tiếp cận, không instant teleport hoặc hút XP cả ngoài tầm.
- Tăng theo giai đoạn simulation time, đường cong mượt hoặc các mốc có cảnh báo; không tăng HP mọi quái mỗi frame.
- Quái đã spawn có stat snapshot hoặc quy tắc scale rõ; tránh đang đánh nửa máu thì tự hồi/đổi HP không báo.
- Có thể tăng HP/damage/tốc độ có giới hạn và điều chỉnh lịch spawn, thay vì chỉ nhồi thêm hàng nghìn quái. So với cap/perf budget hiện có.
- Giữ khoảng 25% tổng quái thường hướng Beacon hoặc điều chỉnh nhỏ có chủ đích, ghi lý do và test. Không chuyển toàn bộ bầy đánh Beacon khiến chuyến đi nhặt XP bất khả thi.
- Nếu thêm pattern spawn như nhóm xuất hiện từ hai hướng, dùng lịch đơn giản và khoảng an toàn; không thêm pathfinding nặng hoặc status mới ngoài phạm vi.
- Spawn không chồng tàu; telegraph/damage grace còn đúng. Tăng khó phải cho người chơi hiểu mình sai ở đâu và có đường né.

### 9.3 Mục tiêu trải nghiệm

- Đầu màn cho học, lấy XP và lựa chọn, nhưng đứng yên không phải cách thắng ổn định.
- Giữa màn cần chọn ưu tiên tàu/Beacon và tận dụng module, không chỉ chạy một vòng không có nguy cơ.
- Cuối màn khó hơn sau khi tính cả hỗ trợ mới, nhưng build cơ bản hợp lý vẫn có cơ hội thắng không cần perfect RNG.
- Kiểm tra build tấn công damage+rate, phòng thủ HP+giáp và cơ động speed+pickup. Không chỉ cân bằng theo build mạnh nhất.
- Không dùng quái quá nhiều HP khiến thời gian đánh dài mà không thêm quyết định; dùng TTK đo được để phân biệt khó và tốn thời gian.

Mọi số mới đặt trong config và ghi trước/sau. Không khẳng định “đã cân bằng” chỉ vì tăng đồng loạt HP/damage 2 lần.

## 10. Boss hai phase

### 10.1 State machine

Dùng các trạng thái rõ hoặc tương đương:

```text
spawn → phase1 → transitionToPhase2 → phase2 → finalDeath
```

Mỗi transition chỉ thực hiện một lần.

- Khi phase1 HP về 0, chặn finalDeath, không kill credit/XP/reward, không destroy boss để tạo một boss khác không liên quan.
- Chuyển phase có hiệu ứng ngắn khoảng 1–1,5 giây, text **Giai đoạn 2**, đổi hình/màu/nhịp có thể nhận ra.
- Trong transition không gây contact damage mới hoặc bắn đòn chưa báo, miễn damage cho boss có chủ đích; không cho dồn overkill từ hit phase1 xuyên sang phase2.
- Thu hồi projectile/beam nguy hiểm đang active của phase1 hoặc có chính sách cleanup rõ để người chơi không bị đánh bất ngờ dưới hiệu ứng chuyển phase.
- HP phase2 có thanh/cap riêng. Đề xuất khởi đầu: khoảng 60–70% HP phase1; tổng encounter dài hơn, không yêu cầu heal đủ một thanh phase1 nữa nếu làm boss quá dai.
- Phase2 tăng vừa phải tốc độ di chuyển/nhịp pattern và có pattern nâng cấp nhìn thấy được. Gợi ý bắt đầu +15–20% tốc độ và khoảng +15–20% attack rate, damage chỉ tăng nhẹ nếu cần; các số cần thử, không cộng dồn mỗi tick.
- Sau khi phase2 HP về 0: finalDeath, trả XP/reward đúng một lần, ghi một boss kill, cleanup mọi owned attack/VFX/timer.
- Cờ phase, HP, timer, attack owner và state reset đúng khi chơi lại.

### 10.2 Phase2 khó hơn theo hành vi

Giữ vòng đạn và tia nhưng làm nhịp/pattern có chủ đích:

- Vòng đạn thưa ở phase1; phase2 có thể thành hai nhịp lệch góc hoặc một fan hướng người chơi, vẫn có khe né.
- Tia có windup dễ nhìn; phase2 ngắm nhanh hơn hoặc combo với đợt đạn trước/sau, nhưng không đè hai vùng không thể né cùng lúc.
- Giữa đợt có khoảng hồi ngắn cho người chơi đổi vị trí. Không tăng số bullet vô hạn hoặc rút telegraph thành gần 0.
- Không thêm status/hút/teleport liên hoàn nếu không cần; một thay đổi pattern tốt hơn nhiều hiệu ứng nặng.
- Không tăng hitbox boss hoặc contact damage ngoài hình hiển thị chỉ để gây khó.

### 10.3 Thời lượng và kết thúc

Boss xuất hiện theo lịch hiện hành, baseline giây540. Một encounter hai phase với build giữa/cuối hợp lý nên có thời gian tiêu diệt mục tiêu ban đầu khoảng 60–110 giây, cần đo và chỉnh chứ không hardcode chết theo timer.

Màn vẫn dài720giây. Khi đủ sạc và tàu/Beacon còn sống, vẫn thắng dù boss còn ở phase1/phase2/transition. Không tự dừng charge để buộc đánh hết boss, không cộng thêm phút hoặc boss hồi sinh vô hạn. Nếu cùng tick chết tàu và hạ boss, điều kiện thua vẫn theo spec.

## 11. Skill boss bám vị trí boss và ngắm người chơi

Sửa đúng transform/targeting, không chỉ thêm animation.

### 11.1 Tách bốn dữ liệu

- **Nguồn phát:** vị trí boss hiện tại và local offset của miệng súng/lõi.
- **Mục tiêu:** vị trí tàu hiện tại hoặc snapshot ở thời điểm được định nghĩa.
- **Hướng tấn công:** góc được cập nhật/khóa theo state.
- **Hit area:** tính từ đúng nguồn/hướng/phạm vi cho damage, đồng nhất với hình.

Không giữ một tọa độ spawn cũ làm nguồn cho mọi skill sau khi boss đã di chuyển. Nếu dùng container/parent transforms, không cộng world offset hai lần hoặc nhầm camera-space với world-space.

### 11.2 Beam lifecycle

- **Aim/Windup:** điểm phát đi cùng boss, telegraph hướng về tàu và có giới hạn tốc độ xoay nếu cần. Người chơi thấy boss đang ngắm mình.
- **Lock:** chốt hướng trước khi bắn, gợi ý khoảng 0,2–0,3 giây cuối windup; hiển thị rõ đã khóa. Nếu boss vẫn di chuyển thì origin vẫn đi cùng boss.
- **Fire:** tia phát từ boss hiện tại theo hướng đã khóa trong một khoảng ngắn. Không aimbot xoay tức thì bám tàu suốt lúc active. Điểm gốc VFX và damage collider/raycast phải cùng cập nhật từ boss; hướng khóa vẫn giữ đúng.
- **Recover:** dọn collider/ray damage/VFX và chờ nhịp tiếp; không để beam vô hình còn damage.

Nếu boss được thiết kế đứng lại khi bắn, phải hiện hành vi đó có chủ đích; không dùng việc đóng băng boss để che lỗi nguồn phát. Mọi tâm/hướng warning cần tương ứng hit area thực lúc active.

### 11.3 Projectile và vùng diện tích

- Đạn sinh tại vị trí boss hiện tại, nhắm tàu theo snapshot khi bắn, hoặc pattern có góc định nghĩa rõ.
- Đạn đã bắn bay độc lập trong world; không parent toàn bộ bullet vào boss khiến đạn kéo theo boss. “Skill theo boss” không có nghĩa mọi viên đạn đổi hướng vô hạn.
- Nếu có vùng AoE gắn thân boss, tâm warning/active đi theo boss theo thiết kế. AoE đặt xuống mặt đất phải là snapshot world có thông báo phù hợp; không trộn hai loại.
- Khi pause, mọi pha attack/damage cùng dừng; khi phase chuyển hoặc boss finalDeath, cleanup tất cả attack owned bởi boss.
- Telegraph không bị khuất sau sprite boss/HUD và không lệch khi camera zoom/di chuyển.

## 12. Data và code để dễ mở rộng

Tận dụng registry và systems hiện tại. Chỉ bổ sung thành phần tương đương khi cần:

- Stat definitions: ID, display name, unit, base source, increments, maxLevel/cap, category.
- Một stat calculator/selector dùng chung cho combat, menu, catalog và build.
- Upgrade definitions tham chiếu stat ID hoặc module ID; tách data và apply behavior.
- Draft state chứa draftId, offeredIds và rerollUsed, có single action guard.
- Achievements config và service theo dõi death event/profile progress.
- Boss state machine và attack behaviors với ownership/origin/target rõ.

Không lưu effective stats như một bản sao bền vững rồi tiếp tục cộng vào nó sau reload. Lưu nguồn cần thiết và tính lại derived stats. Cache theo phiên bản state nếu cần, không recompute toàn bộ mỗi frame.

Ưu tiên stable ID hiện tại. Version save theo schema thật; bổ sung fields achievement/career kill mà không mất Stardust tinh khiết, Beacon Core, Echo, audio/quality settings. Dữ liệu lỗi có fallback, dữ liệu cũ có default/migration rõ.

Không thêm dependency/framework mới chỉ để làm bảng thành tựu hoặc stat panel. Không biến các hỗ trợ thành một hệ inventory phức tạp.

## 13. UI UX và hiệu năng cần giữ

- UI tiếng Việt chuẩn dấu, icons/cấp/cap dễ hiểu; reuse tokens/font/asset conventions từ1.1.
- Panels có scroll vùng nội dung khi cần, nút đóng luôn tới được, không chồng modal gây mất focus. Kiểm tra1280×720,1366×768,1920×1080.
- Menu Phi thuyền, Thành tựu, Danh mục và build trong trận có đường quay về rõ, không nút rỗng.
- Khi achievement mở, một toast nhẹ có giới hạn queue; không một emitter/tween/listener mới cho mọi kill.
- Menu/counters cập nhật theo event, không ghi save hoặc dựng lại DOM mỗi frame.
- Tốc độ tấn công cao tạo thêm đạn/Well phải nằm trong cap/pooling; không âm thầm bỏ damage hoặc ngăn vũ khí bắn bằng một cap quá thấp so với tooltip.
- Profile tình huống hai phase + nhiều đạn + gravity môi trường + build damage/rate. Tăng khó không được làm mất độ mượt1.1.
- Giữ merge EXP và invariant bảo toàn EXP; catalog/reroll/phase2 không tạo drop trùng hoặc xóa XP.
- Settings quality chỉ đổi presentation, không đổi độ khó, hitbox, attack pattern hay tiến độ thành tựu.

## 14. Comment và tài liệu

Identifier tiếng Anh, comment/tài liệu tiếng Việt. Comment rõ tại:

- Base/additive bonus/temporary modifier và cap; quy đổi rate sang cooldown.
- Hiện thực hai support slots và lọc pool.
- DraftId, ngân sách reroll, guard double-click và queue nhiều level.
- Pause stack khi xem build từ draft.
- Enemy death đúng một lần, cộng career kills, save retry và achievement unlock.
- Phase1 HP0 khác finalDeath, chặn overkill/reward và cleanup.
- Local/world transform của nguồn beam, aim/lock/fire và đồng bộ collider/VFX.

Cập nhật theo code thật:

- GAME_SPEC: quy tắc v1.2, những phần thay thế luật cũ như cap/cấp hỗ trợ, reroll, achievement và boss hai phase.
- balance: bảng stat levels, công thức, enemy stats trước/sau, boss HP/cooldown/TTK, cap.
- architecture: stat pipeline, draft, achievement và boss ownership.
- asset guide: icon hỗ trợ/huy hiệu/phase2 mới, path/generator/source thật.
- status/acceptance/changelog: tính năng1.2 và kết quả kiểm tra thật.
- Thêm báo cáo cân bằng1.2 nếu cần; nêu build/seed/thời điểm và tình huống chưa kiểm tra.

Giao diện có thể ghi phiên bản1.2 khi nội dung thực sự hoàn thành; không chỉ đổi version label để coi nâng cấp xong. Không chạy lại prompt tạo MVP hoặc xóa các tài liệu1.1.

## 15. Kiểm thử bắt buộc

Dùng các công cụ sẵn trong dự án; bổ sung test có ý nghĩa, chạy typecheck/unit/build/e2e phù hợp. Không báo pass khi chưa chạy.

### Stat và draft

1. Năm cấp10% bằng50%, không phải lãi kép; HP/move/pickup/giáp đúng cap riêng.
2. +50% rate cho interval/1,5; không áp rate hai lần; module/Corruption không bị clamp nhầm vào trần hỗ trợ.
3. HP hiện tại tăng đúng phần maxHP cộng thêm; giáp chỉ tác động tàu, không Beacon/XP drain.
4. Combat, menu và build/catalog trả cùng giá trị từ cùng nguồn; giá trị khi pause không khác lúc chơi.
5. Ba module/hai supports không vượt slot; support full chỉ có loại đã chọn; thẻ đạt trần bị loại.
6. Mỗi draft tối đa ba ID, ít pool/rỗng xử lý được, RNG có seed để tái hiện.
7. Reroll một lần, không apply nâng cấp, ưu tiên đổi thẻ; double click không reroll lần2. Đóng/mở/ẩn tab không reset; level mới mới có lượt mới.
8. Multi-level XP giữ đúng số draft và XP dư; heal fallback không nhân đôi.

### UI/profile

9. Panel Phi thuyền theo character đang chọn, không áp Beacon Core vào HP tàu; không hiện build cũ ở menu.
10. B mở build và pause; đóng từ level modal quay lại đúng draft/reroll count; Esc không bỏ chọn hoặc bypass pause tab.
11. Mốc kill mở đúng một lần; cùng tick nhiều damage lên một enemy không cộng nhiều kill.
12. Phase1 boss không kill/XP; finalDeath đúng một kill/loot; despawn/restart không tính kill.
13. Save cũ migrate giữ tiền/core/Echo/settings; achievement reload còn đúng; retry save/result không nhân đôi tổng kill.
14. Catalog phản ánh config thật, không cho mua/pick ngoài draft; viewports/focus/font Việt đúng.

### Quái/boss

15. HP scaling/cooldown không nhân lặp theo frame, spawn và damage target đúng, không quái kẹt làm giảm áp lực giả.
16. Phase1→transition→phase2→finalDeath mỗi bước một lần, overkill không xuyên, pause đóng băng và restart reset.
17. Boss đang di chuyển vẫn phát beam/projectile tại đúng vị trí; aim cập nhật mục tiêu lúc windup, khóa trướcfire, active không aimbot.
18. Collider beam khớp hình khi boss/camera di chuyển; hết tia/phase/end không còn damage ẩn.
19. Giây720 còn sống vẫn thắng dù boss phase2 chưa chết; chết cùng tick vẫn xét thua đúng.
20. Cảnh đông với build tốc độ cao không leak pool/listener/projectile; EXP không bị mất hoặc drop trùng.

## 16. Playtest cân bằng và báo cáo trước sau

Không thể xác nhận cân bằng chỉ bằng unit test. Thử tối thiểu các profile build bằng seed/kịch bản tái hiện:

- Đầu run chỉ có module khởi đầu và chưa có hỗ trợ.
- Giữa run với build nâng cấp tự nhiên, không cho max mọi thứ bằng debug.
- Cuối run với damage+rate, HP+giáp và speed+pickup trong hai ô hỗ trợ; giữ module phù hợp để so sánh.
- Đứng gần Beacon so với thường xuyên rời vùng sáng.
- Boss phase1 và phase2, thời gian đánh, khoảng né và điều kiện thắng theo charge.

Ghi thông số v1.1 và v1.2, build/level/seed, enemy TTK đại diện, thời điểm áp lực bắt đầu, thời gian đánh boss hai phase, HP tàu/Beacon cuối scenario và frame-time nếu đo được. Ghi rõ chơi tay, tự động hay giả lập thời gian.

Mục tiêu là khó hơn có lý do và có thể học cách đối phó. Nếu chỉ tăng thời gian bắn vào một mục tiêu đứng yên, hoặc chỉ build damage+rate thắng được vì các build khác vô dụng, tiếp tục điều chỉnh trong config. Không bịa tỷ lệ thắng từ một vài lần thử.

Một lượt đủ720giây ở tốc độ thường là bằng chứng hữu ích cho trải nghiệm; test tăng tốc chỉ chứng minh logic dài hạn. Nếu môi trường không cho chơi đầy đủ hoặc đo hiệu năng, báo chính xác phần còn chưa kiểm chứng.

## 17. Thứ tự làm và bàn giao

1. Audit repo1.1 và dữ liệu cân bằng/save; kiểm tra có bug gây quái yếu hay không.
2. Tạo thống nhất stat definitions/calculation, catalog, support pool và reroll.
3. Tạo menu stats, build panel và tương tác pause/modal.
4. Tạo career kills/achievement và migration/profile persistence.
5. Sửa quái theo dữ liệu, boss state machine hai phase và targeting/transform.
6. Kiểm thử hồi quy, playtest, kiểm tra hiệu năng, cập nhật docs.

Có thể điều chỉnh thứ tự cục bộ để phù hợp code nhưng hoàn thành toàn bộ phạm vi. Không dừng ở data config hoặc bảng UI trong khi gameplay chưa thực thi thay đổi.

Báo cáo cuối bằng tiếng Việt:

- Những tính năng1.2 đã hoạt động và cách mở menu/build/reroll/thành tựu.
- Quy tắc cap, số support slots và công thức stats thực tế.
- Những số quái/boss thay đổi, phase2 và cơ chế ngắm mới.
- Tình trạng save cũ, lệnh kiểm tra đã chạy, playtest và giới hạn còn lại.
- Nơi sửa data để thêm stat/mốc thành tựu hoặc điều chỉnh boss về sau.

**Hoàn thành nghĩa là người chơi xem được chỉ số, hiểu và xem lại build, dùng reroll đúng luật, nhận thành tựu đúng, cảm thấy quái/boss có áp lực hơn và vẫn chơi mượt theo chất lượng1.1. Không chỉ là thêm menu hoặc tăng vài con số.**
