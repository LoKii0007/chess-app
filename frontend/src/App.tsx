import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import Landing from "./screens/landing";
import GamePage from "./screens/random/gamePage";
import JoinRoomPage from "./screens/join/JoinRoomPage";
import CreateRoomPage from "./screens/create/CreateRoomPage";
import { AuthProvider } from "./context/authContext";
import RoomPage from "./screens/room/RoomPage";
import LoginPage from "./screens/auth/LoginPage";
import RegisterPage from "./screens/auth/RegisterPage";
import "./App.css";
import "./css/landing.css";
import LiveGame from "./screens/live-games/LiveGame";
import GameListPage from "./screens/live-games/GameListPage";
import Navbar from "./components/common/navbar";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <Navbar />
            <Routes>
              <Route path="/" element={<Landing />}></Route>
              <Route path="/login" element={<LoginPage />}></Route>
              <Route path="/register" element={<RegisterPage />}></Route>
              <Route path="/game/:gameId" element={<GamePage />}></Route>
              <Route path="/room/create" element={<CreateRoomPage />}></Route>
              <Route path="/room/join" element={<JoinRoomPage />}></Route>
              <Route path="/room/:gameId" element={<RoomPage />}></Route>
              <Route path="/live-games" element={<GameListPage />}></Route>
              <Route path="/live-games/:gameId" element={<LiveGame />}></Route>
            </Routes>
            <Toaster />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </>
  );
}

export default App;
