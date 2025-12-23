# Shared Ledger Hub

A lightweight expense tracking application for managing shared costs within groups.

## Features

- User and group management
- Flexible expense splitting (equal, exact amounts, percentages)
- Balance calculation and settlement tracking
- Clean, minimal interface

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your MongoDB connection string
```

3. Start the server:
```bash
npm start
```

4. Access the application at `http://localhost:3000`

## Tech Stack

- Backend: Node.js, Express
- Database: MongoDB with Mongoose
- Frontend: Vanilla JavaScript

## Usage

1. **Create Users** - Add all participants
2. **Create Groups** - Organize users into groups (e.g., roommates, trips)
3. **Add Members** - Assign users to groups
4. **Record Expenses** - Track shared costs with flexible splitting
5. **View Balances** - See who owes whom
6. **Settle Up** - Record payments to clear balances

## API Endpoints

### Users
- `POST /api/createUser` - Create new user
- `GET /api/users` - List all users
- `GET /api/users/:userId` - Get user details
- `PUT /api/users/:userId` - Update user

### Groups
- `POST /api/createGroup` - Create new group
- `GET /api/users/:userId/groups` - Get user's groups
- `GET /api/groups/:hubId` - Get group details
- `POST /api/groups/:hubId/members` - Add member to group

### Expenses
- `POST /api/addExpense` - Record new expense
- `GET /api/groups/:hubId/expenses` - Get group expenses

### Balances
- `GET /api/groups/:hubId/balances` - Get group balances
- `GET /api/groups/:hubId/balances?simplified=true` - Get simplified balances

### Settlements
- `POST /api/recordSettlement` - Record payment

### Created By
- Ayush Sharma - SRM University of Science and Technology
