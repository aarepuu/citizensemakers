'use strict';

import mongoose from 'mongoose';

var CommentSchema = new mongoose.Schema({
  user: String,
  name: String,
  startDate: Date,
  endDate: Date,
  text: String,
  stepId: Number,
  personal: Boolean,
  users: {type: Array, "default": []}
}, {
  timestamps: true
});

export default mongoose.model('Comment', CommentSchema);
