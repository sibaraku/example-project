const db = require('../models')
const { EnergyReading } = db
const { Op } = db.Sequelize

exports.getReadings = async (req, res) => {

  const { start, end } = req.query
  const rawLocation = req.query.location || req.query['location[]']

  if (!start || !end || !rawLocation)
    return res.status(400).json({ error: 'Missing params' })

  const locations = Array.isArray(rawLocation)
    ? rawLocation
    : String(rawLocation).split(',').map((item) => item.trim()).filter(Boolean)

  if (!locations.length)
    return res.status(400).json({ error: 'Missing params' })

  const startDate = new Date(start)
  const endDate = new Date(end)

  const readings = await EnergyReading.findAll({
    where: {
      timestamp: { [Op.between]: [startDate, endDate] },
      location: { [Op.in]: locations }
    },
    order: [['timestamp', 'ASC']]
  })

  res.json(readings)
}

exports.getSummary = async (req, res) => {
  try {
    const locationsResult = await EnergyReading.findAll({
      attributes: ['location'],
      group: ['location'],
      raw: true,
    })

    const rangeResult = await EnergyReading.findAll({
      attributes: [
        [db.Sequelize.fn('MIN', db.Sequelize.col('timestamp')), 'start'],
        [db.Sequelize.fn('MAX', db.Sequelize.col('timestamp')), 'end'],
      ],
      raw: true,
    })

    const locations = locationsResult.map((item) => item.location).filter(Boolean)
    const range = rangeResult[0] || {}

    res.json({
      start: range.start || null,
      end: range.end || null,
      locations,
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to load summary' })
  }
}