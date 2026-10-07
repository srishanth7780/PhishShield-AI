"use client";

import { useEffect, useRef, useState } from "react";

const VIDEO_SRC =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260912_104036_bd6924f6-3c8e-417e-8465-6d03c8c2e9e6.mp4";
const POSTER_SRC =
  "https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/82e7eb75-c65f-490a-99b5-f3d1cad54200.webp";

export default function LoginBackgroundVideo() {
  const videoARef = useRef(null);
  const videoBRef = useRef(null);
  const [activeVideo, setActiveVideo] = useState("A");

  useEffect(() => {
    const videoA = videoARef.current;
    const videoB = videoBRef.current;
    if (!videoA || !videoB) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      videoA.pause();
      videoB.pause();
      return;
    }

    let isSwapping = false;
    let currentVideo = videoA;
    let nextVideo = videoB;
    const FADE_DURATION = 0.9; // seconds before end to trigger cross-fade

    const handleTimeUpdate = (e) => {
      const vid = e.target;
      if (vid !== currentVideo || isSwapping || !vid.duration) return;

      const timeLeft = vid.duration - vid.currentTime;
      if (timeLeft <= FADE_DURATION) {
        isSwapping = true;

        nextVideo.currentTime = 0;
        nextVideo
          .play()
          .catch(() => {});

        setActiveVideo(nextVideo === videoA ? "A" : "B");

        setTimeout(() => {
          vid.pause();
          vid.currentTime = 0;
          const temp = currentVideo;
          currentVideo = nextVideo;
          nextVideo = temp;
          isSwapping = false;
        }, FADE_DURATION * 1000 + 100);
      }
    };

    videoA.addEventListener("timeupdate", handleTimeUpdate);
    videoB.addEventListener("timeupdate", handleTimeUpdate);

    videoA
      .play()
      .catch(() => {});

    return () => {
      videoA.removeEventListener("timeupdate", handleTimeUpdate);
      videoB.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-black select-none">
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[max(100vw,calc(100vh*1.6))] h-[max(62.5vw,100vh)] bg-black">
        {/* Seamless Cross-fade Video A */}
        <video
          ref={videoARef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={POSTER_SRC}
          disablePictureInPicture
          aria-hidden="true"
          className={`absolute inset-0 w-full h-full object-cover object-[51%_8%] transition-opacity duration-1000 ease-linear ${
            activeVideo === "A" ? "opacity-60" : "opacity-0"
          }`}
        >
          <source src={VIDEO_SRC} type="video/mp4" />
        </video>

        {/* Seamless Cross-fade Video B */}
        <video
          ref={videoBRef}
          muted
          loop
          playsInline
          preload="auto"
          poster={POSTER_SRC}
          disablePictureInPicture
          aria-hidden="true"
          className={`absolute inset-0 w-full h-full object-cover object-[51%_8%] transition-opacity duration-1000 ease-linear ${
            activeVideo === "B" ? "opacity-60" : "opacity-0"
          }`}
        >
          <source src={VIDEO_SRC} type="video/mp4" />
        </video>
      </div>

      {/* Dark Vignette & Liquid Glass Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/45 to-black/90 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_20%,_rgba(0,0,0,0.85)_100%)] pointer-events-none" />
    </div>
  );
}
