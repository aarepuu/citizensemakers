/**
 * Right model events
 */

'use strict';

import {EventEmitter} from 'events';
import Right from './right.model';
var RightEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
RightEvents.setMaxListeners(0);

// Model events
var events = {
  'save': 'save',
  'remove': 'remove'
};

// Register the event emitter to the model events
for (var e in events) {
  var event = events[e];
  Right.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function(doc) {
    RightEvents.emit(event + ':' + doc._id, doc);
    RightEvents.emit(event, doc);
  }
}

export default RightEvents;
