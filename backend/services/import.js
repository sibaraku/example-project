const fs = require('fs')
const path = require('path')

const db = require('../models')
const { EnergyReading } = db
const { isValidISO8601UTC } = require('../utils/validation')

exports.importJSON = async () => {

  const filePath = path.join(__dirname, '../energy_dump.json')

  if (!fs.existsSync(filePath)) {
    return { error: "File not found" }
  }

  const rawData = fs.readFileSync(filePath, 'utf-8')
  let data = JSON.parse(rawData)

  let inserted = 0
  let skipped = 0
  let duplicates_detected = 0

  for (let record of data) {

    try {

      let timestamp = new Date(record.timestamp)

      // Validate ISO 8601 UTC format with timezone
      if (!isValidISO8601UTC(record.timestamp)) {
        skipped++
        continue
      }

      if (isNaN(timestamp)) {
        skipped++
        continue
      }

      let location = record.location || "EE"

      let price = record.price_eur_mwh

      if (typeof price !== "number") {
        skipped++
        continue
      }

      const exists = await EnergyReading.findOne({
        where: { timestamp, location }
      })

      if (exists) {
        duplicates_detected++
        continue
      }

      await EnergyReading.create({
        timestamp,
        location,
        price_eur_mwh: price,
        source: "UPLOAD"
      })

      inserted++

    } catch (err) {
      skipped++
    }

  }

  return {
    message: "Import completed",
    inserted,
    skipped,
    duplicates_detected
  }

}