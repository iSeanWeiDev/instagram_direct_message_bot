'use strict';
module.exports = (sequelize, DataTypes) => {
  const Reply = sequelize.define('Reply', {
    botid: DataTypes.INTEGER,
    message: DataTypes.STRING
  }, {});
  Reply.associate = function(models) {
    // associations can be defined here
    Reply.belongsTo(models.Bot, {
      foreignKey: 'id'
    });
  };
  return Reply;
};