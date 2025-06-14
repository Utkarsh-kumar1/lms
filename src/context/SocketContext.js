"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { config } from "dotenv";
import { useAuth } from "./AuthContext";
config({ path: ".env.local" }); // or .env.local

const SocketContext = createContext(null);
export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  // const { data: session, status } = useSession();
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [refreshSocket, setRefreshSocket] = useState(false);

  useEffect(() => {
    // Avoid multiple connections
    if (user && user?.id && !socketRef.current) {
      socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
        path: "/socket.io",
        transports: ["websocket"],
      });

      socketRef.current.on("connect", () => {
        console.log("✅ Socket connected:", socketRef.current.id);
        socketRef.current.emit("register", user.id);
        // change the state to trigger a re-render
        setRefreshSocket((prev) => !prev);
      });

      socketRef.current.on("connect_error", (err) => {
        console.error("❌ Socket connect error:", err.message);
        console.error(err);
      });

      socketRef.current.on("disconnect", (reason) => {
        socketRef.current = null;
        setRefreshSocket((prev) => !prev);
        console.log("🔌 Socket disconnected:", reason);
      });
    }
  }, [user]);

  // Handle logout manually (if logout happens outside of the user change)
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
