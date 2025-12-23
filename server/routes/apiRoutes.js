const express = require('express');
const router = express.Router();

const participantController = require('../controllers/participantController');
const hubController = require('../controllers/hubController');
const transactionController = require('../controllers/transactionController');
const balanceController = require('../controllers/balanceController');

// Participant Routes
router.post('/createUser', participantController.createUser);
router.get('/users', participantController.getAllUsers);
router.get('/users/:userId', participantController.getUserDetails);
router.put('/users/:userId', participantController.updateUser);

// Group Routes
router.post('/createGroup', hubController.createGroup);
router.get('/groups/:hubId', hubController.getGroupDetails);
router.post('/groups/:hubId/members', hubController.addMember);
router.delete('/groups/:hubId/members', hubController.removeMember);
router.get('/users/:userId/groups', hubController.getUserGroups);

// Transaction Routes
router.post('/addExpense', transactionController.addExpense);
router.get('/groups/:hubId/expenses', transactionController.getHubExpenses);
router.get('/expenses/:transactionId', transactionController.getExpenseDetails);

// Balance & Settlement Routes
router.get('/getBalances/:hubId', balanceController.getBalances);
router.get('/users/:userId/balances/:hubId', balanceController.getUserBalances);
router.post('/settleBalance', balanceController.settleBalance);
router.get('/groups/:hubId/settlements', balanceController.getSettlementHistory);

module.exports = router;
