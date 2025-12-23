import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

const GroupsTab = ({ showMessage, allUsers }) => {
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [groupCreator, setGroupCreator] = useState('');
  const [userForGroups, setUserForGroups] = useState('');
  const [groups, setGroups] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [groupToAddMember, setGroupToAddMember] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);

  useEffect(() => {
    if (allUsers.length > 0) {
      loadAllGroupsForAddMember();
    }
  }, [allUsers]);

  useEffect(() => {
    if (groupToAddMember) {
      loadGroupMembers();
    }
  }, [groupToAddMember]);

  const loadAllGroupsForAddMember = async () => {
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
      // Silent fail - non-critical
    }
  };

  const loadUserGroups = async () => {
    if (!userForGroups) return;
    
    try {
      const response = await axios.get(`${API_BASE}/users/${userForGroups}/groups`);
      if (response.data.success) {
        setGroups(response.data.data);
      }
    } catch (error) {
      showMessage('Failed to load groups', 'error');
    }
  };

  const createGroup = async () => {
    if (!groupName || !groupCreator) {
      showMessage('Please fill required fields', 'error');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE}/createGroup`, {
        hubName: groupName,
        hubDescription: groupDesc,
        creatorId: groupCreator
      });

      if (response.data.success) {
        showMessage('Group created successfully!');
        setGroupName('');
        setGroupDesc('');
        if (userForGroups) {
          loadUserGroups();
        }
        loadAllGroupsForAddMember();
      } else {
        showMessage(response.data.message, 'error');
      }
    } catch (error) {
      showMessage('Failed to create group', 'error');
    }
  };

  const loadGroupMembers = async () => {
    if (!groupToAddMember) {
      setGroupMembers([]);
      return;
    }

    try {
      const response = await axios.get(`${API_BASE}/groups/${groupToAddMember}`);
      if (response.data.success) {
        setSelectedGroup(response.data.data);
        const activeMembers = response.data.data.membersList
          ?.filter(m => m.isActive)
          .map(m => m.participantRef._id) || [];
        setGroupMembers(activeMembers);
      }
    } catch (error) {
      showMessage('Failed to load group members', 'error');
    }
  };

  const toggleMember = async (userId) => {
    const isMember = groupMembers.includes(userId);
    
    if (isMember) {
      // Remove member (we'll need to implement a remove endpoint or mark as inactive)
      showMessage('Remove member functionality needs backend endpoint', 'error');
      // For now, just update UI
      setGroupMembers(prev => prev.filter(id => id !== userId));
    } else {
      // Add member
      try {
        const response = await axios.post(`${API_BASE}/groups/${groupToAddMember}/members`, {
          participantId: userId
        });

        if (response.data.success) {
          showMessage('Member added successfully!');
          setGroupMembers(prev => [...prev, userId]);
          if (userForGroups) {
            loadUserGroups();
          }
          await loadAllGroupsForAddMember();
        } else {
          showMessage(response.data.message, 'error');
        }
      } catch (error) {
        showMessage('Failed to add member', 'error');
      }
    }
  };

  useEffect(() => {
    loadUserGroups();
  }, [userForGroups]);

  return (
    <div className="tab-content active">
      <h2>Create New Group</h2>
      <p className="helper-text">Create groups to track shared expenses.</p>
      <div className="form-group">
        <label>Group Name</label>
        <input
          type="text"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="e.g., Weekend Trip, Apartment 4B"
        />
        
        <label>Description (Optional)</label>
        <input
          type="text"
          value={groupDesc}
          onChange={(e) => setGroupDesc(e.target.value)}
          placeholder="Brief description of the group"
        />
        
        <label>Group Creator</label>
        <select value={groupCreator} onChange={(e) => setGroupCreator(e.target.value)}>
          <option value="">Select who is creating this group</option>
          {allUsers.map(user => (
            <option key={user._id} value={user._id}>{user.displayName}</option>
          ))}
        </select>
        
        <button onClick={createGroup}>Create Group</button>
      </div>
      
      <h3>View Your Groups</h3>
      <div className="form-group">
        <label>Select User</label>
        <select value={userForGroups} onChange={(e) => setUserForGroups(e.target.value)}>
          <option value="">Choose a user</option>
          {allUsers.map(user => (
            <option key={user._id} value={user._id}>{user.displayName}</option>
          ))}
        </select>
      </div>
      <div className="list-container">
        {groups.map(group => (
          <div key={group._id} className="list-item">
            <h4>{group.hubName}</h4>
            <p>{group.hubDescription}</p>
            <p><small>{group.membersList?.length || 0} members</small></p>
          </div>
        ))}
      </div>
      
      <h3>Manage Group Members</h3>
      <p className="helper-text">Add or remove members from groups.</p>
      <div className="form-group">
        <label>Select Group</label>
        <select value={groupToAddMember} onChange={(e) => setGroupToAddMember(e.target.value)}>
          <option value="">Choose a group</option>
          {allGroups.map(group => (
            <option key={group._id} value={group._id}>{group.hubName}</option>
          ))}
        </select>
        
        {groupToAddMember && (
          <>
            <label style={{ marginTop: '16px' }}>Select Members</label>
            <div style={{ border: '1px solid var(--color-border)', padding: '16px', borderRadius: '6px', maxHeight: '300px', overflowY: 'auto' }}>
              {allUsers.map(user => (
                <label key={user._id} style={{ display: 'block', margin: '8px 0', cursor: 'pointer', fontSize: '13px', fontWeight: '400', letterSpacing: '0' }}>
                  <input
                    type="checkbox"
                    checked={groupMembers.includes(user._id)}
                    onChange={() => toggleMember(user._id)}
                    style={{ marginRight: '8px' }}
                  />
                  {user.displayName}
                </label>
              ))}
            </div>
            {selectedGroup && (
              <p style={{ marginTop: '12px', fontSize: '13px', color: 'var(--color-secondary)' }}>
                {groupMembers.length} member(s) in this group
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GroupsTab;
