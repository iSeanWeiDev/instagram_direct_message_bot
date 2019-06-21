'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Schedulers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      bot_id: {
        type: Sequelize.INTEGER
      },
      media_type: {
        type: Sequelize.STRING(1)
      },
      media_url: {
        type: Sequelize.STRING(200)
      },
      is_story: {
        type: Sequelize.STRING(1)
      },
      text: {
        type: Sequelize.STRING(1000)
      },
      start_date: {
        type: Sequelize.DATE
      },
      state: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Schedulers');
  }
};