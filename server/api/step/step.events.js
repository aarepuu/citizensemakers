/**
 * Step model events
 */

'use strict';

import {EventEmitter} from 'events';
import Step from './step.model';
var StepEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
StepEvents.setMaxListeners(0);

// Model events
var events = {
  'save': 'save',
  'remove': 'remove'
};

// Register the event emitter to the model events
for (var e in events) {
  var event = events[e];
  Step.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function(doc) {
    StepEvents.emit(event + ':' + doc._id, doc);
    StepEvents.emit(event, doc);
  }
}

export default StepEvents;
