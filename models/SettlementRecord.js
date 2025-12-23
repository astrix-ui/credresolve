const mongoose = require('mongoose');

/**
 * SettlementRecord Schema
 * Tracks when debts are settled between participants
 * 
 * Design rationale: Separate collection for settlements allows us to maintain
 * an audit trail of all payments made, independent of original transactions
 */
const settlementRecordSchema = new mongoose.Schema({
  associatedHub: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CollectiveHub',
    required: true
  },
  payer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Participant',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Participant',
    required: true
  },
  settledAmount: {
    type: Number,
    required: true,
    min: 0.01
  },
  settlementDate: {
    type: Date,
    default: Date.now
  },
  settlementNotes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Indexes for efficient balance calculations
settlementRecordSchema.index({ associatedHub: 1, settlementDate: -1 });
settlementRecordSchema.index({ payer: 1, receiver: 1 });

const SettlementRecord = mongoose.model('SettlementRecord', settlementRecordSchema);

module.exports = SettlementRecord;
