const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const helmet = require('helmet')
const mongoSanitizeSafe = require('./middleware/mongoSanitize')
const xssClean = require('./middleware/xss')
const rateLimit = require('express-rate-limit')
const connectDB = require('./config/db')

// Load environment variables
dotenv.config()

const app = express()

// Trust proxy if behind a load balancer/reverse proxy
app.set('trust proxy', 1)

// Connect to database
connectDB()

// Enable CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}))

// Security headers
app.use(helmet())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' }
})

app.use('/api', limiter)
app.use(express.json({ limit: '15mb' }))
app.use(express.urlencoded({ extended: true, limit: '15mb' }))

// Data Sanitization against NoSQL Query Injection
app.use(mongoSanitizeSafe())

// Data Sanitization against Cross-Site Scripting (XSS)
app.use(xssClean())

app.use(cookieParser())

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    academy: 'Star Educational Academy, Ghotki',
    session: '2026',
    timestamp: new Date().toISOString(),
  })
})

// Route Mounting
app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api/lectures', require('./routes/lectureRoutes'))
app.use('/api/tests', require('./routes/testRoutes'))
app.use('/api/attempts', require('./routes/attemptRoutes'))
app.use('/api/admin', require('./routes/adminRoutes'))
app.use('/api/faculty', require('./routes/facultyRoutes'))
app.use('/api/success-stories', require('./routes/successStoryRoutes'))
app.use('/api/hero-slides', require('./routes/heroSlideRoutes'))
app.use('/api/gallery', require('./routes/galleryRoutes'))
app.use('/api/settings', require('./routes/settingsRoutes'))
app.use('/api/messages', require('./routes/messageRoutes'))
app.use('/api/milestones', require('./routes/milestoneRoutes'))
app.use('/api/audit-logs', require('./routes/auditLogRoutes'))

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`🚀 Star Educational Academy API running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`)
  
  // Render Free Tier Keep-Alive (Ping every 13 minutes to prevent sleep)
  const selfUrl = process.env.RENDER_EXTERNAL_URL || process.env.CLIENT_URL;
  if (selfUrl && process.env.NODE_ENV === 'production') {
    const https = require('https');
    setInterval(() => {
      console.log('Sending keep-alive ping to prevent Render sleep...');
      https.get(`${selfUrl}/api/health`, (resp) => {
        if (resp.statusCode === 200) {
          console.log('Keep-alive ping successful.');
        }
      }).on('error', (err) => {
        console.error('Keep-alive ping failed:', err.message);
      });
    }, 13 * 60 * 1000); // 13 minutes
  }
})
