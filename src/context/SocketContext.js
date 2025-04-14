"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { useSession } from "next-auth/react";
import { config } from "dotenv";
config({ path: ".env.local" }); // or .env.local


const SocketContext = createContext(null);
export const useSocket = () => useContext(SocketContext);

// const SOCKET_URL = "http://localhost:5000"; // ✅ Use correct port

export const SocketProvider = ({ children }) => {
  const { data: session, status } = useSession();
  const socketRef = useRef(null);

  useEffect(() => {
    // Avoid multiple connections
    if (status === "authenticated" && session?.id && !socketRef.current) {
      const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
        transports: ["websocket"],
        path: "/socket.io",
      });

      
      socketInstance.on("connect", () => {
        console.log("✅ Socket connected:", socketInstance.id);
        socketInstance.emit("register", session.id);
        socketRef.current = socketInstance;
      });

      socketInstance.on("connect_error", (err) => {
        console.error("❌ Socket connect error:", err.message);
      });

      socketInstance.on("disconnect", (reason) => {
        socketRef.current = null;
        console.log("🔌 Socket disconnected:", reason);
      });

    }
  }, [session, status]);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
};
