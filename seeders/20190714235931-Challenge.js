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
        message: 'The bot was registered with spam on Instagram and paused by our platform, so you need to update your bot now. Please lower your daily comments or add more variations of comments.',
        state: '1',
        createdAt : new Date(),
        updatedAt : new Date(),
      },
      {
        type: 'F',
        data: 'RequestError',
        message: 'The bot had made an unknown action to Instagram and paused by our platform. Please report the problem to Metamedias support team.',
        state: '1',
        createdAt : new Date(),
        updatedAt : new Date(),
      },
      {
        type: 'C',
        data: 'CheckpointError',
        message: 'Please verify your phone number with Instagram using the "challenge button" here: ',
        state: '1',
        createdAt : new Date(),
        updatedAt : new Date(),
      },
      {
        type: 'B',
        data: 'SentryBlockError',
        message: 'It was blocked from Instagram and paused by our platform, the bot will be able to use after 4~8 hours.',
        state: '1',
        createdAt : new Date(),
        updatedAt : new Date(),
      },
      {
        type: 'P',
        data: 'ParseError',
        message: 'The bot can not parse the response from Instagram, so it was paused by our platform. Please delete bot and reconnect using correct details',
        state: '1',
        createdAt : new Date(),
        updatedAt : new Date(),
      },
      {
        type: 'T',
        data: 'TypeError',
        message: 'The bot can not filter using your hashtag, so it was paused by our platform. Please check your bot details and try to update or delete.',
        state: '1',
        createdAt : new Date(),
        updatedAt : new Date(),
      },
      {
        type: 'N',
        data: 'NoFilterError',
        message: 'The bot can not filter using your hashtag, so it was paused by our platform. Please check your bot details and try to update or delete.',
        state: '1',
        createdAt : new Date(),
        updatedAt : new Date(),
      },
      {
        type: 'NN',
        data: 'NotFoundError',
        message: 'The bot can not filter using your hashtag, so it was paused by our platform. Please check your bot details and try to update or delete.',
        state: '1',
        createdAt : new Date(),
        updatedAt : new Date(),
      },
      {
        type: 'U',
        data: 'UnknownError',
        message: 'The bot had made an unknown action to Instagram and paused by our platform. Please report the problem to Metamedias support team.',
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
