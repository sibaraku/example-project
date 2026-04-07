const express = require('express')
const router = express.Router()

const readingController = require('../controllers/reading')

router.get('/readings', readingController.getReadings)

module.exports = router