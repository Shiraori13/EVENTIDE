# Hiệu năng beta1.4 · đo local

Baseline1.3 frozen ở artifacts/v14/baseline-benchmark và baseline-source; beta ở after-benchmark và final-measured-source. Entry hiện tại: ./assets/index-BC9WlYb0.js. 51 source file và 31 SVG/font cũ đã đối chiếu SHA256. Không sửa/rebuild trong lúc đo cuối. Lượt D1VFNgyB trước sửa nền giữ tại long-run-pre-background-fix (p95=51ms,SceneCPU0,6ms); dense75,8ms ở after-pre-background-fix. Bản cuối gộp nền thành một tile opaque, không trộn hai bundle.

Windows/Node24.21/Playwright1.64.1/Chromium156, i5-12450HX,12logicalCPU,RAM19,7GiB; WebGL ANGLE Vulkan SwiftShader software. Không phải GPU vật lý hoặc input-to-photon. Cùng1280×720/High/DPR1/seed20261016, warm10s/sample60s,một lượt/cảnh, tuần tự không browser/test khác. Sai số/driver/thời điểm có thể ảnh hưởng; không suy60FPS hoặc mọi máy.

Dense/endgame: cả hai Plasma/Drones/Well5,power/haste5,110enemy/120basebullet,500/700XP pinned xa camera. Endgame phase2+gravity. Beta có evolvedDrone/Well/boss và chaos tại dense400 theo luật mới; cùng cap/count/input, không replay bit-identical hoặc cô lập riêng chi phí rendering.

| Cảnh | Median trước → sau | p95 trước → sau | p99 trước → sau | Max trước → sau | >50ms trước → sau |
|---|---|---|---|---|---|
| dense | 39,7 → 38,9 | 50,6 → 48,1 | 60,4 → 57,4 | 138,4 → 227,6 | 83 → 50 |
| endgame | 33,1 → 31,8 | 45,1 → 40,8 | 54,9 → 47,6 | 77,8 → 106,3 | 40 → 12 |

Đơn vị frame time ms. Mục tiêu p95~20ms/p99~33,3ms cần đánh giá theo bảng, không gọi mục tiêu đã đạt nếu vượt. Max và sốframe>50ms cho thấy vẫn còn stall; cải thiện percentile không đồng nghĩa hết giật. JSON lưu percentile, số mẫu, counters/CDP và tóm tắt heap/lỗi; không phải trace từng frame.

| Stress beta riêng | Median | p95 | p99 | >50ms | Heap đầu → cuối (MiB) |
|---|---|---|---|---|---|
| quasar | 29,6 | 35,4 | 38,9 | 0/1012 | 31,22 → 41,91 |
| radiation | 29,4 | 35 | 38,8 | 4/1010 | 34,04 → 32,34 |
| chaos | 27,6 | 32,9 | 35,7 | 0/1082 | 31,77 → 39,36 |
| tide | 30,4 | 39,8 | 45,2 | 4/961 | 34,18 → 46,77 |

Stress mới warm5s/sample30s để các sự kiện45s còn active trong toàn mẫu; dùng Plasma5+Quasar5, supportpower/haste40%,salvageRate20%,masteryDamage10%+rate10% (budget20%); Quasar tại635 cóphase2/finalgravity. Events riêngradiation211/chaos350/tide466. HPfixture1e8 giữworkload, không chứng minh cân bằng/né. XP pinned700 không phải nhiều pickup nhìn thấy; visual/lifecycle cóảnh riêng. Không drop damage beam khi FX cap.

Lifecycle2warm+5: textures 37/37/37/37/37, sceneListeners 48/48/48/48/48, DOM listeners 167/167/167/167/167, pool 256/256/256/256/256; timers/tweens/physics bằng0, eventActive0 khi menu. Nền composite opaque1024² cho mỗi quality,32SVG/atlas1024×512;37texture. Loại ba Image nebula alpha sau hồi quy, có mẫu pre-background-fix riêng. Bounded frame/heap probe không chứng minh soak dài hoặc không leak mọi đường.

Lượt render clock thường seed7, core0, ưu tiên Hull/Armor và Plasma/Pulsar/Ion, fusion chủ động trong draft. Case được chọn từ matrix bot có thắng; không tăng HP/time/XP, không chứng minh winrate người thật. 720s mô phỏng/725,44s wall (gồm boot/poll10s), victory/cấp34/kills1002/+17, HP tàu128/Beacon300. Bossphase2 574,33s/final 594,33s. Mastery {"damage":200,"rate":400,"hp":600,"pickup":400,"speed":400}, modules {"plasma":5,"quasar":5}, hỗ trợ thực nhận {"hull":2}. XP3944=3648+296; profile wins1/currency17, errors0. Frame median/p95/p99 26,8/34,7/41,7ms, >50ms89/26421. Heap 30,62→35,07MiB, max50,3MiB; có GC vàbuffer probe nên không suy khôngleak từ hai đầu.

Tái hiện: Dùng build1.4 frozen (không build hotfix đè); mở preview4193 baseline/4194 after; npm run perf:compare; node scripts/performance/benchmark.mjs --root=artifacts/v14 --label=beta-stress --url=http://127.0.0.1:4194 --scenarios=quasar,radiation,chaos,tide --repeats=1 --warmup=5 --seconds=30 --pinned=1; npm run perf:long-run; npm run perf:report. Đặt PLAYWRIGHT_BROWSERS_PATH vào .playwright. Các prompt MVP/lịch sử không sửa.

Chưa kiểm chứng: chơi tay đủ12phút/audio/cảm giác né, GPU desktop/nativezoom/inputlatency/Firefox/Safari/soak20–30phút. Benchmark cóprobe/testkey; production smoke riêng xác nhận không hooks/offline. Lịch sử1.3 ở performance-v1.3.md.
