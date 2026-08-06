import mongoose from "mongoose";
import fs from "fs";
import { resolve } from "path";

const envFile = fs.readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
let uri = "";
envFile.split("\n").forEach(line => {
  if (line.startsWith("MONGODB_URI=")) {
    uri = line.split("MONGODB_URI=")[1].trim().replace(/^['"]|['"]$/g, '');
  }
});

const SubjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const Subject = mongoose.models.Subject || mongoose.model("Subject", SubjectSchema);

async function seed() {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB.");

    const names = [
      "Biology", 
      "Chemistry", 
      "Physics", 
      "English", 
      "Logical Reasoning", 
      "Quantitative", 
      "ECAT", 
      "MCAT", 
      "General"
    ];

    let added = 0;
    for (const name of names) {
      const existing = await Subject.findOne({ name: new RegExp(`^${name}$`, 'i') });
      if (!existing) {
        await Subject.create({ name });
        added++;
        console.log(`Added subject: ${name}`);
      } else {
        console.log(`Subject already exists: ${name}`);
      }
    }

    console.log(`Seeding complete. Added ${added} new subjects.`);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

seed();
