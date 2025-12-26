import { use, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Chess } from "chess.js";
import { motion, AnimatePresence } from "motion/react";
import { User, Trophy, Activity } from "lucide-react";
import toast from "react-hot-toast";
import PlayerCard from "../../components/common/PlayerCard";
// import MoveTable from "../../components/MoveTable";
import {
  CHECKMATE,
  GAME_OVER,
  OPPONENT_DISCONNECTED,
  REAL_USER,
  RANDOM_USER,
  LIVE_GAME,
  LIVE_GAME_UPDATES,
} from "../../utils/message";
import useSocket from "../../hooks/useSocket";
import { useAuth } from "../../context/authContext";
import SpectatorChessboard from "../../components/features/live-game/SpectatorChessboard";
import { type Metadata } from "../../types/types";

export default function GamePage() {
  const { socket } = useSocket();
  const { gameId } = useParams();
  const navigate = useNavigate();

  const [chess, _setChess] = useState(new Chess());
  const { isAuthenticated, user } = useAuth();
  const [gameMetadata, setGameMetadata] = useState<Metadata | null>(null);
  const [board, setBoard] = useState(chess.board());
  // const [moves, setMoves] = useState<Move[]>([]);
  const [result, setResult] = useState<
    "WHITE_WINS" | "BLACK_WINS" | "DRAW" | typeof OPPONENT_DISCONNECTED | null
  >(null);

  // Scroll to bottom of move list
  // const movesEndRef = useRef<HTMLDivElement>(null);

  // useEffect(() => {
  //   if (movesEndRef.current) {
  //     movesEndRef.current.scrollIntoView({ behavior: "smooth" });
  //   }
  // }, [moves]);

  const handleJoin = () => {
    if (!socket) return;

    const payload = isAuthenticated
      ? {
          ...user,
          type: REAL_USER,
          status: "IDLE",
          gameId,
          watchingMode: "GAME",
        }
      : {
          status: "WATCHING",
          watchingMode: "GAME",
          type: RANDOM_USER,
          gameId,
        };

    socket.send(JSON.stringify({ type: LIVE_GAME, payload: payload }));
  };

  const handleMove = (move: any) => {
    if (!gameMetadata) {
      setGameMetadata({
        whitePlayer: move.player1,
        blackPlayer: move.player2,
      });
    }
    chess.load(move.board);
    setBoard(chess.board());
    // setMoves(chess.moves());
  };

  useEffect(() => {
    console.log(chess.moves());
  }, [chess]);

  const handleCheckmate = (message: any) => {
    console.log(message);
  };

  useEffect(() => {
    if (!socket) {
      return;
    }

    handleJoin();

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case LIVE_GAME_UPDATES:
          handleMove(message.payload);
          break;

        case CHECKMATE:
          handleCheckmate(message.payload);
          break;

        case GAME_OVER:
          setResult(message.payload.result);
          break;

        case OPPONENT_DISCONNECTED:
          setResult(OPPONENT_DISCONNECTED);
          toast("Opponent Disconnected", { icon: "🔌" });
          break;
      }
    };
  }, [socket, chess, navigate]);

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
            {gameMetadata?.blackPlayer?.username || "Opponent"}
          </div>
          {result && <span className="text-red-400 font-bold">{result}</span>}
        </div>

        <div className="text-white-200 text-2xl font-mono font-medium pb-2">
          {gameMetadata?.whitePlayer.username}
        </div>

        {/* The Chessboard Container */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-[90vw] object-contain lg:max-w-[600px] relative shadow-2xl rounded-sm overflow-hidden"
        >
          <SpectatorChessboard board={board} />

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

        <div className="text-white-200 text-2xl font-mono font-medium pb-2">
          {gameMetadata?.blackPlayer.username}
        </div>

        {/* Mobile: User Info Bottom */}
        <div className="lg:hidden w-full max-w-[90vw] mt-4 flex justify-between items-center text-zinc-400 text-sm">
          <div className="flex items-center gap-2">
            <User size={16} />
            {gameMetadata?.whitePlayer?.username || "You"}
          </div>
        </div>
      </div>

      {/* --- Right Section: Sidebar / HUD --- */}
      <div className="w-full lg:w-[400px] bg-zinc-900/50 border-l border-white/5 p-6 flex flex-col gap-6 lg:h-screen overflow-y-auto backdrop-blur-xl">
        {/* Header / Turn Indicator */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Chess Arena</h1>
          <AnimatePresence mode="wait">
            <motion.div
              key="turn-indicator"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-full w-fit`}
            >
              <Activity size={14} />
              players tuen
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Main Action Area */}
        {/* <div className="flex-1 flex flex-col justify-center items-center min-h-[200px]">
          <AnimatePresence mode="wait">
            <MoveTable moves={moves} endRef={movesEndRef} />
          </AnimatePresence>
        </div> */}

        {/* Desktop Player Cards */}
        {/* {gameMetadata && (
          <div className="hidden lg:flex flex-col gap-3 mt-auto">
            <PlayerCard name={gameMetadata.blackPlayer.username} isOpponent />
            <div className="h-px bg-white/10 my-1" />
            <PlayerCard name={gameMetadata.whitePlayer.username} />
          </div>
        )} */}
      </div>
    </div>
  );
}
