let socket: WebSocket | null = null
let isConnected: boolean = false

export const getSocket = () => {
    const WS_URL = import.meta.env.VITE_WS_URL;

    if (!socket) {
        socket = new WebSocket(WS_URL);
    
        socket.onopen = () => {
          isConnected = true;
        };
    
        socket.onclose = () => {
          isConnected = false;
        };
      }


    return { socket, isConnected }
}