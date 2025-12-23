const Transaction = require('../models/Transaction');
const CollectiveHub = require('../models/CollectiveHub');
const Participant = require('../models/Participant');
const ledgerCalculator = require('./ledgerCalculator');

/**
 * TransactionService
 * Handles expense/transaction creation and management
 */

class TransactionService {
  
  /**
   * Creates a new expense transaction
   * Handles equal, exact, and percentage split methods
   */
  async recordNewExpense(expenseData) {
    const {
      hubId,
      transactionTitle,
      totalAmount,
      payerId,
      divisionMethod,
      splitDetails
    } = expenseData;
    
    // Validate hub exists
    const hub = await CollectiveHub.findById(hubId);
    if (!hub) {
      throw new Error('Hub not found');
    }
    
    // Validate payer is a member
    const payerIsMember = hub.membersList.some(
      m => m.participantRef.toString() === payerId.toString() && m.isActive
    );
    
    if (!payerIsMember) {
      throw new Error('Payer must be an active member of the hub');
    }
    
    // Calculate breakdown based on division method
    let breakdownDetails;
    
    switch (divisionMethod) {
      case 'equal':
        breakdownDetails = this.calculateEqualSplit(totalAmount, splitDetails);
        break;
      case 'exact':
        breakdownDetails = this.calculateExactSplit(splitDetails);
        break;
      case 'percentage':
        breakdownDetails = this.calculatePercentageSplit(totalAmount, splitDetails);
        break;
      default:
        throw new Error('Invalid division method');
    }
    
    // Validate split accuracy
    const validation = ledgerCalculator.validateSplitAccuracy(
      totalAmount, 
      breakdownDetails, 
      divisionMethod
    );
    
    if (!validation.valid) {
      throw new Error(validation.message);
    }
    
    // Create transaction
    const transaction = new Transaction({
      associatedHub: hubId,
      transactionTitle,
      totalAmount,
      paidBy: payerId,
      divisionMethod,
      breakdownDetails,
      notesOrContext: expenseData.notes || ''
    });
    
    await transaction.save();
    return transaction;
  }
  
  /**
   * Equal split: divide amount equally among all participants
   */
  calculateEqualSplit(totalAmount, participantIds) {
    const numParticipants = participantIds.length;
    const amountPerPerson = totalAmount / numParticipants;
    
    return participantIds.map(id => ({
      participant: id,
      owedAmount: parseFloat(amountPerPerson.toFixed(2))
    }));
  }
  
  /**
   * Exact split: each person pays a specified amount
   */
  calculateExactSplit(splitDetails) {
    return splitDetails.map(detail => ({
      participant: detail.participantId,
      owedAmount: parseFloat(detail.amount.toFixed(2))
    }));
  }
  
  /**
   * Percentage split: each person pays a percentage of total
   */
  calculatePercentageSplit(totalAmount, splitDetails) {
    return splitDetails.map(detail => {
      const percentage = detail.percentage;
      const amount = (totalAmount * percentage) / 100;
      
      return {
        participant: detail.participantId,
        owedAmount: parseFloat(amount.toFixed(2)),
        assignedPercentage: percentage
      };
    });
  }
  
  /**
   * Retrieves all transactions for a hub
   */
  async fetchHubTransactions(hubId, limit = 50) {
    const transactions = await Transaction.find({ associatedHub: hubId })
      .populate('paidBy', 'displayName contactInfo')
      .populate('breakdownDetails.participant', 'displayName')
      .sort({ transactionDate: -1 })
      .limit(limit);
    
    return transactions;
  }
  
  /**
   * Get transaction details by ID
   */
  async fetchTransactionById(transactionId) {
    const transaction = await Transaction.findById(transactionId)
      .populate('paidBy', 'displayName contactInfo')
      .populate('breakdownDetails.participant', 'displayName contactInfo')
      .populate('associatedHub', 'hubName');
    
    if (!transaction) {
      throw new Error('Transaction not found');
    }
    
    return transaction;
  }
}

module.exports = new TransactionService();
