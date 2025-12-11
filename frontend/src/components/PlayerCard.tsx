import { User } from "lucide-react";

export default function PlayerCard({
    name,
    isOpponent = false,
  }: {
    name: string;
    isOpponent?: boolean;
  }) {
    return (
      <div
        className={`flex items-center gap-3 p-3 rounded-lg ${
          isOpponent ? "bg-zinc-800/30" : "bg-zinc-800/80"
        }`}
      >
        <div className="w-10 h-10 rounded bg-zinc-700 flex items-center justify-center text-zinc-400">
          <User size={20} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-white">{name}</p>
          <p className="text-xs text-zinc-500">
            {isOpponent ? "Opponent" : "You"}
          </p>
        </div>
      </div>
    );
  }