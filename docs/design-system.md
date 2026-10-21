# EVENTIDE · Nguồn sáng giữa thủy triều hư không

UX/stability2026-10-21 tiếp tục palette/font/token này. `next-beta.css` bổ sung layout5slot, recipe, effective stats/details, draft có2–3giá trị và kết quả/details. Không thêm art hoặc animation library. HUD critical/warning dùng icon/chữ/viền tĩnh có hysteresis; HP cập nhật ngay, không pulse/tween HP. Toast/tip nhường dialog và nguy hiểm; tutorial dùng simulation TTL, không thêm timer riêng. Table nguồn có scroll260px và header sticky; panel header/footer nằm ngoài scroll. Focus gồm summary, có restore và bảo vệ input/select.

Đợt visual identity local ngày 2026-10-18, trên gameplay beta1.0.0. Snapshot yêu cầu ở [prompt](../prompts/EVENTIDE_Visual_Identity_Space_Animation_Prompt.md). Không phát hành lên Pages trong tác vụ này.

## Ngôn ngữ hình ảnh

Beacon vàng ấm là tiêu điểm giữa không gian lạnh; cyan dành cho công nghệ, tím dành cho hư không. Vòng đồng tâm đứt đoạn xuất hiện ở model Beacon, vòng nạp thật, tiêu đề panel và tên game. Tinh vân cong lệch tâm được bake một lần, giữ vùng tối để đọc giao tranh. Không blur/shader toàn màn hình hoặc particle engine mới.

`src/game/config/design.ts` cấp palette/timing cho canvas và CSS; `src/styles/tokens.css` cấp font, spacing 4/8/12/16/24/32px và focus. `identity.css` dùng cùng token cho menu, HUD, panel, Core, thẻ và trạng thái. Các màu alpha riêng là treatment của component, không phải stat chiến đấu.

| Vai trò | Màu |
|---|---|
| Nền / sâu | #050914 / #0B1426 |
| Panel / nổi | #101D30 / #17283D |
| Chữ / phụ | #E8F0F4 / #A8B9CC |
| Công nghệ / Beacon | #7DDCEB / #EFCB83 |
| Hư không / nguy hiểm | #8063B5 / #F47F86 |

Sans Noto local cho nội dung/HUD, Serif Noto local cho tiêu đề; đầy đủ dấu Việt, tối đa hai họ, giấy phép OFL cũ. Body 14px, mô tả 13–14px/line-height 1.8–1.9; nhãn phụ 10–12px, h2 23–30px theo viewport. Không dùng tím làm chữ thông tin trên panel. Unit kiểm tra chữ chính/phụ/vàng/cyan/đỏ trên bốn nền đạt tương phản ≥4.5:1; không coi kiểm tra token là chứng nhận mọi pixel của ảnh alpha.

## Thông tin và trạng thái

HUD: tàu bên trái, Beacon/HP/nạp/thời gian ở giữa, hành động bên phải; build/XP dưới trái, Corruption dưới phải. Một rail bên trái xếp event → cảnh báo Beacon → notice → thành tựu; bỏ notice trùng tên event. Thanh boss tách ở trên tâm. HP dùng state ngay, không tween. Số dài không wrap HP tàu.

Menu có Khởi hành làm tiêu điểm, nav hiện hành và Beacon chuyển động chậm. Toast menu/panel nằm trong flow, không đè nút xác nhận. Build/Core dùng vùng nội dung cuộn riêng, header/footer cố định trong panel; confirmation tiến hóa vẫn ở đầu vùng cuộn và focus đúng nút. Footer không phủ nội dung. Ở 390px, menu cuộn, panel/thẻ một cột; có nhắc cần bàn phím, không hứa điều khiển cảm ứng.

| State | Tín hiệu |
|---|---|
| Đang phát triển | Nhãn, icon và cấp thật |
| Đã tối đa | Badge viền vàng + chữ |
| Ô trống | Viền dashed + dấu cộng + nhãn |
| Thiếu điều kiện | Ghi cấp Pulsar/Ion thật; không nút giả |
| Có thể tiến hóa | Action xác nhận giữ nguyên giao dịch; feedback sau commit |
| Beacon bị đánh | Tint đỏ cục bộ 120ms, HP thật và cảnh báo chữ |
| Beacon ≤25% | Ba tam giác viền đỏ và “Nguy cấp” |
| Boss | Aim đỏ → lock vàng → fire vùng tô sáng + hai biên chính xác → dư ảnh mảnh 120ms |

## Motion và clock

Hover 140ms; panel 200ms/6px; card 220ms/4px, stagger 0/20/40ms (tổng260ms). Không tăng gate chọn 180ms có sẵn. Kết quả dùng panel entry ngắn và vòng hoàn tất, không thêm thời gian khóa input. Beacon nhịp5s, vòng phụ xoay chậm khác hướng; Core preview16s. Engine/trail ngắn theo vận tốc; tàu smooth cung ngắn và bank tối đa0.12rad, **không dịch sprite khỏi vị trí nội suy dùng chung camera/quái/đạn**.

World animation lấy simulation time; Balo, draft và pause đóng băng. Menu dùng presentationSeconds clamp100ms/ẩn tab, không truyền vào GameSession. Không thêm interval/timer luật game. Reduced motion tắt parallax tương đối, twinkle/dust, bank, xoay/pulse Beacon và CSS motion, đồng thời tắt shake; checkbox shake vẫn độc lập khi motion đầy đủ. Giữ tint hit và hazard thiết yếu. Lựa chọn lưu thắng OS; chỉ profile mới lấy prefers-reduced-motion. Save cũ fallback motion từ reducedEffects; giữ Low/High và toàn bộ meta, schema/key không đổi. Profile mới mặc định Vừa.

## Ngân sách và layer

| Budget | Thấp | Vừa | Cao |
|---|---:|---:|---:|
| Sao bake |112|176|256|
| Tàn tích visible |28|42|70|
| Twinkle / dust tối đa |3 / 4|8 / 10|14 / 18|
| Nhịp vẽ accent (Hz) |6|12|20|
| Hạt hút tổng / mỗi vùng |32 / 12|48 / 18|96 / 32|
| Đoạn trail tàu |2|3|4|
| Thanh HP quái thường |12|20|28|

Một TileSprite opaque theo viewport + một Graphics accent. Ba tile1024² bake ở boot, thêm4MiB RGBA thô so hai tier trước; không tạo canvas khi đổi quality. Atlas35 frame hiện1024×640, raster Beacon/bốn boss128 còn lại64. Pool sprite≤640, pickup visual≤220; dữ liệu/collision không bị culling. Không emitter/tween riêng cho hạt, chỉ vòng lặp có trần. Khi >75 quái hoặc >110 đạn, decoration về budget Thấp, dust0/twinkle≤3; chỉ phục hồi sau2s và dưới50 quái/80 đạn. Reset hysteresis khi đổi lượt.

Trong dense, cả phế tích visible về28; các object vẫn reuse, không tạo/destroy theo mật độ. HUD dùng surface opaque, không shadow blur. `presentation/geometry.ts` thay ARC của Phaser (100đoạn cả khi cung ngắn) bằng polyline sai số dây cung≤0.35u trong bán kính hiện dùng, cap128đoạn/cung; cấu hình `ARC_BUDGET` trong design.ts. Dùng cho vòng Beacon, viền Gravity và vệt Pulsar, giữ chính xác endpoint/radius, không nới collider. Setter tilePosition có guard khi pause để Canvas fallback không redraw nếu giá trị chưa đổi.

Layer từ thấp lên: background −10, accents −9.5, ruins −9, vùng sáng −8, static −7, silhouette/pickup1, Graphics chiến đấu2, projectile/tàu3, hazard boss5, DOM HUD/dialog. Hazard luôn giữ ở Low. Well có viền radius world-unit thật và nét cong đi vào tâm; EXP12–24u/salvage25u tách khỏi sao≤1.3px. Pulsar/Quasar dùng halfWidth collision; Ion chỉ nối points thật, không nhánh giả. Model Bastion/Singularity và màu/nhịp Quasar theo state sở hữu đã commit.

Mỗi owner có dispose: background2 object, hazards Graphics, light/static/ruins, pool; scene/UI tháo AbortController, audio và debug. Beam dư ảnh giữ tối đa một record mỗi owner, hai boss lịch tối đa hai record. Không texture theo lịch sử spawn/restart. Số đo máy thực tế và giới hạn xem [visual report](visual-identity-report.md).

Boss local: Harrier nhìn theo đường dash đã khóa; Gravemaw giữ trục hàm và mở/khép theo warning/active, không đổi hitbox. Reduced motion giữ hàm ở mức tĩnh, dừng xoay trang trí Elder/Helion, vẫn giữ hình/hướng/biên đòn. BossPresentation dùng cùng strokeArc tối ưu, tối đa hai owner/tail.
