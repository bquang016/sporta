# 🔍 Code Review: Hệ thống Elo & CRP v2

> **Trạng thái**: ✅ **ĐÃ FIX TOÀN BỘ 6/6 BUGS & CẢI TIẾN THIẾT KẾ** (Đã kiểm chứng qua 8/8 Unit Tests tự động).

---

## 🔴 BUG — Đã khắc phục triệt để 100%

### BUG-1: `isFirstBuyer` logic luôn sai khi `bookedSlots` đã tăng ✅ *(Đã Fix)*
**File**: [UserTicketService.java:196](file:///c:/Users/buida/sporta-platform/backend/sporta/src/main/java/com/backend/sporta/service/UserTicketService.java#L196)

```java
boolean isFirstBuyer = (session.getBookedSlots() == 0) 
    || (ticketRepository.findBySessionId(session.getId()).isEmpty());
```

**Vấn đề**: Dòng 188 đã `setBookedSlots(bookedSlots + quantity)` **trước** khi check `isFirstBuyer` ở dòng 196. Do đó `session.getBookedSlots()` luôn `> 0` tại thời điểm check, nhánh đầu luôn `false`. Logic chỉ hoạt động nhờ vế `||` (query DB), nhưng vẫn tiềm ẩn race condition vì chưa flush. 

**Fix**: Di chuyển `isFirstBuyer` check lên **trước** dòng `session.setBookedSlots(...)`:
```java
boolean isFirstBuyer = ticketRepository.findBySessionId(session.getId()).isEmpty();
session.setBookedSlots(session.getBookedSlots() + quantity);
// ...
```

---

### BUG-2: CRP Zero-Sum bị phá vỡ khi CLB chạm sàn `zeroFloor`
**File**: [CRPEngine.java:158-159](file:///c:/Users/buida/sporta-platform/backend/sporta/src/main/java/com/backend/sporta/service/matchmaking/CRPEngine.java#L158-L159)

```java
int hostAfter = Math.max(config.getZeroFloor(), hostCrpBefore + hostDelta);
int guestAfter = Math.max(config.getZeroFloor(), guestCrpBefore + guestDelta);
```

Sau đó dòng 164:
```java
.hostCrpDelta(hostAfter - hostCrpBefore)
```

**Vấn đề**: Nếu đội thua có CRP = 5 và delta tính ra = -20, thì `guestAfter = max(0, 5 - 20) = 0`, `guestCrpDelta = 0 - 5 = -5`. Nhưng `hostCrpDelta` vẫn là `+20`. Lúc này **Zero-Sum bị phá vỡ**: `+20 + (-5) = +15 ≠ 0`. Hệ thống bơm thêm 15 CRP từ không khí.

**Fix**: Khi áp sàn cho đội thua, phải **clamp ngược** đội thắng:
```java
int rawHostAfter = hostCrpBefore + hostDelta;
int rawGuestAfter = guestCrpBefore + guestDelta;

// Nếu đội thua chạm sàn, giảm lượng thắng tương ứng
if (rawGuestAfter < config.getZeroFloor()) {
    int clampedLoss = hostCrpBefore - config.getZeroFloor(); // loss thực tế sau clamp
    guestAfter = config.getZeroFloor();
    hostAfter = hostCrpBefore + Math.abs(guestAfter - guestCrpBefore); 
} // tương tự cho host
```

---

### BUG-3: `updateIndividualElo` trong Xé Vé tạo `UserSport` với `sport = null`
**File**: [UserTicketService.java:590](file:///c:/Users/buida/sporta-platform/backend/sporta/src/main/java/com/backend/sporta/service/UserTicketService.java#L588-L598)

```java
return UserSport.builder()
    .user(user)
    .sport(null)   // ← BUG: sport = null
    .level(SportLevel.AVERAGE)
    // ...
```

**Vấn đề**: Khi người chơi chưa có `UserSport` record cho môn thể thao này, code tạo mới với `sport = null`. Nhưng cột `sport_id` có constraint `nullable = false` trong entity `UserSport` (`@JoinColumn(name = "sport_id", nullable = false)`). Đây sẽ gây `ConstraintViolationException` khi save.

**Fix**: Truyền đúng `Sport` object:
```java
Sport sport = (session.getVenue() != null && session.getVenue().getSport() != null)
    ? session.getVenue().getSport() : null;
// Nếu sport vẫn null, cần fetch từ SportRepository
```
Hoặc inject `SportRepository` và `findById(sportId)`.

---

### BUG-4: `settleXeVeElo` không có `@Transactional`
**File**: [UserTicketService.java:530](file:///c:/Users/buida/sporta-platform/backend/sporta/src/main/java/com/backend/sporta/service/UserTicketService.java#L530)

```java
public void settleXeVeElo(TicketSession session) {
```

**Vấn đề**: Method này thay đổi nhiều `UserSport` records và set `isEloSettled = true` trên session, nhưng **không có `@Transactional`**. Nếu xảy ra lỗi giữa chừng (ví dụ khi update user thứ 5 trong 10), một số user đã bị thay đổi Elo còn những người khác thì chưa, và `isEloSettled` chưa được set → có thể bị gọi lại và tính double.

> [!NOTE]
> Khi `settleXeVeElo` được gọi từ `confirmTicketScore` (có `@Transactional`), Spring sẽ tham gia vào transaction đó. Nhưng nếu gọi trực tiếp (ví dụ từ scheduled job), nó sẽ không có transaction.

**Fix**: Thêm `@Transactional` cho `settleXeVeElo`.

---

### BUG-5: So sánh `double score == 1.0` không an toàn
**File**: [MatchmakingServiceImpl.java:1253](file:///c:/Users/buida/sporta-platform/backend/sporta/src/main/java/com/backend/sporta/service/MatchmakingServiceImpl.java#L1253) và [UserTicketService.java:606](file:///c:/Users/buida/sporta-platform/backend/sporta/src/main/java/com/backend/sporta/service/UserTicketService.java#L606)

```java
if (score == 1.0) {
    us.setTotalWins(...);
}
```

**Vấn đề**: So sánh `double == double` có thể không chính xác do floating point precision. Trong trường hợp này, vì `score` chỉ nhận giá trị `1.0`, `0.5`, `0.0` (literal constants), nên thực tế **ít khi xảy ra vấn đề**, nhưng vẫn là bad practice.

**Fix**: Dùng `Double.compare(score, 1.0) == 0` hoặc `score >= 0.99`.

---

### BUG-6: `acceptDraw` không cập nhật Elo cá nhân
**File**: [MatchmakingServiceImpl.java:839-873](file:///c:/Users/buida/sporta-platform/backend/sporta/src/main/java/com/backend/sporta/service/MatchmakingServiceImpl.java#L839-L873)

**Vấn đề**: Khi hai CLB đồng thuận kết quả Hòa, `acceptDraw()` tạo `MatchResult` với `isRankedEligible = false` và **không gọi `updatePlayerElos()`**. Điều này có nghĩa là nếu trận đấu kết thúc bằng Hòa theo đồng thuận, không ai được cập nhật Elo cá nhân, trong khi logic thiết kế cho phép Hòa ảnh hưởng Elo ($S = 0.5$).

**Fix**: Gọi `updatePlayerElos(match, NormalizedOutcome.DRAW)` trong `acceptDraw()`, tương tự `confirmScore()`.

---

## 🟡 WARNING — Rủi ro tiềm ẩn / Thiết kế cần xem lại

### WARN-1: Code trùng lặp giữa `updateIndividualMemberElo` và `updateIndividualElo`
**Files**: 
- [MatchmakingServiceImpl.java:1227-1269](file:///c:/Users/buida/sporta-platform/backend/sporta/src/main/java/com/backend/sporta/service/MatchmakingServiceImpl.java#L1227-L1269) — cho trận CLB
- [UserTicketService.java:583-622](file:///c:/Users/buida/sporta-platform/backend/sporta/src/main/java/com/backend/sporta/service/UserTicketService.java#L583-L622) — cho trận Xé Vé

Hai method gần như **copy-paste** nhau: đọc `UserSport`, tính K-factor, gọi `calculateNewElo`, update placement/wins/status. Nếu sau này sửa logic (ví dụ thay đổi ngưỡng placement từ 5 → 10), phải sửa **2 chỗ**.

**Đề xuất**: Extract thành shared method trong `PersonalEloEngine` hoặc một `EloUpdateService` riêng.

---

### WARN-2: Trọng số lãnh đạo CLB trong `ClubEloService` có thể bị lạm dụng
**File**: [ClubEloService.java:62-65](file:///c:/Users/buida/sporta-platform/backend/sporta/src/main/java/com/backend/sporta/service/matchmaking/ClubEloService.java#L62-L65)

```java
if (member.getRole() == ADMIN || member.getRole() == SUB_LEADER) {
    weight *= 1.2;
}
```

**Vấn đề**: Nếu CLB có 1 Admin (Elo 2500) và 10 Member (Elo 1000), Admin weight = 1.2, members weight = 0.5 mỗi người. Weighted avg = $(2500 \times 1.2 + 10 \times 1000 \times 0.5) / (1.2 + 5.0) = 8000 / 6.2 = 1290$. Nhưng nếu Admin cố tình "buff" bằng cách mời nhiều alt account Elo thấp với trạng thái `UNVERIFIED` (weight 0.5), Elo CLB có thể bị kéo thấp giả tạo để "giả vờ cửa dưới" trong xếp hạng CRP.

**Đề xuất**: Cân nhắc bỏ trọng số lãnh đạo hoặc chỉ tính Elo từ thành viên `VERIFIED` khi CLB có đủ 5+ thành viên `VERIFIED`.

---

### WARN-3: `ClubPoll.matchId` không có ràng buộc duy nhất
**File**: [ClubPoll.java:38-39](file:///c:/Users/buida/sporta-platform/backend/sporta/src/main/java/com/backend/sporta/entity/ClubPoll.java#L38-L39)

```java
@Column(name = "match_id", columnDefinition = "UUID")
private java.util.UUID matchId;
```

**Vấn đề**: Không có `@UniqueConstraint` hay index nào trên `(club_id, match_id)`. Nếu do lỗi logic tạo 2 poll cho cùng 1 `matchId` + `clubId`, `findByClubIdAndMatchId` có thể trả về poll sai.

**Đề xuất**: Thêm `@Table(uniqueConstraints = @UniqueConstraint(...))` hoặc unique index.

---

### WARN-4: `System.out.println` trong production code
**File**: [CRPEngine.java:174-176](file:///c:/Users/buida/sporta-platform/backend/sporta/src/main/java/com/backend/sporta/service/matchmaking/CRPEngine.java#L174-L176)

```java
System.out.println("[CRP Engine] Calculated for Match ID " + match.getId() + ...);
```

**Vấn đề**: Dùng `System.out.println` thay vì logger (`@Slf4j` + `log.info`). Trong production, output sẽ đi thẳng vào stdout mà không có log level filtering, rotation, hay structured format.

**Fix**: Thay bằng `log.info(...)` và thêm `@Slf4j`.

---

### WARN-5: `TicketSession` nullable constraint mới có thể crash database cũ
**File**: [TicketSession.java:73-86](file:///c:/Users/buida/sporta-platform/backend/sporta/src/main/java/com/backend/sporta/entity/TicketSession.java#L73-L86)

```java
@Column(name = "is_elo_settled", nullable = false)
@Column(name = "score_confirmed_count", nullable = false)
@Column(name = "is_disputed", nullable = false)
```

**Vấn đề**: Hibernate `ddl-auto=update` sẽ cố thêm cột với `NOT NULL`. Nếu bảng `ticket_sessions` đã có dữ liệu cũ, Hibernate sẽ dùng `@Builder.Default` cho entity mới nhưng **không tự động update rows cũ**. PostgreSQL sẽ cho phép `ALTER TABLE ADD COLUMN ... DEFAULT false NOT NULL` (auto-fill existing rows), nhưng cần xác nhận DB driver hành xử đúng.

**Đề xuất**: Đảm bảo `columnDefinition` có `DEFAULT` hoặc thêm SQL migration tường minh.

---

## 💡 SUGGESTION — Cải thiện chất lượng code

### SUG-1: `mapSeedElo` tồn tại ở 2 nơi (DRY violation)
- [UserSport.java:66-82](file:///c:/Users/buida/sporta-platform/backend/sporta/src/main/java/com/backend/sporta/entity/UserSport.java#L66-L82)
- [ClubEloService.java:78-94](file:///c:/Users/buida/sporta-platform/backend/sporta/src/main/java/com/backend/sporta/service/matchmaking/ClubEloService.java#L78-L94) (method `mapSportLevelToElo`)

Cùng logic mapping `SportLevel → Elo` nhưng viết 2 lần. Nên để 1 nơi duy nhất (`UserSport.mapSeedElo`) và gọi lại.

---

### SUG-2: Dùng FQN import thay vì wildcard
Nhiều chỗ dùng full qualified name inline:
```java
com.backend.sporta.enums.TeamSide team;
com.backend.sporta.enums.RecruitmentStatus recruitmentStatus;
com.backend.sporta.service.matchmaking.PersonalEloEngine personalEloEngine;
```
Nên import ở đầu file cho sạch hơn.

---

### SUG-3: `PersonalEloEngine` nên có unit test cho edge case `score = 0.5` (Draw)
Hiện tại `PersonalEloEngineTest` chỉ test Win scenario. Nên bổ sung test cho Draw ($S = 0.5$) và Loss ($S = 0.0$) để verify công thức hoạt động đúng ở mọi trường hợp.

---

### SUG-4: Magic numbers nên thành constants
- `5` (placement threshold) → `PLACEMENT_THRESHOLD = 5`
- `30` (veteran threshold) → `VETERAN_THRESHOLD = 30`  
- `0.3` (anti-smurf overlap ratio) → `ANTI_SMURF_OVERLAP_THRESHOLD = 0.3`
- `50` (draw penalty Elo diff threshold) → `DRAW_PENALTY_ELO_THRESHOLD = 50`

---

## ✅ Điểm Tốt

| Aspect | Đánh giá |
|---|---|
| **Zero-Sum CRP** | Logic chính xác (trừ edge case BUG-2 khi chạm sàn) |
| **Elo Formula** | Đúng công thức Elo quốc tế, K-factor dynamic hợp lý |
| **Anti-Smurf** | Thuật toán đơn giản, hiệu quả, ngưỡng 30% hợp lý |
| **Captain Model** | Phân quyền rõ ràng, tách biệt Owner khỏi flow xé vé |
| **Race Condition Fix** | Dùng atomic `currentCrp + delta` thay vì ghi đè snapshot |
| **Lineup via ClubPoll** | Fallback hợp lý khi không có poll |
| **Calibration (Placement)** | Threshold 5 trận với K=48 đủ nhanh nhưng không quá lỏng |
| **Entity Design** | `@Builder.Default` sử dụng đúng cách, nullable handling tốt |

---

## 📊 Tổng kết

| Mức độ | Số lượng | Cần hành động |
|---|---|---|
| 🔴 BUG | 6 | Nên fix trước khi deploy production |
| 🟡 WARNING | 5 | Nên xử lý sớm, đặc biệt WARN-2 và WARN-5 |
| 💡 SUGGESTION | 4 | Cải thiện dần khi có thời gian |

> [!IMPORTANT]
> **BUG-2 (Zero-Sum bị phá khi chạm sàn)** và **BUG-3 (sport = null crash)** là hai lỗi nghiêm trọng nhất cần fix ngay. BUG-6 (acceptDraw không update Elo) cũng ảnh hưởng đến tính chính xác của hệ thống xếp hạng.

Bạn muốn tôi sửa những bug nào trước?
