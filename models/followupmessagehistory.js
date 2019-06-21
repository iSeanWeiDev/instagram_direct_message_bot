'use strict';
module.exports = (sequelize, DataTypes) => {
  const FollowUpMessageHistory = sequelize.define('FollowUpMessageHistory', {
    bot_id: DataTypes.INTEGER,
    fum_id: DataTypes.INTEGER,
    client_id: DataTypes.STRING
  }, {});
  FollowUpMessageHistory.associate = function(models) {
    // associations can be defined here
    FollowUpMessageHistory.belongsTo(models.FollowUpMessage, {
      foreignKey: 'id'
    });

    FollowUpMessageHistory.belongsTo(models.Bot, {
      foreignKey: 'id'
    });
  };
  return FollowUpMessageHistory;
};