# Playtest beta1.4 · 2026-10-17 (hồ sơ lịch sử)

Luật mastery ba vũ khí/latch trong thử nghiệm này đã bị hotfix1.4.1 thay thế. Không dùng kết quả này để chứng nhận luật năm ô mới; xem balance-v1.4.1.md.

Đây là thử nghiệm bằng bot, không phải tỷ lệ thắng của người thật. Ma trận có 18 ca: seed 7/42/104 × ba cặp hỗ trợ × bật/tắt hợp nhất. Bot chạy fixed-step 60 Hz tăng tốc, chọn qua draft/reroll và nhặt XP/drop thật; không tăng HP, thời gian hoặc XP. Hợp nhất chủ động khi đủ điều kiện trong draft. Hỗ trợ ưu tiên có thể chưa tối đa khi mastery mở. Raw balance-playtest.json giữ checkpoint, chỉ số, trạng thái sự kiện, loot và ledger XP.

| Seed | Hỗ trợ | Fusion | Kết quả/s | Cấp/kills | HP tàu/Beacon | Mastery mở | Boss chết |
|---|---|---|---|---|---|---|---|
| 7 | power/haste | Không | defeat/626,7 | 28/841 | -8,65/300 | 321,12 | Chưa |
| 7 | power/haste | Có | victory/720 | 33/1009 | 110/300 | 321,12 | 583,1 |
| 7 | hull/armor | Không | defeat/685,97 | 30/938 | -8,91/300 | 295,55 | Chưa |
| 7 | hull/armor | Có | victory/720 | 34/1002 | 128/300 | 295,55 | 594,33 |
| 7 | engine/magnet | Không | victory/720 | 34/1000 | 107,5/300 | 283,77 | 620,52 |
| 7 | engine/magnet | Có | victory/720 | 34/1007 | 107/300 | 283,77 | 602,25 |
| 42 | power/haste | Không | victory/720 | 34/1003 | 111,5/300 | 374,27 | 593,58 |
| 42 | power/haste | Có | victory/720 | 34/1005 | 107,5/300 | 374,27 | 577,93 |
| 42 | hull/armor | Không | defeat/688,9 | 30/948 | -3,25/300 | 286,53 | Chưa |
| 42 | hull/armor | Có | defeat/593,6 | 27/765 | -11,84/300 | 286,53 | Chưa |
| 42 | engine/magnet | Không | defeat/636,82 | 29/851 | -8,03/300 | 254,12 | Chưa |
| 42 | engine/magnet | Có | victory/720 | 32/1003 | 105,5/300 | 254,12 | 638,95 |
| 104 | power/haste | Không | defeat/664,78 | 29/898 | -3,65/300 | 273,13 | Chưa |
| 104 | power/haste | Có | victory/720 | 34/1009 | 107/300 | 273,13 | 592,88 |
| 104 | hull/armor | Không | victory/720 | 34/1008 | 122/300 | 272,62 | 616,32 |
| 104 | hull/armor | Có | victory/720 | 33/1009 | 116,5/300 | 272,62 | 579,92 |
| 104 | engine/magnet | Không | victory/720 | 33/1003 | 110/300 | 282,05 | 623,85 |
| 104 | engine/magnet | Có | victory/720 | 33/1003 | 112/300 | 282,05 | 595,45 |

12/18 ca thắng: không hợp nhất 4/9, hợp nhất 8/9. Không coi những ca thua là lỗi hoặc né không thể, cũng không coi bot thắng là dễ. Mastery budgettấtcả≤2000bp, salvage capHits tổng0, XPcreated=collected+ground ởmọica. Một số case không có bossdeath vẫn theo luật thắng/thua720.

## TTK và tradeoff fusion

Fixture tĩnh không wave/support/gear, hai nguồn Pulsar5+Ion5 so Quasar5; boss nằm ngoài vùng sáng, tàu cách200u. Mastery case dành toàn20%cho damage để kiểm tra nguồn/cap, không mô tả build ngẫu nhiên. Đàn20Drifter quanh150u; durablecùnglayoutHP100000, đo10s chứ không coi là clear. Bossfixture không test né.

| Phiên bản/loadout | Case | Thời gian (s) | Damage10s hoặc kill |
|---|---|---|---|
| 1.3/sources | boss | 76,15 | 1 |
| 1.3/sources | cluster | 2,47 | 20 |
| 1.3/sources | durable | 10 | 18.498,37 |
| 1.4/sources | boss | 85,65 | 1 |
| 1.4/sources | cluster | 2,47 | 20 |
| 1.4/sources | durable | 10 | 18.498,37 |
| 1.4/mastery | boss | 72,35 | 1 |
| 1.4/mastery | cluster | 0,57 | 20 |
| 1.4/mastery | durable | 10 | 22.198,04 |
| 1.4/quasar | boss | 83,42 | 1 |
| 1.4/quasar | cluster | 3,43 | 20 |
| 1.4/quasar | durable | 10 | 22.810,92 |

Trước chỉnh boss: hai nguồn6000+3900HP=76,15s; mastery20%=63,02s; Quasar90°=72,15s nhưng clear8,18s so2,47s. Sau mởquạt240° (damage/rate/chain giữ), durable22.810,92 sohai nguồn18.498,37(+23,31%), clear3,43s so2,47s: fusion có lợi tầm510u/slot và sát thương tập trung, chưa thay thế toàn diện sweep360/chain6. Boss6900+4485:hai nguồn85,65s/mastery72,35s/Quasar83,42s, không chết tức thì.

BossHP+15%,damage+10%,rateđầu+10%(13/18win,hợp nhất 9/9), thử+5%(12/18,fusion8/9). Chọn+5%bảo thủ về nhịp, không suy winrate đơn điệu: alignmentpattern/rngdrop/nhặt thay đổi hành trình. Giữtelegraph1,8s,lock0,25s,transition1,25s,speed32. Raw*-pre-boss.json/*-rate10.json giữ nguyên để đối chiếu; sốfinal lấy từsourceconfig.

## Tương tác nguồn chỉ số và sự kiện

Unit/integration kiểm chứng support40%+gear10%+mastery2%=52% additive; damage×1,2Corruption×1,15chaos đúngmộtlần,rateinterval÷1,52; HP+2base tăng current2khônghồifull. Mastery10pick đạt2000bp, speed5pick1000bp, fallbackqueue/XPdư vàrời/quaymasterykhôngfarmbudget.

Chaos qua330/360/420 giữHP ratio; Drifterminute6 factorHP1,48×1,5=2,22,dmg1,42×1,5=2,13. Radiation4DPS trước armor/Corruption/cửa bảo vệ chung, quái2%maxHP cap10khôngoutgoingtàu; finalhit1credit/roll. Tide90sin/6s,radius420,base200thoát/0tạitâm/noNaN/noXPpull/cap155; scheduler skipgravity thường vàgiữ630. Events kếtthúc510trướcboss540.

Baseline1.3 unit83pass; baselinebrowserrepro/ảnh/state ởforced-replacement-before.*, không có hai ảnh tham chiếu tạiDownloads/workspace. Chưa chơi tay đủ12phút, cảm giác né/đọc màu/audio/GPU vật lý cần đánh giá thêm. Fullrender vàhiệunăng tách tại performance-report/status.
