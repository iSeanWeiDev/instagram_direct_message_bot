'use strict';
module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define('Comment', {
    bot_id: DataTypes.INTEGER,
    text: DataTypes.STRING,
    state: DataTypes.INTEGER
  }, {});
  Comment.associate = function(models) {
    // associations can be defined here
    Comment.hasMany(models.CommentHistory, {
      foreignKey: 'comment_id',
      as: 'CommentHistories'
    });
  };
  return Comment;
};