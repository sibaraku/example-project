const express = require('express')
const cors = require('cors')
const db = require('./models')

const healthRoutes = require('./routes/health')
const importRoutes = require('./routes/import')
const readingRoutes = require('./routes/reading')
const syncRoutes = require('./routes/priceSync')

const app = express()

app.use(express.json())
app.use(cors())

app.use('/api', healthRoutes)
app.use('/api', importRoutes)
app.use('/api', readingRoutes)
app.use('/api', syncRoutes)

// Global error handler middleware
app.use((error, req, res, next) => {
  console.error('Error:', error)
  
  // Don't expose stack trace to client
  const statusCode = error.statusCode || 500
  const message = error.message || 'An error occurred. Please try again.'
  
  res.status(statusCode).json({
    error: message
  })
})

const PORT = process.env.PORT || 3001

db.sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
  })
}).catch(err => {
  console.error('Failed to sync database:', err)
  process.exit(1)
})

module.exports = app