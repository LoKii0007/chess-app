import { motion } from "motion/react";
import type { Square } from "chess.js";

interface Move {
  from: Square;
  to: Square;
  san?: string;
}

export default function MoveTable({
  moves,
  endRef,
}: {
  moves: Move[];
  endRef: React.RefObject<HTMLDivElement | null>;
}) {
  if (moves.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col h-[300px]"
    >
      <div className="p-3 bg-zinc-800/50 border-b border-zinc-800 text-xs font-medium text-zinc-400 uppercase tracking-wider">
        Move History
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
        {moves.map((move, i) => (
          <div
            key={i}
            className="flex items-center text-sm py-1 px-2 hover:bg-zinc-800 rounded transition-colors"
          >
            <span className="text-zinc-500 w-8 font-mono">{i + 1}.</span>
            <span className="text-zinc-200">
              <span className="text-zinc-400 text-xs mr-1">FROM</span>
              {move.from}
              <span className="text-zinc-400 text-xs mx-1">TO</span>
              {move.to}
            </span>
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </motion.div>
  );
}
