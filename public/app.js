// API base URL
const API_BASE = '/api';

// Global state
let allUsers = [];
let allGroups = [];
let currentHub = null;
let currentHubMembers = [];

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadAllUsers();
});

// Tab switching
function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(`${tabName}-tab`).classList.add('active');
    event.target.classList.add('active');
    
    // Load data when switching tabs
    if (tabName === 'users') loadAllUsers();
    if (tabName === 'groups') loadGroupsData();
    if (tabName === 'expenses') loadExpensesData();
    if (tabName === 'balances') loadBalancesData();
}

// Show message
function showMessage(text, type = 'success') {
    const msgEl = document.getElementById('message');
    msgEl.textContent = text;
    msgEl.className = `message ${type} show`;
    setTimeout(() => msgEl.classList.remove('show'), 3000);
}

// ==================== USER OPERATIONS ====================
async function loadAllUsers() {
    try {
        const response = await fetch(`${API_BASE}/users`);
        const result = await response.json();
        
        if (result.success) {
            allUsers = result.data;
            displayUsers(result.data);
            populateUserDropdowns();
        }
    } catch (error) {
        showMessage('Failed to load users', 'error');
    }
}

function displayUsers(users) {
    const container = document.getElementById('usersList');
    container.innerHTML = users.map(user => `
        <div class="list-item">
            <h4>${user.displayName}</h4>
            <p>Contact: ${user.contactInfo}</p>
            <p>ID: ${user._id}</p>
        </div>
    `).join('');
}

function populateUserDropdowns() {
    const dropdowns = ['groupCreator', 'userForGroups', 'expenseUser', 'balanceUser', 'expensePayer', 'settlementPayer', 'settlementReceiver', 'userToAdd'];
    
    dropdowns.forEach(id => {
        const select = document.getElementById(id);
        if (select) {
            select.innerHTML = '<option value="">Select User</option>' +
                allUsers.map(u => `<option value="${u._id}">${u.displayName}</option>`).join('');
        }
    });
}

async function createUser() {
    const displayName = document.getElementById('userName').value;
    const contactInfo = document.getElementById('userContact').value;
    
    if (!displayName || !contactInfo) {
        showMessage('Please fill all fields', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/createUser`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ displayName, contactInfo })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage('User created successfully!');
            document.getElementById('userName').value = '';
            document.getElementById('userContact').value = '';
            loadAllUsers();
        } else {
            showMessage(result.message, 'error');
        }
    } catch (error) {
        showMessage('Failed to create user', 'error');
    }
}

// ==================== GROUP OPERATIONS ====================
async function loadGroupsData() {
    await loadAllUsers();
    await loadAllGroupsForAddMember();
    // Groups will be loaded when user selects from dropdown
}

async function loadAllGroupsForAddMember() {
    try {
        // Get all users and fetch all their groups
        const groupsSet = new Set();
        const groupsMap = new Map();
        
        for (const user of allUsers) {
            const response = await fetch(`${API_BASE}/users/${user._id}/groups`);
            const result = await response.json();
            
            if (result.success) {
                result.data.forEach(group => {
                    if (!groupsSet.has(group._id)) {
                        groupsSet.add(group._id);
                        groupsMap.set(group._id, group);
                    }
                });
            }
        }
        
        const allGroupsForAdding = Array.from(groupsMap.values());
        
        // Populate the groupToAddMember dropdown
        const select = document.getElementById('groupToAddMember');
        if (select && allGroupsForAdding.length > 0) {
            select.innerHTML = '<option value="">Select Group</option>' +
                allGroupsForAdding.map(g => `<option value="${g._id}">${g.hubName}</option>`).join('');
        }
    } catch (error) {
        console.error('Failed to load groups for add member', error);
    }
}

async function loadUserGroups() {
    const userId = document.getElementById('userForGroups').value;
    if (!userId) return;
    
    try {
        const response = await fetch(`${API_BASE}/users/${userId}/groups`);
        const result = await response.json();
        
        if (result.success) {
            allGroups = result.data;
            displayGroups(result.data);
            populateGroupDropdowns();
        }
    } catch (error) {
        showMessage('Failed to load groups', 'error');
    }
}

function displayGroups(groups) {
    const container = document.getElementById('groupsList');
    container.innerHTML = groups.length > 0 ? groups.map(group => `
        <div class="list-item">
            <h4>${group.hubName}</h4>
            <p>${group.hubDescription || 'No description'}</p>
            <p>Created: ${new Date(group.establishedAt).toLocaleDateString()}</p>
            <p>ID: ${group._id}</p>
        </div>
    `).join('') : '<p>No groups found</p>';
}

function populateGroupDropdowns() {
    const dropdowns = ['expenseHub', 'hubForExpenses', 'hubForBalances', 'settlementHub', 'groupToAddMember'];
    
    dropdowns.forEach(id => {
        const select = document.getElementById(id);
        if (select) {
            select.innerHTML = '<option value="">Select Group</option>' +
                allGroups.map(g => `<option value="${g._id}">${g.hubName}</option>`).join('');
        }
    });
}

async function createGroup() {
    const hubName = document.getElementById('groupName').value;
    const hubDescription = document.getElementById('groupDesc').value;
    const creatorId = document.getElementById('groupCreator').value;
    
    if (!hubName || !creatorId) {
        showMessage('Please fill required fields', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/createGroup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ hubName, hubDescription, creatorId })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage('Group created successfully!');
            document.getElementById('groupName').value = '';
            document.getElementById('groupDesc').value = '';
            // Reload groups if user is selected
            const userId = document.getElementById('userForGroups').value;
            if (userId) {
                loadUserGroups();
            }
        } else {
            showMessage(result.message, 'error');
        }
    } catch (error) {
        showMessage('Failed to create group', 'error');
    }
}

async function addMemberToGroup() {
    const hubId = document.getElementById('groupToAddMember').value;
    const participantId = document.getElementById('userToAdd').value;
    
    if (!hubId || !participantId) {
        showMessage('Please select both group and user', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/groups/${hubId}/members`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ participantId })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage('Member added successfully!');
            document.getElementById('userToAdd').value = '';
            // Reload groups display if user is selected
            const userId = document.getElementById('userForGroups').value;
            if (userId) {
                loadUserGroups();
            }
            // Refresh the add member dropdown
            await loadAllGroupsForAddMember();
        } else {
            showMessage(result.message, 'error');
        }
    } catch (error) {
        showMessage('Failed to add member', 'error');
    }
}

// ==================== EXPENSE OPERATIONS ====================
async function loadExpensesData() {
    await loadAllUsers();
    // Initialize split UI to show placeholder
    updateSplitUI();
}

async function loadUserGroupsForExpenses() {
    const userId = document.getElementById('expenseUser').value;
    if (!userId) return;
    
    try {
        const response = await fetch(`${API_BASE}/users/${userId}/groups`);
        const result = await response.json();
        
        if (result.success) {
            allGroups = result.data;
            // Populate expense-related dropdowns
            const dropdowns = ['expenseHub', 'hubForExpenses'];
            dropdowns.forEach(id => {
                const select = document.getElementById(id);
                if (select) {
                    select.innerHTML = '<option value="">Select Group</option>' +
                        allGroups.map(g => `<option value="${g._id}">${g.hubName}</option>`).join('');
                }
            });
        }
    } catch (error) {
        showMessage('Failed to load groups', 'error');
    }
}

async function updateSplitUI() {
    const method = document.getElementById('splitMethod').value;
    const container = document.getElementById('splitDetails');
    
    // Get hub members
    const hubId = document.getElementById('expenseHub').value;
    if (!hubId) {
        container.innerHTML = '<p style="color: #666;">Select a group first</p>';
        return;
    }
    
    // Fetch hub members
    try {
        const response = await fetch(`${API_BASE}/groups/${hubId}`);
        const result = await response.json();
        
        if (result.success && result.data.membersList) {
            currentHubMembers = result.data.membersList
                .filter(m => m.isActive)
                .map(m => ({
                    id: m.participantRef._id,
                    name: m.participantRef.displayName
                }));
            
            // Build checkboxes for participants
            const participantsHTML = currentHubMembers.map(member => `
                <label style="display: block; margin: 8px 0; cursor: pointer;">
                    <input type="checkbox" class="split-participant" value="${member.id}" 
                        style="margin-right: 8px;" />
                    ${member.name}
                </label>
            `).join('');
            
            container.innerHTML = `
                <div style="margin-top: 15px;">
                    <label style="font-weight: 600; margin-bottom: 8px; display: block;">
                        Select participants to split with:
                    </label>
                    <div style="border: 1px solid #ddd; padding: 12px; border-radius: 4px; max-height: 200px; overflow-y: auto;">
                        ${participantsHTML}
                    </div>
                    ${method === 'exact' ? `
                        <label style="font-weight: 600; margin: 12px 0 8px 0; display: block;">
                            Enter amount for each selected participant (in order):
                        </label>
                        <input type="text" id="splitAmounts" 
                            placeholder="50.00,30.00,20.00" 
                            style="width: 100%;" />
                        <small style="color: #666;">Enter amounts separated by commas, matching the order you selected participants</small>
                    ` : ''}
                    ${method === 'percentage' ? `
                        <label style="font-weight: 600; margin: 12px 0 8px 0; display: block;">
                            Enter percentage for each selected participant (in order):
                        </label>
                        <input type="text" id="splitPercentages" 
                            placeholder="50,30,20" 
                            style="width: 100%;" />
                        <small style="color: #666;">Enter percentages separated by commas (must total 100%)</small>
                    ` : ''}
                </div>
            `;
        }
    } catch (error) {
        container.innerHTML = '<p style="color: #e74c3c;">Error loading group members</p>';
    }
}

async function addExpense() {
    const hubId = document.getElementById('expenseHub').value;
    const transactionTitle = document.getElementById('expenseTitle').value;
    const totalAmount = parseFloat(document.getElementById('expenseAmount').value);
    const payerId = document.getElementById('expensePayer').value;
    const divisionMethod = document.getElementById('splitMethod').value;
    
    // Get selected participants from checkboxes
    const selectedCheckboxes = document.querySelectorAll('.split-participant:checked');
    if (selectedCheckboxes.length === 0) {
        showMessage('Please select at least one participant to split with', 'error');
        return;
    }
    
    const participantIds = Array.from(selectedCheckboxes).map(cb => cb.value);
    
    if (!hubId || !transactionTitle || !totalAmount || !payerId) {
        showMessage('Please fill all required fields', 'error');
        return;
    }
    
    let splitDetails;
    
    if (divisionMethod === 'equal') {
        splitDetails = participantIds;
    } else if (divisionMethod === 'exact') {
        const amountsInput = document.getElementById('splitAmounts');
        if (!amountsInput || !amountsInput.value) {
            showMessage('Please enter amounts for each participant', 'error');
            return;
        }
        const amounts = amountsInput.value.split(',').map(s => parseFloat(s.trim()));
        if (amounts.length !== participantIds.length) {
            showMessage(`Please enter ${participantIds.length} amounts (one for each selected participant)`, 'error');
            return;
        }
        splitDetails = participantIds.map((id, idx) => ({
            participantId: id,
            amount: amounts[idx]
        }));
    } else if (divisionMethod === 'percentage') {
        const percentagesInput = document.getElementById('splitPercentages');
        if (!percentagesInput || !percentagesInput.value) {
            showMessage('Please enter percentages for each participant', 'error');
            return;
        }
        const percentages = percentagesInput.value.split(',').map(s => parseFloat(s.trim()));
        if (percentages.length !== participantIds.length) {
            showMessage(`Please enter ${participantIds.length} percentages (one for each selected participant)`, 'error');
            return;
        }
        const total = percentages.reduce((sum, p) => sum + p, 0);
        if (Math.abs(total - 100) > 0.01) {
            showMessage(`Percentages must total 100% (currently ${total}%)`, 'error');
            return;
        }
        splitDetails = participantIds.map((id, idx) => ({
            participantId: id,
            percentage: percentages[idx]
        }));
    }
    
    try {
        const response = await fetch(`${API_BASE}/addExpense`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                hubId,
                transactionTitle,
                totalAmount,
                payerId,
                divisionMethod,
                splitDetails
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage('Expense added successfully!');
            document.getElementById('expenseTitle').value = '';
            document.getElementById('expenseAmount').value = '';
            // Reset checkboxes
            document.querySelectorAll('.split-participant').forEach(cb => cb.checked = false);
            if (document.getElementById('splitAmounts')) {
                document.getElementById('splitAmounts').value = '';
            }
            if (document.getElementById('splitPercentages')) {
                document.getElementById('splitPercentages').value = '';
            }
        } else {
            showMessage(result.message, 'error');
        }
    } catch (error) {
        showMessage('Failed to add expense', 'error');
    }
}

async function loadHubExpenses() {
    const hubId = document.getElementById('hubForExpenses').value;
    if (!hubId) return;
    
    try {
        const response = await fetch(`${API_BASE}/groups/${hubId}/expenses`);
        const result = await response.json();
        
        if (result.success) {
            displayExpenses(result.data);
        }
    } catch (error) {
        showMessage('Failed to load expenses', 'error');
    }
}

function displayExpenses(expenses) {
    const container = document.getElementById('expensesList');
    container.innerHTML = expenses.length > 0 ? expenses.map(exp => `
        <div class="list-item">
            <h4>${exp.transactionTitle} <span class="amount-badge">$${exp.totalAmount.toFixed(2)}</span></h4>
            <p>Paid by: ${exp.paidBy.displayName}</p>
            <p>Split: ${exp.divisionMethod}</p>
            <p>Date: ${new Date(exp.transactionDate).toLocaleString()}</p>
        </div>
    `).join('') : '<p>No expenses found</p>';
}

// ==================== BALANCE OPERATIONS ====================
async function loadBalancesData() {
    await loadAllUsers();
}

async function loadUserGroupsForBalances() {
    const userId = document.getElementById('balanceUser').value;
    if (!userId) return;
    
    try {
        const response = await fetch(`${API_BASE}/users/${userId}/groups`);
        const result = await response.json();
        
        if (result.success) {
            allGroups = result.data;
            // Populate balance-related dropdowns
            const dropdowns = ['hubForBalances', 'settlementHub'];
            dropdowns.forEach(id => {
                const select = document.getElementById(id);
                if (select) {
                    select.innerHTML = '<option value="">Select Group</option>' +
                        allGroups.map(g => `<option value="${g._id}">${g.hubName}</option>`).join('');
                }
            });
        }
    } catch (error) {
        showMessage('Failed to load groups', 'error');
    }
}

async function loadBalances() {
    const hubId = document.getElementById('hubForBalances').value;
    if (!hubId) return;
    
    const simplified = document.getElementById('simplifyBalances').checked;
    
    try {
        const url = `${API_BASE}/getBalances/${hubId}${simplified ? '?simplified=true' : ''}`;
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.success) {
            displayBalances(result.data, simplified);
        }
    } catch (error) {
        showMessage('Failed to load balances', 'error');
    }
}

function displayBalances(balances, simplified) {
    const container = document.getElementById('balancesList');
    
    if (balances.length === 0) {
        container.innerHTML = '<p style="color: #4caf50; font-weight: 600;">✓ All settled up!</p>';
        return;
    }
    
    if (simplified) {
        container.innerHTML = balances.map(b => `
            <div class="debt-item">
                <strong>${b.from.name}</strong> owes <strong>${b.to.name}</strong>
                <span class="amount-badge">$${b.amount.toFixed(2)}</span>
            </div>
        `).join('');
    } else {
        container.innerHTML = balances.map(b => `
            <div class="debt-item">
                <strong>${b.debtor.name}</strong> owes <strong>${b.creditor.name}</strong>
                <span class="amount-badge">$${b.amount.toFixed(2)}</span>
            </div>
        `).join('');
    }
}

async function settleBalance() {
    const hubId = document.getElementById('settlementHub').value;
    const payerId = document.getElementById('settlementPayer').value;
    const receiverId = document.getElementById('settlementReceiver').value;
    const amount = parseFloat(document.getElementById('settlementAmount').value);
    
    if (!hubId || !payerId || !receiverId || !amount) {
        showMessage('Please fill all fields', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/settleBalance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ hubId, payerId, receiverId, amount })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage('Settlement recorded successfully!');
            document.getElementById('settlementAmount').value = '';
            loadBalances();
        } else {
            showMessage(result.message, 'error');
        }
    } catch (error) {
        showMessage('Failed to record settlement', 'error');
    }
}
