"use client";

import React, { useEffect, useMemo } from "react";
import {
  getReadonlyProvider,
  fetchPollDetails,
  fetchAllCandidates,
} from "@/services/blockchain.service";
import { RootState } from "@/utils/interfaces";
import { useParams } from "next/navigation";
import RegCandidate from "@/components/reg-modal";
import { FaRegEdit } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { globalActions } from "@/store/globalSlices";
import { useWallet } from "@solana/wallet-adapter-react";
import CandidateList from "@/components/candidate-list";
import { ViewPoll as Poll } from "@/components/poll";
import { Button } from "@/components/ui/button";

export default function PollDetails() {
  const { pollId } = useParams();
  const { publicKey } = useWallet();

  const program = useMemo(() => getReadonlyProvider(), []);
  const dispatch = useDispatch();
  const { setRegModal, setCandidates, setPoll } = globalActions;
  const { candidates, poll } = useSelector(
    (states: RootState) => states.globalStates
  );

  useEffect(() => {
    if (!program || !pollId) return;

    const fetchDetails = async () => {
      await fetchPollDetails(program, pollId as string);
      await fetchAllCandidates(program, pollId as string);
    };

    fetchDetails();
  }, [program, pollId, setPoll, setCandidates, dispatch]);

  if (!poll) {
    return (
      <div className="flex flex-col items-center py-10">
        <h2 className="text-gray-700 text-lg font-semibold">
          Loading poll details...
        </h2>
      </div>
    );
  }

  if (!publicKey) {
    return (
      <div className="flex h-screen w-full justify-center items-center text-2xl font-bold">
        Please connect your wallet to use this app
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full p-6 space-y-6">
      <div className="w-full max-w-4xl">
        <Poll poll={poll} candidates={candidates} />
      </div>

      <div className="w-full max-w-4xl space-y-4">
        {candidates.length > 0 && (
          <CandidateList
            candidates={candidates}
            pollAddress={poll.publicKey}
            poll={poll}
          />
        )}

        <Button
        className="flex justify-center items-center gap-2 bg-gray-700 text-white rounded-none
        border-2 border-black shadow-[3px_3px_0_0_#000] px-6 py-2 text-lg font-bold w-full md:w-auto"
          onClick={() => dispatch(setRegModal("scale-100"))}
        >
          <span>Add Candidate</span>
          <FaRegEdit />
        </Button>

        {pollId && (
          <RegCandidate pollId={poll.id} pollAddress={poll.publicKey} />
        )}
      </div>
    </div>
  );
}
