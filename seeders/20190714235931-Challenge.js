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

   return queryInterface.bulkInsert('Challenges', [
      {
        type: 'S',
        data: 'ActionSpamError',
        message: '',
        state: '1',
        createdAt : new Date(),
        updatedAt : new Date(),
      },
      {
        type: 'F',
        data: 'RequestError',
        message: '',
        state: '1',
        createdAt : new Date(),
        updatedAt : new Date(),
      },
      {
        type: 'C',
        data: 'CheckpointError',
        message: 'Phone verification required',
        state: '1',
        createdAt : new Date(),
        updatedAt : new Date(),
      },
      {
        type: 'B',
        data: '',
        message: '',
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
  }
};
