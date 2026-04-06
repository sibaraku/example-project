const express = require('express');
const cors = require('cors');
const sequelize = require('./db');

const app = express();
app.use(express.json());
app.use(cors());

// Health endpoint
app.get('/api/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: 'ok', db: 'ok' });
  } catch (error) {
    res.json({ status: 'ok', db: 'error', message: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));