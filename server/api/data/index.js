'use strict';

var express = require('express');
var controller = require('./data.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/',auth.isAuthenticated(), controller.index);
//router.get('/minmax', auth.isAuthenticated(), controller.getMinMax);
router.get('/:user/:start/:end', auth.isAuthenticated(), controller.getDataByDate);
router.get('/:user', auth.isAuthenticated(), controller.getData);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.get('/:user/minmax', auth.isAuthenticated(), controller.getMinMax);
router.post('/', auth.isAuthenticated(), controller.create);
router.put('/:id', auth.isAuthenticated(), controller.update);
router.patch('/:id', auth.isAuthenticated(), controller.update);
router.delete('/:id', auth.isAuthenticated(), controller.destroy);

module.exports = router;
