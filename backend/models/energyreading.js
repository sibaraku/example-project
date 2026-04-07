"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class EnergyReading extends Model {}
  EnergyReading.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      timestamp: { type: DataTypes.DATE, allowNull: false },
      location: { type: DataTypes.STRING, allowNull: false },
      price_eur_mwh: { type: DataTypes.FLOAT, allowNull: true },
      source: { type: DataTypes.ENUM("UPLOAD", "API"), allowNull: false },
      updatedAt: DataTypes.DATE,
      createdAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "EnergyReading",
      timestamps: true,
      tableName: "EnergyReadings",
      underscored: true,
    },
  );
  return EnergyReading;
};
