'use strict';

var express = require('express');
var controller = require('./token.controller');
//var fitbit = require('../../fitbit/fitbit.service');
var auth = require('../../auth/auth.service');


var router = express.Router();


//router.get('/fitbit', fitbit.redirectFitbit);
//router.get('/callback', fitbit.fitbitCallback);
router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;
