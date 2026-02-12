import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ word, onSwipeLeft, onSwipeRight }) => {
  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(e, { offset, velocity }) => {
        const swipe = offset.x;

        if (swipe > 100) {
          onSwipeRight();
        } else if (swipe < -100) {
          onSwipeLeft();
        }
      }}
      className="w-72 h-96 bg-white rounded-3xl shadow-[12px_12px_0px_0px_rgba(0,0,0,0.1)] border-4 border-slate-100 flex items-center justify-center cursor-grab active:cursor-grabbing relative overflow-hidden"
      whileHover={{ scale: 1.05, rotate: 2 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Decorative dots */}
      <div className="absolute top-4 left-4 w-4 h-4 rounded-full bg-yellow-400" />
      <div className="absolute top-4 right-4 w-4 h-4 rounded-full bg-purple-400" />
      <div className="absolute bottom-4 left-4 w-4 h-4 rounded-full bg-pink-400" />
      <div className="absolute bottom-4 right-4 w-4 h-4 rounded-full bg-blue-400" />

      <h2 className={`${word.length > 20 ? 'text-3xl' : word.length > 12 ? 'text-4xl' : 'text-5xl'} font-black text-slate-800 text-center px-6 select-none leading-tight break-words w-full`}>
        {word}
      </h2>
    </motion.div>
  );
};

export default Card;
