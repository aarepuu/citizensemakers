'use strict';

import express from 'express';
import passport from 'passport';
import config from '../config/environment';
import User from '../api/user/user.model';

// Passport Configuration
require('./local/passport').setup(User, config);
require('./fitbit/passport').setup(User, config);

var router = express.Router();

router.use('/local', require('./local').default);
router.use('/fitbit', require('./fitbit').default);

export default router;
