'use strict';

var express = require('express');
var controller = require('./token.controller');
var fitbit = require('../../fitbit/fitbit.service');
var auth = require('../../auth/auth.service');
var passport = require('passport');
var bodyParser = require('body-parser');

var router = express.Router();
//router.use(bodyParser());
router.use(passport.initialize());

router.get('/fitbit', fitbit.fitbitAuthenticate);
router.get('/callback', fitbit.fitbitAuthenticate);
router.get('/success', fitbit.fitbitSuccess);
router.get('/failure', fitbit.fitbitFail);
router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;
