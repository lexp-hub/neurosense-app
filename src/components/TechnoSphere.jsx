import React from 'react';

const TechnoSphere = ({ className, animating = false }) => (
  <svg viewBox="0 0 200 200" className={`${className} ${animating ? 'animate-pulse' : ''}`}>
    <defs>
      <radialGradient id="sphereGrad" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
        <stop offset="0%" stopColor="#818cf8" />
        <stop offset="70%" stopColor="#4338ca" />
        <stop offset="100%" stopColor="#1e1b4b" />
      </radialGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    
    <path d="M60 160 L140 160 L160 190 L40 190 Z" fill="#1e293b" stroke="#4338ca" strokeWidth="2" />
    <rect x="70" y="170" width="60" height="4" rx="2" fill="#6366f1" opacity="0.5" />
    
    <circle cx="100" cy="100" r="70" fill="url(#sphereGrad)" stroke="#6366f1" strokeWidth="1" />
    
    <g opacity="0.4" stroke="#818cf8" strokeWidth="0.5" fill="none">
      <circle cx="100" cy="100" r="50" />
      <path d="M100 50 L100 150 M50 100 L150 100" />
      <path d="M65 65 L135 135 M65 135 L135 65" />
    </g>
    
    <circle 
        cx="100" 
        cy="100" 
        r="15" 
        fill="#facc15" 
        filter="url(#glow)" 
        className={animating ? "animate-ping" : ""} 
        style={{ animationDuration: '2s' }} 
    />
    <circle cx="100" cy="100" r="8" fill="#ffffff" />
    
    <circle cx="60" cy="60" r="2" fill="#818cf8">
      <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" />
    </circle>
    <circle cx="140" cy="140" r="2" fill="#818cf8">
      <animate attributeName="opacity" values="1;0;1" dur="2.5s" repeatCount="indefinite" />
    </circle>
  </svg>
);

export default TechnoSphere;