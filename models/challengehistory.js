'use strict';
module.exports = (sequelize, DataTypes) => {
  const ChallengeHistory = sequelize.define('ChallengeHistory', {
    user_id: DataTypes.INTEGER,
    bot_id: DataTypes.INTEGER,
    bot_name: DataTypes.STRING,
    challenge_id: DataTypes.INTEGER,
    state: DataTypes.INTEGER
  }, {});
  ChallengeHistory.associate = function(models) {
    // associations can be defined here
    ChallengeHistory.belongsTo(models.Challenge, {
      foreignKey: 'id'
    });
  };
  return ChallengeHistory;
};