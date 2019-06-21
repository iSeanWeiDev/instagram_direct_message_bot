'use strict';
module.exports = (sequelize, DataTypes) => {
  const Scheduler = sequelize.define('Scheduler', {
    bot_id: DataTypes.INTEGER,
    media_type: DataTypes.STRING,
    media_url: DataTypes.STRING,
    is_story: DataTypes.STRING,
    text: DataTypes.STRING,
    start_date: DataTypes.DATE,
    state: DataTypes.INTEGER
  }, {});
  Scheduler.associate = function(models) {
    // associations can be defined here
  };
  return Scheduler;
};