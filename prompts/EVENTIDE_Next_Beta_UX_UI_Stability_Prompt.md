# EVENTIDE — Prompt triển khai bản beta cải thiện UI, UX và độ ổn định

Bạn là gameplay engineer và UI/UX engineer phụ trách EVENTIDE – Thủy Triều Hư Không. Hãy triển khai trực tiếp một bản cập nhật trên project local hiện có, dựa trên yêu cầu dưới đây. Bàn giao bản chạy được, code có tổ chức, bằng chứng kiểm tra và tài liệu để sửa tiếp.

## 1. Mục tiêu của bản cập nhật

Người chơi cần:
1. Điều khiển ổn định khi đông quái, boss và hiệu ứng.
2. Nhìn nhanh biết mình cần làm gì: bảo vệ Beacon, tránh hazard, xử lý boss hay hoàn thiện build.
3. Hiểu lựa chọn nâng cấp và tiến hóa trước khi bấm.
4. Học các luật quan trọng ngay trong trận đầu.
5. Hiểu vì sao mình thắng/thua và có mục tiêu cho lượt tiếp theo.

Giữ bản sắc hiện tại: nền vũ trụ lạnh, Beacon vàng ấm, phi thuyền nhỏ và hư không. Cải tiến dựa trên UI hiện có, không thay toàn bộ bằng một bộ giao diện khác.

Bối cảnh: bản main từng được review ở commit 5fbac8a ngày 17/10/2026 chưa phản ánh mọi thay đổi local sau đó. Một lần mở web dừng ở loading 0% không đủ chứng minh game lỗi trên mọi máy. Phải kiểm tra bản local mới nhất, không lấy snapshot cũ làm trạng thái hiện tại.

Đây là tác vụ thực hiện. Không dừng ở kế hoạch, gợi ý hoặc mockup. Không tự push/deploy. Không tự thêm backend, account, multiplayer, tiền tệ mới, engine mới hoặc nâng dependency hàng loạt.

## 2. Đọc project và xác định baseline

Đọc AGENTS.md, GAME_SPEC.md, tài liệu balance/architecture/status/asset, package.json và code thực tế. Giữ thay đổi sẵn có của người dùng; không reset, ghi đè source bằng bản remote cũ hoặc xóa save.

Tạo bảng kiểm ngắn cho từng yêu cầu:
- Đã có và kiểm chứng được: giữ, chỉ sửa thiếu sót.
- Đã có nhưng lỗi: tái hiện và sửa nguyên nhân.
- Chưa có: triển khai theo yêu cầu bên dưới.
- Không thể kiểm chứng vì môi trường: ghi đúng giới hạn, không tự đánh dấu hoàn thành.

Các file từng tồn tại, cần đối chiếu tên local:
- UI: src/game/ui/GameUI.ts, ProgressionView.ts; src/styles/ui.css, tokens.css.
- Luật: src/game/config/*, src/game/core/GameSession.ts, buildProgress.ts, stats.ts.
- Hazard: AstronomySystem.ts, MovementSystem.ts.
- Spawn/boss: SpawnSystem.ts, BossSystem.ts, BossLifecycle.ts.
- Presentation/perf: WorldRenderer.ts, SpritePool.ts, PerfSampler.ts.

Ghi baseline cùng viewport/seed/build:
- Menu, HUD, Balo, draft, xác nhận tiến hóa, Beacon Core và kết quả trận.
- Trận bình thường, đông quái và cuối trận.
- p50/p95 frame time, frame quá 50/100 ms, số entity/VFX, đối tượng sau restart.
- Nguồn số đo và môi trường. Đừng dùng bot mô phỏng tăng tốc để chứng nhận FPS hay cảm giác chơi.

Không thiết kế lại các phần đã tốt trước khi xác định vấn đề cụ thể.

## 3. Khép lại các yêu cầu còn thiếu của bản trước

Đây là phần hoàn thiện các yêu cầu đã có, không nhân bản hệ thống nếu local đã thực hiện.

### 3.1. Cung tròn vàng nhỏ không rõ nghĩa

Tái hiện ở sảnh, thành tựu, Balo và khi chuyển màn. Kiểm tra custom cursor, loader, progress, pseudo-element, SVG/canvas, anchor và cleanup.

Truy chính xác owner tạo cung. Nếu là progress, đặt vào đúng card với nhãn và giá trị; nếu loader, chỉ hiện trong thời gian tải; nếu trang trí/cursor thừa hoặc object còn sót, loại bỏ/sửa lifecycle. Không dùng selector toàn cục xóa mọi vòng tròn hoặc ::before/::after, tránh mất vòng Beacon, focus và tiến trình hợp lệ.

Báo nguyên nhân và có ảnh trước/sau. Nếu local không còn lỗi, ghi kịch bản đã kiểm tra, không sửa giả một nguyên nhân chưa xác nhận.

### 3.2. Stardust tinh khiết

Đặt thành khối tài nguyên ở header góc trên bên phải sảnh, cùng hệ căn lề với thương hiệu:
- Icon riêng 28–32 px, số dư khoảng 24–28 px, nhãn dễ đọc.
- Nền tối và viền vàng tinh tế; trọng lượng thấp hơn nút Khởi hành.
- Số tabular, định dạng số lớn không tràn.
- Một nguồn số dư chung với Beacon Core; nhận thưởng/mua/quay lại sảnh luôn đồng nhất.
- Màn hẹp: xuống một hàng hợp lý, không trả lại vị trí nhỏ khó nhìn ở chân trang.
- Chỉ trông như nút nếu có hành động bấm thật.

### 3.3. Hazard rõ cả hình ảnh và tác động

Phân biệt Corruption, hố đen môi trường, sự kiện thủy triều hút/đẩy, phóng xạ và Gravity Well thân thiện. Không tự thêm liên hệ giữa Corruption và việc sinh hố đen.

Hazard có warning → active → ending, biên khớp collision, mũi tên/vệt chỉ hướng thật. Phóng xạ có hatch/icon, hố đen địch tím/hồng, hố đen thân thiện cyan. Low/reduced motion vẫn đọc được vùng nguy hiểm.

Nếu local còn mức cũ yếu:
- Tide thử lực đỉnh 130–150 u/s khi tốc độ cơ sở tàu khoảng 200; bán kính khoảng 420–460 u, chu kỳ khoảng 6 giây.
- Có cue trước đổi hút/đẩy; vị trí trường khóa từ warning, không chạy theo tàu khi active.
- Giới hạn lực tổng trên tàu khoảng 75–80% tốc độ hiện tại, xử lý tâm không NaN, có lối thoát.
- Phóng xạ tối đa hai vùng, radius khoảng 180–220 u, warning ít nhất khoảng 3 giây, thử 7 HP/s trước giảm trừ thay mức cũ 4 nếu đúng baseline.
- Vị trí cần ảnh hưởng đường di chuyển thực nhưng không phủ kín Beacon hoặc gây damage ngay khi spawn dưới tàu.
- Kiểm tra armor/heal/cooldown damage: không để event mất tác dụng do sai timer, không bỏ qua miễn nhiễm thật, không gây hai lần damage vì vùng cùng loại chồng nhau.
- Tương tác quái/boss/EXP theo core; không để damage %HP vô tình xóa boss hoặc kéo toàn bộ loot.

Đây là mức khởi đầu, phải đo quỹ đạo, hao HP và khả năng thoát. Nếu local đã tune khác, giữ cấu hình đã kiểm chứng và giải thích thay đổi cần thiết.

### 3.4. Scaling quái

Nếu local vẫn dùng rates cũ 5–10%, áp cấu hình tuyến tính khởi đầu:

| Quái | HP/phút hoàn tất | Damage/phút hoàn tất |
| --- | ---: | ---: |
| Wisp | +10% | +7% |
| Drifter | +14% | +9% |
| Leech | +16% | +10% |

m=floor(simulationTime/60); tính từ base: base × (1 + rate × m), rồi áp event factor đúng một lần. Không lãi kép, không nhân mỗi frame. Giữ HP ratio của quái đang sống; không hồi sinh, reset cooldown/target. Boss không dùng bảng quái thường.

Không đồng thời tăng speed, spawn và cap. Nếu local đã mạnh hơn bảng này, đừng vô tình nerf bằng cách chép bảng cũ. Ghi baseline → final và đo TTK/độ đông.

### 3.5. Tầm vũ khí tiến hóa

Nếu vũ khí được nói tới vẫn là Quasar, giảm tầm 20–25% từ baseline thật; mặc định hệ số 0,78. Ví dụ 510 u → khoảng 398 u.

Áp đúng một lần, đồng bộ target selection, hit geometry, VFX và tooltip. Chain không vượt envelope hoạt động mới của nguồn bắn; vẫn giữ giới hạn jumpRange. Không nerf Ion độc lập, damage, cooldown, góc quét hoặc level ngoài yêu cầu.

### 3.6. Boss ở 09:00 và 11:00

Nếu local chưa có yêu cầu nhiều boss, triển khai bằng data/state mỗi instance:
- Mỗi mốc spawn đúng một boss random, boss trước còn sống vẫn spawn boss sau.
- Thay lịch cũ tại cùng mốc, không spawn chồng thêm boss cũ.
- Seeded RNG, không bốc lại theo render; tránh lặp hai boss cùng loại trong một run khi pool đủ.
- State/timer/beam/fan/target/phase riêng từng boss; mọi đòn có ownerId.
- Clear boss A không xóa đòn boss B; HUD có hai hàng khi cần.
- Mọi kiểm tra “elder tức là boss” phải được rà soát khi thêm loại mới.

Thêm ba loại nếu chưa có, tái sử dụng primitive hiện hữu:
1. Gravemaw: hút có warning + vòng đạn có khe; phase 2 có nhịp đổi sang đẩy và loạt lệch, giữ khe né. Cadence khởi tạo khoảng 2,8 → 1,9 giây.
2. Helion Remnant: đánh dấu vùng nổ/phóng xạ ngắn + fan hướng tàu; phase 2 hai vùng so le và fan chia loạt, tối đa hai zone sống. Cadence khoảng 2,5 → 1,7 giây.
3. Void Harrier: dash có đường báo + fan dự đoán nhẹ; phase 2 dash hai chặng có cue riêng và loạt đạn mở rộng. Cadence khoảng 2,4 → 1,6 giây.

Mỗi boss có silhouette riêng, hai nhóm skill chính, hai phase khác cách né. Telegraph khoảng 0,9–1,2 giây theo đòn; tracking trước lock, sau lock có quy tắc rõ. Không rút warning để ép đạt cadence. Khoảng 1,5–3 giây tính giữa các lần khởi tạo skill khi sẵn sàng; không xả catch-up.

Phase1 hết HP → transition ngắn 1–1,25 giây → phase2 pool riêng khoảng 60–70% phase1 để bắt đầu tune. Không overkill xuyên phase; chỉ thưởng một lần sau phase2. Điều chỉnh HP bằng TTK, không giữ tỉ lệ nếu thực tế thành bao cát.

Mục tiêu tham chiếu: build trung bình tập trung đánh hạ boss 09:00 trong khoảng 45–80 giây; boss 11:00 khoảng 35–50 giây vì chỉ còn 60 giây trước mốc 12 phút. Đây là mục tiêu thử nghiệm, không phải bảo đảm cho mọi build.

Giữ luật kết thúc 12 phút hiện có. Không thêm điều kiện bắt buộc giết hết boss mới thắng. Boss phải có cửa sổ vào tầm các vũ khí sau nerf, không đứng ngoài tầm suốt trận.

## 4. Hiệu năng: ổn định tại thời điểm khó nhất

Đo theo từng nhóm simulation, collision/target lookup, rendering, VFX và DOM. Chỉ tối ưu nơi có chi phí thực.

Ưu tiên:
- Tái sử dụng pool/texture/graphics; không tạo asset hoặc DOM lớn mỗi frame.
- Dùng spatial query hiện có hoặc thêm khi profiler chứng minh scan/collision là bottleneck; kiểm tra không đổi kết quả hit.
- Culling, trần trail/particle/zone và giới hạn lifetime.
- Background cache/bake, chuyển động nền thưa.
- HUD cập nhật khi dữ liệu đổi; số thời gian có nhịp hiển thị riêng.
- Cleanup emitter/timer/tween/listener/owner khi đổi scene, phase, chết và restart.
- Giữ bảo toàn EXP khi merge/giới hạn pickup, không xóa EXP chỉ để giảm object.
- Không sửa deltaTime, damage hoặc wave để “làm benchmark đẹp”.

Quality:
- Giữ/hoàn thiện Thấp/Vừa/Cao, giảm chuyển động và tắt rung.
- Chất lượng Vừa thể hiện đủ art direction.
- Khi thiếu budget, giảm decoration trước. Telegraph/hitbox không được vô hình.
- Nếu không đủ budget cho một pattern, quyết định trước khi spawn và đồng bộ cue với pattern thật; không chỉ ẩn projectile phía renderer.
- Nếu auto quality, chỉ thay trình bày, có hysteresis và không ghi đè lựa chọn quality thủ công liên tục.

Mục tiêu khoảng 60 FPS trên máy kiểm tra được ghi rõ. Báo p50/p95, frame >50/100 ms, số object và môi trường. Mốc mục tiêu p95 khoảng 20 ms ở chất lượng Vừa chỉ được coi đạt khi đo được. Nếu chưa đạt, báo số thật và bottleneck còn lại.

So before/after trên cùng workload, seed, viewport, browser và thiết bị. Ghi rõ benchmark dùng GPU thật hay software rendering. Không dùng số lịch sử của build khác chứng nhận build mới.

## 5. HUD phản hồi theo mức nguy hiểm

HUD cần có ba mức: bình thường, cảnh báo, nguy cấp. Dùng state thật, threshold có hysteresis/cooldown để không nhấp nháy ở ranh giới.

### Beacon
- Bình thường gọn: HP và tiến độ nạp.
- Bị đánh: icon/viền và cue âm thanh ngắn, rate limit.
- Nguy cấp: ưu tiên chỉ hướng quay về nếu ngoài màn hình, nhãn cụ thể.
- Không tạo pulse đỏ liên tục khiến không đọc được HP.

### Tàu và Corruption
- HP thấp có dấu hiệu ngoài màu sắc, vẫn đọc được khi tắt rung/flash.
- Gần ngưỡng Corruption có cảnh báo trước.
- Qua ngưỡng ghi đúng cả lợi ích và rủi ro: ví dụ gây +20% / nhận +20% nếu core vẫn như vậy.
- Hiển thị rõ khác biệt giữa “đang có Corruption cao” và “đang bị hazard hút”.

### Hazard và boss
- Chỉ báo trạng thái ngắn gần vùng thông tin phù hợp: Đang bị hút / Đang bị đẩy / Trong vùng phóng xạ.
- Cảnh báo chính gắn vào vùng/nguồn tấn công; banner chỉ bổ sung.
- Boss telegraph ưu tiên hơn glow vũ khí thân thiện.
- Thời gian sự kiện chính xác và không chạy khi pause.

### Thông báo
- Một vùng toast thứ cấp, queue có trần và gộp thành tựu trùng.
- Không che nhân vật, Beacon, thẻ nâng cấp, nút confirm hoặc footer panel.
- Không cho screen reader đọc lại timer/HP mỗi frame.
- Animation chỉ khi trạng thái đổi, không pulse mọi panel.

## 6. Balo và tiến hóa: tóm tắt trước, chi tiết sau

Giữ toàn bộ dữ liệu hiện có nhưng sắp xếp:

1. Tổng quan: ba slot vũ khí, hai slot hỗ trợ, cấp và trạng thái.
2. Tiến hóa: recipe, đã có/thiếu gì, output và hành động.
3. Chỉ số tổng hiệu lực gọn.
4. Bảng nguồn chi tiết mở rộng: gốc/hỗ trợ/trang bị/mastery/tạm thời.

Ví dụ progress: “Đạt trần 4/5 ô · Còn Bộ tăng nhịp cấp 4/5”. Nội dung phải được tính theo state, không hardcode tên.

Recipe:
- Hiển thị nguyên liệu và cấp cần thiết bằng icon + chữ.
- Nếu chưa đủ: nói thiếu gì, không chỉ nút xám.
- Nếu đủ: CTA rõ trong vùng nhìn đầu panel.
- Xác nhận mô tả trước/sau, slot giải phóng và việc không thể tách lại.
- Cancel không đổi build; double-click/stale action không tạo hai output.
- Chỉ báo thành công sau commit; không chạy animation thành công trước state.
- Tiến hóa lúc pause không tick gameplay.
- Đóng panel trở về đúng pause/draft và giữ lựa chọn/reroll.

Giữ luật mastery đã chốt: đủ/max ba vũ khí và hai hỗ trợ mới mở; fusion làm trống slot thì phải hoàn thiện lại, giữ bonus/budget đã kiếm. Không tự rút ngắn tiến trình chỉ để UI đẹp.

Bảng chi tiết có vùng cuộn riêng, header/footer không che card cuối. Có bàn phím, focus vào hành động phù hợp và khôi phục focus khi đóng.

## 7. Màn chọn nâng cấp: hiểu trước khi chọn

Mỗi thẻ có cùng cấu trúc:
- Loại: nhận mới/tăng cấp/hỗ trợ/mastery.
- Icon + tên.
- Cấp hiện tại → cấp tiếp theo.
- Hai hoặc ba thay đổi chính trước/sau.
- Một câu ngắn về tác dụng/lối chơi.
- Nút hoặc toàn thẻ có focus rõ; phím 1/2/3 hiện ở vị trí nhất quán.

Ví dụ:
“Bộ tăng nhịp · Cấp 2 → 3”
“Bonus nhịp bắn +16% → +24%”
“Giúp duy trì hỏa lực thường xuyên hơn.”

Tất cả số lấy từ cùng calculator gameplay/preview, có xét bonus đúng nguồn. Không coi bonus rate là phần trăm giảm cooldown tương đương. Không ghi “DPS tăng X%” nếu chưa tính đúng số mục tiêu, chain, thời gian trúng và điều kiện thực.

Mở rộng “Chi tiết” nếu cần thông số kỹ thuật; không đổ cả đoạn công thức lên mặt thẻ.

Reroll:
- Hiện 1/1, tiêu đúng một lần cho draft.
- Disabled có lý do đọc được, không chỉ title khi hover.
- Không thay đổi stat hoặc tiêu lượt vì mở Balo.
- Draft full/capped có fallback hợp lệ, không ép thay vũ khí mất cấp.

Không thêm nhãn “lựa chọn tốt nhất” hoặc tự chọn thay người chơi. Nếu cần gợi ý synergy, chỉ dùng quy tắc minh bạch như “Đang dùng vũ khí này”.

## 8. Hướng dẫn theo tình huống ở lượt đầu

Thêm ba gợi ý ngắn, một lần cho mỗi tình huống:
1. Lần đầu rời vùng sáng: Corruption tăng, quay lại ánh sáng để giảm.
2. Lần đầu Beacon bị quái đánh: giải thích dấu quái nhắm Beacon và việc cần quay lại.
3. Lần đầu đủ recipe tiến hóa: chỉ nút Balo và thao tác tiến hóa.

Mỗi gợi ý khoảng một hoặc hai câu, không quá ba dòng trên viewport mục tiêu. Không chồng lên boss telegraph, cảnh báo nguy cấp hoặc modal nâng cấp. Nếu đang nguy hiểm thì hoãn, không mất vĩnh viễn chỉ vì trigger đã xảy ra.

Mặc định không dừng trận bằng modal. Có thể bỏ qua; trong Cài đặt có “Xem lại hướng dẫn” hoặc reset riêng cờ hướng dẫn. Không reset thành tựu/tiền để xem lại.

Lưu cờ tutorial theo profile với default an toàn. Save cũ load được; chỉ đánh dấu seen khi gợi ý thật sự hiển thị. Nếu người chơi đã tắt tutorial, tôn trọng lựa chọn.

Giữ màn Hướng dẫn đầy đủ để tham khảo, nhưng người mới không cần đọc hết trước khi Khởi hành.

## 9. Màn tổng kết giúp hiểu kết quả

Giữ các số hiện có và thêm hai lớp:

### Tổng quan luôn hiện
- Thắng/thua, lý do chính xác: tàu hay Beacon bị phá hủy; nếu sống đủ thời gian, nói rõ Beacon hoàn tất.
- Thời gian, cấp, quái diệt và Stardust tinh khiết đã nhận.
- Build cuối trận: vũ khí/tiến hóa và hai hỗ trợ.
- Một thành tựu vừa đạt hoặc một mục tiêu gần hoàn thành, dùng dữ liệu thật.
- Hai CTA rõ: Chơi lại / Về sảnh.

### Chi tiết mở rộng
- Damage nhận theo nguồn cho tàu và Beacon.
- Damage gây theo vũ khí nếu thu thập đúng nguồn.
- Thời gian trong hazard, Corruption cao và khoảng cách Beacon khi cần diễn giải.
- Ghi nhãn định nghĩa để không hiểu nhầm tổng damage là DPS.

Thu thập số liệu gọn:
- Tại nơi áp damage thật sau armor/miễn nhiễm, ghi actual HP loss, clamp overkill; không lấy damage raw của projectile.
- Phân biệt loại boss/owner, projectile, contact và môi trường, tránh ghi hai lần.
- Ghi fatal source khi đòn làm hết HP, không lấy một lastHit tùy ý nhiều giây trước.
- Nếu tàu và Beacon cùng chết một tick, theo ưu tiên outcome core và ghi nhận tình huống, không bịa nguyên nhân duy nhất.
- Snapshot build và report trước cleanup arrays cuối run.
- Freeze report sau kết thúc; mở lại màn kết quả không settle reward lần nữa.
- Dùng counters/tổng thời gian hoặc buffer hữu hạn; không log mọi frame hoặc ghi localStorage mỗi hit.
- Không cần lưu toàn bộ lịch sử trận để làm tính năng này.

Gợi ý sau trận chỉ dùng quy tắc có bằng chứng và tối đa một gợi ý:
- Ví dụ nếu damage Beacon khi tàu ở xa chiếm phần lớn damage của nó: “Beacon thường bị tấn công khi tàu ở xa.”
- Không nói “thua vì build yếu” chỉ từ một chỉ số hoặc bịa chiến thuật tối ưu.
- Nếu chưa có dữ liệu đủ tin cậy, không hiển thị nhận xét đó.

Không tự bổ sung buff/reward vì thua hoặc mua nâng cấp từ màn kết quả nếu kinh tế chưa có luật.

## 10. Tiêu chuẩn UI, hình ảnh và chuyển động

- Một bộ token màu/font/spacing/radius/timing thống nhất cho menu, HUD, panel và kết quả.
- Dùng font local có đủ dấu tiếng Việt, kiểm tra “Tiến hóa”, “Đã tối đa”, “Stardust tinh khiết”, “Tỷ lệ chí mạng”.
- Không lạm dụng uppercase/letter-spacing ở body text.
- Giữ sao nền khác EXP, drop trang bị khác sao.
- Giữ nền vũ trụ có chiều sâu nhưng giảm chi tiết dưới thông tin chiến đấu.
- Hover/focus khoảng 100–160 ms; panel khoảng 160–240 ms là điểm khởi đầu.
- Hủy/reuse tween khi đóng/mở nhanh, không tăng hàng đợi animation.
- Không thêm quán tính gameplay hoặc độ trễ input khi smooth sprite.
- Screen shake/flash có thể giảm/tắt; ưu tiên setting đã có trước khi tạo setting trùng.
- Không thêm library animation lớn chỉ để làm vài transition.

Kiểm tra 1280×720, 1366×768, 1920×1080; thêm viewport thấp tương đương zoom125% và menu hẹp khoảng390px. Nếu chưa hỗ trợ chơi cảm ứng, không cam kết mobile gameplay; ít nhất menu không vỡ và thông báo giới hạn rõ.

Modal không tràn, focus không đi ra gameplay phía sau, hover không phải cách duy nhất đọc lý do disabled. Phím tắt không xung đột trong panel hoặc kích hoạt hành động phía sau modal.

## 11. Những luật phải giữ và phần để sau

Giữ nguyên:
- Thời lượng, thắng/thua, Corruption, slot/reroll, recipe/mastery theo core hiện hành, trừ các thay đổi được chỉ rõ ở mục3.
- Save/career/Core/Echo/achievement và reward một lần.
- Simulation clock khi pause/blur/level-up; tự quay lại tab không chạy tiếp đột ngột.
- GitHub Pages base và asset local. Không hardcode /assets làm mất font khi deploy.
- Không đổi cân bằng ngoài mục3 để ép bot thắng hoặc che vấn đề performance.

“Tín hiệu cứu hộ” là đề xuất cho bản sau, chưa triển khai trong bản này. Chỉ ghi backlog: một mục tiêu tùy chọn ngoài vùng sáng, dùng tài nguyên hiện có, có thời hạn và không trở thành nhiệm vụ bắt buộc. Không thêm map/phi thuyền/vũ khí/tiền mới để mở rộng scope lần này.

## 12. Kiểm tra và điều kiện hoàn thành

Chạy typecheck/test/build thích hợp đang có. Viết regression có ý nghĩa cho logic thay đổi, không viết test chỉ để mirror CSS.

| Nhóm | Kiểm tra bắt buộc |
| --- | --- |
| Sảnh/UI | Cung tròn được truy nguồn; Stardust đồng nhất; font/số lớn/viewport đúng |
| HUD | Trạng thái nguy hiểm đúng state; toast không che CTA/telegraph; ngưỡng không rung liên tục |
| Build/draft | Progress5slot, preview khớp gameplay, stale/double click/cancel, reroll và pause giữ đúng |
| Tutorial | Trigger một lần, hoãn khi nguy hiểm, skip/replay, save cũ không mất dữ liệu |
| Kết quả | Damage actual không double count, fatal source đúng, snapshot trước cleanup, reward một lần |
| Hazard | Biên/hướng/VFX đúng lực; warning không hit; timer pause; kết thúc không còn hiệu lực |
| Boss | Spawn đúng540/660; hai boss độc lập; phase/reward/owner cleanup đúng |
| Cân bằng | Quái theo phút không lãi kép; range nerf thật cảhit/VFX/chain; TTK có số đo |
| Lifecycle | Restart tối thiểu5lần, open-close panel20lần; không tăng listener/timer/object vô hạn |
| Production | Preview tại base triển khai đúng, không asset404 hoặc debug hook lộ ngoài ý muốn |

Playtest:
- Ít nhất một lượt đủ12phút render thật nếu môi trường cho phép.
- So cùng seed ở build công/thủ/cơ động, có/không tiến hóa; phân biệt bot với người chơi.
- Thử cảnh đông quái + hai boss + hazard, qualityThấp/Vừa và reduced motion.
- Nếu chưa thể đo GPU, âm thanh, input latency hoặc chơi tay, ghi rõ; không suy từ screenshot/test logic.

Điều kiện “xong”:
1. Bản chạy local hoàn chỉnh cho các mục bắt buộc.
2. Không mất dữ liệu cũ hoặc hồi quy luật nâng cấp/tiến hóa.
3. Có ảnh trước/sau cùng viewport cho sảnh/HUD/Balo/draft/kết quả và clip ngắn cho chuyển động nếu có công cụ.
4. Có kết quả build/tests, benchmark before/after và giới hạn còn lại.
5. Tài liệu cập nhật phản ánh hành vi thật, không đánh dấu roadmap là đã làm.

## 13. Cách tổ chức và bàn giao

Chia code theo trách nhiệm, tận dụng hệ thống hiện có:
- Gameplay state và calculator dùng chung.
- Presentation trạng thái cảnh báo.
- Notification/tutorial có queue và cleanup rõ.
- Metrics/report của run.
- UI component/token dùng lại.

Không biến GameUI thành nơi tính damage, tiến hóa hoặc cân bằng. Không dựng một framework mới để thay vài panel. Comment các quyết định dễ gây hồi quy: clocks, ownership, snapshot-before-cleanup, source damage, forcecap, scaling và source-of-truth preview.

Cập nhật GAME_SPEC, acceptance, balance/performance/status và CHANGELOG theo cấu trúc project. Giữ báo cáo lịch sử; benchmark mới phải ghi build/môi trường riêng. Đồng bộ nhãn phiên bản giữa package/menu/README theo convention đã có, không tự nâng major.

Làm theo các chặng nhỏ: baseline → sửa phần còn thiếu → performance → HUD/build/draft → tutorial/results → regression và bàn giao. Không dừng giữa chặng để hỏi có tiếp tục phần đã được yêu cầu hay không.

Báo cáo cuối bằng tiếng Việt:
- Thay đổi người chơi nhìn/cảm nhận được.
- File quan trọng và nơi chỉnh token, warning, tutorial, report và balance.
- Mục nào đã có từ trước, mục nào vừa sửa/thêm.
- Tests/benchmark đã chạy cùng số thật.
- Ảnh/clip và lệnh chạy local.
- Hạn chế hoặc phần chưa kiểm chứng.

Không gọi “cân bằng hoàn toàn”, “fix triệt để” hoặc “mượt mọi máy” khi chưa có bằng chứng tương ứng.

