import { BrowserRouter, Route, Routes } from "react-router-dom";
import Landing from "./screens/landing";
import GamePage from "./screens/gamePage";
import { Toaster } from "react-hot-toast";
import JoinRoomPage from "./screens/join/JoinRoomPage";
import CreateRoomPage from "./screens/create/CreateRoomPage";


function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />}></Route>
          <Route path="/game/:gameId" element={<GamePage />}></Route>
          <Route path="/create/room/:roomId" element={<CreateRoomPage />}></Route>
          <Route path="/join/room" element={<JoinRoomPage />}></Route>
        </Routes>
        <Toaster />
      </BrowserRouter>
    </>
  );
}

export default App;
