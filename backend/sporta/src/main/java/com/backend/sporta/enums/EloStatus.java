package com.backend.sporta.enums;

public enum EloStatus {
    UNVERIFIED,   // Chưa đấu trận nào → Elo = seed từ level
    CALIBRATING,  // Đang trong 5 trận Placement → K cao (K=48)
    VERIFIED      // Đã qua Placement → Elo ổn định
}
