const Transaction = require('../models/Transaction');
const SettlementRecord = require('../models/SettlementRecord');

/**
 * LedgerCalculator Service
 * Handles all balance calculations and debt simplification logic
 * 
 * DESIGN PHILOSOPHY:
 * Instead of storing running balances, we compute them on-demand from transactions and settlements.
 * This ensures data consistency and provides an accurate audit trail.
 */

class LedgerCalculator {
  
  /**
   * Computes raw balance map for a hub
   * Returns a map of participant pairs with outstanding amounts
   * 
   * Algorithm:
   * 1. Process all transactions: who paid vs who owes
   * 2. Subtract all settlements
   * 3. Result: net amounts owed between pairs
   */
  async computeRawBalances(hubId) {
    // Structure: { 'payerId_receiverId': amount }
    const balanceMap = {};
    
    // Fetch all transactions for this hub
    const transactions = await Transaction.find({ associatedHub: hubId })
      .populate('paidBy')
      .populate('breakdownDetails.participant');
    
    // Process each transaction
    for (const txn of transactions) {
      const payerId = txn.paidBy._id.toString();
      
      for (const breakdown of txn.breakdownDetails) {
        const debtorId = breakdown.participant._id.toString();
        
        // Skip if same person (they don't owe themselves)
        if (payerId === debtorId) continue;
        
        const pairKey = `${debtorId}_${payerId}`;
        balanceMap[pairKey] = (balanceMap[pairKey] || 0) + breakdown.owedAmount;
      }
    }
    
    // Now subtract all settlements
    const settlements = await SettlementRecord.find({ associatedHub: hubId });
    
    for (const settlement of settlements) {
      const payerId = settlement.payer.toString();
      const receiverId = settlement.receiver.toString();
      const pairKey = `${payerId}_${receiverId}`;
      
      balanceMap[pairKey] = (balanceMap[pairKey] || 0) - settlement.settledAmount;
    }
    
    // Clean up zero or negative balances
    for (const key in balanceMap) {
      if (balanceMap[key] <= 0.01) {
        delete balanceMap[key];
      }
    }
    
    return balanceMap;
  }
  
  /**
   * Simplifies debts using a graph-based approach
   * 
   * ALGORITHM EXPLANATION:
   * We convert the debt graph into a net balance for each person.
   * Then match creditors with debtors to minimize transaction count.
   * 
   * Example: If A owes B $20, B owes C $20, we simplify to: A owes C $20
   */
  async simplifyDebts(hubId) {
    const rawBalances = await this.computeRawBalances(hubId);
    
    // Calculate net balance for each participant
    const netBalances = {};
    
    for (const [key, amount] of Object.entries(rawBalances)) {
      const [debtor, creditor] = key.split('_');
      
      netBalances[debtor] = (netBalances[debtor] || 0) - amount;
      netBalances[creditor] = (netBalances[creditor] || 0) + amount;
    }
    
    // Separate into people who owe and people who are owed
    const debtors = [];
    const creditors = [];
    
    for (const [personId, balance] of Object.entries(netBalances)) {
      if (balance < -0.01) {
        debtors.push({ id: personId, amount: Math.abs(balance) });
      } else if (balance > 0.01) {
        creditors.push({ id: personId, amount: balance });
      }
    }
    
    // Match debtors with creditors
    const simplifiedTransactions = [];
    let debtorIdx = 0;
    let creditorIdx = 0;
    
    while (debtorIdx < debtors.length && creditorIdx < creditors.length) {
      const debtor = debtors[debtorIdx];
      const creditor = creditors[creditorIdx];
      
      const settleAmount = Math.min(debtor.amount, creditor.amount);
      
      simplifiedTransactions.push({
        from: debtor.id,
        to: creditor.id,
        amount: parseFloat(settleAmount.toFixed(2))
      });
      
      debtor.amount -= settleAmount;
      creditor.amount -= settleAmount;
      
      if (debtor.amount < 0.01) debtorIdx++;
      if (creditor.amount < 0.01) creditorIdx++;
    }
    
    return simplifiedTransactions;
  }
  
  /**
   * Gets detailed balance breakdown for a specific participant
   * Shows both what they owe and what's owed to them
   */
  async getParticipantBalances(participantId, hubId) {
    const rawBalances = await this.computeRawBalances(hubId);
    const participantIdStr = participantId.toString();
    
    const owedBy = []; // People who owe this participant
    const owesTo = [];  // People this participant owes
    
    for (const [key, amount] of Object.entries(rawBalances)) {
      const [debtor, creditor] = key.split('_');
      
      if (debtor === participantIdStr) {
        owesTo.push({
          personId: creditor,
          amount: parseFloat(amount.toFixed(2))
        });
      } else if (creditor === participantIdStr) {
        owedBy.push({
          personId: debtor,
          amount: parseFloat(amount.toFixed(2))
        });
      }
    }
    
    return { owesTo, owedBy };
  }
  
  /**
   * Validates split amounts match total
   * Used when creating transactions
   */
  validateSplitAccuracy(totalAmount, breakdownDetails, divisionMethod) {
    let calculatedTotal = 0;
    
    if (divisionMethod === 'percentage') {
      let totalPercentage = 0;
      for (const detail of breakdownDetails) {
        totalPercentage += detail.assignedPercentage || 0;
      }
      // Allow small rounding differences
      if (Math.abs(totalPercentage - 100) > 0.01) {
        return { valid: false, message: 'Percentages must sum to 100%' };
      }
    }
    
    for (const detail of breakdownDetails) {
      calculatedTotal += detail.owedAmount;
    }
    
    // Allow for small floating point differences
    const difference = Math.abs(totalAmount - calculatedTotal);
    if (difference > 0.02) {
      return { 
        valid: false, 
        message: `Split amounts (${calculatedTotal}) don't match total (${totalAmount})` 
      };
    }
    
    return { valid: true };
  }
}

module.exports = new LedgerCalculator();
