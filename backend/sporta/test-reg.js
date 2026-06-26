const fs = require('fs');
const path = require('path');

async function testRegistration() {
  try {
    const email = "testowner3@sporta.vn";
    const otp = "515399";

    // 1. Verify OTP
    console.log("Verifying OTP...");
    const verifyRes = await fetch("http://localhost:8387/api/v1/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp })
    });
    
    if (!verifyRes.ok) {
      throw new Error(`Verify failed: ${await verifyRes.text()}`);
    }
    
    const verifyData = await verifyRes.json();
    console.log("Verify OTP success:", verifyData);
    const registrationToken = verifyData.registrationToken;

    // 2. Register Owner
    console.log("Registering Owner...");
    
    // Create a dummy text file to act as an image
    const dummyFilePath = path.join(__dirname, 'dummy_image.txt');
    fs.writeFileSync(dummyFilePath, 'dummy image content');
    
    // Create a Blob from the file
    const fileBlob = new Blob([fs.readFileSync(dummyFilePath)], { type: 'text/plain' });

    const formData = new FormData();
    formData.append("registrationToken", registrationToken);
    formData.append("fullName", "Nguyen Van Test Owner");
    formData.append("idNumber", "079012345678");
    formData.append("venueName", "San Test Owner");
    formData.append("province", "Ho Chi Minh");
    formData.append("district", "Quan 1");
    formData.append("ward", "Ben Nghe");
    formData.append("sportTypes", '["FOOTBALL", "BASKETBALL"]');
    formData.append("subCourtCount", "4");
    formData.append("images", fileBlob, "dummy_image.txt");

    const registerRes = await fetch("http://localhost:8387/api/v1/auth/register-owner", {
      method: "POST",
      body: formData
    });

    if (!registerRes.ok) {
      throw new Error(`Register failed: ${await registerRes.text()}`);
    }

    const registerData = await registerRes.json();
    console.log("Register Owner success:", registerData);
    
    // Cleanup
    fs.unlinkSync(dummyFilePath);
    
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testRegistration();
