const db = require('../models')
const { EnergyReading } = db
const { Op } = db.Sequelize

exports.getReadings = async (req, res) => {

  const { start, end, location } = req.query

  if (!start || !end || !location)
    return res.status(400).json({ error: 'Missing params' })

  const startDate = new Date(start)
  const endDate = new Date(end)

  const readings = await EnergyReading.findAll({
    where: {
      timestamp: { [Op.between]: [startDate, endDate] },
      location
    },
    order: [['timestamp', 'ASC']]
  })

  res.json(readings)
}