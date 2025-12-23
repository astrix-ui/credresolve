# Expense Tracker

A full-stack MERN (MongoDB, Express, React, Node.js) expense tracking application for managing shared costs within groups. Features intelligent debt simplification algorithms and real-time balance calculations.

## Features

- **User Management** - Create and manage participant profiles with contact information
- **Group Management** - Organize users into collective hubs (groups) for shared expenses
- **Flexible Expense Splitting** - Support for three split methods:
  - Equal split across all participants
  - Exact amounts per participant
  - Percentage-based distribution
- **Smart Balance Calculations** - Real-time balance computation from transaction history
- **Debt Simplification** - Graph-based algorithm to minimize settlement transactions
- **Settlement Tracking** - Record and track payments with full audit trail
- **Modern React UI** - Clean, responsive interface with tabbed navigation
- **RESTful API** - Well-structured backend with comprehensive error handling

## Tech Stack

### Backend
- **Node.js** with **Express.js** - Server framework
- **MongoDB** with **Mongoose** - Database and ODM
- **dotenv** - Environment configuration
- **cors** - Cross-origin resource sharing
- **body-parser** - Request parsing

### Frontend
- **React 19** - UI library with hooks
- **Vite** - Fast build tool and dev server
- **Axios** - HTTP client for API calls
- **ESLint** - Code quality and linting

### Architecture
- Service-oriented backend with separated concerns:
  - Controllers for request handling
  - Services for business logic
  - Models for data schemas
  - Middleware for logging and error handling
- Component-based React frontend with tabbed interface

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Setup Instructions

1. **Clone the repository**
```bash
git clone <repository-url>
cd expense-tracker-mern
```

2. **Install all dependencies**
```bash
npm run install-all
```

Or install manually:
```bash
npm install
cd server && npm install
cd ../client && npm install
```

3. **Configure environment variables**
```bash
cd server
cp .env.example .env
```

Edit `server/.env` with your configuration:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/ledger_hub_db
NODE_ENV=development
```

4. **Start the application**

Development mode (runs both server and client concurrently):
```bash
npm run dev
```

Or start separately:
```bash
# Terminal 1 - Start backend server
npm run server

# Terminal 2 - Start frontend dev server
npm run client
```

5. **Access the application**
- Frontend: `http://localhost:5173` (Vite dev server)
- Backend API: `http://localhost:3000/api`
- Health check: `http://localhost:3000/health`

## Usage

### Workflow

1. **Create Users** 
   - Navigate to Users tab
   - Add participants with display name and contact information
   - Users can be reused across multiple groups

2. **Create Groups (Hubs)**
   - Navigate to Groups tab
   - Create a new collective hub (e.g., "Roommates", "Trip to Paris")
   - Add members from existing users
   - Groups track all expenses and balances for their members

3. **Record Expenses**
   - Navigate to Expenses tab
   - Select a group and the person who paid
   - Enter expense details (title, amount, notes)
   - Choose split method:
     - **Equal**: Amount divided evenly among participants
     - **Exact**: Specify exact amount for each person
     - **Percentage**: Assign percentage shares (must total 100%)
   - Transaction is recorded and balances update automatically

4. **View Balances**
   - Navigate to Balances tab
   - Select a group to view all outstanding balances
   - Choose between:
     - **Raw balances**: Direct debts between all pairs
     - **Simplified balances**: Optimized settlement paths (fewer transactions)

5. **Settle Debts**
   - From the Balances tab, record payments between users
   - Settlements reduce outstanding balances
   - Full audit trail maintained for all payments

## API Documentation

### Base URL
`http://localhost:3000/api`

### User Endpoints

#### Create User
```http
POST /api/createUser
Content-Type: application/json

{
  "displayName": "John Doe",
  "contactInfo": "john@example.com"
}
```

#### Get All Users
```http
GET /api/users
```

#### Get User Details
```http
GET /api/users/:userId
```

#### Update User
```http
PUT /api/users/:userId
Content-Type: application/json

{
  "displayName": "John Smith",
  "contactInfo": "john.smith@example.com"
}
```

### Group Endpoints

#### Create Group
```http
POST /api/createGroup
Content-Type: application/json

{
  "hubName": "Roommates 2024",
  "hubDescription": "Shared apartment expenses",
  "createdBy": "userId",
  "membersList": ["userId1", "userId2"]
}
```

#### Get Group Details
```http
GET /api/groups/:hubId
```

#### Get User's Groups
```http
GET /api/users/:userId/groups
```

#### Add Member to Group
```http
POST /api/groups/:hubId/members
Content-Type: application/json

{
  "participantRef": "userId"
}
```

#### Remove Member from Group
```http
DELETE /api/groups/:hubId/members
Content-Type: application/json

{
  "participantRef": "userId"
}
```

### Expense Endpoints

#### Add Expense
```http
POST /api/addExpense
Content-Type: application/json

{
  "associatedHub": "hubId",
  "transactionTitle": "Grocery Shopping",
  "totalAmount": 150.00,
  "paidBy": "userId",
  "divisionMethod": "equal",
  "breakdownDetails": [
    {
      "participant": "userId1",
      "owedAmount": 50.00
    },
    {
      "participant": "userId2",
      "owedAmount": 50.00
    },
    {
      "participant": "userId3",
      "owedAmount": 50.00
    }
  ],
  "notesOrContext": "Weekly groceries"
}
```

#### Get Hub Expenses
```http
GET /api/groups/:hubId/expenses
```

#### Get Expense Details
```http
GET /api/expenses/:transactionId
```

### Balance & Settlement Endpoints

#### Get Balances
```http
GET /api/getBalances/:hubId
```

#### Get User Balances in Hub
```http
GET /api/users/:userId/balances/:hubId
```

#### Settle Balance
```http
POST /api/settleBalance
Content-Type: application/json

{
  "associatedHub": "hubId",
  "payer": "userId1",
  "receiver": "userId2",
  "settledAmount": 50.00,
  "settlementNotes": "Cash payment"
}
```


## Project Structure

```
expense-tracker-mern/
├── client/                      # React frontend
│   ├── public/                  # Static assets
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── BalancesTab.jsx  # Balance viewing & settlements
│   │   │   ├── ExpensesTab.jsx  # Expense creation & listing
│   │   │   ├── GroupsTab.jsx    # Group management
│   │   │   ├── UsersTab.jsx     # User management
│   │   │   ├── Header.jsx       # App header
│   │   │   ├── Message.jsx      # Toast notifications
│   │   │   └── Tabs.jsx         # Tab navigation
│   │   ├── App.jsx              # Main app component
│   │   ├── main.jsx             # React entry point
│   │   └── *.css                # Styles
│   ├── index.html
│   ├── vite.config.js           # Vite configuration
│   └── package.json
│
├── server/                      # Node.js backend
│   ├── config/
│   │   └── dbConnector.js       # MongoDB connection
│   ├── controllers/             # Request handlers
│   │   ├── balanceController.js
│   │   ├── hubController.js
│   │   ├── participantController.js
│   │   └── transactionController.js
│   ├── middleware/
│   │   ├── errorHandler.js      # Global error handling
│   │   └── requestLogger.js     # Request logging
│   ├── models/                  # Mongoose schemas
│   │   ├── CollectiveHub.js     # Group model
│   │   ├── Participant.js       # User model
│   │   ├── Transaction.js       # Expense model
│   │   └── SettlementRecord.js  # Payment model
│   ├── routes/
│   │   └── apiRoutes.js         # API route definitions
│   ├── services/                # Business logic
│   │   ├── hubService.js
│   │   ├── participantService.js
│   │   ├── transactionService.js
│   │   ├── settlementService.js
│   │   └── ledgerCalculator.js  # Balance calculation algorithms
│   ├── utils/
│   │   ├── responseFormatter.js # Standard API responses
│   │   └── validators.js        # Input validation
│   ├── .env.example             # Environment template
│   ├── server.js                # Express app entry point
│   └── package.json
│
├── package.json                 # Root package scripts
└── README.md
```

## Key Algorithms

### Balance Calculation
The system computes balances on-demand rather than storing running totals:
1. Process all transactions to determine who paid vs who owes
2. Subtract all recorded settlements
3. Return net amounts owed between participant pairs
4. This ensures data consistency and provides an accurate audit trail

### Debt Simplification
Uses a graph-based algorithm to minimize settlement transactions:
1. Calculate net balance for each participant (total owed - total owing)
2. Separate participants into debtors and creditors
3. Match debtors with creditors using a greedy algorithm
4. Result: Minimum number of transactions to settle all debts


## Development

### Available Scripts

**Root level:**
- `npm run dev` - Start both server and client in development mode
- `npm run server` - Start backend server only
- `npm run client` - Start frontend dev server only
- `npm run install-all` - Install dependencies for all packages

**Server (`/server`):**
- `npm start` - Start production server
- `npm run dev` - Start with nodemon (auto-reload)

**Client (`/client`):**
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Database Schema

**Participant** (Users)
- `displayName`: String (required)
- `contactInfo`: String (unique, required)
- `associatedGroups`: Array of CollectiveHub IDs
- `recordCreatedAt`: Date

**CollectiveHub** (Groups)
- `hubName`: String (required)
- `hubDescription`: String
- `membersList`: Array of member objects with participant reference
- `createdBy`: Participant ID
- `establishedAt`: Date

**Transaction** (Expenses)
- `associatedHub`: CollectiveHub ID
- `transactionTitle`: String
- `totalAmount`: Number
- `paidBy`: Participant ID
- `divisionMethod`: enum ['equal', 'exact', 'percentage']
- `breakdownDetails`: Array of {participant, owedAmount, assignedPercentage}
- `transactionDate`: Date
- `notesOrContext`: String

**SettlementRecord** (Payments)
- `associatedHub`: CollectiveHub ID
- `payer`: Participant ID
- `receiver`: Participant ID
- `settledAmount`: Number
- `settlementDate`: Date
- `settlementNotes`: String

## Contributing

Contributions are welcome! Please follow these guidelines:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


## Author

**Ayush Sharma**  
SRM University of Science and Technology

