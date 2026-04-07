const express = require('express')
const router = express.Router()

const healthController = require('../controllers/health')

router.get('/health', healthController.checkHealth)

module.exports = router