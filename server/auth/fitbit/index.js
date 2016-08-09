'use strict';

import config from '../../config/environment';
import express from 'express';
import passport from 'passport';
import {setTokenCookie} from '../auth.service';

var router = express.Router();

router
  .get('/', passport.authenticate('fitbit', {
    failureRedirect: '/',
    scope: config.fitbit.authorization_uri.scope,
    session: false
  }))
  .get('/callback', passport.authenticate('fitbit', {
    failureRedirect: '/',
    session: false
  }), setTokenCookie);

export default router;
