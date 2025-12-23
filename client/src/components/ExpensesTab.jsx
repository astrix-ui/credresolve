import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

const ExpensesTab = ({ showMessage, allUsers }) => {
  const [expenseUser, setExpenseUser] = useState('');
  const [expenseHub, setExpenseHub] = useState('');
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expensePayer, setExpensePayer] = useState('');
  const [splitMethod, setSplitMethod] = useState('equal');
  const [userGroups, setUserGroups] = useState([]);
  const [hubMembers, setHubMembers] = useState([]);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [splitAmounts, setSplitAmounts] = useState('');
  const [splitPercentages, setSplitPercentages] = useState('');
  const [hubForExpenses, setHubForExpenses] = useState('');
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    loadUserGroupsForExpenses();
  }, [expenseUser]);

  useEffect(() => {
    updateSplitUI();
  }, [expenseHub, splitMethod]);

  useEffect(() => {
    loadHubExpenses();
  }, [hubForExpenses]);

  const loadUserGroupsForExpenses = async () => {
    if (!expenseUser) return;
    
    try {
      const response = await axios.get(`${API_BASE}/users/${expenseUser}/groups`);
      if (response.data.success) {
        setUserGroups(response.data.data);
      }
    } catch (error) {
      showMessage('Failed to load groups', 'error');
    }
  };

  const updateSplitUI = async () => {
    if (!expenseHub) {
      setHubMembers([]);
      return;
    }

    try {
      const response = await axios.get(`${API_BASE}/groups/${expenseHub}`);
      if (response.data.success && response.data.data.membersList) {
        const members = response.data.data.membersList
          .filter(m => m.isActive)
          .map(m => ({
            id: m.participantRef._id,
            name: m.participantRef.displayName
          }));
        setHubMembers(members);
        setSelectedParticipants([]);
      }
    } catch (error) {
      // Silent fail
    }
  };

  const toggleParticipant = (participantId) => {
    setSelectedParticipants(prev => 
      prev.includes(participantId)
        ? prev.filter(id => id !== participantId)
        : [...prev, participantId]
    );
  };

  const addExpense = async () => {
    if (!expenseHub || !expenseTitle || !expenseAmount || !expensePayer) {
      showMessage('Please fill all required fields', 'error');
      return;
    }

    if (selectedParticipants.length === 0) {
      showMessage('Please select at least one participant to split with', 'error');
      return;
    }

    let splitDetails;

    if (splitMethod === 'equal') {
      splitDetails = selectedParticipants;
    } else if (splitMethod === 'exact') {
      if (!splitAmounts) {
        showMessage('Please enter amounts for each participant', 'error');
        return;
      }
      const amounts = splitAmounts.split(',').map(s => parseFloat(s.trim()));
      if (amounts.length !== selectedParticipants.length) {
        showMessage(`Please enter ${selectedParticipants.length} amounts (one for each selected participant)`, 'error');
        return;
      }
      splitDetails = selectedParticipants.map((id, idx) => ({
        participantId: id,
        amount: amounts[idx]
      }));
    } else if (splitMethod === 'percentage') {
      if (!splitPercentages) {
        showMessage('Please enter percentages for each participant', 'error');
        return;
      }
      const percentages = splitPercentages.split(',').map(s => parseFloat(s.trim()));
      if (percentages.length !== selectedParticipants.length) {
        showMessage(`Please enter ${selectedParticipants.length} percentages (one for each selected participant)`, 'error');
        return;
      }
      const total = percentages.reduce((sum, p) => sum + p, 0);
      if (Math.abs(total - 100) > 0.01) {
        showMessage(`Percentages must total 100% (currently ${total}%)`, 'error');
        return;
      }
      splitDetails = selectedParticipants.map((id, idx) => ({
        participantId: id,
        percentage: percentages[idx]
      }));
    }

    try {
      const response = await axios.post(`${API_BASE}/addExpense`, {
        hubId: expenseHub,
        transactionTitle: expenseTitle,
        totalAmount: parseFloat(expenseAmount),
        payerId: expensePayer,
        divisionMethod: splitMethod,
        splitDetails
      });

      if (response.data.success) {
        showMessage('Expense added successfully!');
        setExpenseTitle('');
        setExpenseAmount('');
        setSelectedParticipants([]);
        setSplitAmounts('');
        setSplitPercentages('');
      } else {
        showMessage(response.data.message, 'error');
      }
    } catch (error) {
      showMessage('Failed to add expense', 'error');
    }
  };

  const loadHubExpenses = async () => {
    if (!hubForExpenses) return;

    try {
      const response = await axios.get(`${API_BASE}/groups/${hubForExpenses}/expenses`);
      if (response.data.success) {
        setExpenses(response.data.data);
      }
    } catch (error) {
      showMessage('Failed to load expenses', 'error');
    }
  };

  return (
    <div className="tab-content active">
      <h2>Add New Expense</h2>
      <p className="helper-text">Record expenses and split them among members.</p>
      <div className="form-group">
        <label>Your Account</label>
        <select value={expenseUser} onChange={(e) => setExpenseUser(e.target.value)}>
          <option value="">Select your user account</option>
          {allUsers.map(user => (
            <option key={user._id} value={user._id}>{user.displayName}</option>
          ))}
        </select>
        
        <label>Group</label>
        <select value={expenseHub} onChange={(e) => setExpenseHub(e.target.value)}>
          <option value="">Select which group this expense is for</option>
          {userGroups.map(group => (
            <option key={group._id} value={group._id}>{group.hubName}</option>
          ))}
        </select>
        
        <label>Expense Description</label>
        <input
          type="text"
          value={expenseTitle}
          onChange={(e) => setExpenseTitle(e.target.value)}
          placeholder="e.g., Groceries, Dinner, Gas"
        />
        
        <label>Total Amount</label>
        <input
          type="number"
          value={expenseAmount}
          onChange={(e) => setExpenseAmount(e.target.value)}
          placeholder="0.00"
          step="0.01"
        />
        
        <label>Who Paid?</label>
        <select value={expensePayer} onChange={(e) => setExpensePayer(e.target.value)}>
          <option value="">Select who paid for this expense</option>
          {allUsers.map(user => (
            <option key={user._id} value={user._id}>{user.displayName}</option>
          ))}
        </select>
        
        <label>How to Split</label>
        <select value={splitMethod} onChange={(e) => setSplitMethod(e.target.value)}>
          <option value="equal">Equal Split - Divide evenly among selected people</option>
          <option value="exact">Exact Amounts - Specify exact amounts per person</option>
          <option value="percentage">Percentage Split - Specify percentage per person</option>
        </select>
        
        <div id="splitDetails">
          {expenseHub && hubMembers.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <label>Select participants to split with:</label>
              <div style={{ border: '1px solid #ddd', padding: '12px', borderRadius: '4px', maxHeight: '200px', overflowY: 'auto', background: '#fff' }}>
                {hubMembers.map(member => (
                  <label key={member.id} style={{ display: 'block', margin: '8px 0', cursor: 'pointer', fontSize: '13px', fontWeight: '400', letterSpacing: '0' }}>
                    <input
                      type="checkbox"
                      className="split-participant"
                      checked={selectedParticipants.includes(member.id)}
                      onChange={() => toggleParticipant(member.id)}
                      style={{ marginRight: '8px' }}
                    />
                    {member.name}
                  </label>
                ))}
              </div>
              {splitMethod === 'exact' && (
                <>
                  <label style={{ marginTop: '12px' }}>Enter amount for each selected participant (in order):</label>
                  <input
                    type="text"
                    value={splitAmounts}
                    onChange={(e) => setSplitAmounts(e.target.value)}
                    placeholder="50.00,30.00,20.00"
                    style={{ width: '100%' }}
                  />
                  <small style={{ display: 'block', color: '#666', fontSize: '11px', marginTop: '-8px', marginBottom: '12px' }}>
                    Enter amounts separated by commas, matching the order you selected participants
                  </small>
                </>
              )}
              {splitMethod === 'percentage' && (
                <>
                  <label style={{ marginTop: '12px' }}>Enter percentage for each selected participant (in order):</label>
                  <input
                    type="text"
                    value={splitPercentages}
                    onChange={(e) => setSplitPercentages(e.target.value)}
                    placeholder="50,30,20"
                    style={{ width: '100%' }}
                  />
                  <small style={{ display: 'block', color: '#666', fontSize: '11px', marginTop: '-8px', marginBottom: '12px' }}>
                    Enter percentages separated by commas (must total 100%)
                  </small>
                </>
              )}
            </div>
          )}
        </div>
        
        <button onClick={addExpense}>Add Expense</button>
      </div>
      
      <h3>View Expenses</h3>
      <div className="form-group">
        <label>Select Group</label>
        <select value={hubForExpenses} onChange={(e) => setHubForExpenses(e.target.value)}>
          <option value="">Choose a group to view expenses</option>
          {userGroups.map(group => (
            <option key={group._id} value={group._id}>{group.hubName}</option>
          ))}
        </select>
      </div>
      <div className="list-container">
        {expenses.map(expense => (
          <div key={expense._id} className="list-item">
            <h4>{expense.transactionTitle}</h4>
            <p><strong>Amount:</strong> ₹{expense.totalAmount}</p>
            <p><strong>Paid by:</strong> {expense.paidBy?.displayName || 'Unknown'}</p>
            <p><strong>Method:</strong> {expense.divisionMethod}</p>
            <p><small>{new Date(expense.transactionDate).toLocaleDateString()}</small></p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpensesTab;
