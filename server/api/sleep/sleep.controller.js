/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/data/sleeps              ->  index
 * POST    /api/data/sleeps              ->  create
 * GET     /api/data/sleeps/:id          ->  show
 * PUT     /api/data/sleeps/:id          ->  update
 * DELETE  /api/data/sleeps/:id          ->  destroy
 */

'use strict';

import _ from 'lodash';
import Sleep from './sleep.model';

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

// Gets a list of Sleeps
export function index(req, res) {
  return Sleep.find().exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Sleep from the DB
export function show(req, res) {
  return Sleep.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Sleep in the DB
export function create(req, res) {
  return Sleep.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Updates an existing Sleep in the DB
export function update(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  return Sleep.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Sleep from the DB
export function destroy(req, res) {
  return Sleep.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}

// get max and min value of data
export function getMinMax(req, res) {
  return Sleep.aggregate([{$match: {"user": req.params.user}}, {
    $group: {
      "_id": "$user",
      "min": {$first: "$time"},
      "max": {$last: "$time"}
    }
  }]).exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}


// get all data for one user
export function getData(req, res) {
  return Sleep.find({"user": req.params.user}).exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// get data limited with start end date
export function getDataByDate(req, res) {
  console.log(req.params);
  return Sleep.find({
    "user": req.params.user,
    "time": {$gte: req.params.start, $lte: req.params.end}
  }, '-day -hour').sort({time: 1}).exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}


// get allowed data from user
export function limitData(req, res) {
  var days = (req.body.week) ? (req.body.weekend) ? 7 : 5 : 0;
  return Sleep.find({
    "user": req.body.fitbitId,
    "time": {$gte: req.body.start, $lte: req.body.end},
    $or: [
      {$and: [{"day": {$lte: 5}}, {"hour": {$gte: req.body.weektime[0], $lte: req.body.weektime[1]}}]},
      {$and: [{"day": {$gt: 5}}, {"hour": {$gte: req.body.weekendtime[0], $lte: req.body.weekendtime[1]}}]}]
  }, '-day -hour').sort({time: 1}).exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}
