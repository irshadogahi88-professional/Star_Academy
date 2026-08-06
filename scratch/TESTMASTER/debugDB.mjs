import mongoose from "mongoose";
import fs from "fs";

const envContent = fs.readFileSync(".env.local", "utf8");
const match = envContent.match(/MONGODB_URI="(.*?)"/);

async function check() {
  await mongoose.connect(match[1]);
  
  const Test = mongoose.models.Test || mongoose.model("Test", new mongoose.Schema({ title: String, chapterId: mongoose.Schema.Types.ObjectId, mcqIds: [mongoose.Schema.Types.ObjectId] }));
  const MCQ = mongoose.models.MCQ || mongoose.model("MCQ", new mongoose.Schema({ question: String, chapterId: mongoose.Schema.Types.ObjectId, isActive: Boolean }));

  const tests = await Test.find();
  for (const t of tests) {
    console.log(`Test: ${t.title}`);
    console.log(`  _id: ${t._id}`);
    console.log(`  chapterId: ${t.chapterId}`);
    console.log(`  mcqIds:`, t.mcqIds);
    const mcqsForTest = await MCQ.find({ chapterId: t.chapterId, isActive: true });
    console.log(`  Found ${mcqsForTest.length} MCQs via chapterId.`);
  }

  process.exit(0);
}
check();
