"use client";
import {DashboardSection  } from "@/components/dashboard-section";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import {
  fetchAllPolls,
  getProvider,
  getReadonlyProvider,
} from "@/services/blockchain.service";
import { Poll } from "@/utils/interfaces";
import { useMemo } from "react";
import { Program } from "@coral-xyz/anchor";
import { Votana } from "@/types/votana";

export default function Dashboard() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const { publicKey, signTransaction, sendTransaction } = useWallet();
  const programReadOnly = useMemo(() => getReadonlyProvider(), []);

  const program = useMemo(
    () => getProvider(publicKey, signTransaction, sendTransaction),
    [publicKey, signTransaction, sendTransaction]
  );

  const fetchData = async () => {
    fetchAllPolls(programReadOnly).then((data) => setPolls(data as any));
};

  useEffect(() => {
    if (!programReadOnly) return;
    fetchData();
  }, [programReadOnly]);
  return <div className="flex flex-col items-center justify-center w-full min-h-screen p-4"><DashboardSection program={program as Program<Votana>} polls={polls as Poll[]} /></div>;
}
