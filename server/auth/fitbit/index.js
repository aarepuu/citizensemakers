'use strict';

import express from 'express';
import passport from 'passport';
import {setTokenCookie} from '../auth.service';

var router = express.Router();

router
  .get('/', passport.authenticate('fitbit', {
    failureRedirect: '/signup',
    //scope: config.fitbit.authorization_uri.scope,
    scope: ['activity','heartrate','location','profile', 'sleep', 'social', 'nutrition', 'weight', 'settings'],
    session: false
  }))
  .get('/callback', passport.authenticate('fitbit', {
    failureRedirect: '/signup',
    session: false
  }), setTokenCookie);

export default router;
