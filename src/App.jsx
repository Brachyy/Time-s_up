import React from 'react';
import { GameProvider, useGame } from './context/GameContext';
import Setup from './pages/Setup';
import Game from './pages/Game';
import Results from './pages/Results';
import TurnReview from './pages/TurnReview';
import Home from './pages/Home';
import Button from './components/UI/Button';
import { motion } from 'framer-motion';

const AppContent = () => {
  const { state, dispatch } = useGame();

  return (
    <div className="h-[100dvh] w-full bg-slate-900 overflow-hidden">
      {state.gameState === 'HOME' && <Home />}
      {state.gameState === 'SETUP' && <Setup />}
      {state.gameState === 'PLAYING' && <Game />}
      {state.gameState === 'PAUSED' && (
        <div className="flex flex-col items-center justify-center h-screen bg-yellow-50 p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-8 rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] border-4 border-slate-100 max-w-md w-full text-center"
          >
            <h1 className="text-xl font-bold text-slate-400 uppercase tracking-widest mb-2">Équipe Suivante</h1>
            <h2 className={`text-4xl font-black mb-6 ${state.currentTeam % 2 === 0 ? 'text-blue-500' : 'text-pink-500'}`}>
              {state.teams[state.currentTeam].name}
            </h2>
            
            <div className="bg-slate-50 p-4 rounded-xl border-2 border-slate-100 mb-4 inline-block w-full">
              <p className="text-sm font-bold text-slate-400 uppercase mb-1">Joueur</p>
              <p className="text-3xl font-black text-slate-800">
                {state.teams[state.currentTeam].members[state.teams[state.currentTeam].currentPlayerIndex]}
              </p>
            </div>

            <div className="bg-yellow-50 p-4 rounded-xl border-2 border-yellow-100 mb-8 inline-block w-full">
               <p className="text-sm font-bold text-yellow-700 uppercase mb-1">Dans la pioche</p>
               <p className="text-3xl font-black text-yellow-600">
                 {state.deck.filter(c => !c.guessed).length + (state.waitingDeck || []).length} Cartes
               </p>
            </div>

            <Button 
              variant="primary"
              onClick={() => dispatch({ type: 'START_TURN' })}
              className="w-full py-4 text-xl"
            >
              Commencer le Tour
            </Button>
          </motion.div>
        </div>
      )}
      {state.gameState === 'TURN_REVIEW' && <TurnReview />}
      {state.gameState === 'GAME_OVER' && <Results />}
    </div>
  );
};

import { MultiplayerProvider } from './context/MultiplayerContext';

function App() {
  return (
    <MultiplayerProvider>
      <GameProvider>
        <AppContent />
      </GameProvider>
    </MultiplayerProvider>
  );
}

export default App;
