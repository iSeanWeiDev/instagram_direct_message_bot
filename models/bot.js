'use strict';
module.exports = (sequelize, DataTypes) => {
  const Bot = sequelize.define('Bot', {
    userid: DataTypes.STRING,
    botname: DataTypes.STRING,
    accountname: DataTypes.STRING,
    password: DataTypes.STRING,
    image: DataTypes.STRING,
    delay: DataTypes.INTEGER,
    max: DataTypes.INTEGER,
    filters: DataTypes.STRING,
    status: DataTypes.INTEGER
  }, {});
  Bot.associate = function(models) {
    // associations can be defined here
    Bot.belongsTo(models.User, {
      foreignKey: 'id'
    });

    Bot.hasMany(models.Comment, {
      foreignKey: 'botid',
      as: 'comments'
    });

    Bot.hasMany(models.Reply, {
      foreignKey: 'botid',
      as: 'replies'
    })
  };
  return Bot;
};