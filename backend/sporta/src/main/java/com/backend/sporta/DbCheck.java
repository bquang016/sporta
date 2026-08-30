package com.backend.sporta;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class DbCheck {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://localhost:5432/sporta_database";
        String user = "sporta_dev";
        String password = "sporta_password";

        try (Connection conn = DriverManager.getConnection(url, user, password);
             Statement stmt = conn.createStatement()) {
             
            System.out.println("--- OWNER_REGISTRATIONS ---");
            ResultSet rs = stmt.executeQuery("SELECT id, venue_name, is_contract_signed, signature_timestamp FROM owner_registrations ORDER BY id DESC LIMIT 5");
            while (rs.next()) {
                System.out.println("ID: " + rs.getString("id") + ", Venue: " + rs.getString("venue_name") + ", isSigned: " + rs.getBoolean("is_contract_signed") + ", signatureTime: " + rs.getString("signature_timestamp"));
            }
            
            System.out.println("\n--- OWNER_CONTRACTS ---");
            ResultSet rs2 = stmt.executeQuery("SELECT * FROM owner_contracts");
            int count = 0;
            while (rs2.next()) {
                count++;
                System.out.println("Contract ID: " + rs2.getString("id") + ", Code: " + rs2.getString("contract_code") + ", OwnerId: " + rs2.getString("owner_id"));
            }
            System.out.println("Total contracts: " + count);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
