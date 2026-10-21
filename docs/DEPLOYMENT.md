# Triển khai EVENTIDE · beta 1.0.0

Repository: https://github.com/Shiraori13/EVENTIDE · production branch: main.
URL chơi **đã xác minh bằng Chromium**: https://shiraori13.github.io/EVENTIDE/ . Kết quả Actions và kiểm tra công khai ở cuối tài liệu.

## Bản phát hành

Nhãn hiển thị **beta 1.0.0**, package/lockfile **1.0.0-beta.1**. Đây là đổi tên bản hotfix1.4.1 để phát hành, giữ toàn bộ gameplay/mastery5ô/evolution/events/balance/save schema3. Không xóa profile hoặc quay lại code1.0 cũ.

## Đường dẫn và tài nguyên

- Vite base `/EVENTIDE/`, phân biệt hoa/thường và có slash cuối. Output `dist/`; dev/preview cũng dùng cùng prefix.
- HTML favicon dùng `%BASE_URL%`. `assetURL` và BootScene Phaser loader dùng `import.meta.env.BASE_URL` đúng một lần, manifest vẫn giữ path tương đối.
- CSS publicfont được Vite xử lý thành `/EVENTIDE/assets/fonts/...` trong output. Không thêm prefix lần hai, không copy thêm font theo hash. Giữ Noto/OFL và SVG CC0 local.
- WebAudio tổng hợp chỉ unlock sau Khởi hành/tương tác. Không có file nhạc từ localhost/CDN. Blob SVG do Phaser tạo là dữ liệu trong browser, khác HTTP request asset.
- Không router hoặc service worker. Refresh `/EVENTIDE/` tải lại menu; game chưa resume-run.

## Local và kiểm tra production

Node24.21.0/npm11.19.0 đã kiểm tra, engines hỗ trợ22.12+ trong nhánh22 hoặc24+. Giữ package-lock và dùng npm ci.

```powershell
npm ci
npm run dev
# http://127.0.0.1:5173/EVENTIDE/
npm run typecheck
npm run test
npm run build
npm run preview
# http://127.0.0.1:4173/EVENTIDE/
```

Test browser local (Chromium chỉ dành QA):

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH="$PWD\.playwright"
npx playwright install chromium
npm run test:production
```

Smoke hiện hành kiểm tra prefix/reload/menu/version/font/ảnh/HTTP404, production không debughook, chơi offline; di chuyển thật tới Stardust, chọn level thật, B/pause/resume, shot qua WebAudio thật, mute/volume/save qua refresh. Audio probe chỉ ở automation, không thêm API vào bundle; chưa là đánh giá nghe âm thanh của người thật. Kết quả local ở artifacts/deployment/local (không push).

Để chạy cùng smoke trên trang công khai:

```powershell
$env:EVENTIDE_SMOKE_URL="https://shiraori13.github.io/EVENTIDE/"
$env:EVENTIDE_SMOKE_ARTIFACTS="artifacts/deployment/public"
npm run test:production
Remove-Item Env:EVENTIDE_SMOKE_URL
Remove-Item Env:EVENTIDE_SMOKE_ARTIFACTS
```

Save dùng localStorage theo **origin**, không theo path. Đổi path trên cùng localhost/port vẫn giữ profile; đổi từ localhost sang github.io là origin khác nên save không tự chuyển. Các repo Pages cùng github.io origin có thể chia sẻ key; bản này giữ nguyên eventide.save.v1/schema3. Không tự thêm export/import hoặc migration ngoài phạm vi.

## GitHub Actions và cập nhật

`.github/workflows/deploy.yml` chạy push main hoặc workflow_dispatch; không deploy từ PR/fork. Build job: checkout → Node24.21.0 → npm ci → typecheck → `npm run test` (hiện149unit/integration,4bài cân bằng opt-in) → production build → cài Chromium → production smoke → upload **dist**. Deploy job needs build; environment github-pages, URL lấy từ deployment output; pages:write/id-token:write chỉ ở job deploy, contents:read. Concurrency pages xếp tuần tự, không deploy chồng nhau.

Các action chính thức pin SHA đã đối chiếu refs tại GitHub ngày2026-10-17:

| Action | Phiên bản | SHA |
|---|---|---|
| actions/checkout | v7 | 3d3c42e5aac5ba805825da76410c181273ba90b1 |
| actions/setup-node | v7 | 949feb2413d6458794dcd2491c4babbbce0c15c1 |
| actions/configure-pages | v6 | 45bfe0192ca1faeb007ade9deae92b16b8254a0d |
| actions/upload-pages-artifact | v5 | fc324d3547104276b827a68afc52ff2a11cc49c9 |
| actions/deploy-pages | v5 | 368f82528645a54fb793d4d04e342629a3f51346 |

Đối chiếu [Vite static deploy](https://vite.dev/guide/static-deploy) và [GitHub Pages workflow](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages). Không cần PAT trong source/workflow, dùng GITHUB_TOKEN/OIDC mặc định của Actions.

Ở https://github.com/Shiraori13/EVENTIDE/settings/pages chọn **GitHub Actions** làm Source. Nếu tài khoản có quyền API, có thể tạo/cập nhật Pages với build_type workflow; không đổi visibility hoặc bật dịch vụ trả phí. Nếu lần push đầu chạy trước khi Pages bật, dùng Actions → Deploy EVENTIDE to GitHub Pages → Run workflow.

Sau này sửa/kiểm tra, review diff rồi commit/push main bình thường:

```powershell
git status
git diff
git add <cac-file-da-review>
git commit -m "Describe the game update"
git push origin main
```

Theo dõi https://github.com/Shiraori13/EVENTIDE/actions đúng commit vừa push. Nếu branch protection yêu cầu PR, tạo nhánh/PR và merge theo quy định; không force push hoặc bypass.

## Khi có lỗi

- Build đỏ: mở job build, xem bước npm ci/typecheck/unit/build/production smoke. Checkout sạch dùng fixture nguồn tại tests/fixtures/history (giữ hash); không cần artifact/build lịch sử local.
- configure/deploy Pages404: kiểm tra Source GitHub Actions, quyền Pages/OIDC và environment github-pages. Không suy push thành công là deploy thành công.
- Asset404/màn trắng: mở Network/Console, so đường dẫn với `/EVENTIDE/` và chữ hoa/thường, kiểm tra dist/index.html/CSS/manifest. Tránh `/assets/...` chưa qua bundler, `/EVENTIDE/EVENTIDE/`, file:// hoặc localhost hardcode trong bundle.
- Bản cũ: đối chiếu SHA workflow và asset hash trong HTML công khai, refresh/bỏ cache browser. Không thêm service worker để che lỗi cache.

## Kiểm tra trước push và kết quả công khai

Trước push: remote refs rỗng qua git ls-remote/fetch; workspace chưa có Git, tạo main/origin đúng repo. Không có lịch sử để ghi đè. Dùng tài khoản Git có sẵn Shiraori13, commit identity noreply repo-local, không sửa Git global. Publication audit không thấy file bí mật/private key hoặc file lớn bất thường; chỉ source/asset/lock/config/docs/fixture cần thiết. node_modules/dist/artifacts/browser/testoutput/.env/VSCode bị ignore, không xóa dữ liệu local.

Đã chạy npm ci (sau nhả khóa Vite/esbuild của workspace), strict/build,117/117unit trong48,55s và2/2production smoke trong28,5s. Bundle app index-DlFaRyTM.js110,73KB/gzip38,95; CSS14,97KB/gzip4,13; Phaser1208,06KB còn warning chunk>500KB. Không đổi gameplay/stat/save source. Network smoke không HTTP404 hoặc request bắt buộc về localhost khácorigin; font/SVG đều dưới prefix, offline vẫn chơi. Local Windows/headless SwiftShader; chưa nghe đánh giá audio hoặc đo GPU/FPS mới.

Deployment đầu: commit [fb6d9be](https://github.com/Shiraori13/EVENTIDE/commit/fb6d9be5b109b0da33e1c09e9447adfc1443c025), [workflow run39035972224](https://github.com/Shiraori13/EVENTIDE/actions/runs/39035972224) **success** cả build/deploy trên Linux. Pages tạo qua API201 với build_type workflow/HTTPS enforced; deployment7140126306 status success, environment_url https://shiraori13.github.io/EVENTIDE/. HTTP200 và script /EVENTIDE/assets/index-DlFaRyTM.js khớp local.

Đã chạy cùng production smoke trên URL công khai: **2/2 pass,31,8s**; menu beta1.0.0/font/SVG/reload/nohooks/offline và movement/nhặtXP/chọnlevel/B/pause/resume/shotAudio/mute/save qua refresh. Đã xem screenshot menu và footer; WebAudio context running nhưng chưa nghe thử bằng tai. Raw riêng ở artifacts/deployment/public (local, không đưa profile test/screenshots lên repo).

Đã audit cả378Gitobjects/192historicalsource: không output/.env/secretpattern và SHA fixture giữ. Lần scan Gitobjects đầu bị sandbox chặn spawn, đã chạy lại thành công bằng quyền phù hợp; không dùng lần lỗi làm bằng chứng. Whitespace check cho file hiện hành sạch; license/prompt/snapshot cũ giữ nguyên byte kể cả whitespace lịch sử. Repo không có lịch sử cũ, không force push.

Commit tiếp theo chỉ cập nhật tài liệu xác nhận này, cùng source/bundle. Push main vẫn tự chạy lại CI/deploy. Xem [Actions mới nhất](https://github.com/Shiraori13/EVENTIDE/actions/workflows/deploy.yml) và SHA HEAD khi đối chiếu những lần cập nhật sau. Không còn bước bật Pages thủ công cần làm.

## Chuẩn bị cập nhật ngày2026-10-21

Người dùng yêu cầu push toàn bộ phần đã hoàn thành local: visual identity, UI/hazards/multi-boss, Next beta UX/stability và tổ chức thư mục. Vẫn beta1.0.0/package1.0.0-beta.1, base /EVENTIDE/, save schema3/key cũ; không đưa bundle QA hoặc dữ liệu test lên GitHub.

Đã đọc status/diff/remote, `git ls-remote` và fetch: main trên GitHub vẫn5fbac8a, bằng HEAD trước commit mới, không có thay đổi remote cần gộp. Không force push. Audit file dự kiến commit không thấy secret pattern/private key hoặc file lớn bất thường; node_modules/dist/artifacts/browser/test-results/.env được ignore. Snapshot lịch sử giữ byte và hash.

Kiểm tra lại Windows/Node24.21.0/npm11.19.0/Chromium156 SwiftShader: typecheck pass; unit149pass/4opt-in skip (63,38s); production build pass; production smoke local2/2pass (26,7s), raw riêng `artifacts/deployment/2026-10-21-local/`. Bundle app index-sBaUOfj7.js146,33KB/gzip51,14; CSS index-C3KVvyY1.css34,63KB/gzip7,95; chunk Phaser1208,06KB vẫn có warning. Các báo cáo trước giữ nguyên giới hạn về GPU vật lý/chơi tay; không chạy lại benchmark hoặc lượt720s cho tác vụ push. Kết quả CI/deploy và smoke công khai sẽ được bổ sung sau push thành công.
