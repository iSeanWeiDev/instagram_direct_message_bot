'use strict';
module.exports = (sequelize, DataTypes) => {
  const RepliesHistory = sequelize.define('RepliesHistory', {
    botid: DataTypes.INTEGER,
    clientid: DataTypes.STRING,
    clientname: DataTypes.STRING,
    image: DataTypes.STRING,
    message: DataTypes.STRING,
    replyid: DataTypes.INTEGER
  }, {});
  RepliesHistory.associate = function(models) {
    // associations can be defined here
  };
  return RepliesHistory;
};