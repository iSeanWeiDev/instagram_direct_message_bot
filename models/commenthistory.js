'use strict';
module.exports = (sequelize, DataTypes) => {
  const CommentHistory = sequelize.define('CommentHistory', {
    botid: DataTypes.INTEGER,
    hashtag: DataTypes.STRING,
    mediaid: DataTypes.STRING,
    commentid: DataTypes.INTEGER
  }, {});
  CommentHistory.associate = function(models) {
    // associations can be defined here
  };
  return CommentHistory;
};