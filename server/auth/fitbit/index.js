'use strict';

import config from '../../config/environment';
var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var FitbitStrategy = require( 'passport-fitbit-oauth2' ).FitbitOAuth2Strategy;
var passport = require('passport');

var auth = require('../../auth/auth.service');



var router = express.Router();

//router.use(cookieParser());
//router.use(bodyParser());

//router.use(session({ secret: 'keyboard cat' }));

//router.use(passport.initialize());

passport.use(new FitbitStrategy({
    clientID: config.fitbit.creds.clientID,
    clientSecret: config.fitbit.creds.clientSecret,
    scope: config.fitbit.authorization_uri.scope,
    callbackURL: config.fitbit.authorization_uri.redirect_uri
  },
  function (accessToken, refreshToken, profile, done) {
    console.log(profile);
    //return;
    //Token.findOrCreate({user_id: profile.id}, function (err, user) {
      //return done(err, user);
    //});
    done(null, {
      accessToken: accessToken,
      refreshToken: refreshToken,
      profile: profile
    });
  }
));


passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

var fitbitAuthenticate = passport.authenticate('fitbit', {
  successRedirect: '/auth/fitbit/success',
  failureRedirect: '/auth/fitbit/failure'
});

router.get('/',fitbitAuthenticate);
router.get('/callback', fitbitAuthenticate);

router.get('/success',function(req, res, next) {
  console.log("success");
  //console.log(req.session.passport.user);
  res.redirect('/');
});

router.get('/failure', function(req, res, next) {
  console.log("fail");
});


module.exports = router;
