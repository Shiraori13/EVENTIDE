# Script local

Chạy từ root repo để giữ đúng đường dẫn artifacts/public.

| Thư mục | Trách nhiệm |
|---|---|
|assets|asset-shapes.json, generate-assets.mjs và metadata font/SVG; npm run assets:generate|
|performance|benchmark.mjs và các bộ so sánh/report phiên bản; cần browser .playwright và build tối ưu|
|qa/multiboss|capture cung trước/sau, interaction clip keyboard, performance A/B tuần tự|
|qa/visual-identity|Ảnh/motion/batch/report đợt visual trước; phụ thuộc các build frozen đã ghi trong báo cáo|
|qa/history|Capture/repro các phiên bản trước|
|qa/next-beta|Ảnh, clip input, audit hash, A/B source, full720render và benchmark UX/stability hiện hành|

QA hiện hành: `npm run build:next-beta`, `npm run test:next-beta`, preview4301 phục vụ artifacts/next-beta/after-build dưới /EVENTIDE/. Lệnh build:qa/test:qa và preview4201 còn cho đợt multi-boss trước. Production dùng `npm run build`, `npm run preview`; không hook.

Next-beta: capture.mjs nhận URL và nhãn before/after; interaction.mjs tạo clip input thật với cảnh cuối khởi tạo fixture; rendered-run.mjs chạy bot42/defense/fusion đủ720s bằng clock thường, tối đa25phút wall và không tăng HP/XP/time. Không gọi các lượt này là chơi tay/FPS. performance.mjs đo tuần tự AB/BA, thêm Low/reduced: cần baseline4300/current4301 và **đóng mọi browser/test/rendered-run khác trước khi đo**. Bộ đo có rAF probe >50/100ms độc lập, gồm cả bundle baseline cũ chưa có trường over100. playtest.mjs cần before-source snapshot local, so12cặp natural trước/sau; không là dependency unit/build checkout sạch. audit.mjs kiểm tra nguồn luật/asset/lockfile/fixture bất biến.

Playtest tăng tốc: PowerShell đặt `$env:EVENTIDE_BALANCE='1'`, chạy `npm run test:balance`, sau đó `Remove-Item Env:EVENTIDE_BALANCE`. Output mặc định `artifacts/balance-regression`; đặt `$env:EVENTIDE_BALANCE_ROOT='artifacts/next-beta/balance-regression'` để gom theo tác vụ. Không ghi đè artifacts/multiboss/playtest lịch sử khi tái chạy. Có fixture và natural run riêng, không làm bẩn save người chơi.

`node scripts/qa/multiboss/capture.mjs http://127.0.0.1:4201/EVENTIDE/ after` lưu screenshot và computed owners. `interaction.mjs` ghi WebM/state keyboard thật trong fixture QA, không giả nhận là người chơi tay. `performance.mjs` cần baseline frozen4200 và current4201; `control.mjs` đảo thứ tự đo, `render-probe.mjs` so GL snapshot, `report.mjs` tổng hợp các raw giữ cả lượt xấu; đóng browser/test khác trước đo.

Các script/alias v12/v13/v14/v141 giữ mục đích tra regression lịch sử; benchmark lịch sử không phải chứng nhận source hiện hành. Không chạy report cũ để ghi đè số hiện tại. Artifact/snapshot build local không được git add/push; nguồn fixture tái lập nằm trong tests/fixtures/history cùng manifest SHA256.
