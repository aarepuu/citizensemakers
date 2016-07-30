'use strict';

var express = require('express');
var controller = require('./step.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

/*
router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);
*/
router.get('/:user/:start/:end', auth.isAuthenticated(), controller.getDataByDate);
router.get('/:user', auth.isAuthenticated(), controller.getData);
router.get('/:user/minmax', auth.isAuthenticated(), controller.getMinMax);
router.post('/', auth.isAuthenticated(), controller.limitData);

module.exports = router;
