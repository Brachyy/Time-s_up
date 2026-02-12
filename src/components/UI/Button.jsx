import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', // primary, secondary, danger, success, ghost, clay-*
  className,
  disabled = false,
  flat = false,
  ...props 
}) => {
  
  const variants = {
    primary: 'bg-yellow-400 text-slate-900 border-yellow-500 hover:bg-yellow-300',
    secondary: 'bg-white text-slate-900 border-slate-200 hover:bg-slate-50',
    danger: 'bg-red-500 text-white border-red-600 hover:bg-red-400',
    success: 'bg-green-500 text-white border-green-600 hover:bg-green-400',
    ghost: 'bg-transparent border-transparent shadow-none hover:bg-slate-100/10',
    orange: 'bg-orange-500 text-white border-orange-600 hover:bg-orange-400',
    purple: 'bg-purple-500 text-white border-purple-600 hover:bg-purple-400',
    blue: 'bg-blue-500 text-white border-blue-600 hover:bg-blue-400',
    
    // Clay variants
    'clay-orange': 'bg-orange-400 text-white shadow-[inset_2px_2px_4px_rgba(255,255,255,0.4),inset_-2px_-2px_4px_rgba(0,0,0,0.1),0_8px_16px_rgba(234,88,12,0.3)]',
    'clay-danger': 'bg-red-500 text-white shadow-[inset_2px_2px_4px_rgba(255,255,255,0.4),inset_-2px_-2px_4px_rgba(0,0,0,0.1),0_8px_16px_rgba(220,38,38,0.3)]',
    'clay-success': 'bg-green-500 text-white shadow-[inset_2px_2px_4px_rgba(255,255,255,0.4),inset_-2px_-2px_4px_rgba(0,0,0,0.1),0_8px_16px_rgba(22,163,74,0.3)]',
  };

  const isClay = variant.startsWith('clay');
  const isFlat = flat || isClay;

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.05, y: disabled ? 0 : (isFlat ? 0 : -2) }}
      whileTap={{ scale: disabled ? 1 : 0.95, y: disabled ? 0 : 0 }}
      onClick={onClick}
      disabled={disabled}
      className={twMerge(
        clsx(
          'relative px-6 py-3 rounded-2xl font-bold text-xl transition-all',
          !isFlat && 'border-b-4 active:border-b-0 active:translate-y-1',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0 disabled:active:border-b-4',
          variants[variant],
          className
        )
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;
