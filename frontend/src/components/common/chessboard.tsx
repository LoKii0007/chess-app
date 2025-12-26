import { type Square, type PieceSymbol, type Color } from "chess.js";
import { useState } from "react";
import { type Move } from "../../types/types";
import { MOVE } from "../../utils/message";
import toast from "react-hot-toast";

export default function Chessboard({
  playerColor,
  board,
  socket,
  chess,
  setBoard,
  setMoves,
  gameId,
}: {
  chess: any;
  // myColor: Color
  playerColor: Color;
  moves: Move[];
  socket: WebSocket;
  setMoves: React.Dispatch<React.SetStateAction<Move[]>>;
  board: ({
    square: Square;
    type: PieceSymbol;
    color: Color;
  } | null)[][];
  setBoard: any;
  gameId: string | undefined;
}) {
  const [from, setFrom] = useState<null | Square>(null);

  console.log(gameId)

  // const isMyTurn = myColor === chess.turn()
  const isMyTurn = playerColor === chess.turn();

  const handleMove = (from: Square | null, to: Square, square: any) => {
    {
      if (!from && square.color !== chess.turn()) {
        return;
      }
      if (!isMyTurn) {
        return;
      }
      if (from === to) {
        setFrom(null);
      }
      //update this
      if (from && square?.color === playerColor && square.type) {
        setFrom(to);
      }
      if (!from) {
        setFrom(to);
      } else if (
        (from && square?.color === undefined) ||
        (from && square?.color !== playerColor)
      ) {
        try {
          socket.send(
            JSON.stringify({
              type: MOVE,
              payload: {
                move: {
                  from,
                  to,
                },
                gameId,
              },
            })
          );
          chess.move({
            from,
            to,
          });
          setBoard(chess.board());
          setMoves((moves) => [...moves, { from, to }]);
          setFrom(null);
        } catch (error) {
          toast.error("invalid move");
        }
      }
    }
  };

  return (
    <div className="flex justify-center">
      <div className="text-white-200 border-4 border-zinc-800">
        {board.map((row, i) => {
          return (
            <div className="flex" key={i}>
              {row.map((square, j) => {
                const squareRepresentation = (String.fromCharCode(
                  97 + (j % 8)
                ) +
                  "" +
                  (8 - i)) as Square;
                return (
                  <div
                    onClick={() =>
                      handleMove(from, squareRepresentation, square)
                    }
                    key={j}
                    className={`xl:w-18 xl:h-18 w-14 h-14 ${
                      (i + j) % 2 === 0 ? "bg-[#75A47F]" : "bg-white"
                    } ${from === squareRepresentation && "selected-square"} `}
                  >
                    <div className="flex felx-col justify-center h-full">
                      {square ? (
                        <img
                          src={`/b${square?.color === "b" && square?.type}.png`}
                          alt=""
                        />
                      ) : null}
                      {square ? (
                        <img
                          src={`/w${square?.color === "w" && square?.type}.png`}
                          alt=""
                        />
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
