import fs from "fs";

const envContent = fs.readFileSync(".env.local", "utf8");
const keyMatch = envContent.match(/GEMINI_API_KEY="(.*?)"/);
if (!keyMatch) {
  console.log("No API key found");
  process.exit(1);
}

async function check() {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${keyMatch[1]}`);
      const data = await res.json();
      console.log(data.models.map(m => m.name).join("\n"));
    } catch(e) {
      console.error(e);
    }
}
check();
