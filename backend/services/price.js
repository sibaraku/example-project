const axios = require('axios')
const db = require('../models')
const { EnergyReading } = db

exports.syncPrices = async ({ start, end, location }) => {

  if (!location) location = "EE"

  const apiLocation = location.toLowerCase()

  // Convert datetime-local format (2024-01-01T00:00:00) to ISO 8601 with UTC timezone
  // If the input already has timezone info, use it as-is; otherwise assume UTC
  const formatDateTime = (dateStr) => {
    if (!dateStr) return null
    
    if (dateStr.includes('+') || dateStr.includes('Z')) {
      // Already has timezone info
      return dateStr
    }
    
    // Assume UTC if no timezone provided
    return `${dateStr}+00:00`
  }

  const startFormatted = formatDateTime(start)
  const endFormatted = formatDateTime(end)

  if (!startFormatted || !endFormatted) {
    throw new Error('Start and end dates are required')
  }

  console.log('Calling Elering API with params:', { start: startFormatted, end: endFormatted, apiLocation })

  const response = await axios.get(
    "https://dashboard.elering.ee/api/nps/price",
    {
      params: { start: startFormatted, end: endFormatted, fields: apiLocation }
    }
  )

  console.log('API response received, data structure:', Object.keys(response.data))

  const data = response.data.data?.[apiLocation]
  
  if (!data || !Array.isArray(data)) {
    throw new Error(`Invalid data structure from API. Expected array for ${apiLocation}`)
  }

  console.log(`Processing ${data.length} records from API`)

  let inserted = 0
  let updated = 0

  for (const record of data) {

    const timestamp = new Date(record.timestamp * 1000)

    const existing = await EnergyReading.findOne({
      where: { timestamp, location }
    })

    if (existing) {

      await existing.update({
        price_eur_mwh: record.price,
        source: "API"
      })

      updated++

    } else {

      await EnergyReading.create({
        timestamp,
        location,
        price_eur_mwh: record.price,
        source: "API"
      })

      inserted++

    }

  }

  console.log(`Sync completed: inserted=${inserted}, updated=${updated}`)

  return {
    message: "Price sync completed",
    inserted,
    updated
  }

}