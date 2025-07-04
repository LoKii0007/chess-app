import { useEffect, useState } from "react";
import { useSocket } from "../../context/socketContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { INIT_GAME } from "../../components/message";

const JoinRoomPage = () => {
  const [roomId, setRoomId] = useState("");
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [roomJoined, setRoomJoined] = useState(false);

  const handleJoinRoom = () => {
    if (!socket) {
      return;
    }
    if (!roomId || roomId.length !== 36) {
      toast.error("Please enter a valid room ID");
      return;
    }
    socket.send(JSON.stringify({ type: "JOIN_ROOM", payload: { roomId } }));
  };

  useEffect(() => {
    if (!socket) {
      return;
    }

    const handleSocketMessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data);
      switch (message.type) {
        case "ROOM_JOINED":
          toast.success("Joined room successfully");
          setRoomJoined(true);
          break;
        case INIT_GAME:
          navigate(`/room/${message.payload.gameId}`, {
            state: {
              gameData: message.payload,
            },
          });
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

        case "OPPONENT_LEFT":
          toast("Opponent left the room");
          break;

        case "LEFT_ROOM":
          toast("You left the room");
          navigate("/");
          break;

        case "ROOM_DELETED":
          toast("Room deleted");
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

      <div className="w-full ">
        {roomJoined ? (
          <div className="text-white text-xl text-center">
            Waiting for Owner to start the game
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-6">
            <div className="w-full max-w-md">
              <input
                className="bg-zinc-800 text-white px-4 py-2 rounded-xl focus:outline-none w-full"
                type="text"
                placeholder="Room ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
              />
            </div>
            <button
              disabled={!roomId}
              onClick={handleJoinRoom}
              className="bg-emerald-100 text-black px-6 py-2 rounded-xl cursor-pointer hover:bg-emerald-200"
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
