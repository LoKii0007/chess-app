import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const handleCreateRoom = () => {
    navigate("/create/room");
  };

  return (
    <>
      <div className="navbar bg-[#18191ae8] text-white p-5 flex justify-around items-center fixed top-0 left-0 right-0 z-50">
        <div className="nav-left">Chess</div>
        <div className="nav-right flex gap-4 justify-center items-center">
          <button
            onClick={() => navigate("/join/room")}
            className="nav-right-btn cursor-pointer px-4 bg-white text-black rounded-full py-2"
          >
            Join room
          </button>
          <button
            onClick={() => handleCreateRoom()}
            className="nav-right-btn cursor-pointer px-4 bg-white text-black rounded-full py-2"
          >
            Create room
          </button>
        </div>
      </div>
    </>
  );
}
