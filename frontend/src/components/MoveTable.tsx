export default function MoveTable(moves: any) {
  const index = moves.moves.length
  return (
    <>
      <div className="movetable text-center text-white md:text-2xl w-full">
        <div className="move-top">
        moves table
        </div>
        {
          index > 0 && <div>
            {moves.moves.slice(index - 1).map((move: any, i: any) => {
              return (
                <div key={i} >
                   Recent move - From : {move.from} To : {move.to}
                </div>
              )
            })}
          </div>
        }
      </div>
    </>
  )
}
