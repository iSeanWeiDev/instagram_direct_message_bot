'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Bots', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER
      },
      bot_name: {
        type: Sequelize.STRING(50)
      },
      account_name: {
        type: Sequelize.STRING(50)
      },
      account_password: {
        type: Sequelize.STRING(255)
      },
      account_image_url: {
        type: Sequelize.STRING(500)
      },
      message_delay: {
        type: Sequelize.INTEGER
      },
      max_comment: {
        type: Sequelize.INTEGER
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
    return queryInterface.dropTable('Bots');
  }
};