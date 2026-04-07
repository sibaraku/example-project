const express = require('express')
const router = express.Router()

const importController = require('../controllers/import')

router.post('/import/json', importController.importJson)

module.exports = router