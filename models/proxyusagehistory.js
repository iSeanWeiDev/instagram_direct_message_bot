'use strict';
module.exports = (sequelize, DataTypes) => {
  const ProxyUsageHistory = sequelize.define('ProxyUsageHistory', {
    bot_id: DataTypes.INTEGER,
    is_manual: DataTypes.STRING,
    proxy_id: DataTypes.INTEGER,
    proxy_url: DataTypes.STRING
  }, {});
  ProxyUsageHistory.associate = function(models) {
    // associations can be defined here
    ProxyUsageHistory.belongsTo(models.Proxy, {
      foreignKey: 'id'
    });

    ProxyUsageHistory.belongsTo(models.Bot, {
      foreignKey: 'id'
    });
  };
  return ProxyUsageHistory;
};