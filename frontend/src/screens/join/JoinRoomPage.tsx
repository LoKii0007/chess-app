import { useEffect, useState } from "react";
import UseSocket from "../../hooks/useSocket";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const JoinRoomPage = () => {
  const [roomId, setRoomId] = useState("");
  const socket = UseSocket();
  const navigate = useNavigate();
  const [roomJoined, setRoomJoined] = useState(false);

  const handleJoinRoom = () => {
    socket?.send(JSON.stringify({ type: "JOIN_ROOM", payload: { roomId } }));
  };

  useEffect(() => {
    if (!socket) {
      return;
    }

    const handleSocketMessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data);
      switch (message.type) {
        case "ROOM_JOINED":
          console.log("joined room", message.payload);
          toast.success("Joined room successfully");
          setRoomJoined(true);
          break;
        case "GAME_STARTED":
          console.log("game started", message.payload);
          navigate(`/game/${message.payload}`);
          break;
        case "ERROR":
          toast.error(
            message.payload || "Something went wrong. Please try again later."
          );
          break;
        case "ROOM_NOT_FOUND":
          toast.error("Room not found");
          break;
        case "ROOM_FULL":
          toast.error("Room is full");
          break;
        case "LEAVE_ROOM_SUCCESS":
          toast.success("Left room successfully");
          setRoomJoined(false);
          navigate("/");
          break;
      }
    };

    socket.addEventListener("message", handleSocketMessage);

    return () => {
      socket.removeEventListener("message", handleSocketMessage);
    };
  }, [socket]);

  const handleLeaveRoom = () => {
    socket?.send(JSON.stringify({ type: "LEAVE_ROOM", payload: { roomId } }));
  };

  return (
    <div className="flex bg-zinc-600 flex-col items-center justify-center h-screen w-full relative">
      <button
        className="bg-red-100 text-red-600 px-4 py-2 rounded-md cursor-pointer absolute top-10 left-10"
        onClick={() => handleLeaveRoom()}
      >
        Leave Room
      </button>

      <div>
        {roomJoined ? (
          <div className="text-white text-xl">
            Waiting for Owner to start the game
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4">
            <div>
              <input
                type="text"
                placeholder="Room ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
              />
            </div>
            <button
              disabled={!roomId}
              onClick={handleJoinRoom}
              className="bg-blue-500 text-white px-4 py-2 rounded-md cursor-pointer"
            >
              Join Room
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default JoinRoomPage;
