'use strict';

import config from '../config/environment';
import Fitbit from 'fitbit-oauth2'
import Token from '../api/token/token.model';


function persistToken(token, cb) {
    Token.create(token);
    cb();
}


var fitbit = new Fitbit(config.fitbit, persistToken);


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
export function fitbitCallback(req, res, next) {
  var code = req.query.code;
  fitbit.fetchToken(code, function (err, token) {
    if (err) return next(err);
    res.redirect('/');
  });
}
