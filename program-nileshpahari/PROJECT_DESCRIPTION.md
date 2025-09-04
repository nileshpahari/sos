# Project Description

**Deployed Frontend URL:** <https://votana.vercel.app>

**Solana Program ID:** 7Ws2uU8bAPmTcj3NgbauBpup5go1tyZtdEVVdDDQF4Wk

## Project Overview

### Description

Votana is a decentralized voting application built on Solana that enables users to create polls, register candidates, and cast votes in a transparent and secure manner. The dApp leverages Solana's program architecture to ensure vote integrity, prevent double voting, and maintain immutable voting records. Users can create time-bound polls, register multiple candidates, and vote once per poll, with real-time vote counting and transparency.

### Key Features

- **Create Polls**: Initialize new voting polls with custom descriptions and time windows
- **Register Candidates**: Add multiple candidates to polls with unique names
- **Vote Once**: Cast a single vote per poll with automatic duplicate prevention

### How to Use the dApp

1. **Connect Wallet** - Connect your Solana wallet (Phantom recommended)
2. **Initialize System** - Click "Initialize" to set up the voting system
3. **Create Poll** - Navigate to "Create Poll" to start a new voting session
4. **Register Candidates** - Add candidates to your poll with their names
5. **Vote** - Visit poll details to cast your vote for preferred candidates
6. **View Results** - Monitor real-time vote counts and poll statistics

## Program Architecture

The votana dApp uses a sophisticated architecture with multiple account types and four core instructions. The program leverages PDAs extensively to create unique accounts for polls, candidates, and voters, ensuring data integrity and preventing unauthorized access.

### PDA Usage

The program uses Program Derived Addresses to create deterministic accounts for polls, candidates, and voters.

**PDAs Used:**

- **Counter PDA**: Derived from seed `["counter"]` - tracks total polls created
- **Registrations PDA**: Derived from seed `["registerations"]` - tracks total candidates registered
- **Poll PDA**: Derived from seed `[poll_id.to_le_bytes()]` - unique poll account
- **Candidate PDA**: Derived from seeds `[poll_id.to_le_bytes(), candidate_id.to_le_bytes()]` - unique candidate per poll
- **Voter PDA**: Derived from seeds `["voter", poll_id.to_le_bytes(), user_pubkey]` - ensures one vote per user per poll

### Program Instructions

**Instructions Implemented:**

- **Initialize**: Sets up the counter and registrations accounts with initial values of 0
- **Create Poll**: Creates a new poll with description, start time, and end time
- **Register Candidate**: Adds a candidate to a specific poll with a unique name
- **Vote**: Casts a vote for a candidate in an active poll (one vote per user per poll)

### Account Structure

**Counter Account:**

```rust
#[account]
pub struct Counter {
    pub count: u64,           // Total number of polls created
}
```

# Project Description

**Deployed Frontend URL:** LINK

**Solana Program ID:** ID

## Project Overview

### Description

A simple decentralized counter application built on Solana. Users can create personal counters, increment them, and reset them to zero. Each user has their own counter account derived from their wallet address, ensuring data isolation and ownership. This dApp demonstrates basic Solana program development concepts including PDAs, account creation, and state management.

### Key Features

- **Create Counter**: Initialize a new counter account for your wallet
- **Increment Counter**: Add 1 to your personal counter value
- **Reset Counter**: Set your counter back to 0
- **View Counter**: Display current counter value and owner information

### How to Use the dApp

1. **Connect Wallet** - Connect your Solana wallet
2. **Initialize Counter** - Click "Create Counter" to set up your personal counter account
3. **Increment** - Use the "+" button to increase your counter value
4. **Reset** - Click "Reset" to set your counter back to 0
5. **View Stats** - See your current count and total increments made

## Program Architecture

The Counter dApp uses a simple architecture with one main account type and three core instructions. The program leverages PDAs to create unique counter accounts for each user, ensuring data isolation and preventing conflicts between different users' counters.

### PDA Usage

The program uses Program Derived Addresses to create deterministic counter accounts for each user.

**PDAs Used:**

- **Counter PDA**: Derived from seeds `["counter", user_wallet_pubkey]` - ensures each user has a unique counter account that only they can modify

### Program Instructions

**Instructions Implemented:**

- **Initialize**: Creates a new counter account for the user with initial value of 0
- **Increment**: Increases the counter value by 1 and tracks total increments
- **Reset**: Sets the counter value back to 0 while preserving the owner information

### Account Structure

```rust
#[account]
pub struct Counter {
    pub owner: Pubkey,        // The wallet that owns this counter
    pub count: u64,           // Current counter value
    pub total_increments: u64, // Total number of times incremented (persists through resets)
    pub created_at: i64,      // Unix timestamp when counter was created
}
```

## Testing

### Test Coverage

Comprehensive test suite covering all instructions with both successful operations and error conditions to ensure program security and reliability.

**Happy Path Tests:**

- **Initialize Counter**: Successfully creates a new counter account with correct initial values
- **Increment Counter**: Properly increases count and total_increments by 1
- **Reset Counter**: Sets count to 0 while preserving owner and total_increments

**Unhappy Path Tests:**

- **Initialize Duplicate**: Fails when trying to initialize a counter that already exists
- **Increment Unauthorized**: Fails when non-owner tries to increment someone else's counter
- **Reset Unauthorized**: Fails when non-owner tries to reset someone else's counter
- **Account Not Found**: Fails when trying to operate on non-existent counter

### Running Tests

```bash
yarn install    # install dependencies
anchor test     # run tests
```

### Additional Notes for Evaluators

This was my first Solana dApp and the learning curve was steep! The biggest challenges were figuring out account ownership validation (kept getting unauthorized errors) and dealing with async transaction confirmations. PDAs were confusing at first but once they clicked, the deterministic addressing made everything much cleaner.
**Registrations Account:**

```rust
#[account]
pub struct Registerations {
    pub count: u64,           // Total number of candidates registered
}
```

**Poll Account:**

```rust
#[account]
#[derive(InitSpace)]
pub struct Poll {
    pub id: u64,              // Unique poll identifier
    #[max_len(280)]
    pub description: String,   // Poll description (max 280 chars)
    pub start: u64,           // Poll start timestamp
    pub end: u64,             // Poll end timestamp
    pub candidates: u64,      // Number of candidates in this poll
}
```

**Candidate Account:**

```rust
#[account]
#[derive(InitSpace)]
pub struct Candidate {
    pub cid: u64,             // Candidate ID within the poll
    pub poll_id: u64,         // Associated poll ID
    #[max_len(32)]
    pub name: String,         // Candidate name (max 32 chars)
    pub votes: u64,           // Total votes received
    pub has_registered: bool, // Registration status
}
```

**Voter Account:**

```rust
#[account]
pub struct Voter {
    pub cid: u64,             // Candidate ID voted for
    pub poll_id: u64,         // Poll ID where vote was cast
    pub has_voted: bool,      // Voting status
}
```

## Frontend Architecture

### Technology Stack

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **Blockchain Integration**: @coral-xyz/anchor, @solana/web3.js
- **Wallet Integration**: @solana/wallet-adapter-react
- **UI Components**: React with modern design patterns

### Key Components

- **AppWalletProvider**: Manages Solana wallet connections
- **Header**: Navigation and wallet connection interface
- **CandidateList**: Displays poll candidates with vote counts
- **RegCandidate**: Candidate registration form
- **ConnectionStatus**: Real-time blockchain connection monitoring

### Services

- **blockchain.service.tsx**: Core blockchain interaction functions
  - `getProvider()`: Creates program instance with wallet
  - `getReadonlyProvider()`: Read-only program access
  - `createPoll()`: Creates new voting polls
  - `registerCandidate()`: Registers candidates to polls
  - `vote()`: Casts votes with duplicate prevention
  - `fetchAllPolls()`: Retrieves all active polls
  - `fetchAllCandidates()`: Gets candidates for specific polls

## Testing

### Test Coverage

Comprehensive test suite covering all instructions with both successful operations and error conditions to ensure program security and reliability.

**Happy Path Tests:**

- **Initialize System**: Successfully creates counter and registrations accounts
- **Create Poll**: Properly creates poll with correct metadata and increments counter
- **Register Candidate**: Successfully adds candidates to polls with unique IDs
- **Vote**: Correctly casts votes and prevents duplicate voting

**Unhappy Path Tests:**

- **Invalid Dates**: Fails when poll start time is after end time
- **Poll Not Active**: Fails when voting outside poll time window
- **Candidate Not Registered**: Fails when voting for unregistered candidates
- **Poll Does Not Exist**: Fails when operating on non-existent polls

### Running Tests

```bash
cd anchor
anchor test     # run tests
```

### Test Scenarios Covered

1. **System Initialization**: Verifies counter and registrations setup
2. **Poll Creation**: Tests poll creation with proper ID assignment
3. **Candidate Registration**: Validates candidate addition and ID tracking
4. **Voting Process**: Ensures proper vote casting and duplicate prevention
5. **Time Validation**: Confirms poll time window enforcement
6. **Data Integrity**: Verifies vote counting and account state consistency

## Deployment

### Local Development

```bash
# Start local Solana validator
solana-test-validator

# Deploy program locally
cd anchor
anchor deploy

# Start frontend
npm run dev
```

### Devnet Deployment

```bash
# Set Solana CLI to devnet
solana config set --url https://api.devnet.solana.com

# Deploy to devnet
cd anchor
anchor deploy --provider.cluster devnet

# Get devnet SOL
solana airdrop 2
```

### Environment Configuration

Create `.env` file in project root:

```bash
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com  # For devnet
# or
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8899         # For localnet
```

## Security Features

### Vote Integrity

- **One Vote Per User**: PDA-based voter accounts prevent duplicate voting
- **Time-bound Polls**: Automatic enforcement of poll start/end times
- **Immutable Records**: All votes stored on-chain with cryptographic verification
- **Owner Validation**: Only poll creators can register candidates

### Data Validation

- **Input Validation**: String length limits and data type checking
- **State Consistency**: Account state validation across all operations
- **Error Handling**: Comprehensive error codes and user feedback
- **Transaction Atomicity**: All operations succeed or fail completely

## Additional Notes for Evaluators

This voting dApp demonstrates advanced Solana development concepts including complex PDA usage, time-based validation, and multi-account state management. The biggest challenges were implementing proper vote deduplication using PDAs and managing the relationship between polls, candidates, and voters. The frontend integration with Anchor was straightforward once the program architecture was solid, but handling async transaction confirmations and real-time state updates required careful attention to user experience.

The project showcases a complete dApp lifecycle from smart contract development to frontend integration, with comprehensive testing and proper error handling throughout. The use of PDAs for deterministic addressing and the implementation of time-bound voting mechanisms demonstrate understanding of Solana's unique capabilities for building decentralized applications.

