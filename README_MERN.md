# Running the MERN Application

## Setup

1. Install all dependencies:
```bash
npm run install-all
```

Or install manually:
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..

# Install client dependencies
cd client
npm install
cd ..
```

## Running the Application

### Option 1: Run both together (Recommended)
```bash
npm run dev
```

### Option 2: Run separately
Open two terminal windows:

**Terminal 1 - Start Backend:**
```bash
npm run server
```

**Terminal 2 - Start Frontend:**
```bash
npm run client
```

## URLs
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## Troubleshooting

If you get "Failed to create user":
1. Make sure the server is running (check Terminal 1)
2. Check the browser console (F12) for detailed error messages
3. Verify MongoDB is running and `.env` file is configured in the `server/` folder
