const priceService = require('../services/price')

exports.syncPrices = async (req, res) => {

  try {

    const result = await priceService.syncPrices(req.body)

    res.json(result)

  } catch (err) {

    res.status(500).json({
      error: "PRICE_API_UNAVAILABLE"
    })

  }

}