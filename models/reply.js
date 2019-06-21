'use strict';
module.exports = (sequelize, DataTypes) => {
  const Reply = sequelize.define('Reply', {
    bot_id: DataTypes.INTEGER,
    text: DataTypes.STRING,
    state: DataTypes.INTEGER
  }, {});
  Reply.associate = function(models) {
    // associations can be defined here
    Reply.hasMany(models.ReplyHistory, {
      foreignKey: 'reply_id',
      as: 'ReplyHistories'
    });
  };
  return Reply;
};