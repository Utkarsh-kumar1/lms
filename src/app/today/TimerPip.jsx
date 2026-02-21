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

    if (timeLeft === 0) {
      playCelebrationSound();
    }
  }, [timeLeft]);

  const playCelebrationSound = () => {
    const audio = new Audio("/ping_pong.mp3");
    audio.volume = 0.8; // Optional: lower if too loud
    audio.play().catch((e) => {
      console.warn("Audio play failed:", e);
    });
  };



  const drawTimer = () => {

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    const text = formatTime(timeLeft); // E.g., "02:45"
    const fontSize = 200;
    const padding = 16;
    const font = `bold ${fontSize}px monospace`;

    // Set font to measure text
    ctx.font = font;
    const textMetrics = ctx.measureText(text);
    const textWidth = textMetrics.width;
    const textHeight = fontSize * 1.2;

    const logicalWidth = textWidth + padding * 2;
    const logicalHeight = textHeight + padding * 2;

    const ratio = window.devicePixelRatio || 1;

    // Set actual resolution of canvas
    canvas.width = logicalWidth * ratio;
    canvas.height = logicalHeight * ratio;

    // Set CSS size (display size)
    canvas.style.width = `${logicalWidth}px`;
    canvas.style.height = `${logicalHeight}px`;

    // Ensure high-DPI clarity
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(ratio, ratio);

    // Enable quality rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = font;

    // Draw rounded rectangle
    const radius = 12;
    ctx.fillStyle = "rgba(30, 30, 47, 0.95)";
    ctx.shadowColor = "rgba(0,0,0,0.4)";
    ctx.shadowBlur = 10;
    roundRect(ctx, 0, 0, logicalWidth, logicalHeight, radius);
    ctx.fill();

    // Draw text
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#ffffff";
    ctx.fillText(text, logicalWidth / 2, logicalHeight / 2);
  };

  const roundRect = (ctx, x, y, width, height, radius) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
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
