const mongoose = require('mongoose');

/**
 * Transaction Schema
 * Stores individual expense records with split information
 * 
 * Design Decision: Store split details within transaction for historical accuracy
 * Even if group members change, we preserve what the split looked like at transaction time
 */
const transactionSchema = new mongoose.Schema({
  associatedHub: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CollectiveHub',
    required: true
  },
  transactionTitle: {
    type: String,
    required: true,
    trim: true
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0.01
  },
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Participant',
    required: true
  },
  // How the expense is divided: 'equal', 'exact', 'percentage'
  divisionMethod: {
    type: String,
    required: true,
    enum: ['equal', 'exact', 'percentage']
  },
  // Individual breakdown for each participant
  breakdownDetails: [{
    participant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Participant',
      required: true
    },
    owedAmount: {
      type: Number,
      required: true,
      min: 0
    },
    // For percentage method, store the percentage too
    assignedPercentage: {
      type: Number,
      min: 0,
      max: 100
    }
  }],
  transactionDate: {
    type: Date,
    default: Date.now
  },
  notesOrContext: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Indexes for common query patterns
transactionSchema.index({ associatedHub: 1, transactionDate: -1 });
transactionSchema.index({ paidBy: 1 });
transactionSchema.index({ 'breakdownDetails.participant': 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
