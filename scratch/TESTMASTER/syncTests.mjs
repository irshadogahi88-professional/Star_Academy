import mongoose from "mongoose";
import fs from "fs";

const envContent = fs.readFileSync(".env.local", "utf8");
const match = envContent.match(/MONGODB_URI="(.*?)"/);

async function sync() {
  await mongoose.connect(match[1]);
  const Test = mongoose.models.Test || mongoose.model("Test", new mongoose.Schema({ isPublished: Boolean, chapterId: mongoose.Schema.Types.ObjectId, title: String }));
  const MCQ = mongoose.models.MCQ || mongoose.model("MCQ", new mongoose.Schema({ chapterId: mongoose.Schema.Types.ObjectId, isActive: Boolean }));

  const tests = await Test.find({ isPublished: true });
  for (const t of tests) {
    if (t.chapterId) {
      const activeMcqs = await MCQ.countDocuments({ chapterId: t.chapterId, isActive: true });
      if (activeMcqs === 0 && !t.title.includes("Biology Quiz")) {
         t.isPublished = false;
         await t.save();
         console.log(`Unpublished test: ${t.title}`);
      }
    }
  }
  process.exit(0);
}
sync();
