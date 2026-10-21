# Prompt tạo EVENTIDE MVP lần đầu

Prompt này dùng một lần để tạo baseline sản phẩm trong dự án được giao, sau đó lưu làm yêu cầu khởi tạo. Khi sửa game đã có, dùng `MODIFY_GAME.md` và đặc tả hiện hành.

## Hướng dẫn dùng cùng bộ tài liệu

- Đọc `AGENTS.md`, `GAME_SPEC.md`, `docs/architecture.md`, `docs/balance.md`, `docs/asset-guide.md`, `docs/acceptance.md` và `docs/status.md` trước khi viết code.
- Giữ các tài liệu này và cập nhật chúng theo mã nguồn thật; không xóa để thay bằng tài liệu generic từ template.
- `GAME_SPEC.md` là core dài hạn. Phần dưới là yêu cầu thực thi baseline1.0; nếu có yêu cầu mới rõ ràng của chủ dự án thì áp dụng đúng phạm vi và cập nhật spec.
- Nếu chỉ nhận riêng prompt này và `GAME_SPEC.md`, hãy tạo thêm `AGENTS.md` và các tài liệu dự án theo cấu trúc ở dưới. Không yêu cầu truy cập cuộc trò chuyện cũ.
- Trạng thái ban đầu là chưa có game. Tạo project/test thật rồi ghi kết quả, không mặc định các lệnh đã chạy.
- Sau khi hoàn thành, README phải hướng dẫn local thực tế; status phân biệt feature đã làm, test đã chạy và phần bị chặn. Chỉ gọi MVP hoàn chỉnh khi đủ tiêu chí hoặc nêu rõ tiêu chí chưa đạt.

---

Bạn là lập trình viên game web 2D có kinh nghiệm, đồng thời biết tổ chức mã nguồn để sinh viên có thể đọc và mở rộng. Hãy trực tiếp xây dựng một MVP hoàn chỉnh, chạy local, cho **EVENTIDE – Thủy Triều Hư Không** theo đặc tả dưới đây.

Tôi cần một game thực sự chơi được từ menu đến kết quả, có giao diện nhất quán, asset được tổ chức riêng và mã nguồn có comment hữu ích. Không chỉ trả về kế hoạch, giao diện giả hoặc đoạn code rời. Đọc toàn bộ đặc tả trước khi làm. Tiến hành qua các mốc có thể chơi được nhưng hoàn thành tất cả trong phạm vi được giao; không dừng sau bước scaffold để chờ tôi nhắc.

## 1. Mục tiêu và nguyên tắc phạm vi

- Game sinh tồn hành động 2D nhìn từ trên xuống, lấy cảm hứng về vòng lặp di chuyển, tự tấn công, nhặt XP và nâng cấp của Vampire Survivors.
- Bản sắc riêng: bảo vệ Beacon, ra ngoài vùng sáng để lấy Stardust, đánh đổi sức mạnh với Corruption và tận dụng vùng trọng lực.
- Chạy trên trình duyệt máy tính, single-player, bàn phím và chuột, phát triển local trước. Chưa triển khai hosting.
- MVP phải bao gồm toàn bộ các tính năng được đánh dấu thuộc bản đầu trong đặc tả này. Nội dung bản sau được ghi trong backlog, không triển khai ngầm hoặc thay thế tính năng bắt buộc bằng TODO.
- Ưu tiên cấu trúc rõ, ít phụ thuộc và dễ sửa. Chưa cần ECS tổng quát, dependency injection framework, plugin engine hoặc hệ thống vật lý thiên văn.
- Không tự đổi chủ đề, bỏ Beacon hoặc thay Corruption bằng một cơ chế khác.
- Những thông số concept đã chốt dưới đây là mặc định cần giữ. Các con số bổ sung phục vụ triển khai phải nằm trong config, được ghi trong `docs/design-decisions.md` và xem là giá trị cần playtest.

## 2. Bối cảnh cần thể hiện trong game

Hư Vô, The Hollow, là làn sóng entropy nuốt chửng các nền văn minh. Mọi thứ bị nó tiêu diệt biến thành Hollowborn, những hình hài méo mó của vật thể từng tồn tại. Các nền văn minh cuối cùng chế tạo Beacon để tái lập từng vùng không gian nhỏ.

Người chơi là Nova, một Lightkeeper lái tàu cứu hộ cũ gắn công nghệ thu hồi, bảo vệ Beacon cho đến khi nó sạc đầy. Mỗi chiến thắng khôi phục một vùng không gian và giữ lại một ký ức Echo.

- Giữ tên EVENTIDE và phụ đề Thủy Triều Hư Không.
- Khẩu hiệu: “Khi mọi ngôi sao đã tắt, hãy là ánh sáng cuối cùng.”
- Cảm xúc: cô độc nhưng vẫn có hy vọng.
- Chỉ cần một đoạn dẫn nhập ngắn trước lượt đầu và một Echo mở sau chiến thắng đầu. Không làm hội thoại phân nhánh hoặc cutscene dài.

## 3. Công nghệ và trải nghiệm chạy local

- Dùng TypeScript strict, Vite và Phaser 3, chọn bản phát hành ổn định tương thích. Có thể dựa trên template Phaser + Vite + TypeScript chính thức.
- Dùng npm và cung cấp lockfile. Kiểm tra yêu cầu Node thực tế của các phiên bản được chọn, ghi chính xác trong README và `engines`; không sao chép yêu cầu phiên bản từ trí nhớ.
- Phaser xử lý thế giới game. Menu, HUD và modal có thể dùng HTML/CSS overlay để dễ sửa; không thêm React nếu chưa có nhu cầu cụ thể.
- Runtime không cần backend, database, API key, tài khoản, CDN, font mạng hoặc asset tải từ URL bên ngoài.
- Sau khi cài dependency và build, game không cần internet để chơi qua local server. Không yêu cầu mở `index.html` bằng `file://`.
- Cung cấp npm scripts: `dev`, `build`, `preview`, `typecheck`, `test`, `test:e2e`. Mỗi script phải có cấu hình thực sự chạy được.
- README hướng dẫn từng bước trên Windows: cài Node phù hợp, mở terminal trong thư mục, `npm install`, `npm run dev`, mở URL Vite in ra, `npm run build`, `npm run preview`.
- Test browser có thể cần `npx playwright install chromium`; giải thích đây là bước cài công cụ kiểm thử, không phải bước cần để chơi game.

## 4. Cấu trúc dự án và trách nhiệm mã nguồn

Tạo cấu trúc tương đương bên dưới. Có thể gộp các file quá nhỏ nếu hợp lý; không dồn toàn bộ game vào một `main.ts`, một scene hoặc một file HTML.

```text
eventide/
  index.html
  package.json
  package-lock.json
  tsconfig.json
  vite.config.ts
  playwright.config.ts
  README.md
  AGENTS.md
  GAME_SPEC.md
  CHANGELOG.md
  prompts/
    BUILD_MVP.md
    MODIFY_GAME.md
  public/
    assets/
      images/
        player/
        beacon/
        enemies/
        weapons/
        environment/
        ui/
      audio/
        music/
        sfx/
      ASSET_GUIDE.md
  src/
    main.ts
    styles/
      tokens.css
      ui.css
    assets/
      manifest.ts
      proceduralTextures.ts
    game/
      createGame.ts
      scenes/
        BootScene.ts
        MenuScene.ts
        GameScene.ts
        ResultScene.ts
      core/
        GameSession.ts
        GameClock.ts
        RunStateMachine.ts
        Random.ts
        types.ts
      config/
        balance.ts
        characters.ts
        enemies.ts
        weapons.ts
        upgrades.ts
        waves.ts
        map.ts
        progression.ts
      entities/
        Player.ts
        Beacon.ts
        Enemy.ts
        Projectile.ts
        Pickup.ts
      systems/
        MovementSystem.ts
        SpawnSystem.ts
        CombatSystem.ts
        WeaponSystem.ts
        CorruptionSystem.ts
        GravitySystem.ts
        ExperienceSystem.ts
        UpgradeSystem.ts
        BossSystem.ts
      weapons/
        WeaponBehavior.ts
        PlasmaOrb.ts
        OrbitalDrones.ts
        GravityWell.ts
      services/
        SaveService.ts
        AudioService.ts
      ui/
        Hud.ts
        UpgradeModal.ts
        PauseModal.ts
      debug/
        DebugController.ts
  tests/
    unit/
    e2e/
  docs/
    architecture.md
    balance.md
    asset-guide.md
    design-decisions.md
    status.md
    backlog.md
    acceptance.md
```

Yêu cầu thiết kế:

- Tách trạng thái một lượt `RunState` khỏi dữ liệu lâu dài `SaveData`. Không đặt chúng trong một object global khó reset.
- Có các trạng thái: menu, playing, choosingUpgrade, paused, victory, defeat. Kiểm soát chuyển trạng thái tập trung.
- `GameScene` điều phối các system, không chứa toàn bộ quy tắc chiến đấu.
- Dữ liệu module, quái, nâng cấp, nhân vật và nhịp sinh quái tra cứu bằng ID ổn định. Tên hiển thị không làm khóa lưu trữ.
- Cân bằng bằng config: HP, tốc độ, cooldown, sát thương, XP, thời gian, bán kính, giới hạn thực thể. Tránh số rải rác trong vòng update.
- Logic tính Corruption, XP, thưởng và thắng thua phải kiểm thử độc lập với renderer khi khả thi. Không dựng một framework simulation khổng lồ chỉ để đạt mục tiêu này.
- Khi thêm quái hoặc vũ khí sau này, phần lớn công việc là thêm config và một behavior nếu cần. README phải chỉ rõ nơi sửa.
- Dọn listener, DOM overlay, timer, âm thanh, thực thể và pool khi thoát lượt. Chơi lại không tăng tốc sinh quái hoặc nhân đôi âm thanh.

## 5. Luật lượt chơi và điều khiển

- Một lượt dài 720 giây thời gian mô phỏng.
- Nova khởi đầu với 100 HP và Plasma Orb cấp 1.
- Beacon có 300 HP cơ bản, chịu tác động nâng cấp lâu dài như mục 12.
- Beacon tự sạc từ 0 lên 100% trong 720 giây; không phụ thuộc tàu đứng gần, lượng XP hay số quái tiêu diệt.
- Thắng khi đủ sạc và cả tàu lẫn Beacon còn HP. Không bắt buộc giết boss.
- Thua ngay nếu tàu hoặc Beacon hết HP; thông báo đúng nguyên nhân.
- Nếu đủ sạc và có sát thương chí mạng trong cùng bước cập nhật, xử lý sát thương, kiểm tra thua trước, sau đó mới kiểm tra thắng.
- WASD/phím mũi tên để di chuyển; chuẩn hóa vector để đi chéo không nhanh hơn. Thả phím thì dừng, không dùng quán tính.
- Vũ khí tự hoạt động theo behavior riêng; Plasma tự ngắm quái gần nhất còn sống trong tầm.
- Phím 1/2/3 hoặc click chọn nâng cấp. Esc mở tạm dừng; không dùng Esc để bỏ qua lựa chọn nâng cấp.
- Tạm dừng phải đóng băng di chuyển, physics nếu có, AI, damage tick, đạn, vũ khí, trọng lực, spawn, Corruption, hồi máu, boss, XP magnet và sạc Beacon.
- Mất focus hoặc ẩn tab phải tạm dừng và xóa trạng thái phím đang giữ. Quay lại cần người chơi chủ động tiếp tục. Nếu đang chọn nâng cấp thì vẫn giữ modal đó; không tự quay về playing.
- Chặn thao tác phím một lần chọn nhiều thẻ, click xuyên modal và cuộn trang bằng phím mũi tên khi game đang nhận điều khiển.

### Đồng hồ game

- Dùng một nguồn simulation time có thể kiểm soát; không dùng `Date.now`, `setInterval` hoặc timer ngoài luồng game cho quy tắc chiến đấu.
- Sát thương, hồi máu và tốc độ phải theo giây hoặc nhịp cooldown, không theo số frame.
- Dùng fixed timestep có giới hạn số bước bù, hoặc cách xử lý delta tương đương có giải thích. Không bù hàng phút khi tab vừa hiện lại.
- Sự kiện phút 9/phút 10,5 cần cơ chế “đã kích hoạt”, không kiểm tra bằng điều kiện equality số thực và không chạy lại nhiều frame.

## 6. Bản đồ và Beacon

- Một bản đồ duy nhất: Tàn Tích Ngân Hà.
- Đấu trường tròn hữu hạn; Beacon ở tâm, không di chuyển.
- Đề xuất bổ sung để triển khai: bán kính đấu trường 1.800 world unit; tàu cơ bản 200 unit/giây, đi từ tâm tới rìa khoảng 9 giây; vùng sáng bán kính 600 unit. Đặt các số này trong config.
- Camera theo tàu, có chỉ báo hướng và khoảng cách tới Beacon khi Beacon ngoài màn hình. Không cần minimap ở MVP.
- Xác tàu, bụi sao và thiên thạch chủ yếu trang trí; không tạo mê cung hoặc bắt buộc pathfinding.
- Tàu không đi ra ngoài rìa; spawn không đặt quái ngay trên tàu hoặc trong lõi Beacon. Có khoảng cách an toàn và giới hạn số lần thử tìm điểm spawn.
- Trong vùng sáng, tàu hồi 1 HP/giây, tối đa bằng HP tối đa. Quái thường giảm 20% tốc độ; không cộng dồn giảm tốc qua nhiều frame.
- Beacon không tự hồi HP; vùng sáng không tạo miễn nhiễm sát thương cho bất kỳ bên nào.
- Stardust rơi tại chỗ quái chết, chỉ hút trong phạm vi nhặt của tàu; không tự thu toàn bản đồ.
- Đặt vài cụm Stardust hữu hạn ngoài vùng sáng để khuyến khích rời Beacon đầu lượt. Không tự tái sinh vô hạn.
- Phần lớn quái đuổi tàu. Khoảng 25% quái thường được giao mục tiêu Beacon ngay khi sinh và giữ mục tiêu đó. Dùng một marker hoặc hình viền để nhận ra, không chỉ đổi màu.
- Vì tàu thường rời tâm, cần HUD cảnh báo khi Beacon đang mất máu. Không làm camera giật về Beacon.

## 7. Corruption

- Giá trị liên tục giới hạn trong [0,100], khởi đầu bằng 0.
- Ngoài vùng sáng: +4/giây. Trong vùng sáng: −8/giây.
- Khoảng cách bằng đúng bán kính được tính là trong vùng sáng, dùng chung một phép kiểm tra cho hồi máu và Corruption.
- Dưới 50: không có buff/debuff.
- Từ 50 trở lên: sát thương tàu gây ra nhân 1,2; sát thương tàu nhận nhân 1,2.
- Qua dưới ngưỡng thì mất cả hai hiệu ứng. Không nhân tiếp vào chỉ số cơ bản mỗi frame.
- Không tăng sát thương Beacon nhận. Đạt 100 không gây chết tức thì hoặc mất quyền điều khiển.
- Áp dụng bonus đúng một lần cho mọi nguồn sát thương thuộc tàu, gồm Plasma, drone và Gravity Well; định nghĩa rõ đánh giá bonus tại thời điểm gây sát thương.
- HUD có thanh, giá trị và mô tả ngắn tác dụng hiện tại; hào quang tàu đổi nhẹ khi vượt ngưỡng.
- Kiểm tra mẫu: ở ngoài 15 giây từ 0 đạt 60; vào trong hơn 1,25 giây sẽ xuống dưới 50.

## 8. Vũ khí, hỗ trợ và lên cấp

### Quy tắc chung

- Ba ô module, hai ô hỗ trợ. Ban đầu chỉ có Plasma Orb cấp 1.
- Mỗi module tối đa cấp 5. Hai hỗ trợ, mỗi loại tối đa ba cấp: tăng HP tối đa, tăng bán kính nhặt.
- Mỗi lần lên cấp dừng trận, đưa tối đa ba lựa chọn khác ID và còn hợp lệ. Nếu ít hơn ba lựa chọn thì hiển thị đúng số còn lại, không tạo thẻ giả.
- Có thể chọn module mới nếu còn ô, hoặc nâng module/hỗ trợ đã có. Không có reroll, banish hoặc khóa lựa chọn.
- Giữ XP dư; nếu một pickup đủ tăng nhiều cấp thì xếp hàng các lần chọn, không làm mất cấp. Chỉ tiếp tục chơi khi xử lý hết lựa chọn.
- Khi không còn lựa chọn, hồi 10 HP, không vượt trần; có thể xử lý tự động với thông báo ngắn để tránh modal vô nghĩa.
- XP cần cho từng cấp và lượng rơi theo quái nằm trong config; đưa giá trị khởi đầu hợp lý và ghi trong balance.md.
- Void Leech chỉ trừ XP tiến độ của cấp hiện tại, clamp về 0; không làm mất level, module hoặc Stardust tinh khiết.
- Khi tăng HP tối đa, quy định minh bạch việc tăng HP hiện tại. Đề xuất tăng cùng lượng cộng thêm, không hồi đầy toàn bộ.

### Ba module bắt buộc

1. **Plasma Orb**: bắn đạn vào quái gần nhất trong tầm; đạn có TTL, mất khi trúng hoặc hết hạn. Cấp 3 chuyển hình thái thành **Mini Sun**, thêm nổ lan nhỏ; cấp 5 thành **Supernova**, tăng vùng nổ và đổi hiệu ứng. Đây là một module, một ô, một ID ổn định. Cấp 2 và 4 có cải thiện chỉ số nhìn thấy được. Không để cùng một mục tiêu nhận trùng sát thương va chạm và nổ ngoài chủ đích đã ghi rõ.
2. **Orbital Drones**: drone quay quanh tàu, gây sát thương tiếp xúc. Theo dõi cooldown theo mục tiêu để không damage mỗi frame. Nâng cấp thể hiện rõ bằng số drone, sát thương hoặc bán kính; tooltip mô tả đúng thay đổi thực tế.
3. **Gravity Well**: tự chọn vị trí một quái trong tầm, tạo vùng hút trong thời gian ngắn rồi nổ. Chỉ hút quái; không hút tàu, Beacon, Stardust hoặc đạn. Cấp cao hơn cải thiện chỉ số theo config.

- Hố hút của module phải khác hình và màu với hố đen môi trường.
- Hai nguồn hút có thể cùng tác động một quái nhưng cần giới hạn tổng lực và tránh NaN khi khoảng cách gần 0.
- Nếu không có mục tiêu, vũ khí không crash hoặc tạo hiệu ứng tại tọa độ không hợp lệ.
- Thiết kế registry behavior đủ nhẹ để thêm module sau; không làm toàn bộ hệ thống crafting ở MVP.

## 9. Hollowborn và boss

Ba quái thường bắt buộc:

- **Static Wisps**: nhỏ, ít HP, xuất hiện thành đàn.
- **Hollow Drifters**: xác tàu chậm, nhiều HP, silhouette khác Wisps.
- **Void Leeches**: nhanh, bám theo tàu, hút XP khi tiếp xúc. “Bám” là hiệu ứng ngắn; không cần constraint vật lý hoặc hoạt ảnh phức tạp. Chỉ dùng Leeches cho vai trò đuổi tàu; tỷ lệ đánh Beacon phân bổ qua hai loại còn lại để tổng lượt sinh quái thường vẫn xấp xỉ 25%.

Tất cả quái có bảng stats riêng và loot theo config. Đụng mục tiêu gây damage theo cooldown; tàu có khoảng bảo vệ va chạm ngắn để không mất 100 HP trong một frame. Beacon vẫn có thể bị nhiều quái bào mòn theo nhịp, nhưng mỗi quái không được gây sát thương theo FPS. Dùng thời gian mô phỏng cho các cooldown.

**Elder Star**:

- Xuất hiện đúng một lần khi elapsed đạt 540 giây.
- Có thanh HP boss, cảnh báo xuất hiện, hình ngôi sao chết rõ ràng.
- Di chuyển ngoài lõi vùng sáng và tấn công tàu.
- Hai đòn: vòng đạn thưa có khe né và chùm tia báo trước. Chùm tia hiển thị hướng cảnh báo rồi khóa hướng trước khi gây damage; không tiếp tục bám tàu tức thời khiến đòn không thể né.
- Đạn/tia boss chỉ gây damage cho tàu trong MVP; quái thường tiếp tục chịu trách nhiệm đe dọa Beacon.
- Giết boss rơi nhiều Stardust, không lập tức thắng hoặc sinh boss mới.
- Đủ 720 giây vẫn thắng nếu hai đối tượng cần bảo vệ còn sống, dù boss còn HP. Kết thúc lượt phải dọn boss, tia và đạn.

Nhịp độ:

- 0–180 giây: chủ yếu Wisps, làm quen và lấy nâng cấp.
- 180–360: thêm Drifters.
- 360–540: thêm Leeches; tăng áp lực dần.
- 540: Elder Star; vẫn sinh quái thường có giới hạn.
- 630: hố đen cuối màn.
- 720: xét kết quả theo luật ưu tiên.

Không ép spawn vô hạn. Đặt giới hạn quái/đạn/hạt, hoãn spawn khi đạt trần. Việc hoãn không được làm mất vĩnh viễn sự kiện boss một lần. Có TTL và thu hồi thực thể chết đúng cách.

## 10. Trọng lực môi trường

- Tối đa một vùng trọng lực môi trường đang cảnh báo hoặc hoạt động tại một thời điểm. Gravity Well của tàu không tính vào giới hạn này.
- Chọn từ vài vị trí định sẵn ngoài vùng sáng; bảo đảm cả vùng hút không phủ Beacon và không chặn mọi đường về.
- Có vòng báo trước 2 giây; chỉ gây lực khi hết báo trước.
- Hút nhẹ tàu và quái; không hút đạn, XP hoặc Beacon.
- Lực tối đa phải nhỏ hơn khả năng bay thoát của tàu cơ bản. Có giới hạn lực khi ở tâm; không mô phỏng nghịch đảo bình phương vô hạn.
- Các vùng hút trước cuối màn có thời điểm, chu kỳ và tuổi thọ nằm trong config. Đề xuất khởi đầu: sự kiện đầu ở giây 120, lặp mỗi 90 giây, hoạt động 15 giây; phải nhường chỗ cho sự kiện cuối.
- Ở giây 630, hủy/thu hồi vùng môi trường trước đó rồi cảnh báo hố đen cuối ở rìa; 2 giây sau bắt đầu hút, giữ tới khi kết thúc lượt. Không sinh thêm vùng môi trường khác.
- Không thu hẹp bản đồ, kéo Beacon hoặc tạo điều kiện thua bí mật khi chạm tâm hố đen. Trọng lực gây khó về di chuyển; MVP chưa thêm damage riêng cho nó.

## 11. Hình ảnh, asset, âm thanh và UI

Tôi cần MVP có chủ đích hình ảnh, không phải màn nền đen với toàn chấm tròn không phân biệt.

- Phong cách pixel art hoặc sprite đơn giản nhất quán, nền xanh đen/tím sâu, cyan cho tàu và đạn ta, vàng cho Beacon, tím hồng cho địch.
- Có nhiều lớp sao nền tiết chế, xác tàu trang trí, tàu Nova có hướng và động cơ, Beacon có vòng sáng và nhịp sạc, ba quái có silhouette khác nhau, boss có hình ngôi sao chết.
- Giữ đạn địch rõ bằng viền/hình dạng, đạn ta và địch không lẫn. Tránh bloom quá mạnh, flash lớn hoặc tối màn che đường né.
- Có phản hồi khi trúng đòn, pickup, lên cấp, tiến hóa, Beacon chịu damage và chiến thắng. Giới hạn particle; có tùy chọn giảm hiệu ứng/rung màn hình.
- UI tiếng Việt đúng dấu; thuật ngữ riêng giữ tiếng Anh với giải thích ngắn. Không hiển thị debug text cho người chơi thường.
- Layout game ưu tiên desktop, vừa viewport ở 1280×720 và 1920×1080, co giãn không che HUD hoặc méo tỷ lệ. Trên màn hình quá nhỏ hiển thị hướng dẫn dùng desktop rõ ràng; chưa làm touch control.

### Màn hình phải có

- Loading/boot có trạng thái; lỗi asset có xử lý.
- Menu với tên game, khẩu hiệu, Chơi, Hướng dẫn, Beacon Core, Echo và Cài đặt. Các mục này có nội dung thật; không có nút trống.
- HUD: HP tàu, HP Beacon, sạc %, thời gian, cấp và XP, Corruption cùng tác dụng, ba module và hai hỗ trợ, nút pause/mute, cảnh báo Beacon.
- Modal nâng cấp có icon, tên, cấp hiện tại → cấp sau, thay đổi cụ thể và phím tắt. Thứ tự focus dễ hiểu, click một lần chỉ nhận một nâng cấp.
- Pause với Tiếp tục, Chơi lại và Về menu; bảo đảm không bỏ qua nâng cấp đang chờ. Quay về menu khi lượt đang chạy được tính là bỏ lượt, không nhận thưởng; mô tả rõ trong UI.
- Kết quả thắng/thua: nguyên nhân, thời gian sống, số kill, level đạt, phần thưởng tinh khiết và lựa chọn Chơi lại/Về menu. Thắng có hiệu ứng Beacon khôi phục vùng không gian.

### Tổ chức asset

- Có manifest typed: ID, đường dẫn tương đối, loại asset, kích thước/frame nếu cần, metadata nguồn.
- Ảnh tách nhóm trong `public/assets/images`; âm thanh tách music/sfx. Không nhúng base64 lớn trong logic gameplay hoặc tham chiếu ảnh từ ổ máy cá nhân.
- Nếu chưa có ảnh gốc, tạo asset nguyên bản đơn giản bằng SVG/PNG hoặc sinh texture có chủ đích trong `proceduralTextures.ts`. Cách sinh và dữ liệu hình ảnh tách khỏi các system gameplay.
- Tối thiểu có hình riêng cho Nova, Beacon, ba loại quái, Elder Star, ba module, hai hỗ trợ, Stardust và Stardust tinh khiết. Ưu tiên silhouette, màu và kích thước đọc được.
- Các texture sinh bằng code phải có khóa ổn định trong manifest, có thể thay bằng file ảnh mà không sửa quy tắc chiến đấu. Một lớp loader/factory xử lý thay thế và fallback.
- Tạo ASSET_GUIDE/asset-guide: bảng asset ID, file hoặc generator, kích thước, vai trò và cách thay; ghi nguồn và giấy phép nếu dùng bên thứ ba. Không dùng asset thương mại chưa được cấp phép hoặc hotlink.
- Nếu dùng audio tổng hợp, đặt trong AudioService, không rải oscillator khắp code. Nhạc ambient điện tử ngắn, tiết chế và SFX đơn giản là đủ; không cần nhạc thương mại.
- Khởi động audio sau thao tác người dùng. Khi pause hoặc ẩn tab phải ngừng/suspend phù hợp; có mute và âm lượng lưu lại. Thiếu thiết bị audio không được làm game lỗi.
- Không tạo file âm thanh rỗng hoặc thư mục giả chỉ để đủ cây thư mục; có thể ghi rõ âm thanh nào dùng file, âm thanh nào được tổng hợp.

## 12. Tiến triển lâu dài và lưu dữ liệu

Phân biệt tuyệt đối:

- **Stardust**: XP trong lượt, reset khi bắt đầu lượt mới.
- **Stardust tinh khiết**: tiền lâu dài, chỉ nhận sau victory/defeat hợp lệ. Thưởng = floor(thời gian mô phỏng sống sót / 60) + 5 nếu thắng. Một lượt thắng 12 phút nhận 17.

Beacon Core MVP:

- Chỉ nâng HP Beacon, ba cấp.
- Giá từng cấp lần lượt 10, 20, 30 Stardust tinh khiết.
- HP = 300 × (1 + 0,1 × cấp), tức 300/330/360/390. Tính từ gốc, không cộng dồn vào giá trị đã sửa.
- Không nâng bán kính hoặc tốc độ sạc ở MVP.
- Mua ở menu, áp dụng từ lượt tiếp theo; không cho sửa giữa trận.

Echo đầu tiên mở khi thắng lần đầu. Viết một đoạn ký ức ngắn nguyên bản phù hợp bối cảnh, hiển thị lại được trong mục Echo. Không cần hệ thống thu thập Echo trong bản đồ.

Dùng localStorage với key có tên riêng và `saveVersion`; validate dữ liệu, clamp giá trị sai và fallback khi JSON hỏng. Nếu localStorage bị chặn hoặc ghi thất bại, game vẫn chơi được với trạng thái trong bộ nhớ và thông báo nhẹ.

Lưu sau khi nhận kết quả, mua nâng cấp hoặc đổi settings; mỗi run có cờ kết thúc và trả thưởng đúng một lần. Không lưu checkpoint để tiếp tục lượt dang dở. Reload không tiếp tục lượt hoặc nhận thưởng tự động. Có chức năng reset tiến triển trong settings với xác nhận vì sẽ xóa dữ liệu chơi.

## 13. Comment và tài liệu để tôi học và sửa

- Đặt tên class/function/variable bằng tiếng Anh rõ nghĩa, comment và tài liệu hướng dẫn bằng tiếng Việt.
- Comment giải thích lý do, luật và điều kiện biên; không ghi chú mọi phép gán hiển nhiên.
- Đầu mỗi system/service quan trọng có mô tả ngắn: trách nhiệm, dữ liệu vào/ra, đơn vị thời gian/khoảng cách và nơi gọi.
- Các hàm public hoặc thuật toán khó có JSDoc phù hợp, không dùng một template dài cho mọi getter.
- Comment tại các đoạn quan trọng: tính trong vùng sáng, chuyển ngưỡng Corruption, tạm dừng, cooldown damage, giữ XP dư, lọc nâng cấp, tiến hóa cùng ô, trọng lực gần tâm, boss một lần, ưu tiên thua trước thắng, chống trả thưởng hai lần, validate save và cleanup lượt.

Ví dụ mức comment mong muốn, không bắt buộc dùng nguyên hàm này:

```ts
/** Dùng cùng quy tắc biên cho hồi máu, giảm Corruption và làm chậm quái. */
export function isInsideLight(distance: number, radius: number): boolean {
  return distance <= radius;
}

// Kiểm tra thất bại trước để một hit chí mạng ở đúng giây cuối không bị tính thắng.
if (player.hp <= 0 || beacon.hp <= 0) {
  finishRun('defeat');
  return;
}
```

Tài liệu bắt buộc:

- README: cách chạy, điều khiển, tính năng, cây thư mục ngắn và các lệnh kiểm tra.
- architecture.md: luồng dữ liệu, vòng update, pause, vòng đời một run và nơi thêm system.
- balance.md: thông số thực tế đang dùng, cách đổi thời lượng, HP, damage, XP và nhịp spawn.
- asset-guide.md: thay ảnh/âm thanh và cập nhật manifest.
- design-decisions.md: các lựa chọn triển khai bổ sung, nhất là chỗ concept chưa quy định số.
- backlog.md: nội dung tương lai và điểm mở rộng sẵn có; phân biệt với lỗi/chưa hoàn thành.
- status.md: ghi rõ lệnh đã chạy, kết quả, môi trường và phần chưa kiểm tra.

Đưa ví dụ ngắn về cách thêm một loại quái, chỉnh một module và thay sprite Nova. Không yêu cầu người đọc phải sửa hàng chục vị trí cho mỗi thay đổi nhỏ.

## 14. Hiệu năng và tính ổn định

- Dùng pool cho projectile, pickup hoặc enemy nếu có ích; reset đầy đủ state khi tái sử dụng. Không xây pool trừu tượng quá mức.
- Có cap riêng cho quái, đạn, pickup và hạt. XP bị gộp phải giữ tổng giá trị; không âm thầm xóa phần thưởng.
- Không duyệt toàn bộ quái nhiều lần cho mọi effect nếu có thể gom truy vấn theo khoảng cách. Chỉ thêm spatial grid nếu cần theo profiling, không thêm vì hình thức.
- Texture không sinh lại mỗi frame; HUD không xây DOM lại toàn bộ mỗi frame. Đổi số lượng thực thể phải không làm rò rỉ listener.
- Tránh projectiles xuyên qua mục tiêu do bước nhảy lớn; dùng tốc độ/hitbox phù hợp hoặc kiểm tra đoạn đường khi cần.
- Tách pause simulation và pause trình bày rõ ràng; animation UI có thể chạy nhưng không làm thay đổi kết quả trận.
- Mục tiêu là độ mượt ổn định trên máy desktop thông thường, hướng tới 60 FPS. Chỉ công bố FPS đo được khi đã nêu rõ máy/trình duyệt và điều kiện đo; không viết “đã tối ưu 60 FPS” nếu chưa đo.

## 15. Kiểm thử và tiêu chí nghiệm thu

Dùng Vitest cho luật tính thuần và Playwright cho luồng trình duyệt. Viết các test có ý nghĩa, không chỉ kiểm tra function tồn tại hoặc snapshot giao diện.

Unit/integration bắt buộc:

1. Corruption tăng/giảm theo giây, clamp 0–100; 49,9/50 có đúng tác dụng; không cộng dồn multiplier, không ảnh hưởng Beacon.
2. Trong/ngoài vùng sáng có quy tắc biên nhất quán; hồi máu không vượt trần.
3. XP dư và nhiều cấp liên tiếp không bị mất; Leech không làm giảm level hoặc tiền lâu dài.
4. Lựa chọn không trùng, không vượt cấp hoặc số ô; pool ít hơn ba và pool rỗng được xử lý.
5. Plasma cấp 3/5 đổi hình thái đúng, không tăng số ô hoặc nhân đôi module.
6. Cooldown va chạm/drone cho kết quả tương đương ở các tốc độ frame được mô phỏng, trong sai số đã nêu.
7. Pause dừng đồng hồ, sạc, spawn, boss và damage; chuyển tab không bù thời gian.
8. Thua ưu tiên hơn thắng trong cùng tick; thắng không yêu cầu giết boss.
9. Boss/hố đen cuối kích hoạt một lần kể cả bước thời gian đi qua mốc; hố đen không vi phạm giới hạn một vùng môi trường.
10. Thưởng một lần; 12 phút thắng = 17; mua đúng giá, không mua quá ba cấp và tính đúng 300/330/360/390 HP.
11. Save hỏng hoặc storage bị chặn không crash. Chơi lại tạo RunState mới, không giữ XP/Corruption/cooldown cũ.

Browser checks:

- Menu → hướng dẫn → bắt đầu → di chuyển → lên cấp → chọn module → pause/resume → kết quả → chơi lại.
- Xác minh hai nguyên nhân thua riêng, victory, kết quả và phần thưởng không bị nhân đôi khi bấm nhiều lần.
- Reload giữ tiền, nâng cấp, Echo và settings; reset xóa đúng dữ liệu.
- Không lỗi console, promise rejection hoặc request asset thất bại.
- Kiểm tra HUD/modals tại 1280×720 và 1920×1080, bằng ảnh chụp và xem thực tế nếu môi trường hỗ trợ.
- Thử đứng cạnh Beacon và thử chỉ đi săn ở rìa. Nếu chiến thuật nào thắng quá dễ, điều chỉnh số trong config; chưa thêm hệ thống mới.
- Phải hoàn thành ít nhất một lượt đủ 720 giây bằng mô phỏng tự động tăng tốc hoặc chơi thật. Ghi rõ đã dùng cách nào. Test tăng tốc không thay thế việc đánh giá cảm giác điều khiển và độ mượt ở tốc độ thường.

Có thể tạo test hooks/debug để đặt thời gian, kích hoạt event, cho XP hoặc gây damage. Chỉ bật khi `import.meta.env.DEV` hoặc test mode rõ ràng; không đưa nút cheat vào UI bản production. Dùng save namespace riêng khi test để không làm bẩn tiến triển thật. Test dùng seeded RNG khi cần tái hiện; bản chơi thường vẫn có biến thiên.

Chạy `npm run typecheck`, `npm run test`, `npm run build`, `npm run test:e2e`. Nếu thiếu trình duyệt hoặc dependency trong môi trường, mô tả chính xác phần bị chặn và cách chạy; không báo pass khi chưa chạy.

## 16. Nội dung giữ cho bản mở rộng

Chỉ ghi backlog, không buộc triển khai hoặc làm các màn chọn giả:

- Nhân vật: Kael-7, Seraphine, Rogue Comet.
- Module: Pulsar Beam, Meteor Rain, Comet Lance, Ion Storm, Dark Matter Shield.
- Công thức ghép: Pulsar Beam + Ion Storm → Quasar Cannon.
- Quái: Mirror Husks, Event Horizon.
- Boss: The Devourer, The Hollow King.
- Màn: Vành Đai Sao Chết, Thành Phố Trôi Nổi, Rìa Vực Thẳm, Trái Tim Hư Vô.
- Thành tựu, nhiều Echo, nâng tốc độ sạc/bán kính sáng.
- Trọng lực ảnh hưởng đạn, nhiều nguồn trọng lực môi trường.
- Mobile touch, tài khoản, cloud save, multiplayer, bảng xếp hạng.

## 17. Cách thực hiện và bàn giao

1. Kiểm tra workspace và hướng dẫn dự án hiện có. Nếu là repo sẵn, giữ thay đổi của người dùng và chỉ sửa phần liên quan; nếu trống thì tạo dự án mới.
2. Nêu ngắn kiến trúc và các quyết định bổ sung, sau đó viết code thật.
3. Làm lần lượt: chiến đấu cơ bản → Beacon/XP/upgrades → Corruption/trọng lực/boss → UI/asset/audio/save → kiểm thử và chỉnh lỗi. Đây là thứ tự làm việc, không phải lý do cắt phạm vi.
4. Hoàn tất mọi đường đi của người chơi; không để nút chết, import thiếu, asset đường dẫn giả hoặc tính năng bắt buộc chỉ có chú thích TODO.
5. Tự chạy các kiểm tra phù hợp, sửa lỗi và cập nhật tài liệu.
6. Bàn giao mã nguồn đầy đủ. Nếu có thể thao tác file thì tạo trực tiếp, không chỉ in vài đoạn code. Nếu chỉ có chat, đưa từng file với đường dẫn và nội dung đầy đủ, chia thành các phần liên tục có danh mục, không dùng dấu ba chấm để bỏ phần cần chạy.
7. Báo cáo cuối bằng tiếng Việt: đã làm gì, cách chạy local, các lệnh đã kiểm tra, giới hạn còn lại và vị trí chỉnh config/asset. Không tuyên bố game đã triển khai hosting.

**Tiêu chuẩn hoàn thành:** Người mới clone/copy dự án có thể cài và chạy local theo README, chơi trọn vòng lặp, hiểu lý do thắng/thua, nhìn rõ các cơ chế riêng của EVENTIDE và tìm được nơi chỉnh cân bằng hoặc thay asset mà không phải viết lại toàn bộ game.
