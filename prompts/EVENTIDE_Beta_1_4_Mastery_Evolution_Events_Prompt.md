# Prompt nâng cấp EVENTIDE từ 1.3 lên beta 1.4

Dùng với **repo game 1.3 hiện tại**, tài liệu hiện hành và hai ảnh tham chiếu. Đây là tác vụ sửa/mở rộng trên base đã có, không phải tạo lại MVP. Các số mới là giá trị khởi đầu đề xuất cần playtest, chưa phải kết quả cân bằng đã kiểm chứng.

---

Bạn là lập trình viên game web 2D phụ trách **EVENTIDE – Thủy Triều Hư Không beta 1.4**. Hãy trực tiếp sửa code, UI, config, asset, save và test để hoàn thành toàn bộ yêu cầu dưới đây. Giữ các cải tiến của 1.1–1.3 và làm việc trên repo hiện tại.

## 1. Đọc base và xác nhận lỗi

Đọc AGENTS.md, GAME_SPEC.md, README, dependency/lockfile, tài liệu balance, architecture, assets, status và performance mới nhất. Chạy game và kiểm tra state/draft thực tế trước khi sửa. Không ghi đè tài liệu hiện hành bằng bộ baseline cũ, không nâng major dependency hoặc đổi framework vì tiện code.

Hai ảnh:

- `image(20261017-063723).png`: build cấp nhân vật 31 có Supernova, Ion Storm và Pulsar Beam đều cấp 5.
- `image(20261017-063728).png`: lượt chọn nâng cấp chỉ còn Orbital Drones/Gravity Well dưới dạng thay vũ khí cấp 1. Người chơi bị ép mất tiến trình vũ khí dù build đã hoàn tất.

Ảnh chứng minh trạng thái UI, chưa xác định function nào gây bug. Tìm logic pool, cap, replacement, fallback và queue multi-level trong code; không chỉ ẩn thẻ bằng CSS. Nếu không mở được ảnh, vẫn tái hiện state tương đương trong repo, không bịa kết quả.

## 2. Phạm vi beta 1.4

1. Sửa triệt để forced weapon replacement khi build đạt cấp tối đa, thêm tăng chỉ số nhỏ khoảng +2% ở các level sau.
2. Phân biệt vũ khí chính, phụ và bổ sung; thực hiện tiến hóa có nguồn gốc từ concept và các mở rộng nhỏ được ghi rõ.
3. Thêm ba sự kiện thiên văn có tác động gameplay, không xuất hiện quá sớm, không cộng dồn nguy hiểm vô kiểm soát.
4. Thêm nền tinh vân/sao/ngân hà đọc được, phân biệt EXP; Beacon có nhịp sáng lúc sạc và flash đỏ khi thật sự bị damage.
5. Tăng sức ép boss cuối vừa phải, giữ hai phase và đòn có thể né.

Không thêm map/nhân vật, inventory/crafting lớn, multiplayer, economy vĩnh viễn hoặc cơ chế paywall. Giữ thành tựu, Beacon Core, salvage, reroll, chỉ số, pooling, gộp EXP và save đã có.

Các số dưới đây phải nằm trong config. Những thay đổi hành vi so với 1.3 cần cập nhật GAME_SPEC, không chỉ sửa code rồi để tài liệu cũ.

## 3. Sửa pool level-up và tiến trình sau khi hoàn tất vũ khí

### 3.1 Tách loại hành động

Phân biệt rõ bằng type/ID, không dựa vào tên hiển thị:

- Nhận module mới vào ô trống.
- Tăng cấp module đang có, chưa đạt cấp 5.
- Tăng hỗ trợ cơ bản trong giai đoạn build thông thường.
- Thay module bằng loại khác: hành động chủ động riêng, không phải fallback bắt buộc.
- Tiến hóa/hợp nhất: không phải reset sang module cấp 1.
- Tăng chỉ số sau hoàn tất build: thẻ nhỏ +2%.

`valid normal choices` không được mặc nhiên bao gồm mọi replacement card khi pool nâng cấp cạn. Reroll phải dùng cùng bộ lọc của draft thường, không lôi thẻ thay vũ khí trở lại.

### 3.2 Trạng thái hoàn tất vũ khí

Định nghĩa rõ `weaponMasteryReached` hoặc tên tương đương theo session thật:

- Trước khi hợp nhất, khi ba ô đang dùng đều đạt cấp 5, đánh dấu hoàn tất vũ khí.
- Việc tiến hóa giữ cấp tối đa; không đánh dấu module tiến hóa là level 0/chưa sở hữu.
- Nếu hợp nhất giải phóng một ô sau khi đã hoàn tất, giữ cờ hoàn tất; ô trống đó không làm draft quay về ép nhận vũ khí mới.
- Cờ reset khi run mới. Không tự clear do mở modal, reroll, load catalog hoặc scene render lại.
- Nếu người chơi chủ động thay một module đã hoàn thiện bằng cấp 1, hành động phải cảnh báo rõ sẽ mở lại tiến trình vũ khí. Chỉ sau xác nhận có chủ đích mới rời chế độ hoàn tất; không xảy ra do fallback hoặc click mở build.

Ở beta này, sau khi hoàn tất vũ khí, **draft mặc định chỉ đưa các thẻ chỉ số nhỏ +2%**. Hai hỗ trợ cơ bản đã chọn giữ bonus/cấp hiện tại, không bị reset; các thẻ +10% hỗ trợ thông thường không tiếp tục xuất hiện trong chế độ này. Đây là quyết định chuyển từ xây build mạnh đầu run sang tăng trưởng nhỏ cuối run; phải giải thích ngắn trong UI. Không đánh dấu giả rằng hỗ trợ chưa đầy đã đạt max.

Nếu các ô chưa hoàn tất, giữ draft thường nhưng luôn có fallback an toàn khi pool cạn; không được bắt đổi vũ khí để đóng modal. Ô trống vẫn có thể được lấp trong giai đoạn build thông thường.

### 3.3 Thẻ chỉ số +2%

Tạo nguồn modifier riêng, ví dụ `masteryBonus`, không ghi vào level module, support hoặc salvage.

| Thẻ | Mức mỗi lần | Trần riêng nguồn mastery |
|---|---|---|
| Damage chung | +2% từ base/module level theo công thức chung | +20% |
| Tốc độ tấn công | +2% attack rate | +20% |
| HP tối đa | +2% từ base HP | +20% |
| Bán kính nhặt | +2% từ base | +20% |
| Tốc độ di chuyển | +2% từ base | +10% |

Thêm **tổng ngân sách mastery +20 điểm phần trăm trên toàn build/run**, tương đương tối đa 10 lựa chọn +2% trước khi chạm tổng trần. Đây là đề xuất cân bằng để tránh tăng trưởng vô hạn; nếu playtest cho thấy cần khác, ghi số trước/sau và lý do, không âm thầm tăng trần.

Không đưa giáp/crit/lifesteal vào pool +2% trong beta này. +2 điểm phần trăm giảm damage mỗi level không tương đương +2% một chỉ số khác về cân bằng.

- Pool tối đa ba stat ID khác nhau còn hợp lệ, vẫn reroll một lần/draft theo luật 1.2.
- Mỗi thẻ chỉ ghi đúng lượng thực sẽ nhận, current→next và ngân sách đã dùng. Tăng maxHP cộng currentHP đúng delta, không hồi đầy.
- Dùng basis points/đơn vị rõ: 2%=200bp; cap20%=2.000bp, không nhầm 0,02 với 2.
- Các lựa chọn cộng trên base, không lấy effective stat đã buff nhân lãi kép.
- Khi mọi lựa chọn stat đều cap: chuyển sang hồi 10 HP hoặc lựa chọn phục hồi hữu hạn đã có. Nếu full HP, cho Tiếp tục/Bỏ qua không penalty; không modal rỗng, không reset vũ khí hoặc reroll vô hạn.
- Giữ XP dư và queue multi-level. Mỗi draft chỉ commit một action; auto-heal/skip không làm mất các level còn chờ hoặc phát lại reward.
- UI Build hiển thị nguồn mới riêng: base, hỗ trợ, salvage, mastery và modifier tạm thời.

Công thức gợi ý, tích hợp pipeline hiện có thay vì tạo hệ song song:

```text
outgoingDamage = moduleDamageAtLevelAndEvolution
                 × (1 + supportDamage + salvageDamage + masteryDamage)
                 × corruptionMultiplier
                 × eventOutgoingMultiplier

attackInterval = moduleIntervalAtLevelAndEvolution
                 / (1 + supportRate + salvageRate + masteryRate)

maxHP = baseMaxHP × (1 + supportHP + salvageHP + masteryHP)
```

Event rate modifier nếu có phải áp theo hợp đồng được ghi rõ, không cộng/multiply hai lần. Beacon không nhận các buff tàu. Caps hỗ trợ/salvage hiện hành giữ riêng; cap mastery không xóa modifier của nguồn khác.

### 3.4 Thay vũ khí vẫn là lựa chọn chủ động

Loại replacement khỏi bộ thẻ mặc định. Nếu giữ chức năng đổi của 1.3, đưa vào nút riêng “Thay vũ khí” trong màn chọn nâng cấp, có label đây là lựa chọn thay thế mất cấp, không tự focus/chọn khi pool cạn.

- Chọn loại và ô cần thay, xem “vũ khí cũ cấp N → vũ khí mới cấp 1”, xác nhận rồi mới tiêu một lựa chọn level-up.
- Hủy trở về cùng draft, không đổi pool/reroll/XP.
- Không cho catalog/build tự đổi miễn phí ngoài action hợp lệ.
- Nếu đang mastery và chủ động đổi, UI nói rõ các level sau lại dùng tiến trình vũ khí thông thường; không mất bonus mastery đã kiếm, không cấp lại ngân sách mastery đã dùng.
- Khi nguồn vũ khí đã hoàn thiện lại, mastery tiếp tục theo budget còn lại, không reset về 0 để farm vượt cap.

## 4. Phân loại vai trò vũ khí

Thêm metadata/category, label, icon và mô tả gameplay rõ:

| Nhóm | Module | Vai trò |
|---|---|---|
| Vũ khí chính | Plasma/Mini Sun/Supernova, Pulsar Beam, Ion Storm, Quasar Cannon | Nguồn damage chủ lực, target/sweep/chain khác nhau |
| Vũ khí phụ | Orbital Drones và hình thái cấp 5 | Bảo vệ cự ly gần, damage tiếp xúc quanh tàu |
| Vũ khí bổ sung | Gravity Well và hình thái cấp 5 | Kiểm soát vị trí, gom quái, hỗ trợ burst |

Giữ tối đa ba ô module của base. **Chưa ép mỗi nhóm chỉ có một ô**, vì ảnh cho thấy build ba vũ khí chính đang hợp lệ; không tự phá/reset build đó. Việc phân vai có ý nghĩa ở hành vi, catalog, tooltip và cách trình bày, không phải tạo thêm slot hoặc thêm multiplier chỉ vì tên nhóm.

UI nhóm theo vai trò trong catalog; mỗi ô Build có badge vai trò. Không nhầm “vũ khí phụ” với hai ô hỗ trợ chỉ số. Module phụ/bổ sung cũng được lên cấp và tiến hóa theo luật riêng, không gọi chúng là stat upgrade.

Nếu muốn thiết kế loadout một ô mỗi nhóm trong tương lai, để backlog riêng, không lén áp trong beta này.

## 5. Tiến hóa từ concept và mở rộng có ghi nguồn

### 5.1 Công thức có trong concept

- **Plasma Orb → Mini Sun → Supernova**: giữ đúng cấp 3/cấp 5 và một ô đã có. Sửa bug nếu hình thái không bám source of truth, không yêu cầu người chơi cày lại.
- **Pulsar Beam + Ion Storm → Quasar Cannon**: triển khai hợp nhất trong beta 1.4.

Concept chưa đặt tên tiến hóa riêng cho Drones/Gravity Well. Hai hình thái dưới đây là **mở rộng đề xuất của beta**, không tuyên bố trích nguyên từ concept:

- Orbital Drones cấp 5 → **Orbital Bastion**: hình thái drone hộ vệ rõ hơn, cải thiện damage/độ bao phủ theo config, không tạo shield bất tử hoặc tự hồi HP.
- Gravity Well cấp 5 → **Singularity Well**: vùng hút ổn định và nổ rõ hơn, cải thiện radius/damage có giới hạn; vẫn chỉ hút quái, không hút tàu/Beacon/XP/đạn.

Hai hình thái đơn tự kích hoạt khi đạt cấp 5, giữ ID gốc/slot/level5; không mở một chuỗi level6–10. Ghi tên mới vào catalog và glossary để người chơi hiểu cùng module đã tiến hóa.

### 5.2 Quasar Cannon: điều kiện và thao tác

- Có Pulsar Beam cấp 5 và Ion Storm cấp 5 trong cùng run.
- Hiện công thức và nút Tiến hóa trong Build/section tiến hóa, có badge thông báo điều kiện đã đủ. Đây là lựa chọn chủ động riêng, không phải thẻ thay vũ khí ngẫu nhiên.
- Tiến hóa không tiêu thêm level-up, không yêu cầu vật phẩm mới và không ép người chơi phải làm để thoát draft. Giải thích đổi hai module thành một trước khi xác nhận.
- Giữ pause đúng context. Đang ở draft thì trở lại cùng draft/queue/reroll, không auto nhận một thẻ khác.
- Commit atomically: consume hai module nguồn, tạo Quasar ở một ô nguồn, **level 5/evolved ngay**, ô nguồn còn lại được giải phóng. Không tạo Quasar cấp 1 rồi yêu cầu nâng lại.
- Cleanup đạn/beam/chain/cooldown/VFX persistent thuộc nguồn theo chính sách swap hiện hành; không xóa loot hoặc hoàn tác damage đã resolve.
- Nếu mastery đã mở, vẫn mở sau hợp nhất; ô trống không kích hoạt forced acquisition. Nếu hợp nhất trước khi cả ba ô hoàn thiện, tiến trình thông thường vẫn có thể lấp ô trống có chủ đích.
- Trong lúc Quasar còn được trang bị, không đề nghị lại hai nguyên liệu Pulsar/Ion để farm bản sao hoặc hợp nhất lặp. Chưa hỗ trợ tách Quasar lấy lại hai nguồn trong beta này.
- Double click không consume hai lần hoặc tạo hai Quasar. Không mất achievement đã mở từ các module nguồn.

### 5.3 Quasar Cannon: hành vi và hiệu ứng

Tạo một nguồn damage hợp nhất có bản sắc: một chùm/quạt năng lượng đậm phát theo nhịp, xuyên hoặc quét ngắn qua mục tiêu, có tia ion phụ hữu hạn tại điểm hit. Hợp nhất nét beam của Pulsar và chain của Ion; không đơn giản là bật nguyên cả hai behavior cùng lúc với hai multiplier.

- Hợp đồng về target, range, beam duration, hit per pulse/tick và chain count ghi trong config và tooltip.
- Mỗi target không nhận nhiều hit ngoài chủ đích vì cả beam và chain cùng đánh; nếu có damage thứ cấp, định nghĩa rõ giảm dần và giới hạn, không back-chain vô hạn.
- Source theo tàu/camera đúng, VFX và collider đồng nhất. Không full-screen flash, không màu/shape gây nhầm với boss beam.
- Damage single-target/clear đàn sau fusion phải đáng dùng nhưng không tăng vô hạn. So với **tổng đóng góp của hai module nguồn ở cùng build**, không so riêng một module cấp 1. Không chỉ cộng damage rồi bỏ qua rate, targets, falloff và thời gian quét.
- Giới hạn FX/chain, tái sử dụng buffers và pool. Quasar giữ một behavior authoritative, không để nguồn cũ tiếp tục gây damage sau fusion.
- Hỗ trợ/salvage/mastery/Corruption/event áp đúng một lần. Snapshot/hit-time damage policy nhất quán với hệ hiện có.

## 6. Bộ sự kiện thiên văn

Thêm **ba loại sự kiện**, với lịch đầu tiên cố định có cấu hình để dễ cân bằng/test. Chưa cần event RNG director phức tạp; vẫn có thể chọn vị trí/biến thể bằng seeded RNG.

| Sự kiện | Bắt đầu gợi ý | Active duration | Tác động chính |
|---|---|---|---|
| Vành đai bức xạ | 210 giây, sau phút 3 | 45 giây | Vùng nguy hiểm tác động tàu và quái, có thể tận dụng để dẫn quái |
| Bùng nổ hỗn loạn | 330 giây, giữa màn | 90 giây | Quái thường +50% maxHP và damage; tàu +15% damage tạm thời |
| Thủy triều trọng lực | 465 giây, trước boss | 45 giây | Trường hút/đẩy có nhịp kéo tàu và quái |

Lịch trên kết thúc sự kiện cuối ở giây 510, trước boss baseline giây 540. Không xuất hiện ở phút đầu; không mặc định chồng Bùng nổ hỗn loạn lên boss và gravity cuối màn. Chủ đích tăng tình huống chiến thuật ở giữa run và giữ chỗ cho encounter cuối.

Mỗi sự kiện có preview cảnh báo ngắn trước active, tên/icon, thời gian còn lại và mô tả tác dụng thật. Phân biệt thời gian cảnh báo với active duration trong scheduler/config. Ví dụ warning bắt đầu 3 giây trước mốc active; không cộng lẫn vào90 giây buff.

Không thêm reward multiplier/bonus drop mới ngoài thiết kế này. Giữ cap và drop rule 1.3; kill qua môi trường được ghi nhận theo mục 7, không tạo hệ farm tự động ngoài camera.

## 7. Chi tiết tương tác của sự kiện

### 7.1 Vành đai bức xạ

- Tạo tối đa hai vùng/băng bức xạ có vị trí và kích thước rõ ở ngoài lõi vùng sáng, không chặn mọi đường đi. Chọn hình đơn giản có kiểm tra overlap được, không cần map vật lý mới.
- Telegraph mỗi vùng trước khi active, viền/hatch khác orb EXP, không giấu dưới tinh vân.
- Tàu ở vùng nhận damage theo giây/tick; khởi điểm đề xuất 4 HP/giây trước giảm damage hợp lệ. Quái thường nhận khoảng2% maxHP/giây, có cap/cooldown, không theo FPS.
- Beacon và boss không chịu loại damage môi trường này mặc định. Không để sự kiện giết Beacon ngoài tầm mà người chơi không thể xử lý.
- Tàu có thể dụ quái vào vùng, vẫn có lối tránh. Không làm vùng đổi vị trí tức thì lên tàu; nếu vùng trượt, telegraph đi cùng và tốc độ đủ né.
- Environmental final hit có source tag riêng. Quái vẫn chết/roll loot một lần và tính kill theo chính sách game: beta mặc định ghi credit cho người chơi đang trong run, không phân tách assist mới. Không bypass dead guard.
- Damage tàu đi qua pipeline giảm damage/Corruption đúng một lần; damage phần trăm vào quái không tự nhân theo buff damage tàu. Không tạo triệu chứng quái tự nhận bonus Corruption của người chơi.
- Mọi hit/timer/zone được dọn khi event hết hoặc run kết thúc.

### 7.2 Bùng nổ hỗn loạn

Đúng với ý tưởng tăng độ nguy hiểm tạm thời:

```text
normalEnemyMaxHP = baseHP × minuteHPMultiplier × 1.5
normalEnemyDamage = baseDamage × minuteDamageMultiplier × 1.5
shipEventOutgoingMultiplier = 1.15
```

- +50% quái là modifier event riêng, không sửa vĩnh viễn base hoặc rate theo phút. Không lặp ×1,5 mỗi frame/event refresh.
- Áp cho quái thường đang sống và sinh mới. Khi vào/ra event hoặc bước qua phút, recompute từ base + nguồn đang active và giữ tỷ lệ HP còn lại, không hồi đầy hoặc ghi maxHP âm.
- Boss không nhận buff chaos trong beta này. Speed/spawn rate/contact cooldown không tự tăng thêm; khó hơn do HP/damage và quyết định chiến đấu.
- Tàu có buff damage +15% tạm thời để tạo cơ hội chủ động; UI phải nói cả lợi và nguy cơ. Không cộng buff này vào support/salvage/mastery rồi quên gỡ.
- Hết90 giây gỡ modifier đúng một lần, kể cả pause/resume, result, restart hoặc event bị hủy. Không dùng “chia ngược chỉ số hiện tại” vì nó có thể đã đổi do nguồn khác.
- Cân bằng với scaling theo phút của 1.3. Ví dụ Drifter minute6 có factorHP1,48; chaos làm tổng1,48×1,5=2,22base, hết event trở về theo minute hiện tại. Đây là lý do cần đo chứ không gọi+50% là luôn vừa phải.

### 7.3 Thủy triều trọng lực

- Tái sử dụng hệ gravity môi trường, chỉ một nguồn trường môi trường active/cảnh báo tại một thời điểm. Gravity Well/Singularity của tàu là nguồn khác đã có cap riêng.
- Trường có nhịp hút rồi đẩy, ví dụ chu kỳ6 giây có chuyển pha báo trước; vòng/streamline thể hiện hướng vào/ra thật. Không đổi dấu lực đột ngột ở mức làm tàu không kiểm soát được.
- Tác động tàu/quái, không Beacon, XP, salvage hoặc projectile trong beta này. Không tạo damage lõi bí mật.
- Lực có cap, xử lý tâm không NaN, tương thích map boundary. Tàu ở tốc độ cơ bản thoát được, không bị khóa do cộng nhiều nguồn.
- Không cho một lực đẩy tống tàu ra ngoài map hoặc xuyên collider ngoài quy tắc.
- Giữ nhịp camera/input/thruster mượt, không biến lực môi trường thành tween teleport.

## 8. Scheduler và arbitration của sự kiện

Thiết kế lifecycle rõ: scheduled → warning → active → ending → completed/cancelled. Mỗi event instance có ID, source ownership và cờ chạy một lần.

- Chỉ một sự kiện thiên văn lớn active ở một thời điểm. Warning cũng cần được điều phối để không chồng nhiều banner/hazard gây rối.
- Tạm ngừng/skip các gravity môi trường thường đã được lịch cũ lên mốc khi một event lớn đang warning/active. Không hoãn chúng thành một hàng rồi xả cùng lúc khi event kết thúc.
- Thủy triều lấy quyền trường môi trường: thu hồi nguồn cũ an toàn, không giữ một hố hút cũ vô hình dưới trường mới. Hết event thì lịch thường chỉ tiếp tục ở mốc tương lai.
- Gravity cuối màn baseline630giây vẫn riêng, không bị scheduler mới bỏ mất. Sau phút9 không mở lại chaos/bức xạ/tide trong lịch mặc định.
- Module gravity của người chơi vẫn hoạt động; tổng lực có cap, không vô hiệu module chỉ vì môi trường có event.
- Pause/level-up/build/tab-hidden đóng băng warning, active duration, lực, damage và modifier. Chỉ UI có thể animate không ảnh hưởng game state.
- Khi fast-forward test vượt cả start/end, resolve từ thời điểm hiện tại, không replay một loạt event/hazard đã hết vào cùng một frame. Đừng dựa vào equality số thực.
- Victory/defeat/restart gỡ mọi event modifier/zone/UI timer/listener. Không đem chaos sang lượt mới.
- Config chứa lịch, duration, forces, damage, caps và visual budget; không đặt số rải rác trong Scene.

## 9. UI sự kiện và thông tin trong trận

- Có một event indicator gọn: icon, tên, thời gian active còn lại và tóm tắt tác dụng, ví dụ “Quái thường: HP/damage +50%; tàu: damage +15%”.
- Warning có tín hiệu hình/âm ngắn nhưng không auto pause hoặc chiếm toàn màn khi đang né. Không toast lại mỗi enemy spawn.
- Mô tả nguồn buff/debuff trong Build/chi tiết stat, tách event khỏi bonus vĩnh viễn hoặc progression run.
- Hết event có feedback ngắn, không để thanh đếm âm hoặc label chaos tồn tại sau cleanup.
- Màu/shape không chỉ dựa đỏ/cyan; thêm icon/hatch hoặc text để nhận ra vùng bức xạ, lực hút và projectile.
- Chế độ giảm hiệu ứng vẫn giữ telegraph/biên vùng/hướng lực; không làm gameplay dễ/khó khác đi.
- UI tiếng Việt chuẩn dấu, đơn vị có khoảng cách; không đưa từ debug như modifier stack, cleanup ID, flush interval vào luồng người chơi.

## 10. Làm đẹp không gian và phân biệt EXP

Không dựa vào một ảnh nền quá sáng. Tạo các lớp có ngân sách và có thứ bậc:

1. Nền xanh đen/tím sâu nhất, ổn định.
2. Một vài tinh vân/galaxy xa, opacity thấp, texture bake/local, parallax rất nhẹ nếu cần.
3. Sao nền nhỏ khác độ sáng/kích thước, có thể twinkle chậm và thưa.
4. Decor phế tích hiện có.
5. Gameplay: Beacon, quái, loot, projectile, hazard và UI nổi rõ hơn nền.

Yêu cầu:

- Sao nền không có viền/ring/pulse giống orb EXP, không cùng kích thước/brightness với pickup. Không có magnet/physics/hitbox/loot hoặc marker nhặt.
- Quan sát ngay được đâu là EXP, đâu là salvage, đâu chỉ là sao. Tinh vân/ngân hà không phủ/nuốt projectile địch hoặc telegraph boss.
- Sinh layout nền theo seed một lần lúc load/run, không tạo hàng nghìn random objects/gradient mỗi frame.
- Ưu tiên tile/atlas/baked texture và vài layer thay vì một GameObject+Tween cho mỗi chấm sao. Twinkle có thể cập nhật theo nhóm hoặc shader nhẹ nếu engine đã hỗ trợ, không bắt buộc shader mới.
- Không dùng full-screen blur/bloom nhiều pass, ảnh khổng lồ vượt ngân sách hoặc tải texture từ mạng khi chơi.
- Background gắn camera/world đúng, không giật khi camera follow/interpolate, không seam lớn khi pan.
- Low giảm decor/twinkle/parallax, giữ toàn bộ gameplay. UI text không bị raster mờ do hạ resolution canvas nền.
- Có tùy chọn giảm chuyển động/flash nếu đang có settings tương ứng; không thêm nhiều toggle khó hiểu chỉ cho một layer.

Vì hai ảnh tham chiếu là panel, hãy vào gameplay thật để kiểm tra độ trống và tương phản; không tuyên bố đã xem hình gameplay nếu chưa mở được runtime.

## 11. Phản hồi Beacon khi sạc và nhận damage

### 11.1 Trạng thái sạc

- Beacon có nhịp pulse/glint nhẹ, ví dụ khoảng0,8–1,2 lần/giây, không strobe nhanh hoặc flash cả màn.
- Charge progress được biểu đạt bằng vòng/segment/lõi đang tích sáng, khớp %simulation thực. Không phát hiệu ứng hoàn tất sớm khi chỉ gần100%.
- Dùng model theo core level hiện hành; pulse không thay core stat hoặc radius.
- Nếu đang pause, charge không chạy; animation trình bày có thể dừng hoặc dịu theo quy tắc nhất quán, không làm người chơi tưởng sạc vẫn tăng.

### 11.2 Nhận damage

- Khi Beacon thật sự mất HP từ một damage event hợp lệ, flash đỏ ngắn khoảng0,15–0,25 giây, có outline/pulse và HUD feedback.
- Chạm enemy nhưng chưa tới damage cooldown không flash liên tục. Trigger dựa trên `damageApplied>0`/HP giảm, không raw overlap mỗi frame.
- Charge pulse và damage flash có ưu tiên rõ: đỏ thắng tạm thời, xong trở về palette/core/charge hiện tại, không set tint về một màu hardcode làm mất model cấp cao.
- Nhiều hit gần nhau có bounded refresh/aggregation, không tạo vô hạn tween hoặc giữ đỏ mãi ngoài chủ đích. Có thể có nhịp cảnh báo nguy cấp riêng tiết chế theo tỷ lệ HP.
- Đỏ chỉ là phản hồi, không tạo damage trả lại, shield hoặc invulnerability mới.
- Kết quả thắng có Beacon hồi sinh vùng không gian, defeat/cleanup không để timer flash đụng sprite đã hủy.

## 12. Boss cuối mạnh hơn vừa phải

Giữ Elder Star hai phase của base 1.2/1.3, không thêm phase3 hoặc bắt buộc giết để thắng. Trước khi chỉnh số, đo damage/TTK thật với build1.3, build có mastery và build Quasar. Kiểm tra bug hit nhiều lần theo frame, chain lặp một target, multiplier lặp hoặc nguồn vũ khí cũ chưa cleanup; không dùng HP khổng lồ che các bug đó.

Giá trị khởi đầu để thử so baseline 1.3:

- HP từng phase khoảng+15%, giữ tỷ lệ phase2 hiện có.
- Damage boss khoảng+10%.
- Attack rate khoảng+10%, hoặc giảm recovery có giới hạn; rate +10% là interval/1,1, không giảm10% nhiều nơi rồi nhân lặp.
- Tốc độ di chuyển tăng nhẹ tối đa khoảng5% nếu thực sự cần, vẫn giữ vùng hoạt động và đường né.

Đây là đề xuất vừa phải, không phải bắt buộc nhân mọi stat nếu playtest chứng minh đã đủ. Ghi những mục đã áp và số thực tế.

### Hành vi có chủ đích

- Phase1 rõ nhịp, cho người chơi đọc vòng đạn và tia.
- Phase2 có thể luân phiên fan lệch góc/vòng đạn với tia ngắm; giới hạn số pattern nguy hiểm đồng thời, giữ ít nhất một cách né nhìn được.
- Tia origin theo boss, aim lúc windup rồi khóa hướng trước fire; không aimbot quay theo tàu suốt active, collider khớp VFX.
- Telegraph quan trọng không rút gần0 chỉ để khó; giữ tối thiểu đang dùng đã hợp lý hoặc thử khoảng0,8–1 giây cho đòn mạnh theo context thực.
- Boss áp lực bằng vị trí và nhịp, không bằng projectile cap vô hạn, contact hitbox giấu hoặc damage ngay sau transition không cảnh báo.
- Chaos không buff boss, lịch thiên văn mặc định đã kết thúc trước boss. Gravity cuối màn vẫn có thể cùng tồn tại, nên test đặc biệt phase2 tại giây 630 trở đi.
- Transition HP0 phase1 không trả kill/XP/salvage, không overkill xuyên phase, pause dừng đúng và finalDeath đúng một lần.
- Mốc boss/charge/thắng thua hiện hành giữ; nếu còn sống tại720 giây vẫn thắng theo Beacon. Không tự dừng sạc hoặc cộng giờ để ép đánh.

Mục tiêu là encounter có áp lực hơn và vẫn né được. So TTK của build tự nhiên, không chỉ debug max. Mọi số “đã cân bằng” phải có thử nghiệm, không dự đoán tỷ lệ thắng từ một run.

## 13. Pipeline stat, dữ liệu và kiến trúc

Tích hợp với hệ hiện có, không dựng một framework modifier quá lớn. Những trách nhiệm cần phân biệt:

- Draft eligibility, draft mode/mastery, fallback và action transaction.
- Weapon role metadata, evolution recipes, source ownership và fusion.
- Run modifier sources: support, salvage, mastery, Corruption, event.
- Enemy base stats, minute factors và event factors; derived values tính từ nguồn.
- Astronomical event lifecycle/scheduler, zones/forces và UI presentation.
- Background presentation và Beacon state feedback, không chứa combat logic.

Quy tắc:

- Stable ID cho weapon/evolution/event/stat; tên tiếng Việt không làm key save.
- Không persist effective stats rồi nhân thêm mỗi reload. Nếu save không hỗ trợ resume run, mastery/event active không được biến thành profile buff vĩnh viễn.
- Save migration giữ tiền/core/Echo/settings/achievement. Nếu có lưu module trong profile hoặc run cũ, đọc schema thật và có mapping, không reset để tiện code.
- Một simulation clock; Date.now chỉ dùng metadata profile nếu cần, không dùng event duration hoặc mastery.
- Lấy currentHP ratio trước khi thay maxHP quái rồi apply once. Damage source/multiplier có hợp đồng, tránh event enemy damage vô tình ảnh hưởng radiation %HP hoặc ship damage hai lần.
- Fusion/replacement kết thúc có ownership. Particle/field/beam/chain cũ không được tiếp tục gây damage sau khi mất owner.
- Event reset, scene shutdown và game result dọn modifier/listener/timer/VFX. Không dùng phép chia ngược current value để gỡ modifier.

Comment tiếng Việt tại các điểm khó: mastery latch sau fusion, pool không dùng replacement fallback, basis points và source cap, fusion atomic, minute×event recompute/HP ratio, scheduler fast-forward/arbitration, Beacon flash ưu tiên, kill attribution môi trường và damage ownership.

## 14. UI và tài liệu phải đồng bộ

UI cần phản ánh luật mới:

- Draft có label “Build vũ khí đã hoàn tất — nâng chỉ số +2%”, cap và nguồn bonus.
- Hết pool có hồi phục/Tiếp tục, không lời nhắc ép nhận module mới.
- Catalog phân nhóm chính/phụ/bổ sung, recipe và điều kiện tiến hóa thật, không nút trống.
- Build ghi module ID/hình thái/cấp đúng, Quasar không hiện cấp0 hoặc cấp1; ô trống sau fusion không báo lỗi chưa hoàn thành.
- B hoặc lối xem build riêng giữ; không tự đưa nút Build trở lại pause Esc nếu bản1.3 đã bỏ theo yêu cầu.
- 28achievement hiện hành vẫn hoạt động; không cần thêm thành tựu cho mỗi event trong beta này. Kills/evolution/boss credit mới đi qua event service thật và không trùng.
- Beacon Core preview/stats và model trong run tiếp tục đúng theo core level.

Cập nhật GAME_SPEC, balance, architecture, asset guide, acceptance/status/changelog và backlog. Ghi rõ:

- Recipe nào có trong concept, tên/hình thái nào là mở rộng beta mới.
- Hành vi level-up thay thế luật1.3 ra sao; caps mastery và công thức nguồn.
- Lịch/tác dụng/arbitration event, enemy minute×event và boss chỉnh riêng.
- Benchmark/visual QA/playtest đã chạy và phần chưa kiểm chứng.

Không sửa lại prompt tạo MVP như thể nó là spec hiện hành. Ghi nhãn beta 1.4 khi sản phẩm thực sự có thay đổi, không chỉ đổi version text.

## 15. Kiểm thử chức năng và hồi quy

Chạy scripts thật trong repo: typecheck, unit/integration phù hợp, build và browser/e2e. Test state thật, không chỉ text hoặc function tồn tại.

### Draft/mastery

1. Dựng đúng build trong ảnh: ba module cấp5, support đủ theo scenario. Level tiếp chỉ có stat +2% hoặc fallback hợp lệ, không ép Orbital/Well cấp1.
2. Reroll cùng scenario không trả replacement. Hủy/xem Build/ẩn tab không reset ngân sách hay mastery flag.
3. Cấp module/evolution vẫn5 sau nhận stat; HP/rate/damage đúng+2% additive, không compound. Tổng mastery<=20%, per-stat cap/speed cap đúng.
4. Support/salvage/Corruption không bị reset hoặc tính trùng. Hết stat cap+fullHP vẫn đóng draft an toàn, XP dư/multi-level queue không mất.
5. Thay module chủ động mới có thể mở lại progression, giữ mastery đã kiếm/budget cũ; không dùng đóng/mở để farm vượt cap.

### Role/evolution/fusion

6. Build ba vũ khí chính cũ vẫn hợp lệ; UI có phân vai, không tự xóa/quy đổi slot.
7. Plasma cấp3/5 đúng chuỗi; Drone/Well cấp5 đúng hình thái mới, giữ ID/level5/behavior hợp lệ.
8. Pulsar 5 + Ion 5 mới đủ điều kiện Quasar; xác nhận consume đúng hai nguồn, Quasar 5, ô kia trống. Không đủ điều kiện/cancel/double click không mất module.
9. Fusion sau mastery không re-open forced weapon draft; fusion giữa queue level-up giữ đúng draft/XP/reroll. Quasar không để nguồn cũ/chain duplicate damage.
10. Hit limits/chain visited/owner cleanup đúng ở các FPS mô phỏng; modifier áp một lần, boss không bị chain đánh vô hạn một target.

### Events

11. Warning/active/end đúng mốc; không có event quá sớm, không overlap major event, không replay cả ba sau fast-forward qua end.
12. Pause/upgrade/tab-hidden dừng lực/damage/duration/buff. End/result/restart gỡ đúng tất cả modifier, không nhiễm run mới.
13. Chaos+minute: từ base tính đúng, giữ HP ratio khi bắt đầu/kết thúc/bước phút; quái mới nhận đúng, boss không nhận chaos. Không ×1,5 lặp.
14. Radiation chỉ damage mục tiêu hợp lệ theo tick, Beacon/boss không bị damage mặc định; loot/kill environmental cuối đúng một lần.
15. Tide có lực thật, hướng thể hiện đúng, tàu cơ bản thoát, không NaN/out-of-bounds hoặc kéo loot. Cap gravity và lịch630 không mất.
16. Sau event, stat/HUD thực trở về đúng nguồn còn active; không dùng giá trị chia ngược gây drift.

### Visual/Beacon/boss

17. Nền sao/tinh vân không giống EXP/salvage, không có pickup body hoặc che đạn. Low vẫn đọc gameplay.
18. Beacon charge pulse không làm sạc chạy trong pause; damage flash chỉ khi mất HP, trở đúng core palette, không tạo tween vô hạn.
19. Boss hai phase/targeting/telegraph/final reward giữ đúng; tăng khó không phát sinh đòn không thể né hoặc phase3.
20. Save migration giữ tiến triển, font Việt/scroll/focus/menu/new tooltip ổn ở 1280×720 và1920×1080, zoom phù hợp.

## 16. Kiểm thử cân bằng và hiệu năng

Tạo scenario/seed tái hiện cho:

- Build bình thường chưa mastery, không debug max mọi thứ.
- Build ba module 5 trong ảnh, trước/sau các level +2%.
- Quasar so tổng hai nguồn, cả đàn thường và boss.
- Event radiation, chaos và tide riêng; chaos qua mốc phút; event end khi đang có draft pause.
- Giai đoạn boss phase2 + gravity cuối + lượng pickup/VFX đông.
- Chơi lại nhiều lần để phát hiện listener, modifier, texture hoặc pooled state không được reset.

Ghi trước/sau: level-up choices hợp lệ, stat effective, enemy HP/damage/TTK, drop và kill, thời gian giết boss, HP tàu/Beacon, median/p95/p99 frame time nếu đo được, quái/đạn/pickup/particle counts và memory trend khi có công cụ.

Giữ cap/pooling và gộp EXP của 1.1. Không tối ưu bằng tắt logic quái ngoài camera, xóa EXP chưa nhặt, giảm spawn âm thầm hoặc bỏ damage của beam khi đạt cap. Background và VFX event cần budget riêng, không một emitter/DOM mỗi star/enemy.

Đo cùng viewport/quality/renderer/máy/seed, ưu tiên production preview để so với1.3. Low/High chỉ đổi presentation, không đổi stats, RNG drop, event duration hoặc độ khó. Nếu không đo được, nói chưa đo, không ghi “60 FPS ổn định”.

Chạy ít nhất một lượt đủ720 giây bằng chơi/render tốc độ thường khi môi trường cho phép. Fast-forward giúp test scheduler/memory/logic nhưng không chứng minh cảm giác né và FPS thật. Báo rõ phương pháp và phần bị chặn.

Nếu sự kiện+scaling làm run không có cơ hội né, hoặc Quasar/mastery làm boss chết tức thì, kiểm tra bug trước rồi chỉnh config có lý do. Không cân bằng bằng tăng vô hạn HP hoặc tạo rào cản không được giải thích.

## 17. Thứ tự thực hiện và bàn giao

1. Audit 1.3, tái hiện bug ảnh, lấy baseline.
2. Sửa draft/mastery/fallback trước, giữ đủ test regression cho lỗi forced replacement.
3. Phân vai/evolution/fusion và kiểm tra ownership/damage.
4. Scheduler và ba event với test time/modifier/arbitration.
5. Background/Beacon feedback, điều chỉnh boss nhỏ có bằng chứng.
6. Hồi quy, visual QA, full-run/playtest, kiểm tra hiệu năng và cập nhật docs.

Có thể đổi thứ tự cục bộ theo code nhưng hoàn thành toàn bộ phạm vi. Không dừng ở một bảng config hoặc menu trong khi event/evolution chưa thực thi.

Bàn giao bằng tiếng Việt:

- Lỗi forced replacement đã được sửa ở đâu, cách tái hiện và kết quả test.
- Khi nào vào mastery, caps/budget, còn giữ đổi chủ động ra sao.
- Vai trò/tiến hóa, điều kiện Quasar, hình thái mới và khác biệt FX.
- Tên/lịch/tác dụng của event, cách xác minh end/cleanup.
- Beacon/nền/boss thay đổi gì, stat trước/sau và trải nghiệm thử.
- Lệnh đã chạy, dữ liệu đo, save cũ và hạn chế chưa kiểm chứng.

**Đạt beta 1.4 nghĩa là:** build max không bị ép reset; tăng trưởng cuối run nhỏ và có giới hạn; vũ khí có vai trò/tiến hóa rõ; sự kiện tác động thật nhưng công bằng; không gian đẹp và Beacon có phản hồi; boss có áp lực hơn, vẫn giữ độ mượt và tiến triển của base 1.3.
