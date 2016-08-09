'use strict';

var path = require('path');
var _ = require('lodash');

function requiredProcessEnv(name) {
  if (!process.env[name]) {
    throw new Error('You must set the ' + name + ' environment variable');
  }
  return process.env[name];
}

// All configurations will extend these options
// ============================================
var all = {
  env: process.env.NODE_ENV,

  // Root path of server
  root: path.normalize(__dirname + '/../../..'),

  // Server port
  port: process.env.PORT || 9000,

  // Server IP
  ip: process.env.IP || '0.0.0.0',

  // Should we populate the DB with sample data?
  seedDB: false,

  // Secret for session, you will want to change this and make it an environment variable
  secrets: {
    session: 'citizensemakers-secret'
  },

  // MongoDB connection options
  mongo: {
    options: {
      db: {
        safe: true
      }
    }
  },

  //fitbit config
  fitbit: {
    creds: {
      clientID: '227F3K',
      clientSecret: '018e3981c06e59b6affd8ca5d8283296'
    },
    uris: {
      authorizationUri: 'https://www.fitbit.com',
      authorizationPath: '/oauth2/authorize',
      tokenUri: 'https://api.fitbit.com',
      tokenPath: '/oauth2/token'
    },
    authorization_uri: {
      //redirect_uri: 'http://localhost:9000/auth/fitbit/callback',
      redirect_uri: 'http://citizensemakers.co.uk/auth/fitbit/callback',
      response_type: 'code',
      scope: ['activity','heartrate','location','profile', 'sleep', 'social', 'nutrition', 'weight', 'settings'],
      //scope: "activity nutrition profile settings sleep social weight heartrate",
      state: '3(#0/!~'
    },
    timeout: 6000
  }

};

// Export the config object based on the NODE_ENV
// ==============================================
module.exports = _.merge(
  all,
  require('./shared'),
  require('./' + process.env.NODE_ENV + '.js') || {});
