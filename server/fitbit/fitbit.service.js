'use strict';

import config from '../config/environment';
import Fitbit from 'fitbit-oauth2'
import passport from 'passport';
import Token from '../api/token/token.model';


function persistToken(token, cb) {
  Token.create(token);
  cb();
}


var fitbit = new Fitbit(config.fitbit, persistToken);
var FitbitStrategy = require('passport-fitbit-oauth2').FitbitOAuth2Strategy;

passport.use(new FitbitStrategy({
    clientID: config.fitbit.creds.clientID,
    clientSecret: config.fitbit.creds.clientSecret,
    callbackURL: config.fitbit.authorization_uri.redirect_uri
  },
  function (accessToken, refreshToken, profile, done) {
    console.log(profile);
    //return;
    Token.findOrCreate({user_id: profile.id}, function (err, user) {
      return done(err, user);
    });
  }
));


/**
 * Redirect to fitbit auth page
 */
export function redirectFitbit(req, res) {
  //TODO - figure out how to get user and do cross origin
  //if (!req.user) {
  //return res.status(404).send('It looks like you aren\'t logged in, please try again.');
  //}
  res.redirect(fitbit.authorizeURL());
}


/**
 * Fitbit authentication callback function
 * gets the code and fetches token
 */
/*
 export function fitbitCallback(req, res, next) {
 var code = req.query.code;
 fitbit.fetchToken(code, function (err, token) {
 if (err) return next(err);
 res.redirect('/');
 });
 }
 */


export function fitbitAuthenticate() {
  //console.log("auth");
  passport.authenticate('fitbit', {scope: ['activity', 'heartrate', 'location', 'profile']});
}

export function fitbitCallback(req, res, next) {
  passport.authenticate('fitbit', {
    successRedirect: '/api/token/success',
    failureRedirect: '/api/token/failure'
  });
}

export function fitbitSuccess(req, res, next) {
  res.send(req.user);
}

export function fitbitFail(req, res, next) {
  res.send(res);
}
