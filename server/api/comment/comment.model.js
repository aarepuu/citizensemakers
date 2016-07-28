'use strict';

import mongoose from 'mongoose';

var CommentSchema = new mongoose.Schema({
  user: String,
  startDate: Date,
  endDate: Date,
  text: String,
  stepId: Number,
  personal: Boolean,
  users: {type: Array, "default": []}
});

export default mongoose.model('Comment', CommentSchema);
