import { useEffect, useState } from "react";
import useSocket from "../../hooks/useSocket";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import { AnimatePresence, motion } from "motion/react";
import { Users, Clock, Swords, AlertCircle, Loader2, Play } from "lucide-react";
import { REAL_USER, RANDOM_USER, LIVE_GAMES_LIST } from "../../utils/message";

interface LiveGame {
  gameId: string;
  player1: {
    id: string;
    username: string;
  };
  player2: {
    id: string;
    username: string;
  };
  startTime: string | Date;
}

const GameListPage = () => {
  const { socket, isConnected } = useSocket();
  const [liveGames, setLiveGames] = useState<LiveGame[]>([]);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!socket) return;

    const payload = isAuthenticated
      ? {
          ...user,
          type: REAL_USER,
          status: "WATCHING",
          watchingMode: "GAMES_LIST",
        }
      : {
          status: "WATCHING",
          type: RANDOM_USER,
          watchingMode: "GAMES_LIST",
        };

    socket.send(
      JSON.stringify({
        type: LIVE_GAMES_LIST,
        payload,
      })
    );

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      switch (message?.type) {
        case LIVE_GAMES_LIST:
          setLiveGames(message.payload);
          break;
      }
    };
  }, [socket, isAuthenticated, user]);

  const handleGame = (game: LiveGame) => {
    navigate("/live-games/" + game.gameId);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };


  if (!isConnected) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-400">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-zinc-100" />
        <p className="text-lg">Connecting to server...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pt-[70px] p-6">
      <div className="max-w-6xl mx-auto pt-6">
        <div className="mb-10">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent mb-2"
          >
            Live Games
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-zinc-400"
          >
            Watch top players compete in real-time
          </motion.p>
        </div>

        {Array.isArray(liveGames) && liveGames.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 bg-zinc-900/30 border border-zinc-800/50 rounded-2xl backdrop-blur-sm"
          >
            <div className="bg-zinc-800/50 p-4 rounded-full mb-4">
              <AlertCircle className="w-8 h-8 text-zinc-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No games in progress</h3>
            <p className="text-zinc-500">Check back later for live matches</p>
          </motion.div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <AnimatePresence>
              {Array.isArray(liveGames) &&
                liveGames.map((game) => (
                  <motion.div
                    key={game.gameId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleGame(game)}
                    className="group cursor-pointer bg-zinc-900/50 border text-white/90 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50 rounded-xl p-6 transition-all duration-300 backdrop-blur-sm"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-2 text-xs font-medium px-2.5 py-1 rounded-full bg-red-500/10 text-red-500 border border-red-500/20">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        LIVE
                      </div>
                      <div className="flex items-center gap-1.5 text-white text-xs font-mono">
                        <Clock size={14} />
                        {game.startTime
                          ? new Date(game.startTime).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Local"}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 mb-6">
                      <div className="flex flex-col items-center gap-2 flex-1">
                        <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center group-hover:bg-zinc-700 group-hover:text-white transition-colors">
                          <Users size={20} />
                        </div>
                        <span
                          className="font-medium truncate w-full text-center text-sm"
                          title={game?.player1?.username}
                        >
                          {game?.player1?.username || "Unknown"}
                        </span>
                      </div>

                      <div className="flex flex-col items-center gap-1">
                        <Swords className="w-6 h-6 text-white/80 group-hover:text-white transition-colors" />
                        <span className="text-[10px] uppercase tracking-wider text-zinc-600 font-bold">
                          VS
                        </span>
                      </div>

                      <div className="flex flex-col items-center gap-2 flex-1">
                        <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center group-hover:bg-zinc-700 group-hover:text-white transition-colors">
                          <Users size={20} />
                        </div>
                        <span
                          className="font-medium truncate w-full text-center text-sm"
                          title={game?.player2?.username}
                        >
                          {game?.player2?.username || "Unknown"}
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-zinc-800 group-hover:border-zinc-700 transition-colors flex justify-center">
                      <button className="flex items-center gap-2 text-sm font-medium text-white/90 group-hover:text-white transition-colors">
                        <Play size={16} className="fill-current" />
                        Watch Game
                      </button>
                    </div>
                  </motion.div>
                ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default GameListPage;
