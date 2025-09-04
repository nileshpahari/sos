import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { assert } from "chai";
import { before, describe, it } from "mocha";
import type { Votana } from "../target/types/votana";
import { BN } from "bn.js";

const COUNTER_SEED = "counter";
const REGISTRATIONS_SEED = "registrations";
const VOTES_SEED = "votes";
const POLL_SEED = "poll";
const CANDIDATE_SEED = "candidate";
const VOTER_SEED = "voter";

describe("votana", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.votana as Program<Votana>;

  const admin = anchor.web3.Keypair.generate();
  const alice = anchor.web3.Keypair.generate();
  const bob = anchor.web3.Keypair.generate();
  const charlie = anchor.web3.Keypair.generate();

  const poll_title_1 = "Best Programming Language";
  const poll_description_1 = "Vote for the best programming language in 2024";
  const poll_title_2 = "Favorite Food";
  const poll_description_2 = "What's your favorite type of cuisine?";

  const candidate_name_1 = "JavaScript";
  const candidate_name_2 = "Rust";
  const candidate_name_3 = "Python";
  const candidate_name_long =
    "This candidate name is way too long and exceeds the 32 character limit";

  // Test data for edge cases
  const long_title =
    "This title is way too long and exceeds the 30 character limit";
  const long_description = "A".repeat(201); // 201 characters
  const max_title = "A".repeat(30); // Exactly 30 characters
  const max_description = "B".repeat(200); // Exactly 200 characters
  const max_candidate_name = "C".repeat(32); // Exactly 32 characters

  let currentTime: number;

  before(async () => {
    await airdrop(provider.connection, admin.publicKey);
    await airdrop(provider.connection, alice.publicKey);
    await airdrop(provider.connection, bob.publicKey);
    await airdrop(provider.connection, charlie.publicKey);

    currentTime = Math.floor(Date.now() / 1000);
  });

  describe("Initialize System", () => {
    it("Should successfully initialize the voting system", async () => {
      const [counter_pkey] = getCounterAddress();
      const [registrations_pkey] = getRegistrationsAddress();
      const [votes_pkey] = getVotesAddress();

      await program.methods
        .initialize()
        .accounts({
          counter: counter_pkey,
          registrations: registrations_pkey,
          votes: votes_pkey,
          signer: admin.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        } as Record<string, PublicKey>)
        .signers([admin])
        .rpc({ commitment: "confirmed" });

      await checkCounter(counter_pkey, "total", 0);
      await checkCounter(counter_pkey, "active", 0);
      await checkRegistrations(registrations_pkey, "total", 0);
      await checkRegistrations(registrations_pkey, "active", 0);
      await checkVotes(votes_pkey, "total", 0);
      await checkVotes(votes_pkey, "active", 0);
    });

    it("Should fail when trying to initialize twice", async () => {
      const [counter_pkey] = getCounterAddress();
      const [registrations_pkey] = getRegistrationsAddress();
      const [votes_pkey] = getVotesAddress();

      let should_fail = "This should fail";
      try {
        await program.methods
          .initialize()
          .accounts({
            counter: counter_pkey,
            registrations: registrations_pkey,
            votes: votes_pkey,
            signer: admin.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          } as Record<string, PublicKey>)
          .signers([admin])
          .rpc({ commitment: "confirmed" });
      } catch (error: any) {
        should_fail = "Failed";
        assert.isTrue(
          SolanaError.contains(error.logs, "already in use"),
          "Expected 'already in use' error when trying to initialize twice"
        );
      }
      assert.strictEqual(
        should_fail,
        "Failed",
        "Initialize should fail when called twice"
      );
    });
  });

  describe("Create Poll", () => {
    it("Should successfully create a poll with valid parameters", async () => {
      const [counter_pkey] = getCounterAddress();
      const [poll_pkey] = await getNewPollAddress(counter_pkey);
      const start_time = currentTime;
      const end_time = currentTime + 360000;

      await program.methods
        .createPoll(
          poll_title_1,
          poll_description_1,
          new BN(start_time),
          new BN(end_time),
          true,
          true,
          true
        )
        .accounts({
          poll: poll_pkey,
          counter: counter_pkey,
          signer: alice.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        } as Record<string, PublicKey>)
        .signers([alice])
        .rpc({ commitment: "confirmed" });

      await checkPoll(program, poll_pkey, {
        id: 1,
        creator: alice.publicKey,
        title: poll_title_1,
        description: poll_description_1,
        start: start_time,
        end: end_time,
        candidates: 0,
        votes: 0,
        allow_candidate_add: true,
        allow_candidate_withdraw: true,
        allow_vote_closing: true,
      });
      await checkCounter(counter_pkey, "total", 1);
      await checkCounter(counter_pkey, "active", 1);
    });

    it("Should fail when start time is after end time", async () => {
      const [counter_pkey] = getCounterAddress();
      const [poll_pkey] = await getNewPollAddress(counter_pkey);

      let should_fail = "This should fail";
      try {
        await program.methods
          .createPoll(
            poll_title_2,
            poll_description_2,
            new BN(currentTime + 3600),
            new BN(currentTime + 100),
            true,
            true,
            true
          )
          .accounts({
            poll: poll_pkey,
            counter: counter_pkey,
            signer: alice.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          } as Record<string, PublicKey>)
          .signers([alice])
          .rpc({ commitment: "confirmed" });
      } catch (error: any) {
        should_fail = "Failed";
        const err = anchor.AnchorError.parse(error.logs);
        assert.strictEqual(
          err?.error.errorCode.code,
          "InvalidDates",
          "Expected 'InvalidDates' error"
        );
      }
      assert.strictEqual(
        should_fail,
        "Failed",
        "Should fail with invalid dates"
      );
    });
  });

  describe("Register Candidate", () => {
    it("Should successfully register candidate for a poll", async () => {
      const [registrations_pkey] = getRegistrationsAddress();
      const [poll_pkey] = getExistingPollAddress(1);
      const [candidate_pkey] = await getNewCandidateAddress(
        1,
        registrations_pkey
      );

      await program.methods
        .registerCandidate(new BN(1), candidate_name_1)
        .accounts({
          poll: poll_pkey,
          candidate: candidate_pkey,
          registrations: registrations_pkey,
          signer: bob.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        } as Record<string, PublicKey>)
        .signers([bob])
        .rpc({ commitment: "confirmed" });

      await checkCandidate(candidate_pkey, {
        creator: bob.publicKey,
        pollId: 1,
        cid: 1,
        name: candidate_name_1,
        votes: 0,
        hasRegistered: true,
      });
      await checkRegistrations(registrations_pkey, "total", 1);
      await checkRegistrations(registrations_pkey, "active", 1);
    });

    it("Should fail when trying to register for non-existent poll", async () => {
      const [registrations_pkey] = getRegistrationsAddress();
      const [fake_poll_pkey] = getExistingPollAddress(999);
      const [candidate_pkey] = await getNewCandidateAddress(
        999,
        registrations_pkey
      );

      let should_fail = "This should fail";
      try {
        await program.methods
          .registerCandidate(new BN(999), candidate_name_3)
          .accounts({
            poll: fake_poll_pkey,
            candidate: candidate_pkey,
            registrations: registrations_pkey,
            signer: bob.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          } as Record<string, PublicKey>)
          .signers([bob])
          .rpc({ commitment: "confirmed" });
      } catch (error: any) {
        should_fail = "Failed";
      }
      assert.strictEqual(
        should_fail,
        "Failed",
        "Should fail for non-existent poll"
      );
    });
  });

  describe("Cast Vote", () => {
    it("Should successfully cast vote for registered candidate", async () => {
      const pollId = 1;
      const cid = 1;
      const [poll_pkey] = getExistingPollAddress(pollId);
      const [candidate_pkey] = getExistingCandidateAddress(pollId, cid);
      const [votes_pkey] = getVotesAddress();
      const [voter_pkey] = getVoterAddress(pollId, alice.publicKey);

      await program.methods
        .castVote(new BN(pollId), new BN(cid))
        .accounts({
          poll: poll_pkey,
          candidate: candidate_pkey,
          voter: voter_pkey,
          votes: votes_pkey,
          signer: alice.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        } as Record<string, PublicKey>)
        .signers([alice])
        .rpc({ commitment: "confirmed" });

      await checkVoter(program, voter_pkey, {
        pollId: pollId,
        cid: cid,
        hasVoted: true,
      });

      const candidateData = await program.account.candidate.fetch(
        candidate_pkey
      );

      assert.strictEqual(
        candidateData.votes.toNumber(),
        1,
        "Candidate should have 1 vote"
      );
    });

    it("Should fail when trying to vote for non-registered candidate", async () => {
      const pollId = 1;
      const [poll_pkey] = getExistingPollAddress(pollId);
      const [fake_candidate_pkey] = getExistingCandidateAddress(pollId, 999);
      const [voter_pkey] = getVoterAddress(pollId, bob.publicKey);
      const [votes_pkey] = getVotesAddress();

      let should_fail = "This should fail";
      try {
        await program.methods
          .castVote(new BN(pollId), new BN(999))
          .accounts({
            poll: poll_pkey,
            candidate: fake_candidate_pkey,
            voter: voter_pkey,
            votes: votes_pkey,
            signer: bob.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          } as Record<string, PublicKey>)
          .signers([bob])
          .rpc({ commitment: "confirmed" });
      } catch (error: any) {
        should_fail = "Failed";
      }
      assert.strictEqual(
        should_fail,
        "Failed",
        "Should fail for non-existent candidate"
      );
    });
  });

  describe("Close vote", () => {
    it("Should successfully close vote", async () => {
      const [poll_pkey] = getExistingPollAddress(1);
      const [candidate_pkey] = getExistingCandidateAddress(1, 1);
      const [votes_pkey] = getVotesAddress();
      const [voter_pkey] = getVoterAddress(1, alice.publicKey);

      await program.methods
        .closeVote(new BN(1), new BN(1))
        .accounts({
          poll: poll_pkey,
          candidate: candidate_pkey,
          voter: voter_pkey,
          votes: votes_pkey,
          signer: alice.publicKey,
        } as Record<string, PublicKey>)
        .signers([alice])
        .rpc({ commitment: "confirmed" });

      const candidateData = await program.account.candidate.fetch(
        candidate_pkey
      );
      await checkVotes(votes_pkey, "total", 1);
      await checkVotes(votes_pkey, "active", 0);
      assert.strictEqual(
        candidateData.votes.toNumber(),
        0,
        "Candidate should have 0 vote"
      );
    });
    it("Should fail when trying to close vote for non-existent candidate", async () => {
      const [poll_pkey] = getExistingPollAddress(1);
      const [candidate_pkey] = getExistingCandidateAddress(1, 999);
      const [votes_pkey] = getVotesAddress();
      const [voter_pkey] = getVoterAddress(1, alice.publicKey);
      let should_fail = "This should fail";
      try {
        await program.methods
          .closeVote(new BN(1), new BN(999))
          .accounts({
            poll: poll_pkey,
            candidate: candidate_pkey,
            voter: voter_pkey,
            votes: votes_pkey,
            signer: alice.publicKey,
          } as Record<string, PublicKey>)
          .signers([alice])
          .rpc({ commitment: "confirmed" });
      } catch (error: any) {
        should_fail = "Failed";
      }
      assert.strictEqual(
        should_fail,
        "Failed",
        "Should fail for non-existent candidate"
      );
    });
  });

  describe("Unregister Candidate", () => {
    it("Should successfully unregister a candidate", async () => {
      const [poll_pkey] = getExistingPollAddress(1);
      const [candidate_pkey] = getExistingCandidateAddress(1, 1);
      const [registrations_pkey] = getRegistrationsAddress();
      const [votes_pkey] = getVotesAddress();
      await program.methods
        .unregisterCandidate(new BN(1), new BN(1))
        .accounts({
          candidate: candidate_pkey,
          poll: poll_pkey,
          registrations: registrations_pkey,
          votes: votes_pkey,
          signer: bob.publicKey,
        } as Record<string, PublicKey>)
        .signers([bob])
        .rpc({ commitment: "confirmed" });

      const pollData = await program.account.poll.fetch(poll_pkey);
      await checkRegistrations(registrations_pkey, "total", 1);
      await checkRegistrations(registrations_pkey, "active", 0);
      assert.strictEqual(
        pollData.candidates.toNumber(),
        0,
        "Poll should have 0 candidates"
      );
    });
    it("Should fail when trying to unregister a non-existent candidate", async () => {
      const [poll_pkey] = getExistingPollAddress(1);
      const [candidate_pkey] = getExistingCandidateAddress(1, 999);
      const [registrations_pkey] = getRegistrationsAddress();
      const [votes_pkey] = getVotesAddress();

      let should_fail = "This should fail";
      try {
        await program.methods
          .unregisterCandidate(new BN(1), new BN(999))
          .accounts({
            candidate: candidate_pkey,
            poll: poll_pkey,
            registrations: registrations_pkey,
            votes: votes_pkey,
            signer: bob.publicKey,
          } as Record<string, PublicKey>)
          .signers([bob])
          .rpc({ commitment: "confirmed" });
      } catch (error: any) {
        should_fail = "Failed";
      }
      assert.strictEqual(
        should_fail,
        "Failed",
        "Should fail for non-existent candidate"
      );
    });
  });
  describe("Close Poll", () => {
    it("Should successfully close a poll", async () => {
      const [poll_pkey] = getExistingPollAddress(1);
      const [registrations_pkey] = getRegistrationsAddress();
      const [votes_pkey] = getVotesAddress();
      const [counter_pkey] = getCounterAddress();

      await program.methods
        .closePoll(new BN(1))
        .accounts({
          poll: poll_pkey,
          counter: counter_pkey,
          votes: votes_pkey,
          registrations: registrations_pkey,
          signer: alice.publicKey,
        } as Record<string, PublicKey>)
        .signers([alice])
        .rpc({ commitment: "confirmed" });

      await checkCounter(counter_pkey, "total", 1);
      await checkCounter(counter_pkey, "active", 0);
    });
    it("Should fail when trying to close a non-existent poll", async () => {
      const [fake_poll_pkey] = getExistingPollAddress(999);
      const [registrations_pkey] = getRegistrationsAddress();
      const [votes_pkey] = getVotesAddress();
      const [counter_pkey] = getCounterAddress();

      let should_fail = "This should fail";
      try {
        await program.methods
          .closePoll(new BN(999))
          .accounts({
            poll: fake_poll_pkey,
            counter: counter_pkey,
            votes: votes_pkey,
            registrations: registrations_pkey,
            signer: bob.publicKey,
          } as Record<string, PublicKey>)
          .signers([bob])
          .rpc({ commitment: "confirmed" });
      } catch (error: any) {
        should_fail = "Failed";
      }
      assert.strictEqual(
        should_fail,
        "Failed",
        "Should fail for non-existent poll"
      );
    });
  });

  async function airdrop(connection: any, address: any, amount = 1000000000) {
    await connection.confirmTransaction(
      await connection.requestAirdrop(address, amount),
      "confirmed"
    );
  }

  // address derivation helpers
  function getCounterAddress() {
    return PublicKey.findProgramAddressSync(
      [Buffer.from(COUNTER_SEED)],
      program.programId
    );
  }

  function getRegistrationsAddress() {
    return PublicKey.findProgramAddressSync(
      [Buffer.from(REGISTRATIONS_SEED)],
      program.programId
    );
  }

  function getVotesAddress() {
    return PublicKey.findProgramAddressSync(
      [Buffer.from(VOTES_SEED)],
      program.programId
    );
  }

  async function getNewPollAddress(
    counter: PublicKey
  ): Promise<[PublicKey, number]> {
    const counterData = await program.account.counter.fetch(counter);
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from(POLL_SEED),
        new BN(counterData.total).add(new BN(1)).toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );
  }
  function getExistingPollAddress(pollId: number): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from(POLL_SEED), new BN(pollId).toArrayLike(Buffer, "le", 8)],
      program.programId
    );
  }

  async function getNewCandidateAddress(
    pollId: number,
    registrations: PublicKey
  ): Promise<[PublicKey, number]> {
    const registrationsData = await program.account.registrations.fetch(
      registrations
    );
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from(CANDIDATE_SEED),
        new BN(pollId).toArrayLike(Buffer, "le", 8),
        registrationsData.total.add(new BN(1)).toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );
  }

  function getExistingCandidateAddress(
    pollId: number,
    cid: number
  ): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from(CANDIDATE_SEED),
        new BN(pollId).toArrayLike(Buffer, "le", 8),
        new BN(cid).toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );
  }

  function getVoterAddress(
    pollId: number,
    voter: PublicKey
  ): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from(VOTER_SEED),
        new BN(pollId).toArrayLike(Buffer, "le", 8),
        voter.toBuffer(),
      ],
      program.programId
    );
  }
  class SolanaError {
    static contains(logs: any[], error: string): boolean {
      const match = logs?.filter((s: string) => s.includes(error));
      return Boolean(match?.length);
    }
  }

  // Verification helper functions
  async function checkCounter(
    counter: PublicKey,
    toCheck: "total" | "active",
    expectedCount: number
  ) {
    const counterData = await program.account.counter.fetch(counter);
    assert.strictEqual(
      counterData[toCheck].toNumber(),
      expectedCount,
      `Counter ${toCheck} count should be ${expectedCount} but was ${counterData[
        toCheck
      ].toNumber()}`
    );
  }

  async function checkRegistrations(
    registrations: PublicKey,
    toCheck: "total" | "active",
    expectedCount: number
  ) {
    const registrationsData = await program.account.registrations.fetch(
      registrations
    );
    assert.strictEqual(
      registrationsData[toCheck].toNumber(),
      expectedCount,
      `Registrations ${toCheck} count should be ${expectedCount} but was ${registrationsData[
        toCheck
      ].toNumber()}`
    );
  }

  async function checkVotes(
    votes: PublicKey,
    toCheck: "total" | "active",
    expectedCount: number
  ) {
    const votesData = await program.account.votes.fetch(votes);
    assert.strictEqual(
      votesData[toCheck].toNumber(),
      expectedCount,
      `Votes ${toCheck} count should be ${expectedCount} but was ${votesData[
        toCheck
      ].toNumber()}`
    );
  }

  async function checkPoll(
    program: anchor.Program<Votana>,
    poll: PublicKey,
    expected: {
      id?: number;
      creator?: PublicKey;
      title?: string;
      description?: string;
      start?: number;
      end?: number;
      candidates?: number;
      votes?: number;
      allow_candidate_add?: boolean;
      allow_candidate_withdraw?: boolean;
      allow_vote_closing?: boolean;
    }
  ) {
    const pollData = await program.account.poll.fetch(poll);

    if (expected.id !== undefined) {
      assert.strictEqual(
        pollData.id.toNumber(),
        expected.id,
        `Poll ID should be ${expected.id} but was ${pollData.id.toNumber()}`
      );
    }
    if (expected.creator) {
      assert.strictEqual(
        pollData.creator.toString(),
        expected.creator.toString(),
        `Poll creator should be ${expected.creator.toString()} but was ${pollData.creator.toString()}`
      );
    }
    if (expected.title !== undefined) {
      assert.strictEqual(
        pollData.title,
        expected.title,
        `Poll title should be "${expected.title}" but was "${pollData.title}"`
      );
    }
    if (expected.description !== undefined) {
      assert.strictEqual(
        pollData.description,
        expected.description,
        `Poll description should be "${expected.description}" but was ${pollData.description}`
      );
    }
    if (expected.start !== undefined) {
      assert.strictEqual(
        pollData.start.toNumber(),
        expected.start,
        `Poll start should be ${
          expected.start
        } but was ${pollData.start.toNumber()}`
      );
    }
    if (expected.end !== undefined) {
      assert.strictEqual(
        pollData.end.toNumber(),
        expected.end,
        `Poll end should be ${expected.end} but was ${pollData.end.toNumber()}`
      );
    }
    if (expected.candidates !== undefined) {
      assert.strictEqual(
        pollData.candidates.toNumber(),
        expected.candidates,
        `Poll candidates should be ${
          expected.candidates
        } but was ${pollData.candidates.toNumber()}`
      );
    }
    if (expected.allow_candidate_add !== undefined) {
      assert.strictEqual(
        pollData.allowCandidateAdding,
        expected.allow_candidate_add,
        `Poll allow_candidate_add should be ${expected.allow_candidate_add} but was ${pollData.allowCandidateAdding}`
      );
    }
    if (expected.allow_candidate_withdraw !== undefined) {
      assert.strictEqual(
        pollData.allowCandidateWithdraw,
        expected.allow_candidate_withdraw,
        `Poll allow_candidate_withdraw should be ${expected.allow_candidate_withdraw} but was ${pollData.allowCandidateWithdraw}`
      );
    }
    if (expected.allow_vote_closing !== undefined) {
      assert.strictEqual(
        pollData.allowVoteClosing,
        expected.allow_vote_closing,
        `Poll allow_vote_closing should be ${expected.allow_vote_closing} but was ${pollData.allowVoteClosing}`
      );
    }
  }

  async function checkCandidate(
    candidate: PublicKey,
    expected: {
      creator?: PublicKey;
      cid?: number;
      pollId?: number;
      name?: string;
      votes?: number;
      hasRegistered?: boolean;
    }
  ) {
    const candidateData = await program.account.candidate.fetch(candidate);

    if (expected.creator) {
      assert.strictEqual(
        candidateData.creator.toString(),
        expected.creator.toString(),
        `Candidate creator should be ${expected.creator.toString()} but was ${candidateData.creator.toString()}`
      );
    }
    if (expected.cid !== undefined) {
      assert.strictEqual(
        candidateData.cid.toNumber(),
        expected.cid,
        `Candidate CID should be ${
          expected.cid
        } but was ${candidateData.cid.toNumber()}`
      );
    }
    if (expected.pollId !== undefined) {
      assert.strictEqual(
        candidateData.pollId.toNumber(),
        expected.pollId,
        `Candidate poll ID should be ${
          expected.pollId
        } but was ${candidateData.pollId.toNumber()}`
      );
    }
    if (expected.name !== undefined) {
      assert.strictEqual(
        candidateData.name,
        expected.name,
        `Candidate name should be "${expected.name}" but was ${candidateData.name}`
      );
    }
    if (expected.votes !== undefined) {
      assert.strictEqual(
        candidateData.votes.toNumber(),
        expected.votes,
        `Candidate votes should be ${
          expected.votes
        } but was ${candidateData.votes.toNumber()}`
      );
    }
    if (expected.hasRegistered !== undefined) {
      assert.strictEqual(
        candidateData.hasRegistered,
        expected.hasRegistered,
        `Candidate hasRegistered should be ${expected.hasRegistered} but was ${candidateData.hasRegistered}`
      );
    }
  }

  async function checkVoter(
    program: anchor.Program<Votana>,
    voter: PublicKey,
    expected: {
      pollId?: number;
      cid?: number;
      hasVoted?: boolean;
    }
  ) {
    const voterData = await program.account.voter.fetch(voter);

    if (expected.pollId !== undefined) {
      assert.strictEqual(
        voterData.pollId.toNumber(),
        expected.pollId,
        `Voter poll ID should be ${
          expected.pollId
        } but was ${voterData.pollId.toNumber()}`
      );
    }
    if (expected.cid !== undefined) {
      assert.strictEqual(
        voterData.cid.toNumber(),
        expected.cid,
        `Voter CID should be ${
          expected.cid
        } but was ${voterData.cid.toNumber()}`
      );
    }
    if (expected.hasVoted !== undefined) {
      assert.strictEqual(
        voterData.hasVoted,
        expected.hasVoted,
        `Voter hasVoted should be ${expected.hasVoted} but was ${voterData.hasVoted}`
      );
    }
  }
});
