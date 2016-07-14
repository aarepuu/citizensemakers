/**
 * Heart model events
 */

'use strict';

import {EventEmitter} from 'events';
import Heart from './heart.model';
var HeartEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
HeartEvents.setMaxListeners(0);

// Model events
var events = {
  'save': 'save',
  'remove': 'remove'
};

// Register the event emitter to the model events
for (var e in events) {
  var event = events[e];
  Heart.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function(doc) {
    HeartEvents.emit(event + ':' + doc._id, doc);
    HeartEvents.emit(event, doc);
  }
}

export default HeartEvents;
