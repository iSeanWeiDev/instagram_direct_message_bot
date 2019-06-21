'use strict';
module.exports = (sequelize, DataTypes) => {
  const Filter = sequelize.define('Filter', {
    bot_id: DataTypes.INTEGER,
    hashtag: DataTypes.STRING,
    state: DataTypes.INTEGER
  }, {});
  Filter.associate = function(models) {
    // associations can be defined here
    Filter.hasMany(models.CommentHistory, {
      foreignKey: 'filter_id',
      as: 'CommentHistories'
    });
  };
  return Filter;
};