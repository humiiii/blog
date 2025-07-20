import React from "react";

const Loader = ({ size = 48, className = "" }) => (
  <div
    role="status"
    className={`mx-auto my-8 flex items-center justify-center ${className}`}
  >
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      className="animate-spin"
      viewBox="0 0 50 50"
      fill="none"
    >
      {/* Static background circle - dark gray for dark theme */}
      <circle
        className="opacity-20"
        cx="25"
        cy="25"
        r="22"
        stroke="#2d2d2d" // deep gray background
        strokeWidth="6"
        fill="none"
      />
      {/* Spinner arc - monochrome gradient (white to light gray) */}
      <path
        d="M47 25a22 22 0 0 0-22-22"
        stroke="url(#gradient)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        filter="url(#glow)"
      />
      <defs>
        <linearGradient
          id="gradient"
          x1="25"
          y1="3"
          x2="25"
          y2="47"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#fff" /> {/* Start: white */}
          <stop offset="1" stopColor="#bbb" /> {/* End: soft gray */}
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </svg>
    <span className="sr-only">Loading...</span>
  </div>
);

export default Loader;
