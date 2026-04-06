'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('EnergyReadings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      timestamp: {
        type: Sequelize.DATE,
        allowNull: false
      },
      location: {
        type: Sequelize.STRING,
        allowNull: false
      },
      price_eur_mwh: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      source: {
        type: Sequelize.ENUM('UPLOAD', 'API'),
        allowNull: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('EnergyReadings');
  }
};