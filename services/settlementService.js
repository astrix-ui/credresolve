const SettlementRecord = require('../models/SettlementRecord');
const CollectiveHub = require('../models/CollectiveHub');
const Participant = require('../models/Participant');
const ledgerCalculator = require('./ledgerCalculator');

/**
 * SettlementService
 * Handles debt settlements between participants
 */

class SettlementService {
  
  /**
   * Records a settlement between two participants
   * Updates the ledger by creating a settlement record
   */
  async processSettlement(settlementData) {
    const {
      hubId,
      payerId,
      receiverId,
      settledAmount,
      notes
    } = settlementData;
    
    // Validate hub exists
    const hub = await CollectiveHub.findById(hubId);
    if (!hub) {
      throw new Error('Hub not found');
    }
    
    // Validate both participants are members
    const payerIsMember = hub.membersList.some(
      m => m.participantRef.toString() === payerId.toString() && m.isActive
    );
    const receiverIsMember = hub.membersList.some(
      m => m.participantRef.toString() === receiverId.toString() && m.isActive
    );
    
    if (!payerIsMember || !receiverIsMember) {
      throw new Error('Both participants must be active members of the hub');
    }
    
    // Optional: Verify there's actually a debt to settle
    const balances = await ledgerCalculator.getParticipantBalances(payerId, hubId);
    const owesToReceiver = balances.owesTo.find(
      debt => debt.personId === receiverId.toString()
    );
    
    if (!owesToReceiver) {
      console.warn('Warning: Recording settlement with no existing debt');
    } else if (owesToReceiver.amount < settledAmount) {
      throw new Error(
        `Settlement amount (${settledAmount}) exceeds debt (${owesToReceiver.amount})`
      );
    }
    
    // Create settlement record
    const settlement = new SettlementRecord({
      associatedHub: hubId,
      payer: payerId,
      receiver: receiverId,
      settledAmount: parseFloat(settledAmount.toFixed(2)),
      settlementNotes: notes || ''
    });
    
    await settlement.save();
    return settlement;
  }
  
  /**
   * Gets settlement history for a hub
   */
  async fetchHubSettlements(hubId, limit = 50) {
    const settlements = await SettlementRecord.find({ associatedHub: hubId })
      .populate('payer', 'displayName contactInfo')
      .populate('receiver', 'displayName contactInfo')
      .sort({ settlementDate: -1 })
      .limit(limit);
    
    return settlements;
  }
  
  /**
   * Gets settlement history between two specific participants
   */
  async fetchPairSettlements(hubId, participantId1, participantId2) {
    const settlements = await SettlementRecord.find({
      associatedHub: hubId,
      $or: [
        { payer: participantId1, receiver: participantId2 },
        { payer: participantId2, receiver: participantId1 }
      ]
    })
    .populate('payer', 'displayName')
    .populate('receiver', 'displayName')
    .sort({ settlementDate: -1 });
    
    return settlements;
  }
}

module.exports = new SettlementService();
