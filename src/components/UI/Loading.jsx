import React from 'react';
import { motion } from 'framer-motion';

const Loading = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-yellow-50 overflow-hidden relative">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-24 h-24 border-8 border-slate-200 border-t-yellow-400 rounded-full mb-8"
      />
      <motion.h2 
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 1, repeat: Infinity }}
        className="text-3xl font-black text-slate-800"
      >
        Chargement...
      </motion.h2>
      <p className="text-slate-500 mt-2 font-bold">Préparation des cartes...</p>
    </div>
  );
};

export default Loading;
