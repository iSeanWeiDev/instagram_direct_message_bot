'use strict';
module.exports = (sequelize, DataTypes) => {
  const FollowUpMessage = sequelize.define('FollowUpMessage', {
    bot_id: DataTypes.INTEGER,
    start_date: DataTypes.DATE,
    text: DataTypes.STRING,
    state: DataTypes.INTEGER
  }, {});
  FollowUpMessage.associate = function(models) {
    // associations can be defined here
    FollowUpMessage.hasMany(models.FollowUpMessageHistory, {
      foreignKey: 'fum_id',
      as: 'FollowUpMessageHistories'
    });
  };
  return FollowUpMessage;
};