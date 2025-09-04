"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  TrendingUp,
  Clock,
  Users,
  CheckCircle,
  VoteIcon,
} from "lucide-react";
import { Trending } from "@/components/trending";
import { Poll } from "@/utils/interfaces";
import { PollCard } from "@/components/poll-card";
import {
  getCounter,
  getReadonlyProvider,
  getRegistrations,
  getVotes,
} from "@/services/blockchain.service";

export function ExploreSection({ polls }: { polls: Poll[] }) {
  const updatedPolls = polls.map((poll) => ({
    ...poll,
    status: poll.end > Date.now() ? "active" : "ended",
  }));

  const trendingPolls = updatedPolls.sort((a, b) => b.votes - a.votes).slice(0, 2);

  const programReadOnly = useMemo(() => getReadonlyProvider(), []);

  const fetchData = async () => {
    const count = await getCounter(programReadOnly);
    setActivePolls(count.active.toNumber());
    const votes = await getVotes(programReadOnly);
    setActiveVotes(votes.active.toNumber());
    const registrations = await getRegistrations(programReadOnly);
    setActiveRegistrations(registrations.active.toNumber());
  };

  const [activePolls, setActivePolls] = useState(0);
  const [activeRegistrations, setActiveRegistrations] = useState(0);
  const [activeVotes, setActiveVotes] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "active" | "ended"
  >("all");

  useEffect(() => {
    if (!programReadOnly) return;
    fetchData();
  }, [programReadOnly]);

  const filteredPolls = updatedPolls.filter((poll) => {
    const matchesSearch =
      poll.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      poll.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      selectedFilter === "all" || poll.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="mt-16 space-y-8 bg-white min-h-screen p-4 lg:p-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold font-mono text-black uppercase tracking-tight">
            EXPLORE POLLS
          </h1>
          <p className="text-gray-600 mt-2 font-mono text-sm uppercase tracking-wide">
            DISCOVER • PARTICIPATE • GOVERN
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge className="bg-red text-white border-2 bg-black shadow-brutal font-mono font-bold uppercase gap-2">
            <TrendingUp className="h-3 w-3" />
            {activePolls} ACTIVE POLLS
          </Badge>
          <Badge className="bg-blue text-white border-2 bg-black shadow-brutal font-mono font-bold uppercase gap-2">
            <Users className="h-3 w-3" />
            {activeRegistrations}{" "}
            CANDIDATES
          </Badge>
          <Badge className="bg-blue text-white border-2 bg-black shadow-brutal font-mono font-bold uppercase gap-2">
            <VoteIcon className="h-3 w-3" />
            {activeVotes} VOTES
          </Badge>
        </div>
      </div>

      <Card className="brutalist-card bg-white border-black shadow-brutal">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-600" />
              <Input
                placeholder="SEARCH POLLS BY TITLE OR DESCRIPTION..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 brutalist-input font-mono font-bold uppercase bg-white border-2 border-black shadow-brutal"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant={selectedFilter === "all" ? "default" : "outline"}
                onClick={() => setSelectedFilter("all")}
                size="sm"
                className={`brutalist-button font-mono font-bold uppercase ${
                  selectedFilter === "all"
                   ? "bg-yellow text-black shadow-brutal"
                    : "brutalist-button-outline"
                }`}
              >
                ALL
              </Button>
              <Button
                variant={selectedFilter === "active" ? "default" : "outline"}
                onClick={() => setSelectedFilter("active")}
                size="sm"
                className={`gap-2 brutalist-button font-mono font-bold uppercase ${
                  selectedFilter === "active"
                    ? "bg-gray-400 text-black shadow-brutal"
                    : "brutalist-button-outline"
                }`}
              >
                <Clock className="h-3 w-3" />
                ACTIVE
              </Button>
              <Button
                variant={selectedFilter === "ended" ? "default" : "outline"}
                onClick={() => setSelectedFilter("ended")}
                size="sm"
                className={`gap-2 brutalist-button font-mono font-bold uppercase ${
                  selectedFilter === "ended"
                    ? "bg-gray-400 text-black shadow-brutal"
                    : "brutalist-button-outline"
                }`}
              >
                <CheckCircle className="h-3 w-3" />
                ENDED
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Trending polls={trendingPolls} />

      <div>
        <div className="flex flex-col justify-center gap-3 mb-6">
          <h2 className="text-2xl font-bold font-mono text-black uppercase tracking-tight">
            ALL POLLS
          </h2>
          <div className="flex-1 h-1 bg-black"></div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {filteredPolls.map((poll) => (
            <PollCard key={poll.id} poll={poll} />
          ))}
        </div>
      </div>
    </div>
  );
}
