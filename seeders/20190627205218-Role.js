'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkInsert('People', [{
        name: 'John Doe',
        isBetaMember: false
      }], {});
    */
    return queryInterface.bulkInsert('Roles', [
      {
        name : 'tier1',
        count_proxy : '20',
        count_dialog : '5000',
        is_upload_earning: 'N',
        is_admin: 'N',
        createdAt : new Date(),
        updatedAt : new Date(),
      },
      {
        name : 'tier2',
        count_proxy : '40',
        count_dialog : '15000',
        is_upload_earning: 'N',
        is_admin: 'N',
        createdAt : new Date(),
        updatedAt : new Date(),
      },
      {
        name : 'tier3',
        count_proxy : '0',
        count_dialog : '0',
        is_upload_earning: 'N',
        is_admin: 'N',
        createdAt : new Date(),
        updatedAt : new Date(),
      },
      {
        name : 'tier4',
        count_proxy : '0',
        count_dialog : '0',
        is_upload_earning: 'Y',
        is_admin: 'N',
        createdAt : new Date(),
        updatedAt : new Date(),
      },
      {
        name : 'admin',
        count_proxy : '0',
        count_dialog : '0',
        is_upload_earning: 'N',
        is_admin: 'Y',
        createdAt : new Date(),
        updatedAt : new Date(),
      }
    ], {});
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
  }
};
