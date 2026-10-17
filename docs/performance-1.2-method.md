# Phương pháp đo1.2

Baseline1.1 đóng băng tại artifacts/v12/baseline-benchmark; nguồn/docs/package đối chứng tại baseline-source. Build1.2 tối ưu production mode benchmark, probe rõ ràng; normal production không hook dù query. Hai preview localhost4181/127.0.0.1:4182; không HMR, không browser/tests/build đồng thời trong lấy mẫu. Package/dependency không đổi major.

Scope hash: cặp cuối/lượt render cuối dùng DW48mbSI, source ở final-measured-source và build after-benchmark. Đã đo lại sau fallback boss spawn/grace3s/nhãn reset, không gán số của bundle cũ thành bản cuối. Cặp ban đầu jXlw4oxB và source/build còn ở after-pre-spawn-fix/long-run-pre-spawn-fix/measured-source/measured-benchmark; before-initial giữ baseline cặp ban đầu. Không trộn hai cặp hoặc gộp percentile.

Mỗi build hai cảnh dense/endgame, một lượt/cảnh, warm10s/sample60s. Seed20261016, input function và initial simulation time, High/DPR1/CSS/backing1280×720 giống nhau. Ground XP500/700 được pinned ngoài đường tàu, cùng giá trị; không dùng collection khác nhau để làm đẹp FPS. Clock clamp0.1s giữ nguyên, raw có simulation time thực; không replay bit-identical nếu frame khác. Mẫu nhỏ không đủ kết luận tỷ lệ regression ổn định.

Dense giữ110 quái và tối thiểu120 projectile ở cả hai;1.2 thêm power/haste40% thay hỗ trợ Hull/Magnet1.1. Endgame1.1 có phase1 và160 đạn nền;1.2 dùng phase2/fan/beam mới và120 đạn nền để Plasma tốc cao thực sự bắn được. Counts mean ghi thật trong bảng, không tuyên bố đây là workload/presentation giống hệt. Để kiểm tra cap thật có stress simulation riêng110 thường+boss, power5/haste5:172 phát trong60s, peak56projectile<160, Well peak1, không mất XP.

Môi trường: Windows kernel10.0.26200, Intel Core i5-12450HX/12logical, RAM21,168,513,024bytes, Node24.21/npm11.19, Chromium156.0.8078.4 headless, WebGL ANGLE/Vulkan SwiftShader software. Không đo refresh vật lý/GPU desktop/input-to-photon. Không suy CPU Scene thấp thành GPU không nghẽn; full Phaser render sau Scene.update chưa tách riêng khỏi driver/raster. Mục tiêu tham chiếu p95≈20ms/p99≈33.3ms không được nới sau đo; ghi rõ cảnh chưa đạt.

Probe buffer50,000 mẫu/series, heap mỗi60frame; không log/DOM text mỗi frame. Cả1.1/1.2 đã cull ở presentation: XP pinned ngoài camera nên visual0 là đúng; active Image hoặc pool capacity không đồng nghĩa số đã raster. Cả hai không có physics body/tween/timer per XP. Pool hữu hạn chủ động giữ capacity, không gọi là leak chỉ vì heap không về đúng byte. Lifecycle hai warm-up+năm lượt tương đương có DOM CDP sau GC; test không chứng minh mọi leak.

Playtest dài render/audio ở clock thường, bot đọc telegraph/chọn draft thật ưu tiên Hull+Armor, core0/HP100/Beacon300/Plasma1, không grant chỉ số/XP/time. Checkpoint10s, invariant XP và career total, reward/phase xác minh cuối. Tách khỏi các preset TTK và full-run fast-forward trong balance-v1.2.

Lượt đo1.1 trước đây có3×60s cho bốn cảnh, báo cáo lịch sử tại performance-v1.1.md và frozen docs. Không trộn các số đó vào cặp1.1→1.2 hiện tại. Dữ liệu mới ở artifacts/v12; một số ảnh regression/lifecycle path cũ đã được cập nhật trong quá trình kiểm tra trước khi chuyển output sang v12, nên dùng paths v12 cho bằng chứng1.2.
