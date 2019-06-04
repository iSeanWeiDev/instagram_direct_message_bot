'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('RepliesHistories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      botid: {
        type: Sequelize.INTEGER
      },
      clientid: {
        type: Sequelize.STRING
      },
      clientname: {
        type: Sequelize.STRING
      },
      image: {
        type: Sequelize.STRING
      },
      message: {
        type: Sequelize.STRING
      },
      replyid: {
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
    return queryInterface.dropTable('RepliesHistories');
  }
};