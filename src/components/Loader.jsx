import React from "react";
import { motion } from "framer-motion";

export default function Loader({ fullScreen = false }) {
  return (
    <motion.div
    //   initial={{ opacity: 0 }}
    //   animate={{ opacity: 1 }}
    // //   exit={{ opacity: 0 }}
    //   transition={{ duration: 0.3 }}
      className={`flex items-center justify-center ${
        fullScreen ? "min-h-screen" : "h-full"
      } w-full`}
    >
      <svg
        className="animate-spin h-10 w-10 text-blue-600 dark:text-darkBlueText"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
      >
        <path
          fill="currentColor"
          d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8.009,8.009,0,0,1,12,20Z"
        />
        <path fill="currentColor" d="M12.5,6h-1V12h5v-1h-4Z" />
      </svg>
    </motion.div>
  );
}
