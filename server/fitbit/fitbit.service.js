'use strict';

import config from '../config/environment';
import Fitbit from 'fitbit-oauth2'
import Token from '../api/token/token.model';
import User from '../api/user/user.model';

var fitbit = new Fitbit(config.fitbit, persistToken);
var currentUser;

function persistToken(token, cb) {
  Token.create(token);
  cb();
}


/**
 * Redirect to fitbit auth page
 */
export function redirectFitbit(req, res) {
  //TODO - figure out how to get user and do cross origin
  //if (!req.user) {
  //return res.status(404).send('It looks like you aren\'t logged in, please try again.');
  //}
  currentUser = req.query.user;
  res.redirect(fitbit.authorizeURL());
}


/**
 * Fitbit authentication callback function
 * gets the code and fetches token
 */

export function fitbitCallback(req, res, next) {
  //var img = req.session.passport.user.profile._json.user.avatar;
  console.log(req.session);
  var img;
  var code = req.query.code;
  fitbit.fetchToken(code, function (err, token) {
    if (err) return next(err);
    //console.log(token.user_id);
    var userId = currentUser;
    //console.log(req.body);
    return User.findById(userId).exec()
      .then(user => {
        user.fitbitId = token.user_id;
        user.avatar = img;
        return user.save()
          .then(() => {
            //res.status(204).end();
            res.redirect('/');
          })
          .catch(validationError(res));
      });
  });
}
