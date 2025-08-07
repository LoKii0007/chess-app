import { useNavigate } from "react-router-dom";
import "../css/landing.css";
import Navbar from "../components/navbar";

const Landing = () => {
  const navigate = useNavigate();
  return (
    <>
      <Navbar />
      <div className="chess h-screen grid grid-cols-1 lg:grid-cols-12 justify-center items-center bg-zinc-600 p-5 lg:p-12">
        <div className="flex col-span-8 justify-center items-center">
          <img src="/chessboard.png" className="w-3/4 max-h-[70vh]" alt="" />
        </div>
        <div className="h-full grid col-span-4 justify-center items-start lg:justify-start lg:items-center">
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
