import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

const BalancesTab = ({ showMessage, allUsers }) => {
  const [balanceUser, setBalanceUser] = useState('');
  const [hubForBalances, setHubForBalances] = useState('');
  const [userGroups, setUserGroups] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [simplifyBalances, setSimplifyBalances] = useState(false);
  const [balances, setBalances] = useState([]);
  const [settlementHub, setSettlementHub] = useState('');
  const [settlementPayer, setSettlementPayer] = useState('');
  const [settlementReceiver, setSettlementReceiver] = useState('');
  const [settlementAmount, setSettlementAmount] = useState('');

  useEffect(() => {
    loadUserGroupsForBalances();
  }, [balanceUser]);

  useEffect(() => {
    loadBalances();
  }, [hubForBalances, simplifyBalances]);

  useEffect(() => {
    loadAllGroups();
  }, [allUsers]);

  const loadUserGroupsForBalances = async () => {
    if (!balanceUser) return;
    
    try {
      const response = await axios.get(`${API_BASE}/users/${balanceUser}/groups`);
      if (response.data.success) {
        setUserGroups(response.data.data);
      }
    } catch (error) {
      showMessage('Failed to load groups', 'error');
    }
  };

  const loadAllGroups = async () => {
    if (allUsers.length === 0) return;
    
    try {
      const groupsSet = new Set();
      const groupsMap = new Map();
      
      for (const user of allUsers) {
        const response = await axios.get(`${API_BASE}/users/${user._id}/groups`);
        if (response.data.success) {
          response.data.data.forEach(group => {
            if (!groupsSet.has(group._id)) {
              groupsSet.add(group._id);
              groupsMap.set(group._id, group);
            }
          });
        }
      }
      
      setAllGroups(Array.from(groupsMap.values()));
    } catch (error) {
      // Silent fail
    }
  };

  const loadBalances = async () => {
    if (!hubForBalances) {
      setBalances([]);
      return;
    }

    try {
      const url = simplifyBalances 
        ? `${API_BASE}/getBalances/${hubForBalances}?simplified=true`
        : `${API_BASE}/getBalances/${hubForBalances}`;
      
      const response = await axios.get(url);
      
      if (response.data.success) {
        setBalances(response.data.data);
      }
    } catch (error) {
      showMessage(error.response?.data?.message || 'Failed to load balances', 'error');
    }
  };

  const settleBalance = async () => {
    if (!settlementHub || !settlementPayer || !settlementReceiver || !settlementAmount) {
      showMessage('Please fill all fields', 'error');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE}/settleBalance`, {
        hubId: settlementHub,
        payerId: settlementPayer,
        receiverId: settlementReceiver,
        amount: parseFloat(settlementAmount)
      });

      if (response.data.success) {
        showMessage('Settlement recorded successfully!');
        setSettlementAmount('');
        loadBalances();
      } else {
        showMessage(response.data.message, 'error');
      }
    } catch (error) {
      showMessage(error.response?.data?.message || 'Failed to record settlement', 'error');
    }
  };

  const renderBalances = () => {
    if (!balances || balances.length === 0) {
      return <p style={{ color: '#666', padding: '20px' }}>No balances to display. Add some expenses first!</p>;
    }

    if (simplifyBalances) {
      return balances.map((debt, index) => (
        <div key={index} className="debt-item">
          <span>
            <strong>{debt.from?.name || debt.from?.displayName || 'Unknown'}</strong> owes{' '}
            <strong>{debt.to?.name || debt.to?.displayName || 'Unknown'}</strong>
          </span>
          <span className="amount-badge">₹{debt.amount?.toFixed(2) || '0.00'}</span>
        </div>
      ));
    }

    return balances.map((balance, index) => (
      <div key={index} style={{ marginBottom: '24px' }}>
        <h4 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '12px' }}>
          {balance.debtor?.name || balance.debtor?.displayName || 'Unknown'}
        </h4>
        <div className="debt-item">
          <span>
            <strong>{balance.debtor?.name || 'Unknown'}</strong> owes{' '}
            <strong>{balance.creditor?.name || 'Unknown'}</strong>
          </span>
          <span className="amount-badge">₹{balance.amount?.toFixed(2) || '0.00'}</span>
        </div>
      </div>
    ));
  };

  return (
    <div className="tab-content active">
      <h2>View Balances</h2>
      <p className="helper-text">See who owes whom in each group.</p>
      <div className="form-group">
        <label>Your Account</label>
        <select value={balanceUser} onChange={(e) => setBalanceUser(e.target.value)}>
          <option value="">Select your user account</option>
          {allUsers.map(user => (
            <option key={user._id} value={user._id}>{user.displayName}</option>
          ))}
        </select>
        
        <label>Select Group</label>
        <select value={hubForBalances} onChange={(e) => setHubForBalances(e.target.value)}>
          <option value="">Choose a group to view balances</option>
          {userGroups.map(group => (
            <option key={group._id} value={group._id}>{group.hubName}</option>
          ))}
        </select>
        
        <div className="balance-controls">
          <label>
            <input
              type="checkbox"
              checked={simplifyBalances}
              onChange={(e) => setSimplifyBalances(e.target.checked)}
            />
Show Simplified Balances
          </label>
        </div>
      </div>
      
      <div className="list-container" style={{ display: 'block' }}>
        {renderBalances()}
      </div>
      
      <h3>Record a Settlement</h3>
      <p className="helper-text">Record payments to update balances.</p>
      <div className="form-group">
        <label>Group</label>
        <select value={settlementHub} onChange={(e) => setSettlementHub(e.target.value)}>
          <option value="">Select which group this payment is for</option>
          {allGroups.map(group => (
            <option key={group._id} value={group._id}>{group.hubName}</option>
          ))}
        </select>
        
        <label>Who is Paying</label>
        <select value={settlementPayer} onChange={(e) => setSettlementPayer(e.target.value)}>
          <option value="">Select the person paying back</option>
          {allUsers.map(user => (
            <option key={user._id} value={user._id}>{user.displayName}</option>
          ))}
        </select>
        
        <label>Who is Receiving</label>
        <select value={settlementReceiver} onChange={(e) => setSettlementReceiver(e.target.value)}>
          <option value="">Select the person receiving payment</option>
          {allUsers.map(user => (
            <option key={user._id} value={user._id}>{user.displayName}</option>
          ))}
        </select>
        
        <label>Amount</label>
        <input
          type="number"
          value={settlementAmount}
          onChange={(e) => setSettlementAmount(e.target.value)}
          placeholder="0.00"
          step="0.01"
        />
        
        <button onClick={settleBalance}>Record Settlement</button>
      </div>
    </div>
  );
};

export default BalancesTab;
