import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Chess, type Color } from "chess.js";
import { motion, AnimatePresence } from "motion/react";
import { User, Trophy, Activity } from "lucide-react";
import toast from "react-hot-toast";
import Chessboard from "../../components/common/chessboard";
import MoveTable from "../../components/common/MoveTable";
import PlayerCard from "../../components/common/PlayerCard";
import {
  CHECKMATE,
  GAME_OVER,
  MOVE,
  OPPONENT_DISCONNECTED,
  OPPONENT_LEFT,
  LEFT_ROOM,
  ROOM_DELETED,
} from "../../utils/message";
import { getSocket } from "../../lib/socket";
import { type Move } from "../../types/types";

export default function RoomPage() {
  const { socket } = getSocket();
  const location = useLocation();
  const navigate = useNavigate();
  const { gameId } = useParams();

  const [chess, _setChess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board());
  const [moves, setMoves] = useState<Move[]>([]);
  const [playerColor, setPlayerColor] = useState<Color>();
  const [result, setResult] = useState<
    "WHITE_WINS" | "BLACK_WINS" | "DRAW" | typeof OPPONENT_DISCONNECTED | null
  >(null);

  // Scroll to bottom of move list
  const movesEndRef = useRef<HTMLDivElement>(null);

  // useEffect(() => {
  //   if (movesEndRef.current) {
  //     movesEndRef.current.scrollIntoView({ behavior: "smooth" });
  //   }
  // }, [moves]);

  useEffect(() => {
    if (!socket) {
      return;
    }

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case MOVE:
          const move = message.payload;
          chess.move(move);
          setBoard(chess.board());
          setMoves((moves) => [...moves, move]);
          break;

        case CHECKMATE:
          toast.error("check by opponent");
          break;

        case GAME_OVER:
          setResult(message.payload.result);
          break;

        case OPPONENT_LEFT:
          toast("Opponent left the room");
          break;

        case LEFT_ROOM:
          toast("You left the room");
          navigate("/");
          break;

        case ROOM_DELETED:
          toast("You left the room");
          navigate("/");
          break;
      }
    };
  }, [socket, chess, navigate]);

  useEffect(() => {
    const gameData = location.state?.gameData;
    if (gameData) {
      setBoard(chess.board());
      setPlayerColor(gameData.color);
    }
  }, [location.state, chess]);

  if (!socket) {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-950 text-zinc-500">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          Connecting to server...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col lg:flex-row pt-[70px]">
      {/* --- Left / Top Section: The Board --- */}
      <div className="flex-1 flex flex-col justify-center items-center p-4 lg:p-8 relative">
        {/* Mobile: Opponent Info Top */}
        <div className="lg:hidden w-full max-w-[90vw] mb-4 flex justify-between items-center text-zinc-400 text-sm">
          <div className="flex items-center gap-2">
            <User size={16} />
            Player A
          </div>
          {result && <span className="text-red-400 font-bold">{result}</span>}
        </div>

        <div className="text-white-200 text-2xl font-mono font-medium pb-2">
          {playerColor === "b" && "You"}
        </div>

        {/* The Chessboard Container */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-[90vw] object-contain lg:max-w-[600px] relative shadow-2xl rounded-sm overflow-hidden"
        >
          <Chessboard
            moves={moves}
            playerColor={playerColor as Color}
            setMoves={setMoves}
            chess={chess}
            board={board}
            setBoard={setBoard}
            socket={socket}
            gameId={gameId}
          />

          {/* Overlay for Game Over */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6"
              >
                <Trophy size={48} className="text-yellow-500 mb-4" />
                <h2 className="text-3xl font-bold text-white mb-2">
                  {result.replace("_", " ")}
                </h2>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-6 py-2 bg-white text-black rounded-full hover:scale-105 transition-transform font-medium"
                >
                  Play Again
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="text-white-200 text-2xl font-mono font-medium pt-2">
          {playerColor === "w" && "You"}
        </div>

        {/* Mobile: User Info Bottom */}
        <div className="lg:hidden w-full max-w-[90vw] mt-4 flex justify-between items-center text-zinc-400 text-sm">
          <div className="flex items-center gap-2">
            <User size={16} />
            Player B
          </div>
        </div>
      </div>

      {/* --- Right Section: Sidebar / HUD --- */}
      <div className="w-full lg:w-[400px] bg-zinc-900/50 border-l border-white/5 p-6 flex flex-col gap-6 lg:h-screen overflow-y-auto backdrop-blur-xl">
        {/* Header / Turn Indicator */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Chess Arena</h1>
          <AnimatePresence mode="wait">
            {playerColor && (
              <motion.div
                key="turn-indicator"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-full w-fit ${
                  chess.turn() === playerColor
                    ? "bg-green-500/10 text-green-400"
                    : "bg-red-500/10 text-red-400"
                }`}
              >
                <Activity size={14} />
                {chess.turn() === playerColor ? "Your Turn" : "Opponent's Turn"}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Main Action Area */}
        <div className="flex-1 flex flex-col justify-center items-center min-h-[200px]">
          {moves.length > 0 ? (
            <MoveTable moves={moves} endRef={movesEndRef} />
          ) : (
            <div className="text-zinc-500 text-sm text-center">
              Make your first move
            </div>
          )}
        </div>

        {/* Desktop Player Cards */}
        <div className="hidden lg:flex flex-col gap-3 mt-auto">
          <PlayerCard name="Player A" isOpponent />
          <div className="h-px bg-white/10 my-1" />
          <PlayerCard name="Player B" />
        </div>
      </div>
    </div>
  );
}
