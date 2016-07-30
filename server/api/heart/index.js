'use strict';

var express = require('express');
var controller = require('./heart.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

//router.get('/', controller.index);
router.get('/:user/:start/:end', auth.isAuthenticated(), controller.getDataByDate);
router.get('/:user', auth.isAuthenticated(), controller.getData);
//router.get('/:id', controller.show);
router.get('/:user/minmax', auth.isAuthenticated(), controller.getMinMax);
//router.post('/', controller.create);
router.post('/', auth.isAuthenticated(), controller.limitData);
//router.put('/:id', controller.update);
//router.patch('/:id', controller.update);
//router.delete('/:id', controller.destroy);

module.exports = router;
