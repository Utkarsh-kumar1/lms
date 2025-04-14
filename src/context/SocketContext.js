"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { useSession } from "next-auth/react";
import { config } from "dotenv";
config({ path: ".env.local" }); // or .env.local

const SocketContext = createContext(null);
export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const { data: session, status } = useSession();
  const socketRef = useRef(null);
  const [refreshSocket, setRefreshSocket] = useState(false);

  useEffect(() => {
    // Avoid multiple connections
    if (status === "authenticated" && session?.id && !socketRef.current) {
      socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
        transports: ["websocket"],
        path: "/socket.io",
      });

      socketRef.current.on("connect", () => {
        // console.log("✅ Socket connected:", socketRef.current.id);
        socketRef.current.emit("register", session.id);
        // change the state to trigger a re-render
        setRefreshSocket((prev) => !prev);
      });

      socketRef.current.on("connect_error", (err) => {
        console.error("❌ Socket connect error:", err.message);
      });

      socketRef.current.on("disconnect", (reason) => {
        socketRef.current = null;
        setRefreshSocket((prev) => !prev);
        // console.log("🔌 Socket disconnected:", reason);
      });

      // Cleanup when session changes or user logs out
      if (status !== "authenticated" || !session?.id) {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      }
    }
  }, [session, status]);

  // Handle logout manually (if logout happens outside of the session change)
  useEffect(() => {
    const handleLogout = () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        // console.log("Socket disconnected due to logout");
      }
    };

    // Listen for any logout event (you can trigger this manually or based on your app's logout logic)
    window.addEventListener("logout", handleLogout);

  }, []);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
};
