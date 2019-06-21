'use strict';
module.exports = (sequelize, DataTypes) => {
  const CommentHistory = sequelize.define('CommentHistory', {
    bot_id: DataTypes.INTEGER,
    filter_id: DataTypes.INTEGER,
    media_id: DataTypes.STRING,
    comment_id: DataTypes.INTEGER
  }, {});
  CommentHistory.associate = function(models) {
    // associations can be defined here
    CommentHistory.belongsTo(models.Comment, {
      foreignKey: 'id'
    });

    CommentHistory.belongsTo(models.Filter, {
      foreignKey: 'id'
    });

    CommentHistory.belongsTo(models.Bot, {
      foreignKey: 'id'
    });
  };
  return CommentHistory;
};