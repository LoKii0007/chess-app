import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import UseSocket from "../../hooks/useSocket";

const CreateRoomPage = () => {
  const socket = UseSocket();
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [canStartGame, setCanStartGame] = useState(false);

  useEffect(() => {

    if (!socket) {
      console.log("No socket connection available");
      return;
    }

    console.log("Setting up socket message handler");
    
    const handleSocketMessage = (event: MessageEvent) => {
      console.log("Raw socket message received:", event.data);
      
      try {
        const message = JSON.parse(event.data);
        console.log("Parsed message:", message);

        switch (message.type) {
          case "ROOM_JOINED":
            console.log("Room joined event received:", message.payload);
            setCanStartGame(true);
            toast.success("Opponent joined the room");
            break;
          case "OPPONENT_LEFT":
            console.log("Opponent left the room");
            setCanStartGame(false);
            toast.success("Opponent left the room");
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
      socket.removeEventListener("message", handleSocketMessage);
      
    };
  }, [socket, navigate, roomId]);

  const handleStartGame = () => {
    if (!socket) {
      console.log("Cannot start game - no socket connection");
      toast.error("No connection available");
      return;
    }

    if (!canStartGame) {
      toast.error("Waiting for opponent to join the room");
      return;
    }

    console.log("Sending START_GAME message for room:", roomId);
    socket.send(JSON.stringify({ type: "START_GAME", payload: { roomId } }));
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen w-full">
      <div>Room Id : {roomId}</div>
      <div>
        <button 
          onClick={handleStartGame}
          className={canStartGame ? "enabled" : "disabled"}
        >
          {canStartGame ? "Start Game" : "Waiting for Opponent"}
        </button>
      </div>
    </div>
  );
};

export default CreateRoomPage;
