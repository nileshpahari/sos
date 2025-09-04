"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar } from "lucide-react";
import { getStatusColor } from "@/lib/getStatusColor";
import { Poll } from "@/utils/interfaces";
import { useRouter } from "next/navigation";

export function PollCard({ poll }: { poll: Poll }) {
  const router = useRouter();
  return (
    <Card
      key={poll.id}
      className="brutalist-card bg-white border-black shadow-brutal hover:shadow-brutal-hover transition-shadow duration-200"
    >
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge
                className={`font-mono font-bold uppercase ${getStatusColor(
                  poll.end > Date.now() ? "active" : "ended"
                )}`}
              >
                {poll.end > Date.now() ? "active" : "ended"}
              </Badge>
            </div>

            <h3 className="font-mono font-bold text-lg mb-1 text-black uppercase">
              {poll.title}
            </h3>
            <p className="text-sm text-gray-600 mb-3 line-clamp-1 font-sans">
              {poll.description.length > 20
                ? poll.description.slice(0, 25) + "..."
                : poll.description}
            </p>

            <div className="flex items-center gap-4 text-sm text-gray-700 font-mono font-bold uppercase">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {poll.candidates.toLocaleString()} CANDIDATES
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {poll.votes.toLocaleString()} VOTES
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                ENDS {new Date(poll.end).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => router.push(`/polls/${poll.publicKey}`)}
              className={` cursor-pointer brutalist-button font-mono font-bold uppercase border-2 border-black shadow-brutal bg-gray-300 text-black hover:bg-gray-400 hover:text-white`}
            >
              VIEW
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
