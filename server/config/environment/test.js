'use strict';

// Test specific configuration
// ===========================
module.exports = {
  // MongoDB connection options
  mongo: {
    uri: 'mongodb://localhost/citizensemakers-test'
  },
  sequelize: {
    uri: 'sqlite://',
    options: {
      logging: false,
      storage: 'test.sqlite',
      define: {
        timestamps: false
      }
    }
  }
};
