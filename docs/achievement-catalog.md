# Thành tựu EVENTIDE 1.3

Có đúng 28 mục, badge-only. Giữ năm stable ID từ 1.2. Cột metric là nguồn credit thật; best/giây/budget theo một run, counter tích lũy qua ProfileService. Giá trị mới bắt đầu từ 1.3 nếu save cũ thiếu dữ liệu; không suy từ Echo/tiền. Core/career cũ được đánh giá từ dữ liệu thật, load không toast.

| Mã | Stable ID | Tên | Metric / ngưỡng | Điều kiện |
|---|---|---|---|---|
|A01|kills-100|Tia sáng đầu tiên|careerKills / 100|Tiêu diệt 100 Hollowborn trong hồ sơ.|
|A02|kills-500|Người giữ quỹ đạo|careerKills / 500|Tiêu diệt 500 Hollowborn trong hồ sơ.|
|A03|kills-1000|Lá chắn ngân hà|careerKills / 1000|Tiêu diệt 1.000 Hollowborn trong hồ sơ.|
|A04|kills-2500|Bình minh xa|careerKills / 2500|Tiêu diệt 2.500 Hollowborn trong hồ sơ.|
|A05|kills-5000|Ánh sáng bất diệt|careerKills / 5000|Tiêu diệt 5.000 Hollowborn trong hồ sơ.|
|A06|drifters-50|Dọn đường phế tích|drifterKills / 50|Tiêu diệt tổng cộng 50 Hollow Drifters.|
|A07|leeches-50|Cắt đuôi ký sinh|leechKills / 50|Tiêu diệt tổng cộng 50 Void Leeches.|
|A08|run-kills-250|Một mình chống bầy|bestKills / 250|Tiêu diệt 250 quái trong một lượt.|
|A09|survive-180|Qua vùng tối|survival / 180|Sống 3 phút trong một lượt.|
|A10|survive-360|Giữ vững tín hiệu|survival / 360|Sống 6 phút trong một lượt.|
|A11|survive-600|Trước giờ bình minh|survival / 600|Sống 10 phút trong một lượt.|
|A12|victory-1|Thắp lại vì sao|wins / 1|Hoàn thành một chiến thắng.|
|A13|victory-5|Người giữ năm ngọn sáng|wins / 5|Hoàn thành 5 chiến thắng.|
|A14|beacon-healthy|Hải đăng nguyên vẹn|healthyBeaconWins / 1|Thắng với Beacon còn ít nhất 75% HP.|
|A15|ship-healthy|Trở về bình an|healthyShipWins / 1|Thắng với tàu còn ít nhất 50% HP.|
|A16|mini-sun|Mặt trời bỏ túi|miniSun / 1|Đạt Plasma cấp 3: Mini Sun.|
|A17|supernova|Bùng nổ siêu tân tinh|supernova / 1|Đạt Plasma cấp 5: Supernova.|
|A18|pulsar-hit|Nhịp đập Pulsar|pulsarHits / 1|Gây sát thương bằng Pulsar Beam.|
|A19|ion-hit|Sấm giữa hư không|ionHits / 1|Gây sát thương bằng Ion Storm.|
|A20|elder-final|Kẻ hạ sao chết|bossKills / 1|Hạ một boss sau giai đoạn 2.|
|A21|elder-phase2|Đối mặt cơn thịnh nộ|bossPhase2 / 1|Đưa một boss vào giai đoạn 2.|
|A22|core-1|Gia cố nguồn sáng|coreLevel / 1|Nâng Beacon Core lên cấp 1.|
|A23|core-max|Lõi sáng hoàn thiện|coreLevel / 3|Hoàn thiện Beacon Core.|
|A24|salvage-1|Công nghệ nhặt lại|salvageCollected / 1|Nhặt một mảnh trang bị và nhận bonus.|
|A25|salvage-1000|Phi thuyền cải tiến|salvageBudgetBP / 1000|Đạt 10% tổng bonus trang bị trong một lượt.|
|A26|salvage-2000|Tận dụng từng mảnh|salvageBudgetBP / 2000|Đạt trần 20% tổng bonus trang bị trong một lượt.|
|A27|corruption-30|Bước cùng Hư Vô|corruptionSeconds / 30|Giữ Corruption từ 50 liên tục 30 giây.|
|A28|light-healing-50|Hồi sinh trong ánh sáng|lightHealing / 50|Hồi thực tế tổng cộng 50 HP từ vùng sáng.|

Runtime definitions ở src/game/config/achievements.ts. Kills từ final death; phase1 chỉ credit phase2, không kill/loot. Actual heal chỉ HP tăng từ vùng sáng, không overheal hoặc maxHP delta. Corruption ≥50 liên tục 30 giây simulation, dưới50 reset, pause không tiến. Result thắng và purchase có guard idempotent; không thu hồi huy hiệu khi đổi vũ khí.
