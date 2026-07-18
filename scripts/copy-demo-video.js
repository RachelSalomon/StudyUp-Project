const fs = require("fs");
const path = require("path");

const parentDir = path.join(__dirname, "..", "..");
const dest = path.join(__dirname, "..", "client", "public", "studyup-demo.mp4");

function findSourceVideo() {
  const candidates = [
    path.join(parentDir, "new.mp4"),
    path.join(parentDir, "סירטון המחשה.mp4"),
  ];

  for (const file of candidates) {
    if (fs.existsSync(file)) return file;
  }

  if (!fs.existsSync(parentDir)) return null;

  const mp4Files = fs
    .readdirSync(parentDir)
    .filter((name) => name.toLowerCase().endsWith(".mp4"))
    .map((name) => path.join(parentDir, name));

  return mp4Files[0] || null;
}

const src = findSourceVideo();

console.log("Looking in:", parentDir);
console.log("Source:", src || "(not found)");
console.log("Dest:  ", dest);

if (!src) {
  console.error("\nERROR: No .mp4 file found next to StudyUp-Project.");
  console.error("Expected:");
  console.error("  ...\\אנדרואיד 2\\new.mp4");
  console.error("\nManual fix: copy your video into:");
  console.error("  StudyUp-Project\\client\\public\\studyup-demo.mp4");
  process.exit(1);
}

fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.copyFileSync(src, dest);

const sizeMb = (fs.statSync(dest).size / 1024 / 1024).toFixed(2);
console.log("\nSuccess! Video copied (" + sizeMb + " MB)");
console.log("Refresh the Tour page in the browser (F5).");
