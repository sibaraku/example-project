const priceService = require('../services/price')

exports.syncPrices = async (req, res) => {

  console.log('Price sync request received:', req.body)

  try {

    const result = await priceService.syncPrices(req.body)

    console.log('Price sync successful:', result)

    res.json(result)

  } catch (err) {

    console.log('Price sync error caught:', {
      message: err.message,
      stack: err.stack,
      response: err.response?.status
    })

    res.status(500).json({
      error: "PRICE_API_UNAVAILABLE",
      message: err.message
    })

  }

}