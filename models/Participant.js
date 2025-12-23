const mongoose = require('mongoose');

/**
 * Participant Schema
 * Represents individual users in the system
 * Each participant can belong to multiple groups and have various transactions
 */
const participantSchema = new mongoose.Schema({
  displayName: {
    type: String,
    required: true,
    trim: true,
    minlength: 2
  },
  contactInfo: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    // Could be email or phone - keeping flexible
    validate: {
      validator: function(v) {
        return v && v.length > 3;
      },
      message: 'Contact info must be at least 3 characters'
    }
  },
  associatedGroups: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CollectiveHub'
  }],
  recordCreatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster lookups
participantSchema.index({ contactInfo: 1 });
participantSchema.index({ displayName: 1 });

const Participant = mongoose.model('Participant', participantSchema);

module.exports = Participant;
