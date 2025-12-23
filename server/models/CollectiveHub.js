const mongoose = require('mongoose');

/**
 * CollectiveHub Schema
 * Represents a group where multiple participants share expenses
 * Design choice: Keep group data lightweight, transactions stored separately
 */
const collectiveHubSchema = new mongoose.Schema({
  hubName: {
    type: String,
    required: true,
    trim: true,
    minlength: 1
  },
  hubDescription: {
    type: String,
    trim: true,
    default: ''
  },
  membersList: [{
    participantRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Participant',
      required: true
    },
    joinedOn: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Participant',
    required: true
  },
  establishedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
collectiveHubSchema.index({ 'membersList.participantRef': 1 });
collectiveHubSchema.index({ createdBy: 1 });

const CollectiveHub = mongoose.model('CollectiveHub', collectiveHubSchema);

module.exports = CollectiveHub;
