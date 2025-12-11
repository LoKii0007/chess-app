import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <motion.nav
      // Slide down and fade in on load
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-zinc-950/60 backdrop-blur-md"
    >
      {/* Logo */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate("/")}
        className="text-xl font-bold tracking-tighter text-white cursor-pointer select-none"
      >
        CHESS
      </motion.div>

      {/* Buttons */}
      <div className="flex items-center gap-3">
        {/* Secondary Button: Join Room */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
          onClick={() => navigate("/join/room")}
          className="px-5 py-2 rounded-full text-sm hover:scale-105 hover:font-medium text-zinc-400 bg-transparent border border-zinc-800 hover:text-white transition-all"
        >
          Join Room
        </motion.button>

        {/* Primary Button: Private Room */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/create/room")}
          className="px-5 py-2 rounded-full text-sm font-medium text-zinc-900 bg-zinc-100 hover:bg-white transition-colors"
        >
          Private Room
        </motion.button>
      </div>
    </motion.nav>
  );
}