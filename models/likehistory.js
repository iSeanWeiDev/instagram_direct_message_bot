'use strict';
module.exports = (sequelize, DataTypes) => {
  const LikeHistory = sequelize.define('LikeHistory', {
    bot_id: DataTypes.INTEGER,
    media_id: DataTypes.STRING
  }, {});
  LikeHistory.associate = function(models) {
    // associations can be defined here
    LikeHistory.belongsTo(models.Bot, {
      foreignKey: 'id'
    });
  };
  return LikeHistory;
};