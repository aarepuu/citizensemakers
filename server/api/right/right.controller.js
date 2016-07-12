/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/rights              ->  index
 * POST    /api/rights              ->  create
 * GET     /api/rights/:id          ->  show
 * PUT     /api/rights/:id          ->  update
 * DELETE  /api/rights/:id          ->  destroy
 */

'use strict';

import _ from 'lodash';
import Right from './right.model';

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if (entity) {
      res.status(statusCode).json(entity);
    }
  };
}

function saveUpdates(updates) {
  return function(entity) {
    var updated = _.merge(entity, updates);
    return updated.save()
      .then(updated => {
        return updated;
      });
  };
}

function removeEntity(res) {
  return function(entity) {
    if (entity) {
      return entity.remove()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

// Gets a list of Rights
export function index(req, res) {
  return Right.find().exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Right from the DB
export function show(req, res) {
  return Right.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Right in the DB
export function create(req, res) {
  return Right.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Updates an existing Right in the DB
export function update(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  return Right.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Right from the DB
export function destroy(req, res) {
  return Right.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}

// Searches for existing document to update or creates when not found
export function updateCreate(req, res){
  var query = {},
    update = { expire: new Date() },
    options = { upsert: true, new: true, setDefaultsOnInsert: true };
  return Right.findOneAndUpdate()
}
