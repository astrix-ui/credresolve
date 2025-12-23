import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

const UsersTab = ({ showMessage }) => {
  const [userName, setUserName] = useState('');
  const [userContact, setUserContact] = useState('');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE}/users`);
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      // Silent fail - non-critical
    }
  };

  const createUser = async () => {
    if (!userName || !userContact) {
      showMessage('Please fill all fields', 'error');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE}/createUser`, {
        displayName: userName,
        contactInfo: userContact
      });

      if (response.data.success) {
        showMessage('User created successfully!');
        setUserName('');
        setUserContact('');
        loadUsers();
      } else {
        showMessage(response.data.message, 'error');
      }
    } catch (error) {
      showMessage(error.response?.data?.message || 'Failed to create user', 'error');
    }
  };

  return (
    <div className="tab-content active">
      <h2>Create New User</h2>
      <p className="helper-text">Add users who will share expenses.</p>
      <div className="form-group">
        <label>Display Name</label>
        <input
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="e.g., John Doe"
        />
        
        <label>Contact Information</label>
        <input
          type="text"
          value={userContact}
          onChange={(e) => setUserContact(e.target.value)}
          placeholder="Email or phone number"
        />
        
        <button onClick={createUser}>Create User</button>
      </div>
      
      <h3>All Users</h3>
      <div className="list-container">
        {users.map(user => (
          <div key={user._id} className="list-item">
            <h4>{user.displayName}</h4>
            <p>{user.contactInfo}</p>
            <p><small>Created: {new Date(user.recordCreatedAt).toLocaleDateString()}</small></p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsersTab;
