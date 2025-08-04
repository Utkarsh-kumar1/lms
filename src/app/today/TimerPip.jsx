import React, { useEffect, useRef, useState } from "react";
import { TfiTimer } from "react-icons/tfi";
import { FaRegCirclePause } from "react-icons/fa6";
import { RxResume } from "react-icons/rx";
import { CiStop1 } from "react-icons/ci";


const TimerPiP = ({ minutes }) => {
  const initialSeconds = minutes * 60;
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const intervalRef = useRef(null);

  // Setup: Stream canvas to video
  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    const stream = canvas.captureStream();
    video.srcObject = stream;

    const playVideo = () => {
      video.play().catch((err) => console.error("Video play error:", err));
    };

    video.addEventListener("loadedmetadata", playVideo);

    return () => {
      video.removeEventListener("loadedmetadata", playVideo);
    };
  }, []);

  // Handle Picture-in-Picture exit
  useEffect(() => {
    const handlePiPExit = () => {
      setIsRunning(false);
      setHasStarted(false);
      setTimeLeft(initialSeconds);
    };

    videoRef.current?.addEventListener("leavepictureinpicture", handlePiPExit);

    return () => {
      videoRef.current?.removeEventListener(
        "leavepictureinpicture",
        handlePiPExit
      );
    };
  }, [initialSeconds]);

  // Timer countdown
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            exitPiP();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  // Draw timer on canvas
  useEffect(() => {
    drawTimer();
  }, [timeLeft]);

  const drawTimer = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const text = formatTime(timeLeft);
    const fontSize = 36;
    const padding = 16;
    const font = `bold ${fontSize}px monospace`;

    // Set font before measuring
    ctx.font = font;
    const metrics = ctx.measureText(text);
    const textWidth = metrics.width;
    const textHeight = fontSize * 1.2;

    const logicalWidth = textWidth + padding * 2;
    const logicalHeight = textHeight + padding * 2;
    const scale = window.devicePixelRatio || 1;

    // Set actual and displayed canvas sizes
    canvas.width = logicalWidth * scale;
    canvas.height = logicalHeight * scale;
    canvas.style.width = `${logicalWidth}px`;
    canvas.style.height = `${logicalHeight}px`;

    ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
    ctx.scale(scale, scale);

    // High quality smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = font;

    // Optional: Rounded rectangle background
    const radius = 12;
    ctx.fillStyle = "rgba(30, 30, 47, 0.85)";
    ctx.shadowColor = "rgba(0,0,0,0.3)";
    ctx.shadowBlur = 8;
    roundRect(ctx, 0, 0, logicalWidth, logicalHeight, radius);
    ctx.fill();

    // Text
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#ffffff";
    ctx.fillText(text, logicalWidth / 2, logicalHeight / 2);
  };

  // Draws a rounded rectangle path
  const roundRect = (ctx, x, y, w, h, r) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };

  const formatTime = (seconds) => {
    const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const handleStart = async () => {
    setTimeLeft(initialSeconds);
    setIsRunning(true);
    setHasStarted(true);

    try {
      if (document.pictureInPictureEnabled && videoRef.current) {
        await videoRef.current.requestPictureInPicture();
      } else {
        alert("Picture-in-Picture is not supported.");
      }
    } catch (err) {
      console.error("Failed to enter Picture-in-Picture:", err);
    }
  };

  const handlePausePlay = () => {
    setIsRunning((prev) => !prev);
  };

  const handleStop = () => {
    setIsRunning(false);
    setHasStarted(false);
    setTimeLeft(initialSeconds);
    exitPiP();
  };

  const exitPiP = async () => {
    if (document.pictureInPictureElement) {
      try {
        await document.exitPictureInPicture();
      } catch (err) {
        console.error("Failed to exit PiP:", err);
      }
    }
  };

  return (
    <div className="text-center space-y-4">
      {!hasStarted && (
        <button
          onClick={handleStart}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow"
        >
          <TfiTimer />
        </button>
      )}

      {hasStarted && (
        <div className="flex justify-center gap-2">
          <button
            onClick={handlePausePlay}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
          >
            {isRunning ? <FaRegCirclePause /> : <RxResume />}
          </button>
          <button
            onClick={handleStop}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow"
          >
            <CiStop1 />

          </button>
        </div>
      )}

      {/* Hidden canvas and video for PiP */}
      <canvas
        ref={canvasRef}
        width="600"
        height="300"
        style={{ display: "none" }}
      />

      <video ref={videoRef} style={{ display: "none" }} muted playsInline />
    </div>
  );
};

export default TimerPiP;
