'use strict';

var express = require('express');
var controller = require('./comment.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

//router.get('/', auth.isAuthenticated(), controller.index);
//router.get('/:user/:start/:end/:person', auth.isAuthenticated(), controller.getDataByDate);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.post('/list', auth.isAuthenticated(), controller.getCommentsByDate);
router.post('/', auth.isAuthenticated(), controller.create);
//router.post('/', auth.isAuthenticated(), controller.createOrUpdate);
router.put('/:id', auth.isAuthenticated(), controller.update);
router.patch('/:id', auth.isAuthenticated(), controller.update);
router.delete('/:id', auth.isAuthenticated(), controller.destroy);

module.exports = router;
