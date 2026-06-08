import React from 'react';
import { motion } from 'framer-motion';

const SmokyBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Primary Smoke Blob */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, 30, 0],
          opacity: [0.1, 0.15, 0.1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] rounded-full bg-indigo-500/20 blur-[120px]"
      />
      
      {/* Secondary Smoke Blob */}
      <motion.div
        animate={{
          scale: [1.1, 1, 1.1],
          x: [0, -40, 0],
          y: [0, -20, 0],
          opacity: [0.08, 0.12, 0.08],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-purple-500/20 blur-[100px]"
      />
      
      {/* Tertiary Accent Blob */}
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          x: [20, -20, 20],
          opacity: [0.05, 0.1, 0.05],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[30%] right-[20%] w-[40%] h-[40%] rounded-full bg-blue-400/10 blur-[80px]"
      />

      {/* Floating Particle/Smoke Whisp 1 */}
      <motion.div
        animate={{
          y: [0, -100, 0],
          opacity: [0, 0.2, 0],
          scale: [0.8, 1.2, 0.8],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          delay: 2,
        }}
        className="absolute top-[60%] left-[20%] w-[30%] h-[30%] rounded-full bg-indigo-300/5 blur-[60px]"
      />

      {/* Floating Particle/Smoke Whisp 2 */}
      <motion.div
        animate={{
          y: [0, 100, 0],
          opacity: [0, 0.15, 0],
          scale: [1.2, 0.8, 1.2],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          delay: 5,
        }}
        className="absolute bottom-[40%] right-[30%] w-[25%] h-[25%] rounded-full bg-purple-300/5 blur-[50px]"
      />
    </div>
  );
};

export default SmokyBackground;
