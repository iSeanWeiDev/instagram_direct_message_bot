'use strict';
module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    name: DataTypes.STRING,
    count_proxy: DataTypes.INTEGER,
    count_dialog: DataTypes.INTEGER
  }, {});
  Role.associate = function(models) {
    // associations can be defined here
    Role.hasMany(models.User, {
      foreignKey: 'role',
      as: 'Users'
    })
  };
  return Role;
};