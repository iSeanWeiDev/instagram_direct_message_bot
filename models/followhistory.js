'use strict';
module.exports = (sequelize, DataTypes) => {
  const FollowHistory = sequelize.define('FollowHistory', {
    bot_id: DataTypes.INTEGER,
    client_id: DataTypes.STRING,
    is_follow: DataTypes.STRING
  }, {});
  FollowHistory.associate = function(models) {
    // associations can be defined here
    FollowHistory.belongsTo(models.Bot, {
      foreignKey: 'id'
    });
  };
  return FollowHistory;
};