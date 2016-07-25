/**
 * Sleep model events
 */

'use strict';

import {EventEmitter} from 'events';
import Sleep from './sleep.model';
var SleepEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
SleepEvents.setMaxListeners(0);

// Model events
var events = {
  'save': 'save',
  'remove': 'remove'
};

// Register the event emitter to the model events
for (var e in events) {
  var event = events[e];
  Sleep.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function(doc) {
    SleepEvents.emit(event + ':' + doc._id, doc);
    SleepEvents.emit(event, doc);
  }
}

export default SleepEvents;
