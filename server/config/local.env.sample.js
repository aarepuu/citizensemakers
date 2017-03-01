'use strict';

// Use local.env.js for environment variables that grunt will set when the server starts locally.
// Use for your api keys, secrets, etc. This file should not be tracked by git.
//
// You will need to set these on the server you deploy to.

module.exports = {
  DOMAIN: 'http://localhost:9000',
  IP: "0.0.0.0",
  PORT: "9000",
  // Local default env
  NODE_ENV: "development",
  SESSION_SECRET: 'citizensemakers-secret',

  // Control debug level for modules using visionmedia/debug
  DEBUG: '',

  // MongoDB settings
  MONGODB_URI: "mongodb://localhost/citizensemakers",
  //Fitbit configurations
  // get them from https://dev.fitbit.com
  CLIENT_ID: "",
  CLIENT_SECRET: "",
  // OAuth - https://dev.fitbit.com/docs/oauth2/
  AUTH_URI: "https://www.fitbit.com",
  AUTH_PATH: "/oauth2/authorize",
  TOKEN_URI: "https://api.fitbit.com",
  TOKEN_PATH: "/oauth2/token",
  REDIRECT_URI: "http://localhost:9000/auth/fitbit/callback",
  RESPONSE_TYPE: "code",
  // see  - https://dev.fitbit.com/docs/oauth2/#scope
  SCOPE: "['activity','heartrate','location','profile', 'sleep', 'social', 'nutrition', 'weight', 'settings']",
  STATE: "",
  TIMEOUT: "6000"
};
