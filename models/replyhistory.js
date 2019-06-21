'use strict';
module.exports = (sequelize, DataTypes) => {
  const ReplyHistory = sequelize.define('ReplyHistory', {
    bot_id: DataTypes.INTEGER,
    client_id: DataTypes.STRING,
    client_name: DataTypes.STRING,
    client_image_url: DataTypes.STRING,
    client_text: DataTypes.STRING,
    is_manual: DataTypes.STRING,
    manual_reply_text: DataTypes.STRING,
    reply_id: DataTypes.INTEGER
  }, {});
  ReplyHistory.associate = function(models) {
    // associations can be defined here
    ReplyHistory.belongsTo(models.Reply, {
      foreignKey: 'id'
    });

    ReplyHistory.belongsTo(models.Bot, {
      foreignKey: 'id'
    });
  };
  return ReplyHistory;
};