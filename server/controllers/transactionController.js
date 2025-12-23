const transactionService = require('../services/transactionService');

/**
 * TransactionController
 * Handles HTTP requests for expense transactions
 */

class TransactionController {
  
  async addExpense(req, res) {
    try {
      const {
        hubId,
        transactionTitle,
        totalAmount,
        payerId,
        divisionMethod,
        splitDetails,
        notes
      } = req.body;
      
      // Validate required fields
      if (!hubId || !transactionTitle || !totalAmount || !payerId || !divisionMethod) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: hubId, transactionTitle, totalAmount, payerId, divisionMethod'
        });
      }
      
      if (!splitDetails || splitDetails.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'splitDetails must contain at least one participant'
        });
      }
      
      const transaction = await transactionService.recordNewExpense({
        hubId,
        transactionTitle,
        totalAmount,
        payerId,
        divisionMethod,
        splitDetails,
        notes
      });
      
      res.status(201).json({
        success: true,
        message: 'Expense recorded successfully',
        data: transaction
      });
      
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async getHubExpenses(req, res) {
    try {
      const { hubId } = req.params;
      const limit = parseInt(req.query.limit) || 50;
      
      const transactions = await transactionService.fetchHubTransactions(hubId, limit);
      
      res.status(200).json({
        success: true,
        count: transactions.length,
        data: transactions
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async getExpenseDetails(req, res) {
    try {
      const { transactionId } = req.params;
      
      const transaction = await transactionService.fetchTransactionById(transactionId);
      
      res.status(200).json({
        success: true,
        data: transaction
      });
      
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new TransactionController();
