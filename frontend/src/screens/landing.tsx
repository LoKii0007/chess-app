import { useNavigate } from 'react-router-dom'
import '../css/landing.css'
import Navbar from '../components/navbar'

const Landing = () => {
  const navigate = useNavigate()
  return (
    <>
    <Navbar />
      <div className="chess h-screen flex flex-row justify-center items-center">
        <div className="chess-left">
          <img src="/chessboard.png" className='w-[25vw]' alt="" />
        </div>
        <div className="chess-right w-[40vw] h-full flex flex-col justify-center items-center">
          <button onClick={() => navigate(`/game/random`)} className='text-2xl rounded-full play-btn p-5 px-12 text-white cursor-pointer'>Play Random</button>
        </div>
      </div>
    </>
  )
}

export default Landing