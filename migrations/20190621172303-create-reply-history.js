'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('ReplyHistories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      bot_id: {
        type: Sequelize.INTEGER
      },
      client_id: {
        type: Sequelize.STRING(50)
      },
      client_name: {
        type: Sequelize.STRING(50)
      },
      client_image_url: {
        type: Sequelize.STRING(500)
      },
      client_text: {
        type: Sequelize.STRING(1000)
      },
      is_manual: {
        type: Sequelize.STRING(1)
      },
      manual_reply_text: {
        type: Sequelize.STRING(1000)
      },
      reply_id: {
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
    return queryInterface.dropTable('ReplyHistories');
  }
};