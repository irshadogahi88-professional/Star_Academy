import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Make sure to populate this before running
const MONGODB_URI ="mongodb://css_db_user:Khan8687@ac-xemrf0r-shard-00-00.etvwgvt.mongodb.net:27017,ac-xemrf0r-shard-00-01.etvwgvt.mongodb.net:27017,ac-xemrf0r-shard-00-02.etvwgvt.mongodb.net:27017/mcqtest?ssl=true&replicaSet=atlas-ljoh4d-shard-0&authSource=admin&appName=Cluster0"


async function seed() {
  if (MONGODB_URI === "YOUR_MONGODB_URI_HERE") {
    console.log("Please replace the MONGODB_URI inside seedAdmin.mjs first.");
    return;
  }
  
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB.");

  const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    passwordHash: String,
    role: String
  });
  
  const User = mongoose.models.User || mongoose.model("User", UserSchema);

  const existingAdmin = await User.findOne({ email: "khan@chachar.com" });
  if (existingAdmin) {
    console.log("Admin already exists. Log in with: khan@chachar.com / Khan868%");
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash("Khan868%", 12);
  
  await User.create({
    name: "System Admin",
    email: "khan@chachar.com",
    passwordHash,
    role: "admin"
  });

  console.log("Admin user created successfully!");
  console.log("Email: khan@chachar.com");
  console.log("Password: Khan868%");
  
  process.exit(0);
}

seed();
