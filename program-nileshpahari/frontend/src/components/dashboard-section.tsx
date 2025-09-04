"use client";
import { useEffect, useState } from "react";
import { PollCard } from "@/components/poll-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Poll, Candidate } from "@/utils/interfaces";
import { closePoll, unregisterCandidate } from "@/services/blockchain.service";
import { fetchAllCandidates } from "@/services/blockchain.service";
import { useWallet } from "@solana/wallet-adapter-react";
import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { toast } from "react-toastify";
import { Votana } from "@/types/votana";

export function DashboardSection({
  program,
  polls,
}: {
  program: Program<Votana>;
  polls: Poll[];
}) {
  const { publicKey } = useWallet();
  const [myPolls, setMyPolls] = useState<Poll[]>([]);
  const [myCandidates, setMyCandidates] = useState<
    { poll: Poll; candidate: Candidate }[]
  >([]);

  useEffect(() => {
    if (!publicKey || !program) return;

    setMyPolls(polls.filter((p) => p.creator === publicKey.toBase58()));

    const fetchCandidatesForUser = async () => {
      const candidateEntries: { poll: Poll; candidate: Candidate }[] = [];

      for (const poll of polls) {
        const candidates = await fetchAllCandidates(program, poll.publicKey);
        candidates.forEach((c) => {
          if (c.creator === publicKey.toBase58()) {
            candidateEntries.push({ poll, candidate: c });
          }
        });
      }

      setMyCandidates(candidateEntries);
    };

    fetchCandidatesForUser();
  }, [publicKey, program, polls]);

  if (!publicKey) {
    return (
      <div className="p-6 font-mono">
        Connect your wallet to view dashboard
      </div>
    );
  }

  return (
    <div className="p-6 space-y-10">
      <section>
        <h2 className="text-xl font-mono font-bold uppercase mb-4">My Polls</h2>
        {myPolls.length === 0 ? (
          <p className="font-mono text-gray-700">You haven’t created any polls.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {myPolls.map((poll) => (
              <div key={poll.id} className="relative">
                <PollCard poll={poll} />
                {poll.end <= Date.now() && (
                  <Button
                    onClick={async () => {
                      await toast.promise(
                        closePoll(program, publicKey as PublicKey, poll.id),
                        {
                          pending: "Closing poll...",
                          success: "Poll closed successfully",
                          error: "Failed to close poll",
                        }
                      );
                    }}
                    className="absolute top-4 right-4 brutalist-button bg-red-500 text-white border-2 border-black shadow-brutal hover:bg-red-600"
                  >
                    CLOSE
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-mono font-bold uppercase mb-4">
          My Candidates
        </h2>
        {myCandidates.length === 0 ? (
          <p className="font-mono text-gray-700">
            You haven’t registered as a candidate in any polls.
          </p>
        ) : (
          <div className="space-y-4">
            {myCandidates.map(({ poll, candidate }) => (
              <Card
                key={`${poll.id}-${candidate.cid}`}
                className="brutalist-card bg-white border-black shadow-brutal"
              >
                <CardContent className="p-6 flex justify-between items-center">
                  <div>
                    <h3 className="font-mono font-bold uppercase">
                      {candidate.name}
                    </h3>
                    <p className="font-sans text-sm text-gray-600">
                      Poll: {poll.title}
                    </p>
                  </div>

                  {(poll.allow_candidate_withdraw ||
                    poll.creator === publicKey?.toBase58()) && (
                    <Button
                      onClick={async () => {
                        await toast.promise(
                          unregisterCandidate(
                            program,
                            publicKey as PublicKey,
                            poll.id,
                            candidate.cid
                          ),
                          {
                            pending: "Withdrawing candidate...",
                            success: "Candidate withdrawn",
                            error: "Failed to withdraw candidate ",
                          }
                        );
                      }}
                      className="brutalist-button bg-red-500 text-white border-2 border-black shadow-brutal hover:bg-red-600"
                    >
                      WITHDRAW
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
