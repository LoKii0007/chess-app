import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import type { Variants } from "motion/react";
import { ArrowRight } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  // 1. Container Variants (Stagger children)
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      filter: "blur(10px)",
      y: 20,
    },
    show: {
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  const buttonHoverVariants = {
    initial: {
      backgroundColor: "#f4f4f5",
      color: "#18181b",
      scale: 1,
    },
    hover: {
      scale: 1.05,
      backgroundColor: "#ffffff",
      color: "#000000",
      boxShadow: "0px 0px 30px rgba(255,255,255,0.2)",
      transition: { duration: 0.3 },
    },
    tap: { scale: 0.95 },
  };

  const arrowVariants: Variants = {
    initial: { x: -10, opacity: 0, width: 0 },
    hover: {
      x: 0,
      opacity: 1,
      width: "auto",
      transition: { type: "spring", stiffness: 300, damping: 20 },
    },
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-white selection:text-black overflow-hidden flex flex-col pt-[70px]">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex-1 grid grid-cols-1 lg:grid-cols-2 max-w-7xl mx-auto w-full px-6 lg:px-12 items-center justify-items-center gap-12 lg:gap-0"
      >
        <motion.div
          variants={itemVariants}
          className="w-full flex justify-center items-center relative order-last lg:order-first pb-12 lg:pb-0"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-zinc-800/30 to-transparent rounded-full blur-[100px] scale-75 pointer-events-none" />

          <motion.img
            src="/chessboard.png"
            className="w-full max-w-md lg:max-w-xl object-contain relative z-10 drop-shadow-2xl grayscale-[20%] hover:grayscale-0 hover:scale-105 hover:-rotate-2 transition-all ease-in-out duration-300"
            alt="Chessboard"
          />
        </motion.div>

        <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-8 z-10">
          <motion.div variants={itemVariants} className="space-y-4">
            <h1 className="text-5xl lg:text-7xl font-thin tracking-tight leading-[1.1]">
              Master the <br />
              <span className="font-bold text-white">Classic Game</span>
            </h1>
            <p className="text-zinc-500 text-lg lg:text-xl font-light max-w-md mx-auto lg:mx-0">
              Play effortlessly. A minimal interface designed for focus,
              strategy, and pure chess.
            </p>
          </motion.div>

          <motion.button
            variants={itemVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            onClick={() => navigate(`/game/random`)}
            className="group relative px-10 py-4 bg-zinc-100 text-zinc-900 rounded-full hover:cursor-pointer font-medium text-lg tracking-wide overflow-hidden flex items-center gap-2"
          >
            <motion.span
              variants={buttonHoverVariants}
              className="absolute inset-0 -z-10 rounded-full"
            />

            <span className="relative z-10">Play Random</span>

            <motion.div variants={arrowVariants}>
              <ArrowRight size={20} strokeWidth={2} />
            </motion.div>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default Landing;
