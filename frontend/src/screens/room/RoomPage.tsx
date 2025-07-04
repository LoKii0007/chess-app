import { useEffect, useState } from "react";
import Chessboard from "../../components/chessboard";
import { useSocket } from "../../context/socketContext";
import { Chess } from "chess.js";
import type { Color, Square } from "chess.js";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  CHECKMATE,
  GAME_OVER,
  MOVE,
  OPPONENT_DISCONNECTED,
} from "../../components/message";
import MoveTable from "../../components/MoveTable";
import "../../css/landing.css";
import toast from "react-hot-toast";

export interface Move {
  from: Square;
  to: Square;
}

interface Metadata {
  whitePlayer: {
    id: string;
    name: string;
  };
  blackPlayer: {
    id: string;
    name: string;
  };
}

export default function RoomPage() {  
  const { socket } = useSocket();
  const { gameId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();


  const [chess, _setChess] = useState(new Chess());
  const [gameMetadata, setGameMetadata] = useState<Metadata | null>(null);
  const [board, setBoard] = useState(chess.board());
  const [moves, setMoves] = useState<Move[]>([]);
  const [playerColor, setPlayerColor] = useState<Color>();
  const [result, setResult] = useState<
    "WHITE_WINS" | "BLACK_WINS" | "DRAW" | typeof OPPONENT_DISCONNECTED | null
  >(null);

  // const

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

        case "OPPONENT_LEFT":
          toast("Opponent left the room");
          break;

        case "LEFT_ROOM":
          toast("You left the room");
          navigate("/");
          break;

        case "ROOM_DELETED":
          toast("You left the room");
          navigate("/");
          break;
      }
    };
  }, [socket, chess]);

  useEffect(() => {
    const gameData = location.state?.gameData;
    if (gameData) {
      setBoard(chess.board());
      setGameMetadata({
        whitePlayer: gameData.whitePlayer,
        blackPlayer: gameData.blackPlayer,
      });
      setPlayerColor(gameData.color);
    }
  }, [location.state, chess]);

  if (!socket) {
    return <div className="text-center">connecting...</div>;
  }

  return (
    <>
      <div className="gamePage bg-[#232528e8] h-[100vh] flex flex-col justify-evenly ">
        <div className="gamePage-top text-center text-white text-3xl ">
          <div className="player-names flex w-full text-center justify-center gap-5 md:text-2xl">
            <p>Player A</p>
            <p>vs</p>
            <p>Player B</p>
          </div>
          {result && <div className="win text-center">{result}</div>}
        </div>

        <div className="gamePage-bottom flex md:flex-row flex-col-reverse justify-center items-center">
          <div className="chessboard p-5">
            <Chessboard
              moves={moves}
              playerColor={playerColor as Color}
              setMoves={setMoves}
              chess={chess}
              board={board}
              setBoard={setBoard}
              socket={socket}
            />
          </div>

          <div className="game-details md:p-12 p-3 flex flex-col justify-evenly items-center gap-2 md:gap-5">
            <div className="turn text-xl md:text-4xl ">
              <div>
                {chess.turn() === playerColor ? (
                  <div className=" text-green-600">Your Turn</div>
                ) : (
                  <div className=" text-red-600">Opponent's Turn</div>
                )}
              </div>
            </div>

            <div className="text-center text-white hidden md:block md:text-2xl ">
              {playerColor === "b" ? "Black Player" : "White Player"}
            </div>

            <MoveTable moves={moves} />
          </div>
        </div>
      </div>
    </>
  );
}
