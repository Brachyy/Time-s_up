import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import Button from '../components/UI/Button';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

const TurnReview = () => {
  const { state, dispatch } = useGame();
  const [invalidatedIds, setInvalidatedIds] = useState([]);

  const toggleCard = (id) => {
    setInvalidatedIds(prev => 
      prev.includes(id) 
        ? prev.filter(p => p !== id) 
        : [...prev, id]
    );
  };

  const handleConfirm = () => {
    dispatch({ type: 'VALIDATE_TURN', payload: invalidatedIds });
  };

  const playedCards = state.playedCardsInTurn || [];
  const validCount = playedCards.length - invalidatedIds.length;

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-900 overflow-hidden relative p-4">
      <div className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full">
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white p-6 rounded-3xl shadow-xl w-full flex flex-col max-h-[85vh] border-4 border-slate-100"
        >
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-black text-slate-800 mb-2">Fin du Tour !</h1>
            <p className="text-slate-500 font-bold">Vérifiez les mots devinés</p>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0 pr-2 space-y-3 mb-6 scrollbar-hide">
            {playedCards.length === 0 ? (
              <div className="text-center py-8 text-slate-400 font-bold italic border-2 border-dashed border-slate-200 rounded-xl">
                Aucun mot deviné ce tour-ci ! 😅
              </div>
            ) : (
              playedCards.map((card) => {
                const isValid = !invalidatedIds.includes(card.id);
                return (
                  <motion.div
                    key={card.id}
                    layout
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    onClick={() => toggleCard(card.id)}
                    className={clsx(
                      "p-4 rounded-xl border-2 flex items-center justify-between cursor-pointer transition-all active:scale-95 select-none",
                      isValid 
                        ? "bg-green-50 border-green-200" 
                        : "bg-red-50 border-red-200 opacity-75"
                    )}
                  >
                    <span className={clsx(
                      "text-lg font-black",
                      isValid ? "text-slate-800" : "text-slate-400 line-through"
                    )}>
                      {card.word}
                    </span>
                    <div className={clsx(
                      "w-8 h-8 rounded-full flex items-center justify-center text-white font-bold shadow-sm transition-colors",
                      isValid ? "bg-green-500" : "bg-red-500"
                    )}>
                      {isValid ? '✓' : '✕'}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-100 mb-4 flex justify-between items-center">
            <span className="font-bold text-slate-500 uppercase text-sm">Points ce tour</span>
            <span className="font-black text-3xl text-blue-600">+{validCount}</span>
          </div>

          <Button 
            variant="primary"
            onClick={handleConfirm}
            className="w-full py-4 text-xl"
          >
            Valider et Continuer
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default TurnReview;
