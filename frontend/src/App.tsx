import { BrowserRouter, Route, Routes } from "react-router-dom";
import Landing from "./screens/landing";
import GamePage from "./screens/gamePage";
import { Toaster } from "react-hot-toast";
import JoinRoomPage from "./screens/join/JoinRoomPage";
import CreateRoomPage from "./screens/create/CreateRoomPage";
import { SocketProvider } from "./context/socketContext";
import RoomPage from "./screens/room/RoomPage";

function App() {
  return (
    <>
      <BrowserRouter>
        <SocketProvider>
          <Routes>
            <Route path="/" element={<Landing />}></Route>
            <Route path="/game/:gameId" element={<GamePage />}></Route>
            <Route path="/create/room" element={<CreateRoomPage />}></Route>
            <Route path="/join/room" element={<JoinRoomPage />}></Route>
            <Route path="/room/:roomId" element={<RoomPage />}></Route>
          </Routes>
          <Toaster />
        </SocketProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
