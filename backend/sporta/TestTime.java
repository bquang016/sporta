import java.time.LocalDateTime;

public class TestTime {
    public static void main(String[] args) {
        String timestamp = "2026-08-20T08:52:00.123Z";
        try {
            LocalDateTime dt = LocalDateTime.parse(timestamp.replace("Z", ""));
            System.out.println("Parsed: " + dt);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
