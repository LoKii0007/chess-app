import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../../context/socketContext";
import { INIT_GAME } from "../../components/message";

const CreateRoomPage = () => {
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [canStartGame, setCanStartGame] = useState(false);
  const [isRoomCreated, setIsRoomCreated] = useState(false);
  const [roomId, setRoomId] = useState("");

  const handleCreateRoom = () => {
    socket?.send(JSON.stringify({ type: "CREATE_ROOM" }));
  };

  useEffect(() => {
    if (!socket) {
      return;
    }

    const handleSocketMessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);

        switch (message.type) {
          case "ROOM_CREATED":
            setIsRoomCreated(true);
            setRoomId(message.payload);
            break;
          case "ROOM_JOINED":
            if (message.payload === roomId) {
              setCanStartGame(true);
              toast.success("Opponent joined the room");
            }
            break;
          case INIT_GAME:
            toast.success("Game started");
            navigate(`/room/${message.payload.gameId}`, {
              state: {
                gameData: message.payload,
              },
            });
            break;

          case "OPPONENT_LEFT":
            setCanStartGame(false);
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

          case "ERROR":
            console.error("Socket error:", message.payload);
            toast.error(
              message.payload || "Something went wrong. Please try again later."
            );
            if (message.payload === "Room not found") {
              navigate("/");
            }
            break;
          default:
            console.log("Unhandled message type:", message.type);
        }
      } catch (error) {
        console.error("Error processing socket message:", error);
      }
    };

    socket.addEventListener("message", handleSocketMessage);

    return () => {
      console.log("Cleaning up socket message handler");
      socket.removeEventListener("message", handleSocketMessage);
    };
  }, [socket, navigate, roomId]);

  const handleStartGame = () => {
    if (!socket) {
      toast.error("No connection available");
      return;
    }

    if (!canStartGame) {
      toast.error("Waiting for opponent to join the room");
      return;
    }

    socket.send(JSON.stringify({ type: "START_GAME", payload: { roomId } }));
  };

  const handleLeaveRoom = () => {
    if (!socket) {
      console.log("Cannot leave room - no socket connection");
      return;
    }

    console.log("Leaving room:", roomId);
    socket.send(JSON.stringify({ type: "LEAVE_ROOM", payload: { roomId } }));
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen w-full bg-zinc-800 text-white relative">
      <button
        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md cursor-pointer absolute top-10 left-10"
        onClick={handleLeaveRoom}
      >
        Leave Room
      </button>

      <div className="text-center space-y-6">
        {roomId && (
          <>
            <h2 className="text-2xl font-bold">Room Created</h2>
            <div className="text-lg">
              <span className="text-gray-400">Room ID:</span>
              <span className="font-mono bg-gray-700 px-2 py-1 rounded ml-2">
                {roomId}
              </span>
            </div>

            {!canStartGame ? (
              <div className="text-yellow-400">
                <div className="animate-pulse">
                  Waiting for opponent to join...
                </div>
                <div className="text-sm text-gray-400 mt-2">
                  Share the room ID with your opponent
                </div>
              </div>
            ) : (
              <div className="text-green-400">
                <div>✓ Opponent joined!</div>
                <div className="text-sm text-gray-400 mt-2">
                  Ready to start the game
                </div>
              </div>
            )}
          </>
        )}

        <div className="space-y-4">
          {isRoomCreated ? (
            <>
              <button
                onClick={handleStartGame}
                disabled={!canStartGame}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  canStartGame
                    ? "bg-green-500 hover:bg-green-600 text-white cursor-pointer"
                    : "bg-gray-600 text-gray-400 cursor-not-allowed"
                }`}
              >
                {canStartGame ? "Start Game" : "Waiting for Opponent"}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleCreateRoom()}
                className="nav-right-btn cursor-pointer px-4 bg-white text-black rounded-full py-2"
              >
                Create room
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateRoomPage;
