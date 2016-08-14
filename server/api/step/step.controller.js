/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/data/steps              ->  index
 * POST    /api/data/steps              ->  create
 * GET     /api/data/steps/:id          ->  show
 * PUT     /api/data/steps/:id          ->  update
 * DELETE  /api/data/steps/:id          ->  destroy
 */

'use strict';

import _ from 'lodash';
import Step from './step.model';

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

// Gets a list of Steps
export function index(req, res) {
  return Step.find().exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Step from the DB
export function show(req, res) {
  return Step.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Step in the DB
export function create(req, res) {
  return Step.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Updates an existing Step in the DB
export function update(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  return Step.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Step from the DB
export function destroy(req, res) {
  return Step.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}

// get max and min value of data
export function getMinMax(req, res) {
  return Step.aggregate([{$match: {"user": req.params.user}}, {
    $group: {
      "_id": "$user",
      "min": {$min: "$time"},
      "max": {$max: "$time"}
    }
  }]).exec()
    //return Data.find().exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}


// gets all data for one user
export function getData(req, res) {
  return Step.find({"user": req.params.user}).exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// get data limited with start end date
export function getDataByDate(req, res) {
  return Step.find({
    "user": req.params.user,
    "time": {$gte: req.params.start, $lte: req.params.end}
  }, '-day -hour').sort({time: 1}).exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}


// get allowed data from specific user
export function limitData(req, res) {
  var query;
  var query;
  if (req.body.week && !req.body.weekend) {
    query = {
      "user": req.body.fitbitId,
      "time": {$gte: req.body.start, $lte: req.body.end},
      $and: [{"day": {$lte: 5}}, {
        "hour": {
          $gte: req.body.weektime[0],
          $lte: req.body.weektime[1]
        }
      }]

    }
    ;
  } else if (req.body.weekend && !req.body.week) {
    query = {
      "user": req.body.fitbitId,
      "time": {$gte: req.body.start, $lte: req.body.end}, $and: [{"day": {$gt: 5}}, {
        "hour": {
          $gte: req.body.weekendtime[0],
          $lte: req.body.weekendtime[1]
        }
      }]

    };
  } else {
    query = {
      "user": req.body.fitbitId,
      "time": {$gte: req.body.start, $lte: req.body.end}, $or: [
        {
          $and: [{"day": {$lte: 5}}, {
            "hour": {
              $gte: req.body.weektime[0],
              $lte: req.body.weektime[1]
            }
          }]
        },
        {
          $and: [{"day": {$gt: 5}}, {
            "hour": {
              $gte: req.body.weekendtime[0],
              $lte: req.body.weekendtime[1]
            }
          }]
        }]
    };
  }
  return Step.find(query, '-day -hour').sort({time: 1}).exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}
