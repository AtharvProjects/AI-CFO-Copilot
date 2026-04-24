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
      <Tab setPosition={setPosition}>Features</Tab>
      <Tab setPosition={setPosition}>
        <Link to="/pricing" className="px-3 py-1.5 md:px-5 md:py-3 block w-full h-full">Pricing</Link>
      </Tab>
      <Tab setPosition={setPosition}>CFO Chat</Tab>
      <Tab setPosition={setPosition}>
        <Link to="/dashboard" className="px-3 py-1.5 md:px-5 md:py-3 block w-full h-full">Go to Dashboard</Link>
      </Tab>
      <Cursor position={position} />
    </ul>
  );
}

const Tab = ({ children, setPosition }) => {
  const ref = useRef(null);
  return (
    <li
      ref={ref}
      onMouseEnter={() => {
        if (!ref.current) return;
        const { width } = ref.current.getBoundingClientRect();
        setPosition({ width, opacity: 1, left: ref.current.offsetLeft });
      }}
      className="relative z-10 block cursor-pointer text-xs font-semibold uppercase text-zinc-300 transition-colors hover:text-white md:text-sm flex items-center justify-center"
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
  <motion.li animate={position} className="absolute z-0 h-7 rounded-full bg-indigo-600 md:h-11" />
);

export default NavHeader;
