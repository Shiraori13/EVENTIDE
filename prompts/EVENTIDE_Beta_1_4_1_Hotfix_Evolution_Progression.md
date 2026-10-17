# Prompt hotfix EVENTIDE beta 1.4.1

Phạm vi: sửa tiến hóa không thực hiện và chuyển sang mastery quá sớm trên **repo beta 1.4 hiện tại**. Đây là bản vá đề xuất 1.4.1, không phải yêu cầu tạo lại game hoặc làm phiên bản nội dung mới.

---

Bạn là lập trình viên phụ trách hotfix EVENTIDE. Hãy đọc mã nguồn, tái hiện hai lỗi bên dưới, sửa trực tiếp, bổ sung kiểm thử và cập nhật tài liệu. Hoàn thành tác vụ trên base hiện có, không chỉ phân tích hoặc đưa đoạn code rời.

## 1. Nguồn và trạng thái cần tái hiện

Đọc AGENTS.md, GAME_SPEC.md, README và tài liệu kiến trúc/balance/status hiện hành. Xem implementation beta 1.4 thật, không dùng bộ tài liệu baseline cũ để ghi đè repo.

Ảnh `image(20261017-085054).png`:

- Balo/Build hiện tại có nút “Tiến hóa sẵn sàng · Quasar Cannon”.
- Công thức hiển thị Pulsar 5 + Ion 5 → Quasar Cannon 5.
- Người chơi báo đã bấm nhưng không xảy ra tiến hóa.
- UI đã báo build vũ khí hoàn tất và mastery 18%/20%.

Ảnh `image(20261017-085104).png`:

- HUD có ba module cấp5.
- Một ô hỗ trợ mới cấp1 và một ô hỗ trợ còn trống.
- Đây chưa phải một build hoàn tất cả năm ô, nên không được chuyển sang thẻ mastery +2%.

Ảnh chưa xác định nguyên nhân code. Phân biệt action không chạy, action bị guard từ chối, state đã đổi nhưng UI stale và behavior/VFX chưa đổi. Nếu không đọc được ảnh, dựng state tương đương qua dev/test để kiểm tra, không bịa kết quả.

## 2. Đặc tả mới có ưu tiên hơn luật beta 1.4 cũ

**Năm ô cơ sở trong hotfix này là năm ô HUD hiện tại: ba ô vũ khí/module và hai ô hỗ trợ chỉ số.** Không phải năm ô chỉ số mới bên cạnh ba vũ khí; không tự mở thêm slot hoặc yêu cầu sở hữu mọi loại stat trong catalog.

Điều kiện chuyển sang mastery:

```text
Đủ 3 ô vũ khí và từng module đạt maxLevel
VÀ
Đủ 2 ô hỗ trợ và từng hỗ trợ đạt maxLevel
```

Cả năm ô đều phải có lựa chọn hợp lệ và đạt trần của chính nó. Vũ khí baseline max5; hỗ trợ dùng maxLevel thật trong registry/config, thông thường là5 theo hệ 1.2. Không dùng chỉ số effective/cap phần trăm thay cho level đã chọn.

Luật beta 1.4 trước đây “chỉ cần ba vũ khí max là chuyển sang mastery, hỗ trợ dừng ở cấp hiện tại” **bị thay thế**. Ngoại lệ cũ “sau hợp nhất có ô trống vẫn coi build hoàn tất” **cũng bị thay thế** theo yêu cầu hoàn tất đủ năm ô lần này.

Các bonus mastery đã kiếm trong run không bị xóa. Chỉ chặn nhận thêm mastery khi build hiện tại chưa đủ điều kiện. Khi base hoàn tất lại thì tiếp tục ngân sách mastery còn lại, không tạo budget mới để farm vượt cap.

Giữ:

- Không bắt thay vũ khí cấp5 để thoát màn lên cấp.
- Thay vũ khí vẫn là hành động riêng có xác nhận, không phải fallback của pool.
- Mastery vẫn khoảng+2% mỗi lựa chọn, giữ caps/budget hiện hành và fallback phục hồi/Tiếp tục.
- XP dư, số lượt chọn chờ, reroll một lần/draft và pause behavior.
- Save hồ sơ, tiền, Beacon Core, thành tựu và toàn bộ nội dung beta 1.4.

## 3. Audit nguyên nhân trước khi sửa

### 3.1 Tiến hóa

Trace đường thực tế:

```text
Button trong Balo
→ handler/event delegation
→ dispatch action
→ session/run state thật
→ recipe eligibility
→ evolution transaction
→ weapon registry/factory/behavior
→ ownership cleanup
→ publish state / refresh UI
```

Kiểm tra đặc biệt:

- Button có bị detached/re-render làm mất listener, overlay chặn pointer hoặc handler bắt nhầm ID không.
- Closure có giữ session/module array cũ không; recipe/action ID có đúng stable ID không.
- Guard có chỉ cho action lúc playing, trong khi Balo luôn pause, khiến bấm bị return im lặng không.
- Action có bị xếp vào queue chỉ drain trong update đang playing, nên không bao giờ chạy khi pause không.
- Guard có dùng mastery/full-build làm điều kiện tiến hóa, dù recipe chỉ cần hai nguyên liệu cấp5 không.
- Registry/factory/asset của Quasar có thực sự đăng ký và tạo được behavior không; mapping tên hiển thị với ID có sai không.
- UI chỉ render “sẵn sàng” từ một predicate còn action commit dùng predicate khác không.
- Có exception bị catch rồi bỏ qua, hoặc cleanup nguồn trước khi tạo output thành công không.
- Logic tiến hóa Drones/Well cấp5 có chung đường lỗi với Quasar không.

Không khẳng định một giả thuyết là nguyên nhân chỉ vì nó hợp lý. Ghi function/file và bằng chứng thực tế rồi sửa đúng chỗ.

### 3.2 Điều kiện mastery

Tìm mọi nơi kiểm tra: tạo draft, reroll, validate selection, sau apply upgrade, sau fusion/swap, Build/HUD và queue multi-level.

- Có `weapons.every(max)` hoặc `weaponMasteryReached` cũ bỏ qua supports không.
- Có dùng `array.filter(Boolean).every(...)`, khiến ô trống biến mất rồi được coi là đầy không.
- Có `.every` trên array rỗng/sparse hoặc chỉ đếm length của mảng chứa hole không.
- Support ID/maxLevel có bị đọc từ weapon definition hoặc default thành0/1 khiến max sớm không.
- Cờ hoàn tất có được latch quá sớm rồi không tính lại sau mutation không.
- Thẻ hỗ trợ hợp lệ có bị bộ lọc slot/max loại nhầm khi vũ khí đã đầy không.

## 4. Một nguồn tính điều kiện hoàn tất

Tạo hoặc sửa selector/predicate chung, ví dụ `getBasicBuildProgress`/`isBasicBuildComplete`. Mọi caller dùng chung; không có ba công thức riêng trong UI, draft và reducer.

Pseudocode mang tính định hướng, chỉnh theo code thật:

```ts
function isBasicBuildComplete(run: RunState, defs: Definitions): boolean {
  const allWeaponsMaxed = REQUIRED_WEAPON_SLOT_IDS.every((slotId) => {
    const module = run.weaponSlots[slotId];
    const definition = module && defs.weapons[module.weaponId];
    return isValidEquippedModule(module, definition)
      && module.level === definition.maxLevel;
  });

  const allSupportsMaxed = REQUIRED_SUPPORT_SLOT_IDS.every((slotId) => {
    const support = run.supportSlots[slotId];
    const definition = support && defs.supports[support.supportId];
    return isValidEquippedSupport(support, definition)
      && support.level === definition.maxLevel;
  });

  return allWeaponsMaxed && allSupportsMaxed;
}
```

- Required slot ID lists có đúng3 và2 ô, không sinh bằng cách chỉ liệt kê ô đang có đồ. Validate schema thực tế.
- Missing/null/hole/ID không tồn tại/maxLevel không hợp lệ không được coi là hoàn tất.
- Module tiến hóa cấp5 hợp lệ dùng definition/level source thật, không bị coi level0 chỉ vì display name đổi.
- Không dùng masteryBudgetUsed>0 làm bằng chứng build đang hoàn tất; ảnh đã có18% nhưng base vẫn chưa xong.
- Có thể cache theo revision của RunState, phải invalidated sau mọi mutation liên quan. Đừng tối ưu selector nhỏ bằng cache không có invalidate.
- Đổi tên/loại bỏ cờ cũ gây hiểu nhầm hoặc chuyển nó thành derived state. Nếu giữ lịch sử “đã từng hoàn tất”, history không quyết định pool hiện tại.

Progress UI có thể trả thêm occupied/maxed count: “Đã lắp4/5ô; đạt trần3/5ô; vũ khí3/3max; hỗ trợ0/2max”. Tính từ state thật, số trong ví dụ không hardcode vào giao diện.

## 5. Draft đúng ở từng trường hợp

| Trạng thái hiện tại | Lựa chọn cần đưa |
|---|---|
| Vũ khí còn dưới trần | Nâng module hiện có hoặc nhận module vào ô trống, cùng hỗ trợ hợp lệ |
| Ba vũ khí max, còn ô hỗ trợ trống | Nhận hỗ trợ mới hợp lệ hoặc nâng hỗ trợ đang có chưa max |
| Ba vũ khí max, đủ hai hỗ trợ nhưng chưa max | Nâng hỗ trợ còn dưới max, không đưa mastery +2% |
| Toàn bộ năm ô đủ và max | Chuyển sang pool mastery +2% |
| Sau fusion có ô vũ khí trống | Quay về base progression để lấp/nâng ô trống; hỗ trợ còn thiếu vẫn hợp lệ |
| Người chơi chủ động swap làm một ô về cấp1 | Base progression, giữ các nguồn bonus đã kiếm |
| Base hoàn tất, mastery đã cap | Fallback phục hồi/Tiếp tục theo luật hiện hành |

Chi tiết bắt buộc:

- Không lôi thẻ thay vũ khí vào pool thường chỉ vì các vũ khí hiện có đã max. Nhận vào ô trống khác với thay ô đang có.
- Hỗ trợ còn level phải xuất hiện với mức nâng cấp cơ sở của nó, không bị thay bằng mastery +2% sớm.
- Không yêu cầu sở hữu cả sáu loại hỗ trợ nếu chỉ có hai ô. Chỉ hai hỗ trợ đã chọn cần lên max sau khi lấp đủ ô.
- Mỗi draft tối đa ba ID khác nhau. Chỉ có một/hai ứng viên thì hiển thị đúng số, không thêm thẻ sai để đủ ba.
- Reroll dùng cùng source eligibility/predicate, không bỏ qua điều kiện năm ô. Pool không đổi được thì disable reroll có lý do và không tiêu lượt vô ích.
- Không chuyển mode dựa vào level nhân vật, thời gian, số lần chọn hoặc tổng bonus. Chỉ kiểm tra cấu trúc/level năm ô.
- Sau khi lựa chọn nâng cấp cuối cùng đưa ô thứ5 lên max, chỉ các draft tiếp theo chuyển mastery. Không tự cấp thêm một mastery reward ngay trong action đó.
- Nếu XP tạo nhiều draft, từng lượt sau phải dựng từ RunState đã commit mới nhất, không reuse pool được tính trước cả chuỗi.
- Validate lựa chọn lại tại commit. Nếu state đã đổi bởi fusion/swap làm thẻ cũ không còn hợp lệ, refresh hợp lệ với feedback, không tiêu level/reroll hoặc apply nhầm.
- Giữ draftId/rerollUsed và số pending lựa chọn khi chỉ refresh vì mutation hợp lệ; không reset ngân sách để exploit.
- Nếu base chưa đủ nhưng pool rỗng, đây là lỗi eligibility/config cần sửa và test; không giả thành mastery hoặc ép replacement. Có đường fallback không khóa UI, đồng thời dev report nêu lỗi để không che nguyên nhân.

## 6. Tiến hóa phải thực hiện được ngay từ Balo đang pause

### 6.1 Eligibility độc lập

Dùng một recipe predicate cho cả UI và action validation:

- Recipe Quasar: có Pulsar Beam cấp5 và Ion Storm cấp5 thật trong run hiện tại, output chưa có và recipe chưa consume.
- Không yêu cầu hai supports max hoặc toàn bộ base hoàn tất mới được tiến hóa, trừ khi có một yêu cầu thiết kế mới rõ ràng ngoài hotfix này.
- Không yêu cầu state playing; Balo/draft đang pause là context hợp lệ cho một action quản lý build.
- Run đã victory/defeat/disposed thì không xử lý. Thiếu nguyên liệu/output không đăng ký phải có lý do, không return im lặng trong khi UI vẫn ghi sẵn sàng.
- Vai trò chính/phụ/bổ sung không làm mất nguyên liệu hợp lệ trong recipe. Dùng weapon ID thực, không filter sai theo category.

### 6.2 Dispatch khi pause mà không chạy simulation

- UI action tiến hóa phải được resolve trong một đường xử lý hợp lệ khi pause; nếu dùng command queue, queue UI management phải được drain mà không cần bước movement/combat.
- Không bật playing, tăng timeScale, unpause physics hoặc tick mô phỏng một frame chỉ để chạy evolution.
- Trong lúc commit: simulation time, enemy, projectile, event duration, damage, charge Beacon và Corruption giữ nguyên.
- Có thể stage/create/dispose presentation resources hợp lệ theo scene lifecycle, không yêu cầu resume gameplay để tạo module mới.
- Khi tiến hóa từ Balo mở qua B, đóng về đúng pause context. Khi từ Balo mở trong draft, trở lại đúng draft/pending level/reroll.

### 6.3 Giao dịch Quasar all-or-nothing

1. Lấy snapshot/reference session hiện hành, khóa action để chống double click.
2. Validate recipe, ingredient IDs/instance IDs/levels, output definition, behavior và asset/fallback cần thiết.
3. Chuẩn bị output hợp lệ trước khi thực hiện thay đổi không thể đảo ngược lên nguồn. Không destroy nguồn rồi mới tìm factory output.
4. Commit một lần: thay hai module nguồn bằng **Quasar Cannon cấp5**, giữ một ô output và giải phóng ô nguồn còn lại theo thiết kế1.4.
5. Cleanup owners/attacks của Pulsar/Ion; output có behavior thật hoạt động khi resume, không chỉ một entry UI.
6. Tính lại derived stats và điều kiện base complete; publish revision/event cho HUD/Build/catalog/recipe.
7. Chỉ hiện thông báo “Đã tiến hóa” sau commit thật. Nếu lỗi, giữ/khôi phục state hợp lệ, dispose staged resources, trả lý do rõ; không mất nguyên liệu hoặc tạo module nửa chừng.

Mức all-or-nothing phải phù hợp engine đang có, không cần dựng transaction framework phức tạp. Quan trọng là không có đường fail để mất đồ, clone đồ hoặc vừa nguồn vừa output cùng gây damage.

Output phải có:

- Stable ID đúng registry và level/maxLevel hợp lệ.
- Ownership/slot instance mới hoặc mapping rõ, không reuse cooldown/visited set cũ sai.
- Source damage/evolution metadata đúng, hit giới hạn, VFX và weapon behavior khác nguồn.
- Tooltip/HUD/Build icon Quasar và không còn nút “sẵn sàng” cho cùng recipe đã dùng.
- Không tiêu XP, một lựa chọn level-up, reroll, tiền hoặc support cấp. Không reset mastery/salvage đã kiếm.

### 6.4 Hình thái đơn ở cấp5

Kiểm tra các tiến hóa đơn đã có: Plasma→Mini Sun→Supernova, Orbital Drones→Orbital Bastion và Gravity Well→Singularity Well.

- Đạt cấp tương ứng phải đổi hình thái/behavior theo definitions thật, giữ slot/level/ID nguồn phù hợp.
- Nếu giao diện có nút tiến hóa cho hình thái đơn thì nút cũng phải đi qua action thật; nếu hệ tự tiến hóa, không dựng nút giả yêu cầu bấm nhưng không làm gì.
- Không thêm recipe/vũ khí mới hoặc thay đổi balance ngoài việc sửa sai thực thi. Không chỉ đổi tên/icon trong Balo trong khi behavior còn cấp cũ.

## 7. Quy tắc sau hợp nhất và điều kiện năm ô

Đây là thay đổi có chủ đích so beta 1.4 cũ:

- Hợp nhất Pulsar5+Ion5 tạo Quasar5 và một ô vũ khí trống.
- Ô trống là **chưa hoàn thiện**, không được giả là một slot max bằng completion credit/latch cũ.
- Các level tiếp theo có thể lấp ô trống bằng module hợp lệ và nâng nó, đồng thời hoàn thiện supports. Không reset Quasar hoặc module còn lại.
- Giữ rule không đề nghị lại hai nguyên liệu đang bị consume khi Quasar còn trang bị nếu đó là chống duplicate của base. Registry còn các module khác phải cho phép lấp ô hợp lệ; không rơi vào empty pool do filter sai.
- Nếu mọi thứ đã max trước fusion, sau fusion tạm rời mastery vì thiếu một ô. Khi đủ ba vũ khí và hai hỗ trợ đều max lần nữa, mastery tiếp tục với budget đã dùng trước đó.
- Không bắt buộc người chơi tiến hóa mới được vào mastery; recipe optional. Một build năm ô max chưa tiến hóa Quasar vẫn đủ điều kiện nhận+2%.

Ví dụ:

```text
Trước fusion:
  Supernova5, Pulsar5, Ion5, HP-support1, support-trống
  → base chưa hoàn tất, chỉ số mastery không được tiếp tục tăng.

Sau fusion:
  Supernova5, Quasar5, module-trống, HP-support1, support-trống
  → tiến hóa thành công, nhưng base vẫn chưa hoàn tất.

Sau hoàn thiện:
  Supernova5, Quasar5, module mới5, support-A max, support-B max
  → base hoàn tất, các draft sau mới là mastery +2%.
```

Tên support trong ví dụ chỉ minh họa, không suy stat từ icon ảnh; runtime dùng state thật.

## 8. UI và quan sát lỗi

- Build bỏ câu sai “vũ khí hoàn tất nên chỉ mastery” khi supports còn thiếu. Thay bằng progress đủ/max của năm ô và điều kiện còn thiếu.
- Ô vũ khí/support trống hiển thị khác ô có đồ nhưng dưới max; icon dấu cộng không được biến mất khỏi kiểm tra completion.
- Nút tiến hóa ready phải phản ánh đúng predicate. Trong action đang xử lý có trạng thái ngắn, chặn click trùng; không xoay loading vô hạn.
- Sau thành công, thấy Quasar5 ngay, hai nguyên liệu đã consume và slot trống được thể hiện rõ; đóng mở B không cần để ép refresh.
- Khi fail do state đổi/thiếu điều kiện, thông báo người dùng dễ hiểu; chi tiết stack/ID nội bộ để dev log, không đẩy ra UI.
- Debug tạm có thể ghi action ID, run revision, state trước/sau, recipe result và reason; dev-only, không log mỗi frame hoặc lộ dữ liệu người dùng.
- UI refresh không phải bằng cách đóng Balo, resume game rồi mở lại. Phải sửa state flow/subscription thật.
- Đảm bảo font/focus/scroll/keyboard hiện hành không bị regression. Esc/B trở về đúng context, không click xuyên draft.

## 9. Regression tests cần có

Viết test ý nghĩa với fixtures từ ảnh, dùng công cụ đang có. Unit test không thay thế browser test click thật vào nút tiến hóa.

### Completion và draft

| Ca | State | Kết quả mong muốn |
|---|---|---|
| P01 | Ba weapon5, supports trống cả hai | Base mode, có nhận hỗ trợ, không mastery |
| P02 | Ba weapon5, một support1, một trống | Base mode đúng như ảnh |
| P03 | Ba weapon5, hai supports đã chọn nhưng một chưa max | Tiếp tục nâng support còn thiếu |
| P04 | Weapon còn level4, hai supports max | Nâng weapon, không mastery |
| P05 | Ba weapon5 và hai supports max | Mastery+2% xuất hiện |
| P06 | Mảng slot thiếu/null/hole/definition lỗi | Không được coi hoàn tất |
| P07 | Chọn nâng cấp cuối làm ô thứ5 đạt max | Không bonus miễn phí; draft kế mới mastery |
| P08 | Reroll trong P02/P03 | Cùng luật base; không ép replacement hoặc mastery |
| P09 | Multi-level XP đi qua ranh hoàn tất | Các draft sau dùng state mới, XP/lượt không mất |
| P10 | Mastery đã dùng18%, sau đó base bị thiếu ô | Giữ bonus18%, không cho thêm mastery tới khi đủ lại |
| P11 | Base hoàn tất lại, mastery 18%/20% | Chỉ còn ngân sách2%, không reset budget |
| P12 | Mastery cap, fullHP | Fallback/Tiếp tục, không modal khóa hoặc ép đổi weapon |

### Evolution

| Ca | Context/action | Kết quả mong muốn |
|---|---|---|
| E01 | Pulsar5+Ion5, Balo mở bằng B khi pause, click tiến hóa | Quasar5 thật, consume đúng hai nguồn, slot trống |
| E02 | Cùng state nhưng supports chưa đủ | Vẫn tiến hóa được; không vào mastery sớm |
| E03 | Balo mở từ draft đang có reroll đã dùng | Fusion đúng; không mất draft hoặc hồi reroll |
| E04 | Double click/keypress liên tục | Một output, không mất đồ hoặc reward trùng |
| E05 | Thiếu một nguyên liệu/level chưa đủ | Không commit, lý do rõ, state không đổi |
| E06 | Output registry/factory lỗi được mô phỏng | Fail an toàn, không consume nguồn nửa chừng |
| E07 | UI closure cũ sau draft/mutation | Action đọc session thật, không đụng state cũ |
| E08 | Sau fusion đóng Balo/resume | Quasar bắn/gây damage đúng behavior; nguồn không tiếp tục damage |
| E09 | Sau fusion mở Balo lại | Không recipe ready cũ/duplicate, Quasar5 còn đúng |
| E10 | Auto evolution module đơn tại max | Behavior/hình thái/level đúng, không chỉ đổi nhãn |

### Pause, nguồn chỉ số và vòng đời

- Trong toàn bộ thời gian mở Balo/confirm/commit, simulationSeconds, charge, enemy position, boss/event timers và Corruption không tiến thêm.
- Supports/salvage/mastery/Corruption/event chỉ áp một lần lên Quasar và hình thái đơn, không giữ hai nguồn damage sau cleanup.
- Save hồ sơ cũ giữ tiền/core/Echo/achievement/settings. Nếu không hỗ trợ resume run thì không tự thêm resume vào hotfix.
- Restart dọn handler/owners, không dùng cờ completion của run trước. Chơi lại nhiều lần không nhân listener hoặc trạng thái ready.
- Giữ damage/TTK/slot limit/reroll/two-phase boss/events của base ngoài thay đổi được yêu cầu. Không mở thêm nội dung để che lỗi.

## 10. Xử lý run hiện tại và compatibility

- Khi state đã có mastery vì bug nhưng base chưa đủ, recalculation chuyển draft về base đúng; giữ bonus đã kiếm và budget used, không trừng phạt người chơi bằng reset run/profile.
- Trong session chạy sau hotfix, invalid draft cũ phải được revalidated/refresh an toàn. Không apply thẻ +2% stale sau khi base predicate false.
- Không cố sửa một trang đang chạy bằng cách đổi save thủ công hoặc xóa localStorage. Ghi cách áp patch/reload phù hợp với dự án và chính sách run dang dở thật.
- Nếu repo có resume-run, migrate completion/mode từ slot state thật thay vì tin cờ lưu cũ; normalize có giới hạn và không mất module. Nếu không có resume-run, chỉ giữ compatibility profile, không bịa tính năng.
- Stable weapon/evolution/support IDs không đổi để tiện code. Nếu phải alias ID sai, có mapping/test và cập nhật registry toàn bộ.

## 11. Tài liệu comment và bàn giao

Cập nhật GAME_SPEC/acceptance/status/changelog và architecture khi state/action flow thay đổi. Ghi rõ hotfix này thay thế điều kiện mastery cũ của beta 1.4, không để hai đoạn trái nhau tồn tại mà không chỉ ra đoạn hết hiệu lực.

Comment tiếng Việt tại:

- Predicate đủ 3 weapon + 2 support, lý do không filter bỏ ô trống.
- Eligibility evolution độc lập với mastery và pause.
- UI action được xử lý khi pause nhưng không tick gameplay.
- Prepare/commit/cleanup transaction và refresh từ source of truth.
- Refresh draft sau fusion, XP queue và reroll preservation.
- Giữ budget mastery cũ, bỏ latch sai sau slot mutation.

Thực hiện:

1. Tái hiện hai lỗi và thêm test fail trước khi sửa nếu môi trường cho phép.
2. Sửa predicate/pool và evolution state/action flow; tránh UI-only workaround.
3. Chạy typecheck, unit/integration, build, browser/e2e theo scripts thật.
4. Kiểm tra thủ công hoặc browser automation thao tác Balo→Tiến hóa→đóng/resume, cùng các state thiếu support.
5. Ghi lệnh/kết quả, root cause đã xác nhận, các file/luật thay đổi và phần chưa chạy được. Không báo test pass khi chưa thực thi.

Không cần benchmark cả phiên bản nội dung mới cho một hotfix, nhưng kiểm tra fusion không leak effect/handler, pause không bị phá và draft không khóa game. Nếu có thay đổi hot path thì đo phần liên quan.

Báo cáo cuối bằng tiếng Việt: đã sửa nguyên nhân nào, cách thử, điều kiện chính xác để vào +2%, tiến hóa đã thay cả state và behavior ra sao, save/XP/reroll có giữ đúng không, test nào thực sự đã chạy.

**Tiêu chuẩn hoàn thành:** bấm tiến hóa trong Balo đang pause tạo được vũ khí tiến hóa thật; ba vũ khí max nhưng còn ô hỗ trợ trống hoặc chưa max vẫn được nâng cơ sở; chỉ khi đủ và max cả năm ô hiện hành mới chuyển sang mastery +2%, và không còn đường buộc reset vũ khí.
