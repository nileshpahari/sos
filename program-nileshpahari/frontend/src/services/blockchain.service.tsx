import { AnchorProvider, BN, Program, Wallet } from "@coral-xyz/anchor";
import {
  Connection,
  PublicKey,
  SystemProgram,
  TransactionSignature,
} from "@solana/web3.js";
import idl from "@/idl/votana.json";
import { Votana } from "@/types/votana";
import { Candidate, Poll } from "@/utils/interfaces";
import { store } from "@/store";
import { globalActions } from "@/store/globalSlices";

let tx;
const programId = new PublicKey(idl.address);
const { setCandidates, setPoll } = globalActions;
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "http://127.0.0.1:8899";

// seeds
const COUNTER_SEED = "counter";
const REGISTRATIONS_SEED = "registrations";
const VOTES_SEED = "votes";
const POLL_SEED = "poll";
const CANDIDATE_SEED = "candidate";
const VOTER_SEED = "voter";

// PDAs
const [counterPDA] = PublicKey.findProgramAddressSync(
  [Buffer.from(COUNTER_SEED)],
  programId
);
const [registrationsPDA] = PublicKey.findProgramAddressSync(
  [Buffer.from(REGISTRATIONS_SEED)],
  programId
);

const [votesPDA] = PublicKey.findProgramAddressSync(
  [Buffer.from(VOTES_SEED)],
  programId
);


// PDA derivation fns
const getPollPDA = (pollId: number): PublicKey => {
  const PID = new BN(pollId);
  const [pollPda] = PublicKey.findProgramAddressSync(
    [Buffer.from(POLL_SEED), PID.toArrayLike(Buffer, "le", 8)],
    programId
  );
  return pollPda;
};

const getCandidatePDA = (pollId: number, candidateId: number): PublicKey => {
  const PID = new BN(pollId);
  const CID = new BN(candidateId);
  const [candidatePda] = PublicKey.findProgramAddressSync(
    [Buffer.from(CANDIDATE_SEED), PID.toArrayLike(Buffer, "le", 8), CID.toArrayLike(Buffer, "le", 8)],
    programId
  );
  return candidatePda;
};

const getVoterPDA = (pollId: number, publicKey: PublicKey): PublicKey => {
  const PID = new BN(pollId);
  const [voterPda] = PublicKey.findProgramAddressSync(
    [Buffer.from(VOTER_SEED), PID.toArrayLike(Buffer, "le", 8), publicKey.toBuffer()],
    programId
  );
  return voterPda;
};

// provider fns
export const getProvider = (
  publicKey: PublicKey | null,
  signTransaction: any,
  sendTransaction: any
): Program<Votana> | null => {
  if (!publicKey || !signTransaction) {
    console.error("Wallet not connected or missing signTransaction.");
    return null;
  }
  const connection = new Connection(RPC_URL);
  const provider = new AnchorProvider(
    connection,
    { publicKey, signTransaction, sendTransaction } as unknown as Wallet,
    { commitment: "processed" }
  );

  return new Program<Votana>(idl as any, provider);
};

export const getReadonlyProvider = (): Program<Votana> => {
  const connection = new Connection(RPC_URL, "confirmed");
  // dummy wallet for read-only operations
  const dummyWallet = {
    publicKey: PublicKey.default,
    signTransaction: async () => {
      throw new Error("Read-only provider cannot sign transactions.");
    },
    signAllTransactions: async () => {
      throw new Error("Read-only provider cannot sign transactions.");
    },
  };

  const provider = new AnchorProvider(connection, dummyWallet as any, {
    commitment: "processed",
  });

  return new Program<Votana>(idl as any, provider);
};

// data fetching fns
export const getCounter = async (program: Program<Votana>): Promise<Record<string, BN>> => {
  try {
    const counter = await program.account.counter.fetch(counterPDA);
    if (!counter) {
      console.warn("No counter found, returning zero");
      return { total: new BN(0), active: new BN(0) };
    }

    return { total: counter.total, active: counter.active };
  } catch (error) {
    console.error("Failed to retrieve counter:", error);
    return { total: new BN(-1), active: new BN(-1) };
  }
};
export const getRegistrations = async (program: Program<Votana>): Promise<Record<string, BN>> => {
  try {
    const registrations = await program.account.registrations.fetch(registrationsPDA);
    if (!registrations) {
      console.warn("No registrations found, returning zero");
      return { total: new BN(0), active: new BN(0) };
    }
    return { total: registrations.total, active: registrations.active };
  } catch (error) {
    console.error("Failed to retrieve registrations:", error);
    return { total: new BN(-1), active: new BN(-1) };
  }
};
export const getVotes = async (program: Program<Votana>): Promise<Record<string, BN>> => {
  try {
    const votes = await program.account.votes.fetch(votesPDA);
    if (!votes) {
      console.warn("No votes found, returning zero");
      return { total: new BN(0), active: new BN(0) };
    }
    return { total: votes.total, active: votes.active };
  } catch (error) {
    console.error("Failed to retrieve votes:", error);
    return { total: new BN(-1), active: new BN(-1) };
  }
};

// instruction fns
export const initialize = async (
  program: Program<Votana>,
  publicKey: PublicKey
): Promise<TransactionSignature> => {
  tx = await program.methods
    .initialize()
    .accountsPartial({
      signer: publicKey,
      counter: counterPDA,
      registrations: registrationsPDA,
      votes: votesPDA,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
  const connection = new Connection(
    program.provider.connection.rpcEndpoint,
    "confirmed"
  );
  await connection.confirmTransaction(tx, "finalized");
  return tx;
};



export const createPoll = async (
  program: Program<Votana>,
  publicKey: PublicKey,
  nextCount: BN,
  title: string,
  description: string,
  start: number,
  end: number,
  add_candidates: boolean,
  withdraw_votes: boolean,
  withdraw_candidates: boolean
): Promise<TransactionSignature> => {

  const pollPDA = getPollPDA(nextCount.toNumber());
  const startBN = new BN(start);
  const endBN = new BN(end);

  tx = await program.methods
    .createPoll(title, description, startBN, endBN, add_candidates, withdraw_votes, withdraw_candidates)
    .accountsPartial({
      poll: pollPDA,
      counter: counterPDA,
      signer: publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  const connection = new Connection(
    program.provider.connection.rpcEndpoint,
    "confirmed"
  );
  await connection.confirmTransaction(tx, "finalized");

  return tx;
};

export const closePoll = async (
  program: Program<Votana>,
  publicKey: PublicKey,
  pollId: number
): Promise<TransactionSignature> => {
  const PID = new BN(pollId);
  const pollPDA = getPollPDA(pollId);
  tx = await program.methods
    .closePoll(PID)
    .accountsPartial({
      poll: pollPDA,
      counter: counterPDA,
      votes: votesPDA,
      registrations: registrationsPDA,
      signer: publicKey,
    })
    .rpc();

  const connection = new Connection(
    program.provider.connection.rpcEndpoint,
    "confirmed"
  );
  await connection.confirmTransaction(tx, "finalized");

  return tx;
};


export const registerCandidate = async (
  program: Program<Votana>,
  publicKey: PublicKey,
  pollId: number,
  name: string
): Promise<TransactionSignature> => {
  const PID = new BN(pollId);
  const pollPDA = getPollPDA(pollId);
  const regs = await program.account.registrations.fetch(registrationsPDA);
  const CID = regs.total.add(new BN(1));

  const candidatePDA = getCandidatePDA(pollId, CID.toNumber());

  tx = await program.methods
    .registerCandidate(PID, name)
    .accountsPartial({
      signer: publicKey,
      poll: pollPDA,
      registrations: registrationsPDA,
      candidate: candidatePDA,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  const connection = new Connection(
    program.provider.connection.rpcEndpoint,
    "confirmed"
  );
  await connection.confirmTransaction(tx, "finalized");

  return tx;
};

export const unregisterCandidate = async (
  program: Program<Votana>,
  publicKey: PublicKey,
  pollId: number,
  candidateId: number
): Promise<TransactionSignature> => {
  const PID = new BN(pollId);
  const CID = new BN(candidateId);

  const pollPDA = getPollPDA(pollId);
  const candidatePDA = getCandidatePDA(pollId, candidateId);

  tx = await program.methods
    .unregisterCandidate(PID, CID)
    .accountsPartial({
      candidate: candidatePDA,
      poll: pollPDA,
      registrations: registrationsPDA,
      votes: votesPDA,
      signer: publicKey,
    })
    .rpc();

  const connection = new Connection(
    program.provider.connection.rpcEndpoint,
    "confirmed"
  );
  await connection.confirmTransaction(tx, "finalized");

  return tx;
};

export const cast_vote = async (
  program: Program<Votana>,
  publicKey: PublicKey,
  pollId: number,
  candidateId: number
): Promise<TransactionSignature> => {
  const PID = new BN(pollId);
  const CID = new BN(candidateId);

  const pollPDA = getPollPDA(pollId);
  const [voterPDA] = PublicKey.findProgramAddressSync(
    [
      Buffer.from(VOTER_SEED),
      PID.toArrayLike(Buffer, "le", 8),
      publicKey.toBuffer(),
    ],
    programId
  );
  const candidatePDA = getCandidatePDA(pollId, candidateId);

  tx = await program.methods
    .castVote(PID, CID)
    .accountsPartial({
      signer: publicKey,
      poll: pollPDA,
      candidate: candidatePDA,
      voter: voterPDA,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  const connection = new Connection(
    program.provider.connection.rpcEndpoint,
    "confirmed"
  );
  await connection.confirmTransaction(tx, "finalized");

  return tx;
};

export const close_vote = async (
  program: Program<Votana>,
  publicKey: PublicKey,
  pollId: number,
  candidateId: number
): Promise<TransactionSignature> => {
  const PID = new BN(pollId);
  const CID = new BN(candidateId);

  const pollPDA = getPollPDA(pollId);
  const voterPDA = getVoterPDA(pollId, publicKey);
  const candidatePDA = getCandidatePDA(pollId, candidateId);

  tx = await program.methods
    .closeVote(PID, CID)
    .accountsPartial({
      poll: pollPDA,
      candidate: candidatePDA,
      voter: voterPDA,
      votes: votesPDA,
      signer: publicKey,
    })
    .rpc();

  const connection = new Connection(
    program.provider.connection.rpcEndpoint,
    "confirmed"
  );
  await connection.confirmTransaction(tx, "finalized");

  return tx;
};

export const fetchAllPolls = async (
  program: Program<Votana>
): Promise<Poll[]> => {
  const polls = await program.account.poll.all();
  return serializedPoll(polls);
};

export const fetchPollDetails = async (
  program: Program<Votana>,
  pollAddress: string
): Promise<Poll> => {
  const poll = await program.account.poll.fetch(pollAddress);

  // doubt
  const serialized: Poll = {
    ...poll,
    publicKey: pollAddress,
    creator: poll.creator.toBase58(),
    id: poll.id.toNumber(),
    start: poll.start.toNumber() * 1000,
    end: poll.end.toNumber() * 1000,
    candidates: poll.candidates.toNumber(),
    votes: poll.votes.toNumber(),
    allow_candidate_add: poll.allowCandidateAdding,
    allow_vote_closing: poll.allowVoteClosing,
    allow_candidate_withdraw: poll.allowCandidateWithdraw,
    title: poll.title,
    description: poll.description,
  };

  store.dispatch(setPoll(serialized));
  return serialized;
};

const serializedPoll = (polls: any[]): Poll[] =>
  polls.map((c: any) => ({
    ...c.account,
    publicKey: c.publicKey.toBase58(),
    creator: c.account.creator.toBase58(),
    id: c.account.id.toNumber(),
    start: c.account.start.toNumber() * 1000,
    end: c.account.end.toNumber() * 1000,
    candidates: c.account.candidates.toNumber(),
    votes: c.account.votes.toNumber(),
    allow_candidate_add: c.account.allowCandidateAdding,
    allow_vote_closing: c.account.allowVoteClosing,
    allow_candidate_withdraw: c.account.allowCandidateWithdraw,
    title: c.account.title,
    description: c.account.description,
  }));

export const fetchAllCandidates = async (
  program: Program<Votana>,
  pollAddress: string
): Promise<Candidate[]> => {
  const poll = await fetchPollDetails(program, pollAddress);
  if (!poll) return [];

  const PID = new BN(poll.id);
  const candidateAccounts = await program.account.candidate.all();
  const filtered = candidateAccounts.filter((c) => c.account.pollId.eq(PID));
  const serialized = serializedCandidates(filtered);

  store.dispatch(setCandidates(serialized));
  return serialized;
};

const serializedCandidates = (candidates: any[]): Candidate[] =>
  candidates.map((c: any) => ({
    ...c.account,
    creator: c.account.creator.toBase58(),
    publicKey: c.publicKey.toBase58(), 
    cid: c.account.cid.toNumber(),
    pollId: c.account.pollId.toNumber(),
    votes: c.account.votes.toNumber(),
    name: c.account.name,
  }));

export const hasUserVoted = async (
  program: Program<Votana>,
  publicKey: PublicKey,
  pollId: number
): Promise<number | null> => {
  const voterPda = getVoterPDA(pollId, publicKey);

  try {
    const voterAccount = await program.account.voter.fetch(voterPda);

    if (!voterAccount || !voterAccount.hasVoted) {
      return null; 
    }
    return voterAccount.cid.toNumber();
  } catch (error) {
    console.error("Error fetching voter account:", error);
    return null;
  }
};

