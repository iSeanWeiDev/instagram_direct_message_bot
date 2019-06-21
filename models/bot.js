'use strict';
module.exports = (sequelize, DataTypes) => {
  const Bot = sequelize.define('Bot', {
    user_id: DataTypes.INTEGER,
    bot_name: DataTypes.STRING,
    account_name: DataTypes.STRING,
    account_password: DataTypes.STRING,
    account_image_url: DataTypes.STRING,
    message_delay: DataTypes.INTEGER,
    max_comment: DataTypes.INTEGER,
    state: DataTypes.INTEGER
  }, {});
  Bot.associate = function(models) {
    // associations can be defined here
    Bot.belongsTo(models.User, {
      foreignKey: 'id'
    });

    Bot.hasMany(models.ProxyUsageHistory, {
      foreignKey: 'bot_id',
      as: 'ProxyUsageHistories'
    });

    Bot.hasMany(models.CommentHistory, {
      foreignKey: 'bot_id',
      as: 'CommentHistories'
    });

    Bot.hasMany(models.ReplyHistory, {
      foreignKey: 'bot_id',
      as: 'ReplyHistories'
    });

    Bot.hasMany(models.FollowUpMessageHistory, {
      foreignKey: 'bot_id',
      as: 'FollowUpMessageHistories'
    });

    Bot.hasMany(models.LikeHistory, {
      foreignKey: 'bot_id',
      as: 'LikeHistories'
    });

    Bot.hasMany(models.FollowHistory, {
      foreignKey: 'bot_id',
      as: 'FollowHistories'
    });

    Bot.hasMany(models.Scheduler, {
      foreignKey: 'bot_id',
      as: 'Schedulers'
    });
  };
  return Bot;
};