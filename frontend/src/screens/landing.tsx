import { useNavigate } from "react-router-dom";
import "../css/landing.css";
import Navbar from "../components/navbar";

const Landing = () => {
  const navigate = useNavigate();
  return (
    <>
      <Navbar />
      <div className="chess h-screen flex flex-row justify-center items-center bg-zinc-600">
        <div className="chess-left">
          <img src="/chessboard.png" className="w-[25vw]" alt="" />
        </div>
        <div className="chess-right w-[40vw] h-full flex flex-col justify-center items-center">
          <button
            onClick={() => navigate(`/game/random`)}
            className=" rounded-full play-btn px-10 py-4 bg-zinc-800 text-white cursor-pointer hover:bg-zinc-900"
          >
            Play Random
          </button>
        </div>
      </div>
    </>
  );
};

export default Landing;
