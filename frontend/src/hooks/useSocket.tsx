import { useEffect, useRef, useState } from "react";

const useSocket = () => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const socketRef = useRef<WebSocket | null>(null);
  const WS_URL = import.meta.env.VITE_WS_URL;

  const disconnectSocket = () => {
    if (!socketRef.current) {
      console.log("socket already disconnected");
    }

    socketRef.current?.close(1000, "socket unmounting");
  };

  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("connceted to socket");
      setIsConnected(true);
    };

    ws.onerror = (error) => {
      console.error("error in socket", error);
    };

    ws.onclose = () => {
      console.log("socet disconnected");
      socketRef.current = null;
      setIsConnected(false);
    };

    return () => {
      disconnectSocket();
    };
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    disconnectSocket
  };
};

export default useSocket;
