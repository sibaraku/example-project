const db = require('../models')
const { sequelize } = db

exports.checkHealth = async (req, res) => {
  try {
    await sequelize.authenticate()

    res.json({
      status: 'ok',
      db: 'ok'
    })
  } catch (err) {
    res.json({
      status: 'ok',
      db: 'error',
      message: err.message
    })
  }
}