# Playtest cân bằng 1.3 · 2026-10-17

Giữ base enemy 1.2, Core, thời lượng 720 giây, spawn/XP/contact cap và boss 6000 + 3900 HP. Trần hỗ trợ damage/rate 40%, HP/nhặt 50%, speed 25%, armor 20%. Thay curve cũ bằng scaling tuyến tính theo phút, không chồng curve hoặc tăng speed. Năm stat trang bị là nguồn riêng, tổng 2.000 bp.

Drop rate đề xuất được giữ sau khảo sát: 18 lượt đều đạt cap ở khoảng 400–572 giây, không chạm cap pickup, cả ba nhóm hỗ trợ có thể thắng. Chưa có bằng chứng cần tăng drop hoặc giảm ngân sách; vẫn cần playtest người thật.

## Quy trình và tuning

Baseline 1.2: typecheck/build, 59 unit và 22 e2e pass trước sửa. Bot trên cùng seed 42/core 0: adaptive thắng 720 giây/cấp 33/1004 kills/HP tàu 150/Beacon 293,1; đứng Beacon thua ở 232,27 giây, đi rìa thua ở 38,8 giây. Bot không đại diện người mới hoặc cảm giác chơi tay.

18 lượt tự nhiên dùng seed 7/42/104, ba cặp hỗ trợ, hai ưu tiên loadout; draft/reroll/swap/input/drop thật. Không grant HP, thời gian, XP, gear hoặc module. Kết quả cuối 13 ca thắng; nhóm tốc độ/nhặt còn bốn ca thua, nhóm damage/rate một ca thua. Đây là quan sát trên các seed/build này, không phải win-rate tổng quát. JSON giữ checkpoint, stats, HP, XP, drop, gear, first hit và boss.

Ion ban đầu có damage 28/39/52/67/84, falloff 0,8; clear fixture 20 quái mất 19,82 giây, so với Plasma 3,60 và Pulsar 2,47 giây. Tăng damage cấp 2–5 lên 42/60/84/112, falloff cấp 3–5 lên 0,82/0,84/0,85. Ion cuối clear trong 14,42 giây, vẫn chậm ở đàn tròn; với năm quái HP 10.000 cách nhau 200u, gây 2.492 damage/10 giây tới cả năm, so với Plasma 1.722 tới một và Pulsar 1.584 tới hai. Giữ vai trò chuyền xa, không tăng jump vô hạn hoặc buff vượt mọi tình huống. Source bản thử và các iteration được giữ tại `artifacts/v13`.

Fixture boss đầu đặt trong lõi, bị đẩy ra ngoài tầm: không dùng kết quả 600 giây không hit đó làm TTK. Đã sửa vị trí tàu 500/boss 700u; mục tiêu đứng yên, không wave, tàu được bảo vệ để cô lập damage. Không hỗ trợ/gear. Boss vẫn có transition/hai phase. TTK Plasma5 khoảng 59,78 giây, Pulsar5 142,65, Ion5 158,42. Đây không phải encounter tự nhiên; build phối hợp và boss di chuyển có kết quả khác. Không tăng HP boss hoặc bắt buộc hạ boss để thắng.

## Bảng phút thực thi

| Loại | Base HP / damage | Phút 0 | Phút 1 | Phút 5 | Phút 11 |
|---|---|---|---|---|---|
| Wisp | 28 / 6 | 28 / 6 | 29,4 / 6,3 | 35 / 7,5 | 43,4 / 9,3 |
| Drifter | 140 / 11 | 140 / 11 | 151,2 / 11,77 | 196 / 14,85 | 263,2 / 19,47 |
| Leech | 44 / 7 | 44 / 7 | 48,4 / 7,56 | 66 / 9,8 | 92,4 / 13,16 |

Phút 12 không tăng thêm. Speed giữ 70/40/112u/s, contact cooldown giữ nguyên. Quái sống giữ tỷ lệ HP tại event, không hồi đầy. Pipeline cộng hỗ trợ/trang bị, bảng module và drop đầy đủ tại [balance](balance.md). Integer bp tránh trôi trần; không có loot giáp. Core chỉ tăng HP Beacon.

<!-- BALANCE13_START -->
| Seed | Ưu tiên module | Hỗ trợ | Kết quả / giây | Cấp / kill | HP tàu / Beacon | Drop / nhặt / bp | Cap lúc / capHits | Phase2 / final từ 540s |
|---|---|---|---|---|---|---|---|---|
|7|plasma+drones+well|power+haste|victory / 720|34 / 1001|102,5 / 282,6|31 / 28 / 2000|512,53 / 0|77,88 / 94,67|
|7|plasma+pulsar+ion|power+haste|victory / 720|33 / 1001|106 / 300|45 / 26 / 2000|548,22 / 0|46,35 / 73,53|
|7|plasma+drones+well|hull+armor|victory / 720|33 / 993|92,73 / 197,7|31 / 25 / 2000|442,6 / 0|131,8 / 149,33|
|7|plasma+pulsar+ion|hull+armor|victory / 720|33 / 1003|153,5 / 300|40 / 27 / 2000|483,07 / 0|88,35 / 118,58|
|7|plasma+drones+well|engine+magnet|defeat / 689,57|32 / 939|-6,65 / 226,6|27 / 25 / 2000|400 / 0|65,02 / —|
|7|plasma+pulsar+ion|engine+magnet|victory / 720|32 / 993|14,8 / 282,3|34 / 27 / 2000|432,52 / 0|68,78 / —|
|42|plasma+drones+well|power+haste|defeat / 612,43|28 / 810|-0,67 / 300|32 / 24 / 2000|512,33 / 0|31,68 / —|
|42|plasma+pulsar+ion|power+haste|victory / 720|34 / 1006|101,5 / 300|36 / 27 / 2000|456,03 / 0|30,38 / 39,28|
|42|plasma+drones+well|hull+armor|victory / 720|32 / 989|123,4 / 300|33 / 24 / 2000|455,75 / 0|151,87 / —|
|42|plasma+pulsar+ion|hull+armor|victory / 720|33 / 1002|139,76 / 300|33 / 27 / 2000|430,25 / 0|81,37 / 116,47|
|42|plasma+drones+well|engine+magnet|victory / 720|33 / 993|51,67 / 262,53|37 / 27 / 2000|452,95 / 0|— / —|
|42|plasma+pulsar+ion|engine+magnet|defeat / 635,43|30 / 844|-4,63 / 300|27 / 24 / 2000|448,22 / 0|60,62 / —|
|104|plasma+drones+well|power+haste|victory / 720|33 / 1000|106 / 300|37 / 28 / 2000|474,83 / 0|27,73 / 35,77|
|104|plasma+pulsar+ion|power+haste|victory / 720|33 / 1001|105,5 / 300|43 / 26 / 2000|572,18 / 0|39,42 / 46,78|
|104|plasma+drones+well|hull+armor|victory / 720|33 / 996|49,16 / 300|40 / 30 / 2000|496,02 / 0|118,03 / —|
|104|plasma+pulsar+ion|hull+armor|victory / 720|33 / 997|145,19 / 300|28 / 25 / 2000|405 / 0|71,72 / 120,6|
|104|plasma+drones+well|engine+magnet|defeat / 686,27|32 / 935|-6,25 / 41,9|33 / 26 / 2000|572,43 / 0|65,13 / —|
|104|plasma+pulsar+ion|engine+magnet|defeat / 644,13|29 / 865|-11,23 / 300|36 / 27 / 2000|509,62 / 0|67,92 / —|

13/18 ca bot thắng; không suy tỷ lệ thắng người chơi. Cap trang bị ở 400–572,43 giây; max capHits=0. Tất cả core0/HP100/Beacon300/Plasma1, không grant XP/gear/support/module; lựa chọn qua draft/reroll/swap thật. Ưu tiên loadout không bảo đảm mỗi thẻ đúng ý, cuối run có thể đổi ô vì pool thật. Dấu — là chưa hạ boss/chưa chuyển phase trước kết thúc. Checkpoint 180/360/540/720, stats/drop/HP/XP chi tiết trong JSON.

| Fixture | Module / cấp | Phút / HP mục tiêu | TTK / complete | Damage 10s / targets hit (line) |
|---|---|---|---|---|
|single-drifter|plasma / 1|0 / 140|5,27 / true|—|
|single-drifter|drones / 1|0 / 140|13,98 / true|—|
|single-drifter|well / 1|0 / 140|20,03 / true|—|
|single-drifter|pulsar / 1|0 / 140|9,77 / true|—|
|single-drifter|ion / 1|0 / 140|11,22 / true|—|
|single-drifter|plasma / 3|5 / 196|2,88 / true|—|
|single-drifter|drones / 3|5 / 196|6,12 / true|—|
|single-drifter|well / 3|5 / 196|12,63 / true|—|
|single-drifter|pulsar / 3|5 / 196|5,35 / true|—|
|single-drifter|ion / 3|5 / 196|6,92 / true|—|
|single-drifter|plasma / 5|11 / 263,2|1,58 / true|—|
|single-drifter|drones / 5|11 / 263,2|3,05 / true|—|
|single-drifter|well / 5|11 / 263,2|6,83 / true|—|
|single-drifter|pulsar / 5|11 / 263,2|2,05 / true|—|
|single-drifter|ion / 5|11 / 263,2|3,62 / true|—|
|cluster|plasma / 5|— / —|3,6 / true|—|
|line|plasma / 5|— / —|10 / false|1.722 / 1|
|boss|plasma / 5|— / —|59,78 / true|—|
|cluster|pulsar / 5|— / —|2,47 / true|—|
|line|pulsar / 5|— / —|10 / false|1.584 / 2|
|boss|pulsar / 5|— / —|142,65 / true|—|
|cluster|ion / 5|— / —|14,42 / true|—|
|line|ion / 5|— / —|10 / false|2.492,2 / 5|
|boss|ion / 5|— / —|158,42 / true|—|

<!-- BALANCE13_END -->

Dòng line là phép đo damage trong10giây trên mục tiêuHP10.000, không yêu cầu giết hết: complete=false ở dòng này là kỳ vọng, không phải lỗi. Các fixture cluster/boss có mục tiêu kết thúc và đã complete=true.

## Giới hạn

Bot phản ứng mỗi tick và biết mục tiêu/telegraph. Loadout là ưu tiên, có thể gặp thẻ khác; late swap làm yếu ô theo đúng luật. Fixture TTK mục tiêu tĩnh tắt damage/wave/XP để cô lập, không chứng minh thắng với HP chuẩn. Chưa playtest người thật, cảm giác điều khiển, audio hoặc GPU vật lý. Frame-time và lượt render theo clock thường được báo riêng trong [performance-report](performance-report.md).
