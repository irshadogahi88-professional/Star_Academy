const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/star_academy', {
      maxPoolSize: 100,
      minPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })
    console.log(`MongoDB Connected: ${conn.connection.host}`)

    // Automatically run migration for 28000 feeAmount
    try {
      const User = require('../models/User')
      const result = await User.updateMany(
        { 
          role: 'student', 
          $or: [
            { feeAmount: 5000 },
            { feeAmount: { $exists: false } },
            { feeAmount: null }
          ]
        },
        { 
          $set: { 
            feeAmount: 28000,
            feeDescription: 'One-Time Admission & Annual Session Fee (2026)'
          } 
        }
      )
      if (result.modifiedCount > 0) {
        console.log(`🚀 Database Auto-Migration: Updated ${result.modifiedCount} student fee records to 28,000 PKR.`)
      }
    } catch (migError) {
      console.error('Database migration check failed:', migError)
    }
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`)
    process.exit(1)
  }
}

module.exports = connectDB
