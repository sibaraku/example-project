const express = require('express')
const router = express.Router()

const priceSyncController = require('../controllers/priceSync')

router.post('/sync/prices', priceSyncController.syncPrices)

module.exports = router