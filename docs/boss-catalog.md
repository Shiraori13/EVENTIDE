# Boss hiện hành

Config: src/game/config/bosses.ts và balance.ts; scheduler/primitive/lifecycle: systems/bosses. Pool seeded không lặp, warning537/657, spawn540/660 kể cả boss cũ sống. Silhouette CC0: Elder sao hồng; Gravemaw hai hàm tím/lõi lệch; Helion sao vỡ cam; Harrier thân dài/cánh rách cyan tối.

| Boss | HP phase1 mốc540 | HP mốc660 | Speed | Contact | Nhịp khởi tạo phase1/2 |
|---|---:|---:|---:|---:|---|
|Elder Star|10000|8000|32|15,4|2,8 / 1,9s|
|Gravemaw|9800|7840|42|15|2,8 / 1,9s|
|Helion Remnant|9200|7360|38|14|2,5 / 1,7s|
|Void Harrier|9000|7200|65|16|2,4 / 1,6s|

Phase1 cạn → transition1,25s miễn hit/contact, dọn đúng owner → phase2 HP65% phase1 đã scale, speed×1,18/damage×1,08. Overkill không xuyên; final mới kill/120XP/roll gear một lần. Đủ720s vẫn thắng nếu boss còn sống. Cadence là lúc khởi tạo nếu rảnh; đòn dài xong+recovery0,3s trước skill sau, không xả catch-up.

| Đòn | Phase1 | Phase2 và cách né |
|---|---|---|
|Elder ring / beam|Ring15bỏ3; beam warn1,8s/active0,5s/halfwidth25u, lock0,25s cuối|Ring18bỏ4×2; beam27,5→29,7 damage. Nguồn theo boss, góc giữ sau lock; né ngang/khe|
|Gravemaw Maw / Broken Orbit|Maw r200/force120, warn1,1s/active2s; Maw/ring/Maw|Maw đẩy báo bằng arrow; ring hai loạt. Né chéo ra biên; lực cap chung không khóa input|
|Helion Scar / Corona Fan|Scar r135, warn1,1s, burst12+DPS5/2,2s; fan7bỏgiữa/warn1s|Hai Scar so le0,45s/max2owner; fan9bỏgiữa×2. Không phủ lõi Beacon, đi vòng không quay về vệt cũ|
|Harrier Dash / Hunting Fan|Dash warn0,95s/lock0,25s cuối/280u trong0,45s; fan dự đoán≤80u|Hai dash, mỗi chặng warning riêng/ngắt0,35s; fan rộng/hai loạt. Né ngang sau lock; swept relative contact và tránh Beacon|

Ring/fan phase2 hai loạt cách0,65s, lệch0,08rad, telegraph hiện cả hai; giao khe vẫn mở. Đạn110u/s/TTL10/damage13,2 (phase2×1,08), snapshot muzzle30u và hướng khi rời nòng. Chuyển phase/death/restart không đòn ma.

Mỗi ID giữ readyAt/phase/attack/aim/beam/zone riêng, không run-global timer. Reservation trước telegraph, tổng projectile160/chừa12 cho tàu. Thiếu budget hoãn0,2s; không báo giả/drop viên. Zone toàn run≤6/owner≤2; Solar không đổi lịch radiation. Dọn A không dọn B, result/restart thu hồi toàn bộ. Slot boss ngoài110quái, không minute scaling/%HP radiation; lực35% trước cap155.

Spawn thử18điểm cách tàu480u/tâm≥680u, tách boss sống; fallback đối diện850u. Contact chờ3s, grace1,2s, skill đầu sau3s/boss sau lệch0,4s. AI giữ standoff260u để có cửa đánh Quasar398. Mục tiêu TTK45–80s/35–50s là tiêu chí playtest, không bảo đảm mọi build. Số thực/outlier/giới hạn ở [báo cáo](ui-hazards-multiboss-report.md).
