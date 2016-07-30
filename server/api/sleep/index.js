'use strict';

var express = require('express');
var controller = require('./sleep.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

//router.get('/', controller.index);
router.get('/:user/:start/:end', controller.getDataByDate);
router.get('/:user', auth.isAuthenticated(), controller.getData);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.get('/:user/minmax', auth.isAuthenticated(), controller.getMinMax);
//router.post('/', auth.isAuthenticated(), controller.create);
router.post('/', auth.isAuthenticated(), controller.limitData);
//router.put('/:id', auth.isAuthenticated(), controller.update);
//router.patch('/:id', auth.isAuthenticated(), controller.update);
//router.delete('/:id', auth.isAuthenticated(), controller.destroy);

module.exports = router;
