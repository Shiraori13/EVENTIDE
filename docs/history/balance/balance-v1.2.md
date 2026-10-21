# Playtest cân bằng1.2 · 2026-10-16

Các lượt dưới là simulation tăng tốc dùng đúng systems, input mỗi step và seed được ghi; không phải chơi tay hoặc bằng chứng FPS. Mục tiêu: ba cặp support có đường thắng, vẫn phải giữ Beacon, boss không là điều kiện thắng. Không suy win rate từ mẫu nhỏ.

Audit1.1 không thấy HP bị nhân theo frame, contact/drone cooldown sai FPS hoặc collider gây damage lặp. Wisp22HP bị Plasma23 hạ một phát; Drifter105HP so với Supernova82 rất ít bền cuối màn. Beam1.1 lưu origin lúc warning và khóa hướng ngay, khiến boss đi xa nguồn phát; đã sửa geometry/aim thay vì bù bằng damage.

Lần khởi đầu: power/rate10%×5=50%, boss phase1HP4200/phase2=65%. Bot cũ không đọc windup mới, không chủ động đánh boss; nhiều ca thua sau540s, chỉ phòng thủ sống được vài ca. Sau khi bot biết strafe telegraph và tiếp cận boss bằng input thật, các cặp đều có ca thắng nhưng offensive có encounter37–48s, defense95–119s. Bot mới áp dụng cả đối chứng1.1; không so HP cuối của bot cũ với bot mới rồi gọi là thay đổi cân bằng.

Chỉnh thử: power/rate8%×5=40% (DPS lý thuyết1.96 thay vì2.25), HP4500. Đường bay/RNG draft làm TTK full-run không đơn điệu: offensive21–40s, defense96–100s hoặc boss còn sống. Preset giữa màn cô lập ở HP4500 chỉ47/59/62s, thấp hơn mục tiêu tham chiếu60–110s. Chốt HP6000 để preset giữa đạt61–80s; phase2=3900HP. Không tăng cap/spawn để làm nặng browser. Raw từng lần ở artifacts/v12/balance-attempts; các lần đầu chưa có config snapshot trong mỗi row, thông số được ghi tại đoạn này.

Full-run không ép mọi build có cùng TTK: burst tối đa có thể nhanh hơn60s, phòng thủ có thể hơn110s hoặc vẫn thắng theo charge khi boss chưa chết. Đây là khoảng cần tiếp tục playtest người thật, không khẳng định đã cân bằng phổ quát. Với cấu hình cuối, cả ba nhóm đã có ca thắng qua draft thật; không chỉ damage+rate dùng được. Một số ca cơ động vẫn thua trong phase2.

<!-- BALANCE_START -->
| Seed | Hỗ trợ qua draft thật | Kết quả / giây | Cấp / kills | HP tàu / Beacon cuối | Chuyển phase2 / boss chết (từ540s) | Hit tàu / Beacon đầu tiên |
|---|---|---|---|---|---|---|
|7|power+haste|victory/720|33/1009|100/300|35.38/50.17|553.62/—|
|7|hull+armor|victory/720|34/999|114.19/265.04|87.43/148.4|551.6/609.35|
|7|engine+magnet|defeat/664.3|31/899|-3.45/300|66.98/—|558.35/—|
|42|power+haste|victory/720|34/1005|100/300|17.88/37.9|549.18/—|
|42|hull+armor|victory/720|33/1004|150/293.1|85.57/128.32|552.4/562.75|
|42|engine+magnet|victory/720|33/1001|16.16/245.99|58.65/—|545.13/630.05|
|104|power+haste|defeat/618.33|27/818|-4/300|37.03/—|544.07/—|
|104|hull+armor|victory/720|32/1001|93.7/300|115.15/—|553.72/—|
|104|engine+magnet|defeat/640.6|30/853|-1.45/300|83.95/—|553.68/—|

Không suy tỷ lệ thắng dân số từ9 lượt bot. Dấu — ở boss nghĩa chưa hạ trước kết thúc/thua, không suy boss chết theo timer. Tất cả run bắt đầu core0, HP100/Beacon300/Plasma1, không grant support/module; có dùng reroll thật. Các snapshot180/360/540/720 và level/module/support cụ thể nằm trong balance-playtest.json.

TTK mục tiêu đơn (khoảng cách350u, enemy tiến lại, trong vùng sáng, không support, cùng module base; damage mục tiêu tắt để cô lập TTK):

| Time spawn / quái | HP1.1→1.2 | TTK1.1→1.2 (s) |
|---|---|---|
|0/wisp|22→28|0.65→1.4|
|0/drifter|105→140|3.85→5.417|
|0/leech|36→44|1.317→1.317|
|360/wisp|22→36.4|0.667→0.667|
|360/drifter|105→182|2→2.65|
|360/leech|36→57.2|0.65→1.333|
|660/wisp|22→43.4|0.617→0.617|
|660/drifter|105→217|1.083→1.567|
|660/leech|36→68.2|0.6→0.6|

Module preset: t0 Plasma1; t360 Plasma3/Drones2/Well1; t660 cả ba cấp5. Đây là fixture công thức/tiếp cận, không gọi là lên cấp tự nhiên.

Boss giữa màn riêng: Plasma3/Drones3/Well3, support cặp cấp2, không wave/pickup, bot di chuyển/né thật; HP tàu/Beacon100000 chỉ để đo TTK, không chứng minh thắng với HP chuẩn.

| Cặp | Encounter hai phase (s) | Phase2 / final death (simulation time, bắt đầu300s) |
|---|---|---|
|offense|61.17|338.75/361.17|
|defense|80.23|350.02/380.23|
|mobility|80.23|350.28/380.23|

<!-- BALANCE_END -->

Giới hạn: bot phản ứng mỗi tick, cố định ưu tiên module rồi hai hỗ trợ, dùng reroll khi cần; không đại diện người mới. Preset TTK tắt damage mục tiêu/cho HP lớn có ghi rõ, không dùng làm bằng chứng thắng. Một lượt render720s và frame pacing ghi riêng ở performance-report. Chưa có playtest người thật/đánh giá cảm giác né hoặc tỷ lệ thắng đáng tin cậy.
