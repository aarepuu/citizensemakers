/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/comments              ->  index
 * POST    /api/comments              ->  create
 * GET     /api/comments/:id          ->  show
 * PUT     /api/comments/:id          ->  update
 * DELETE  /api/comments/:id          ->  destroy
 */

'use strict';

import _ from 'lodash';
import Comment from './comment.model';

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function (entity) {
    if (entity) {
      res.status(statusCode).json(entity);
    }
  };
}

function saveUpdates(updates) {
  return function (entity) {
    var updated = _.merge(entity, updates);
    return updated.save()
      .then(updated => {
        return updated;
      });
  };
}

function removeEntity(res) {
  return function (entity) {
    if (entity) {
      return entity.remove()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

function handleEntityNotFound(res) {
  return function (entity) {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function (err) {
    res.status(statusCode).send(err);
  };
}

// Gets a list of Comments
export function index(req, res) {
  return Comment.find().exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Comment from the DB
export function show(req, res) {
  return Comment.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Comment in the DB
export function create(req, res) {
  return Comment.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Updates an existing Comment in the DB
export function update(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  return Comment.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Comment from the DB
export function destroy(req, res) {
  return Comment.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}

export function getCommentsByDate(req, res) {
  console.log(req.body);
  var personal = req.body.personal;
  if (personal) {
    return Comment.find({
      user: req.body.user,
      $and: [{"startDate": {$gte: req.body.startDate}}, {"endDate": {$lte: req.body.endDate}}],
      personal: req.body.personal
    }, '-users').sort({step: -1}).exec()
      .then(respondWithResult(res))
      .catch(handleError(res));
  } else {
    return Comment.find({
      $and: [{"startDate": {$gte: req.body.startDate}}, {"endDate": {$lte: req.body.endDate}}],
      //users: { $in :req.body.users},
      users: req.body.users.sort(),
      personal: req.body.personal,
    }).sort({step: -1}).exec()
      .then(respondWithResult(res))
      .catch(handleError(res));
  }

}

export function createOrUpdate(req, res) {
  //console.log(req.body);
  var query = {
      user: req.body.user,
      stepId: req.body.stepId,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      personal: req.body.personal
    },
    update = req.body,
    options = {upsert: true, new: true, setDefaultsOnInsert: true};
  return Comment.findOneAndUpdate(query, update, options).exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

/*




 // Find the document
 Model.findOneAndUpdate(query, update, options, function(error, result) {
 if (error) return;

 // do something with the document
 });

 */



