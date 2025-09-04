# Project Description

**Deployed Frontend URL:** <https://votana.vercel.app>

**Solana Program ID:** 7K7wfs7ofow8gD2S41bzqs9NWqojQAxdgXxrLahLTiUc

## Project Overview

### Description

Votana is a decentralized voting application built on Solana that enables users to create polls, register candidates, and cast votes in a secure, transparent manner. The dApp provides a complete voting system with configurable poll settings, real-time vote tracking, and a modern web interface. Users can create polls with customizable parameters, add candidates, vote on proposals, and manage the entire voting lifecycle through blockchain transactions.

### Key Features

- **Create Polls**: Initialize new voting polls with title, description, start/end dates, and configurable permissions
- **Candidate Management**: Register and unregister candidates for polls with flexible permission controls
- **Voting System**: Cast votes on candidates with one-vote-per-user enforcement
- **Poll Configuration**: Set permissions for candidate adding, vote withdrawal, and candidate withdrawal
- **Real-time Tracking**: Monitor poll statistics, candidate votes, and voting progress
- **Permission Controls**: Configurable settings for poll creators and participants
- **Modern UI**: Beautiful, responsive web interface with brutalist design aesthetic

### How to Use the dApp

1. **Connect Wallet** - Connect your Solana wallet to access the application
2. **Initialize System** - First-time users must initialize the global counters
3. **Create Poll** - Set up a new voting poll with title, description, and timing
4. **Configure Permissions** - Choose who can add candidates, withdraw votes, or unregister candidates
5. **Register Candidates** - Add candidates to the poll (if permitted)
6. **Cast Votes** - Vote for your preferred candidate (one vote per user per poll)
7. **Monitor Results** - Track real-time voting progress and statistics
8. **Manage Polls** - Close polls when voting period ends

## Program Architecture

Votana uses a sophisticated architecture with multiple account types and comprehensive instruction sets. The program leverages PDAs extensively to create deterministic addresses for polls, candidates, and voters, ensuring data isolation and preventing conflicts between different voting sessions.

### PDA Usage

The program uses Program Derived Addresses to create deterministic accounts for all voting entities.

**PDAs Used:**

- **Counter PDA**: `["counter"]` - Global counter for tracking total and active polls
- **Registrations PDA**: `["registrations"]` - Global counter for tracking total and active candidate registrations
- **Votes PDA**: `["votes"]` - Global counter for tracking total and active votes
- **Poll PDA**: `["poll", poll_id]` - Unique poll accounts with sequential IDs
- **Candidate PDA**: `["candidate", poll_id, candidate_id]` - Candidate accounts within specific polls
- **Voter PDA**: `["voter", poll_id, user_pubkey]` - Voter accounts to prevent double voting

### Program Instructions

**Instructions Implemented:**

- **Initialize**: Sets up global counter accounts for polls, registrations, and votes
- **Create Poll**: Creates a new voting poll with configurable parameters and permissions
- **Register Candidate**: Adds a candidate to a specific poll with permission validation
- **Unregister Candidate**: Removes a candidate from a poll (if permitted)
- **Cast Vote**: Records a user's vote for a specific candidate with duplicate prevention
- **Close Vote**: Allows users to withdraw their votes (if permitted)
- **Close Poll**: Marks a poll as inactive and updates global counters

### Account Structure

```rust
#[account]
pub struct Poll {
    pub id: u64,                           // Unique poll identifier
    pub creator: Pubkey,                   // Poll creator's wallet address
    pub title: String,                     // Poll title (max 30 chars)
    pub description: String,               // Poll description (max 200 chars)
    pub start: u64,                        // Start timestamp
    pub end: u64,                          // End timestamp
    pub candidates: u64,                   // Number of candidates
    pub votes: u64,                        // Total votes cast
    pub allow_candidate_adding: bool,      // Permission for adding candidates
    pub allow_vote_closing: bool,          // Permission for vote withdrawal
    pub allow_candidate_withdraw: bool,    // Permission for candidate withdrawal
}

#[account]
pub struct Candidate {
    pub creator: Pubkey,                   // Candidate creator's wallet
    pub cid: u64,                          // Candidate ID
    pub poll_id: u64,                      // Associated poll ID
    pub name: String,                      // Candidate name (max 32 chars)
    pub votes: u64,                        // Vote count for this candidate
    pub has_registered: bool,              // Registration status
}

#[account]
pub struct Voter {
    pub poll_id: u64,                      // Poll being voted on
    pub cid: u64,                          // Candidate being voted for
    pub has_voted: bool,                   // Voting status
}
```

## Testing

### Test Coverage

Comprehensive test suite covering all instructions with both successful operations and error conditions to ensure program security and reliability.

**Happy Path Tests:**

- **Initialize System**: Successfully sets up global counter accounts
- **Create Poll**: Creates new polls with correct parameters and permissions
- **Register Candidate**: Adds candidates to polls with proper validation
- **Cast Vote**: Records votes correctly with duplicate prevention
- **Close Vote**: Allows vote withdrawal when permitted
- **Unregister Candidate**: Removes candidates with proper cleanup
- **Close Poll**: Marks polls as inactive and updates counters

**Unhappy Path Tests:**

- **Initialize Duplicate**: Fails when trying to initialize system twice
- **Invalid Dates**: Fails when start time is after end time
- **Non-existent Poll**: Fails when operating on non-existent polls
- **Duplicate Registration**: Fails when candidate tries to register twice
- **Duplicate Voting**: Fails when user tries to vote twice
- **Unauthorized Actions**: Fails when users lack required permissions
- **Invalid Inputs**: Fails when titles/descriptions exceed length limits

### Running Tests

```bash
cd program
yarn install    # install dependencies
anchor test     # run comprehensive test suite
```

## Frontend Features

### User Interface

- **Modern Design**: Brutalist aesthetic with clean, bold UI elements
- **Real-time Updates**: Live polling data and vote counts
- **Wallet Integration**: Seamless Solana wallet connection and transaction signing
- **Toast Notifications**: User-friendly feedback for all operations

### Key Components

- **Poll Creation Form**: Comprehensive form with all poll configuration options
- **Poll Display**: Rich poll information with timing, statistics, and permissions
- **Candidate Management**: Add/remove candidates with permission validation
- **Voting Interface**: Intuitive voting system with progress bars and percentages
- **Dashboard**: Overview of all active and completed polls

## Additional Notes for Evaluators

This is a sophisticated decentralized voting application that demonstrates advanced Solana development concepts. The project showcases:

- **Complex State Management**: Multiple interconnected account types with proper relationships
- **Permission Systems**: Flexible, configurable access controls for different operations
- **Comprehensive Validation**: Extensive error handling and input validation
- **Professional Architecture**: Clean separation of concerns between program logic and UI

The biggest technical challenges were implementing the managing the complex relationships between polls/candidates/voters, and ensuring proper PDA derivation for all account types. The voting logic required careful consideration of edge cases like double voting prevention and permission validation.
