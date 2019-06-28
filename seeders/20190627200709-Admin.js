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

    return queryInterface.bulkInsert('Users', [
      {
        first_name : 'Sebastian',
        last_name : 'Misas',
        email : 'sebastian.prime@metamedias.com',
        user_name: 'Sebastian-Prime',
        password: '$2a$10$KC6OfD40hGOPyg4KDnekC.YU/wmVrFDZFdiPlH9fqXmizTBafAaRC',
        bill_token: 'Super-Admin5826',
        role: '5',
        state: '1',
        createdAt : new Date(),
        updatedAt : new Date(),
      },
      {
        first_name : 'Sean',
        last_name : 'Riese',
        email : 'sean.prime@metamedias.com',
        user_name: 'Super-Sean',
        password: '$2a$10$KC6OfD40hGOPyg4KDnekC.YU/wmVrFDZFdiPlH9fqXmizTBafAaRC', // metamediasadmin
        bill_token: 'Super-Admin5826',
        role: '5',
        state: '1',
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
    queryInterface.bulkDelete('Users', [{
      first_name :'Sean'
    }])
  }
};
