import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace("/api", "") 
  : "http://localhost:5000";

export const useSocket = (userId, onNotificationReceived) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    // Establish WebSocket Connection
    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      credentials: true
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("WebSocket connected, registering user:", userId);
      socket.emit("register", userId);
    });

    // Setup generic notification listener
    socket.on("notification", (data) => {
      console.log("Real-time alert received:", data);
      if (onNotificationReceived) {
        onNotificationReceived(data);
      }
    });

    socket.on("disconnect", () => {
      console.log("WebSocket disconnected");
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [userId, onNotificationReceived]);

  return socketRef.current;
};
