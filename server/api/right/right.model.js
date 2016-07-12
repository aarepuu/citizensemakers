'use strict';

import mongoose from 'mongoose';

var RightSchema = new mongoose.Schema({
  owner: String,
  user: String,
  weekdays: Boolean,
  weekdayRange: Array,
  weekends: Boolean,
  weekendRange: Array

});

export default mongoose.model('Right', RightSchema);
