/**
 * Data model events
 */

'use strict';

import {EventEmitter} from 'events';
import Data from './data.model';
var DataEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
DataEvents.setMaxListeners(0);

// Model events
var events = {
  'save': 'save',
  'remove': 'remove'
};

// Register the event emitter to the model events
for (var e in events) {
  var event = events[e];
  Data.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function(doc) {
    DataEvents.emit(event + ':' + doc._id, doc);
    DataEvents.emit(event, doc);
  }
}

export default DataEvents;
