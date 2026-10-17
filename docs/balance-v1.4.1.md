# Playtest hotfix beta1.4.1 · 2026-10-17

Sáu lượt tăng tốc fixed60Hz, seed7/42/104 × có/không fusion, bot ưu tiên Hull/Armor/Plasma/Pulsar/Ion. Chọn draft/reroll, nhặt XP/salvage và fusion thật; không cấp HP/XP/time. Đây là thử nghiệm bot, không phải chơi tay hay tỷ lệ thắng người thật. Không thay bất kỳ số config vũ khí/boss/event nào trong hotfix. Raw: artifacts/v141/natural-playtest.json; mỗi draft ghi modules/supports/budget để kiểm tra thời điểm mastery.

| Seed | Fusion | 1.4 lịch sử | 1.4.1 | Mastery mở trước → sau (s) | Cấp/kills sau | HP tàu/Beacon sau |
|---|---|---|---|---|---|---|
| 7 | Không | defeat/685,97 | victory/720 | 295,55 → 527,28 | 31/999 | 16,46/291,3 |
| 7 | Có | victory/720 | victory/720 | 295,55 → 622,13 | 35/999 | 159/300 |
| 42 | Không | defeat/688,9 | victory/720 | 286,53 → 518,73 | 34/1003 | 101,32/300 |
| 42 | Có | defeat/593,6 | victory/720 | 286,53 → 643,75 | 34/1007 | 158/300 |
| 104 | Không | victory/720 | victory/720 | 272,62 → 526,92 | 34/1004 | 155,5/300 |
| 104 | Có | victory/720 | victory/720 | 272,62 → 650,48 | 33/1007 | 155/256,5 |

Cả6ca hotfix thắng720s/+17, hỗ trợ Hull5/Armor5. Khôngfusion có3vũ khí5; fusion lấp ô mới bằng Well5. Mastery tới muộn hơn vì cần cả hỗ trợ và ô mới: khôngfusion khoảng519–527s, fusion622–650s. Tất cả draft mastery chỉ ở build đủ/max5ô; XPcreated=collected+ground và ngân sách≤2000bp. Không so bit-identical toàn trận vì eligibility/RNG/draft mới thay diễn biến. Kết quả cặp Hull/Armor lịch sử3/6thắng không đại diện cả18ca cũ hoặc xác suất người thật.

Chiến thuật riêng artifacts/v141/strategies.json (Plasma/Drones/Well, seed42): đứngBeacon thua570,75s, đi rìa38,817s, adaptive thua718,733s. Bộ test cũ mặc định adaptive luôn thắng đã không còn phù hợp luật tiến triển mới; giữ ghi nhận thất bại và kiểm tra settled/reward/điều kiện cuối trận, không sửa thông số để ép thắng.

Fixture browser: power5 + haste1, salvageDamage10%, masteryDamage18% đã kiếm, Corruption≥50 và chaos ×1,15. Sau click fusion khi pause, nút resume thật chạy clock/combat: một Quasar hit=220×(1+0,4+0,1+0,18)×1,2×1,15=510,048HP; không Pulsar/Ion hit mới. Ba viewport kiểm tra cùng kết quả. Đây là fixture kiểm tra nguồn chỉ số, không playtest cân bằng tự nhiên. Plasma5/Drones5/Well5 có unit behavior damage/radius thật cùng nguồn bonus, giữ tiến hóa tự động.

Chưa đánh giá tay đủ12phút, nhiều kiểu build khác, cảm giác né/đọc VFX hoặc win-rate. Không chỉnh balance thêm trong hotfix; cần người chơi đánh giá luật mới.
