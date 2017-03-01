'use strict';

import User from './user.model';
import passport from 'passport';
import config from '../../config/environment';
import jwt from 'jsonwebtoken';

function validationError(res, statusCode) {
  statusCode = statusCode || 422;
  return function (err) {
    res.status(statusCode).json(err);
  }
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function (err) {
    res.status(statusCode).send(err);
  };
}

/**
 * Get list of users
 * restriction: 'admin'
 */
export function index(req, res) {
  return User.find({}, '-salt -password -fitbit').exec()
    .then(users => {
      res.status(200).json(users);
    })
    .catch(handleError(res));
}

/**
 * Get list of usernames
 *
 *
 */
export function getNames(req, res) {
  return User.find({_id: {$ne: req.user._id}}, '-salt -password -email -provider -role -rights -fitbit').exec()
    .then(users => {
      res.status(200).json(users);
    })
    .catch(handleError(res));
}

/**
 * Creates a new user
 */
export function create(req, res, next) {
  var newUser = new User(req.body);
  newUser.provider = 'local';
  newUser.role = 'user';
  newUser.save()
    .then(function (user) {
      var token = jwt.sign({_id: user._id}, config.secrets.session, {
        expiresIn: 60 * 60 * 5
      });
      res.json({token});
    })
    .catch(validationError(res));
}

/**
 * Get a single user
 */
export function show(req, res, next) {
  var userId = req.params.id;

  return User.findById(userId).exec()
    .then(user => {
      if (!user) {
        return res.status(404).end();
      }
      res.json(user.profile);
    })
    .catch(err => next(err));
}

/**
 * Deletes a user
 * restriction: 'admin'
 */
export function destroy(req, res) {
  return User.findByIdAndRemove(req.params.id).exec()
    .then(function () {
      res.status(204).end();
    })
    .catch(handleError(res));
}

/**
 * Change a users password
 */
export function changePassword(req, res, next) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  return User.findById(userId).exec()
    .then(user => {
      if (user.authenticate(oldPass)) {
        user.password = newPass;
        return user.save()
          .then(() => {
            res.status(204).end();
          })
          .catch(validationError(res));
      } else {
        return res.status(403).end();
      }
    });
}

/**
 * Get my info
 */
export function me(req, res, next) {
  var userId = req.user._id;

  return User.findOne({_id: userId}, '-salt -password').exec()
    .then(user => { // don't ever give out the password or salt
      if (!user) {
        return res.status(401).end();
      }
      res.json(user);
    })
    .catch(err => next(err));
}

/**
 * Authentication callback
 */
export function authCallback(req, res, next) {
  res.redirect('/');
}

/**
 * Set rights for current user to see data
 *
 */
export function setRights(req, res, next) {
  var userId = req.user._id;
  //console.log(userId);
  return User.findById(userId).exec()
    .then(user => {
        user.rights.them = req.body;
        //user.rights.you.find(x=> x.userId === '5785f9c2ccd489331b6b57b7');
        return user.save()
          .then(() => {
            res.status(204).end();
          })
          .catch(validationError(res));
      }
    );
}
//{'rights.them.userId': '5785f9c2ccd489331b6b57b7'}, {'$set': {'rights.them.$.week': true}}
export function setOneRight(req, res, next) {
  var me = JSON.parse(JSON.stringify(req.user._id));
  var userId = JSON.parse(JSON.stringify(req.body.userId));
  req.body.userId = me;
  req.body.name = req.user.name;
  req.body.fitbitId = req.user.fitbitId;

  return User.findById(userId).exec()
    .then(user => {
      //user.rights.you = req.body;
      //user.rights.you.find(x=> x.userId === userId) = req.body;
      //console.log(user.rights.you);
      var elementPos = user.rights.you.map(function (x) {
        return x.userId;
      }).indexOf(me);
      if (elementPos < 0) {
        user.rights.you.push(req.body)
      } else {
        user.rights.you[elementPos] = req.body;
      }
      //console.log(user.rights);
      return user.save()
        .then(() => {
          res.status(204).end();
        })
        .catch(validationError(res));
    });
}


/*


 User.update({'items.id': 2}, {'$set': {
 'items.$.name': 'updated item2',
 'items.$.value': 'two updated'
 }}, function(err) {

 var query = {},
 update = { expire: new Date() },
 options = { upsert: true, new: true, setDefaultsOnInsert: true };

 // Find the document
 Model.findOneAndUpdate(query, update, options, function(error, result) {
 if (error) return;

 // do something with the document
 });

 */
