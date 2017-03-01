'use strict';

// Production specific configuration
// =================================

module.exports = {
  // Server IP
  ip: process.env.OPENSHIFT_NODEJS_IP || process.env.IP || '0.0.0.0',

  // Server port
  port: process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 8080,

  // MongoDB connection options
  mongo: {
    uri: process.env.MONGODB_URI || process.env.MONGOHQ_URL || process.env.OPENSHIFT_MONGODB_DB_URL + process.env.OPENSHIFT_APP_NAME || 'mongodb://localhost/citizensemakers'
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
//# sourceMappingURL=production.js.map

