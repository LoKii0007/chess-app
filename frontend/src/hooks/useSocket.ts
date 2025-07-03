import { useEffect, useState } from 'react'

const UseSocket = () => {
  const WS_URL = "ws://localhost:8080"
//   const WS_URL = "https://chess-ws.vercel.app/"
  const [socket, setSocket] = useState<WebSocket | null>(null)

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

  return socket
}

export default UseSocket