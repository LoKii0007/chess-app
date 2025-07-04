import { createContext, useContext, useState, useEffect } from "react";

const socketContext = createContext<{
  socket: WebSocket | null;
  setSocket: React.Dispatch<React.SetStateAction<WebSocket | null>>;
}>({ socket: null, setSocket: () => {} });

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const WS_URL = import.meta.env.VITE_WS_URL;
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    let ws: WebSocket;

    const connect = () => {
      console.log("Attempting to connect to WebSocket...");
      ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        console.log("WebSocket connected successfully");
        setSocket(ws);
      };

      ws.onclose = (event) => {
        console.log("WebSocket disconnected:", event.reason);
        setSocket(null);
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    };

    connect();

    return () => {
      console.log("Cleaning up WebSocket connection");
      if (ws) {
        ws.close();
      }
    };
  }, []);

  return (
    <socketContext.Provider value={{ socket, setSocket }}>
      {children}
    </socketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(socketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export default socketContext;
