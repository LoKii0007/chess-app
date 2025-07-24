import { createContext, useContext, useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const socketContext = createContext<{
  socket: WebSocket | null;
  setSocket: React.Dispatch<React.SetStateAction<WebSocket | null>>;
  isConnected: boolean;
  reconnect: () => void;
}>({
  socket: null,
  setSocket: () => {},
  isConnected: false,
  reconnect: () => {},
});

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const WS_URL = import.meta.env.VITE_WS_URL;
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const pingIntervalRef = useRef<number | null>(null);
  const reconnectAttempts = useRef(0);
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      toast("Running on a free server, so the game auto-ends in 20 minutes.");
    }, 500);
  }, []);

  const startKeepAlive = (ws: WebSocket) => {
    // Send ping every 30 seconds to keep connection alive
    pingIntervalRef.current = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "ping" }));
      }
    }, 30000);
  };

  const stopKeepAlive = () => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
  };

  const connect = () => {
    console.log("Attempting to connect to WebSocket...");

    if (socket?.readyState === WebSocket.OPEN) {
      console.log("WebSocket already connected");
      return;
    }

    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log("WebSocket connected successfully");
      setSocket(ws);
      setIsConnected(true);
      reconnectAttempts.current = 0;
      startKeepAlive(ws);
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      // Handle ping/pong messages for keep-alive
      if (message.type === "ping") {
        ws.send(JSON.stringify({ type: "pong" }));
      } else if (message.type === "pong") {
        console.log("Received pong from server");
      }

      // Note: Other message handling will be done by individual components
    };

    ws.onclose = (event) => {
      console.log("WebSocket disconnected:", event.reason, "Code:", event.code);
      toast("Oops! Connection to the server was interrupted.Please refresh the page");
      setSocket(null);
      setIsConnected(false);
      stopKeepAlive();
      navigate("/");
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsConnected(false);
    };
  };

  const reconnect = () => {
    reconnectAttempts.current = 0;
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    connect();
  };

  useEffect(() => {
    connect();

    return () => {
      console.log("Cleaning up WebSocket connection");
      stopKeepAlive();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socket) {
        socket.close(1000, "Component unmounting");
      }
    };
  }, []);

  return (
    <socketContext.Provider
      value={{ socket, setSocket, isConnected, reconnect }}
    >
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
