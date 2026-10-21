# Cấu hình browser

- Root `playwright.config.ts`: dev5173, dùng bởi npm run test:e2e.
- `playwright.multiboss.config.ts`: bản QA tối ưu hiện hành4201, npm run build:qa rồi test:qa.
- `playwright.production.config.ts`: production4173, npm run build rồi test:production; EVENTIDE_SMOKE_URL cho server local đã chạy.
- Các config baseline/vnext/v14/v141/visual giữ đường dẫn build của đợt tương ứng; phải chuẩn bị đúng frozen artifact để tái hiện lịch sử.

Mọi server command có cwd root; testDir/outputDir tính từ thư mục config mới. Hook chỉ dev/benchmark và dùng save test riêng. Không cấu hình nào tự push/deploy.
