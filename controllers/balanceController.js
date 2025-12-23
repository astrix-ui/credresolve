const ledgerCalculator = require('../services/ledgerCalculator');
const settlementService = require('../services/settlementService');
const Participant = require('../models/Participant');

/**
 * BalanceController
 * Handles balance queries and settlement operations
 */

class BalanceController {
  
  async getBalances(req, res) {
    try {
      const { hubId } = req.params;
      const { simplified } = req.query;
      
      // Return simplified debts if requested
      if (simplified === 'true') {
        const simplifiedDebts = await ledgerCalculator.simplifyDebts(hubId);
        
        // Populate participant names
        const enrichedDebts = await Promise.all(
          simplifiedDebts.map(async (debt) => {
            const fromParticipant = await Participant.findById(debt.from).select('displayName');
            const toParticipant = await Participant.findById(debt.to).select('displayName');
            
            return {
              from: {
                id: debt.from,
                name: fromParticipant?.displayName || 'Unknown'
              },
              to: {
                id: debt.to,
                name: toParticipant?.displayName || 'Unknown'
              },
              amount: debt.amount
            };
          })
        );
        
        return res.status(200).json({
          success: true,
          message: 'Simplified balances',
          data: enrichedDebts
        });
      }
      
      // Return raw balances
      const rawBalances = await ledgerCalculator.computeRawBalances(hubId);
      
      // Convert to more readable format
      const formattedBalances = [];
      for (const [key, amount] of Object.entries(rawBalances)) {
        const [debtorId, creditorId] = key.split('_');
        const debtor = await Participant.findById(debtorId).select('displayName');
        const creditor = await Participant.findById(creditorId).select('displayName');
        
        formattedBalances.push({
          debtor: {
            id: debtorId,
            name: debtor?.displayName || 'Unknown'
          },
          creditor: {
            id: creditorId,
            name: creditor?.displayName || 'Unknown'
          },
          amount
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Raw balances',
        data: formattedBalances
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async getUserBalances(req, res) {
    try {
      const { userId, hubId } = req.params;
      
      const balances = await ledgerCalculator.getParticipantBalances(userId, hubId);
      
      // Enrich with participant names
      const enrichOwes = await Promise.all(
        balances.owesTo.map(async (debt) => {
          const creditor = await Participant.findById(debt.personId).select('displayName');
          return {
            ...debt,
            personName: creditor?.displayName || 'Unknown'
          };
        })
      );
      
      const enrichOwed = await Promise.all(
        balances.owedBy.map(async (debt) => {
          const debtor = await Participant.findById(debt.personId).select('displayName');
          return {
            ...debt,
            personName: debtor?.displayName || 'Unknown'
          };
        })
      );
      
      res.status(200).json({
        success: true,
        data: {
          owesTo: enrichOwes,
          owedBy: enrichOwed
        }
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async settleBalance(req, res) {
    try {
      const { hubId, payerId, receiverId, amount, notes } = req.body;
      
      if (!hubId || !payerId || !receiverId || !amount) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: hubId, payerId, receiverId, amount'
        });
      }
      
      if (amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Amount must be greater than 0'
        });
      }
      
      const settlement = await settlementService.processSettlement({
        hubId,
        payerId,
        receiverId,
        settledAmount: amount,
        notes
      });
      
      res.status(201).json({
        success: true,
        message: 'Settlement recorded successfully',
        data: settlement
      });
      
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async getSettlementHistory(req, res) {
    try {
      const { hubId } = req.params;
      const limit = parseInt(req.query.limit) || 50;
      
      const settlements = await settlementService.fetchHubSettlements(hubId, limit);
      
      res.status(200).json({
        success: true,
        count: settlements.length,
        data: settlements
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new BalanceController();
