'use strict';
module.exports = (sequelize, DataTypes) => {
  const Challenge = sequelize.define('Challenge', {
    type: DataTypes.STRING,
    data: DataTypes.STRING,
    message: DataTypes.STRING,
    state: DataTypes.INTEGER
  }, {});
  Challenge.associate = function(models) {
    // associations can be defined here
    Challenge.hasMany(models.ChallengeHistory, {
      foreignKey: 'challenge_id',
      as: 'ChallengeHistories'
    });
  };
  return Challenge;
};