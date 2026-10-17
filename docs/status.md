# EVENTIDE beta1.0.0 · phát hành GitHub Pages

Đổi nhãn public/package từ hotfix1.4.1 thành beta1.0.0/1.0.0-beta.1 theo yêu cầu; giữ nguyên gameplay, mastery đủ/max5ô, evolution, XP, reroll, bonus, events, boss và schema3. Bằng chứng gameplay hotfix ở [status-v1.4.1](status-v1.4.1.md). Không dùng số phiên bản mới để ghi lại lịch sử các bản cũ.

## Đã chuẩn bị và kiểm tra local

- Vite base /EVENTIDE/, favicon %BASE_URL%, Phaser/manifest BASE_URL một lần; CSS font public được Vite rewrite, không tạo bản sao font. WebAudio vẫn unlock sau click, không file audio ngoài. Dev/preview dùng /EVENTIDE/.
- Workflow chính thức pin SHA checkout7/setupnode7/configurepages6/uploadpages5/deploypages5 đã đối chiếu Git refs/tài liệu. Node24.21.0, npmci/strict/unit/build/productionbrowser; chỉ uploaddist, deploy needsbuild với quyền pageswrite/idtokenwrite ở jobdeploy và concurrency pages.
- Test lịch sử chuyển import sang tests/fixtures/history từ snapshotnguồn cũ; SOURCES.json/hash và gitattributes giữ byte. tsconfig exclude enumeration fixture để tránh global ambient khác phiên bản, imported code vẫn typecheck. Setup tạo outputroot khi checkout sạch,2worker.
- Workspace ban đầu khôngGit; remote Shiraori13/EVENTIDE refs rỗng qua ls-remote/fetch. Tạo main/origin đúng repo, identitynoreply repo-local. Không force/reset/clean hoặc sửa globalconfig. Audit357file/5,4MiB không có mẫu secret/privatekey hoặc file lớn bất thường; source/asset/lock/config/docs/fixture nguồn cần thiết được chuẩn bị. Ignore output/cache/browser/.env/VSCode, giữ file local.

| Kiểm tra thực tế | Kết quả |
|---|---|
| npm ci |Pass50package/0vulnerability. Lần đầu esbuild.exe bị Vite workspace giữ khóa Windows; xác định/dừng đúng process rồi cài lại thành công. Có warning npm về esbuild install script, build thực tế pass |
| npm run typecheck |Pass strict sau cập nhật config/fixture/smoke |
| npm run test |Pass117/117,13file,48,55s,2worker; giữ toàn bộ regression/playtest lịch sử |
| npm run build |Pass; app index-DlFaRyTM.js110,73KB/gzip38,95, CSS14,97KB/gzip4,13, Phaser1208,06KB/gzip332,17 giữ warning>500KB |
| npm run test:production |Pass2/2,28,5s dưới /EVENTIDE/: menu/version/font/SVG/refresh/nohooks/offline, move/XP/choose/B/pause/resume/shotWebAudio/mute/save |
| Audit đường dẫn |RelativeTSimports không lệch hoa/thường; HTTP assets cùngorigin/dướiprefix, không404. Blob SVG Phaser là dữ liệu nội bộ, không request HTTP ra root/domainkhác |

Raw local tại artifacts/deployment/local,publication-audit.json (không push). Smoke lần đầu nhận nhầm blob URL nội bộ là lỗi prefix; đã tách protocol và chạy lại pass. Không sửa gameplay để vượt kiểm tra. Môi trường Windows/Node24.21/npm11.19/Chromium156headlessSwiftShader; audio probe thấy context running/shot420Hz nhưng chưa nghe đánh giá bằng tai. Không chạy lại lượt render720s/FPS vì gameplay/clock không đổi; bằng chứng trước hotfix giữ trong hồ sơ lịch sử.

## Deployment

Đang chuẩn bị commit/push và cấu hình Pages. URL **dự kiến** https://shiraori13.github.io/EVENTIDE/; chưa coi push/buildlocal là deployment thành công. Theo dõi chi tiết và cách cập nhật ở [DEPLOYMENT](DEPLOYMENT.md).

## Chạy và dữ liệu

npm run dev → http://127.0.0.1:5173/EVENTIDE/ ; npm run build rồi npm run preview →4173/EVENTIDE/. GitHub Pages là origin kháclocalhost nên profile không tự chuyển; schema/key cũ giữ. Thaypath trên cùnglocalhost/port giữ dữ liệu. Reload trở về menu, chưa có resume-run. Bản production không hooktest/perf kể cả query.
