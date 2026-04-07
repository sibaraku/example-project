const axios = require('axios')
const db = require('../models')
const { EnergyReading } = db

exports.syncPrices = async ({ start, end, location }) => {

  if (!location) location = "EE"

  const apiLocation = location.toLowerCase()

  const response = await axios.get(
    "https://dashboard.elering.ee/api/nps/price",
    {
      params: { start, end, fields: apiLocation }
    }
  )

  const data = response.data.data[apiLocation]

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

  return {
    message: "Price sync completed",
    inserted,
    updated
  }

}