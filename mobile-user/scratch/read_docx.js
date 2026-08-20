const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { execSync } = require('child_process');

// We can use powershell to read docx or zip extraction
const docxPath = 'd:\\Sporta\\sporta\\Ke_hoach_FE_Matchmaking_Sporta_V2_Ranking_First.docx';

try {
  const psCommand = `Add-Type -AssemblyName System.IO.Compression.FileSystem; $zip = [System.IO.Compression.ZipFile]::OpenRead('${docxPath}'); $entry = $zip.Entries | Where-Object { $_.FullName -eq 'word/document.xml' }; $stream = $entry.Open(); $reader = New-Object System.IO.StreamReader($stream); $xml = $reader.ReadToEnd(); $reader.Close(); $stream.Close(); $zip.Dispose(); $xml -replace '<[^>]+>', ' '`;
  const result = execSync(`powershell -Command "${psCommand}"`, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
  // Clean up extra spaces
  const cleanText = result.replace(/\s+/g, ' ').trim();
  console.log("=== DOCX CONTENT ===");
  console.log(cleanText);
  fs.writeFileSync('d:\\Sporta\\sporta\\mobile-user\\scratch\\docx_extracted.txt', cleanText, 'utf8');
} catch (e) {
  console.error("Error reading docx:", e);
}
