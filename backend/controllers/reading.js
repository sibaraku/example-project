const db = require('../models')
const { EnergyReading } = db
const { Op } = db.Sequelize
const { validateReadingParams } = require('../utils/validation')

exports.getReadings = async (req, res, next) => {
  try {
    const { start, end } = req.query
    const rawLocation = req.query.location || req.query['location[]']

    // Validate parameters
    const validation = validateReadingParams({ start, end, location: rawLocation })
    if (!validation.isValid) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: validation.errors 
      })
    }

    const locations = Array.isArray(rawLocation)
      ? rawLocation
      : String(rawLocation).split(',').map((item) => item.trim()).filter(Boolean)

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
  } catch (error) {
    next(error)
  }
}

exports.getSummary = async (req, res, next) => {
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
    next(error)
  }
}

/**
 * Delete records with source = "UPLOAD"
 * Endpoint: DELETE /api/readings?source=UPLOAD
 */
exports.deleteUploadedReadings = async (req, res, next) => {
  try {
    const { source } = req.query

    // Only allow deletion of UPLOAD source records
    if (source !== 'UPLOAD') {
      return res.status(400).json({ 
        error: 'Invalid request. Only UPLOAD records can be deleted.' 
      })
    }

    const deletedCount = await EnergyReading.destroy({
      where: { source: 'UPLOAD' }
    })

    if (deletedCount === 0) {
      return res.json({ message: 'No UPLOAD records found.' })
    }

    res.json({ message: `Deleted ${deletedCount} uploaded records.` })
  } catch (error) {
    res.status(500).json({ 
      error: 'Cleanup failed. Please try again.' 
    })
    next(error)
  }
}