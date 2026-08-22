package com.backend.sporta.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatResponse {
    private String replyText; // Text trả lời từ Gemini
    private List<CardDto> cards; // Danh sách sân, slot, etc.
    private List<String> quickReplies; // Danh sách các gợi ý câu hỏi tiếp theo
}
