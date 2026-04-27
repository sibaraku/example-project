const express = require('express')
const router = express.Router()

const readingController = require('../controllers/reading')

router.get('/readings/summary', readingController.getSummary)
router.get('/readings', readingController.getReadings)
router.delete('/readings', readingController.deleteUploadedReadings)

module.exports = router