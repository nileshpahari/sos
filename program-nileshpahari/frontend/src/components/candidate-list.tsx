import React, { useEffect, useMemo, useState } from "react";
import { Candidate, Poll } from "@/utils/interfaces";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  fetchAllCandidates,
  getProvider,
  hasUserVoted,
  cast_vote,
  close_vote,
} from "@/services/blockchain.service";
import { toast } from "react-toastify";
import { Button } from "./ui/button";

interface Props {
  candidates: Candidate[];
  poll: Poll; // ✅ full poll object
  pollAddress: string;
}

const CandidateList = ({ candidates, poll, pollAddress }: Props) => {
  const [votedCid, setVotedCid] = useState<number | null>(null);
  const { publicKey, sendTransaction, signTransaction } = useWallet();

  const program = useMemo(
    () => getProvider(publicKey, signTransaction, sendTransaction),
    [publicKey, signTransaction, sendTransaction]
  );

  const fetchVotingStatus = async () => {
    if (!program || !publicKey) return;
    // 🔑 update hasUserVoted to return candidateId instead of just boolean if possible
    const status = await hasUserVoted(program, publicKey, poll.id);
    // if your fn only returns boolean, you’ll need a separate fn to check which candidate was voted
    setVotedCid(status || null);
  };

  useEffect(() => {
    fetchVotingStatus();
  }, [program, publicKey, candidates]);

  const handleVote = async (candidate: Candidate) => {
    if (!program || !publicKey || votedCid !== null) return;

    await toast.promise(
      (async () => {
        const tx = await cast_vote(
          program,
          publicKey,
          candidate.pollId,
          candidate.cid
        );
        await fetchAllCandidates(program, pollAddress);
        await fetchVotingStatus();
        console.log(tx);
      })(),
      {
        pending: "Approve transaction...",
        success: "Transaction successful 👌",
        error: "Encountered error 🤯",
      }
    );
  };

  const handleCloseVote = async (candidate: Candidate) => {
    if (!program || !publicKey) return;

    if (!poll.allow_vote_closing && poll.creator !== publicKey.toBase58()) {
      toast.error("You are not authorized to close votes on this poll");
      return;
    }

    await toast.promise(
      (async () => {
        const tx = await close_vote(
          program,
          publicKey,
          candidate.pollId,
          candidate.cid
        );
        await fetchAllCandidates(program, pollAddress);
        await fetchVotingStatus();
        console.log(tx);
      })(),
      {
        pending: "Closing vote...",
        success: "Vote closed successfully 👌",
        error: "Error closing vote 🤯",
      }
    );
  };

  const totalVotes = candidates.reduce((sum, c) => sum + (c.votes || 0), 0);

  return (
    <div className="space-y-3">
      {candidates.map((candidate) => {
        const pct =
          totalVotes > 0 ? Math.round((candidate.votes / totalVotes) * 100) : 0;

        const isVoted = votedCid === candidate.cid;

        return (
          <div
            key={candidate.cid}
            className="group border-2 border-black rounded-none p-3 shadow-[2px_2px_0_0_#000] bg-white"
          >
            <div className="flex items-center justify-between gap-3">
              <Button
                type="button"
                aria-pressed={isVoted}
                onClick={() => handleVote(candidate)}
                disabled={votedCid !== null || !publicKey}
                className={[
                  "text-left flex-1 font-sans font-semibold",
                  "px-3 py-2 border-2 border-black rounded-none transition-colors duration-200",
                  isVoted
                    ? "bg-green-400 text-black"
                    : "bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-black",
                  "shadow-[2px_2px_0_0_#000]",
                ].join(" ")}
              >
                {candidate.name}
              </Button>

              {/* Show % */}
              <span className="w-16 text-right font-mono text-sm text-gray-700">
                {pct}%
              </span>

              {/* ❌ Close button only for the candidate the user voted */}
              {isVoted && (
                <button
                  type="button"
                  onClick={() => handleCloseVote(candidate)}
                  className="ml-2 text-red-600 hover:text-red-800 font-bold"
                >
                  ✖
                </button>
              )}
            </div>

            {/* Progress bar */}
            <div className="mt-2 h-2 w-full bg-gray-100 border-2 border-black rounded-none shadow-[1px_1px_0_0_#000]">
              <div
                className={`h-full transition-all duration-500 ${
                  isVoted ? "bg-green-500" : "bg-blue-400"
                }`}
                style={{ width: `${pct}%` }}
                aria-hidden
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CandidateList;
