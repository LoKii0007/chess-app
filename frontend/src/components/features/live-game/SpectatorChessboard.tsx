import { type Square, type PieceSymbol, type Color } from "chess.js";

export default function SpectatorChessboard({
  board,
}: {
  board: ({
    square: Square;
    type: PieceSymbol;
    color: Color;
  } | null)[][];
}) {
  return (
    <div className="flex justify-center">
      <div className="text-white-200 border-4 border-zinc-800">
        {board.map((row, i) => {
          return (
            <div className="flex" key={i}>
              {row.map((square, j) => {
                return (
                  <div
                    key={j}
                    className={`xl:w-18 xl:h-18 w-14 h-14 ${
                      (i + j) % 2 === 0 ? "bg-[#75A47F]" : "bg-white"
                    }  `}
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
