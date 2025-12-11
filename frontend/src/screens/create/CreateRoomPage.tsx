import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../../context/socketContext";
import { INIT_GAME } from "../../components/message";
import { motion, AnimatePresence } from "motion/react";
import { Copy, Check, ArrowLeft, Loader2, Users, Gamepad2 } from "lucide-react";

const CreateRoomPage = () => {
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [canStartGame, setCanStartGame] = useState(false);
  const [isRoomCreated, setIsRoomCreated] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [copied, setCopied] = useState(false);

  // --- Socket Logic (Preserved) ---
  const handleCreateRoom = () => {
    socket?.send(JSON.stringify({ type: "CREATE_ROOM" }));
  };

  useEffect(() => {
    if (!socket) return;

    const handleSocketMessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);

        switch (message.type) {
          case "ROOM_CREATED":
            setIsRoomCreated(true);
            setRoomId(message.payload);
            break;
          case "ROOM_JOINED":
            if (message.payload === roomId) {
              setCanStartGame(true);
              toast.success("Opponent joined!", { icon: "⚔️" });
            }
            break;
          case INIT_GAME:
            toast.success("Game starting...");
            navigate(`/room/${message.payload.gameId}`, {
              state: { gameData: message.payload },
            });
            break;
          case "OPPONENT_LEFT":
            setCanStartGame(false);
            toast("Opponent left the room", { icon: "🚪" });
            break;
          case "LEFT_ROOM":
          case "ROOM_DELETED":
            navigate("/");
            break;
          case "ERROR":
            toast.error(message.payload);
            if (message.payload === "Room not found") navigate("/");
            break;
        }
      } catch (error) {
        console.error(error);
      }
    };

    socket.addEventListener("message", handleSocketMessage);
    return () => socket.removeEventListener("message", handleSocketMessage);
  }, [socket, navigate, roomId]);

  const handleStartGame = () => {
    if (!socket || !canStartGame) return;
    socket.send(JSON.stringify({ type: "START_GAME", payload: { roomId } }));
  };

  const handleLeaveRoom = () => {
    if (socket && roomId) {
      socket.send(JSON.stringify({ type: "LEAVE_ROOM", payload: { roomId } }));
    } else {
      navigate("/");
    }
  };

  // --- UI Helpers ---
  const copyToClipboard = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-zinc-800/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-zinc-800/20 rounded-full blur-[100px]" />
      </div>

      {/* Back Button */}
      <motion.button
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        onClick={handleLeaveRoom}
        className="absolute top-6 left-6 flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group z-50"
      >
        <div className="p-2 rounded-full bg-zinc-900 border border-zinc-800 group-hover:bg-zinc-800 transition-colors">
            <ArrowLeft size={18} />
        </div>
        <span className="font-medium text-sm">Leave Room</span>
      </motion.button>

      {/* Main Card */}
      <div className="w-full max-w-md relative z-10">
        <AnimatePresence mode="wait">
          
          {/* STATE 1: Initial "Create Room" View */}
          {!isRoomCreated ? (
            <motion.div
              key="create-view"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0, filter: "blur(10px)" }}
              className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-2xl p-8 text-center shadow-2xl"
            >
              <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-6 text-zinc-400">
                <Gamepad2 size={32} />
              </div>
              
              <h1 className="text-3xl font-bold tracking-tight mb-2">Private Room</h1>
              <p className="text-zinc-400 mb-8">
                Create a secure room and share the ID with a friend to play a private match.
              </p>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCreateRoom}
                className="w-full py-3.5 bg-zinc-100 text-zinc-950 rounded-xl font-semibold text-lg hover:bg-white transition-colors shadow-lg shadow-white/5"
              >
                Create Room
              </motion.button>
            </motion.div>
          ) : (
            
            /* STATE 2: "Room Created / Waiting" View */
            <motion.div
              key="waiting-view"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-2xl p-8 shadow-2xl"
            >
              {/* Header Status */}
              <div className="flex flex-col items-center mb-8">
                <div className={`w-3 h-3 rounded-full mb-3 ${canStartGame ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-yellow-500 animate-pulse'}`} />
                <h2 className="text-xl font-semibold">
                  {canStartGame ? "Opponent Ready!" : "Waiting for Opponent..."}
                </h2>
                <p className="text-zinc-500 text-sm mt-1">
                  {canStartGame ? "You can start the game now." : "Share the ID below to invite a friend."}
                </p>
              </div>

              {/* Room ID Copy Section */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 mb-8 flex items-center justify-between group">
                <div className="flex flex-col">
                  <span className="text-xs text-zinc-500 font-mono uppercase tracking-wider mb-1">Room ID</span>
                  <span className="text-xl font-mono tracking-widest text-zinc-200 select-all">{roomId}</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={copyToClipboard}
                  className="p-2.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors relative"
                >
                  {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                  
                  {/* Tooltip on copy */}
                  <AnimatePresence>
                    {copied && (
                      <motion.span 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: -54 }}
                        exit={{ opacity: 0 }}
                        className="absolute left-1/2 -translate-x-1/2 text-xs bg-black px-2 py-1 rounded text-white pointer-events-none whitespace-nowrap"
                      >
                        Copied!
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>

              {/* Start Game Button */}
              <motion.button
                disabled={!canStartGame}
                whileHover={canStartGame ? { scale: 1.02 } : {}}
                whileTap={canStartGame ? { scale: 0.98 } : {}}
                onClick={handleStartGame}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 ${
                  canStartGame
                    ? "bg-zinc-100 text-zinc-950 cursor-pointer hover:bg-white shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                    : "bg-zinc-800/50 text-zinc-500 cursor-not-allowed"
                }`}
              >
                {canStartGame ? (
                  <>Start Match <ArrowLeft className="rotate-180" size={18} /></>
                ) : (
                  <><Loader2 className="animate-spin" size={18} /> Waiting...</>
                )}
              </motion.button>

              {/* Player Count Indicator */}
              <div className="mt-6 flex justify-center gap-2">
                <div className="flex items-center gap-2 text-sm text-zinc-400 bg-zinc-800/50 px-3 py-1 rounded-full">
                  <Users size={14} />
                  <span>{canStartGame ? "2/2 Players" : "1/2 Players"}</span>
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CreateRoomPage;