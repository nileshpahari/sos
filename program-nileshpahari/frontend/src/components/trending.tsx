import { TrendingUp } from "lucide-react";
import { PollCard } from "./poll-card";

export function Trending({ polls }: { polls: any[] }) {
    return (
        <div>
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="h-6 w-6 text-red" />
          <h2 className="text-2xl font-bold font-mono text-black uppercase tracking-tight">TRENDING NOW</h2>
          <div className="flex-1 h-1 bg-red"></div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {polls
            .map((poll: any) => (
              <PollCard key={poll.id} poll={poll} />
            ))}
        </div>
      </div>)}