const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const db = require('./models');
const { EnergyReading, sequelize } = db;
const { Op } = db.Sequelize;

const app = express();
app.use(express.json());
app.use(cors());

app.post('/api/import/json', async (req, res) => {
  const filePath = path.join(__dirname, 'energy_dump.json');
  if (!fs.existsSync(filePath)) return res.status(400).json({ error: 'File not found' });

  const rawData = fs.readFileSync(filePath, 'utf-8');
  let data;
  try { data = JSON.parse(rawData); } catch { return res.status(400).json({ error: 'Invalid JSON' }); }

  let inserted = 0, skipped = 0, duplicates_detected = 0;

  for (let record of data) {
    try {
      // Timestamp
      let tsRaw = record.timestamp;
      let timestamp;
      if (typeof tsRaw === 'number') timestamp = new Date(tsRaw * 1000);
      else if (typeof tsRaw === 'string') timestamp = new Date(tsRaw.includes('Z') ? tsRaw : tsRaw + 'Z');
      else { skipped++; continue; }
      if (isNaN(timestamp.getTime())) { skipped++; continue; }

      // Location
      let location = record.location || 'EE';
      if (!['EE','LV','FI'].includes(location)) location = 'EE';

      // Price
      let price = record.price_eur_mwh;
      if (typeof price === 'string') price = parseFloat(price.replace(',', '.'));
      if (typeof price !== 'number' || isNaN(price)) { skipped++; continue; }

      // Duplicate check
      const exists = await EnergyReading.findOne({ where: { timestamp, location } });
      if (exists) { duplicates_detected++; continue; }

      await EnergyReading.create({ timestamp, location, price_eur_mwh: price, source: 'UPLOAD' });
      inserted++;
    } catch (err) {
      console.error('Skipping record due to error:', err);
      skipped++;
    }
  }

  res.json({ message: 'Import completed', inserted, skipped, duplicates_detected });
});

app.get('/api/health', async (req, res) => {
  try { await sequelize.authenticate(); res.json({ status: 'ok', db: 'ok' }); }
  catch (err) { res.json({ status: 'ok', db: 'error', message: err.message }); }
});

app.get('/api/readings', async (req, res) => {
  const { start, end, location } = req.query;
  if (!start || !end || !location) return res.status(400).json({ error: 'Missing params' });
  if (!['EE','LV','FI'].includes(location)) return res.status(400).json({ error: 'Invalid location' });

  const startDate = new Date(start);
  const endDate = new Date(end);
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || !start.includes('Z') || !end.includes('Z')) {
    return res.status(400).json({ error: 'start and end must be ISO 8601 UTC timestamps with Z' });
  }

  const readings = await EnergyReading.findAll({
    where: { timestamp: { [Op.between]: [startDate, endDate] }, location },
    order: [['timestamp','ASC']]
  });

  res.json(readings);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));