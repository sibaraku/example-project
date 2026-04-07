const importService = require('../services/import')

exports.importJson = async (req, res) => {
  const result = await importService.importJSON()

  res.json(result)
}