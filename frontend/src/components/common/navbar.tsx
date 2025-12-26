import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
// import { useAuth } from "../context/authContext";

export default function Navbar() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // const { isAuthenticated, user, logout } = useAuth();

  const handleNavClick = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/5 bg-zinc-950/60 backdrop-blur-md"
    >
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate("/")}
        className="text-lg sm:text-xl font-bold tracking-tighter text-white cursor-pointer select-none"
      >
        CHESS
      </motion.div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-3">
        {/* {isAuthenticated ? ( */}
        <>
          {/* <span className="text-sm text-zinc-400 hidden sm:block">
              {user?.fName} {user?.lName}
            </span> */}

          <motion.button
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
            onClick={() => navigate("/live-games")}
            className="px-5 py-2 rounded-full text-sm hover:scale-105 hover:font-medium text-zinc-400 bg-transparent border border-zinc-800 hover:text-white transition-all"
          >
            Spectate
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
            onClick={() => navigate("/room/join")}
            className="px-5 py-2 rounded-full text-sm hover:scale-105 hover:font-medium text-zinc-400 bg-transparent border border-zinc-800 hover:text-white transition-all"
          >
            Join Room
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/room/create")}
            className="px-5 py-2 rounded-full text-sm font-medium text-zinc-900 bg-zinc-100 hover:bg-white transition-colors"
          >
            Private Room
          </motion.button>

          {/* <motion.button
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
              onClick={logout}
              className="px-5 py-2 rounded-full text-sm hover:scale-105 hover:font-medium text-zinc-400 bg-transparent border border-zinc-800 hover:text-white transition-all"
            >
              Logout
            </motion.button> */}
        </>
        {/* ) : (
          <>
            <button>
              <Link to={"/live-games"}>Live games</Link>
            </button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
              onClick={() => navigate("/login")}
              className="px-5 py-2 rounded-full text-sm hover:scale-105 hover:font-medium text-zinc-400 bg-transparent border border-zinc-800 hover:text-white transition-all"
            >
              Login
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/register")}
              className="px-5 py-2 rounded-full text-sm font-medium text-zinc-900 bg-zinc-100 hover:bg-white transition-colors"
            >
              Sign Up
            </motion.button>
          </> */}
        {/* )} */}
      </div>

      {/* Mobile Menu Button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors"
        aria-label="Toggle menu"
      >
        <AnimatePresence mode="wait">
          {isMobileMenuOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X size={24} />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Menu size={24} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-md md:hidden w-screen z-100"
              style={{ top: "73px" }}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-[70px] right-0 w-full h-screen bg-zinc-950 backdrop-blur-md border-l border-white/5 md:hidden z-50 overflow-y-auto"
            >
              <div className="flex flex-col p-4 gap-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleNavClick("/live-games")}
                  className="w-full px-5 py-3 rounded-lg text-sm text-left hover:font-medium text-zinc-400 bg-transparent border border-zinc-800 hover:text-white hover:bg-zinc-900/50 transition-all"
                >
                  Spectate
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleNavClick("/room/join")}
                  className="w-full px-5 py-3 rounded-lg text-sm text-left hover:font-medium text-zinc-400 bg-transparent border border-zinc-800 hover:text-white hover:bg-zinc-900/50 transition-all"
                >
                  Join Room
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleNavClick("/room/create")}
                  className="w-full px-5 py-3 rounded-lg text-sm text-left font-medium text-zinc-900 bg-zinc-100 hover:bg-white transition-colors"
                >
                  Private Room
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
