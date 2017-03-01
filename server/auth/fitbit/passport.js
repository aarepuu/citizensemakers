'use strict';

var passport = require('passport');
var moment = require('moment');
var FitbitStrategy = require('passport-fitbit-oauth2').FitbitOAuth2Strategy;
import Token from '../../api/token/token.model';

export function setup(User, config) {
  passport.use(new FitbitStrategy({
      clientID: config.fitbit.creds.clientID,
      clientSecret: config.fitbit.creds.clientSecret,
      scope: config.fitbit.authorization_uri.scope,
      callbackURL: config.fitbit.authorization_uri.redirect_uri
    },
    function (accessToken, refreshToken, profile, done) {
      //console.log(profile);
      //console.log(accessToken);
      //console.log(refreshToken);
      User.findOne({'fitbitId': profile.id}).exec()
        .then(user => {
            if (user) {
              user.lastLogin = moment();
              user.save().then(user => {
                //return done(null, user);
                Token.findOne({"user_id": profile.id}).exec()
                  .then(token => {
                    token.access_token = accessToken;
                    token.refresh_token = refreshToken;
                    token.expires_in = 28800;
                    token.expires_at = moment().add(token.expires_in, 'seconds').format('YYYYMMDDTHH:mm:ss');
                    token.save()
                      .then(() => {
                        return done(null, user)
                      }).catch(err => done(err));
                  }).catch(err => done(err));
              }).catch(err => done(err));
              return done(null, user);
            }
            user = new User({
              name: profile.displayName,
              email: '',
              role: 'user',
              username: '',
              avatar: profile._json.user.avatar,
              provider: 'fitbit',
              fitbitId: profile.id,
              fitbit: profile._json.user
            });
            user.save()
              .then(user => {
                var token = {};
                token.access_token = accessToken;
                token.refresh_token = refreshToken;
                token.expires_in = 28800;
                token.expires_at = moment().add(token.expires_in, 'seconds').format('YYYYMMDDTHH:mm:ss');
                token.token_type = 'Bearer';
                token.user_id = profile.id;
                token.scope = config.fitbit.authorization_uri.scope;
                Token.create(token)
                  .then(() => done(null, user))
                  .catch(err => done(err));
              })
              .catch(err => done(err));
          }
        )
        .catch(err => done(err));
    }));
}
