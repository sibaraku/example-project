const express = require('express')
const cors = require('cors')

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

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})