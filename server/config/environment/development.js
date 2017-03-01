'use strict';

// Development specific configuration
// ==================================
module.exports = {

  // MongoDB connection options
  // Expects everything to be default
  mongo: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost/citizensemakers',
  },
  // Seed database on startup
  seedDB: false,

  //fitbit config
  fitbit: {
    creds: {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET
    },
    uris: {
      authorizationUri: process.env.AUTH_URI,
      authorizationPath: process.env.AUTH_PATH,
      tokenUri: process.env.TOKEN_URI,
      tokenPath: process.env.TOKEN_PATH
    },
    authorization_uri: {
      redirect_uri: process.env.REDIRECT_URI,
      response_type: process.env.RESPONSE_TYPE,
      scope: process.env.SCOPE,
      //scope: "activity nutrition profile settings sleep social weight heartrate",
      //['activity','heartrate','location','profile', 'sleep', 'social', 'nutrition', 'weight', 'settings'],
      state: process.env.STATE
    },
    timeout: process.env.TIMEOUT
  }
};


