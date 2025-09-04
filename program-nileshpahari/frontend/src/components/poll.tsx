import { Poll } from "@/utils/interfaces"
import { Candidate } from "@/utils/interfaces"
import { useMemo } from "react"

function shortenAddress(addr: string, left = 4, right = 4) {
  if (!addr || addr.length <= left + right + 3) return addr
  return `${addr.slice(0, left)}...${addr.slice(-right)}`
}

export function ViewPoll({
  poll,
  candidates,
}: {
  poll: Poll
  candidates: Candidate[]
}) {
  const timeLeft = useMemo(() => {
    if (!poll.end) return null
    const ms = new Date(poll.end).getTime() - Date.now()
    if (ms <= 0) return "Ended"
    const days = Math.floor(ms / (1000 * 60 * 60 * 24))
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24)
    return `${days}d ${hours}h left`
  }, [poll.end])

  return (
    <section
      className="w-full max-w-12xl bg-white text-black border-2 border-black shadow-[4px_4px_0_0_#000] rounded-none p-5 md:p-6"
      aria-labelledby="poll-title"
    >
      <header className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <h2
            id="poll-title"
            className="font-mono text-xl md:text-2xl font-bold uppercase tracking-tight"
          >
            {poll.title}
          </h2>
          <p className="text-sm leading-6 text-gray-700">{poll.description}</p>
          <div>Candidates: {candidates.length}</div>
          <div>Votes: {poll.votes.toLocaleString()}</div>

          <div className="flex flex-col gap-2 mb-2">
            <div className="border-2 border-black px-2 py-1 rounded-none bg-white shadow-[2px_2px_0_0_#000]">
              <span className="text-gray-900 italic">Starts:</span>{" "}
              {new Date(poll.start).toLocaleString()}
            </div>
            <div className="border-2 border-black px-2 py-1 rounded-none bg-white shadow-[2px_2px_0_0_#000]">
              <span className="text-gray-900 italic">Ends:</span>{" "}
              {new Date(poll.end).toLocaleString()}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="inline-flex items-center gap-1 border-2 border-black px-2 py-1 rounded-none bg-gray-100 shadow-[2px_2px_0_0_#000]">
              By{" "}
              <span className="font-semibold text-gray-700">
                {shortenAddress(poll.creator)}
              </span>
            </span>

            {timeLeft && (
              <span className="inline-flex items-center gap-1 border-2 border-black px-2 py-1 rounded-none bg-yellow-200 shadow-[2px_2px_0_0_#000]">
                {timeLeft}
              </span>
            )}
          </div>
        </div>
      </header>
    </section>
  )
}
