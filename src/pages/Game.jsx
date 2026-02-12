import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import Card from '../components/Game/Card';
import Timer from '../components/Game/Timer';
import Button from '../components/UI/Button';
import { motion, AnimatePresence } from 'framer-motion';

import { soundManager } from '../utils/SoundManager';

const Game = () => {
  const { state, dispatch } = useGame();
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  
  // Filter out guessed cards for the current round
  const availableCards = state.deck.filter(card => !card.guessed);
  
  const handleCorrect = () => {
    if (availableCards.length > 0) {
      soundManager.playSuccess();
      dispatch({ type: 'CARD_GUESSED', payload: availableCards[activeCardIndex].id });
      setActiveCardIndex(0); // Always reset to top card as deck changes or filters update
    }
  };

  const handlePass = () => {
    if (availableCards.length > 0) {
      soundManager.playPass();
      // Dispatch PASS_CARD to move it to end of deck
      dispatch({ type: 'PASS_CARD', payload: currentCard.id });
      setActiveCardIndex(0); // Reset to top card (which is now the next one)
    }
  };

  const handleTaboo = () => {
    if (availableCards.length > 0) {
      soundManager.playTaboo();
      dispatch({ type: 'TABOO_ERROR', payload: currentCard.id });
      setActiveCardIndex(0);
    }
  };

  const handleTimeUp = React.useCallback(() => {
    dispatch({ type: 'END_TURN' });
  }, [dispatch]);

  if (availableCards.length === 0) {
    const allPlayers = [];
    state.teams.forEach((team, tIndex) => {
      team.members.forEach((member, mIndex) => {
        const stats = team.playerStats && team.playerStats[mIndex] ? team.playerStats[mIndex].guessed : 0;
        allPlayers.push({
          name: member,
          teamName: team.name,
          score: stats,
          teamIndex: tIndex
        });
      });
    });
    
    // Sort descending by score
    const topPlayers = allPlayers.sort((a, b) => b.score - a.score).slice(0, 5);

    const getTeamStyle = (index) => {
      const styles = [
        { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-700', sub: 'text-blue-400' },
        { bg: 'bg-pink-50', border: 'border-pink-100', text: 'text-pink-700', sub: 'text-pink-400' },
        { bg: 'bg-green-50', border: 'border-green-100', text: 'text-green-700', sub: 'text-green-400' },
        { bg: 'bg-orange-50', border: 'border-orange-100', text: 'text-orange-700', sub: 'text-orange-400' },
      ];
      return styles[index % styles.length];
    };

    return (
      <div className="flex flex-col items-center justify-center h-screen bg-yellow-50 p-4 text-center overflow-hidden">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-6 rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] border-4 border-slate-100 max-w-lg w-full flex flex-col max-h-[90vh]"
        >
          <div className="mb-6 shrink-0">
            <h1 className="text-3xl font-black text-slate-800 mb-2 leading-none">Manche {state.currentRound} Terminée</h1>
            <p className="font-bold text-slate-400 text-sm uppercase tracking-widest">Résumé</p>
          </div>
          
          <div className="flex-1 overflow-y-auto mb-6 pr-1 min-h-[200px] scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="font-black text-slate-600 text-lg uppercase tracking-wide">
                Top Joueurs
              </h3>
            </div>
            <div className="space-y-3">
              {topPlayers.map((player, i) => {
                const style = getTeamStyle(player.teamIndex);
                return (
                  <div key={i} className={`flex items-center justify-between p-3 rounded-xl border-2 transition-colors ${style.bg} ${style.border}`}>
                    <div className="flex items-center gap-3">
                      <span className={`flex items-center justify-center w-8 h-8 rounded-full font-black text-white ${i===0 ? 'bg-yellow-400' : 'bg-slate-300'}`}>
                        {i+1}
                      </span>
                      <div className="text-left">
                        <p className={`font-bold leading-tight truncate max-w-[140px] ${style.text}`}>{player.name}</p>
                        <p className={`text-[10px] font-bold uppercase tracking-tight ${style.sub}`}>{player.teamName}</p>
                      </div>
                    </div>
                    <span className={`font-black text-xl tabular-nums ${style.text}`}>{player.score}</span>
                  </div>
                );
              })}
              {topPlayers.length === 0 && (
                <p className="text-slate-400 italic py-4">Aucun point marqué...</p>
              )}
            </div>
          </div>

          <Button 
            variant="blue"
            onClick={() => dispatch({ type: 'NEXT_ROUND' })}
            className="w-full py-4 text-xl shrink-0"
          >
            {state.currentRound >= 3 ? 'Terminer la Partie' : 'Manche Suivante'}
          </Button>
        </motion.div>
      </div>
    );
  }

  const currentCard = availableCards[activeCardIndex];
  const currentTeam = state.teams[state.currentTeam];
  const currentPlayer = currentTeam.members[currentTeam.currentPlayerIndex];

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-yellow-50 overflow-hidden relative">
      {/* HUD */}
      <div className="absolute top-4 left-4 bg-white px-4 py-2 rounded-xl border-2 border-slate-100 shadow-sm">
        <h3 className={`text-xl font-bold ${state.currentTeam % 2 === 0 ? 'text-blue-500' : 'text-pink-500'}`}>{currentTeam.name}</h3>
      </div>
      
      <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded-xl border-2 border-slate-100 shadow-sm text-right">
        <h3 className="text-sm font-bold text-slate-400 uppercase">Joueur</h3>
        <p className="text-xl font-bold text-blue-500">{currentPlayer}</p>
      </div>

      <div className="mb-8 text-center">
        <h2 className="text-3xl font-black text-slate-800 mb-1">Manche {state.currentRound}</h2>
        <p className="text-slate-500 font-bold bg-slate-200 px-4 py-1 rounded-full inline-block">
          {state.currentRound === 1 ? 'Décrivez librement' : state.currentRound === 2 ? 'Un seul mot' : 'Mimez'}
        </p>
      </div>

      <Timer duration={state.timer} onTimeUp={handleTimeUp} />

      <div className="relative w-full max-w-sm flex justify-center items-center h-96 z-10">
        <AnimatePresence>
          {currentCard && (
            <motion.div
              key={currentCard.id}
              initial={{ scale: 0.8, opacity: 0, rotate: -10, x: 200 }}
              animate={{ scale: 1, opacity: 1, rotate: 0, x: 0 }}
              exit={{ scale: 0.8, opacity: 0, rotate: 10, x: -200 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="absolute"
            >
              <Card 
                word={currentCard.word} 
                onSwipeRight={handleCorrect}
                onSwipeLeft={state.currentRound === 2 ? handlePass : handleTaboo}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="absolute bottom-12 left-6 right-6 flex gap-4 z-20">
        {state.currentRound === 2 ? (
          <Button 
            variant="clay-orange"
            onClick={handlePass}
            className="flex-1 h-20 rounded-3xl text-xl font-black tracking-wider uppercase shadow-xl"
            flat
          >
            PASSER
          </Button>
        ) : (
          <Button 
            variant="clay-danger"
            onClick={handleTaboo}
            className="flex-1 h-20 rounded-3xl text-xl font-black tracking-wider uppercase shadow-xl"
            flat
          >
            TABOU
          </Button>
        )}
        
        <Button 
          variant="clay-success"
          onClick={handleCorrect}
          className="flex-[2] h-20 rounded-3xl text-2xl font-black tracking-wider uppercase shadow-xl"
          flat
        >
          VALIDER
        </Button>
      </div>
    </div>
  );
};

export default Game;
