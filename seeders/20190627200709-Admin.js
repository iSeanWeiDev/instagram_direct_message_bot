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

    return queryInterface.bulkInsert('Users', [{
      first_name : 'Sean',
      last_name : 'Riese',
      email : 'sri13456@hotmail.com',
      user_name: 'super-sean1995',
      password: '$2a$10$0FoREtbo3SYVRmTubsg4XuvfPZ75G2hFmZf4jGI1StOmdG2TTvFj.',
      bill_token: 'Super-Admin5826',
      role: '4',
      state: '1',
      createdAt : new Date(),
      updatedAt : new Date(),
    }], {});
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
    queryInterface.bulkDelete('Users', [{
      first_name :'Sean'
    }])
  }
};
