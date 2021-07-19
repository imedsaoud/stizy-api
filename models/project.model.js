const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  projectId: {
    type: String,
    required: true,
    unique: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  ownerId: {
    type: String,
    default: '0',
    required: true
  },
  title: {
    type: String,
    required: true,
    unique: false
  },
  shortDescription: {
    type: String,
    required: true
  },
  longDescription: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: false,
  },
  userIds: {
    type: Array,
    required: true
  },
  updatedAt: {
    type: Array,
    required: true
  },
  useCaseId: {
    type: String,
    required: true
  },
},{
  versionKey: false
});

module.exports = mongoose.model('Project', ProjectSchema);




