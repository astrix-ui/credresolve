import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import Header from './components/Header';
import Tabs from './components/Tabs';
import Message from './components/Message';
import UsersTab from './components/UsersTab';
import GroupsTab from './components/GroupsTab';
import ExpensesTab from './components/ExpensesTab';
import BalancesTab from './components/BalancesTab';

const API_BASE = 'http://localhost:3000/api';

function App() {
  const [activeTab, setActiveTab] = useState('users');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    loadAllUsers();
  }, []);

  const loadAllUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE}/users`);
      if (response.data.success) {
        setAllUsers(response.data.data);
      }
    } catch (error) {
      // Silent fail
    }
  };

  const showMessage = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
  };

  const closeMessage = () => {
    setMessage('');
    setMessageType('');
  };

  // Refresh users when switching tabs or after operations
  useEffect(() => {
    loadAllUsers();
  }, [activeTab]);

  return (
    <div className="container">
      <Header />
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div style={{ flex: 1, overflowY: 'auto', background: 'var(--color-bg)' }}>
        <div style={{ maxWidth: '80%', margin: '0 auto', paddingTop: 'var(--spacing-xl)' }}>
          {activeTab === 'users' && <UsersTab showMessage={showMessage} />}
          {activeTab === 'groups' && <GroupsTab showMessage={showMessage} allUsers={allUsers} />}
          {activeTab === 'expenses' && <ExpensesTab showMessage={showMessage} allUsers={allUsers} />}
          {activeTab === 'balances' && <BalancesTab showMessage={showMessage} allUsers={allUsers} />}
        </div>
      </div>

      <Message message={message} type={messageType} onClose={closeMessage} />
    </div>
  );
}

export default App;
