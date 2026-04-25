"use client";
import React, { useRef, useState } from "react";
import { motion } from "framer-motion";

import { Link } from 'react-router-dom';

function NavHeader() {
  const [position, setPosition] = useState({ left: 0, width: 0, opacity: 0 });
  return (
    <ul
      className="relative mx-auto flex w-fit rounded-full border-2 border-zinc-800 bg-zinc-900/50 backdrop-blur-md p-1 shadow-2xl"
      onMouseLeave={() => setPosition((pv) => ({ ...pv, opacity: 0 }))}
    >
      <Tab setPosition={setPosition}>
        <Link to="/" className="px-3 py-1.5 md:px-5 md:py-3 block w-full h-full">Home</Link>
      </Tab>
      <Tab setPosition={setPosition}>
        <a href="#features" className="px-3 py-1.5 md:px-5 md:py-3 block w-full h-full">Features</a>
      </Tab>
      <Tab setPosition={setPosition}>
        <Link to="/pricing" className="px-3 py-1.5 md:px-5 md:py-3 block w-full h-full">Pricing</Link>
      </Tab>
      <Tab setPosition={setPosition}>
        <Link to="/chat" className="px-3 py-1.5 md:px-5 md:py-3 block w-full h-full">CFO Chat</Link>
      </Tab>
      <Tab setPosition={setPosition}>
        <Link to="/login" className="px-3 py-1.5 md:px-5 md:py-3 block w-full h-full">Login</Link>
      </Tab>
      <Tab setPosition={setPosition} isCta>
        <Link to="/register" className="px-3 py-1.5 md:px-5 md:py-3 block w-full h-full text-white">Get Started</Link>
      </Tab>
      <Cursor position={position} />
    </ul>
  );
}

const Tab = ({ children, setPosition, isCta }) => {
  const ref = useRef(null);
  return (
    <li
      ref={ref}
      onMouseEnter={() => {
        if (!ref.current) return;
        const { width } = ref.current.getBoundingClientRect();
        setPosition({ width, opacity: 1, left: ref.current.offsetLeft });
      }}
      className={cn(
        "relative z-10 block cursor-pointer text-xs font-semibold uppercase transition-colors md:text-sm flex items-center justify-center rounded-full",
        isCta ? "text-white" : "text-zinc-300 hover:text-white"
      )}
    >
      {typeof children === 'string' ? (
         <div className="px-3 py-1.5 md:px-5 md:py-3">{children}</div>
      ) : (
         children
      )}
    </li>
  );
};

const Cursor = ({ position }) => (
  <motion.li animate={position} className="absolute z-0 h-7 rounded-full bg-indigo-600 md:h-11 shadow-lg shadow-indigo-500/20" />
);

function cn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}

export default NavHeader;
