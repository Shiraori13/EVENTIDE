# Hướng dẫn làm việc với EVENTIDE

## Đọc trước khi sửa

1. Đọc `GAME_SPEC.md` để hiểu bản sắc, luật và phạm vi hiện hành.
2. Đọc `docs/status.md` để biết code và kiểm tra thực tế đang ở đâu.
3. Đọc `docs/architecture.md`, `docs/balance.md` và tài liệu liên quan trực tiếp tới yêu cầu.
4. Khi tạo MVP lần đầu, thực hiện `prompts/BUILD_MVP.md`. Sau khi đã có game, dùng yêu cầu sửa cụ thể; không khởi tạo lại repo vì nhìn thấy prompt cũ.

Bộ hiện tại chỉ là baseline tài liệu. Trước khi viết code, kiểm tra workspace và hướng dẫn hiện có; giữ các thay đổi người dùng. Không coi tên file/class dự kiến trong tài liệu là bằng chứng chúng đã tồn tại.

## Cách tiến hành

- Hiểu yêu cầu và tự xử lý các lựa chọn triển khai thông thường trong phạm vi được giao. Không dừng để xin xác nhận từng bước reversible.
- Nếu thiếu một số cân bằng chưa được chốt, chọn giá trị khởi đầu bảo thủ, đưa vào config, ghi `docs/design-decisions.md` và thử nghiệm. Không tự đổi các trụ cột hoặc mở rộng sang tính năng backlog không được giao.
- Nếu code và spec lệch, xác định lỗi hay thay đổi có chủ đích; không âm thầm sửa spec để hợp thức hóa bug. Hỏi rõ khi thực sự không thể suy ra yêu cầu cốt lõi.
- Hoàn thành luồng người chơi thực sự. Không dùng TODO, nút chết, asset đường dẫn giả hoặc kết quả test giả thay cho tính năng bắt buộc.
- Không xóa file/người dùng đang sửa, rewrite toàn dự án hoặc đổi framework chỉ để thêm tính năng nhỏ.
- Không triển khai hosting hay thao tác dịch vụ bên ngoài chỉ vì prompt nhắc mục tiêu web. Phạm vi ban đầu là local.

## Thiết kế mã

- TypeScript strict, identifier tiếng Anh, UI/comment hướng dẫn tiếng Việt. Chọn dependency tương thích khi tạo dự án, giữ lockfile.
- Tách config, runtime state, save, gameplay systems, presentation và services. GameScene điều phối thay vì chứa tất cả logic.
- Stable ID cho content/save, không dùng tên dịch làm khóa. Không rải số cân bằng trong update.
- Một simulation clock; pause phải đóng băng mọi luật game. Không dùng Date.now/setInterval độc lập cho damage, charge hoặc wave.
- Cleanup khi đổi scene/lượt; listener, timer, DOM và audio phải có chủ sở hữu và đường dispose rõ.
- Tránh any không giải thích, global mutable state khó reset, abstraction tổng quát chưa có nhu cầu và file khổng lồ.
- Test/debug hooks chỉ dev/test; save test riêng. Không đưa cheat UI vào production.

## Comment

Dùng JSDoc ngắn cho public API hoặc logic khó; nêu responsibility, input/output và đơn vị nếu quan trọng. Comment giải thích vì sao, không lặp lại tên hàm.

Các chỗ cần chú thích rõ: biên vùng sáng, buff Corruption không cộng dồn, damage cooldown, XP dư, lọc nâng cấp, tiến hóa cùng slot, lực hút tại tâm, event một lần, ưu tiên defeat, thưởng một lần, save validation và cleanup.

```ts
// Kiểm tra chết trước vì sát thương chí mạng ở tick cuối phải được tính thua.
if (player.hp <= 0 || beacon.hp <= 0) {
  finishRun('defeat');
  return;
}
```

## Asset

Tra `docs/asset-guide.md`. Dùng manifest, path local và fallback/generator tách logic. Thay ảnh không được thay hitbox ngoài chủ đích. Ghi nguồn/giấy phép, không tải asset chưa có quyền. Không tạo file rỗng để giả là đã có audio hoặc sprite.

## Kiểm tra theo thay đổi

Khi đã có scripts, chạy typecheck và build cho thay đổi code; chạy unit/integration liên quan, e2e cho luồng UI hoặc gameplay bị ảnh hưởng. Thay HP/cooldown cần kiểm tra công thức và trải nghiệm chịu ảnh hưởng; không viết test chỉ để mirror phép gán.

Các lệnh mục tiêu: `npm run typecheck`, `npm run test`, `npm run build`, `npm run test:e2e`. Đọc package.json thực tế trước; không khẳng định lệnh có sẵn nếu repo mới chỉ có tài liệu.

Không lặp toàn bộ lượt 12 phút cho sửa chính tả. Trước bàn giao MVP hoặc khi đổi clock/wave/win-loss, kiểm tra một lượt đủ thời lượng và các điều kiện cuối màn. Ghi rõ kiểm thử mô phỏng tăng tốc hay chơi thật. Nếu môi trường chặn browser/dependency, báo phần chưa kiểm chứng, không ghi pass.

## Tài liệu phải đi cùng code

| Thay đổi | Cập nhật |
|---|---|
| Luật, phạm vi, giao diện có hành vi mới | GAME_SPEC.md, acceptance.md, status.md |
| Con số cân bằng | Config thực thi, balance.md và changelog nếu thay đổi đáng kể |
| Kiến trúc/thư mục/dependency | architecture.md, README.md, decision nếu cần |
| Thêm/thay asset | Manifest, asset-guide.md, metadata nguồn |
| Tính năng backlog đã làm | backlog.md, status.md và đặc tả |
| Bất kỳ kiểm tra đã chạy | status.md với lệnh, kết quả, môi trường thực tế |

`prompts/BUILD_MVP.md` là snapshot ban đầu: không tự đồng bộ nó theo mọi thay đổi sau này. Khi cần thay baseline tạo mới, tạo phiên bản prompt mới và nêu rõ.

## Bàn giao mỗi tác vụ

Nêu kết quả, file/luật chịu ảnh hưởng, cách dùng, kiểm tra đã chạy và hạn chế còn lại. Cập nhật status trung thực. Nếu có lỗi thực sự còn tồn tại thì phân biệt với feature tương lai; không giấu bug trong backlog như ý tưởng tùy chọn.
