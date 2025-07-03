import { useNavigate } from "react-router-dom";
import UseSocket from "../hooks/useSocket";
import { useEffect } from "react";
import toast from "react-hot-toast";

export default function Navbar() {
  const navigate = useNavigate();

  const socket = UseSocket();

  useEffect(() => {
    if (!socket) {
      return;
    }

    const handleSocketMessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data);
      switch (message.type) {
        case "ROOM_CREATED":
          try {
            console.log(message.payload);
            navigate(`/create/room/${message.payload}`);
          } catch (error) {
            console.log(error);
          }
          break;
        case "ERROR":
          toast.error(message.payload || "Something went wrong. Please try again later.");
          break;
      }
    };

    socket.addEventListener("message", handleSocketMessage);

    return () => {
      socket.removeEventListener("message", handleSocketMessage);
    };
  }, [socket]);

  const handleCreateRoom = () => {
    socket?.send(JSON.stringify({ type: "CREATE_ROOM" }));
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
