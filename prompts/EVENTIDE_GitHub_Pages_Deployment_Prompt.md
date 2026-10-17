# Prompt: Đưa EVENTIDE lên GitHub và GitHub Pages

Bạn là kỹ sư phụ trách triển khai web game. Hãy thao tác trực tiếp trên project EVENTIDE đang mở trong workspace, chuẩn bị bản production, push lên repository dưới đây và triển khai GitHub Pages để người khác mở link là chơi được.

## 1. Đích triển khai và phạm vi

- Repository: https://github.com/Shiraori13/EVENTIDE
- Git remote: https://github.com/Shiraori13/EVENTIDE.git
- Nhánh production mong muốn: main.
- URL GitHub Pages dự kiến: https://shiraori13.github.io/EVENTIDE/
- Đây là yêu cầu thực hiện, không chỉ viết hướng dẫn hay mô tả các bước.
- Giữ gameplay, tiến trình, cân bằng, giao diện và dữ liệu lưu hiện có. Chỉ sửa các vấn đề cần thiết để build và triển khai.
- Không thay game bằng demo, không viết lại project, không nâng cấp hàng loạt dependencies.
- Không tạo backend, đăng nhập hay database chỉ để đưa game lên Pages.
- Không tuyên bố website hoạt động cho đến khi đã xác minh deployment và mở trang thực tế.

## 2. Kiểm tra project và repository trước khi sửa

Đọc AGENTS.md và tài liệu project đang có; kiểm tra package.json, lockfile, cấu hình build, cấu trúc source, asset và workflow hiện có.

Xác định framework, package manager, thư mục gốc ứng dụng và output thực tế. Thiết kế dự kiến là TypeScript + Vite + Phaser, nhưng phải theo code thực tế. Nếu stack khác, áp dụng cách triển khai static tương ứng, không ép chuyển sang Vite.

Kiểm tra Git:
- Workspace đã là repository hay chưa; git status, nhánh và remote hiện tại.
- Kiểm tra repo đích và refs trên remote, không suy luận repo trống chỉ từ metadata dung lượng.
- Nếu chưa có Git, khởi tạo trong đúng thư mục ứng dụng.
- Nếu chưa có origin, thêm remote đích.
- Nếu origin đã trỏ đúng repo, giữ nguyên.
- Nếu origin trỏ repo khác, giữ remote đó và thêm remote riêng cho EVENTIDE; không tự đổi đích remote cũ.
- Nếu remote có commit, fetch và kiểm tra quan hệ lịch sử trước khi push. Không ghi đè lịch sử.
- Nếu hai lịch sử độc lập hoặc có xung đột cần quyết định, chuẩn bị toàn bộ cấu hình và báo rõ phần đang chặn; không tự force push hoặc ghép lịch sử tùy tiện.
- Giữ các thay đổi sẵn có của người dùng. Không reset --hard, git clean, xóa dữ liệu hay sửa global Git config.

Xem project là nội dung sẽ được công khai. Chỉ đưa file của game và tài liệu cần thiết lên repo; không đưa credential, private key, .env chứa bí mật, log, file cá nhân, ảnh chụp riêng hoặc dữ liệu ngoài phạm vi. Không in giá trị bí mật ra báo cáo.

## 3. Cấu hình production và đường dẫn asset

Nếu dùng Vite:
- Hợp nhất vào cấu hình hiện có base: '/EVENTIDE/' — đúng chữ hoa/thường và có dấu / cuối.
- Giữ plugins, aliases và tùy chọn build đang cần.
- Output mặc định dist; nếu project dùng output khác thì đồng bộ workflow và tài liệu theo output thật.
- Giữ hoặc bổ sung các script dev, build, preview thích hợp, không thay script hiện có bằng bản đơn giản làm mất kiểm tra TypeScript.

Rà soát toàn bộ ảnh, sprite, atlas, spritesheet, audio, font tiếng Việt, JSON, shader, worker, favicon, CSS url() và đường dẫn loader Phaser:
- Với asset được import từ source, để bundler xử lý URL.
- Với file trong public, tạo URL phù hợp import.meta.env.BASE_URL.
- Loader Phaser chỉ áp dụng base đúng một lần; tránh đường dẫn /EVENTIDE/EVENTIDE/... .
- Không hardcode localhost, ổ đĩa Windows, đường dẫn tuyệt đối trên máy hoặc /assets/... trỏ sai về gốc domain.
- Kiểm tra tên file đúng hoa/thường trên Linux.
- Giữ sprite sheet metadata và đường dẫn tham chiếu nội bộ của atlas.
- Nếu app thực sự có client-side routing, chọn cách phù hợp Pages và kiểm tra refresh; không thêm router chỉ để deploy.
- Âm thanh cần khởi động sau tương tác người chơi theo cơ chế sẵn có; không để autoplay bị chặn làm game lỗi.

Đảm bảo local vẫn dùng được với cấu hình base mới. Không thêm cache/service worker mới nếu project chưa cần. Nếu đã có service worker, kiểm tra scope, URL asset và cập nhật cache để bản mới không bị giữ mã cũ.

## 4. Git ignore và tài liệu triển khai

Cập nhật .gitignore theo project, tối thiểu loại trừ:
- node_modules/
- dist/ hoặc output build thực tế
- coverage/, log và file tạm
- .env, .env.* chứa cấu hình riêng; có thể giữ .env.example không có bí mật

Phải commit lockfile đúng package manager. Không ignore asset nguồn hoặc workflow cần cho CI. Nếu file nhạy cảm đã bị track, xử lý đúng trạng thái Git trước khi push; nếu đã nằm trong lịch sử sẽ được công khai, báo rõ vấn đề, không tự viết lại lịch sử.

Cập nhật README.md:
- Mô tả ngắn EVENTIDE, cách điều khiển thực tế.
- Cách cài dependencies, chạy local, build và preview.
- Phiên bản Node được hỗ trợ.
- Link repo và URL chơi dự kiến.
- Phân biệt URL dự kiến với URL đã kiểm chứng.

Tạo hoặc cập nhật docs/DEPLOYMENT.md:
- Cấu hình base và quy tắc đường dẫn asset.
- Cách bật Pages và chạy lại workflow.
- Cách cập nhật game bằng commit/push sau này.
- Cách đọc Actions khi lỗi build, asset 404 hoặc màn hình trắng.
- Nếu save dùng localStorage, giải thích save trên localhost không tự chuyển sang domain GitHub Pages; không tự thay đổi schema save.

Viết comment ngắn ở các điểm cấu hình triển khai dễ gây lỗi. Không thêm comment lặp lại từng dòng.

## 5. GitHub Actions cho build và Pages

Tạo hoặc cập nhật .github/workflows/deploy.yml. Không để nhiều workflow cùng deploy gây xung đột.

Workflow phải:
1. Chạy khi push main và hỗ trợ workflow_dispatch.
2. Checkout source.
3. Cài Node tương thích package.json engines và cấu hình phiên bản của project. Nếu chưa có, chọn phiên bản LTS đáp ứng dependencies và ghi lại; không tự dùng bản mới nhất thiếu kiểm chứng.
4. Cài đúng package manager và dependencies bằng lockfile. Với npm dùng npm ci; nếu thiếu lockfile, tạo và kiểm tra trước khi push.
5. Chạy các kiểm tra đã có phù hợp rồi build production.
6. Cấu hình Pages, upload đúng thư mục build và deploy bằng các action chính thức của GitHub.
7. Dùng quyền tối thiểu phù hợp: contents: read, pages: write, id-token: write; environment github-pages và xuất URL deployment.
8. Nếu tách build/deploy thành hai job, deploy phải needs: build.
9. Có concurrency cho Pages để tránh deployment chồng nhau.
10. Chỉ publish output static; không upload toàn bộ source, node_modules hay .env làm website.

Kiểm tra phiên bản action còn được hỗ trợ từ tài liệu chính thức vào lúc triển khai. Ưu tiên pin commit SHA đã xác minh và ghi chú phiên bản; không đoán SHA. Không cần PAT riêng nếu GITHUB_TOKEN đáp ứng deployment.

Nếu repo đã có CI cho pull request, giữ kiểm tra đó; không để pull request từ fork tự deploy production.

Tham khảo:
- https://vite.dev/guide/static-deploy
- https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

## 6. Kiểm tra trước khi push

Chạy cài dependency từ lockfile và các kiểm tra hiện có cần thiết: typecheck/lint/test nếu project đã cấu hình, sau đó build production. Không tạo bộ test mới chỉ để kiểm tra cấu hình đơn giản.

Preview output build bằng HTTP ở đúng đường dẫn /EVENTIDE/, ví dụ npm run preview với Vite. Không kiểm tra bằng cách mở index.html qua file://.

Smoke test tối thiểu:
- Trang tải được tại /EVENTIDE/ và khi refresh.
- Menu, font tiếng Việt, icon và asset hiện đúng.
- Bắt đầu lượt chơi; di chuyển, bắn, quái và Beacon hoạt động.
- Mở/đóng Balo và pause, chọn nâng cấp.
- Âm thanh hoạt động sau tương tác, nút bật/tắt còn dùng được.
- Nếu có save, lưu và đọc lại đúng trong cùng origin.

Kiểm tra console và network: không có lỗi runtime chặn game, asset 404 hoặc request bắt buộc về localhost. Không đưa thêm thay đổi gameplay trong lúc smoke test.

Nếu không có công cụ trình duyệt, thực hiện kiểm tra HTTP/build có thể làm, nêu rõ phần chưa kiểm chứng bằng trình duyệt. Không ghi kết quả PASS cho phần chưa chạy.

## 7. Commit, push và bật Pages

Sau khi kiểm tra đạt:
- Xem diff và danh sách file sẽ công khai.
- Stage đúng source, asset, lockfile, cấu hình và tài liệu của project. Không dùng git add . thiếu kiểm tra, không commit dependency hoặc output build.
- Commit với thông điệp rõ ràng, ví dụ: "Configure EVENTIDE for GitHub Pages deployment".
- Với remote trống, push main bằng Git thông thường và đặt upstream.
- Với remote có lịch sử tương thích, đồng bộ và push theo quy trình không phá lịch sử.
- Nếu branch protection yêu cầu PR, push branch triển khai và tạo PR; báo rõ cần merge trước khi workflow main chạy. Không tìm cách vượt branch protection.

Dùng phiên đăng nhập Git/GitHub đã có. Không yêu cầu người dùng dán token vào source, chat hoặc workflow. Nếu chưa xác thực, giữ nguyên các file đã chuẩn bị và hướng dẫn đăng nhập qua gh auth login hoặc Git Credential Manager; không nói đã push.

Kiểm tra Settings → Pages → Build and deployment → Source:
- Cần chọn GitHub Actions.
- Nếu công cụ và quyền hiện có cho phép cấu hình Pages, thực hiện trong repo này; không đổi visibility repo hoặc bật dịch vụ trả phí.
- Nếu không có capability hoặc quyền phù hợp, hướng dẫn người dùng chính xác tại https://github.com/Shiraori13/EVENTIDE/settings/pages và báo đây là bước còn thiếu.
- Sau khi bật Pages, kích hoạt workflow_dispatch nếu lần push trước đã thất bại vì Pages chưa được bật.

Theo dõi đúng workflow run gắn với commit vừa push. Nếu lỗi, đọc log, sửa nguyên nhân và chạy lại. Không coi push thành công là deploy thành công.

## 8. Kiểm chứng sau deploy và bàn giao

Lấy URL từ deployment thực tế, đối chiếu URL dự kiến:
https://shiraori13.github.io/EVENTIDE/

Mở trang thực tế và kiểm tra lại tải trang, font/asset, bắt đầu lượt chơi, điều khiển, pause và refresh. Nếu có quyền kiểm tra workflow nhưng không có trình duyệt, phân biệt rõ deployment thành công với gameplay chưa kiểm chứng trực tiếp.

Báo cáo cuối bằng tiếng Việt:
- Các file đã thêm/sửa và mục đích.
- Những kiểm tra đã chạy cùng kết quả.
- Branch, commit SHA và link commit đã push; hoặc trạng thái chưa push kèm lý do.
- Link workflow run và trạng thái thật.
- URL chơi đã xác minh; nếu chưa xác minh, ghi rõ là dự kiến.
- Bước thủ công còn thiếu, nếu có.
- Cách cập nhật những lần sau bằng commit/push vào main.

Tiêu chí hoàn thành: source lên đúng repo, production build thành công, Pages deploy thành công và có bằng chứng kiểm tra trang công khai. Nếu bị chặn bởi xác thực, quyền hoặc thiết lập tài khoản, hoàn thành mọi phần độc lập có thể làm và báo đúng điểm chặn, không giả lập thành công.

