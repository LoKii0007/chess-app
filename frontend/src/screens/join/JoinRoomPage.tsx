import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  INIT_GAME,
  JOIN_ROOM,
  ROOM_JOINED,
  ERROR,
  ROOM_NOT_FOUND,
  ROOM_FULL,
  OPPONENT_LEFT,
  LEFT_ROOM,
  ROOM_DELETED,
  LEAVE_ROOM,
} from "../../utils/message";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, KeyRound, LogIn, Loader2, DoorOpen } from "lucide-react";
import { getSocket } from "../../lib/socket";

const JoinRoomPage = () => {
  const [roomId, setRoomId] = useState("");
  const { socket } = getSocket();
  const navigate = useNavigate();
  const [roomJoined, setRoomJoined] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Socket Logic ---
  const handleJoinRoom = () => {
    if (!socket) return;

    if (!roomId || roomId.length < 5) {
      toast.error("Please enter a valid room ID");
      return;
    }

    setIsSubmitting(true);
    socket.send(JSON.stringify({ type: JOIN_ROOM, payload: { roomId } }));
  };

  useEffect(() => {
    if (!socket) return;

    const handleSocketMessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data);

      // Stop loading state on response
      if (
        message.type === ERROR ||
        message.type === ROOM_NOT_FOUND ||
        message.type === ROOM_FULL
      ) {
        setIsSubmitting(false);
      }

      switch (message.type) {
        case ROOM_JOINED:
          toast.success("Joined room successfully", { icon: "👋" });
          setRoomJoined(true);
          break;
        case INIT_GAME:
          navigate(`/room/${message.payload.gameId}`, {
            state: { gameData: message.payload },
          });
          break;
        case ERROR:
          toast.error(message.payload || "Connection error");
          break;
        case ROOM_NOT_FOUND:
          toast.error("Room not found. Check the ID.");
          break;
        case ROOM_FULL:
          toast.error("This room is already full.");
          break;
        case OPPONENT_LEFT:
          toast("Host left the room", { icon: "🚪" });
          setRoomJoined(false); // Reset to input view
          break;
        case LEFT_ROOM:
        case ROOM_DELETED:
          navigate("/");
          break;
      }
    };

    socket.addEventListener("message", handleSocketMessage);
    return () => socket.removeEventListener("message", handleSocketMessage);
  }, [socket, navigate]);

  const handleLeaveRoom = () => {
    if (roomJoined && socket) {
      socket.send(JSON.stringify({ type: LEAVE_ROOM, payload: { roomId } }));
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 relative overflow-hidden pt-[70px]">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-zinc-800/20 rounded-full blur-[100px]" />
      </div>

      {/* Back / Leave Button */}
      <motion.button
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        onClick={handleLeaveRoom}
        className="absolute top-[82px] left-6 flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group z-50"
      >
        <div className="p-2 rounded-full bg-zinc-900 border border-zinc-800 group-hover:bg-zinc-800 transition-colors">
          <ArrowLeft size={18} />
        </div>
        <span className="font-medium text-sm">
          {roomJoined ? "Leave Room" : "Back to Home"}
        </span>
      </motion.button>

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10">
        <AnimatePresence mode="wait">
          {/* STATE 1: Input Form */}
          {!roomJoined ? (
            <motion.div
              key="input-view"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0, filter: "blur(10px)" }}
              className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-2xl p-8 shadow-2xl"
            >
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mb-6 text-zinc-400">
                  <KeyRound size={32} />
                </div>
                <h1 className="text-2xl font-bold tracking-tight mb-2">
                  Join Private Room
                </h1>
                <p className="text-zinc-400 text-sm">
                  Enter the Room ID shared by your friend to start the game.
                </p>
              </div>

              <div className="space-y-4">
                <div className="relative group">
                  <input
                    className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 px-4 py-4 rounded-xl focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all font-mono tracking-wider text-center placeholder:text-zinc-600 placeholder:font-sans"
                    type="text"
                    placeholder="Paste Room ID here..."
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value.trim())}
                    onKeyDown={(e) => e.key === "Enter" && handleJoinRoom()}
                  />
                  {/* Subtle icon inside input */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none group-focus-within:text-zinc-400 transition-colors">
                    <DoorOpen size={18} />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={!roomId || isSubmitting}
                  onClick={handleJoinRoom}
                  className={`w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                    roomId
                      ? "bg-zinc-100 text-zinc-950 hover:bg-white shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                      : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                  }`}
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      Join Room <LogIn size={18} />
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          ) : (
            /* STATE 2: Waiting for Host */
            <motion.div
              key="waiting-view"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-2xl p-8 text-center shadow-2xl"
            >
              <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                {/* Pulsing rings */}
                <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
                <div className="relative w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center border border-zinc-700">
                  <Loader2 size={32} className="text-green-500 animate-spin" />
                </div>
              </div>

              <h2 className="text-xl font-bold text-white mb-2">Connected!</h2>
              <p className="text-zinc-400 mb-6">
                Waiting for the host to start the game...
              </p>

              <div className="bg-zinc-950/50 rounded-lg p-4 border border-zinc-800/50">
                <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">
                  Room ID
                </p>
                <p className="font-mono text-zinc-300 text-sm break-all">
                  {roomId}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default JoinRoomPage;
