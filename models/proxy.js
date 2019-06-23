'use strict';
module.exports = (sequelize, DataTypes) => {
  const Proxy = sequelize.define('Proxy', {
    url: DataTypes.STRING,
    expire_date: DataTypes.DATE
  }, {});
  Proxy.associate = function(models) {
    // associations can be defined here
    Proxy.hasMany(models.ProxyUsageHistory, {
      foreignKey: 'proxy_id',
      as: 'ProxyUsageHistories'
    });
  };
  return Proxy;
};