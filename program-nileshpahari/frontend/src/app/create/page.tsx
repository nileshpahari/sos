"use client";

import { NextPage } from "next";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { BN } from "@coral-xyz/anchor";
import {
  createPoll,
  getCounter,
  getProvider,
} from "@/services/blockchain.service";
import { useWallet } from "@solana/wallet-adapter-react";
import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const Page: NextPage = () => {
  const { publicKey, sendTransaction, signTransaction } = useWallet();
  const [nextCount, setNextCount] = useState<BN>(new BN(0));
  const [isInitialized, setIsInitialized] = useState(false);

  const program = useMemo(
    () => getProvider(publicKey, signTransaction, sendTransaction),
    [publicKey, signTransaction, sendTransaction]
  );

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    add_candidates: true,
    withdraw_votes: true,
    withdraw_candidates: true,
  });

  useEffect(() => {
    const fetchCounter = async () => {
      if (!program) return;
      const count = await getCounter(program);
      setNextCount(count.total.add(new BN(1)));
      setIsInitialized(count.total.gte(new BN(0)));
    };

    fetchCounter();
  }, [program]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!program || !isInitialized) return;

    const {
      title,
      description,
      startDate,
      endDate,
      add_candidates,
      withdraw_votes,
      withdraw_candidates,
    } = formData;

    const startTimestamp = new Date(startDate).getTime() / 1000;
    const endTimestamp = new Date(endDate).getTime() / 1000;

    await toast.promise(
      new Promise<void>(async (resolve, reject) => {
        try {
          const tx = await createPoll(
            program!,
            publicKey!,
            nextCount,
            title,
            description,
            startTimestamp,
            endTimestamp,
            add_candidates,
            withdraw_votes,
            withdraw_candidates
          );

          setFormData({
            title: "",
            description: "",
            startDate: "",
            endDate: "",
            add_candidates: true,
            withdraw_votes: true,
            withdraw_candidates: true,
          });

          console.log(tx);
          resolve(tx as any);
        } catch (error) {
          console.error("Transaction failed:", error);
          reject(error);
        }
      }),
      {
        pending: "Approve transaction...",
        success: "Transaction successful 👌",
        error: "Encountered error 🤯",
      }
    );
  };

  return (
    <div className="flex items-center justify-center w-full min-h-screen py-24">
      <section className="w-full max-w-2xl bg-white text-black border-2 border-black shadow-[4px_4px_0_0_#000] rounded-none p-5 md:p-6 ">
        <h2 className="font-mono text-xl md:text-2xl font-bold uppercase tracking-tight">
          Create a New Poll
        </h2>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          <div className="grid gap-2">
            <Label htmlFor="title" className="uppercase font-mono">
              Title
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="e.g., Treasury allocation for Q4"
              className="rounded-none border-2 border-black shadow-[2px_2px_0_0_#000] focus-visible:ring-0"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="desc" className="uppercase font-mono">
              Description
            </Label>
            <Textarea
              id="desc"
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Briefly describe the proposal and its impact."
              className="min-h-28 rounded-none border-2 border-black shadow-[2px_2px_0_0_#000] focus-visible:ring-0"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="startsAt" className="uppercase font-mono">
              Starts At
            </Label>
            <Input
              id="starts"
              type="datetime-local"
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
              className="rounded-none border-2 border-black shadow-[2px_2px_0_0_#000] focus-visible:ring-0"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="endsAt" className="uppercase font-mono">
              Ends At
            </Label>
            <Input
              id="ends"
              type="datetime-local"
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
              className="rounded-none border-2 border-black shadow-[2px_2px_0_0_#000] focus-visible:ring-0"
            />
          </div>

          <div className="flex items-center justify-between border-2 border-black rounded-none p-3 shadow-[2px_2px_0_0_#000] bg-gray-50">
            <div className="space-y-0.5">
              <p className="uppercase font-mono font-bold">
                Allow Add Candidates
              </p>
              <p className="text-sm text-gray-700">
                Voters can propose new candidates.
              </p>
            </div>
            <Switch
              id="add_candidates"
              checked={formData.add_candidates}
              onCheckedChange={(v) =>
                setFormData({ ...formData, add_candidates: v })
              }
            />
          </div>

          <div className="flex items-center justify-between border-2 border-black rounded-none p-3 shadow-[2px_2px_0_0_#000] bg-gray-50">
            <div className="space-y-0.5">
              <p className="uppercase font-mono font-bold">
                Allow Withdraw Votes
              </p>
              <p className="text-sm text-gray-700">
                Voters can withdraw their votes.
              </p>
            </div>
            <Switch
              id="withdraw_votes"
              checked={formData.withdraw_votes}
              onCheckedChange={(v) =>
                setFormData({ ...formData, withdraw_votes: v })
              }
            />
          </div>
          <div className="flex items-center justify-between border-2 border-black rounded-none p-3 shadow-[2px_2px_0_0_#000] bg-gray-50">
            <div className="space-y-0.5">
              <p className="uppercase font-mono font-bold">
                Allow Withdraw Candidates
              </p>
              <p className="text-sm text-gray-700">
                Candidates can withdraw themselve.
              </p>
            </div>
            <Switch
              id="withdraw_candidates"
              checked={formData.withdraw_candidates}
              onCheckedChange={(v) =>
                setFormData({ ...formData, withdraw_candidates: v })
              }
            />
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <Button
              type="submit"
              disabled={!program || !isInitialized}
              className="rounded-none border-2 border-black shadow-[4px_4px_0_0_#000] bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-70"
            >
              Create Poll
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                setFormData({
                  title: "",
                  description: "",
                  startDate: "",
                  endDate: "",
                  add_candidates: true,
                  withdraw_votes: true,
                  withdraw_candidates: true,
                })
              }
              className="rounded-none border-2 border-black bg-white text-black hover:bg-gray-100 shadow-[2px_2px_0_0_#000]"
            >
              Reset
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default Page;
